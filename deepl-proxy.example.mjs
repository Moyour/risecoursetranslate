/**
 * Example DeepL proxy for risecoursetranslate.js
 * Run: DEEPL_AUTH_KEY=your-key node deepl-proxy.example.mjs
 * Then set data-deepl-proxy="http://localhost:8787/translate" on the script tag.
 */
import http from 'node:http';

const PORT = 8787;
const DEEPL_URL = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
const AUTH_KEY = process.env.DEEPL_AUTH_KEY;

if (!AUTH_KEY) {
  console.error('Set DEEPL_AUTH_KEY before running.');
  process.exit(1);
}

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/translate') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  try {
    const body = JSON.parse(await readBody(req));
    const params = new URLSearchParams();
    params.set('target_lang', body.target_lang);
    (body.texts || []).forEach((text) => params.append('text', text));

    const deeplRes = await fetch(DEEPL_URL, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${AUTH_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await deeplRes.json();
    if (!deeplRes.ok) {
      res.writeHead(deeplRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      translations: (data.translations || []).map((item) => item.text)
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
}).listen(PORT, () => {
  console.log(`DeepL proxy listening on http://localhost:${PORT}/translate`);
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
