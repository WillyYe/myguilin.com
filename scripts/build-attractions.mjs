// scripts/build-attractions.mjs
// Renders all 8 Guilin attraction detail pages from attractions-data.mjs.
// Run:  node scripts/build-attractions.mjs
// Output: attractions/<slug>.html  (committed; serves as static site pages)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { attractions, SITE } from '../attractions-data.mjs';
import { guides } from '../guides-data.mjs';
import { experiences } from '../experiences-data.mjs';
import { hotels, hotelCategories } from '../hotels-data.mjs';
import { restaurants, foodCategories, dishList } from '../food-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'images');
const OUT_DIR = path.join(ROOT, 'attractions');

// ---- site operator entity (for structured data) + build freshness ----
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const UPDATED_LABEL = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
const ORG_ID = `${SITE.url}/#visitguilin`;
const orgNode = () => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: `${SITE.url}/favicon.svg` },
  image: `${SITE.url}/images/hero-liriver.webp`,
  telephone: SITE.phone,
  email: SITE.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Guilin', addressRegion: 'Guangxi', addressCountry: 'CN' },
  areaServed: 'Guilin, Guangxi, China',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: SITE.phone,
    email: SITE.email,
    contactType: 'customer support',
    availableLanguage: ['English', 'Chinese'],
    areaServed: 'Guilin, Guangxi, China',
  },
});

