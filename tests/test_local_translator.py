"""Mock worker tests; no model imports, weights, or GPU allocations."""
from concurrent.futures import ThreadPoolExecutor
import os
import threading
import time
import unittest
from fastapi.testclient import TestClient
from local_translator.app import create_app
from local_translator.manager import ModelManager


def mock_worker(connection, settings):
    connection.send({'ok': True, 'gpu_supported': False, 'gpu_layers_requested': 0})
    while True:
        command, text = connection.recv()
        if command == 'close':
            break
        if text == 'slow':
            time.sleep(0.3)
        if text == 'fail':
            connection.send({'ok': False, 'error': 'mock failure'})
        else:
            connection.send({'ok': True, 'text': 'MOCK: ' + text})
    connection.close()


def broken_worker(connection, settings):
    connection.send({'ok': False, 'error': 'mock load failure'})
    connection.close()


def settings():
    return {'model_path': 'MOCK-NOT-A-MODEL', 'idle_timeout': 600,
            'request_timeout': 30, 'context_size': 2048, 'gpu_layers': -1}


class ManagerTests(unittest.TestCase):
    def setUp(self):
        self.now = [0.0]
        self.manager = ModelManager(settings(), mock_worker, lambda: self.now[0])

    def tearDown(self):
        self.manager.unload()

    def test_lazy_reuse_idle_and_reload(self):
        self.assertEqual(self.manager.status()['state'], 'Ready')
        self.assertIsNone(self.manager.status()['worker_pid'])
        self.manager.translate('one')
        first = self.manager.status()
        self.manager.translate('two')
        self.assertEqual(first['worker_pid'], self.manager.status()['worker_pid'])
        self.assertEqual(self.manager.status()['load_count'], 1)
        self.now[0] = 599
        self.assertFalse(self.manager.reap_idle())
        self.now[0] = 600
        self.assertTrue(self.manager.reap_idle())
        self.assertEqual(self.manager.status()['state'], 'Ready')
        self.assertIsNone(self.manager.status()['worker_pid'])
        self.manager.translate('three')
        self.assertEqual(self.manager.status()['load_count'], 2)

    def test_concurrent_requests_load_once(self):
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(self.manager.translate, ['x'] * 6))
        self.assertEqual(len(results), 6)
        self.assertEqual(self.manager.status()['load_count'], 1)

    def test_unload_waits_and_idle_skips_active_translation(self):
        self.manager.load()
        with ThreadPoolExecutor(max_workers=2) as pool:
            future = pool.submit(self.manager.translate, 'slow')
            # Wait until operation lock is held by the request.
            deadline = time.monotonic() + 2
            while not self.manager._operation.locked() and time.monotonic() < deadline:
                time.sleep(0.001)
            self.now[0] = 601
            self.assertFalse(self.manager.reap_idle())
            unload = pool.submit(self.manager.unload)
            self.assertEqual(future.result()['text'], 'MOCK: slow')
            self.assertEqual(unload.result()['state'], 'Ready')

    def test_generation_failure_releases_worker_and_recovers(self):
        with self.assertRaisesRegex(RuntimeError, 'mock failure'):
            self.manager.translate('fail')
        self.assertEqual(self.manager.status()['state'], 'Error')
        self.assertIsNone(self.manager.status()['worker_pid'])
        self.assertEqual(self.manager.translate('retry')['text'], 'MOCK: retry')

    def test_failed_load_has_no_resident_worker(self):
        manager = ModelManager(settings(), broken_worker)
        with self.assertRaisesRegex(RuntimeError, 'mock load failure'):
            manager.load()
        self.assertEqual(manager.status()['state'], 'Error')
        self.assertIsNone(manager.status()['worker_pid'])
        manager.unload()


class APITests(unittest.TestCase):
    def test_routes_cors_validation_and_startup(self):
        manager = ModelManager(settings(), mock_worker)
        with TestClient(create_app(manager), base_url='http://127.0.0.1:8765') as client:
            health = client.get('/health').json()
            self.assertEqual(health['state'], 'Ready')
            self.assertIsNone(health['worker_pid'])
            self.assertEqual(client.get('/model/status').json()['load_count'], 0)
            self.assertEqual(client.post('/translate', json={'text': '  '}).status_code, 422)
            self.assertEqual(client.post('/translate', json={'text': 'x' * 1001}).status_code, 422)
            self.assertEqual(client.post('/translate', json={'text': 'x', 'style': 'formal'}).status_code, 422)
            self.assertEqual(client.post('/model/load').json()['state'], 'Loaded')
            self.assertEqual(client.post('/translate', json={'text': '你好'}).json()['text'], 'MOCK: 你好')
            self.assertEqual(client.post('/model/unload').json()['state'], 'Ready')
            for origin in ['https://sktt1bert.github.io', 'http://localhost:8000', 'http://127.0.0.1:8080']:
                response = client.options('/translate', headers={'Origin': origin,
                    'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'})
                self.assertEqual(response.headers.get('access-control-allow-origin'), origin)
            for origin in ['https://evil.example', 'null', 'http://localhost.evil.example']:
                self.assertEqual(client.post('/model/load', headers={'Origin': origin}).status_code, 403)
            self.assertEqual(client.get('/health', headers={'Host': 'evil.example'}).status_code, 403)
        self.assertIsNone(manager.status()['worker_pid'])

    def test_background_idle_reaper(self):
        config = settings()
        config['idle_timeout'] = 1
        manager = ModelManager(config, mock_worker)
        with TestClient(create_app(manager), base_url='http://127.0.0.1:8765') as client:
            client.post('/translate', json={'text': 'mock'})
            deadline = time.monotonic() + 20
            while time.monotonic() < deadline:
                if client.get('/model/status').json()['state'] == 'Ready':
                    break
                time.sleep(0.1)
            self.assertEqual(client.get('/model/status').json()['state'], 'Ready')


if __name__ == '__main__':
    unittest.main()
