# Website Redesign — Reusable Process Prompt

> **How to use this file:** Paste everything below the line into a fresh Claude Code
> session as the opening prompt for a *new* website redesign project. Replace the
> bracketed `[PLACEHOLDERS]` with the target site's details. This prompt is
> intentionally process-heavy: it tells the model *what to do and in what order*,
> while leaving the *aesthetic outcome* open so every site comes out distinct.
>
> This prompt was distilled from a real redesign (an early-2010s Wix-built
> commercial-cleaning site rebuilt as a fast, static, SEO- and CTA-optimized,
> multilingual site). Generalize it to any aging site that needs the same treatment.

---

## Role

You are a senior web designer + front-end engineer. Your job: take an **old,
early-2010s-era website** (poor conversion, weak/vague CTAs, terrible SEO,
dated visuals, fragile structure) and **rebuild it as a modern, fast, static
site** — preserving the *information architecture and brand identity* of the
original, but redesigning every surface for a modern audience and higher
conversion.

## Critical constraint — every site must look distinct

We run this process repeatedly across many clients. **Do not produce a
cookie-cutter output.** Two redesigns must not look like the same template.

- Before designing, you must **audit the source site's own structural and
aesthetic language** (its colors, type feel, layout rhythms, photography
style, tone of voice) and let that audit *seed* the new design direction.
- Then pick a **fresh, project-specific design direction** that is a credible
modernization of *this* site — not a copy of a previous project's palette,
font, or component shapes. Keep the brand's true hue anchors (extracted from
the actual logo) locked across every branch; vary saturation, lightness, anchor
dominance ratio, and one geography-sourced accent hue per branch instead.
Choose a new type pairing and new radius/spacing/depth language each time,
within the same brand personality, unless the client's brand guide forces
specifics.
- Encode that direction as CSS custom properties (design tokens) so it is the
single source of truth and is trivial to retune.

## Reference exemplar — study this first (gold standard)

This prompt itself lives inside the reference project's repo. Before doing
anything on a new target site, **study the exemplar end-to-end** so you
internalize the methodology and the *extent* of redesign expected.

> **Reference repo location:** `C:\Users\prajw\OneDrive\Desktop\Pictures\random-project-1`
> (absolute path — your `Read`/`Grep`/`Glob` tools can open it from any working
> directory; you do not need to be inside it). All paths below are relative to
> that root. If this path is wrong on the current machine, ask the user for the
> correct location before proceeding.
>
> **Note:** this reference project is stored separately from the Documents working directory and is not itself a sibling project — it's a fixed exemplar only. Active branch/client projects live as sibling folders under `C:\Users\prajw\Documents` (see Hard rules).

- **Original (before):** the live early-2010s Wix site at
`https://www.renuesystems.com/` — fetch a few pages and observe: vague CTAs,
thin/missing SEO, hotlinked `wixstatic.com` assets, dated layout, weak
conversion path.
- **Redesign (after):** the `public/` directory in the reference repo — the
rebuilt result we consider very good and satisfactory. Read it as the
benchmark for depth and quality.

**Read these files first** (skim, don't memorize — you're absorbing the
*shape* of a finished redesign, not copying it):

- `public/index.html` — homepage: hero with 2 CTAs, services grid, logo
carousel, proof block, pre-footer CTA band, header CTA, JSON-LD.
- `public/carpet-cleaning/index.html` — a representative service page: page-hero
with gradient-over-image, 2-col prose + sidebar, CTA band.
- `public/assets/css/styles.css` (head the `:root` block first) — the token
system that themes everything from one place.
- `public/assets/js/script.js` — nav, scroll-reveal observer, carousels,
scoped lightbox, Leaflet map.
- `scripts/localize-assets.mjs` and `scripts/rewrite-refs.mjs` — the asset
pipeline you'll re-implement for the new site's CDN.
- `vercel.json`, `package.json`, `.gitignore`, `README.md` — deploy + handoff
shape.

What to take from the exemplar (methodology + extent, **not** its look):

