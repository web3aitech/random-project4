# Dubai Pipes Factory Co. — Demo 2 (Premium Motion Layer)

> Persistent build plan. If the working chat breaks or fails, resume from this file.
> Status: APPROVED — ready to execute Phases A→H in order.

## Context

Demo 1 (in `C:\Users\prajw\Documents\random-project-3`) is a polished but motion-light static site for a GRP pipe manufacturer — deep royal blue `#0C1B64` + dune `#C9A227`, DM Sans + Inter, 13 pages, clean URLs, SEO/JSON-LD, Leaflet map. It's done and approved.

**Demo 2's job:** take that scaffold and layer on an experiential, ultra-premium scroll-animation treatment in the spirit of **earcouture.jp / cyclemon** — full-bleed scroll-driven chapter transitions, WebGL shader backgrounds, liquid/RGB-split image reveals, a signature "pipes building as you scroll" moment, and site-wide micro-interactions. Market target **$30–40K**. Build **from** Demo 1 (duplicate its scaffold) rather than scratch, to keep cost down. Creative bar: "insanely creative, dynamic, screams premium."

Demo 2 lives in **`C:\Users\prajw\Documents\random-project4`** (this folder, already git-init'd). Demo 1's visual design stays **locked** — Demo 2 only *adds* motion + depth, no restyle.

**Model constraint:** the working model cannot view images/screenshots (loading them crashes the chat). QA is code-level + the user visually reviews. This is baked into the verification section.

## Architecture (validated)

**Vendor stack — all self-hosted under `public/assets/vendor/`, no CDN, classic `defer` (matches Demo 1's no-module convention):**
- `gsap/gsap.min.js` + `gsap/ScrollTrigger.min.js` — GSAP 3.13.0, the motion engine + scroll timelines/pinning/scrub.
- `three/three.min.js` — **Three.js r0.149.0** specifically (r150+ logs a deprecation `console.warn` on every load; r161 removes the UMD build entirely — r149 is the last clean UMD global `THREE`). Post-processing (grain/chromatic-aberration/bloom) hand-rolled as shader passes on a full-screen quad — no `EffectComposer`/ESM addons.
- `lenis/lenis.min.js` — Lenis 1.1.13, smooth-scroll inertia (the single biggest "premium feel" contributor).

**Integration pattern (slot in alongside Demo 1, don't touch Demo 1 code):**
- New `public/assets/js/demo2-motion.js` — self-init IIFE, `defer`-loaded **after** script.js + all vendor libs. Demo 1's `script.js` is a sealed IIFE exposing nothing on `window`, so this is conflict-free.
- New `public/assets/css/demo2.css` — all rules gated under a `.demo2` root class; Demo 1's `styles.css` stays untouched.
- An inline `<script>` as the **first** `<head>` child adds `document.documentElement.classList.add('demo2')` before paint.
- Lenis 1.x drives **native window scroll** (not a transformed wrapper), so GSAP ScrollTrigger works on the window scroller with **no `scrollerProxy`** — simple wiring:
  ```js
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);          // prevents catch-up jumps
  gsap.registerPlugin(ScrollTrigger);
  ```

**Motion-targeting contract:** Demo 2 introduces a fresh `[data-motion]` attribute (+ variants `data-motion="fade-up|mask-reveal|stagger|parallax"`) for premium-animated elements. Demo 1's existing `[data-reveal]`/`.is-visible` (owned by script.js) is **left untouched**. Rule enforced in review: an element is EITHER `[data-reveal]` OR `[data-motion]`, never both (GSAP inline styles beat the `.is-visible` class but the 420ms CSS transition would jitter — so partition is strict).

**Progressive enhancement (two-class gate):** CSS hides `[data-motion]` only when **both** `.demo2` (inline boot) **and** `.demo2-motion` (added by demo2-motion.js as its first action, after confirming `gsap && THREE && Lenis` exist) are present:
```css
.demo2.demo2-motion [data-motion] { opacity: 0; /* ... */ }
```
If any lib fails to load, `.demo2-motion` is never added → content stays visible, degraded-but-usable. Safe failure mode, zero extra machinery.

### Critical gotchas (from validation)

1. **`html { zoom: 0.8 }` (styles.css L67, desktop ≥1024px)** breaks a naive fixed canvas (`100vw`/`100vh` are viewport-relative, not zoom-relative → 20% uncovered strip). Fix: JS-driven canvas sizing that reads the live zoom:
   ```js
   const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
   const cssW = window.innerWidth / z, cssH = window.innerHeight / z;
   canvas.style.cssText = `position:fixed;inset:0;width:${cssW}px;height:${cssH}px;z-index:-1;pointer-events:none`;
   renderer.setPixelRatio(Math.min(devicePixelRatio||1, 2)); renderer.setSize(cssW, cssH, false);
   ```
   Re-run on resize + `ScrollTrigger.refresh()`. Fallback lever: if zoom proves too destabilizing, neutralize it under `.demo2` and widen `--container`/bump type scale. **Minimize DOM-anchored GL** (where rect-under-zoom is inconsistent across browsers); do image-distortion reveals as GSAP+CSS on the `<img>` itself, keep GL on the fixed background canvas keyed to scroll progress. Give the pipe-build chapter its **own stage-local canvas** inside the pinned element (avoids the zoom issue for that scene).

2. **MutationObserver churn** — script.js runs an always-on body `MutationObserver` (lightbox re-indexing, does `$$("img")` per childList mutation). Rule for demo2-motion.js: **create all DOM nodes once at init** (canvas, cursor, magnetic wrappers, overlays); during scroll/animation mutate only `style`/`attribute`/`class` (which don't fire `childList`). No edit to script.js needed.

3. **`scrollTo({behavior:"smooth"})` conflicts** — script.js back-to-top (L131) + form success (L274) trigger native smooth scroll that Lenis jankily catches up to. Intercept via capture-phase listeners in demo2-motion.js routing through `lenis.scrollTo()` (no script.js edit). Set `html.demo2 { scroll-behavior: auto }` in demo2.css.

4. **NPOT textures** — the 61 jpg + 4 webp content images are mostly non-power-of-two. After loading as a texture: `generateMipmaps=false; wrapS=wrapT=ClampToEdgeWrapping; minFilter=magFilter=LinearFilter; needsUpdate=true`. Load only `.jpg`/`.webp` as GL textures (gif/svg are poor texture material).

5. **Reduced motion is demo2's responsibility** — script.js has no `matchMedia('(prefers-reduced-motion)')` guard. demo2-motion.js early-returns (skip Lenis + WebGL, native scroll) under reduced-motion; demo2.css force-shows `[data-motion]` + hides canvas/cursor.

## File deliverables

### NEW (6)
- `public/assets/vendor/gsap/gsap.min.js` — curl `https://unpkg.com/gsap@3.13.0/dist/gsap.min.js`
- `public/assets/vendor/gsap/ScrollTrigger.min.js` — curl `https://unpkg.com/gsap@3.13.0/dist/ScrollTrigger.min.js`
- `public/assets/vendor/three/three.min.js` — curl `https://unpkg.com/three@0.149.0/build/three.min.js`
- `public/assets/vendor/lenis/lenis.min.js` — curl `https://unpkg.com/lenis@1.1.13/dist/lenis.min.js`
- `public/assets/css/demo2.css` — `.demo2`-gated styles, `[data-motion]` hides (two-class gate), Lenis CSS, reduced-motion overrides, canvas/cursor base, `scroll-behavior:auto`.
- `public/assets/js/demo2-motion.js` — the motion controller: lib-presence guard, reduced-motion guard, Lenis+GSAP wiring, chapter controller, Three.js pipe-build scene + shaders, micro-interactions, debug hook `window.__demo2`.

### EDITED (5)
- `scripts/build-pages.mjs` — two surgical edits (the single integration point for all 10 generated pages):
  - `render()` head array: prepend `DEMO2_BOOT` inline script (adds `.demo2` before paint) as first head element; add `<link rel="stylesheet" href="/assets/css/demo2.css?v=1">` after `styles.css?v=7`.
  - `scriptsTag(page)`: append vendor chain + demo2-motion.js after `/assets/js/script.js` → `gsap.min.js → ScrollTrigger.min.js → three.min.js → lenis.min.js → demo2-motion.js` (all `defer`).
- `public/index.html` (hand-authored home) — `.demo2` boot + demo2.css in `<head>`; new `<section class="pipe-build" data-motion-chapter="pipe-build">` signature chapter (with `<canvas class="pipe-build__canvas">` inside a pinned stage) after the stat-band; vendor+demo2-motion.js `defer` chain after the existing script.js tag (L433).
- `public/contact-us/index.html` (hand-authored contact) — `.demo2` boot + demo2.css in `<head>`; vendor+demo2-motion.js chain after the existing leaflet.js + script.js (L220). Leaflet stays independent.
- `package.json` — rename to `dubaipipes-redesign-demo2`; scripts unchanged (`build`/`dev`/`start`/`localize` all still work).
- `README.md` — document the Demo 2 motion layer, vendor layout, reduced-motion/fallback behavior, and the QA model-limitation note.

### Copied as-is
`public/` (all 13 pages + assets), `scripts/` (serve.mjs, localize-assets.mjs, build-pages.mjs), `.gitignore`, `vercel.json`.

### NOT touched
`public/assets/js/script.js`, `public/assets/css/styles.css`, `public/font-preview/index.html` (dev utility), `scripts/serve.mjs`, `scripts/localize-assets.mjs`.

## Phasing (ordered, reviewable checkpoints)

**Phase A — Scaffold + vendor.** Copy Demo 1's `public/`+`scripts/`+`package.json`+`.gitignore`+`vercel.json` into `random-project4`. Curl the 4 vendor files. `npm run build` → `Generated 10 pages.` `npm run dev` → `:5173` serves, `curl` 200. Grep zero CDN refs. *Checkpoint: Demo 1 intact in new repo, vendor present.*

**Phase B — demo2.css skeleton + boot + Lenis/ScrollTrigger wiring + guards.** Create demo2.css (`.demo2`/`.demo2-motion` gates, Lenis CSS, reduced-motion block, canvas/cursor base). Edit build-pages.mjs head + scriptsTag; edit the 2 hand-authored pages. Create demo2-motion.js skeleton: IIFE, reduced-motion early-return, lib-presence guard (add `.demo2-motion` only if all globals exist), Lenis init + ticker wiring + `lagSmoothing(0)`, `registerPlugin`, `ScrollTrigger.refresh()` on load/fonts-ready/resize, capture-phase intercepts for `.to-top` + form success, `window.__demo2` debug hook. *Checkpoint: Lenis smooth scroll on desktop; back-to-top glides via Lenis; reduced-motion (DevTools emulate) → no Lenis, native scroll, content visible; console clean; `window.__demo2` defined.*

**Phase C — Chapter controller + section transitions + text reveals.** `chapters` controller registers ScrollTrigger scenes per `[data-motion-chapter]`, each driving a mood/color-grade shift (CSS-var swaps via `gsap.to`) + transition wipe. `[data-motion]` vocabulary (`fade-up`/`mask-reveal`/`stagger`/`parallax`). Apply to home's existing sections (hero, stats, intro, capability cards, anatomy, certs, know-how, form). `onLeaveBack` resets on every pinned/toggled scene. *Checkpoint: premium reveals + transitions; pin leaves no residue on scroll-up; reduced-motion shows all statically.*

**Phase D — Signature procedural pipe-build chapter.** Add the `<section data-motion-chapter="pipe-build">` to `public/index.html`. `PipeBuildScene` module: Three.js scene with mandrel cylinder rotating, filament helix winding (`TubeGeometry` along a parametric helix `Curve`, growing via scrub), resin cure color-shift (lerp material color/emissive), flange seating (`TorusGeometry` snapping), finished pipe advancing. Scrubbed by a pinned ScrollTrigger (`pin:true, scrub:1, end:'+=200%'`) on its **own stage-local canvas**, paused via `onEnter`/`onLeave` (no always-on GPU). *Checkpoint: scroll builds the pipe; scroll-back reverses cleanly; GPU pauses off-chapter.*

**Phase E — WebGL shader background + post-processing + image reveals.** Single fixed full-screen `<canvas class="demo2-canvas">` (z-index:-1), zoom-aware sized. Full-screen quad `ShaderMaterial`: animated gradient/noise bg keyed to chapter mood + optional liquid distortion. Hand-rolled post passes in the same loop: grain, chromatic aberration, bloom. RGB-split image reveals via GSAP+CSS on `<img>` (not per-image GL). Lazy-init only when `matchMedia('(min-width:768px)') && hardwareConcurrency>=4 && !reduce`; else CSS-gradient fallback. Context-loss handler → remove canvas, `html.demo2-no-webgl` class, CSS bg shows. *Checkpoint: canvas covers full viewport (zoom-corrected); mobile/low-power skips GL cleanly; context-loss falls back.*

**Phase F — Micro-interactions.** Custom cursor (`div.demo2-cursor` created once, moved via `gsap.quickTo` on `pointermove`, grows on hover of `[data-magnetic]`/`a`/`button`; disabled on touch/reduced-motion). Magnetic CTAs (`[data-magnetic]` translate toward cursor, reset on leave). Text mask-reveals on headings. RGB-split image hover on gallery/media cards. *Checkpoint: cursor smooth, magnetic feel right, no layout shift, no custom cursor on touch.*

**Phase G — Per-page application (graduated intensity).** Home: full marquee (done in C–F). GRP pages (benefits/installation/general-info): content-tied scroll sequences via `src-pages/*.html` fragments + `npm run build`. Other content pages (certs/know-how/product-testing/services/download/blog/projects): slick reveals + parallax + micro-interactions — `[data-motion]` on heroes/cards/sheads. Contact: page-hero reveal + form micro-interactions; map untouched. *Checkpoint: every page has ≥1 premium moment; no page broken; build regenerates all 10 cleanly.*

**Phase H — QA/verify.** Run the verification checklist below.

## Performance & fallback strategy ($30–40K wow tier, with guardrails)

- **Reduced-motion:** skip Lenis + WebGL; native scroll; `[data-motion]` force-visible; cursor/magnetic disabled.
- **Mobile/low-power:** WebGL gated behind `(min-width:768px) && hardwareConcurrency>=4 && !reduce`; mobile falls back to CSS gradient bg + GSAP-only reveals; pipe-build degrades to the existing `.pipe-diagram` SVG line-draw motif.
- **Lazy-load Three.js (recommended):** split into `demo2-core.js` (Lenis+GSAP+ScrollTrigger+reveals+micro-interactions, always loaded) + `demo2-webgl.js` (Three.js pipe-build+shaders, runtime-`<script>`-injected only when the power heuristic passes) so the ~600KB Three.js payload never blocks first paint on mobile.
- **No-JS:** content visible without JS (two-class gate). Nav/links/forms stay functional (Demo 1's JS-dependent mobile nav is an inherited limitation, not a regression).
- **GPU lifecycle:** pause always-on render loop when canvas off-screen (IntersectionObserver sentinel) or tab hidden (`visibilitychange`); pause pipe-build unless pinned; cap `setPixelRatio` at 2.
- **ScrollTrigger hygiene:** `refresh()` on load, debounced resize, `document.fonts.ready`, and image lazy-loads; `onLeaveBack` resets everywhere.
- **Cache:** vercel.json already sends 1-year `max-age` on `/assets/*`; bump `?v=` on demo2.css/demo2-motion.js per release.

## Verification (code-level — the working model cannot view images)

**Shell / build:**
- `npm run build` → exits 0, `Generated 10 pages into public/.`
- `npm run dev` → `curl -s http://localhost:5173/ | grep -c demo2.css` ≥1; `curl -s http://localhost:5173/grp-pipes-benefits/ | grep -c demo2-motion.js` ≥1; `curl -sI http://localhost:5173/assets/vendor/three/three.min.js` → 200 `text/javascript`.

**Grep (Demo 1 DoD carried forward):**
- `grep -rEn "unpkg|cdn\.|jsdelivr|googleapis" public/ scripts/` → **zero** hits (all vendor local).
- `grep -rn 'classList.add("demo2")' public/` → present in index.html, contact-us, and all 10 build-generated pages.
- `grep -n 'defer></script>' public/index.html` → order: script.js → gsap → ScrollTrigger → three → lenis → demo2-motion.js.

**Runtime (DevTools console / optional `scripts/verify.mjs` Playwright):**
- No `console.error`/`console.warn`/`pageerror` on any page (this is why three@0.149 — no deprecation warning).
- `window.__demo2` exposes `{lenis, webgl, scrollTriggerCount, reducedMotion}`; assert `scrollTriggerCount > 0` on chapter pages.
- **Reduced-motion emulate:** `.demo2` present, `.demo2-canvas` null, `__demo2.lenis === false`, all `[data-motion]` computed `opacity:1`.
- **WebGL fallback:** force context-loss → `html.demo2-no-webgl` class added, CSS gradient bg shows.
- **ScrollTrigger pin:** scroll to pipe-build → pinned element `position:fixed`; scroll back → reverted, no leftover spacer.
- **Zoom math (Chrome desktop ≥1024px):** `getComputedStyle(documentElement).zoom` → `0.8`; canvas rect covers full viewport; resize re-asserts. Firefox (zoom unsupported) → canvas still covers.
- **MutationObserver quiet:** DevTools Performance scroll trace — `lbIndex` (script.js L198) appears only at init, not per-scroll-frame.

**User must visually review (subjective, $30–40K differentiators):** shader aesthetic quality, pipe-build choreography timing/"wow," color-grade mood shifts, magnetic-cursor feel, transition-wipe elegance, text-reveal rhythm, whether the `zoom:0.8` desktop render reads right with motion layered on.

## Reference (ground-truth explored)
- Demo 1 root: `C:\Users\prajw\Documents\random-project-3`
- Build generator: `scripts/build-pages.mjs` (HEADER/MOBILE_NAV/CTA/FOOTER/nav()/render()/scriptsTag() templates + PAGES array → 10 generated pages). Hand-authored: `public/index.html`, `public/contact-us/index.html`, `public/font-preview/index.html` (skip).
- Demo 1 CSS tokens (styles.css L8–57): `--blue #0C1B64`, `--navy #0A1547`, `--ink #060D2E`, `--primary #C9A227`, `--accent #DBB85C`, `--gold #A3841C`; motion `--t-fast 140ms`/`--t 240ms`/`--t-slow 520ms`, `--ease cubic-bezier(.2,.7,.2,1)`, `--ease-out cubic-bezier(.16,1,.3,1)`.
- Demo 1 reveal: `[data-reveal]` + `.is-visible`, IO rootMargin `0px 0px -80px 0px`, threshold 0.01, 420ms transition, unobserve after reveal. `@media (prefers-reduced-motion: reduce)` blocks at styles.css L579–585.
- Hero DOM: `.hero` > `.hero__media > img` (asset `/assets/images/home/hero.webp`) + `.hero__inner`. Section contract: `section.section[modifier]` > `.container` > content.
- Methodology: `WEBSITE_REDESIGN_PROMPT.md` (repo root). Original combined plan: `PLAN.md` (repo root).
