"""Serialized lazy model ownership, isolated from the HTTP server."""
import gc
import multiprocessing as mp
import os
from pathlib import Path
import threading
import time


def model_worker(connection, settings):
    model = None
    try:
        # Import and allocate only in this child, never during /health.
        from llama_cpp import Llama, llama_supports_gpu_offload
        path = Path(settings['model_path'])
        if not path.is_file():
            raise FileNotFoundError('Set HY_MT_MODEL_PATH to the downloaded Q4 GGUF file.')
        gpu = bool(llama_supports_gpu_offload())
        layers = settings['gpu_layers'] if gpu else 0
        model = Llama(model_path=str(path), n_ctx=settings['context_size'],
                      n_gpu_layers=layers, verbose=False)
        if not model.metadata.get('tokenizer.chat_template'):
            raise RuntimeError('GGUF has no chat template; refusing an unverified prompt format.')
        connection.send({'ok': True, 'gpu_supported': gpu, 'gpu_layers_requested': layers})
        while True:
            command, payload = connection.recv()
            if command == 'close':
                break
            try:
                prompt = '将以下文本翻译为英语，注意只需要输出翻译后的结果，不要额外解释：\n' + payload
                response = model.create_chat_completion(
                    messages=[{'role': 'user', 'content': prompt}],
                    temperature=0.7, top_p=0.6, top_k=20, repeat_penalty=1.05,
                    max_tokens=768)
                choice = response['choices'][0]
                if choice.get('finish_reason') == 'length':
                    raise RuntimeError('Output limit reached; shorten the input and retry.')
                result = choice['message']['content'].strip()
                if not result:
                    raise RuntimeError('The model returned an empty translation.')
                connection.send({'ok': True, 'text': result})
            except Exception as exc:
                connection.send({'ok': False, 'error': str(exc)})
    except Exception as exc:
        try:
            connection.send({'ok': False, 'error': str(exc)})
        except (BrokenPipeError, EOFError, OSError):
            pass
    finally:
        if model is not None:
            model.close()  # destroys llama model/context/tokenizer native ownership
            model = None
        gc.collect()
        # No PyTorch is used by this GGUF runtime. Process exit also releases
        # native allocator / CUDA context resources retained by the library.
        connection.close()


class ModelManager:
    def __init__(self, settings, worker=model_worker, clock=time.monotonic, native_launcher=None):
        self.settings, self.worker, self.clock = settings, worker, clock
        self.native_launcher = native_launcher
        self._operation = threading.Lock()
        self._state_lock = threading.Lock()
        self._state, self._error = 'Ready', None
        self._process = self._connection = None
        self._last_used = None
        self._loads = 0
        self._runtime = {}

    def _set(self, state, error=None):
        with self._state_lock:
            self._state, self._error = state, error

    def status(self):
        with self._state_lock:
            alive = self._process is not None and self._process.is_alive()
            state = self._state
            error = self._error
            if state == 'Loaded' and not alive:
                state, error = 'Error', 'Model worker exited; retry to reload.'
            return {'state': state, 'error': error, 'load_count': self._loads,
                    'worker_pid': self._process.pid if alive else None,
                    'idle_timeout_seconds': self.settings['idle_timeout'],
                    'idle_seconds': None if self._last_used is None else max(0, self.clock() - self._last_used),
                    **self._runtime}

    def _receive(self):
        if not self._connection.poll(self.settings['request_timeout']):
            raise TimeoutError('Model operation timed out; worker was released.')
        reply = self._connection.recv()
        if not reply['ok']:
            raise RuntimeError(reply['error'])
        return reply

    def _dispose(self):
        process, connection = self._process, self._connection
        if process:
            if process.is_alive() and connection:
                try:
                    connection.send(('close', None))
                except (BrokenPipeError, EOFError, OSError):
                    pass
            process.join(timeout=5)
            if process.is_alive():
                process.terminate()
                process.join(timeout=5)
            if process.is_alive():
                process.kill()
                process.join(timeout=5)
            if process.is_alive():
                raise RuntimeError('Model worker could not be stopped.')
            with self._state_lock:
                self._process = None
                process.close()
        if connection:
            connection.close()
        with self._state_lock:
            self._process = self._connection = None
            self._runtime = {}
            self._last_used = None
        gc.collect()

    def _load(self):
        if self._process is not None and self._process.is_alive() and self._state == 'Loaded':
            return
        self._dispose()
        self._set('Loading')
        if self.worker is model_worker and self.settings.get('server_executable'):
            return self._load_native()
        context = mp.get_context('spawn')
        parent, child = context.Pipe()
        process = context.Process(target=self.worker, args=(child, self.settings), daemon=True)
        try:
            process.start()
            child.close()
            with self._state_lock:
                self._process, self._connection = process, parent
            reply = self._receive()
            with self._state_lock:
                self._runtime = {key: value for key, value in reply.items() if key != 'ok'}
                self._loads += 1
                self._last_used = self.clock()
            self._set('Loaded')
        except Exception as exc:
            parent.close()
            child.close()
            self._dispose()
            self._set('Error', str(exc))
            raise

    def _load_native(self):
        from .native import start_native
        try:
            process, connection = (self.native_launcher or start_native)(self.settings)
            with self._state_lock:
                self._process, self._connection = process, connection
            reply = self._receive()
            with self._state_lock:
                self._runtime = {key: value for key, value in reply.items() if key != 'ok'}
                self._loads += 1
                self._last_used = self.clock()
            self._set('Loaded')
        except Exception as exc:
            self._dispose()
            self._set('Error', str(exc))
            raise

    def load(self):
        with self._operation:
            self._load()
            with self._state_lock:
                self._last_used = self.clock()
            return self.status()

    def translate(self, text):
        started = self.clock()
        with self._operation:
            try:
                self._load()
                self._connection.send(('translate', text))
                reply = self._receive()
                with self._state_lock:
                    self._last_used = self.clock()
                return {'text': reply['text'], 'elapsed_seconds': self.clock() - started,
                        'model': 'Hy-MT2-1.8B Q4', 'state': 'Loaded', 'mode': 'translation'}
            except Exception as exc:
                self._dispose()
                self._set('Error', str(exc))
                raise

    def unload(self):
        # Wait for active generation/load rather than freeing a used context.
        with self._operation:
            self._set('Unloading')
            try:
                self._dispose()
                self._set('Ready')
            except Exception as exc:
                self._set('Error', str(exc))
                raise
            return self.status()

    def reap_idle(self):
        if not self._operation.acquire(blocking=False):
            return False
        try:
            if self._last_used is not None and self.clock() - self._last_used >= self.settings['idle_timeout']:
                self._set('Unloading')
                self._dispose()
                self._set('Ready')
                return True
            return False
        finally:
            self._operation.release()


def settings_from_environment():
    default_dir = Path.home() / 'AI' / 'Models' / 'Hy-MT2-1.8B-Q4'
    # Filename confirmed from Tencent by the installation workflow.
    return {'model_path': os.environ.get('HY_MT_MODEL_PATH', str(default_dir / 'Hy-MT2-1.8B-Q4_K_M.gguf')),
            'server_executable': os.environ.get('HY_MT_SERVER_EXE', ''),
            'idle_timeout': max(1, float(os.environ.get('HY_MT_IDLE_SECONDS', '600'))),
            'request_timeout': max(1, float(os.environ.get('HY_MT_REQUEST_TIMEOUT', '180'))),
            'context_size': int(os.environ.get('HY_MT_CONTEXT_SIZE', '2048')),
            'gpu_layers': int(os.environ.get('HY_MT_GPU_LAYERS', '-1'))}
