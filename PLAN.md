# Dubai Pipes Factory Co. - Redesign Plan

## Overview

Redesign dubaipipes.com as a two-tier deliverable:
- **Demo 1** - polished, conversion-optimized static site (Renue-tier quality, $4–6K)
- **Demo 2** - Demo 1 duplicated as scaffold, then layered with premium scroll animations and Framer-like transitions ($15–20K)

All planning and alignment is complete. This document covers Demo 1 in full. Demo 2 begins only after Demo 1 is fully polished and approved.

---

## Project context

- **Source:** 10-page hand-rolled HTML site, circa 2011–12, table-based, zero SEO, zero CTAs, no mobile support
- **Goal:** Static rebuild matching the Renue Systems methodology - same phases (0–10), distinct design, conversion-optimized
- **Reference exemplar:** `C:\Users\prajw\OneDrive\Desktop\Pictures\random-project-1\public\`
- **Working directory:** `C:\Users\prajw\Documents\random-project-3\`
- **Source HTML captures:** `All dubaipipes.com pages\` (10 SingleFile saves)
- **Deploy:** Vercel, `outputDirectory: public`, `cleanUrls: true`

---

## Design direction (Demo 1)

**Industrial authority** - dark navy + burnt orange, precision-grid layout, engineering credibility.

- `--navy: #0D1B2A` (near-black navy, dominant)
- `--primary: #C95C1A` (burnt orange, brand-locked from logo)
- `--accent: #E07B3F` (light orange hover/highlight)
- `--gold: #B8860B` (~10% geography accent - Gulf brass fittings reference)
- `--bg: #FFFFFF` | `--bg-alt: #F4F6F9` | `--text: #1A1A2E` | `--text-muted: #6B7280`
- **Type pairing:** `Barlow Condensed` (display headlines - industrial weight) + `Inter` (body - clean technical reading)
- **Radius:** tight `6px` / `4px` - engineered precision, not soft/rounded
- **Hero:** full-bleed facility/pipe photo, dark navy overlay, bold white headline + 2 CTAs

---

## Page inventory (10 pages → 10 clean-URL equivalents)

| Source URL | New clean URL | Page |
|---|---|---|
| `/` | `/` | Home |
| `/contact.html` | `/contact-us/` | Contact & Location |
| `/certificationsandapprovals.html` | `/certifications-approvals/` | Certifications & Approvals |
| `/grpinstallation.html` | `/grp-pipe-installation/` | GRP Pipe Installation |
| `/grpbenefits.html` | `/grp-pipes-benefits/` | GRP Pipes Benefits |
| `/general.html` | `/grp-pipes-general-information/` | GRP Pipes General Information |
| `/knowhowsupplier.html` | `/know-how-supplier/` | Know-How Supplier |
| `/producttesting.html` | `/product-testing/` | Product Testing |
| `/download.html` | `/download-catalog/` | Download Catalog |
| `/services.html` | `/services/` | Services |

Plus 2 new CMS scaffold pages (see CMS section below):

| New page | Clean URL |
|---|---|
| Blog | `/blog/` |
| Projects / Case Studies | `/projects/` |

---

## Nav structure

```
[Logo]   Products▾   Certifications   Know-How Supplier   Services   Download Catalog   [EN | AR]   [Request a Quote →]
                |
                ├── GRP Pipes Benefits
                ├── GRP Pipes General Info
                ├── GRP Pipe Installation
                └── Product Testing
```

Mobile: hamburger → full-screen overlay with `tel:` link + CTA button.

---

## Key features (Demo 1)

- **Interactive Leaflet map** on Contact page - Jebel Ali Industrial Area marker with info card (vendored locally)
- **Contact / Quote form** - full HTML scaffold (name, company, project type, message, phone); no backend wired yet, `action=""` placeholder with a comment marking the integration point
- **Downloadable PDF catalog** - localized asset under `public/assets/docs/`
- **Scroll-reveal** - `IntersectionObserver`, fast transition (200ms), early trigger (`rootMargin: "0px 0px -80px 0px"`)
- **Image gallery + lightbox** - facility/product photos; scoped selector (not global) to avoid capturing unrelated elements
- **Certifications logo strip / carousel** - BSI Kitemark, ISO 9001, ISO 14001, AWWA, ASTM, BS EN badges
- **Language picker** - EN / AR flag chip dropdown (UI only, no i18n engine wired; AR does nothing for now)
- **Every phone number** as `tel:+97148851333`, every email as `mailto:info@dubaipipes.com`

---

## Phases to execute

