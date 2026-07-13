// scripts/responsive.mjs
// Shared helpers for responsive <picture> generation + HTML rewriting.
//
// IMPORTANT: this module must NOT import `sharp` at top level, because
// build-shell.mjs (run in CI on deploy) imports buildSrcset/buildResponsivePicture
// and the CI image pipeline does NOT install sharp. Image *generation* lives in
// gen-images.mjs which dynamically imports sharp only when it actually runs
// (locally). Everything exported here is pure fs + string building.
import fs from 'fs';
import path from 'path';

export const WIDTHS = [640, 1280, 1920]; // generated variant widths (px)
export const IMG_DIR = path.resolve('images');

// basename without extension, from any reference form
//   ../images/foo.webp  ->  foo
//   images/foo.jpg      ->  foo
export function stemFromPath(src) {
  const base = String(src).split('/').pop() || '';
  return base.replace(/\.(webp|jpg|jpeg|jpeg|avif|png|gif)$/i, '');
}

// Which of WIDTHS actually exist on disk as variants for this stem, scoped to
// a specific format when `ext` is given. Without `ext` it checks both webp and
// avif (used by hasAvif). IMPORTANT: when building a per-format srcset we must
// pass the format so we never advertise a variant that only exists in another
// format (e.g. a 1920.webp must not make us emit a non-existent 1920.avif).
export function variantWidthsOnDisk(stem, ext = null, dir = IMG_DIR) {
  const found = new Set();
  const exts = ext ? [ext] : ['webp', 'avif'];
  for (const e of exts) {
    for (const w of WIDTHS) {
      if (fs.existsSync(path.join(dir, `${stem}-${w}.${e}`))) found.add(w);
    }
  }
  return [...found].sort((a, b) => a - b);
}

export function hasAvif(stem, dir = IMG_DIR) {
  if (fs.existsSync(path.join(dir, `${stem}.avif`))) return true;
  return variantWidthsOnDisk(stem, 'avif', dir).length > 0;
}

// Build a srcset string for one format. Includes width-descriptor variants
// (only those present on disk) plus the base file as the 1x fallback entry.
export function buildSrcset(stem, ext, rel = 'images', dir = IMG_DIR) {
  const parts = [];
  for (const w of variantWidthsOnDisk(stem, ext, dir)) {
    parts.push(`${rel}/${stem}-${w}.${ext} ${w}w`);
  }
  if (fs.existsSync(path.join(dir, `${stem}.${ext}`))) {
    parts.push(`${rel}/${stem}.${ext}`);
  }
  return parts.join(', ');
}

// Infer a sensible `sizes` value from the element's attributes.
export function inferSizes(attrs) {
  const id = attrs.id || '';
  const cls = attrs.class || '';
  if (id === 'heroImg') return '100vw';
  if (cls.includes('w-full')) return '(max-width: 1024px) 100vw, 1024px';
  if (cls.includes('h-28') || cls.includes('h-56') || cls.includes('h-40')) return '(max-width: 768px) 100vw, 400px';
  return '(max-width: 768px) 100vw, 800px';
}

// Parse all attributes of a tag into a lowercased-key map.
export function parseAttrs(tagInner) {
  const attrs = {};
  const re = /([\w-]+)\s*=\s*"([^"]*)"|([\w-]+)\s*=\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(tagInner))) {
    const k = m[1] || m[3];
    const v = m[2] !== undefined ? m[2] : m[4];
    attrs[k.toLowerCase()] = v;
  }
  return attrs;
}

// Build a fully responsive <picture> string.
// opts: { stem, rel, alt, cls, sizes, loading, decoding, id, fetchpriority, extra }
export function buildResponsivePicture(stem, rel, attrs = {}, dir = IMG_DIR) {
  const avif = buildSrcset(stem, 'avif', rel, dir);
  const webp = buildSrcset(stem, 'webp', rel, dir);
  const fallback = fs.existsSync(path.join(dir, `${stem}.webp`))
    ? `${rel}/${stem}.webp`
    : `${rel}/${stem}.jpg`;
  const alt = attrs.alt || '';
  const cls = attrs.class || '';
  const loading = attrs.loading || 'lazy';
  const decoding = attrs.decoding || 'async';
  const id = attrs.id || '';
  const fetchpriority = attrs.fetchpriority || '';
  const sizes = attrs.sizes || inferSizes(attrs);

  // keep any extra attributes the original <img> carried (style, width, height, data-*, ...)
  const skip = new Set(['src', 'srcset', 'sizes', 'alt', 'class', 'loading', 'decoding', 'id', 'fetchpriority', 'type']);
  let extra = '';
  for (const k of Object.keys(attrs)) {
    if (skip.has(k)) continue;
    extra += ` ${k}="${attrs[k]}"`;
  }

  const sources = [];
  if (avif) sources.push(`  <source type="image/avif" srcset="${avif}">`);
  sources.push(`  <source type="image/webp" srcset="${webp}">`);

  return `<picture>\n${sources.join('\n')}\n  <img src="${fallback}" alt="${alt}" class="${cls}" loading="${loading}" decoding="${decoding}"${id ? ` id="${id}"` : ''}${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}${extra} sizes="${sizes}">\n</picture>`;
}

// True if a <picture> block already carries an avif source with width descriptors
// (i.e. already upgraded by this tool) AND every variant it references actually
// exists on disk. If any referenced variant is missing, we treat it as NOT
// upgraded so make-picture will regenerate it from what's really on disk.
export function isUpgradedPicture(pictureHTML, dir = IMG_DIR) {
  const srcsets = [...pictureHTML.matchAll(/srcset="([^"]*)"/gi)].map((m) => m[1]);
  if (!srcsets.length) return false;
  if (!srcsets.some((s) => /\d+w/.test(s))) return false; // must have width descriptors
  for (const s of srcsets) {
    for (const part of s.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (!url) continue;
      const file = url.split('/').pop();
      if (!fs.existsSync(path.join(dir, file))) return false; // broken ref → force regen
    }
  }
  return true;
}
