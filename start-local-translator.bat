@echo off
setlocal
cd /d "%~dp0"
if exist "local-translator-config.bat" call "local-translator-config.bat"
if not exist ".venv-translator\Scripts\python.exe" (
  echo Create .venv-translator and install local_translator\requirements.txt first.
  pause
  exit /b 1
)
if not defined HY_MT_MODEL_PATH (
  echo Set HY_MT_MODEL_PATH to the exact downloaded Q4 GGUF file.
  echo Copy local-translator-config.example.bat to local-translator-config.bat.
  pause
  exit /b 1
)
if defined HY_MT_SERVER_EXE if not exist "%HY_MT_SERVER_EXE%" (
  echo HY_MT_SERVER_EXE does not point to an existing official llama-server.exe.
  pause
  exit /b 1
)
".venv-translator\Scripts\python.exe" -m uvicorn local_translator.app:app --host 127.0.0.1 --port 8765 --workers 1
