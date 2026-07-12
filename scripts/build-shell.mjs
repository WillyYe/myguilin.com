// scripts/build-shell.mjs
// Renders the site shell (navbar + homepage hero) from site-config.json and
// injects it into index.html between marker comments.
// Run:  node scripts/build-shell.mjs
// Idempotent: re-running regenerates identical markup from the same config.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'site-config.json');
const INDEX = path.join(ROOT, 'index.html');

const site = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));

// ---------------------------------------------------------------------------
// Desktop navbar
// ---------------------------------------------------------------------------
function renderNavItem(item) {
  if (item.type === 'link') {
    return `          <li class="nav-item h-full flex items-center">
            <a href="${item.href}" class="nav-link text-sm font-semibold text-stone hover:text-river px-4 h-full flex items-center">${item.label}</a>
          </li>`;
  }
  if (item.type === 'button') {
    return `          <li class="nav-item h-full flex items-center"><button type="button" onclick="${item.action}" class="nav-link bg-transparent border-0 cursor-pointer text-sm font-semibold text-river hover:bg-river hover:text-white px-4 h-full flex items-center rounded-full transition-colors">${item.label}</button></li>`;
  }
  if (item.type === 'mega') {
    return `          <li class="nav-item h-full flex items-center">
            <a href="${item.href}" class="nav-link text-sm font-semibold text-stone hover:text-river px-4 h-full flex items-center gap-1">
              ${item.label}
              <svg class="dropdown-caret" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="mega-menu" style="width:${item.mega.width}px;">
${renderMegaSections(item.mega.sections)}
            </div>
          </li>`;
  }
  return '';
}

function flattenMegaLinks(sections) {
  const out = [];
  for (const s of sections) {
    if (s.type === 'grid-links') {
      for (const col of s.columns) {
        if (col.feature) out.push({ href: col.feature.href, label: col.feature.label, feature: true });
        for (const l of col.links || []) out.push({ href: l.href, label: l.label });
      }
    } else if (s.type === 'features' || s.type === 'links-grid') {
      for (const it of s.items) out.push({ href: it.href, label: it.label });
    } else if (s.type === 'footer-link') {
      out.push({ href: s.href, label: s.label });
    } else if (s.type === 'footer-section') {
      for (const l of s.links) out.push({ href: l.href, label: l.label });
    }
  }
  return out;
}

function renderMegaSections(sections) {
  return sections.map((s, i) => renderSection(s, i === 0)).join('\n');
}

function renderSection(s, isFirst) {
  const spacer = isFirst ? '' : 'mt-4 ';
  if (s.type === 'grid-links') {
    const cols = s.columns.map((col) => {
      let inner = '';
      if (col.title) inner += `                  <p class="mega-col-title">${col.title}</p>\n`;
      if (col.feature) {
        const f = col.feature;
        inner += `                  <a href="${f.href}" class="mega-feature block mb-3">
                    <picture><source srcset="${f.img}" type="image/webp"><img src="${f.imgFallback}" alt="${f.alt}" class="h-28 w-full object-cover" loading="lazy" decoding="async"></picture>
                    <div class="overlay"></div>
                    <span class="absolute bottom-2 left-3 text-white text-sm font-semibold">${f.label}</span>
                  </a>\n`;
      }
      inner += (col.links || []).map((l) => `                  <a href="${l.href}" class="mega-link${l.cls ? ' ' + l.cls : ''}">${l.label}</a>`).join('\n');
      return `                <div>
${inner}                </div>`;
    }).join('\n');
    return `              <div class="${spacer}${s.gridClass}">
${cols}
              </div>`;
  }
  if (s.type === 'features') {
    const items = s.items.map((it) => `                <div>
                  <a href="${it.href}" class="mega-feature block">
                    <picture><source srcset="${it.img}" type="image/webp"><img src="${it.imgFallback}" alt="${it.alt}" class="h-28 w-full object-cover" loading="lazy" decoding="async"></picture>
                    <div class="overlay"></div>
                    <span class="absolute bottom-2 left-3 text-white text-xs font-semibold leading-tight">${it.label}</span>
                  </a>
                </div>`).join('');
    return `              <div class="${spacer}grid grid-cols-${s.cols} gap-4">
${items}
              </div>`;
  }
  if (s.type === 'links-grid') {
    const cls = `${spacer}grid grid-cols-${s.cols} gap-4${s.center ? ' text-center' : ''}`;
    const items = s.items.map((it) => `                <a href="${it.href}" class="text-xs text-stone-600 hover:text-river">${it.label}</a>`).join('\n');
    return `              <div class="${cls}">
${items}
              </div>`;
  }
  if (s.type === 'footer-link') {
    return `              <div class="mt-4 pt-4 border-t border-sand-dark">
                <a href="${s.href}" class="inline-flex items-center gap-1 text-sm font-semibold text-river hover:text-gold-dark transition-colors">
                  ${s.label}
                </a>
              </div>`;
  }
  if (s.type === 'footer-section') {
    const links = s.links.map((l) => `                  <a href="${l.href}" class="mega-link">${l.label}</a>`).join('\n');
    return `              <div class="mt-4 pt-4 border-t border-sand-dark">
                <span class="mega-col-title">${s.title}</span>
                <div class="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
${links}
                </div>
              </div>`;
  }
  return '';
}

