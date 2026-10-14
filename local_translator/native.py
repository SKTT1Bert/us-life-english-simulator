"""Owned loopback llama-server transport, without Python CUDA wheel downloads."""
import ctypes
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import tempfile
import time
import httpx


class WindowsJob:
    """Kill owned server if its FastAPI parent exits unexpectedly."""
    def __init__(self, process):
        self.handle = None
        if os.name != 'nt':
            return
        from ctypes import wintypes as W

        class Basic(ctypes.Structure):
            _fields_ = [('process_time', ctypes.c_int64), ('job_time', ctypes.c_int64),
                        ('flags', W.DWORD), ('min_ws', ctypes.c_size_t),
                        ('max_ws', ctypes.c_size_t), ('active_count', W.DWORD),
                        ('affinity', ctypes.c_size_t), ('priority', W.DWORD),
                        ('scheduling', W.DWORD)]

        class IO(ctypes.Structure):
            _fields_ = [(name, ctypes.c_uint64) for name in
                        ['read_ops', 'write_ops', 'other_ops', 'read_bytes', 'write_bytes', 'other_bytes']]

        class Extended(ctypes.Structure):
            _fields_ = [('basic', Basic), ('io', IO), ('process_memory', ctypes.c_size_t),
                        ('job_memory', ctypes.c_size_t), ('peak_process', ctypes.c_size_t),
                        ('peak_job', ctypes.c_size_t)]

        self.kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        self.kernel.CreateJobObjectW.argtypes = [ctypes.c_void_p, W.LPCWSTR]
        self.kernel.CreateJobObjectW.restype = W.HANDLE
        self.kernel.SetInformationJobObject.argtypes = [W.HANDLE, ctypes.c_int,
                                                       ctypes.c_void_p, W.DWORD]
        self.kernel.AssignProcessToJobObject.argtypes = [W.HANDLE, W.HANDLE]
        self.kernel.CloseHandle.argtypes = [W.HANDLE]
        self.handle = self.kernel.CreateJobObjectW(None, None)
        if not self.handle:
            raise ctypes.WinError(ctypes.get_last_error())
        info = Extended()
        info.basic.flags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not self.kernel.SetInformationJobObject(self.handle, 9, ctypes.byref(info), ctypes.sizeof(info)):
            error = ctypes.WinError(ctypes.get_last_error())
            self.close()
            raise error
        if not self.kernel.AssignProcessToJobObject(self.handle, int(process._handle)):
            error = ctypes.WinError(ctypes.get_last_error())
            self.close()
            raise error

    def close(self):
        if self.handle:
            self.kernel.CloseHandle(self.handle)
            self.handle = None


class OwnedProcess:
    def __init__(self, process, log):
        self.process, self.log = process, log
        self.job = WindowsJob(process)

    @property
    def pid(self):
        return self.process.pid

    def is_alive(self):
        return self.process.poll() is None

    def join(self, timeout):
        try:
            self.process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            pass

    def terminate(self):
        if self.is_alive():
            self.process.terminate()

    def kill(self):
        if self.is_alive():
            self.process.kill()

    def close(self):
        self.job.close()
        if os.name == 'nt' and not self.is_alive():
            self.process._handle.Close()
        self.log.close()

    def tail(self):
        self.log.flush()
        self.log.seek(0, 2)
        length = self.log.tell()
        self.log.seek(max(0, length - 6000))
        return self.log.read().decode('utf-8', errors='replace')


