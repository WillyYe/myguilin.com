// scripts/gen-images.mjs
// Generates responsive width/format variants for every image referenced by the
// site, and recompresses oversized sources. Idempotent: existing variants are
// skipped. Run from repo root:  node scripts/gen-images.mjs
//
// This is a build/optimization step. It dynamically imports `sharp` so that
// build-shell.mjs (which imports ./responsive.mjs) does NOT pull sharp into CI.
import fs from 'fs';
import path from 'path';
import { WIDTHS, IMG_DIR, stemFromPath } from './responsive.mjs';

const WEBP_BASE_Q = 70;
const WEBP_VAR_Q = 65;
const AVIF_Q = 50;
const AVIF_MAX_W = 1920; // avif generated up to this width (matches webp variants)
const RECPRESS_BYTES = 400 * 1024; // recompress base webp if larger than this

// ---- collect referenced image stems from the whole repo ----
function collectStems() {
  const stems = new Set();
  const add = (p) => {
    if (!p) return;
    const s = stemFromPath(p);
    stems.add(s);
    stems.add(s.replace(/-(\d+)$/, '')); // also register base stem (variant refs like foo-1920.webp)
  };

  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) { if (!/node_modules|\.git|admin|tests/.test(fp)) walk(fp, out); }
      else out.push(fp);
    }
    return out;
  };
  const files = walk('.');
  const imgRe = /\.(webp|jpg|jpeg|avif|png|gif)(?:['")]|\s|$)/i;
  for (const f of files) {
    if (!/\.(html|css|mjs|json)$/.test(f)) continue;
    let txt;
    try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    // <img src>, <source srcset>
    for (const m of txt.matchAll(/(?:src|srcset|href)\s*=\s*["']([^"']+\.(?:webp|jpg|jpeg|avif|png|gif))["']/gi)) add(m[1]);
    // CSS url(images/...)
    for (const m of txt.matchAll(/url\(\s*['"]?(images\/[^)'"]+\.(?:webp|jpg|jpeg|avif|png|gif))['"]?\s*\)/gi)) add(m[1]);
    // data .mjs / json image fields like  img: 'web-elephant-night'  (no extension)
    for (const m of txt.matchAll(/(?:img|image|photo|thumb)\s*:\s*['"]([A-Za-z0-9_.\/-]+)['"]/gi)) {
      const v = m[1];
      if (!/\.(webp|jpg|jpeg|avif|png|gif)$/i.test(v)) add('images/' + v + '.webp'); // treat as stem
    }
  }
  return stems;
}

function bestSource(stem) {
  for (const ext of ['jpg', 'jpeg', 'webp', 'avif']) {
    const p = path.join(IMG_DIR, `${stem}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function encode(pipe, ext, q) {
  return ext === 'webp' ? pipe.webp({ quality: q }) : pipe.avif({ quality: q, effort: 3 });
}

async function main() {
  const sharp = (await import('sharp')).default;
  const stems = collectStems();
  console.log(`referenced image stems: ${stems.size}`);
  let created = 0;
  let recompressed = 0;
  let skipped = 0;

  for (const stem of [...stems].sort()) {
    const src = bestSource(stem);
    if (!src) { console.log(`  skip (no source file): ${stem}`); skipped++; continue; }
    let meta;
    try { meta = await sharp(src).metadata(); } catch (e) { console.log(`  skip (decode fail) ${stem}: ${e.message}`); skipped++; continue; }
    const natW = meta.width || 0;
    const baseW = Math.min(natW, 1920);

    // --- base webp (fallback). Only recompress if oversized / too big. ---
    const basePath = path.join(IMG_DIR, `${stem}.webp`);
    const needBase = !fs.existsSync(basePath) || natW > 1920 || fs.statSync(basePath).size > RECPRESS_BYTES;
    if (needBase) {
      const tmp = basePath + '.tmp';
      await sharp(src).resize({ width: baseW, withoutEnlargement: true }).webp({ quality: WEBP_BASE_Q, method: 4 }).toFile(tmp);
      const oldSize = fs.existsSync(basePath) ? fs.statSync(basePath).size : Infinity;
      const newSize = fs.statSync(tmp).size;
      if (newSize < oldSize) { fs.renameSync(tmp, basePath); recompressed++; }
      else { fs.unlinkSync(tmp); }
    }

    // --- base avif (only if missing) ---
    const baseAvif = path.join(IMG_DIR, `${stem}.avif`);
    if (!fs.existsSync(baseAvif)) {
      await sharp(src).resize({ width: baseW, withoutEnlargement: true }).avif({ quality: AVIF_Q, effort: 3 }).toFile(baseAvif);
      created++;
    }

    // --- width variants ---
    for (const w of WIDTHS) {
      if (w >= natW) continue; // never upscale
      for (const ext of ['webp', 'avif']) {
        if (ext === 'avif' && w > AVIF_MAX_W) continue;
        const vp = path.join(IMG_DIR, `${stem}-${w}.${ext}`);
        if (fs.existsSync(vp)) continue;
        const q = ext === 'webp' ? WEBP_VAR_Q : AVIF_Q;
        await encode(sharp(src).resize({ width: w }), ext, q).toFile(vp);
        created++;
      }
    }
  }
  console.log(`\nDONE — created ${created} new variant files, recompressed ${recompressed} base webp, skipped ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
