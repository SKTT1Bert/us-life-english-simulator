import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from .manager import ModelManager, settings_from_environment

PAGES_ORIGIN = 'https://sktt1bert.github.io'
LOCAL_ORIGIN_REGEX = r'^https?://(localhost|127\.0\.0\.1)(:[0-9]{1,5})?$'


class TranslationInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    text: str = Field(min_length=1, max_length=1000)

    @field_validator('text')
    @classmethod
    def nonblank(cls, value):
        value = value.strip()
        if not value:
            raise ValueError('Enter text to translate.')
        return value


def create_app(manager=None):
    manager = manager or ModelManager(settings_from_environment())

    @asynccontextmanager
    async def lifespan(app):
        async def reap():
            while True:
                await asyncio.sleep(1)
                try:
                    await asyncio.to_thread(manager.reap_idle)
                except Exception as exc:
                    manager._set('Error', str(exc))
        task = asyncio.create_task(reap())
        try:
            yield
        finally:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            await asyncio.to_thread(manager.unload)

    app = FastAPI(title='Daily English Local Translator', lifespan=lifespan)
    app.state.manager = manager
    app.add_middleware(CORSMiddleware, allow_origins=[PAGES_ORIGIN],
                       allow_origin_regex=LOCAL_ORIGIN_REGEX,
                       allow_methods=['GET', 'POST'], allow_headers=['Content-Type'],
                       allow_credentials=False)

    @app.middleware('http')
    async def validate_local_request(request: Request, call_next):
        # Restrict Host to loopback too, avoiding DNS rebinding into this API.
        host = request.headers.get('host', '').split(':')[0].lower()
        if host not in {'localhost', '127.0.0.1'}:
            from starlette.responses import JSONResponse
            return JSONResponse({'detail': 'Loopback host required.'}, status_code=403)
        origin = request.headers.get('origin')
        if origin:
            import re
            if origin != PAGES_ORIGIN and not re.fullmatch(LOCAL_ORIGIN_REGEX, origin):
                from starlette.responses import JSONResponse
                return JSONResponse({'detail': 'Origin not allowed.'}, status_code=403)
        return await call_next(request)

    @app.get('/health')
    def health():
        import os
        return {'ok': True, 'service': 'daily-english-local-translator',
                'backend_pid': os.getpid(), **manager.status()}

    @app.get('/model/status')
    def status():
        return manager.status()

    def operation(function, *args):
        try:
            return function(*args)
        except Exception as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    @app.post('/translate')
    def translate(body: TranslationInput):
        return operation(manager.translate, body.text)

    @app.post('/model/load')
    def load():
        return operation(manager.load)

    @app.post('/model/unload')
    def unload():
        return operation(manager.unload)

    return app


app = create_app()
