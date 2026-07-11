// build-pages.mjs
// Static-site generator for the interior pages of the dubaipipes.com redesign.
// Wraps a per-page <main> fragment (in src-pages/<slug>.html) with the shared
// <head> + header + mobile nav + CTA band + footer + scripts (the "chrome").
//
// The home page (public/index.html) is hand-authored and NOT regenerated.
// The contact page (public/contact-us/index.html) is hand-authored (map + form)
// and NOT regenerated. Everything else is generated here.
//
// Usage:  node scripts/build-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src-pages');
const OUT = join(ROOT, 'public');

const FAVICON = '/assets/images/favicon.png';
const DEFAULT_OG = '/assets/images/home/ccfb5d9d36.jpg';

const PAGES = []; // Demo 2: interior pages are restricted — menu links 404 to public/404.html.

function nav() {
  return `    <nav class="primary-nav" aria-label="Primary">
      <div class="primary-nav__item">
        <button class="primary-nav__toggle" aria-expanded="false" aria-haspopup="true">Products <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <ul class="primary-nav__menu">
          <li><a href="/grp-pipes-benefits/">GRP Pipes Benefits</a></li>
          <li><a href="/grp-pipes-general-information/">GRP Pipes General Information</a></li>
          <li><a href="/grp-pipe-installation/">GRP Pipe Installation</a></li>
          <li><a href="/product-testing/">Product Testing</a></li>
        </ul>
      </div>
      <div class="primary-nav__item"><a class="primary-nav__link" href="/certifications-approvals/">Certifications</a></div>
      <div class="primary-nav__item"><a class="primary-nav__link" href="/know-how-supplier/">Know-How Supplier</a></div>
      <div class="primary-nav__item"><a class="primary-nav__link" href="/services/">Services</a></div>
      <div class="primary-nav__item"><a class="primary-nav__link" href="/download-catalog/">Download Catalog</a></div>
    </nav>`;
}

const HEADER = `<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="Dubai Pipes Factory Co. - home">
      <img class="brand__logo" src="/assets/images/logo.png" alt="Dubai Pipes Factory Co." width="992" height="266">
    </a>
${nav()}
    <div class="header-actions">
      <div class="lang-picker">
        <button class="lang-picker__btn" aria-haspopup="true" aria-expanded="false" aria-label="Language">
          <img class="lang-picker__flag" src="/assets/images/flag-us.svg" alt="US" width="20" height="14"><span class="lang-picker__label">EN</span>
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <ul class="lang-picker__menu">
          <li><button data-code="EN" data-flag="us"><img src="/assets/images/flag-us.svg" alt="US flag" width="20" height="14"> EN - English</button></li>
          <li><button data-code="AR" data-flag="ae"><img src="/assets/images/flag-ae.svg" alt="UAE flag" width="20" height="14"> AR - العربية</button></li>
        </ul>
      </div>
      <a class="btn btn--primary" href="/contact-us/" data-magnetic>Request a Quote →</a>
      <button class="nav-toggle" aria-expanded="false" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;

const MOBILE_NAV = `<aside class="mobile-nav" aria-label="Mobile">
  <button class="mobile-nav__close" aria-label="Close menu">×</button>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/grp-pipes-benefits/">Products</a>
      <ul class="mobile-sub">
        <li><a href="/grp-pipes-benefits/">GRP Pipes Benefits</a></li>
        <li><a href="/grp-pipes-general-information/">General Information</a></li>
        <li><a href="/grp-pipe-installation/">GRP Pipe Installation</a></li>
        <li><a href="/product-testing/">Product Testing</a></li>
      </ul>
    </li>
    <li><a href="/certifications-approvals/">Certifications</a></li>
    <li><a href="/know-how-supplier/">Know-How Supplier</a></li>
    <li><a href="/services/">Services</a></li>
    <li><a href="/download-catalog/">Download Catalog</a></li>
    <li><a href="/contact-us/">Contact</a></li>
  </ul>
  <div class="mobile-nav__cta">
    <a class="btn btn--primary btn--block" href="/contact-us/">Request a Quote →</a>
    <a class="btn btn--ghost btn--block" href="tel:+97148851333">Call +971 4 885 1333</a>
  </div>
</aside>`;

const CTA = `<section class="cta-band">
  <div class="container cta-band__inner">
    <div>
      <h2>Specifying a GRP pipeline?</h2>
      <p>Get a quote or talk to our engineering team about diameters, pressure ratings and installation method.</p>
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <a class="btn btn--ghost btn--lg" href="/contact-us/">Request a Quote</a>
      <a class="btn btn--primary btn--lg" href="tel:+97148851333">Call +971 4 885 1333</a>
    </div>
  </div>