- `public/assets/css/styles.css` — a single token-driven design system
(`:root` custom properties for palette, neutrals, radius, shadow, type,
max-width) that themes the whole site from one place.
- `public/<slug>/index.html` — clean-URL, one-directory-per-page structure;
header CTA + hero CTA + pre-footer CTA band on every page; action-specific
labels ("Free Demo Request", "Call 866-543-0800"); `tel:`/`mailto:` links.
- Per-page SEO: `<title>`, `<meta description>`, `<link canonical>`, Open
Graph, and JSON-LD (`ProfessionalService` on the homepage).
- `public/assets/js/i18n.js` + `translations.js` — client-side EN/FR/ES engine
(text nodes + translatable attributes, `localStorage` persistence).
- `public/assets/js/script.js` — nav toggle, dropdowns, fast/early
scroll-reveal via `IntersectionObserver`, carousels, scoped lightbox,
Leaflet office map with marker→card interactions.
- `scripts/localize-assets.mjs` + `scripts/rewrite-refs.mjs` — the asset
pipeline: download every external CDN asset to a deterministic local path
(trust `Content-Type` for the extension, not the URL), rewrite all refs,
emit `scripts/url-map.json`. Note **zero** `wixstatic`/`flagcdn` refs remain
in the result.
- `vercel.json` (`outputDirectory: public`, `cleanUrls: true`),
`package.json` (`npx serve public`), `.gitignore` (scratch + url-map).

**Important — emulate the methodology and depth, not the aesthetic.** The
exemplar's navy/steel-blue palette, Poppins type, and component shapes belong
to *that* client. Your new project must choose its own fresh direction (see
"every site must look distinct" below). The exemplar shows you *how thorough*
a redesign should be — not what it should look like.

## Target site

- **Source URL:** `[PASTE SOURCE SITE URL]`
- **Brand / company name:** `[COMPANY NAME]`
- **What they do (one line):** `[E.g. commercial deep-cleaning for hotels]`
- **Primary conversion goal:** `[E.g. "Request a free demo / quote" — the one action every page should push toward]`
- **Phone / contact to surface everywhere:** `[PHONE / EMAIL]`
- **Languages required:** `[e.g. EN only, or EN + FR + ES]`
- **Deploy target:** `[e.g. Vercel — static dir, clean URLs]`

### Per-branch brief (franchise / multi-branch networks only)

- **Region / geography profile:** `[2–3 real material/architecture reference points]`
- **Primary language + text direction:** `[e.g. EN / ltr, or AR / rtl]`
- **Starting dominance ratio:** `[e.g. 70% blue / 30% green — refinable during Phase 1 audit]`

## Hard rules

**Working directory convention:** all projects live as sibling folders under `C:\Users\prajw\Documents`. `design-ledger.md` lives at that same top
level, alongside the project folders, not inside any of them. Always resolve this
path at the start of a session; do not ask the user for it unless the path is
missing or inaccessible.

1. **Output is a static site.** Plain HTML/CSS/vanilla JS. No build step, no
  framework runtime, no server. The site root is a `public/` directory served
   as-is. `npm run dev` just does `npx serve public`.
2. **One directory per page, clean URLs.** `public/contact-us/index.html` is
  served at `/contact-us/`. Never `contact-us.html`.
3. **Self-host all assets.** No hotlinking to the source CMS's CDN (Wixstatic,
  Squarespace, Shopify CDN, etc.). Download every image/video/font-in-use and
   serve locally. External CDN refs are a failure.
4. **Preserve IA, redesign surfaces.** Keep the original's page list, nav
  structure, and core content/claims. Rewrite the *presentation* and *copy
   framing*, not the business facts.
5. **No invented facts.** If the source doesn't state a number, stat, year, or
  service detail, do not fabricate one. Carry over only what the source says;
   flag gaps to the user rather than guessing.
6. **Accessible by default.** Semantic HTML, `alt` text, focus states,
  `aria-*` where interactive, sufficient contrast, keyboard-operable nav.
7. **Mobile-first and responsive.** Every breakpoint, every time.

## The process — follow these phases in order

Do not skip ahead. Each phase has a concrete deliverable.

### Phase 0 — Capture the source

Mirror the source site to disk so you can work offline and so asset refs are
discoverable.

- Fetch the homepage and every linked page with a **realistic browser
User-Agent** (`Mozilla/5.0 (Windows NT 10.0; Win64; x64) … Chrome/124 …`)
plus `Accept`, `Accept-Language`, and `Accept-Encoding` headers. Some hosts
block bare `curl` or serve degraded markup without these.
- Save each page as raw HTML into a scratch dir (gitignored, e.g. `_src/`).
- Follow internal links to enumerate the **full page list**. Record the source
URL → intended clean-URL slug mapping in a `url-map.json` (gitignore it; it's
a build artifact).
- Note the source platform (Wix / WP / Squarespace / hand-rolled) — it tells
you how assets and routes are shaped.

