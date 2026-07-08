// myguilin.com — First-level page E2E smoke test (Playwright, no test-runner dep)
// Run after chromium is installed:  node tests/e2e.mjs
// Optional: BASE=https://myguilin.com  (defaults to live site)
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'https://myguilin.com';
const results = [];
const ok = (name, cond, detail = '') => results.push({ name, pass: !!cond, detail });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

// 1. title
const title = await page.title();
ok('Page has a non-empty <title>', title && title.trim().length > 0, title);

// 2. card counts
const attrCount = await page.locator('#attraction [id^="attraction-"]').count();
ok('Attractions module renders 8 cards', attrCount === 8, `found ${attrCount}`);
const expCount = await page.locator('#experience [id^="exp-"]').count();
ok('Experiences module renders 8 cards', expCount === 8, `found ${expCount}`);

// 3. no broken images (real render check)
const broken = await page.$$eval('img', imgs =>
  imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src));
ok('No broken images on render (naturalWidth>0)', broken.length === 0, broken.length ? broken.join(', ') : 'all images loaded');

// 4. all imgs lazy
const nonLazy = await page.$$eval('img', imgs => imgs.filter(i => i.getAttribute('loading') !== 'lazy').length);
ok('All <img> use loading="lazy"', nonLazy === 0, `${nonLazy} not lazy`);

// 5. entry cards link to sub-pages
const hotelHref = await page.locator('#hotel a').first().getAttribute('href');
const foodHref = await page.locator('#food a').first().getAttribute('href');
ok('Hotel entry links to hotels.html', /hotels\.html$/.test(hotelHref || ''), hotelHref);
ok('Food entry links to restaurants.html', /restaurants\.html$/.test(foodHref || ''), foodHref);

// 6. nav anchor navigation (scroll)
await page.locator('a[href="#hotel"]').first().click();
await page.waitForTimeout(800);
const hotelVisible = await page.locator('#hotel').isVisible();
ok('Clicking nav "Hotel" reveals #hotel section', hotelVisible);

// 7. mobile viewport nav
await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
const mobileNavLinks = await page.locator('nav a[href^="#"]').count();
ok('Mobile viewport still exposes nav anchor links', mobileNavLinks > 0, `${mobileNavLinks} nav links`);

// 8. console errors
ok('No severe console/page errors on load', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

// report
console.log('\n===== myguilin First-Level Page — E2E Smoke (Playwright) =====');
console.log('target: ' + BASE + '\n');
let failed = 0;
for (const r of results) {
  console.log(`  ${r.pass ? '✓' : '✗'} ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.pass) failed++;
}
console.log(`\n  SUMMARY: ${results.length - failed} pass, ${failed} fail\n`);
process.exit(failed ? 1 : 0);