</section>`;

const FOOTER = `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col footer-contact">
        <a class="brand" href="/" style="margin-bottom:1rem">
          <img class="brand__logo" src="/assets/images/logo.png" alt="Dubai Pipes Factory Co." width="992" height="266" style="height:52px">
        </a>
        <p>Dubai Pipes Factory Co.<br>Jebel Ali Industrial Area<br>inside Dubai Investments Park<br>Dubai, UAE · P.O. Box 32902</p>
        <p><a href="tel:+97148851333">+971 4 885 1333</a><br><a href="mailto:info@dubaipipes.com">info@dubaipipes.com</a></p>
      </div>
      <div class="footer-col"><h4>Products</h4><ul><li><a href="/grp-pipes-benefits/">GRP Pipes Benefits</a></li><li><a href="/grp-pipes-general-information/">General Information</a></li><li><a href="/grp-pipe-installation/">Pipe Installation</a></li><li><a href="/product-testing/">Product Testing</a></li></ul></div>
      <div class="footer-col"><h4>Company</h4><ul><li><a href="/certifications-approvals/">Certifications</a></li><li><a href="/know-how-supplier/">Know-How Supplier</a></li><li><a href="/services/">Services</a></li><li><a href="/contact-us/">Contact</a></li></ul></div>
      <div class="footer-col"><h4>Resources</h4><ul><li><a href="/download-catalog/">Download Catalog</a></li><li><a href="/blog/">Blog</a></li><li><a href="/projects/">Projects</a></li><li><a href="/contact-us/">Request a Quote</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© 2011–2026 Dubai Pipes Factory Co. All Rights Reserved.</span><span>Jebel Ali Industrial Area · Dubai · UAE</span></div>
  </div>
</footer>

<button class="to-top" aria-label="Back to top">↑</button>
__SCRIPTS__
</body>
</html>`;

// Demo 2 motion layer: GSAP + ScrollTrigger + Lenis load (defer) after
// script.js; demo2-motion.js (core) wires them and lazy-injects three.min.js +
// demo2-webgl.js only when WebGL is worth initializing (capable desktop, motion
// allowed). This keeps the ~600KB Three.js payload off mobile/low-power first paint.
const DEMO2_SCRIPTS = [
  '/assets/vendor/gsap/gsap.min.js',
  '/assets/vendor/gsap/ScrollTrigger.min.js',
  '/assets/vendor/lenis/lenis.min.js',
  '/assets/js/demo2-motion.js',
];

function scriptsTag(page) {
  // Data files load (defer) before script.js so their window globals exist
  // when script.js's IIFE runs.
  const data = page.dataScripts || [];
  return [...data, '/assets/js/script.js', ...DEMO2_SCRIPTS]
    .map((s) => `<script src="${s}" defer></script>`)
    .join('\n');
}

function jsonldBlock(obj, slug) {
  const base = { '@context': 'https://schema.org' };
  const merged = { ...base, ...obj };
  if (!merged.url) merged.url = 'https://dubaipipes.com/' + slug + '/';
  if (!merged.name && obj['@type'] !== 'TechArticle') merged.name = 'Dubai Pipes Factory Co.';
  if (!merged.telephone) merged.telephone = '+97148851333';
  return '  <script type="application/ld+json">\n  ' + JSON.stringify(merged) + '\n  </script>';
}

function render(page) {
  const fragment = readFileSync(join(SRC, page.slug + '.html'), 'utf8').trim();
  const canonical = 'https://dubaipipes.com/' + page.slug + '/';
  const ogImage = 'https://dubaipipes.com' + (page.ogImage || DEFAULT_OG);
  // DEMO2_BOOT runs before any CSS paints so the .demo2 root class is present
  // for gated styles and so script.js can branch on it. Inline + first in head.
  const head = [
    `  <script>document.documentElement.classList.add("demo2")</script>`,
    `  <title>${page.title}</title>`,
    `  <meta name="description" content="${page.desc.replace(/"/g, '&quot;')}">`,
    `  <link rel="canonical" href="${canonical}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:title" content="${page.title.replace(/"/g, '&quot;')}">`,
    `  <meta property="og:description" content="${page.desc.replace(/"/g, '&quot;')}">`,
    `  <meta property="og:url" content="${canonical}">`,
    `  <meta property="og:image" content="${ogImage}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <link rel="icon" type="image/png" href="${FAVICON}">`,
    `  <link rel="stylesheet" href="/assets/css/fonts.css?v=6">`,
    `  <link rel="stylesheet" href="/assets/css/styles.css?v=7">`,
    `  <link rel="stylesheet" href="/assets/css/demo2.css?v=13">`,
    page.leaflet ? `  <link rel="stylesheet" href="/assets/vendor/leaflet/leaflet.css">` : null,
    jsonldBlock(page.jsonld || { '@type': 'WebPage' }, page.slug),
  ].filter(Boolean).join('\n  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${head}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>

${HEADER}

${MOBILE_NAV}

<main id="main">
${fragment}
</main>

${CTA}

${FOOTER.replace('__SCRIPTS__', scriptsTag(page))}
`;
}

let count = 0;
for (const page of PAGES) {
  const outDir = join(OUT, page.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), render(page), 'utf8');
  count++;
}
console.log('Generated ' + count + ' pages into public/.');