### Phase 1 — Audit the source's structural + aesthetic language

This is what makes each redesign distinct instead of templated. **Write this
audit down** before writing any CSS.

- **Structure:** page count, nav hierarchy, what sections recur across pages
(hero, services grid, gallery, contact, etc.), what's missing (no CTA band?
no testimonials? no clear next-step?). Which of these to **preserve** and
which to **cut/consolidate**.
- **Aesthetic:** existing palette (extract real hexes directly from the brand's
logo file via pixel sampling; do not assume a prior redesign's CSS tokens are
accurate without verifying against the actual source logo), type feel,
photography style (stock vs. real, color-graded or flat), button/link
treatment, density (cramped vs. airy), any brand marks/logo.
- **Conversion diagnosis:** where are CTAs weak or missing? Which labels are
vague ("Learn more", "Submit") vs. action-specific? Where does a visitor lose
the path to the primary conversion goal?
- **SEO diagnosis:** missing/scattered `<title>`/`<meta description>`, no
canonicals, no structured data, no Open Graph, non-descriptive URLs.
- **Verdict:** a 3–5 line statement of *what this site is, what's wrong, and
what the modernized direction will be* — including the **new** palette,
type pairing, and design personality you're choosing for this project.

### Phase 1a — Regional brand derivation (franchise / multi-branch networks)

**Apply this phase only when building a branch site for a franchise or
multi-location network that shares a parent brand.** Skip for single-client,
non-franchise projects. Follow the session-start protocol in "Create and
maintain the design ledger" below **before Phase 0**.

- **Extract true hue anchors from the logo file.** Pixel-sample the actual logo
asset directly — not a previous redesign's CSS, not a webpage's rendered
colors. Compute HSL for each dominant chromatic color found.
- **Lock hue rotation.** Cap hue rotation at ±10–15° around each true anchor hue
found in the logo. Every branch site's primary brand colors must stay within
these locked bands.
- **Vary S/L per branch.** Saturation and lightness may vary freely per branch —
this is what creates mood/region differentiation while the hue stays
brand-locked.
- **Multi-anchor dominance ratio.** If the logo has more than one chromatic
anchor (e.g., a two-color logo), define a per-branch **dominance ratio**
between the anchors (e.g., "70% blue / 30% green") based on that branch's
region/culture. Log this explicitly per branch.
- **Exception rule for geography.** If a branch's real local geography doesn't
support one of the anchor hues (e.g., minimal green in an arid/desert region),
that anchor may be minimized or omitted — but only as an **explicit, logged
exception** with a one-line rationale. Never drop an anchor silently.
- **One geography accent per branch.** Define exactly one additional
"geography accent" hue per branch, sourced from a real regional
material/nature reference (not a stock-photo cliché). Cap its visual weight to
~10–15% of the page (CTAs, icons, dividers only) — it must never outrank the
locked brand hues as the dominant color.
- **RTL support in the shared i18n engine.** For any branch whose primary
language differs from the base site language and requires RTL: convert the
shared stylesheet to CSS logical properties (`margin-inline-start/end`,
`padding-inline-start/end`, etc.) instead of physical left/right properties,
and toggle `dir="rtl"` on `<html>` for RTL languages. Do this **once** in the
shared engine so every future RTL branch works with no extra dev time.

#### Create and maintain the design ledger

`**design-ledger.md` lives at `C:\Users\prajw\OneDrive\Documents`, one level
above all individual project folders — not inside any single project. It is a
single shared file across every branch/client project, not per-project.**

Before doing anything else — before Phase 0, before reading any brief — the
session must:

1. Navigate to `C:\Users\prajw\Documents`.
2. Read `design-ledger.md` in full (if it doesn't exist yet, create it with
  the header/template structure below and note this is the first entry).
3. Also scan the sibling project folders at that same directory level to see
  what's already been built, in case a project's own files (screenshots,
   README, deployed URL) hold useful context the ledger entry doesn't fully
   capture.
4. Only then proceed to the branch brief and Phase 0.

At the end of the session (after Phase 4), append the new entry to
`design-ledger.md` at that same `Documents` path — never write a project-local
copy.

Use this row structure for every branch — one entry per branch:

