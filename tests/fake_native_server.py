"""CPU-only transport fixture. Never imports a model runtime."""
import argparse
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import time

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, required=True)
args, _ = parser.parse_known_args()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def reply(self, status, value):
        data = json.dumps(value).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def authorized(self):
        if self.headers.get('Authorization') != 'Bearer ' + os.environ['LLAMA_API_KEY']:
            self.reply(401, {'error': 'unauthorized mock request'})
            return False
        return True

    def do_GET(self):
        if self.path == '/health':
            self.reply(200, {'status': 'ok'})
        elif self.authorized():
            self.reply(200, {'chat_template': '{{MOCK_ONLY}}', 'build_info': 'MOCK_NATIVE'})

    def do_POST(self):
        if not self.authorized():
            return
        body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        text = body['messages'][0]['content'].split('\n', 1)[1]
        if text == 'fail':
            self.reply(503, {'error': 'mock failure'})
            return
        if text == 'slow':
            time.sleep(0.3)
        self.reply(200, {'choices': [{'finish_reason': 'stop',
            'message': {'content': 'MOCK_NATIVE: ' + text}}]})


print('MOCK ONLY: offloaded 0/0 layers', flush=True)
HTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
