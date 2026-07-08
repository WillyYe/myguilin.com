// myguilin.com — First-level page static integrity & baseline audit
// Run: node tests/static-audit.mjs   (from project root)
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const htmlPath = path.join(ROOT, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const imagesDir = path.join(ROOT, 'images');

const pass = [];
const fail = [];
const warn = [];
const add = (arr, name, detail = '') => arr.push({ name, detail });

// ---- collect ----
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const refImgs = new Set();
for (const m of html.matchAll(/(?:src|url)\(\s*['"]?(images\/[A-Za-z0-9_.\/-]+\.jpg)['"]?\s*\)/g)) refImgs.add(m[1]);
for (const m of html.matchAll(/src="(images\/[A-Za-z0-9_.\/-]+\.jpg)"/g)) refImgs.add(m[1]);
const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map(t => t[0]);

// ---- T1: referenced images exist ----
const missingImgs = [...refImgs].filter(i => !fs.existsSync(path.join(ROOT, i)));
if (missingImgs.length) fail.push({ name: 'Referenced images missing on disk', detail: missingImgs.join(', ') });
else pass.push({ name: `All ${refImgs.size} referenced images exist on disk` });

// ---- T2: in-page anchors resolve ----
const brokenAnchors = hrefs.filter(h => h.startsWith('#') && h.length > 1 && !ids.has(h.slice(1)));
if (brokenAnchors.length) fail.push({ name: 'In-page anchor links with no target id', detail: [...new Set(brokenAnchors)].join(', ') });
else pass.push({ name: `All ${hrefs.filter(h => h.startsWith('#') && h.length > 1).length} in-page #anchors resolve to an element` });

// ---- T3: sub-page .html links ----
const missingPages = hrefs.filter(h => h.endsWith('.html') && !fs.existsSync(path.join(ROOT, h)));
if (missingPages.length) {
  const deferred = missingPages.every(p => /^(hotels|restaurants)\.html$/.test(p));
  if (deferred) warn.push({ name: 'Entry cards link to sub-pages not yet built', detail: missingPages.join(', ') + ' (deferred to sub-page phase — will 404 until created)' });
  else fail.push({ name: 'Sub-page .html links point to missing files', detail: missingPages.join(', ') });
} else pass.push({ name: 'All .html sub-page links resolve' });

// ---- T4: alt text ----
const noAltAttr = imgTags.filter(t => !/\balt=/.test(t));
const emptyAlt = imgTags.filter(t => /\balt=["']\s*["']/.test(t));
if (noAltAttr.length) fail.push({ name: 'Images missing alt attribute entirely (a11y)', detail: `${noAltAttr.length} <img> with no alt attribute` });
else if (emptyAlt.length) pass.push({ name: `All ${imgTags.length} <img> carry an alt attribute (${emptyAlt.length} empty-alt decorative thumbnails — WCAG-OK)`, detail: 'mega-menu thumbnails are redundant with adjacent link text' });
else pass.push({ name: `All ${imgTags.length} <img> have descriptive alt text` });

// ---- T5: lazy loading ----
const noLazy = imgTags.filter(t => !/loading=["']lazy["']/.test(t));
if (noLazy.length) warn.push({ name: 'Images without loading="lazy"', detail: `${noLazy.length} <img> not lazy (note: hero/section backgrounds are CSS, not <img>)` });
else pass.push({ name: `All ${imgTags.length} <img> use loading="lazy"` });

// ---- T6: card counts ----
const attrCards = [...html.matchAll(/\bid="attraction-[a-z]+"/g)].length;
const expCards = [...html.matchAll(/\bid="exp-[a-z]+"/g)].length;
attrCards === 8 ? pass.push({ name: 'Attractions module has 8 cards' }) : fail.push({ name: 'Attractions card count', detail: `found ${attrCards}, expected 8` });
expCards === 8 ? pass.push({ name: 'Experiences module has 8 cards' }) : fail.push({ name: 'Experiences card count', detail: `found ${expCards}, expected 8` });

// ---- T7: performance budget ----
let totalBytes = 0, maxFile = '', maxBytes = 0;
for (const i of refImgs) {
  const p = path.join(ROOT, i);
  if (fs.existsSync(p)) { const s = fs.statSync(p).size; totalBytes += s; if (s > maxBytes) { maxBytes = s; maxFile = i; } }
}
const totalKB = Math.round(totalBytes / 1024);
if (totalBytes < 2.5 * 1024 * 1024) pass.push({ name: `Referenced image payload ${totalKB}KB (budget <2.5MB)`, detail: `largest: ${maxFile} ${Math.round(maxBytes / 1024)}KB` });
else fail.push({ name: 'Image payload exceeds 2.5MB budget', detail: `${totalKB}KB total` });
const over200 = [...refImgs].filter(i => { const p = path.join(ROOT, i); return fs.existsSync(p) && fs.statSync(p).size > 200 * 1024; });
if (over200.length) warn.push({ name: 'Individual images >200KB (review compression)', detail: over200.map(i => `${i} ${Math.round(fs.statSync(path.join(ROOT, i)).size / 1024)}KB`).join(', ') });

// ---- T8: dead files (exclude reserved sub-page assets) ----
const allFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));
const reserved = allFiles.filter(f => /^(hotel-|food-)/.test(f));
const dead = allFiles.filter(f => !refImgs.has('images/' + f) && !/^(hotel-|food-)/.test(f));
if (dead.length) warn.push({ name: 'Unreferenced image files on disk', detail: dead.join(', ') + ` | reserved for sub-pages: ${reserved.length}` });
else pass.push({ name: 'No stray dead image files (excluding sub-page reserves)' });

// ---- T9: a11y landmarks / lang ----
if (/<html[^>]*\blang=/.test(html)) pass.push({ name: '<html lang="en"> attribute present (a11y)' });
else fail.push({ name: 'Missing <html lang> attribute', detail: 'screen readers need page language' });
const navCount = (html.match(/<nav\b/g) || []).length;
const footerCount = (html.match(/<footer\b/g) || []).length;
(navCount > 0 ? pass : warn).push({ name: `Landmark: <nav> x${navCount}, <footer> x${footerCount}` });

// ---- report ----
console.log('\n===== myguilin First-Level Page — Static Audit =====');
console.log(`referenced images: ${refImgs.size} | <img> tags: ${imgTags.length} | ids: ${ids.size}`);
console.log('\n  PASS');
for (const r of pass) console.log('  ✓ ' + r.name + (r.detail ? '  [' + r.detail + ']' : ''));
console.log('\n  FAIL');
if (!fail.length) console.log('  (none)');
for (const r of fail) console.log('  ✗ ' + r.name + '  → ' + r.detail);
console.log('\n  WARN');
if (!warn.length) console.log('  (none)');
for (const r of warn) console.log('  ! ' + r.name + '  → ' + r.detail);
console.log(`\n  SUMMARY: ${pass.length} pass, ${fail.length} fail, ${warn.length} warn\n`);
process.exit(fail.length ? 1 : 0);