function renderDesktopNav() {
  const items = site.nav.map(renderNavItem).join('\n');
  return `        <ul class="flex items-center h-full">
${items}
        </ul>`;
}

// ---------------------------------------------------------------------------
// Mobile navbar (derived from the same nav data)
// ---------------------------------------------------------------------------
function renderMobileNav() {
  const parts = [];
  let n = 0;
  for (const item of site.nav) {
    n++;
    if (item.type === 'link') {
      parts.push(`      <a href="${item.href}" class="block text-stone font-semibold py-2">${n}. ${item.label}</a>`);
    } else if (item.type === 'button') {
      parts.push(`      <button type="button" onclick="${item.action}; document.getElementById('mobile-menu').classList.add('hidden')" class="block w-full text-left bg-transparent border-0 cursor-pointer text-river font-semibold py-2 pt-3 border-t border-sand-dark mt-2">${n}. ${item.label}</button>`);
    } else if (item.type === 'mega') {
      parts.push(`      <p class="text-gold-dark text-xs font-bold uppercase tracking-wide pt-3 pb-1">${n}. ${item.label}</p>`);
      for (const l of flattenMegaLinks(item.mega.sections)) {
        const cls = l.feature ? 'block text-river font-bold py-1 pl-3 text-sm' : 'block text-stone/80 py-1 pl-3 text-sm';
        parts.push(`      <a href="${l.href}" class="${cls}">${l.label}</a>`);
      }
    }
  }
  parts.push(`      <a href="${site.cta.href}" target="_blank" class="block text-center bg-river text-white font-semibold py-2.5 rounded-full mt-3">${site.cta.label} Us</a>`);
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Homepage hero
// ---------------------------------------------------------------------------
function renderHero() {
  const h = site.hero;
  const img = h.image;
  return `    <picture>
      <source type="image/avif" srcset="${img.avif.join(', ')}">
      <source type="image/webp" srcset="${img.webp.join(', ')}">
      <img src="${img.fallback}" alt="${img.alt}" class="absolute inset-0 w-full h-full object-cover" fetchpriority="high" decoding="async">
    </picture>
    <div class="absolute inset-0" style="background-image: linear-gradient(to bottom, rgba(14,77,100,0.3) 0%, rgba(14,77,100,0.5) 50%, rgba(14,77,100,0.85) 100%);"></div>
    <div class="text-center px-6 max-w-4xl relative z-10">
      <p class="text-gold text-sm font-medium tracking-[0.3em] uppercase mb-6 fade-in">${h.eyebrow}</p>
      <h1 class="font-display text-5xl md:text-7xl text-white leading-tight mb-8 fade-in">
        ${h.titleHtml}
      </h1>
      <p class="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-10 fade-in">
        ${h.subtitle}
      </p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Inject into index.html between markers
// ---------------------------------------------------------------------------
function inject(html, startMarker, endMarker, content) {
  const re = new RegExp(escapeRegExp(startMarker) + '([\\s\\S]*?)' + escapeRegExp(endMarker));
  if (!re.test(html)) {
    console.warn(`⚠️  marker not found, skipping: ${startMarker}`);
    return html;
  }
  return html.replace(re, `${startMarker}\n${content}\n      ${endMarker}`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  let html = fs.readFileSync(INDEX, 'utf8');
  html = inject(html, '<!-- SITE_NAV_DESKTOP_START -->', '<!-- SITE_NAV_DESKTOP_END -->', renderDesktopNav());
  html = inject(html, '<!-- SITE_NAV_MOBILE_START -->', '<!-- SITE_NAV_MOBILE_END -->', renderMobileNav());
  html = inject(html, '<!-- SITE_HERO_START -->', '<!-- SITE_HERO_END -->', renderHero());
  fs.writeFileSync(INDEX, html);
  console.log('✅ index.html shell regenerated from site-config.json');
}

main();