// ---- inline SVG icon set (zero third-party dependency) ----
const PATHS = {
  sparkles: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  ship: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  'calendar-heart': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'calendar-check': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>',
  'cloud-rain': '<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/>',
  droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
};
const icon = (name, cls = 'w-5 h-5') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || PATHS.sparkles}</svg>`;

// ---- image helpers + existence guard ----
const imgExists = (name) =>
  fs.existsSync(path.join(IMG_DIR, name + '.webp')) || fs.existsSync(path.join(IMG_DIR, name + '.jpg'));
const picture = (name, alt, cls = '', extra = '') =>
  `<picture><source srcset="../images/${name}.webp" type="image/webp"><img src="../images/${name}.jpg" alt="${alt}" class="${cls}" loading="lazy" decoding="async" ${extra}></picture>`;

// ---- navigation (marks current page in the correct section) ----
const attractionSlugs = new Set(attractions.map((a) => a.slug));
const experienceSlugs = new Set(experiences.map((e) => e.slug));

function nav(current, pageType = 'attraction', base = './') {
  const isAttraction = pageType === 'attraction';
  const isExperience = pageType === 'experience';
  const isGuide = pageType === 'guide';
  const isHotel = pageType === 'hotel';
  const isFood = pageType === 'food';
  const attractionBase = (isExperience || isGuide || isHotel || isFood) ? '../attractions/' : base;
  const experienceBase = (isAttraction || isGuide || isHotel || isFood) ? '../experiences/' : base;
  const attrLink = (slug, label) =>
    `<a href="${attractionBase}${slug}.html" class="mega-link"${slug === current ? ' aria-current="page"' : ''}>${label}</a>`;
  const expLink = (slug, label) =>
    `<a href="${experienceBase}${slug}.html" class="mega-link"${slug === current ? ' aria-current="page"' : ''}>${label}</a>`;
  const hotelLink = (slug, label) =>
    `<a href="../hotels/${slug}.html" class="mega-link"${slug === current ? ' aria-current="page"' : ''}>${label}</a>`;
  const foodLink = (slug, label) =>
    `<a href="../food/${slug}.html" class="mega-link"${slug === current ? ' aria-current="page"' : ''}>${label}</a>`;
  const expCard = (slug, img, title) => {
    const label = title.replace(/ /g, '<br>');
    return `<a href="${experienceBase}${slug}.html" class="mega-feature block">${picture(img, title, 'h-28 w-full object-cover')}<div class="overlay"></div><span class="absolute bottom-2 left-3 text-white text-xs font-semibold leading-tight">${label}</span></a>`;
  };
  const activeClass = (cond) => cond ? ' active text-river' : ' text-stone';
  return `
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-sand-dark" style="height:64px;">
    <div class="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
      <a href="../" class="flex items-center gap-2 shrink-0">
        <span class="text-2xl">🏞️</span>
        <span class="font-display text-xl text-river tracking-wide">Visit Guilin</span>
      </a>
      <nav class="hidden lg:flex items-center h-full">
        <ul class="flex items-center h-full">
          <li class="nav-item h-full flex items-center"><a href="../" class="nav-link text-sm font-semibold text-stone hover:text-river px-4 h-full flex items-center">Home</a></li>
          <li class="nav-item h-full flex items-center">
            <a href="../#attraction" class="nav-link text-sm font-semibold${activeClass(isAttraction)} hover:text-river px-4 h-full flex items-center gap-1">
              Attraction
              <svg class="dropdown-caret" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu" style="width:700px;">
              <div class="grid grid-cols-2 gap-x-10 gap-y-1">
                <div>
                  <p class="mega-col-title">Guilin City &amp; Around</p>
                  ${attrLink('liriver', '🛶 Li River Cruise (漓江)')}
                  ${attrLink('elephant', '🐘 Elephant Trunk Hill (象鼻山)')}
                  ${attrLink('reedflute', '🪨 Reed Flute Cave (芦笛岩)')}
                  ${attrLink('yulong', '🚣 Yulong River Rafting (遇龙河)')}
                </div>
                <div>
                  <p class="mega-col-title">Countryside &amp; Beyond</p>
                  ${attrLink('yangshuo', '🚲 Yangshuo &amp; West Street (阳朔)')}
                  ${attrLink('longji', '🌾 Longji Rice Terraces (龙脊)')}
                  ${attrLink('tworivers', '🌉 Two Rivers &amp; Four Lakes (两江四湖)')}
                  ${attrLink('xingping', '🏘️ Xingping Ancient Town (兴坪)')}
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-sand-dark">
                <a href="../#attraction" class="inline-flex items-center gap-1 text-sm font-semibold text-river hover:text-gold-dark transition-colors">View All Attractions →</a>
              </div>
            </div>
          </li>
          <li class="nav-item h-full flex items-center"><a href="/guides/index.html" class="nav-link text-sm font-semibold text-stone hover:text-river px-4 h-full flex items-center">Guides</a></li>
          <li class="nav-item h-full flex items-center">
            <a href="../#experience" class="nav-link text-sm font-semibold${activeClass(isExperience)} hover:text-river px-4 h-full flex items-center gap-1">
              Experiences
              <svg class="dropdown-caret" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu" style="width:900px;">
              <div class="grid grid-cols-4 gap-4">
                ${expCard('li-river-cruise', 'exp-liriver', 'Li River Cruise')}
                ${expCard('countryside-cycling', 'exp-cycling', 'Countryside Cycling')}
                ${expCard('longji-terraces-trek', 'exp-longji', 'Longji Trekking')}
                ${expCard('cormorant-fishing', 'exp-cormorant', 'Cormorant Fishing')}
              </div>
              <div class="mt-4 grid grid-cols-4 gap-4">
                ${expCard('bamboo-rafting', 'exp-bamboo', 'Bamboo Rafting')}
                ${expCard('rock-climbing', 'exp-climb', 'Rock Climbing')}
                ${expCard('cooking-class', 'exp-cook', 'Cooking Class')}
                ${expCard('sunrise-viewpoint', 'exp-xianggong', 'Sunrise Viewpoint')}
              </div>
              <div class="mt-4 grid grid-cols-4 gap-4 text-center">
                ${expLink('li-river-cruise', 'Li River Cruise')}
                ${expLink('countryside-cycling', 'Countryside Cycling')}
                ${expLink('longji-terraces-trek', 'Longji Trekking')}
                ${expLink('cormorant-fishing', 'Cormorant Show')}
                ${expLink('bamboo-rafting', 'Bamboo Rafting')}
                ${expLink('rock-climbing', 'Rock Climbing')}
                ${expLink('cooking-class', 'Cooking Class')}
                ${expLink('sunrise-viewpoint', 'Sunrise Viewpoint')}
              </div>
            </div>
          </li>
          <li class="nav-item h-full flex items-center">
            <a href="../#tour" class="nav-link text-sm font-semibold text-stone hover:text-river px-4 h-full flex items-center gap-1">
              Things to do &amp; Tour
              <svg class="dropdown-caret" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu" style="width:600px;">
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <p class="mega-col-title">Top Ranked</p>
                  <a href="../#tour-ranking" class="mega-link">🏆 Top 8 Must-See Spots</a>
                  <p class="mega-col-title mt-4">Tour Types</p>
                  <a href="../#tour-day" class="mega-link">📅 Day Tours</a>
                  <a href="../#tour-private-card" class="mega-link">🎒 Private Tours</a>
                  <a href="../#tour-vip-card" class="mega-link">💎 VIP Tours</a>
                </div>
                <div>
                  <p class="mega-col-title">Featured</p>
                  <a href="../#tour" class="mega-feature block mb-3">
                    <img loading="lazy" decoding="async" src="../images/hero-liriver-800.webp" alt="" class="h-28 w-full object-cover">
                    <div class="overlay"></div>
                    <span class="absolute bottom-2 left-3 text-white text-sm font-semibold">All Tours →</span>
                  </a>
                  <a href="../#tour-private-card" class="mega-link text-river font-semibold">Most Popular: Private Guide + Car</a>
                </div>
              </div>
            </div>
          </li>
          <li class="nav-item h-full flex items-center">
            <a href="../#hotel" class="nav-link text-sm font-semibold${activeClass(isHotel)} hover:text-river px-4 h-full flex items-center gap-1">
              Hotels
              <svg class="dropdown-caret" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu" style="width:640px;">
              <div class="grid grid-cols-2 gap-x-8 gap-y-1">
                ${hotelLink('scenic-view', '🏞️ Scenic-View Hotels')}
                ${hotelLink('selected', '⭐ Curated Stays')}
                ${hotelLink('budget', '💡 Great-Value Stays')}
                ${hotelLink('region', '📍 Hotels by Area')}
              </div>
              <div class="mt-4 pt-4 border-t border-sand-dark">
                <span class="mega-col-title">By area</span>
                <div class="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                  <a href="../hotels/region.html#yangshuo" class="mega-link">🛶 Yangshuo &amp; Yulong River</a>
                  <a href="../hotels/region.html#guilin-city" class="mega-link">🏙️ Guilin City</a>
                  <a href="../hotels/region.html#longji" class="mega-link">🌾 Longji Terraces</a>
                  <a href="../hotels/region.html#xingping" class="mega-link">🏘️ Xingping Ancient Town</a>
                </div>
              </div>
            </div>
          </li>
          <li class="nav-item h-full flex items-center">
            <a href="../#food" class="nav-link text-sm font-semibold${activeClass(isFood)} hover:text-river px-4 h-full flex items-center gap-1">
              Food
              <svg class="dropdown-caret" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu" style="width:640px;">
              <div class="grid grid-cols-2 gap-x-8 gap-y-1">
                ${foodLink('guide', '🍜 Guilin Food Guide')}
                ${foodLink('featured', '⭐ Featured Restaurants')}
                ${foodLink('chinese', '🥢 Chinese Restaurants')}
                ${foodLink('western', '🍕 Western & International')}
                ${foodLink('must-eat', '🏆 Must-Eat List')}
              </div>
              <div class="mt-4 pt-4 border-t border-sand-dark">
                <span class="mega-col-title">Quick picks</span>
                <div class="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                  <a href="../food/chinese.html" class="mega-link">🐟 Beer Fish houses</a>
                  <a href="../food/western.html" class="mega-link">🌏 Indian &amp; Pizza</a>
                </div>
              </div>
            </div>
          </li>
          <li class="nav-item h-full flex items-center">
            <button type="button" onclick="openContactModal(event)" class="nav-link bg-transparent border-0 cursor-pointer text-sm font-semibold text-river hover:bg-river hover:text-white px-4 h-full flex items-center rounded-full transition-colors">Contact us</button>
          </li>
        </ul>
      </nav>
      <div class="hidden lg:flex items-center shrink-0">
        <a href="https://wa.me/${SITE.whatsapp}" target="_blank" class="flex items-center gap-2 bg-river hover:bg-river-light text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-300">
          ${icon('message-circle', 'w-[18px] h-[18px]')} WhatsApp
        </a>
      </div>
      <button class="lg:hidden text-river" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
        <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden bg-white border-t border-sand-dark px-6 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
      <a href="../" class="block text-stone font-semibold py-2">1. Home</a>
      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide pt-3 pb-1">2. Attraction</p>
      ${attrLink('liriver', 'Li River Cruise')}
      ${attrLink('elephant', 'Elephant Trunk Hill')}
      ${attrLink('yangshuo', 'Yangshuo &amp; West Street')}
      ${attrLink('longji', 'Longji Rice Terraces')}
      ${attrLink('reedflute', 'Reed Flute Cave')}
      ${attrLink('yulong', 'Yulong River Rafting')}
      ${attrLink('tworivers', 'Two Rivers &amp; Four Lakes')}
      ${attrLink('xingping', 'Xingping Ancient Town')}
      <a href="/guides/index.html" class="block text-stone font-semibold py-2">Guides</a>
      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide pt-3 pb-1">3. Experiences</p>
      ${expLink('bamboo-rafting', 'Bamboo Rafting')}
      ${expLink('countryside-cycling', 'Countryside Cycling')}
      ${expLink('rock-climbing', 'Karst Climbing')}
      ${expLink('cooking-class', 'Cooking Classes')}
      ${expLink('cormorant-fishing', 'Cormorant Fishing')}
      ${expLink('li-river-cruise', 'Li River Cruise')}
      ${expLink('longji-terraces-trek', 'Longji Terraces Trek')}
      ${expLink('sunrise-viewpoint', 'Sunrise Viewpoint')}
      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide pt-3 pb-1">4. Things to do &amp; Tour</p>
      <a href="../#tour-ranking" class="block text-stone/80 py-1 pl-3 text-sm">Top 8 Must-See Spots</a>
      <a href="../#tour-day" class="block text-stone/80 py-1 pl-3 text-sm">Day Tours</a>
      <a href="../#tour-private-card" class="block text-stone/80 py-1 pl-3 text-sm">Private Tours</a>
      <a href="../#tour-vip-card" class="block text-stone/80 py-1 pl-3 text-sm">VIP Tours</a>
      <a href="../#hotel" class="block text-stone font-semibold py-2 pt-3">5. Hotel</a>
      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide pt-3 pb-1">6. Food</p>
      ${foodLink('guide', 'Guilin Food Guide')}
      ${foodLink('featured', 'Featured Restaurants')}
      ${foodLink('chinese', 'Chinese Restaurants')}
      ${foodLink('western', 'Western & International')}
      ${foodLink('must-eat', 'Must-Eat List')}
      <button type="button" onclick="openContactModal(event);document.getElementById('mobile-menu').classList.add('hidden')" class="block w-full text-left bg-transparent border-0 cursor-pointer text-river font-semibold py-2 pt-3 border-t border-sand-dark mt-2">7. Contact us</button>
      <a href="https://wa.me/${SITE.whatsapp}" target="_blank" class="block text-center bg-river text-white font-semibold py-2.5 rounded-full mt-3">WhatsApp Us</a>
    </div>
  </header>`;
}

// ---- render a single page (attraction or experience) ----
function renderPage(a, pageType = 'attraction') {
  const isExperience = pageType === 'experience';
  const subdir = isExperience ? 'experiences' : 'attractions';
  const plural = isExperience ? 'Experiences' : 'Attractions';
  const singular = isExperience ? 'Experience' : 'Attraction';
  const heroImg = `../images/${a.heroImage}.webp`;
  const odd = a.highlights.length % 2 === 1;

  const highlights = a.highlights.map((h, i) => {
    const span = odd && i === a.highlights.length - 1 ? ' sm:col-span-2' : '';
    const inner = i === a.highlights.length - 1 && odd
      ? `<div class="grid grid-cols-1 sm:grid-cols-2"><div class="overflow-hidden"><img class="highlight-img sm:h-full" loading="lazy" decoding="async" src="../images/${h.img}.webp" alt="${h.alt || h.title}"></div><div class="p-5 flex flex-col justify-center"><h3 class="font-display text-xl text-river mb-1">${h.title}</h3><p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-2">${h.sub}</p><p class="text-sm text-stone/80 leading-relaxed">${h.text}</p></div></div>`
      : `<div class="overflow-hidden"><img class="highlight-img" loading="lazy" decoding="async" src="../images/${h.img}.webp" alt="${h.alt || h.title}"></div><div class="p-5"><h3 class="font-display text-xl text-river mb-1">${h.title}</h3><p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-2">${h.sub}</p><p class="text-sm text-stone/80 leading-relaxed">${h.text}</p></div>`;
    return `<article class="highlight-card card-hover bg-white rounded-2xl overflow-hidden border border-sand-dark${span}">${inner}</article>`;
  }).join('\n');

  const routes = a.routes.map((r) => `
        <div class="bg-white rounded-2xl border border-sand-dark p-6 sm:p-7">
          <div class="flex items-center gap-3 mb-5">
            <span class="w-10 h-10 rounded-full bg-river text-white flex items-center justify-center">${icon(r.icon)}</span>
            <div><h3 class="font-display text-xl text-river">${r.title}</h3><p class="text-xs text-stone-600">${r.meta}</p></div>
          </div>
          <div class="text-sm text-stone/85 space-y-0">
            ${r.steps.map((s, i) => `<div class="route-step"><span class="route-dot">${i + 1}</span><p><strong class="text-river">${s.t}</strong> ${s.d}</p></div>`).join('')}
          </div>
        </div>`).join('\n');

  const bestTime = a.bestTime.map((b) => `
          <div class="bg-white rounded-2xl border border-sand-dark p-6 text-center">
            ${icon(b.icon, 'w-7 h-7 text-gold-dark mx-auto mb-3')}
            <p class="font-semibold text-river mb-1">${b.title}</p>
            <p class="text-sm text-stone-600">${b.text}</p>
          </div>`).join('\n');

  const tips = a.tips.map((t) => `
            <div class="tip-item">
              <span class="tip-icon">${icon(t.icon, 'w-5 h-5 text-white')}</span>
              <div>
                <p class="font-semibold text-river">${t.title}</p>
                <p class="text-sm text-stone-600">${t.text}</p>
              </div>
            </div>`).join('\n');

  const gettingThere = a.gettingThere.map((g, i) => `
            <div class="route-step"><span class="route-dot">${i + 1}</span>
              <p class="text-stone/85"><strong class="text-river">${g.t}</strong> ${g.d}</p>
            </div>`).join('\n');

  const tickets = a.tickets.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join('\n');

  const gallery = a.gallery.map((g) => `<div class="gallery-item"><img loading="lazy" decoding="async" class="w-full h-56 object-cover" src="../images/${g.img}.webp" alt="${g.alt}"></div>`).join('\n');

  const faqs = a.faqs.map((f) => `
          <div class="bg-white rounded-2xl border border-sand-dark p-6 md:p-7 fade-in">
            <h3 class="font-display text-lg md:text-xl text-river mb-2">${f.q}</h3>
            <p class="text-stone/80 leading-relaxed text-sm md:text-base">${f.a}</p>
          </div>`).join('\n');

  const relatedHref = (r) => {
    const isRelAttr = attractionSlugs.has(r.slug);
    const isRelExp = experienceSlugs.has(r.slug);
    const base = isRelAttr
      ? (isExperience ? '../attractions/' : './')
      : isRelExp
        ? (isExperience ? './' : '../experiences/')
        : './';
    return `${base}${r.slug}.html`;
  };
  const related = a.related.map((r) => `
        <a href="${relatedHref(r)}" class="card-hover group block bg-white rounded-2xl overflow-hidden border border-sand-dark">
          <div class="overflow-hidden"><img loading="lazy" decoding="async" class="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" src="../images/${r.img}.webp" alt="${r.title}"></div>
          <div class="p-5">
            <h3 class="font-display text-lg text-river">${r.title}</h3>
            <p class="text-xs text-stone-600 mt-1">${r.sub}</p>
          </div>
        </a>`).join('\n');

  const quickFacts = a.quickFacts.map((q) => `<div class="flex justify-between gap-4"><dt class="text-stone-600">${q[0]}</dt><dd class="font-semibold text-river text-right">${q[1]}</dd></div>`).join('\n');

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      orgNode(),
      {
        '@type': 'TouristAttraction',
        name: a.name,
        alternateName: [a.cnName],
        url: `${SITE.url}/${subdir}/${a.slug}.html`,
        description: a.glance.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
        image: [`${SITE.url}/images/${a.ogImage}.webp`],
        geo: { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng },
        address: { '@type': 'PostalAddress', addressLocality: 'Guilin', addressRegion: 'Guangxi', addressCountry: 'CN' },
        touristType: ['Foreign tourists', 'Nature lovers', 'Photographers'],
        openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '08:00', closes: '18:00' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: plural, item: `${SITE.url}/${subdir}/` },
          { '@type': 'ListItem', position: 3, name: a.name, item: `${SITE.url}/${subdir}/${a.slug}.html` },
        ],
      },
      {
        '@type': 'FAQPage',
        inLanguage: 'en',
        dateModified: BUILD_DATE,
        publisher: { '@id': ORG_ID },
        mainEntity: a.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') } })),
      },
      {
        '@type': 'HowTo',
        name: `${a.name} — ${a.routes[0].title}`,
        inLanguage: 'en',
        dateModified: BUILD_DATE,
        publisher: { '@id': ORG_ID },
        step: a.routes[0].steps.map((s) => ({ '@type': 'HowToStep', name: s.t, text: s.d })),
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${a.name} (${a.cnName}) — ${a.kicker} | ${SITE.name}</title>
  <meta name="description" content="${a.lead.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}">
  <meta name="theme-color" content="#0e4d64">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="canonical" href="${SITE.url}/${subdir}/${a.slug}.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${a.name} (${a.cnName}) — ${a.kicker}">
  <meta property="og:description" content="${a.lead.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}">
  <meta property="og:url" content="${SITE.url}/${subdir}/${a.slug}.html">
  <meta property="og:image" content="${SITE.url}/images/${a.ogImage}.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${a.name} (${a.cnName}) — ${a.kicker}">
  <meta name="twitter:description" content="${a.lead.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}">
  <meta name="twitter:image" content="${SITE.url}/images/${a.ogImage}.webp">
  <link rel="stylesheet" href="../tailwind.css">
  <link rel="preload" href="../fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <script>
    function openContactModal(e) {
      if (e) e.preventDefault();
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      m.classList.remove('hidden');
      requestAnimationFrame(function() { requestAnimationFrame(function() { p.style.transform = 'scale(1)'; p.style.opacity = '1'; }); });
      document.addEventListener('keydown', onEscKey);
      document.body.style.overflow = 'hidden';
    }
    function closeContactModal() {
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      p.style.transform = 'scale(.95)';
      p.style.opacity = '0';
      setTimeout(function() { m.classList.add('hidden'); document.body.style.overflow = ''; }, 250);
      document.removeEventListener('keydown', onEscKey);
    }
    function onEscKey(e) { if (e.key === 'Escape') closeContactModal(); }
  </script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .hero-bg { background-image: linear-gradient(to bottom, rgba(14,77,100,0.3) 0%, rgba(14,77,100,0.5) 50%, rgba(14,77,100,0.85) 100%), url('${heroImg}'); background-size: cover; background-position: center; }
    .card-hover { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease; }
    .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
    @media (min-width: 1024px) { .sidebar-sticky { position: sticky; top: 6rem; } }
    .bg-stone-100 { background-color: #f5f5f4; }
    .text-stone-600 { color: #78716c; }
    .hover\\:bg-stone-200:hover { background-color: #e7e5e4; }
    .hover\\:text-stone-700:hover { color: #44403c; }
    .gallery-item { overflow: hidden; border-radius: 0.75rem; }
    .gallery-item img { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .gallery-item:hover img { transform: scale(1.08); }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #c9a96e; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    html { scroll-padding-top: 80px; }
    section[id] { scroll-margin-top: 80px; }
    .nav-item { position: relative; }
    .dropdown-caret { transition: transform 0.25s ease; }
    .nav-item:hover .dropdown-caret { transform: rotate(180deg); }
    .mega-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(10px); background: #ffffff; border-radius: 0 0 1rem 1rem; box-shadow: 0 16px 48px rgba(0,0,0,0.14); padding: 2.25rem 2rem; opacity: 0; visibility: hidden; transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s; z-index: 60; }
    .nav-item:hover .mega-menu, .nav-item:focus-within .mega-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
    .mega-menu::before { content: ''; position: absolute; top: -14px; left: 0; right: 0; height: 14px; }
    .mega-col-title { color: #7a5f24; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.85rem; }
    .mega-link { display: flex; align-items: center; gap: 0.4rem; color: #3a3a3a; font-size: 0.9rem; padding: 0.32rem 0; transition: color 0.2s, padding-left 0.2s; }
    .mega-link:hover { color: #0e4d64; padding-left: 0.3rem; }
    .mega-link[aria-current="page"] { color: #0e4d64; font-weight: 700; }
    .mega-feature { border-radius: 0.85rem; overflow: hidden; position: relative; box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
    .mega-feature .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,77,100,0.85) 0%, rgba(14,77,100,0) 60%); }
    .compare-table { width: 100%; border-collapse: collapse; }
    .compare-table th, .compare-table td { text-align: left; padding: 0.9rem 1rem; border-bottom: 1px solid #e6e0d4; font-size: 0.92rem; }
    .compare-table thead th { background: #0e4d64; color: #fff; font-weight: 600; letter-spacing: 0.02em; }
    .compare-table tbody tr:nth-child(even) { background: #faf7f1; }
    .compare-table tbody tr:hover { background: #f0ece2; }
    .tip-item { display: flex; gap: 1rem; align-items: flex-start; padding: 1.25rem 0; border-bottom: 1px dashed #e6e0d4; }
    .tip-item:last-child { border-bottom: none; }
    .tip-icon { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; background: #0e4d64; display: flex; align-items: center; justify-content: center; }
    .highlight-img { width: 100%; height: 16rem; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .highlight-card:hover .highlight-img { transform: scale(1.05); }
    .route-step { position: relative; padding-left: 3rem; padding-bottom: 1.75rem; }
    .route-step:last-child { padding-bottom: 0; }
    .route-step::before { content: ''; position: absolute; left: 1.05rem; top: 2.1rem; bottom: -0.25rem; width: 2px; background: #e6e0d4; }
    .route-step:last-child::before { display: none; }
    .route-dot { position: absolute; left: 0; top: 0; width: 2.2rem; height: 2.2rem; border-radius: 50%; background: #0e4d64; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
    .facts-card { box-shadow: 0 12px 32px rgba(14,77,100,0.10); }
  </style>
</head>
<body class="bg-sand text-stone antialiased">
  ${nav(a.slug, pageType, './')}

  <!-- HERO -->
  <section id="hero" class="relative min-h-[78vh] flex items-end overflow-hidden">
    <img id="heroImg" src="${heroImg}" alt="${a.name} (${a.cnName}) — ${a.kicker}"
         fetchpriority="high" decoding="async"
         class="absolute inset-0 w-full h-full object-cover" style="transform:scale(1.12);" />
    <div class="absolute inset-0" style="background:linear-gradient(to bottom, rgba(14,77,100,0.35) 0%, rgba(14,77,100,0.45) 45%, rgba(14,77,100,0.85) 100%);"></div>
    <div class="relative z-10 w-full max-w-[1400px] mx-auto px-6 pb-14 pt-28 fade-in">
      <nav class="flex items-center gap-2 text-white/70 text-sm mb-5" aria-label="Breadcrumb">
        <a href="../" class="hover:text-white transition-colors">Home</a>
        <span class="text-white/40">/</span>
        <a href="../#${isExperience ? 'experience' : 'attraction'}" class="hover:text-white transition-colors">${plural}</a>
        <span class="text-white/40">/</span>
        <span class="text-white font-medium">${a.name}</span>
      </nav>
      <span class="inline-block bg-gold/90 text-river text-xs font-bold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full mb-4">${a.kicker}</span>
      <h1 class="font-display text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] mb-4">${a.name}</h1>
      <p class="text-xl md:text-2xl text-white/85 font-display italic mb-5">${a.tagline}</p>
      <p class="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">${a.lead}</p>
    </div>
  </section>

  <!-- TL;DR glance -->
  <section class="border-y border-sand-dark/60 bg-white/60">
    <div class="max-w-[1400px] mx-auto px-6 py-10 lg:py-12">
      <div class="flex items-start gap-4">
        <span class="shrink-0 mt-0.5 w-9 h-9 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center">${icon('sparkles', 'w-5 h-5')}</span>
        <div>
          <p class="text-gold-dark text-xs font-bold uppercase tracking-[0.2em] mb-2">At a glance</p>
          <p class="text-stone/85 text-base md:text-lg leading-relaxed max-w-3xl">${a.glance}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- MAIN two-column -->
  <div class="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
      <main class="lg:col-span-2 space-y-16">
        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-5">Why ${a.name} is worth your time</h2>
          <div class="space-y-4 text-stone/85 leading-relaxed text-base md:text-lg">${a.intro.map((p) => `<p>${p}</p>`).join('\n')}</div>
        </section>

        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-3">Top highlights</h2>
          <p class="text-stone-600 mb-8 max-w-2xl">The signature sights and experiences that make ${a.name} special.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${highlights}</div>
        </section>

        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-3">Which option is right for you?</h2>
          <p class="text-stone-600 mb-8 max-w-2xl">Ways to experience ${a.name}, from the classic route to a quicker highlight.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${routes}</div>
        </section>

        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-5">Best time to visit</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">${bestTime}</div>
        </section>

        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-2">Travel tips</h2>
          <div>${tips}</div>
        </section>

        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-5">How to get there</h2>
          <div class="bg-white rounded-2xl border border-sand-dark p-6 sm:p-8 space-y-0">${gettingThere}</div>
        </section>

        <section class="fade-in">
          <h2 class="font-display text-3xl md:text-4xl text-river mb-5">Tickets &amp; practical info</h2>
          <table class="compare-table bg-white rounded-2xl overflow-hidden">
            <thead><tr><th>Item</th><th>Detail</th></tr></thead>
            <tbody>${tickets}</tbody>
          </table>
          <p class="text-sm text-stone-600 mt-4">${a.ticketNote}</p>
        </section>
      </main>

      <aside class="lg:col-span-1">
        <div class="sidebar-sticky">
          <div class="facts-card bg-white rounded-2xl border border-sand-dark p-7 mb-5">
            <h3 class="font-display text-xl text-river mb-5 pb-4 border-b border-sand-dark">Quick facts</h3>
            <dl class="space-y-3.5 text-sm">${quickFacts}</dl>
            <button onclick="openContactModal(event)" class="mt-6 w-full bg-river hover:bg-river-light text-white font-semibold py-3.5 rounded-full transition-colors duration-300 flex items-center justify-center gap-2">
              ${icon('calendar-check', 'w-5 h-5')} Plan your visit
            </button>
            <a href="https://wa.me/${SITE.whatsapp}" target="_blank" class="mt-3 w-full bg-white border-2 border-river text-river hover:bg-river hover:text-white font-semibold py-3 rounded-full transition-colors duration-300 flex items-center justify-center gap-2">
              ${icon('message-circle', 'w-5 h-5')} WhatsApp us
            </a>
          </div>
          <div class="bg-river rounded-2xl p-7 text-white">
            <h4 class="font-display text-lg mb-2">Local tip</h4>
            <p class="text-white/75 text-sm leading-relaxed">${a.localTip}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <!-- GALLERY -->
  <section class="bg-sand-dark/40 py-16 lg:py-20 px-6">
    <div class="max-w-[1400px] mx-auto">
      <div class="text-center mb-10 fade-in">
        <p class="text-gold-dark text-xs font-bold uppercase tracking-[0.2em] mb-3">Gallery</p>
        <h2 class="font-display text-3xl md:text-4xl text-river">Scenery of ${a.name}</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">${gallery}</div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="py-16 lg:py-20 px-6 bg-sand-dark/30">
    <div class="max-w-[1400px] mx-auto">
      <div class="text-center mb-10 fade-in">
        <p class="text-gold-dark text-xs font-bold uppercase tracking-[0.2em] mb-3">Good to know</p>
        <h2 class="font-display text-3xl md:text-4xl text-river">Frequently asked questions</h2>
      </div>
      <div class="max-w-3xl mx-auto space-y-4">${faqs}</div>
    </div>
  </section>

  <!-- RELATED -->
  <section class="py-16 lg:py-20 px-6">
    <div class="max-w-[1400px] mx-auto">
      <div class="flex items-end justify-between mb-10 fade-in">
        <div>
          <p class="text-gold-dark text-xs font-bold uppercase tracking-[0.2em] mb-3">More to explore</p>
          <h2 class="font-display text-3xl md:text-4xl text-river">Related ${plural.toLowerCase()}</h2>
        </div>
        <a href="../#${isExperience ? 'experience' : 'attraction'}" class="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-river hover:text-gold-dark transition-colors">View all →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${related}</div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="relative bg-[#0c3c46] text-white/70 py-14 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <span class="text-2xl">🏞️</span>
            <span class="font-display text-xl text-white tracking-tight">${SITE.name}</span>
          </div>
          <p class="text-sm leading-relaxed text-white/70 pr-4">Your trusted local partner for exploring the Li River and Guilin's karst landscape.</p>
        </div>
        <div>
          <h4 class="text-white/90 font-semibold text-sm uppercase tracking-wider mb-5">Explore</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="../#attraction" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Attractions</a></li>
            <li><a href="../#experience" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Experiences</a></li>
            <li><a href="../#tour" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Tours &amp; Itineraries</a></li>
            <li><a href="../#hotel" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Hotels</a></li>
            <li><a href="../#food" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Local Food</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white/90 font-semibold text-sm uppercase tracking-wider mb-5">Contact</h4>
          <ul class="space-y-3 text-sm">
            <li>WhatsApp: +86 187 7735 8302</li>
            <li>Email: ${SITE.email}</li>
            <li>Reply within 24 hours</li>
          </ul>
        </div>
        <div>
          <h4 class="text-white/90 font-semibold text-sm uppercase tracking-wider mb-5">Why travelers trust us</h4>
          <ul class="space-y-3 text-sm text-white/80">
            <li class="flex items-start gap-2"><span class="text-gold mt-0.5" aria-hidden="true">&#10003;</span><span>Local Guilin team — we live here and keep these guides current.</span></li>
            <li class="flex items-start gap-2"><span class="text-gold mt-0.5" aria-hidden="true">&#10003;</span><span>Free custom itinerary — replies within 24 hours, no obligation.</span></li>
            <li class="flex items-start gap-2"><span class="text-gold mt-0.5" aria-hidden="true">&#10003;</span><span>Real, checked info — prices and routes verified regularly.</span></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
        <p>&copy; 2026 ${SITE.name}. All rights reserved. <a href="../credits.html" class="underline hover:text-gold ml-2">Image Credits</a> &middot; Updated ${UPDATED_LABEL}</p>
        <p>Li River Karst Landscape, Guilin, Guangxi, China</p>
      </div>
    </div>
  </footer>

  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    (function() {
      var hero = document.getElementById('hero');
      var heroImg = document.getElementById('heroImg');
      if (!hero || !heroImg) return;
      var ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(function() {
            var rect = hero.getBoundingClientRect();
            var vh = window.innerHeight;
            if (rect.bottom > 0 && rect.top < vh) {
              var progress = (vh - rect.top) / (vh + rect.height);
              var offset = (progress - 0.5) * 50;
              heroImg.style.transform = 'translateY(' + offset + 'px) scale(1.12)';
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    })();

    setTimeout(function() { document.querySelectorAll('#hero .fade-in').forEach((el) => el.classList.add('visible')); }, 200);
  </script>

  <!-- CONTACT MODAL -->
  <div id="contactModal" class="fixed inset-0 z-[100] hidden" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onclick="closeContactModal()"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center transform scale-95 opacity-0 transition-all duration-300 pointer-events-auto" id="contactModalPanel">
        <button onclick="closeContactModal()" aria-label="Close" class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 4l8 8M12 4L4 12"/></svg>
        </button>
        <div class="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
          ${icon('message-circle', 'w-6 h-6')}
        </div>
        <h3 id="modalTitle" class="font-display text-2xl text-slate-800 mb-2">Get in Touch</h3>
        <p class="text-slate-500 text-sm mb-8 leading-relaxed">We reply within 24 hours with a personalized itinerary — no obligation, no spam.</p>
        <a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 mb-3">
          ${icon('message-circle', 'w-5 h-5')} WhatsApp Us
        </a>
        <a href="mailto:${SITE.email}" class="flex items-center justify-center gap-3 w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5">Email us</a>
        <p class="mt-6 text-xs text-slate-400">&#10003; Free itinerary &nbsp; &#10003; No obligation &nbsp; &#10003; Reply within 24h</p>
      </div>
    </div>
  </div>

  <script type="application/ld+json">${JSON.stringify(jsonld, null, 2)}</script>
</body>
</html>`;
}

// ---- shared chrome for generated pages (guides reuse footer + contact modal) ----
const FOOTER_HTML = `
  <footer class="relative bg-[#0c3c46] text-white/70 py-14 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <span class="text-2xl">🏞️</span>
            <span class="font-display text-xl text-white tracking-tight">${SITE.name}</span>
          </div>
          <p class="text-sm leading-relaxed text-white/70 pr-4">Your trusted local partner for exploring the Li River and Guilin's karst landscape.</p>
        </div>
        <div>
          <h4 class="text-white/90 font-semibold text-sm uppercase tracking-wider mb-5">Explore</h4>
          <ul class="space-y-3 text-sm">
            <li><a href="../#attraction" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Attractions</a></li>
            <li><a href="../#experience" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Experiences</a></li>
            <li><a href="../#tour" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Tours &amp; Itineraries</a></li>
            <li><a href="/guides/index.html" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Travel Guides</a></li>
            <li><a href="../#hotel" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Hotels</a></li>
            <li><a href="../#food" class="hover:text-white hover:pl-1 transition-all duration-200 inline-block">Local Food</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white/90 font-semibold text-sm uppercase tracking-wider mb-5">Contact</h4>
          <ul class="space-y-3 text-sm">
            <li>WhatsApp: +86 187 7735 8302</li>
            <li>Email: ${SITE.email}</li>
            <li>Reply within 24 hours</li>
          </ul>
        </div>
        <div>
          <h4 class="text-white/90 font-semibold text-sm uppercase tracking-wider mb-5">Why travelers trust us</h4>
          <ul class="space-y-3 text-sm text-white/80">
            <li class="flex items-start gap-2"><span class="text-gold mt-0.5" aria-hidden="true">&#10003;</span><span>Local Guilin team — we live here and keep these guides current.</span></li>
            <li class="flex items-start gap-2"><span class="text-gold mt-0.5" aria-hidden="true">&#10003;</span><span>Free custom itinerary — replies within 24 hours, no obligation.</span></li>
            <li class="flex items-start gap-2"><span class="text-gold mt-0.5" aria-hidden="true">&#10003;</span><span>Real, checked info — prices and routes verified regularly.</span></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
        <p>&copy; 2026 ${SITE.name}. All rights reserved. <a href="../credits.html" class="underline hover:text-gold ml-2">Image Credits</a> &middot; Updated ${UPDATED_LABEL}</p>
        <p>Li River Karst Landscape, Guilin, Guangxi, China</p>
      </div>
    </div>
  </footer>`;

const CONTACT_MODAL_HTML = `
  <div id="contactModal" class="fixed inset-0 z-[100] hidden" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onclick="closeContactModal()"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center transform scale-95 opacity-0 transition-all duration-300 pointer-events-auto" id="contactModalPanel">
        <button onclick="closeContactModal()" aria-label="Close" class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-700 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 4l8 8M12 4L4 12"/></svg>
        </button>
        <div class="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
          ${icon('message-circle', 'w-6 h-6')}
        </div>
        <h3 id="modalTitle" class="font-display text-2xl text-slate-800 mb-2">Get in Touch</h3>
        <p class="text-slate-500 text-sm mb-8 leading-relaxed">We reply within 24 hours with a personalized itinerary — no obligation, no spam.</p>
        <a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 mb-3">
          ${icon('message-circle', 'w-5 h-5')} WhatsApp Us
        </a>
        <a href="mailto:${SITE.email}" class="flex items-center justify-center gap-3 w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5">Email us</a>
        <p class="mt-6 text-xs text-slate-400">&#10003; Free itinerary &nbsp; &#10003; No obligation &nbsp; &#10003; Reply within 24h</p>
      </div>
    </div>
  </div>`;

// ---- render hotel cards + 2nd-level category pages ----
const hotelCatLabel = { 'scenic-view': 'Scenic', 'selected': 'Curated', 'budget': 'Value' };

function renderHotelCard(h) {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${h.name} (${h.cnName}) for my Guilin trip.`)}`;
  const tags = h.category.map((c) => `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sand-dark text-river">${hotelCatLabel[c] || c}</span>`).join('');
  return `
        <article id="${h.slug}" class="group card-hover bg-white rounded-2xl overflow-hidden border border-sand-dark flex flex-col">
          <div class="overflow-hidden relative">
            <img loading="lazy" decoding="async" class="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" src="../images/${h.cardImg}.webp" alt="${h.name} (${h.cnName}) — ${h.regionLabel}">
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">${tags}</div>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-1">${h.regionLabel}</p>
            <h3 class="font-display text-xl text-river mb-1">${h.name}</h3>
            <p class="text-sm text-stone-600 mb-3">${h.cnName}</p>
            <p class="text-sm text-stone/80 leading-relaxed mb-4">${h.tagline}</p>
            <div class="mt-auto flex items-end justify-between gap-3">
              <div>
                <p class="text-xs text-stone-500">From</p>
                <p class="font-display text-lg text-river">¥${h.priceFrom}<span class="text-xs text-stone-500"> / night</span></p>
              </div>
              <a href="${wa}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-river hover:bg-river-light text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors shrink-0">WhatsApp</a>
            </div>
          </div>
        </article>`;
}

function renderHotelCategory(cat) {
  const isRegion = !!cat.regions;
  const faqs = cat.faqs.map((f) => `
          <div class="bg-white rounded-2xl border border-sand-dark p-6 md:p-7 fade-in">
            <h3 class="font-display text-lg md:text-xl text-river mb-2">${f.q}</h3>
            <p class="text-stone/80 leading-relaxed text-sm md:text-base">${f.a}</p>
          </div>`).join('\n');
  const relatedCats = hotelCategories.filter((c) => c.slug !== cat.slug).map((c) => `
          <a href="${c.slug}.html" class="card-hover group block bg-white rounded-2xl overflow-hidden border border-sand-dark">
            <div class="p-6">
              <p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-1">${c.cnName}</p>
              <h3 class="font-display text-lg text-river group-hover:text-gold-dark transition-colors">${c.name}</h3>
              <p class="text-sm text-stone-600 mt-1">${c.tagline}</p>
            </div>
          </a>`).join('\n');

  let bodyMain;
  if (isRegion) {
    bodyMain = cat.regions.map((r) => {
      const hs = r.hotelSlugs.map((s) => hotels.find((h) => h.slug === s)).filter(Boolean);
      if (!hs.length) {
        return `
        <section id="${r.slug}" class="mb-16 scroll-mt-24">
          <div class="flex items-baseline gap-3 mb-5">
            <h2 class="font-display text-2xl md:text-3xl text-river">${r.name}</h2>
            <span class="text-xs font-semibold text-gold-dark uppercase tracking-wide">${r.note}</span>
          </div>
          <div class="bg-white rounded-2xl border border-dashed border-sand-dark p-8 text-center">
            <p class="text-stone/70">Stays in this area are being added. <a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener noreferrer" class="text-river font-semibold underline">Tell us your dates</a> and we'll recommend options.</p>
          </div>
        </section>`;
      }
      return `
        <section id="${r.slug}" class="mb-16 scroll-mt-24">
          <div class="flex items-baseline gap-3 mb-5">
            <h2 class="font-display text-2xl md:text-3xl text-river">${r.name}</h2>
            <span class="text-xs font-semibold text-gold-dark uppercase tracking-wide">${r.note}</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${hs.map(renderHotelCard).join('\n')}
          </div>
        </section>`;
    }).join('\n');
  } else {
    const list = cat.hotelSlugs.map((s) => hotels.find((h) => h.slug === s)).filter(Boolean);
    bodyMain = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${list.map(renderHotelCard).join('\n')}</div>`;
  }

  const slugs = isRegion ? cat.regions.flatMap((r) => r.hotelSlugs) : cat.hotelSlugs;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      orgNode(),
      {
        '@type': 'CollectionPage',
        name: `${cat.name} — ${SITE.name}`,
        url: `${SITE.url}/hotels/${cat.slug}.html`,
        description: cat.intro.join(' ').replace(/<[^>]+>/g, ''),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: slugs.map((s, i) => {
            const h = hotels.find((x) => x.slug === s);
            return { '@type': 'ListItem', position: i + 1, name: h ? h.name : s, url: `${SITE.url}/hotels/${cat.slug}.html#${s}` };
          }),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Hotels', item: `${SITE.url}/hotels/` },
          { '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE.url}/hotels/${cat.slug}.html` },
        ],
      },
      {
        '@type': 'FAQPage',
        inLanguage: 'en',
        dateModified: BUILD_DATE,
        publisher: { '@id': ORG_ID },
        mainEntity: cat.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  const heroImg = `../images/${cat.heroImage}.webp`;
  const introHtml = cat.intro.map((p) => `<p class="text-stone/85 leading-relaxed mb-3">${p}</p>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cat.name} (${cat.cnName}) — Guilin Hotels | ${SITE.name}</title>
  <meta name="description" content="${cat.intro.join(' ').replace(/<[^>]+>/g, '').slice(0, 160)}">
  <meta name="theme-color" content="#0e4d64">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="canonical" href="${SITE.url}/hotels/${cat.slug}.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${cat.name} (${cat.cnName}) — Guilin Hotels">
  <meta property="og:description" content="${cat.tagline}">
  <meta property="og:url" content="${SITE.url}/hotels/${cat.slug}.html">
  <meta property="og:image" content="${SITE.url}/images/${cat.heroImage}.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${cat.name} (${cat.cnName}) — Guilin Hotels">
  <meta name="twitter:description" content="${cat.tagline}">
  <meta name="twitter:image" content="${SITE.url}/images/${cat.heroImage}.webp">
  <link rel="stylesheet" href="../tailwind.css">
  <link rel="preload" href="../fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <script>
    function openContactModal(e) {
      if (e) e.preventDefault();
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      m.classList.remove('hidden');
      requestAnimationFrame(function() { requestAnimationFrame(function() { p.style.transform = 'scale(1)'; p.style.opacity = '1'; }); });
      document.addEventListener('keydown', onEscKey);
      document.body.style.overflow = 'hidden';
    }
    function closeContactModal() {
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      p.style.transform = 'scale(.95)';
      p.style.opacity = '0';
      setTimeout(function() { m.classList.add('hidden'); document.body.style.overflow = ''; }, 250);
      document.removeEventListener('keydown', onEscKey);
    }
    function onEscKey(e) { if (e.key === 'Escape') closeContactModal(); }
    document.addEventListener('DOMContentLoaded', function() {
      var obs = new IntersectionObserver(function(es) {
        es.forEach(function(en) { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
      }, { threshold: 0.12 });
      document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });
    });
  </script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .hero-bg { background-image: linear-gradient(to bottom, rgba(14,77,100,0.3) 0%, rgba(14,77,100,0.5) 50%, rgba(14,77,100,0.85) 100%), url('${heroImg}'); background-size: cover; background-position: center; }
    .card-hover { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease; }
    .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
    .bg-stone-100 { background-color: #f5f5f4; }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #c9a96e; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    html { scroll-padding-top: 80px; }
    section[id] { scroll-margin-top: 80px; }
    .nav-item { position: relative; }
    .dropdown-caret { transition: transform 0.25s ease; }
    .nav-item:hover .dropdown-caret { transform: rotate(180deg); }
    .mega-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(10px); background: #ffffff; border-radius: 0 0 1rem 1rem; box-shadow: 0 16px 48px rgba(0,0,0,0.14); padding: 2.25rem 2rem; opacity: 0; visibility: hidden; transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s; z-index: 60; }
    .nav-item:hover .mega-menu, .nav-item:focus-within .mega-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
    .mega-menu::before { content: ''; position: absolute; top: -14px; left: 0; right: 0; height: 14px; }
    .mega-col-title { color: #7a5f24; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.85rem; }
    .mega-link { display: flex; align-items: center; gap: 0.4rem; color: #3a3a3a; font-size: 0.9rem; padding: 0.32rem 0; transition: color 0.2s, padding-left 0.2s; }
    .mega-link:hover { color: #0e4d64; padding-left: 0.3rem; }
    .mega-link[aria-current="page"] { color: #0e4d64; font-weight: 700; }
    .mega-feature { border-radius: 0.85rem; overflow: hidden; position: relative; box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
    .mega-feature .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,77,100,0.85) 0%, rgba(14,77,100,0) 60%); }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body class="bg-sand text-stone antialiased">
  ${nav(cat.slug, 'hotel', '../')}

  <!-- HERO -->
  <section id="hero" class="relative min-h-[64vh] flex items-end overflow-hidden">
    <img id="heroImg" src="${heroImg}" alt="${cat.name} (${cat.cnName}) — Guilin"
         fetchpriority="high" decoding="async"
         class="absolute inset-0 w-full h-full object-cover" style="transform:scale(1.1);" />
    <div class="absolute inset-0" style="background:linear-gradient(to bottom, rgba(14,77,100,0.35) 0%, rgba(14,77,100,0.45) 45%, rgba(14,77,100,0.85) 100%);"></div>
    <div class="relative z-10 w-full max-w-[1400px] mx-auto px-6 pb-12 pt-28 fade-in">
      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide mb-3">Guilin Hotels</p>
      <h1 class="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">${cat.name}</h1>
      <p class="text-white/85 text-lg md:text-xl max-w-2xl leading-relaxed">${cat.tagline}</p>
    </div>
  </section>

  <!-- INTRO -->
  <section class="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
    <div class="max-w-3xl">
      <h2 class="font-display text-2xl md:text-3xl text-river mb-5">About these stays</h2>
      <div class="text-base">${introHtml}</div>
    </div>
  </section>

  <!-- MAIN LIST -->
  <section class="max-w-[1400px] mx-auto px-6 pb-16">
    ${bodyMain}
  </section>

  <!-- FAQ -->
  <section class="max-w-[1400px] mx-auto px-6 pb-16">
    <h2 class="font-display text-2xl md:text-3xl text-river mb-6">Frequently asked questions</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      ${faqs}
    </div>
  </section>

  <!-- RELATED CATEGORIES -->
  <section class="max-w-[1400px] mx-auto px-6 pb-20">
    <h2 class="font-display text-2xl md:text-3xl text-river mb-6">Other ways to browse hotels</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${relatedCats}
    </div>
  </section>

  ${FOOTER_HTML}
  ${CONTACT_MODAL_HTML}
</body>
</html>`;
}


// ---- render restaurant + dish cards + food category pages ----
function renderRestaurantCard(r) {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${r.name} (${r.cnName}) in Guilin — can you help me find / book it?`)}`;
  const tags = `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sand-dark text-river">${r.cuisine}</span>`;
  const mustTry = (r.mustTry && r.mustTry.length) ? `<p class="text-xs text-stone-500 mt-2">Must try: ${r.mustTry.join(' · ')}</p>` : '';
  return `
        <article id="${r.slug}" class="group card-hover bg-white rounded-2xl overflow-hidden border border-sand-dark flex flex-col">
          <div class="overflow-hidden relative">
            <img loading="lazy" decoding="async" class="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" src="../images/${r.cardImg}.webp" alt="${r.name} (${r.cnName}) — ${r.cuisine} in ${r.regionLabel}">
          </div>
          <div class="p-6 flex flex-col flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-1">${r.regionLabel}</p>
            <h3 class="font-display text-xl text-river mb-1">${r.name}</h3>
            <p class="text-sm text-stone-600 mb-3">${r.cnName}</p>
            <div class="mb-3">${tags}</div>
            <p class="text-sm text-stone/80 leading-relaxed mb-1">${r.tagline}</p>
            ${mustTry}
            <div class="mt-auto flex items-end justify-between gap-3 pt-4">
              <div>
                <p class="text-xs text-stone-500">Avg / person</p>
                <p class="font-display text-lg text-river">¥${r.avgPrice}<span class="text-xs text-stone-500"> ${r.priceTier}</span></p>
              </div>
              <a href="${wa}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-river hover:bg-river-light text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors shrink-0">WhatsApp</a>
            </div>
          </div>
        </article>`;
}

function renderDishCard(d) {
  return `
        <article class="group card-hover bg-white rounded-2xl overflow-hidden border border-sand-dark flex flex-col">
          <div class="overflow-hidden relative">
            <img loading="lazy" decoding="async" class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" src="../images/${d.img}.webp" alt="${d.name} (${d.cnName}) — Guilin dish">
          </div>
          <div class="p-6 flex flex-col flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-1">${d.cnName}</p>
            <h3 class="font-display text-xl text-river mb-2">${d.name}</h3>
            <p class="text-sm text-stone/80 leading-relaxed mb-3">${d.desc}</p>
            <p class="text-xs text-stone-500 mt-auto">${d.where}</p>
          </div>
        </article>`;
}

function renderFoodCategory(cat) {
  const isDishes = !!cat.isDishes;
  const faqs = cat.faqs.map((f) => `
          <div class="bg-white rounded-2xl border border-sand-dark p-6 md:p-7 fade-in">
            <h3 class="font-display text-lg md:text-xl text-river mb-2">${f.q}</h3>
            <p class="text-stone/80 leading-relaxed text-sm md:text-base">${f.a}</p>
          </div>`).join('\n');
  const relatedCats = foodCategories.filter((c) => c.slug !== cat.slug).map((c) => `
          <a href="${c.slug}.html" class="card-hover group block bg-white rounded-2xl overflow-hidden border border-sand-dark">
            <div class="p-6">
              <p class="text-xs font-semibold uppercase tracking-wide text-gold-dark mb-1">${c.cnName}</p>
              <h3 class="font-display text-lg text-river group-hover:text-gold-dark transition-colors">${c.name}</h3>
              <p class="text-sm text-stone-600 mt-1">${c.tagline}</p>
            </div>
          </a>`).join('\n');

  let bodyMain;
  if (isDishes) {
    const dishes = cat.dishSlugs.map((s) => dishList.find((d) => d.slug === s)).filter(Boolean);
    bodyMain = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${dishes.map(renderDishCard).join('\n')}</div>`;
  } else {
    const list = cat.restaurantSlugs.map((s) => restaurants.find((r) => r.slug === s)).filter(Boolean);
    bodyMain = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${list.map(renderRestaurantCard).join('\n')}</div>`;
  }

  const slugs = isDishes ? cat.dishSlugs : cat.restaurantSlugs;
  const namesForList = isDishes
    ? cat.dishSlugs.map((s) => { const d = dishList.find((x) => x.slug === s); return d ? d.name : s; })
    : cat.restaurantSlugs.map((s) => { const r = restaurants.find((x) => x.slug === s); return r ? r.name : s; });

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      orgNode(),
      {
        '@type': 'CollectionPage',
        name: `${cat.name} — ${SITE.name}`,
        url: `${SITE.url}/food/${cat.slug}.html`,
        description: cat.intro.join(' ').replace(/<[^>]+>/g, ''),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: slugs.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: namesForList[i], url: `${SITE.url}/food/${cat.slug}.html#${s}` })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Food', item: `${SITE.url}/food/` },
          { '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE.url}/food/${cat.slug}.html` },
        ],
      },
      {
        '@type': 'FAQPage',
        inLanguage: 'en',
        dateModified: BUILD_DATE,
        publisher: { '@id': ORG_ID },
        mainEntity: cat.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  const heroImg = `../images/${cat.heroImage}.webp`;
  const introHtml = cat.intro.map((p) => `<p class="text-stone/85 leading-relaxed mb-3">${p}</p>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cat.name} (${cat.cnName}) — Guilin Food | ${SITE.name}</title>
  <meta name="description" content="${cat.intro.join(' ').replace(/<[^>]+>/g, '').slice(0, 160)}">
  <meta name="theme-color" content="#0e4d64">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="canonical" href="${SITE.url}/food/${cat.slug}.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${cat.name} (${cat.cnName}) — Guilin Food">
  <meta property="og:description" content="${cat.tagline}">
  <meta property="og:url" content="${SITE.url}/food/${cat.slug}.html">
  <meta property="og:image" content="${SITE.url}/images/${cat.heroImage}.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${cat.name} (${cat.cnName}) — Guilin Food">
  <meta name="twitter:description" content="${cat.tagline}">
  <meta name="twitter:image" content="${SITE.url}/images/${cat.heroImage}.webp">
  <link rel="stylesheet" href="../tailwind.css">
  <link rel="preload" href="../fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <script>
    function openContactModal(e) {
      if (e) e.preventDefault();
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      m.classList.remove('hidden');
      requestAnimationFrame(function() { requestAnimationFrame(function() { p.style.transform = 'scale(1)'; p.style.opacity = '1'; }); });
      document.addEventListener('keydown', onEscKey);
      document.body.style.overflow = 'hidden';
    }
    function closeContactModal() {
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      p.style.transform = 'scale(.95)';
      p.style.opacity = '0';
      setTimeout(function() { m.classList.add('hidden'); document.body.style.overflow = ''; }, 250);
      document.removeEventListener('keydown', onEscKey);
    }
    function onEscKey(e) { if (e.key === 'Escape') closeContactModal(); }
    document.addEventListener('DOMContentLoaded', function() {
      var obs = new IntersectionObserver(function(es) {
        es.forEach(function(en) { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
      }, { threshold: 0.12 });
      document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });
    });
  </script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .hero-bg { background-image: linear-gradient(to bottom, rgba(14,77,100,0.3) 0%, rgba(14,77,100,0.5) 50%, rgba(14,77,100,0.85) 100%), url('${heroImg}'); background-size: cover; background-position: center; }
    .card-hover { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease; }
    .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
    .bg-stone-100 { background-color: #f5f5f4; }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #c9a96e; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    html { scroll-padding-top: 80px; }
    section[id] { scroll-margin-top: 80px; }
    .nav-item { position: relative; }
    .dropdown-caret { transition: transform 0.25s ease; }
    .nav-item:hover .dropdown-caret { transform: rotate(180deg); }
    .mega-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(10px); background: #ffffff; border-radius: 0 0 1rem 1rem; box-shadow: 0 16px 48px rgba(0,0,0,0.14); padding: 2.25rem 2rem; opacity: 0; visibility: hidden; transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s; z-index: 60; }
    .nav-item:hover .mega-menu, .nav-item:focus-within .mega-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
    .mega-menu::before { content: ''; position: absolute; top: -14px; left: 0; right: 0; height: 14px; }
    .mega-col-title { color: #7a5f24; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.85rem; }
    .mega-link { display: flex; align-items: center; gap: 0.4rem; color: #3a3a3a; font-size: 0.9rem; padding: 0.32rem 0; transition: color 0.2s, padding-left 0.2s; }
    .mega-link:hover { color: #0e4d64; padding-left: 0.3rem; }
    .mega-link[aria-current="page"] { color: #0e4d64; font-weight: 700; }
    .mega-feature { border-radius: 0.85rem; overflow: hidden; position: relative; box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
    .mega-feature .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,77,100,0.85) 0%, rgba(14,77,100,0) 60%); }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body class="bg-sand text-stone antialiased">
  ${nav(cat.slug, 'food', '../')}

  <!-- HERO -->
  <section id="hero" class="relative min-h-[64vh] flex items-end overflow-hidden">
    <img id="heroImg" src="${heroImg}" alt="${cat.name} (${cat.cnName}) — Guilin Food"
         fetchpriority="high" decoding="async"
         class="absolute inset-0 w-full h-full object-cover" style="transform:scale(1.1);" />
    <div class="absolute inset-0" style="background:linear-gradient(to bottom, rgba(14,77,100,0.35) 0%, rgba(14,77,100,0.45) 45%, rgba(14,77,100,0.85) 100%);"></div>
    <div class="relative z-10 w-full max-w-[1400px] mx-auto px-6 pb-12 pt-28 fade-in">
      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide mb-3">Guilin Food</p>
      <h1 class="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">${cat.name}</h1>
      <p class="text-white/85 text-lg md:text-xl max-w-2xl leading-relaxed">${cat.tagline}</p>
    </div>
  </section>

  <!-- INTRO -->
  <section class="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
    <div class="max-w-3xl">
      <h2 class="font-display text-2xl md:text-3xl text-river mb-5">${isDishes ? 'About Guilin food' : 'About this collection'}</h2>
      <div class="text-base">${introHtml}</div>
    </div>
  </section>

  <!-- MAIN LIST -->
  <section class="max-w-[1400px] mx-auto px-6 pb-16">
    ${bodyMain}
  </section>

  <!-- FAQ -->
  <section class="max-w-[1400px] mx-auto px-6 pb-16">
    <h2 class="font-display text-2xl md:text-3xl text-river mb-6">Frequently asked questions</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      ${faqs}
    </div>
  </section>

  <!-- RELATED CATEGORIES -->
  <section class="max-w-[1400px] mx-auto px-6 pb-20">
    <h2 class="font-display text-2xl md:text-3xl text-river mb-6">Other ways to browse food</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${relatedCats}
    </div>
  </section>

  ${FOOTER_HTML}
  ${CONTACT_MODAL_HTML}
</body>
</html>`;
}

// ---- render a single guide article page ----
function renderBlock(b) {
  switch (b.type) {
    case 'p': return `      <p class="guide-p">${b.text}</p>`;
    case 'h2': return `      <h2 class="guide-h2">${b.text}</h2>`;
    case 'h3': return `      <h3 class="guide-h3">${b.text}</h3>`;
    case 'ul': return `      <ul class="guide-ul">${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    case 'ol': return `      <ol class="guide-ol">${b.items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
    case 'quote': return `      <blockquote class="guide-quote">${b.text}${b.cite ? `<cite>— ${b.cite}</cite>` : ''}</blockquote>`;
    case 'callout': return `      <div class="guide-callout"><p class="guide-callout-title">${b.title}</p><p>${b.text}</p></div>`;
    case 'image': return `      <figure class="guide-figure"><img loading="lazy" decoding="async" src="../images/${b.img}.webp" alt="${b.alt}"><figcaption>${b.caption}</figcaption></figure>`;
    default: return '';
  }
}

function renderGuide(g) {
  const heroImg = `../images/${g.coverImage}.webp`;
  const body = g.blocks.map(renderBlock).join('\n');
  const tags = (g.tags || []).map((t) => `<span class="guide-tag">${t}</span>`).join(' ');
  const rel = g.relatedAttraction ? attractions.find((a) => a.slug === g.relatedAttraction) : null;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      orgNode(),
      {
        '@type': 'BlogPosting',
        headline: g.title,
        description: g.excerpt,
        image: [`${SITE.url}/images/${g.coverImage}.webp`],
        datePublished: g.date,
        dateModified: g.updated || g.date,
        inLanguage: 'en',
        author: { '@type': 'Organization', name: g.author || SITE.name },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/guides/${g.slug}.html` },
      },
    ],
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${g.title} | ${SITE.name}</title>
  <meta name="description" content="${g.excerpt}">
  <meta name="theme-color" content="#0e4d64">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="canonical" href="${SITE.url}/guides/${g.slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${g.title}">
  <meta property="og:description" content="${g.excerpt}">
  <meta property="og:url" content="${SITE.url}/guides/${g.slug}.html">
  <meta property="og:image" content="${SITE.url}/images/${g.coverImage}.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${g.title}">
  <meta name="twitter:description" content="${g.excerpt}">
  <meta name="twitter:image" content="${SITE.url}/images/${g.coverImage}.webp">
  <link rel="stylesheet" href="../tailwind.css">
  <link rel="preload" href="../fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <script>
    function openContactModal(e) {
      if (e) e.preventDefault();
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      m.classList.remove('hidden');
      requestAnimationFrame(function() { requestAnimationFrame(function() { p.style.transform = 'scale(1)'; p.style.opacity = '1'; }); });
      document.addEventListener('keydown', onEscKey);
      document.body.style.overflow = 'hidden';
    }
    function closeContactModal() {
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      p.style.transform = 'scale(.95)';
      p.style.opacity = '0';
      setTimeout(function() { m.classList.add('hidden'); document.body.style.overflow = ''; }, 250);
      document.removeEventListener('keydown', onEscKey);
    }
    function onEscKey(e) { if (e.key === 'Escape') closeContactModal(); }
  </script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .guide-hero { background-image: linear-gradient(to bottom, rgba(14,77,100,0.55) 0%, rgba(14,77,100,0.82) 100%), url('${heroImg}'); background-size: cover; background-position: center; }
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #c9a96e; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    html { scroll-padding-top: 80px; }
    section[id] { scroll-margin-top: 80px; }
    .nav-item { position: relative; }
    .card-hover { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease; }
    .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .guide-article { max-width: 46rem; margin: 0 auto; }
    .guide-p { color: #57534e; line-height: 1.85; margin: 1.25rem 0; font-size: 1.05rem; }
    .guide-h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.9rem; color: #0e4d64; margin: 2.75rem 0 1rem; line-height: 1.25; }
    .guide-h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; color: #0e4d64; margin: 2rem 0 0.75rem; }
    .guide-ul, .guide-ol { margin: 1.25rem 0; padding-left: 1.4rem; color: #57534e; line-height: 1.85; font-size: 1.02rem; }
    .guide-ul { list-style: disc; } .guide-ol { list-style: decimal; }
    .guide-ul li, .guide-ol li { margin: 0.5rem 0; }
    .guide-ul li::marker, .guide-ol li::marker { color: #c9a96e; }
    .guide-quote { border-left: 4px solid #c9a96e; background: #faf7f1; padding: 1.25rem 1.5rem; margin: 1.75rem 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.2rem; color: #0e4d64; font-style: italic; }
    .guide-quote cite { display: block; margin-top: 0.75rem; font-size: 0.9rem; font-style: normal; color: #57534e; font-family: 'Inter', sans-serif; }
    .guide-callout { background: linear-gradient(135deg, #0e4d64 0%, #15607e 100%); color: #fff; border-radius: 1rem; padding: 1.5rem 1.75rem; margin: 1.75rem 0; }
    .guide-callout-title { font-weight: 700; margin-bottom: 0.5rem; color: #f4d9a0; font-size: 1.05rem; }
    .guide-callout p { color: rgba(255,255,255,0.85); line-height: 1.7; font-size: 0.98rem; }
    .guide-callout a { color: #f4d9a0; font-weight: 600; text-decoration: underline; }
    .guide-figure { margin: 2rem 0; }
    .guide-figure img { width: 100%; border-radius: 0.75rem; }
    .guide-figure figcaption { text-align: center; font-size: 0.88rem; color: #57534e; margin-top: 0.6rem; }
    .guide-tag { display: inline-block; background: #f4f1ea; color: #7a5f24; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.7rem; border-radius: 999px; margin: 0.2rem 0.3rem 0.2rem 0; }
  </style>
</head>
<body class="bg-sand text-stone antialiased">
  ${nav(g.slug, 'guide')}

  <article>
    <header class="guide-hero relative min-h-[52vh] flex items-end overflow-hidden">
      <div class="relative z-10 w-full max-w-[1400px] mx-auto px-6 pb-12 pt-28 fade-in">
        <nav class="flex items-center gap-2 text-white/70 text-sm mb-5" aria-label="Breadcrumb">
          <a href="../" class="hover:text-white transition-colors">Home</a>
          <span class="text-white/40">/</span>
          <a href="/guides/index.html" class="hover:text-white transition-colors">Guides</a>
          <span class="text-white/40">/</span>
          <span class="text-white font-medium">${g.title}</span>
        </nav>
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-[1.08] mb-4 max-w-4xl">${g.title}</h1>
        <div class="flex flex-wrap items-center gap-3 text-white/80 text-sm">
          <span>${g.date}</span><span class="text-white/40">·</span>
          <span>${g.readingTime}</span><span class="text-white/40">·</span>
          <span>${g.author}</span>
        </div>
        <div class="mt-4">${tags}</div>
      </div>
    </header>

    <div class="max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
      <div class="guide-article fade-in">
${body}
      </div>

      ${rel ? `<div class="guide-article mt-12 fade-in">
        <div class="bg-white rounded-2xl border border-sand-dark p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5">
          <img loading="lazy" decoding="async" src="../images/${rel.heroImage}.webp" alt="${rel.name}" class="w-full sm:w-40 h-32 object-cover rounded-xl">
          <div class="text-center sm:text-left">
            <p class="text-gold-dark text-xs font-bold uppercase tracking-[0.2em] mb-1">Related attraction</p>
            <h3 class="font-display text-xl text-river mb-1">${rel.name}</h3>
            <p class="text-sm text-stone-600 mb-3">${rel.kicker}</p>
            <a href="../attractions/${rel.slug}.html" class="inline-flex items-center gap-1 text-sm font-semibold text-river hover:text-gold-dark transition-colors">Read the guide →</a>
          </div>
        </div>
      </div>` : ''}

      <div class="guide-article mt-8 fade-in">
        <a href="/guides/index.html" class="inline-flex items-center gap-1 text-sm font-semibold text-river hover:text-gold-dark transition-colors">← All travel guides</a>
      </div>
    </div>
  </article>

  ${FOOTER_HTML}
  ${CONTACT_MODAL_HTML}
  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    setTimeout(function() { document.querySelectorAll('.guide-hero .fade-in').forEach((el) => el.classList.add('visible')); }, 200);
  </script>
  <script type="application/ld+json">${JSON.stringify(jsonld, null, 2)}</script>
</body>
</html>`;
}

// ---- render the guides index (list) page ----
function renderGuideIndex() {
  const cards = guides.map((g) => `
        <a href="./${g.slug}.html" class="card-hover group block bg-white rounded-2xl overflow-hidden border border-sand-dark">
          <div class="overflow-hidden"><img loading="lazy" decoding="async" class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" src="../images/${g.coverImage}.webp" alt="${g.title}"></div>
          <div class="p-6">
            <p class="text-gold-dark text-xs font-bold uppercase tracking-[0.15em] mb-2">${g.date} · ${g.readingTime}</p>
            <h3 class="font-display text-xl text-river mb-2 leading-snug">${g.title}</h3>
            <p class="text-sm text-stone-600 leading-relaxed mb-4">${g.excerpt}</p>
            <div>${(g.tags || []).map((t) => `<span class="guide-tag">${t}</span>`).join(' ')}</div>
          </div>
        </a>`).join('\n');
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.title, url: `${SITE.url}/guides/${g.slug}.html` })),
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guilin Travel Guides | ${SITE.name}</title>
  <meta name="description" content="Practical Guilin travel guides by a local team — itineraries, the Li River cruise, best time to visit, Yangshuo vs Guilin, Longji terraces, and what to eat.">
  <meta name="theme-color" content="#0e4d64">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="canonical" href="${SITE.url}/guides/index.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="Guilin Travel Guides">
  <meta property="og:description" content="Practical Guilin travel guides by a local team — itineraries, the Li River cruise, best time to visit, and more.">
  <meta property="og:url" content="${SITE.url}/guides/index.html">
  <meta property="og:image" content="${SITE.url}/images/hero-liriver.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Guilin Travel Guides">
  <meta name="twitter:description" content="Practical Guilin travel guides by a local team.">
  <meta name="twitter:image" content="${SITE.url}/images/hero-liriver.webp">
  <link rel="stylesheet" href="../tailwind.css">
  <link rel="preload" href="../fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <script>
    function openContactModal(e) {
      if (e) e.preventDefault();
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      m.classList.remove('hidden');
      requestAnimationFrame(function() { requestAnimationFrame(function() { p.style.transform = 'scale(1)'; p.style.opacity = '1'; }); });
      document.addEventListener('keydown', onEscKey);
      document.body.style.overflow = 'hidden';
    }
    function closeContactModal() {
      var m = document.getElementById('contactModal');
      var p = document.getElementById('contactModalPanel');
      if (!m || !p) return;
      p.style.transform = 'scale(.95)';
      p.style.opacity = '0';
      setTimeout(function() { m.classList.add('hidden'); document.body.style.overflow = ''; }, 250);
      document.removeEventListener('keydown', onEscKey);
    }
    function onEscKey(e) { if (e.key === 'Escape') closeContactModal(); }
  </script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
    .nav-link { position: relative; }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #c9a96e; transition: width 0.3s ease; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    html { scroll-padding-top: 80px; }
    section[id] { scroll-margin-top: 80px; }
    .nav-item { position: relative; }
    .card-hover { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease; }
    .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .guide-tag { display: inline-block; background: #f4f1ea; color: #7a5f24; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.7rem; border-radius: 999px; margin: 0.2rem 0.3rem 0.2rem 0; }
  </style>
</head>
<body class="bg-sand text-stone antialiased">
  ${nav('guides', 'guide')}

  <section class="relative bg-river text-white py-20 lg:py-28 px-6">
    <div class="max-w-[1400px] mx-auto">
      <p class="text-gold-light text-xs font-bold uppercase tracking-[0.2em] mb-3">Travel Guides</p>
      <h1 class="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.08] mb-4">Plan your Guilin trip like a local</h1>
      <p class="text-white/80 text-lg max-w-2xl leading-relaxed">Practical, no-fluff guides written by our Guilin team — itineraries, the Li River cruise, the best time to visit, and what to eat. Every guide links to a real place you can book.</p>
    </div>
  </section>

  <section class="py-16 lg:py-20 px-6">
    <div class="max-w-[1400px] mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
${cards}
      </div>
    </div>
  </section>

  ${FOOTER_HTML}
  ${CONTACT_MODAL_HTML}
  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  </script>
  <script type="application/ld+json">${JSON.stringify(jsonld, null, 2)}</script>
</body>
</html>`;
}

// ---- validate all referenced images exist before writing ----
const referenced = new Set();
for (const a of attractions) {
  referenced.add(a.heroImage);
  a.highlights.forEach((h) => referenced.add(h.img));
  a.gallery.forEach((g) => referenced.add(g.img));
  a.related.forEach((r) => referenced.add(r.img));
}
for (const g of guides) {
  referenced.add(g.coverImage);
  (g.blocks || []).forEach((b) => { if (b.type === 'image' && b.img) referenced.add(b.img); });
}
for (const e of experiences) {
  referenced.add(e.heroImage);
  e.highlights.forEach((h) => referenced.add(h.img));
  e.gallery.forEach((g) => referenced.add(g.img));
  e.related.forEach((r) => referenced.add(r.img));
}
const missing = [...referenced].filter((n) => !imgExists(n));
if (missing.length) {
  console.error('✗ Missing images referenced in data: ' + missing.join(', '));
  process.exit(1);
}

// ---- generate ----
fs.mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
for (const a of attractions) {
  const html = renderPage(a);
  fs.writeFileSync(path.join(OUT_DIR, a.slug + '.html'), html, 'utf8');
  count++;
  console.log('✓ wrote attractions/' + a.slug + '.html (' + (html.length / 1024).toFixed(1) + ' KB)');
}
const GUIDE_DIR = path.join(ROOT, 'guides');
fs.mkdirSync(GUIDE_DIR, { recursive: true });
let gcount = 0;
for (const g of guides) {
  const html = renderGuide(g);
  fs.writeFileSync(path.join(GUIDE_DIR, g.slug + '.html'), html, 'utf8');
  gcount++;
  console.log('✓ wrote guides/' + g.slug + '.html (' + (html.length / 1024).toFixed(1) + ' KB)');
}
const gidx = renderGuideIndex();
fs.writeFileSync(path.join(GUIDE_DIR, 'index.html'), gidx, 'utf8');
console.log('✓ wrote guides/index.html (' + (gidx.length / 1024).toFixed(1) + ' KB)');

// ---- experiences ----
const EXP_DIR = path.join(ROOT, 'experiences');
fs.mkdirSync(EXP_DIR, { recursive: true });
let ecount = 0;
for (const e of experiences) {
  const html = renderPage(e, 'experience');
  fs.writeFileSync(path.join(EXP_DIR, e.slug + '.html'), html, 'utf8');
  ecount++;
  console.log('✓ wrote experiences/' + e.slug + '.html (' + (html.length / 1024).toFixed(1) + ' KB)');
}
console.log(`\nDone — ${count} attraction pages + ${gcount} guide pages + ${ecount} experience pages generated.`);

// ---- hotels (2nd-level category pages) ----
const HOTELS_DIR = path.join(ROOT, 'hotels');
fs.mkdirSync(HOTELS_DIR, { recursive: true });
let hcount = 0;
for (const c of hotelCategories) {
  const html = renderHotelCategory(c);
  fs.writeFileSync(path.join(HOTELS_DIR, c.slug + '.html'), html, 'utf8');
  hcount++;
  console.log('✓ wrote hotels/' + c.slug + '.html (' + (html.length / 1024).toFixed(1) + ' KB)');
}
console.log(`✓ ${hcount} hotel category pages generated.`);

// ---- food (2nd-level category pages) ----
const FOOD_DIR = path.join(ROOT, 'food');
fs.mkdirSync(FOOD_DIR, { recursive: true });
let fcount = 0;
for (const c of foodCategories) {
  const html = renderFoodCategory(c);
  fs.writeFileSync(path.join(FOOD_DIR, c.slug + '.html'), html, 'utf8');
  fcount++;
  console.log('✓ wrote food/' + c.slug + '.html (' + (html.length / 1024).toFixed(1) + ' KB)');
}
console.log(`✓ ${fcount} food category pages generated.`);

// ---- sitemap.xml + robots.txt (single source of truth: SITE + attractions) ----
function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const IMG_NS = 'http://www.google.com/schemas/sitemap-image/1.1';
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Per-URL image list with dedupe + on-disk existence check (no broken sitemap URLs).
  const urlFor = (a) => {
    const seen = new Set();
    const imgs = [];
    const add = (name, title) => {
      if (!name || seen.has(name)) return;
      if (!fs.existsSync(path.join(IMG_DIR, name + '.webp'))) return;
      seen.add(name);
      imgs.push(`\n    <image:image>\n      <image:loc>${SITE.url}/images/${name}.webp</image:loc>\n      <image:title>${esc(title)}</image:title>\n    </image:image>`);
    };
    add(a.heroImage, `${a.name} — hero`);
    (a.gallery || []).forEach((g) => add(g.img, g.alt || g.title || g.sub));
    return `  <url>\n    <loc>${SITE.url}/attractions/${a.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>${imgs.join('')}\n  </url>`;
  };
  const urlForGuide = (g) => `  <url>\n    <loc>${SITE.url}/guides/${g.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  const urlForExperience = (e) => {
    const seen = new Set();
    const imgs = [];
    const add = (name, title) => {
      if (!name || seen.has(name)) return;
      if (!fs.existsSync(path.join(IMG_DIR, name + '.webp'))) return;
      seen.add(name);
      imgs.push(`\n    <image:image>\n      <image:loc>${SITE.url}/images/${name}.webp</image:loc>\n      <image:title>${esc(title)}</image:title>\n    </image:image>`);
    };
    add(e.heroImage, `${e.name} - hero`);
    (e.gallery || []).forEach((g) => add(g.img, g.alt || g.title || g.sub));
    return `  <url>\n    <loc>${SITE.url}/experiences/${e.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>${imgs.join('')}\n  </url>`;
  };
  const pages = [
    `  <url>\n    <loc>${SITE.url}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...attractions.map(urlFor),
    `  <url>\n    <loc>${SITE.url}/guides/index.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ...guides.map(urlForGuide),
    ...experiences.map(urlForExperience),
    ...hotelCategories.map((c) => `  <url>\n    <loc>${SITE.url}/hotels/${c.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`),
    ...foodCategories.map((c) => `  <url>\n    <loc>${SITE.url}/food/${c.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`),
    `  <url>\n    <loc>${SITE.url}/credits.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>`,
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="${IMG_NS}">\n${pages.join('\n')}\n</urlset>\n`;
}
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(), 'utf8');
console.log(`✓ wrote sitemap.xml (${attractions.length + guides.length + experiences.length + hotelCategories.length + 3} URLs + image entries)`);

// ---- IndexNow key file (auto-recover if missing; enables instant Bing/ChatGPT/Perplexity discovery) ----
// IndexNow requires the key file to be served at https://{host}/{key}.txt (key is the filename),
// so we keep indexnow-key.txt as the local source-of-truth and also emit {key}.txt for verification.
const INDEXNOW_KEY = path.join(ROOT, 'indexnow-key.txt');
if (!fs.existsSync(INDEXNOW_KEY)) {
  const key = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  fs.writeFileSync(INDEXNOW_KEY, key, 'utf8');
  console.log('✓ (re)generated indexnow-key.txt');
}
const indexNowKey = fs.readFileSync(INDEXNOW_KEY, 'utf8').trim();
fs.writeFileSync(path.join(ROOT, `${indexNowKey}.txt`), indexNowKey, 'utf8');

// Disallow build/test artifacts + the (empty) admin area; guide crawlers to the canonical host.
// AI training/search crawlers are explicitly allowed so LLMs can read and recommend the site.
const robots = `User-agent: *
Allow: /

# Build / test artifacts and admin area — not for public indexing
Disallow: /tests/
Disallow: /scripts/
Disallow: /src/
Disallow: /admin/

# AI crawlers explicitly allowed (GEO: let LLMs read & recommend the site)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Bytespider
Allow: /

Host: myguilin.com

Sitemap: ${SITE.url}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');
console.log('✓ wrote robots.txt');

// ---- llms.txt (GEO: a curated map of the site for LLMs) ----
function buildLlmsTxt() {
  const clean = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const oneLiner = (a) => {
    const kicker = clean(a.kicker);
    if (kicker && kicker.length >= 12) return kicker;
    const lead = clean(a.lead);
    let first = lead.split(/(?<=\.)\s/)[0] || lead;
    if (first.length > 160) first = first.slice(0, 160).replace(/\s+\S*$/, '') + '…';
    return first;
  };
  const destLines = attractions
    .map((a) => `- [${a.name} (${a.cnName || ''})](${SITE.url}/attractions/${a.slug}.html): ${oneLiner(a)}`)
    .join('\n');
  const guideLines = guides.map((g) => `- [${g.title}](${SITE.url}/guides/${g.slug}.html): ${clean(g.excerpt).slice(0, 150)}`).join('\n');
  const expLines = experiences
    .map((e) => `- [${e.name} (${e.cnName || ''})](${SITE.url}/experiences/${e.slug}.html): ${oneLiner(e)}`)
    .join('\n');
  const hotelLines = hotelCategories
    .map((c) => `- [${c.name} (${c.cnName || ''})](${SITE.url}/hotels/${c.slug}.html): ${clean(c.tagline)}`)
    .join('\n');
  const foodLines = foodCategories
    .map((c) => `- [${c.name} (${c.cnName || ''})](${SITE.url}/food/${c.slug}.html): ${clean(c.tagline)}`)
    .join('\n');
  return `# ${SITE.name} — Guilin Travel Guide & Private Tours for International Travelers

> Last updated: ${UPDATED_LABEL}

> ${SITE.name} is an English-language travel guide and private-tour service for international visitors to Guilin, China. It covers the Li River cruise, karst limestone peaks, Longji rice terraces, Reed Flute Cave, Yulong River bamboo rafting, Elephant Trunk Hill, the Sun & Moon Pagodas, and Xingping ancient town — with practical planning info: best time to visit, how to get there, tickets, suggested routes, and FAQs. Content is written and reviewed by a local Guilin team, and prices/routes are checked regularly.

## Top destinations

${destLines}

## Travel guides (in-depth planning)

${guideLines}

## Experiences (hands-on activities)

${expLines}

## Hotels (where to stay)

${hotelLines}

## Food (where to eat)

${foodLines}

## Plan your trip

Each destination page includes: best time to visit, how to get there, ticket prices, suggested routes, and a frequently-asked-questions section.

## About & contact

${SITE.name} is a Guilin-based travel service for international travelers.

- Email: ${SITE.email}
- WhatsApp: +${SITE.whatsapp}
- Website: ${SITE.url}/

When citing ${SITE.name}, link to the specific destination page above.
`;
}
fs.writeFileSync(path.join(ROOT, 'llms.txt'), buildLlmsTxt(), 'utf8');
console.log('✓ wrote llms.txt');
