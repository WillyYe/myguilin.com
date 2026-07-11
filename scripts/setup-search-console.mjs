// setup-search-console.mjs
// Generates the search-engine ownership-verification files for myguilin.com.
// Tokens are NEVER hard-coded here — pass them via environment variables so they
// stay out of the repo, chat, and memory.
//
//   GOOGLE_VERIFICATION = the full code Google gives you, e.g. "google-AbC123..."
//   BING_VERIFICATION   = the BingAuth token, e.g. "A1B2C3D4E5F6..."
//
// Usage:
//   GOOGLE_VERIFICATION="google-xxxxx" BING_VERIFICATION="yyyy" \
//     node scripts/setup-search-console.mjs
//
// Then run `npm run build` and push; verify ownership in each console.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const google = process.env.GOOGLE_VERIFICATION;
const bing = process.env.BING_VERIFICATION;

if (!google && !bing) {
  console.error('✗ Nothing to do. Set GOOGLE_VERIFICATION and/or BING_VERIFICATION env vars.');
  console.error('  Example:');
  console.error('  GOOGLE_VERIFICATION="google-xxxx" BING_VERIFICATION="yyyy" node scripts/setup-search-console.mjs');
  process.exit(1);
}

if (google) {
  // Google HTML verification: file named <code>.html, body is
  // "google-site-verification: <code>.html" (Google requires the prefix).
  const base = google.replace(/\.html$/i, '');
  const file = path.join(ROOT, `${base}.html`);
  fs.writeFileSync(file, `google-site-verification: ${base}.html`, 'utf8');
  console.log(`✓ wrote Google verification file: ${base}.html`);
}

if (bing) {
  // Bing XML verification: standard format is <users><user>{token}</user></users>
  // (NOT <usersiteverify> — that would fail verification).
  const file = path.join(ROOT, 'BingSiteAuth.xml');
  fs.writeFileSync(file, `<?xml version="1.0"?>\n<users>\n\t<user>${bing}</user>\n</users>`, 'utf8');
  console.log('✓ wrote Bing verification file: BingSiteAuth.xml');
}

console.log('\nNext steps:');
console.log('  1. npm run build   (regenerates sitemap/robots/llms)');
console.log('  2. git add -A && git commit && git push');
console.log('  3. In Google Search Console + Bing Webmaster Tools, click "Verify".');
console.log('  4. Submit https://myguilin.com/sitemap.xml in each console.');
