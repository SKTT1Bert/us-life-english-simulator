from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sys
import tempfile
import unittest
from local_translator.manager import ModelManager
from local_translator.native import start_native


class NativeTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.model = Path(self.directory.name) / 'MOCK_NOT_WEIGHTS.gguf'
        self.model.touch()
        self.now = [0.0]
        self.processes = []
        config = {'model_path': str(self.model), 'server_executable': sys.executable,
                  'idle_timeout': 30, 'request_timeout': 30, 'context_size': 2048, 'gpu_layers': -1}

        def launch(settings):
            owned, connection = start_native(settings,
                command=[sys.executable, str(Path(__file__).with_name('fake_native_server.py'))],
                gpu_probe=lambda: False)
            self.processes.append(owned)
            return owned, connection

        self.manager = ModelManager(config, clock=lambda: self.now[0], native_launcher=launch)

    def tearDown(self):
        self.manager.unload()
        self.assertTrue(all(not process.is_alive() for process in self.processes))
        self.directory.cleanup()

    def test_native_lazy_concurrent_reuse_idle_and_reload(self):
        self.assertIsNone(self.manager.status()['worker_pid'])
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(self.manager.translate, ['one'] * 4))
        self.assertEqual(results[0]['text'], 'MOCK_NATIVE: one')
        self.assertEqual(self.manager.status()['load_count'], 1)
        self.assertEqual(self.manager.status()['gpu_layers_offloaded'], 0)
        self.now[0] = 30
        self.assertTrue(self.manager.reap_idle())
        self.assertFalse(self.processes[0].is_alive())
        self.assertTrue(self.model.is_file())
        self.manager.translate('reload')
        self.assertEqual(self.manager.status()['load_count'], 2)

    def test_native_request_failure_releases_and_recovers(self):
        with self.assertRaises(Exception):
            self.manager.translate('fail')
        self.assertEqual(self.manager.status()['state'], 'Error')
        self.assertIsNone(self.manager.status()['worker_pid'])
        self.assertFalse(self.processes[0].is_alive())
        self.assertEqual(self.manager.translate('retry')['text'], 'MOCK_NATIVE: retry')

    def test_crash_detected_and_reloaded(self):
        self.manager.load()
        self.processes[0].kill()
        self.processes[0].join(5)
        self.assertEqual(self.manager.status()['state'], 'Error')
        self.manager.translate('retry')
        self.assertEqual(self.manager.status()['load_count'], 2)

    def test_windows_job_close_kills_owned_process(self):
        self.manager.load()
        self.processes[0].job.close()
        self.processes[0].join(5)
        self.assertFalse(self.processes[0].is_alive())


if __name__ == '__main__':
    unittest.main()
