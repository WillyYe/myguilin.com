// scripts/make-picture.mjs
// Upgrades every content image in the frontend HTML to a fully responsive
// <picture> (avif + webp srcset, jpg/webp fallback, sizes). Idempotent:
// already-upgraded <picture> blocks are left untouched.
// Run from repo root:  node scripts/make-picture.mjs
import fs from 'fs';
import path from 'path';
import { parseAttrs, stemFromPath, buildResponsivePicture, isUpgradedPicture } from './responsive.mjs';

const ROOT = process.cwd();

function relFor(file) {
  // URL prefix to reach /images from this file's directory
  return path.relative(path.dirname(path.resolve(file)), path.resolve('images')).split(path.sep).join('/');
}

function stripTag(tag) {
  return tag.replace(/^<img/i, '').replace(/\/>$/, '').replace(/>$/, '');
}

function upgradePicture(block, rel) {
  if (isUpgradedPicture(block)) return block; // already done
  const imgM = /<img\b([\s\S]*?)\/?>/i.exec(block);
  if (!imgM) return block;
  const attrs = parseAttrs(imgM[1]);
  const src = attrs.src || '';
  if (!/images\//.test(src)) return block; // not a local image
  const stem = stemFromPath(src);
  return buildResponsivePicture(stem, rel, attrs);
}

function wrapImg(imgTag, rel) {
  const attrs = parseAttrs(stripTag(imgTag));
  const src = attrs.src || '';
  if (!/images\//.test(src)) return imgTag; // external / data / svg sprite
  const stem = stemFromPath(src);
  return buildResponsivePicture(stem, rel, attrs);
}

const RE = /(<picture>[\s\S]*?<\/picture>)|(<img\b[^>]*\/?>)/gi;

function processFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = relFor(file);
  let changed = false;
  let pics = 0, wraps = 0;
  const out = html.replace(RE, (m, pic, img) => {
    if (pic) {
      const r = upgradePicture(pic, rel);
      if (r !== pic) { changed = true; pics++; }
      return r;
    }
    if (img) {
      const r = wrapImg(img, rel);
      if (r !== img) { changed = true; wraps++; }
      return r;
    }
    return m;
  });
  if (changed) {
    fs.writeFileSync(file, out);
    console.log(`  ${path.relative(ROOT, file)}  (+${pics} picture upgraded, +${wraps} img wrapped)`);
  }
  return changed;
}

function main() {
  const pages = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (/node_modules|\.git|admin|tests/.test(fp)) continue;
        walk(fp);
      } else if (e.name.endsWith('.html')) pages.push(fp);
    }
  };
  walk('.');
  console.log(`frontend html pages: ${pages.length}`);
  let total = 0;
  for (const p of pages) if (processFile(p)) total++;
  console.log(`\nDONE — ${total} page(s) rewritten`);
}

main();
