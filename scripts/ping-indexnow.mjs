// ping-indexnow.mjs
// Pings the IndexNow API (Bing / ChatGPT / Perplexity / Copilot) so new & updated
// pages get discovered within minutes instead of waiting for a crawl.
// Reads the key from indexnow-key.txt (generated once) and the URL list from sitemap.xml.
//
// Usage:  node scripts/ping-indexnow.mjs            # ping full sitemap
//         node scripts/ping-indexnow.mjs <url>      # ping a single URL
//
// Requires network access (run with sandbox disabled if behind one).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE_HOST = 'myguilin.com';
const KEY_FILE = path.join(ROOT, 'indexnow-key.txt');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

if (!fs.existsSync(KEY_FILE)) {
  console.error('✗ indexnow-key.txt not found. Run the build or generate a key first.');
  process.exit(1);
}
const key = fs.readFileSync(KEY_FILE, 'utf8').trim();
const keyLocation = `https://${SITE_HOST}/${key}.txt`;

let urlList;
if (process.argv[2]) {
  urlList = [process.argv[2]];
} else {
  if (!fs.existsSync(SITEMAP)) {
    console.error('✗ sitemap.xml not found. Run `npm run build` first.');
    process.exit(1);
  }
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).filter(Boolean);
}

const payload = { host: SITE_HOST, key, keyLocation, urlList };
const body = JSON.stringify(payload);

console.log(`→ IndexNow: pinging ${urlList.length} URL(s) to ${ENDPOINT}`);
try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const text = await res.text();
  // 200 = accepted, 202 = received & queued. Both good.
  if (res.status === 200 || res.status === 202) {
    console.log(`✓ IndexNow accepted (HTTP ${res.status}). ${urlList.length} URL(s) submitted.`);
  } else {
    console.warn(`! IndexNow responded HTTP ${res.status}: ${text || '(no body)'}`);
    process.exitCode = 0; // non-fatal: indexing will still happen on next crawl
  }
} catch (err) {
  console.warn('! IndexNow ping failed (network?):', err.message);
  process.exitCode = 0; // non-fatal
}
