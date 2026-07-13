// myguilin.com — Visual Regression (pixel diff)
//
// Screenshots every key page at desktop + mobile viewports and pixel-diffs the
// result against committed baselines in tests/visual-baseline/.
//
// Zero new SaaS deps: reuses playwright (already used by browser-test.mjs) and
// sharp (PNG decode, already a project dep). The diff uses a 9-cell neighbourhood
// tolerance so 1px anti-aliasing / sub-pixel shifts (e.g. Mac vs Linux font
// rendering) don't cause false failures — only real layout/colour/element
// regressions trip it.
//
//   node tests/visual-diff.mjs           # compare current shots vs baseline
//   node tests/visual-diff.mjs --seed    # first run: write baselines, no compare
//   node tests/visual-diff.mjs --update  # overwrite baselines with current shots
//
// Run from project root. Baselines live in tests/visual-baseline/ (git-tracked);
// current shots + failure diffs go to tests/.visual-actual/ and tests/.visual-diff/
// (git-ignored).
import { chromium } from 'playwright';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const sharp = require('sharp');

const BASELINE_DIR = path.join(ROOT, 'tests', 'visual-baseline');
const ACTUAL_DIR = path.join(ROOT, 'tests', '.visual-actual');
const DIFF_DIR = path.join(ROOT, 'tests', '.visual-diff');
const SEED = process.argv.includes('--seed');
const UPDATE = process.argv.includes('--update');
const LIMIT = +(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0);
const OFFSET = +(process.argv.find((a) => a.startsWith('--offset='))?.split('=')[1] || 0);
const CHANNEL_TOL = 48;     // per-channel absolute diff still considered "same"
const FAIL_RATIO = 0.01;    // fail if >1% of pixels differ (after AA tolerance)
const FAIL_PIXELS = 50000;  // ...or if many px differ (catch large-but-subtle shifts)

const VIEWPORTS = {
  desktop: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false },
  mobile:  { width: 390,  height: 844, deviceScaleFactor: 2, isMobile: true },
};

// --- static asset server (same pattern as browser-test.mjs) ---
const http = require('http');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    res.statusCode = 404; return res.end('not found');
  }
  res.setHeader('Content-Type', MIME[path.extname(fp)] || 'application/octet-stream');
  fs.createReadStream(fp).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

// --- page list (key pages across all modules) ---
function collectPages() {
  const pages = [{ url: 'index.html', key: 'index' }];
  for (const cat of ['attractions', 'experiences', 'hotels', 'food', 'guides']) {
    const dir = path.join(ROOT, cat);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.html')) pages.push({ url: `${cat}/${f}`, key: `${cat}-${f.replace(/\.html$/, '')}` });
    }
  }
  return pages;
}

// --- pixel diff with 9-cell neighbourhood tolerance (absorbs 1px AA shifts) ---
async function pixelDiff(baselinePath, actualPath) {
  const b = await sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // resize actual to baseline size first, so minor height differences don't misalign
  const a = await sharp(actualPath).resize(b.info.width, b.info.height, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bd = b.data, ad = a.data, W = b.info.width, H = b.info.height;
  let diff = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ai = (y * W + x) * 4;
      let match = false;
      for (let dy = -1; dy <= 1 && !match; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= W) continue;
          const bi = (yy * W + xx) * 4;
          if (Math.abs(bd[bi] - ad[ai]) <= CHANNEL_TOL &&
              Math.abs(bd[bi + 1] - ad[ai + 1]) <= CHANNEL_TOL &&
              Math.abs(bd[bi + 2] - ad[ai + 2]) <= CHANNEL_TOL &&
              Math.abs(bd[bi + 3] - ad[ai + 3]) <= CHANNEL_TOL) { match = true; break; }
        }
      }
      if (!match) diff++;
    }
  }
  return { diffPixels: diff, totalPixels: W * H, ratio: diff / (W * H) };
}

// --- main ---
let pages = collectPages();
if (LIMIT > 0) pages = pages.slice(OFFSET, OFFSET + LIMIT);
console.log(`[visual-diff] ${pages.length} page(s) in this run (limit=${LIMIT} offset=${OFFSET})`);
for (const d of [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR]) fs.mkdirSync(d, { recursive: true });

const launchOpts = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
const CHROME = process.env.CHROME_PATH;
if (CHROME) launchOpts.executablePath = CHROME;
const browser = await chromium.launch(launchOpts);

const results = [];
let failures = 0;

for (const [vname, vp] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext(vp);
  const page = await ctx.newPage();
  for (const p of pages) {
    const key = `${vname}-${p.key}`;
    const actualPath = path.join(ACTUAL_DIR, `${key}.jpg`);
    const baselinePath = path.join(BASELINE_DIR, `${key}.jpg`);
    const diffPath = path.join(DIFF_DIR, `${key}.jpg`);
    try {
      await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // normalize render state: disable motion, wait for fonts + images, then settle
      await page.addStyleTag({ content: '*,*::before,*::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        await Promise.race([
          Promise.all(Array.from(document.images).filter((i) => !i.src.startsWith('data:')).map((img) => {
            if (img.complete && img.naturalWidth > 0) return undefined;
            return new Promise((r) => { img.onload = img.onerror = r; });
          })),
          new Promise((r) => { setTimeout(r, 3000); }),
        ]);
      });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: actualPath, fullPage: false, type: 'jpeg', quality: 85 });
    } catch (e) {
      results.push({ key, pass: false, detail: 'screenshot error: ' + e.message.split('\n')[0] });
      failures++;
      continue;
    }
    if (SEED || UPDATE || !fs.existsSync(baselinePath)) {
      fs.copyFileSync(actualPath, baselinePath);
      results.push({ key, pass: true, detail: SEED ? 'seeded' : (UPDATE ? 'updated' : 'baseline created') });
      continue;
    }
    const { diffPixels, totalPixels, ratio } = await pixelDiff(baselinePath, actualPath);
    const pct = (ratio * 100).toFixed(2);
    const pass = diffPixels <= FAIL_PIXELS && ratio <= FAIL_RATIO;
    if (!pass) { fs.copyFileSync(actualPath, diffPath); failures++; }
    results.push({ key, pass, detail: `${pct}% (${diffPixels}/${totalPixels} px)` });
  }
  await ctx.close();
}
await browser.close();
server.close();

const passN = results.filter((r) => r.pass).length;
console.log('\n=== Visual Regression ===');
for (const r of results) console.log(`${r.pass ? '✓' : '✗'} ${r.key}  ${r.detail}`);
console.log(`\n${passN}/${results.length} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