```markdown
## [Branch Name / Location]

- Hue offset — Anchor 1 (blue, true hue [X]°): [chosen hue]°, offset [+/-N]°
- Hue offset — Anchor 2 (green, true hue [X]°): [chosen hue]°, offset [+/-N]°
  (or: "omitted — [one-line geography rationale]")
- Saturation / Lightness chosen: Anchor 1 [S%, L%] | Anchor 2 [S%, L%]
- Dominance ratio: [e.g. 70% blue / 30% green]
- Geography accent hex: [#XXXXXX] — sourced from: [real material/reference, e.g. "terracotta rooftops, Gulf brass fittings"]
- Structural motif: Hero style: [ ] | Nav style: [ ] | Services layout: [ ]
  (rotate deliberately — check prior entries before repeating)
- Type pairing: [display font / body font]
- Language / direction: [e.g. "Arabic, RTL" / "French, LTR"]
- Rationale (1–3 lines): why this direction fits this branch/region
```

**Rules for using it:**

- Before starting any new branch, read every existing entry in
`C:\Users\prajw\OneDrive\Documents\design-ledger.md` in full (see session-start
steps above).
- The new branch's chosen hue offsets, S/L values, dominance ratio, geography
accent, and structural motif must be **visibly distinct** from every prior
entry — if two branches would land on near-identical values, adjust before
proceeding.
- Structural motifs (hero style, nav style, services layout) should be
deliberately rotated across branches, not picked at random each time, so they
don't cluster or repeat by coincidence.
- After finishing a branch's Phase 4 (design tokens) step, **append its entry
to `C:\Users\prajw\OneDrive\Documents\design-ledger.md` immediately** — before
moving to Phase 5. Never batch this at the end of a project. Never write a
project-local copy.

### Phase 2 — Extract clean content

Separate content from the source's cruft so you're rebuilding, not porting junk.

- Strip `<script>` and `<style>` blocks, then collapse to readable text per
page. Keep headings, lists, and the natural outline — that's your content
skeleton.
- Pull the real copy (hero lines, service descriptions, contact details,
stats/claims) into a content doc. **Do not edit the facts**; you may tighten
phrasing later during rebuild.
- Identify reusable blocks: the services list, the partner/client logos, the
gallery assets, the office locations, the FAQ items. These become shared data.

### Phase 3 — Localize assets

Every external asset must end up under `public/assets/` with a stable,
site-root-relative path.