class NativeConnection:
    def __init__(self, process, url, token, settings, gpu):
        self.process, self.settings, self.gpu = process, settings, gpu
        self.client = httpx.Client(base_url=url, timeout=settings['request_timeout'],
                                   trust_env=False, headers={'Authorization': 'Bearer ' + token})
        self.reply = None
        self.started = False

    def poll(self, timeout):
        if self.started:
            return self.reply is not None
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if not self.process.is_alive():
                raise RuntimeError('llama-server exited during loading: ' + self.process.tail())
            try:
                response = self.client.get('/health', timeout=min(1, max(0.1, deadline - time.monotonic())))
                if response.status_code == 200:
                    props = self.client.get('/props').raise_for_status().json()
                    if not props.get('chat_template'):
                        raise RuntimeError('Native server has no verified model chat template.')
                    # Save actual offload evidence, rather than infer GPU use from an option.
                    evidence = self.process.tail()
                    matches = re.findall(r'offloaded\s+(\d+)/(\d+)\s+layers', evidence)
                    self.reply = {'ok': True, 'runtime': 'llama-server',
                                  'runtime_build': props.get('build_info'),
                                  'gpu_supported': self.gpu,
                                  'gpu_layers_requested': self.settings['gpu_layers'] if self.gpu else 0,
                                  'gpu_layers_offloaded': int(matches[-1][0]) if matches else None,
                                  'runtime_log_tail': evidence}
                    self.started = True
                    return True
            except httpx.HTTPError:
                pass
            time.sleep(0.1)
        return False

    def recv(self):
        reply, self.reply = self.reply, None
        return reply

    def send(self, message):
        command, text = message
        if command == 'close':
            self.process.terminate()
            return
        prompt = '将以下文本翻译为英语，注意只需要输出翻译后的结果，不要额外解释：\n' + text
        response = self.client.post('/v1/chat/completions', json={
            'messages': [{'role': 'user', 'content': prompt}], 'stream': False,
            'temperature': 0.7, 'top_p': 0.6, 'top_k': 20, 'repeat_penalty': 1.05,
            'max_tokens': 768, 'cache_prompt': True})
        response.raise_for_status()
        choice = response.json()['choices'][0]
        if choice.get('finish_reason') == 'length':
            raise RuntimeError('Output limit reached; shorten the input and retry.')
        result = choice['message']['content'].strip()
        if not result:
            raise RuntimeError('The model returned an empty translation.')
        self.reply = {'ok': True, 'text': result}

    def close(self):
        self.client.close()


def start_native(settings, command=None, gpu_probe=None):
    executable = Path(settings['server_executable'])
    if not executable.is_file():
        raise FileNotFoundError('HY_MT_SERVER_EXE must point to the official llama-server executable.')
    if not Path(settings['model_path']).is_file():
        raise FileNotFoundError('Set HY_MT_MODEL_PATH to the downloaded Q4 GGUF file.')
    flags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
    if gpu_probe:
        gpu = gpu_probe()
    else:
        devices = subprocess.run([str(executable), '--list-devices'], capture_output=True,
                                 text=True, timeout=15, creationflags=flags, check=True)
        gpu = bool(re.search(r'(CUDA|Vulkan|SYCL|ROCm)\d', devices.stdout + devices.stderr))
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port = listener.getsockname()[1]
    token = secrets.token_urlsafe(32)
    env = os.environ.copy()
    # Internal loopback authentication is automatic; no user/API-cloud key needed.
    env['LLAMA_API_KEY'] = token
    layers = settings['gpu_layers'] if gpu else 0
    arguments = ['--model', settings['model_path'], '--host', '127.0.0.1', '--port', str(port),
                 '--ctx-size', str(settings['context_size']), '--parallel', '1',
                 '--n-gpu-layers', 'all' if layers == -1 else str(layers), '--jinja', '--no-webui', '--offline']
    log = tempfile.TemporaryFile(mode='w+b')
    process = subprocess.Popen((command or [str(executable)]) + arguments, env=env,
                               stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                               creationflags=flags)
    try:
        owned = OwnedProcess(process, log)
        connection = NativeConnection(owned, 'http://127.0.0.1:' + str(port), token, settings, gpu)
        return owned, connection
    except Exception:
        process.terminate()
        process.wait(timeout=5)
        log.close()
        raise