- **Phase 0** - confirm source page list from `All dubaipipes.com pages\` SingleFile saves; enumerate all embedded image/asset data URLs
- **Phase 1** - write the audit note (palette from logo, content gaps, SEO diagnosis, conversion diagnosis) before any CSS
- **Phase 2** - extract clean copy from each page into a content skeleton (no fabricated stats)
- **Phase 3** - asset localization script (`scripts/localize-assets.mjs`) extracts base64 data URIs from SingleFile saves → writes real files to `public/assets/`; `rewrite-refs.mjs` updates HTML refs
- **Phase 4** - `public/assets/css/styles.css` with `:root` tokens above; one shared stylesheet
- **Phase 5** - shared header + footer + `script.js` (nav, scroll-reveal, lightbox, carousel, map, form)
- **Phase 6** - 12 page templates (`public/index.html`, `public/contact-us/index.html`, etc.)
- **Phase 7** - per-page SEO: unique `<title>`, `<meta description>`, canonical, OG tags, JSON-LD (`LocalBusiness` + `ProfessionalService` on home)
- **Phase 8** - CTA pass: header CTA, hero CTA, pre-footer CTA band on every page; action-specific labels ("Request a Quote", "Call +971 4 885 1333")
- **Phase 9** - local preview (`npm run dev`), click-through, Lighthouse audit, zero external CDN refs
- **Phase 10** - `vercel.json`, `package.json`, `.gitignore`, `README.md`

---

## CMS readiness (Phase 11 - post client decision)

Both demos remain **fully static** through all 10 phases. No build step, no external API, no CMS integration in the demos themselves. However, the code is scaffolded so that wiring in a CMS later is a clean, contained operation:

- **Blog section** (`/blog/`) - page built with static placeholder cards; all post data fed from `public/assets/js/blog-data.js`. When the client picks a demo, replace this file with a fetch from Decap CMS / Sanity / Contentful and swap the render loop.
- **Projects / Case Studies** (`/projects/`) - same pattern: `public/assets/js/projects-data.js` drives the cards. Comments in the file mark the exact API integration point.
- **Product specs** - `public/assets/js/products-data.js` drives the pipe specs table on the General Information page. Updatable by editing one file; CMS-connectable later.

Planned CMS path when the client is ready: **Decap CMS** (formerly Netlify CMS) - admin panel at `/admin/`, posts stored as Markdown in Git, Vercel rebuild on save. Client never touches code. Scope covers blog posts, project showcase entries, and product spec rows.

The `/blog/` and `/projects/` pages appear as styled "Coming soon" scaffolds in the demos - demonstrating forward-thinking product thinking to the client without fabricating content.

---

## Demo 2 plan (after Demo 1 is signed off)

Demo 1's `public/` directory is duplicated into a new sibling folder (`random-project-3-demo2/` or similar). The scaffold stays identical; Demo 2 layers on:

- GSAP ScrollTrigger or SVG line-draw animations (pipe cross-sections draw on scroll)
- Framer-Motion-equivalent CSS/JS transitions between sections
- Premium micro-interactions (cursor effects, magnetic CTAs, parallax depth)
- Possibly Three.js for a rotating pipe assembly hero

Animation style for the signature "pipes being built" moment is decided during Demo 2 planning, after inspecting what looks cleanest. Options shortlisted: SVG line-draw, CSS/GSAP scroll-driven segment snap, or video-scrubbing.

No Demo 2 code is written until Demo 1 is fully polished and approved.

---

## Files that will be created

- `public/index.html` and one `public/<slug>/index.html` per page (12 total)
- `public/assets/css/styles.css` (single shared stylesheet)
- `public/assets/js/script.js` (nav, scroll-reveal, lightbox, carousel, Leaflet map, form)
- `public/assets/js/blog-data.js` + `public/assets/js/projects-data.js` + `public/assets/js/products-data.js`
- `public/assets/images/` (extracted + localized from SingleFile saves)
- `public/assets/docs/` (catalog PDF)
- `public/assets/vendor/leaflet/` (Leaflet JS/CSS vendored locally)
- `scripts/localize-assets.mjs` + `scripts/rewrite-refs.mjs`
- `vercel.json`, `package.json`, `.gitignore`, `README.md`

---

## Definition of done (Demo 1)

- [ ] All 12 source/scaffold pages have clean-URL equivalents
- [ ] Zero external CDN asset refs remain (verified by grep)
- [ ] Each page has title + description + canonical + OG + JSON-LD
- [ ] Header CTA, hero CTA, and pre-footer CTA all live and wired to the primary conversion goal, with action-specific labels
- [ ] Mobile nav, language picker (UI only), map, and lightbox all functional
- [ ] Design tokens chosen fresh for this project (distinct from Renue Systems)
- [ ] Lighthouse SEO/Accessibility in the green on the homepage
- [ ] `npm run dev` serves the full site from `public/`; deploy config in place
- [ ] README documents structure, preview, CMS integration path, and deploy