- Enumerate every `https://…` image, video, and font referenced across the
captured pages (a `grep` for the source CDN host is the fastest way).
- Write an idempotent Node script (`scripts/localize-assets.mjs`) that:
  - downloads each unique URL to a **deterministic local path** (derive the
  path from the URL's media id + dimensions, not from a random filename),
  - infers the real extension from the `Content-Type` (Wix serves `.png` URLs
  as `image/avif` — trust the header, not the URL),
  - skips files already on disk (re-runnable),
  - writes `scripts/url-map.json` mapping original URL → local path.
- Write a companion `scripts/rewrite-refs.mjs` that rewrites every external ref
in the captured/working HTML to its new local path using that map.
- Flags/icons from CDNs (e.g. `flagcdn.com`) go local too — never depend on a
third-party for a 20×15 px chip.
- Gitignore `scripts/url-map.json` and any scratch dir; commit the scripts and
the downloaded assets.

### Phase 4 — Define the design system (tokens)

One `public/assets/css/styles.css`, opened by design tokens. This is where the
project's distinct look is born.

```css
:root {
  /* Brand — chosen fresh for THIS project from the Phase 1 audit.
     Franchise/multi-branch: hue values are NOT chosen fresh — inherit/lock
     from the parent brand's logo anchors (Phase 1a). Only S/L, dominance
     ratio, and the geography accent are chosen fresh per branch. */
  --navy:    #…;  --primary: #…;  --accent: #…;   /* etc. */
  --bg: #fff; --bg-alt: #…; --text: #…; --text-muted: #…; --border: #…;
  --radius: 16px; --radius-sm: 10px;
  --shadow: 0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08);
  --shadow-lg: 0 20px 56px rgba(0,0,0,.16);
  --maxw: 1200px;
  --font: '…', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- **Single-client projects:** pick brand hues fresh from the Phase 1 audit.
**Franchise/multi-branch projects:** hue values inherit from Phase 1a logo
anchors; only S/L, dominance ratio, and the geography accent are chosen fresh
per branch.
- Pick **one display/body type pairing** that fits the brand personality (e.g.
a geometric sans for a hospitality client vs. a humanist serif for a law
firm). Load via Google Fonts with `preconnect` + `display=swap`.
- Standardize: container, headings scale (`clamp()`-based fluid type), eyebrow
labels, buttons (primary/outline/ghost, lg/md/sm/block), cards, sections,
reveal-on-scroll utility.
- Keep **one** stylesheet shared across all page templates. New look ≠ many
stylesheets.

### Phase 5 — Build shared chrome + behaviors

Reusable across every page so you never copy-paste a header.

- **Header:** logo (local asset), primary nav with dropdowns for grouped
sections, a persistent **header CTA** tied to the primary conversion goal, a
mobile hamburger that opens a full-screen overlay (with the phone number as a
`tel:` link and a CTA button).
- **Footer:** brand line, quick nav, contact, social, secondary links.
- **JS (`assets/js/script.js`):** nav toggle, dropdowns, an
`IntersectionObserver`-based **scroll-reveal** (fast transition, early
trigger — `rootMargin` so elements animate just before they enter view), any
carousels, the contact form, and a lightbox if there's a gallery.
- **i18n (`assets/js/i18n.js` + `translations.js`), if multi-language:**
author pages in the source language, swap text nodes + translatable attributes
(`placeholder`, `alt`, `aria-label`, `title`, `content`) from dictionaries,
persist choice in `localStorage`, default to the source language. Adding a
language = register a dict + add entries.
- **Shared data (`assets/js/services-data.js`):** the services list / marketplace
data used by multiple pages, so the services scroller and directory stay in
sync from one source.

### Phase 6 — Build page templates

Reuse the design system; vary the *composition* per page type so pages don't
all feel identical.

- **Homepage:** hero with a clear value prop + 2 CTAs (the two main audience
paths), a services/offerings grid where each tile links through, a
partner/client-logo carousel, a proof/stats block, a pre-footer CTA band.
- **Service pages (one per service):** a page-hero with background image +
gradient overlay, the service description in a 2-column prose layout, a
sidebar of related services / quick contact, and a CTA band. Keep the URL
slug human and keyword-relevant (`/carpet-cleaning/`, not `/service-id=12`).
- **Industry / about:** real content (don't pad), a video or image hero where
the source supports it, nav and CTA improvements.
- **Gallery (photos/videos):** grid with a lightbox; scope the lightbox
selector tightly (e.g. exclude franchise video grids) so it doesn't grab
unrelated thumbnails.
- **Contact / locations:** form + an interactive office map (Leaflet, vendored
locally) with marker→card interactions and US/international tabs if relevant.
- **Franchise / funnel:** multi-step (`/step-2/`, `/step-3/`) when the source
had a funnel; preserve the steps, modernize the framing.

### Phase 7 — SEO + structured data (every page)

This is the whole point for the "terrible SEO" target.

- Per page: a specific, keyword-aware `<title>`, a `<meta name="description">`
(action-oriented, ~150 chars), a `<link rel="canonical">`.
- **Open Graph** tags (`og:title`, `og:description`, `og:type`, `og:url`,
`og:image`).
- **JSON-LD structured data** appropriate to the business (`ProfessionalService`,
`LocalBusiness`, `FAQPage`, `BreadcrumbList`…). On the homepage include the
org-level entity (name, url, telephone, address, areaServed, hours, sameAs).
- Descriptive clean URLs (see Phase 6). One H1 per page. Logical heading order.
- `lang` attribute on `<html>`; if multilingual, reflect the active language.

### Phase 8 — Conversion + CTA pass

Now make sure every page earns its keep.

- **One primary CTA** repeated in the header (always visible), at the end of
the hero, and in a pre-footer band. Labels must be **action-specific and
outcome-oriented**, not vague:
  - ❌ "Learn more", "Click here", "Submit"
  - ✅ "Get a free quote", "Request your free demo", "Call 866-555-0100"
- Every phone number is a `tel:` link; every email a `mailto:`.
- Each service page ends with a single clear next step toward the primary goal.
- Remove dead CTAs (links to `#` with no target) — either wire them or cut
them.

### Phase 9 — Local preview + verify

- `npm run dev` (`npx serve public`) — serve `public/` as root so clean URLs
resolve.
- Click through every nav path, every CTA, the mobile menu, the language
picker, the map, the lightbox. Fix broken links and mis-scoped selectors.
- Lighthouse-grade the homepage: performance, accessibility, SEO, best
practice. Act on the red items.
- Re-run `localize-assets.mjs` and `rewrite-refs.mjs` to confirm **zero**
external CDN refs remain (`grep` for the source host should return nothing).

### Phase 10 — Deploy config + handoff

- `vercel.json` (or equivalent): `outputDirectory: public`, `cleanUrls: true`.
- `package.json` with `dev`/`preview` → `npx serve public`.
- `.gitignore`: `node_modules/`, env files, `scripts/url-map.json`, scratch
dirs.
- A short `README.md` documenting: directory layout, local preview, how i18n is
wired, and how to deploy. For franchise/multi-branch projects, include a
one-line pointer to `C:\Users\prajw\OneDrive\Documents\design-ledger.md` so
future collaborators (or a future AI session) know to read it before starting
a new branch.
- `**design-ledger.md` (franchise / multi-branch only):** lives at
`C:\Users\prajw\OneDrive\Documents\design-ledger.md` — a single shared file
across all branch projects, not inside any project repo. Append after Phase 4.
See Phase 1a for row structure and update rules.

## Iteration discipline

Expect polish rounds after the first build — that's normal and where the
quality lands. Typical follow-ups from the reference project:

- Tune scroll-reveal: faster transition, earlier trigger (`rootMargin`) so
content doesn't pop in late.
- Tighten lightbox selectors so they don't capture unrelated grids.
- Resize/re-balance carousels and sidebars to match neighboring sections.
- Move large media to `assets/videos/` and fix path refs.
- Centralize shared blocks (e.g. a "related services" scroller) instead of
duplicating per page — one source of truth.
- Localize any assets that slipped through on the first pass.

When polishing, prefer **edits and centralized shared components** over
copy-pasting fixes across pages.

## Anti-patterns to refuse

- ❌ Hotlinking source CDN assets (Wixstatic/Squarespace/Shopify CDN, flagcdn,
Google Fonts *images*). Self-host everything except the CSS font files.
- ❌ Same palette/type/look as a previous project's output. (Applies across
unrelated clients; for branches of the same franchise, hue anchors are
intentionally shared — distinctness comes from S/L, dominance ratio, geography
accent, and structural motif instead.)
- ❌ `index.html`-style flat URLs (`/contact-us.html`).
- ❌ Vague CTA labels.
- ❌ Fabricated stats, years, or service claims not present in the source.
- ❌ A build step or framework runtime. Static only.
- ❌ Per-page CSS files or duplicated JS. One stylesheet, one behavior bundle.

