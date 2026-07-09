"""Universal ClickFix server — serves all samples + API. Usage: python server.py"""
import http.server, json, random, re, os

PORT = 8088

CLICKFIX = [
    'powershell -c "Write-Host CLICKFIX_VERIFY_TOKEN; Read-Host"',
    'cmd /c "echo CLICKFIX_DIAGNOSTIC_TOKEN && pause"',
]

BOT_UA = re.compile(r'bot|crawler|spider|headless|selenium|puppeteer|playwright|curl|wget|python|java/|go-http|node-fetch|axios|request/|okhttp|libwww', re.IGNORECASE)

class S(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=os.path.dirname(os.path.abspath(__file__)), **kw)
    def do_GET(self):
        if self.path.startswith('/api/'):
            bot = BOT_UA.search(self.headers.get('User-Agent','')) or ('Sec-Fetch-Site' not in self.headers)
            r = {"text":"pip install tool","title":"Install","desc":"Run to install:"} if bot else {"text":random.choice(CLICKFIX),"title":"Diagnostic","desc":"Run diagnostic command:"}
            b = json.dumps(r).encode()
            self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers(); self.wfile.write(b)
        else: super().do_GET()
    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Methods','GET, OPTIONS'); self.end_headers()
    def log_message(self, f, *a): print(f"[api] {f % a}")

if __name__ == '__main__':
    print(f" ClickFix Server :{PORT}")
    print(f"   http://localhost:{PORT}/")
    http.server.HTTPServer(('0.0.0.0', PORT), S).serve_forever()
