// myguilin.com — Static integrity & baseline a11y audit for ALL frontend pages.
// Run: node tests/static-audit.mjs   (from project root)
//
// Originally scoped to index.html only; now loops every frontend page so the
// 33 sub-pages (attractions / experiences / guides / hotels / food) are also
// checked for broken images, missing alt, dead links, and a11y basics.
// Structural checks (contact modal, mobile menu) only fire when the page
// actually contains those elements, so pages without them don't false-fail.
import fs from 'fs';
import path from 'path';
import { WIDTHS } from '../scripts/responsive.mjs';

const ROOT = process.cwd();
const IMAGES = path.join(ROOT, 'images');
const add = (arr, name, detail = '') => arr.push({ name, detail });

function fileBytes(p) { return fs.existsSync(p) ? fs.statSync(p).size : 0; }
function stemPayload(stem) {
  let max = 0;
  for (const ext of ['webp', 'avif', 'jpg']) {
    max = Math.max(max, fileBytes(path.join(IMAGES, `${stem}.${ext}`)));
    for (const w of WIDTHS) max = Math.max(max, fileBytes(path.join(IMAGES, `${stem}-${w}.${ext}`)));
  }
  return max;
}

// ---- per-page audit ----
function auditPage(html, file, isIndex) {
  const pass = [], fail = [], warn = [];
  const pageDir = path.dirname(path.resolve(file));
  const resolve = (p) => path.resolve(pageDir, p);
  // Absolute paths ("/guides/index.html") resolve from site ROOT; everything
  // else resolves relative to the page's own directory.
  const resolveLink = (h) => (h.startsWith('/') ? path.resolve(ROOT, h.replace(/^\/+/, '')) : path.resolve(pageDir, h));
  const refImgs = new Set();
  const addImg = (val) => {
    // a srcset is "url 640w, url2 1280w"; a plain src/href is one URL. Only
    // split on commas when this actually looks like a srcset (has a width
    // descriptor), otherwise a URL that merely contains a comma (e.g. a
    // Wikimedia "File:Not_sure,_this_could_be_...jpg" link) would be chopped
    // into a bogus bare-filename "image" and falsely reported as missing.
    const isSrcset = /\s\d+w/.test(val);
    const parts = isSrcset ? String(val).split(',') : [val];
    for (const part of parts) {
      const url = part.trim().split(/\s+/)[0];
      // external (http/https/protocol-relative) and inline data URIs are not
      // local files we can/should verify on disk
      if (!url || /^https?:/i.test(url) || url.startsWith('//') || url.startsWith('data:')) continue;
      // only treat genuine local paths as verifiable image references
      if (!/^(\.\.?\/|\/|images\/)/.test(url)) continue;
      refImgs.add(url);
    }
  };
  for (const m of html.matchAll(/(?:src|srcset|href)\s*=\s*["']([^"']+\.(?:webp|avif|jpg|jpeg|png))["']/gi)) addImg(m[1]);
  for (const m of html.matchAll(/url\(\s*['"]?(images\/[^)'"]+\.(?:webp|avif|jpg|jpeg|png))['"]?\s*\)/gi)) addImg(m[1]);
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((t) => t[0]);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

  // T1 referenced images exist (resolved relative to this page's directory)
  const missingImgs = [...refImgs].filter((i) => !fs.existsSync(resolve(i)));
  if (missingImgs.length) fail.push({ name: 'Referenced images missing on disk', detail: missingImgs.slice(0, 8).join(', ') + (missingImgs.length > 8 ? ` …(+${missingImgs.length - 8})` : '') });
  else pass.push({ name: `All ${refImgs.size} referenced images exist` });

  // T2 in-page anchors
  const brokenAnchors = hrefs.filter((h) => h.startsWith('#') && h.length > 1 && !ids.has(h.slice(1)));
  if (brokenAnchors.length) warn.push({ name: 'In-page #anchors with no target', detail: [...new Set(brokenAnchors)].slice(0, 6).join(', ') });
  else pass.push({ name: `All ${hrefs.filter((h) => h.startsWith('#') && h.length > 1).length} in-page #anchors resolve` });

  // T3 .html sub-page links (skip absolute http(s) URLs; resolve relative to page)
  const missingPages = hrefs.filter((h) => h.endsWith('.html') && !/^https?:/i.test(h) && !fs.existsSync(resolveLink(h)));
  if (missingPages.length) {
    const deferred = missingPages.every((p) => /^(hotels|restaurants)\.html$/.test(p));
    if (deferred) warn.push({ name: 'Links to sub-pages not yet built', detail: missingPages.join(', ') });
    else fail.push({ name: 'Sub-page .html links point to missing files', detail: missingPages.slice(0, 8).join(', ') });
  } else pass.push({ name: 'All .html sub-page links resolve' });

  // T4 alt text
  const noAltAttr = imgTags.filter((t) => !/\balt=/.test(t));
  const emptyAlt = imgTags.filter((t) => /\balt=["']\s*["']/.test(t));
  if (noAltAttr.length) fail.push({ name: 'Images missing alt attribute (a11y)', detail: `${noAltAttr.length} <img> with no alt` });
  else if (emptyAlt.length) pass.push({ name: `All ${imgTags.length} <img> have alt (${emptyAlt.length} empty-alt decorative — WCAG-OK)` });
  else pass.push({ name: `All ${imgTags.length} <img> have descriptive alt` });

  // T5 lazy loading
  const noLazy = imgTags.filter((t) => !/loading=["']lazy["']/.test(t));
  if (noLazy.length) warn.push({ name: 'Images without loading="lazy"', detail: `${noLazy.length} <img> not lazy` });
  else pass.push({ name: `All ${imgTags.length} <img> use loading="lazy"` });

  // T6 card counts — index only
  if (isIndex) {
    const attrCards = [...html.matchAll(/\bid="attraction-[a-z]+"/g)].length;
    const expCards = [...html.matchAll(/\bid="exp-[a-z]+"/g)].length;
    attrCards === 8 ? pass.push({ name: 'Attractions module has 8 cards' }) : fail.push({ name: 'Attractions card count', detail: `found ${attrCards}, expected 8` });
    expCards === 8 ? pass.push({ name: 'Experiences module has 8 cards' }) : fail.push({ name: 'Experiences card count', detail: `found ${expCards}, expected 8` });
  }

  // T7 performance budget (per page, using largest variant per stem as proxy)
  const stems = new Set([...refImgs].map((i) => i.split('/').pop().replace(/\.(webp|avif|jpg|jpeg|png)$/i, '').replace(/-(\d+)$/, '')));
  let total = 0, maxFile = '', maxBytes = 0;
  for (const s of stems) { const b = stemPayload(s); total += b; if (b > maxBytes) { maxBytes = b; maxFile = s; } }
  const totalKB = Math.round(total / 1024);
  if (total < 3 * 1024 * 1024) pass.push({ name: `Image payload ~${totalKB}KB (budget <3MB)`, detail: `largest: ${maxFile} ${Math.round(maxBytes / 1024)}KB` });
  else warn.push({ name: 'Image payload exceeds 3MB budget', detail: `${totalKB}KB` });
  const over1 = [...stems].filter((s) => stemPayload(s) > 1024 * 1024);
  if (over1.length) warn.push({ name: 'Individual images >1MB (review)', detail: over1.map((s) => `${s} ${Math.round(stemPayload(s) / 1024)}KB`).join(', ') });

  // T9 lang / landmarks
  if (/<html[^>]*\blang=/.test(html)) pass.push({ name: '<html lang="en"> present (a11y)' });
  else fail.push({ name: 'Missing <html lang> attribute' });
  const navCount = (html.match(/<nav\b/g) || []).length;
  const footerCount = (html.match(/<footer\b/g) || []).length;
  (navCount > 0 ? pass : warn).push({ name: `Landmark: <nav> x${navCount}, <footer> x${footerCount}` });

  // T10 heading hierarchy
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/g)].map((m) => +m[1]);
  const h1 = headings.filter((x) => x === 1).length;
  if (h1 !== 1) warn.push({ name: 'Heading structure: exactly one <h1> expected', detail: `found ${h1}` });
  else pass.push({ name: 'Exactly one <h1> present' });
  let skipped = false;
  for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i - 1] > 1) { skipped = true; break; }
  if (skipped) warn.push({ name: 'Heading levels skip', detail: headings.join(' ') });
  else pass.push({ name: 'Heading levels do not skip (' + headings.join('>') + ')' });

  // T11 form field labels
  const formFields = [...html.matchAll(/<(input|textarea|select)\b([^>]*)>/g)];
  const unlabelled = [];
  for (const m of formFields) {
    const tag = m[1], attrs = m[2];
    if (/\btype=["']?(hidden|submit|button|reset)["']?/.test(attrs)) continue;
    const idm = attrs.match(/\bid=["']([^"']+)["']/);
    const hasFor = idm && new RegExp(`<label[^>]*for=["']${idm[1]}["']`).test(html);
    const aria = /\baria-label=/.test(attrs) || /\baria-labelledby=/.test(attrs) || /\btitle=/.test(attrs);
    if (!hasFor && !aria && !/\bplaceholder=/.test(attrs)) unlabelled.push(tag);
  }
  if (unlabelled.length) fail.push({ name: 'Form fields without programmatic label (a11y)', detail: unlabelled.join(', ') });
  else pass.push({ name: `All ${formFields.length} form fields labelled` });

  // T12 link accessible names
  const aBlocks = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  const emptyA = [];
  for (const m of aBlocks) {
    const attrs = m[1], inner = m[2];
    if (/href=["']#/.test(attrs)) continue;
    const named = /\baria-label=["'][^"']/.test(attrs) || /\baria-labelledby=/.test(attrs);
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const imgAlt = /<img[^>]*alt=["'][^"']/.test(inner);
    if (!named && !text && !imgAlt) emptyA.push(attrs.slice(0, 50));
  }
  if (emptyA.length) fail.push({ name: 'Links with no accessible name (a11y)', detail: emptyA.length + ' empty <a>' });
  else pass.push({ name: `All ${aBlocks.length} links have accessible name` });

  // T13 focus-visible
  if (/:focus\b|:focus-visible|focus:\\w|@apply\s+focus|class=["'][^"']*\bfocus:/.test(html)) pass.push({ name: 'Focus-visible styling present' });
  else warn.push({ name: 'No focus-visible styling detected' });

  // T14/T16 contact modal — only if page has it
  if (/contact-modal/.test(html)) {
    const modalMatch = html.match(/<div id="contact-modal"([^>]*)>/);
    const ma = modalMatch ? modalMatch[1] : '';
    const labelledby = (ma.match(/aria-labelledby=["']([^"']+)["']/) || [])[1];
    const titleExists = labelledby && new RegExp(`id=["']${labelledby}["']`).test(html);
    if (/role=["']dialog["']/.test(ma) && /aria-modal=["']true["']/.test(ma) && titleExists) pass.push({ name: 'Contact modal exposes dialog semantics' });
    else fail.push({ name: 'Contact modal missing dialog role/aria' });
    const hasClose = /<button[^>]*aria-label=["']Close["'][^>]*>/.test(html);
    const hasEsc = /Escape/.test(html);
    if (hasClose && hasEsc) pass.push({ name: 'Modal close mechanisms present' });
    else fail.push({ name: 'Modal missing a close mechanism', detail: `closeBtn=${hasClose}, esc=${hasEsc}` });
  }

  // T15 javascript: URIs
  const jsUri = html.match(/href=["']javascript:/g);
  if (jsUri) fail.push({ name: 'javascript: URI used as link', detail: jsUri.length + ' occurrence(s)' });
  else pass.push({ name: 'No javascript: URI links' });

  // T17 mobile menu auto-close — only if page has it
  if (/#mobile-menu/.test(html)) {
    const ok = /querySelectorAll\(['"]#mobile-menu a/.test(html) || (html.match(/mobile-menu'\)\.classList\.add\('hidden'\)/g) || []).length >= 1;
    if (ok) pass.push({ name: 'Mobile menu auto-closes after tap' });
    else fail.push({ name: 'Mobile menu stays open after anchor tap' });
  }

  return { pass, fail, warn };
}

// ---- global dead-file check (T8) ----
function globalDeadFiles(allRefStems) {
  const webpRefs = new Set([...allRefStems].map((s) => `${s}.webp`).concat([...allRefStems].map((s) => `${s}.avif`)));
  const allJpgs = fs.readdirSync(IMAGES).filter((f) => f.endsWith('.jpg'));
  const isRef = (f) => allRefStems.has(f.replace(/\.jpg$/, '')) || webpRefs.has(f.replace(/\.jpg$/, '.webp')) || webpRefs.has(f.replace(/\.jpg$/, '.avif'));
  const dead = allJpgs.filter((f) => !isRef(f) && !/^(hotel-|food-)/.test(f));
  if (dead.length) return { warn: [{ name: 'Unreferenced image files on disk', detail: dead.slice(0, 12).join(', ') + (dead.length > 12 ? ` …(+${dead.length - 12})` : '') }] };
  return { pass: [{ name: 'No stray dead image files (excluding sub-page reserves)' }] };
}

// ---- main ----
function main() {
  const pages = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) { if (/node_modules|\.git|admin|tests/.test(fp)) continue; walk(fp); }
      else if (e.name.endsWith('.html')) pages.push(fp);
    }
  };
  walk('.');

  const allStems = new Set();
  let totalPass = 0, totalFail = 0, totalWarn = 0;
  const pageReports = [];

  for (const p of pages) {
    // Google Search Console / other verification stubs are not content pages
    if (/google\w*\.html$/.test(p)) continue;
    const html = fs.readFileSync(p, 'utf8');
    const isIndex = path.resolve(p) === path.resolve('index.html');
    const r = auditPage(html, p, isIndex);
    for (const m of html.matchAll(/(?:src|srcset)=\s*["']([^"']*\.(?:webp|avif|jpg))["']/gi)) allStems.add(m[1].split('/').pop().replace(/\.(webp|avif|jpg)$/i, '').replace(/-(\d+)$/, ''));
    totalPass += r.pass.length; totalFail += r.fail.length; totalWarn += r.warn.length;
    pageReports.push({ file: path.relative(ROOT, p), ...r });
  }

  const gf = globalDeadFiles(allStems);
  if (gf.pass) { totalPass += gf.pass.length; }
  if (gf.warn) { totalWarn += gf.warn.length; }

  // ---- report ----
  console.log('\n===== myguilin — Static Audit (all frontend pages) =====');
  console.log(`pages scanned: ${pages.length}\n`);
  for (const pr of pageReports) {
    const flag = pr.fail.length ? '✗ FAIL' : pr.warn.length ? '! warn' : '✓ ok';
    console.log(`  [${flag}] ${pr.file}  (${pr.pass.length}p / ${pr.fail.length}f / ${pr.warn.length}w)`);
    for (const r of pr.fail) console.log('       ✗ ' + r.name + (r.detail ? '  → ' + r.detail : ''));
    for (const r of pr.warn) console.log('       ! ' + r.name + (r.detail ? '  → ' + r.detail : ''));
  }
  if (gf.warn) for (const r of gf.warn) console.log('  ! ' + r.name + '  → ' + r.detail);
  if (gf.pass) for (const r of gf.pass) console.log('  ✓ ' + r.name);
  console.log(`\n  SUMMARY: ${totalPass} pass, ${totalFail} fail, ${totalWarn} warn across ${pages.length} pages\n`);
  process.exit(totalFail ? 1 : 0);
}

main();