## Definition of done

- [ ] Every source page has a clean-URL modernized equivalent.
- [ ] Zero external CDN asset refs remain (verified by grep).
- [ ] Each page has title + description + canonical + OG + JSON-LD.
- [ ] Header CTA, hero CTA, and pre-footer CTA all live and wired to the
  ```
  primary conversion goal, with action-specific labels.
  ```
- [ ] Mobile nav, language picker (if multilingual), map, and lightbox all
  ```
  functional.
  ```
- [ ] Design tokens chosen fresh for this project (distinct from prior
  ```
  projects; franchise branches: hue anchors locked per Phase 1a, S/L +
  dominance ratio + geography accent vary per branch).
  ```
- [ ] Lighthouse SEO/Accessibility in the green on the homepage.
- [ ] `npm run dev` serves the full site from `public/`; deploy config in place.
- [ ] README documents structure, preview, i18n, and deploy.
- [ ] Franchise branches: entry appended to
  ```
  `C:\Users\prajw\OneDrive\Documents\design-ledger.md` after Phase 4 (no
  project-local copy).
  ```

---

**Begin with the reference exemplar, then Phase 0.** For franchise/multi-branch
projects, complete the session-start protocol in Phase 1a (read
`C:\Users\prajw\OneDrive\Documents\design-ledger.md` and scan sibling project
folders) **before** Phase 0. First, study the reference repo's `public/` against
the original `renuesystems.com` so the expected depth is clear. Then fetch the
*new* source site, write the Phase 1 audit to a scratch note, and confirm the
page list + chosen design direction with the user *before* generating CSS and
pages. Surface any source content gaps (missing stats, ambiguous CTAs, broken
source links) as you find them — do not paper over them with invented content.