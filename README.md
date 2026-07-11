# Dubai Pipes Factory Co. - Redesign (Demo 1)

A polished, conversion-optimized static rebuild of dubaipipes.com. Industrial-authority
design: dark navy + burnt orange, precision-grid layout, engineering credibility.

Demo 2 (premium scroll animations) is planned **after** Demo 1 is signed off - no
Demo 2 code here yet. See `PLAN.md`.

## Quick start

```bash
npm run dev      # serve public/ at http://localhost:5173
npm run build    # regenerate interior pages from src-pages/ fragments
npm run localize # re-extract images from the SingleFile captures (rarely needed)
```

No dependencies to install - the dev server and build scripts are vanilla Node.js
(≥ 18). Open `http://localhost:5173`.

## Project structure

```
public/                      ← the deployable static site (Vercel outputDirectory)
  index.html                 ← home (hand-authored)
  contact-us/index.html      ← hand-authored (Leaflet map + quote form)
  <slug>/index.html          ← 10 interior pages (generated, see below)
  assets/
    css/fonts.css            ← @font-face for vendored Barlow Condensed + Inter
    css/styles.css           ← single shared stylesheet + :root design tokens
    js/script.js             ← nav, scroll-reveal, lightbox, map, form, CMS render
    js/products-data.js      ← drives the spec table (edit here)
    js/blog-data.js          ← drives /blog/ cards (empty by default)
    js/projects-data.js      ← drives /projects/ cards (empty by default)
    fonts/                   ← vendored woff2 (no Google Fonts CDN)
    vendor/leaflet/          ← vendored Leaflet JS/CSS/markers (no CDN)
    images/<slug>/           ← extracted from the original SingleFile captures
    docs/                    ← catalog PDF + location map PDF (placeholders)

src-pages/                   ← <main> fragments, one per interior page
scripts/
  build-pages.mjs            ← wraps fragments with shared chrome → public/<slug>/
  serve.mjs                  ← zero-dep static dev server (clean URLs)
  localize-assets.mjs        ← extracts base64 images from captures → public/assets/images
  make-placeholder-pdf.mjs   ← generates the stand-in PDF docs
  dump-text.mjs              ← dev helper: strips base64 from a capture for reading
  url-map.json               ← manifest of localized images (dims/bytes per page)

docs/
  audit.md                   ← Phase 1 audit (palette, content, SEO, conversion)
  content-skeleton.md        ← Phase 2 clean copy + image-role map per page
PLAN.md                      ← full redesign plan (phases 0–10, Demo 2 outline)
```

## How pages are built

- **Home** and **Contact** are hand-authored HTML (they have unique layouts: hero
  stat band, and the map + form respectively).
- The other 10 interior pages are **generated** by `scripts/build-pages.mjs`: each
  page's `<main>` lives as a fragment in `src-pages/<slug>.html`, and the generator
  wraps it with the shared `<head>` (SEO meta + JSON-LD), header, mobile nav, CTA
  band, and footer. This keeps the chrome identical across pages without a build
  step at deploy time - the generated HTML is committed to `public/`.
- To edit an interior page's content, edit `src-pages/<slug>.html` and re-run
  `npm run build`. To change the shared header/footer/CTA for all interior pages,
  edit `scripts/build-pages.mjs` and re-run `npm run build`.

## Design tokens

Defined as CSS custom properties at the top of `public/assets/css/styles.css`:

```
--navy #0D1B2A   --primary #C95C1A   --accent #E07B3F   --gold #B8860B
Barlow Condensed (display) + Inter (body)   radii 4–6px
```

## CMS integration path (Phase 11, post-decision)

The demos stay fully static. Three files are scaffolded for a clean, contained CMS
wiring later - each has an integration note at the top:

- **Blog** (`/blog/`) - cards render from `assets/js/blog-data.js`.
- **Projects** (`/projects/`) - cards render from `assets/js/projects-data.js`.
- **Product specs** (`/grp-pipes-general-information/`) - the spec table renders
  from `assets/js/products-data.js`.

Planned CMS: **Decap CMS** - admin at `/admin/`, posts as Markdown in Git, Vercel
rebuild on save. Client never touches code.

## Forms backend

The contact form (`/contact-us/`) currently has `action=""` and a JS fake-success
state. The integration point is marked in `public/assets/js/script.js` and in the
form markup - wire a form service or Vercel serverless function there.

## Deploy

Vercel - `vercel.json` is configured with `outputDirectory: public`, `cleanUrls: true`,
long-cache headers for `/assets/`, and `buildCommand: node scripts/build-pages.mjs`
(so a fresh build runs on every deploy). Push to the default branch to deploy.

## Notes & honest gaps

- **Images** were localized from the original SingleFile captures by
  `scripts/localize-assets.mjs`. Roles (hero, gallery, cert badges, etc.) were
  assigned by **dimensions + DOM context**, not by visual inspection - the build
  agent that produced this cannot view images. Swap any image file in
  `public/assets/images/` to refine.
- **Catalog & location-map PDFs** are generated placeholders
  (`public/assets/docs/`). Replace with the official assets before going live.
- **Project record & ITP `.xls`** from the source site were not embedded in the
  captures, so they are offered as "available on request" CTAs rather than dead
  download links.
- **Zero external CDN asset refs**: all CSS/JS/fonts/images are vendored locally.
  The only external runtime call is OpenStreetMap map tiles (loaded by Leaflet at
  runtime on the contact page) and the intentional outbound link to flowtite.com.
