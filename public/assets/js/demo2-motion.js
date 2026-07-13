/* =========================================================================
   demo2-motion.js — Demo 2 premium motion layer (CORE)
   Loaded defer, AFTER: gsap, ScrollTrigger, lenis (and script.js).
   Demo 1's script.js is a sealed IIFE exposing nothing on window, so this
   slots in alongside it without conflict.

   This core file owns:
     - reduced-motion + lib-presence guards (progressive enhancement)
     - Lenis smooth-scroll + GSAP/ScrollTrigger ticker wiring
     - ScrollTrigger.refresh() hygiene (load / fonts / resize)
     - intercepts that route Demo 1's native smooth-scroll calls through Lenis
     - a debug hook (window.__demo2)
     - lazy-injection of three.min.js + demo2-webgl.js when WebGL is warranted
   Phase C (chapters/reveals), D (pipe-build), E (shaders), F (micro-interactions)
   are added below in clearly marked sections as they are built.
   ========================================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap === "object" && typeof window.ScrollTrigger === "function";
  var hasLenis = typeof window.Lenis === "function";
  var docEl = document.documentElement;

  function revealPage() {
    if (window.__demo2RevealFallback) {
      clearTimeout(window.__demo2RevealFallback);
      window.__demo2RevealFallback = null;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        docEl.classList.remove("demo2-loading");
      });
    });
  }
  window.__demo2RevealPage = revealPage;

  // Debug hook (always defined, even under reduced motion / fallback).
  window.__demo2 = {
    lenis: false,
    webgl: false,
    reducedMotion: reduce,
    scrollTriggerCount: 0,
    phase: "C"
  };

  // ---- Bail only if GSAP is missing or reduced motion is requested. ----
  // Lenis is OPTIONAL now: on touch devices Lenis fights native touch scroll
  // (the mobile scroll-stuck bug), so we skip it there and use native scroll;
  // ScrollTrigger drives off the window scroller directly either way.
  if (reduce || !hasGSAP) {
    window.__demo2.lenis = false;
    if (!hasGSAP) console.info("[demo2] motion layer idle: gsap missing");
    revealPage();
    return;
  }

  // ---- Libs present + motion allowed → activate the hide gate. ----
  // Adding .demo2-motion is the FIRST action so [data-motion] hides resolve
  // before any animation runs. (Two-class gate: .demo2 + .demo2-motion.)
  docEl.classList.add("demo2-motion");

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  // iOS Safari fires resize when the address bar shows/hides — ignore those
  // so ScrollTrigger doesn't refresh() and jolt mid-scroll on mobile.
  if (ScrollTrigger.config) ScrollTrigger.config({ ignoreMobileResize: true });

  // ---- Lenis (desktop / non-touch only) ----
  // On touch we use native scroll; ScrollTrigger still works (window scroller).
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var lenis = null;
  if (!isTouch && hasLenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    window.__demo2.lenis = true;
    window.__demo2.lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0); // prevent catch-up jumps on frame lag
  } else {
    window.__demo2.lenis = false;
  }

  // Smooth-scroll helper: Lenis if available, else native.
  function smoothTo(target, opts) {
    if (lenis) { lenis.scrollTo(target, opts || {}); return; }
    if (target && target.nodeType) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: (typeof target === "number" ? target : 0), behavior: "smooth" });
  }

  // ---- Intercept Demo 1's native smooth-scroll calls ----
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      smoothTo(0, { duration: 1.2 });
    }, { capture: true });
  }
  var origScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (opts) {
    if (opts && opts.behavior === "smooth") {
      if (lenis) lenis.scrollTo(this, { offset: -100, duration: 1.2 });
      else { var o = Object.assign({}, opts, { behavior: "smooth" }); return origScrollIntoView.call(this, o); }
    } else {
      return origScrollIntoView.call(this, opts);
    }
  };

  // Smooth-scroll in-page anchors (e.g. hero CTA href="#enquire").
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#" || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    smoothTo(target, { offset: 0, duration: 1.4 });
  });

  // Header flyout menu: script.js's nav-toggle handler always opens the mobile
  // drawer, so intercept in capture and spill the header links out of the
  // hamburger instead. Reduced-motion/no-GSAP users keep the drawer fallback
  // because this file bails before .demo2-motion is added.
  (function () {
    var nt = document.querySelector(".nav-toggle");
    var flyout = document.querySelector(".header-flyout");
    if (!nt || !flyout || !document.body.classList.contains("d2-home")) return;
    var items = gsap.utils.toArray(".hf-item", flyout);
    if (!items.length) return;
    var open = false;
    var tl = null;

    gsap.set(items, { opacity: 0, x: 20 });
    gsap.set(nt, { rotation: 0 });

    function syncA11y(next) {
      nt.setAttribute("aria-expanded", String(next));
      nt.setAttribute("aria-label", next ? "Close menu" : "Open menu");
      flyout.setAttribute("aria-hidden", String(!next));
      if (window.__demo2) window.__demo2.menuOpen = next;
    }

    function openMenu() {
      if (open) return;
      open = true;
      if (tl) tl.kill();
      flyout.classList.add("is-open");
      syncA11y(true);
      tl = gsap.timeline();
      tl.to(nt, { rotation: 180, duration: 0.55, ease: "power3.inOut" }, 0)
        .fromTo(items,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", stagger: { amount: 0.32, from: "end" } },
          0.08
        );
    }

    function closeMenu() {
      if (!open) return;
      open = false;
      if (tl) tl.kill();
      syncA11y(false);
      tl = gsap.timeline({
        onComplete: function () {
          flyout.classList.remove("is-open");
          gsap.set(items, { opacity: 0, x: 20 });
        }
      });
      tl.to(items,
          { opacity: 0, x: 15, duration: 0.32, ease: "power2.in", stagger: { amount: 0.28, from: "end" } },
          0
        )
        .to(nt, { rotation: 0, duration: 0.55, ease: "power3.inOut" }, 0);
    }

    nt.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (open) closeMenu();
      else openMenu();
    }, { capture: true });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    }, { capture: true });
  })();

  // ---- ScrollTrigger.refresh() hygiene ----
  var rT;
  function debouncedRefresh() {
    clearTimeout(rT);
    rT = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("resize", debouncedRefresh);
  window.addEventListener("orientationchange", debouncedRefresh);
  // Pause Lenis render loop when the tab is hidden (GPU/CPU courtesy).
  document.addEventListener("visibilitychange", function () {
    if (!lenis) return;
    if (document.hidden) { lenis.stop(); } else { lenis.start(); }
  });

  // ---- Lazy-load Three.js + demo2-webgl.js when WebGL is warranted ----
  // Gate: capable desktop, motion allowed, not reduced-motion. The ~600KB
  // three.min.js never loads on mobile/low-power. demo2-webgl.js (Phase D/E)
  // self-inits on load once window.THREE is available.
  // WEBGL_READY flips to true once demo2-webgl.js exists; until then
  // the probe + injection are skipped entirely (no 404, no stray WebGL context).
  var WEBGL_READY = true;
  function shouldInitWebGL() {
    if (!WEBGL_READY) { window.__demo2.webglGate = "ready-off"; return false; }
    if (reduce) { window.__demo2.webglGate = "reduce"; return false; }
    // WebGL 3D scenes are DESSKTOP-ONLY. On phones they're unreliable (low core
    // counts, GPU/thermal limits, iOS pin jank) — mobile shows a CSS/SVG
    // fallback animation instead (guaranteed to render). The fallback is shown
    // via CSS @media (max-width: 767px) which hides the canvas + reveals the
    // .pipe-build__fallback / .specs-reel__fallback elements.
    if (!window.matchMedia("(min-width: 768px)").matches) { window.__demo2.webglGate = "mobile-fallback"; return false; }
    try {
      var c = document.createElement("canvas");
      var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) { window.__demo2.webglGate = "no-webgl"; return false; }
      window.__demo2.webglGate = "ok";
      return true;
    } catch (e) { window.__demo2.webglGate = "err"; return false; }
  }
  function loadScript(src, ordered) {
    var s = document.createElement("script");
    s.src = src;
    s.async = !ordered; // async=false on dynamic scripts preserves insertion order
    document.body.appendChild(s);
    return s;
  }
  function injectWebGL() {
    // Order preserved (async=false): three first, then demo2-webgl.js.
    loadScript("/assets/vendor/three/three.min.js", true);
    loadScript("/assets/js/demo2-webgl.js?v=25", true);
    window.__demo2.webgl = "loading";
  }
  // Defer the WebGL decision until after first paint so it never blocks LCP.
  window.addEventListener("load", function () {
    if (shouldInitWebGL()) injectWebGL();
    else revealPage();
  });

  // ---- Overlay nodes (grain + bg-fallback) created ONCE at init ----
  // No scroll-time DOM injection (MutationObserver-discipline). Both are
  // inert, CSS-driven; the canvas (Phase E) layers above bg-fallback.
  function initOverlays() {
    var grain = document.createElement("div");
    grain.className = "demo2-grain";
    document.body.appendChild(grain);
    var bg = document.createElement("div");
    bg.className = "demo2-bg-fallback";
    document.body.appendChild(bg);
  }

  // ========================================================================
  //  PHASE C — chapter controller + section transitions + reveals
  // ========================================================================
  var EASE = "power3.out";
  var DUR = 0.9;

  function initChapters() {
    revealEls();
    staggerEls();
    parallaxEls();
    countEls();
    chapterTracker();
    transitionWipe();
    window.__demo2.scrollTriggerCount = (ScrollTrigger.getAll() || []).length;
  }

  // Reveal vocabulary: fade-up / fade-down / fade / scale-in / mask-reveal.
  // IMPORTANT: use fromTo (not from) with explicit end values. The CSS gate
  // sets opacity:0 on [data-motion] for FOUC prevention; gsap.from() would read
  // that poisoned value as the "natural" end state and animate 0→0 (no visible
  // change). fromTo bypasses the natural-state read entirely.
  // toggleActions 'play none none reset' → reverse smoothly on scroll-back (animated, not snap)
  // up (leaveBack) so it re-animates on the next pass down.
  function revealEls() {
    var els = gsap.utils.toArray("[data-motion]").filter(function (el) {
      return !el.closest("[data-motion-stagger]"); // stagger parent owns its kids
    });
    els.forEach(function (el) {
      var type = el.getAttribute("data-motion") || "fade-up";
      var st = { trigger: el, start: "top 85%", toggleActions: "play none none reverse" };
      if (type === "fade-up") gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: DUR, ease: EASE, scrollTrigger: st });
      else if (type === "fade-down") gsap.fromTo(el, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: DUR, ease: EASE, scrollTrigger: st });
      else if (type === "fade") gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: DUR, ease: EASE, scrollTrigger: st });
      else if (type === "scale-in") gsap.fromTo(el, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: DUR, ease: EASE, scrollTrigger: st });
      else if (type === "mask-reveal") gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: EASE, scrollTrigger: st });
      else if (type === "bar") gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power3.out", scrollTrigger: st });
    });
  }

  // Stagger: parent [data-motion-stagger] → its direct children animate in sequence.
  // fromTo for the same reason as revealEls (children aren't [data-motion]-gated,
  // but explicit end values are safer + consistent).
  function staggerEls() {
    gsap.utils.toArray("[data-motion-stagger]").forEach(function (parent) {
      gsap.fromTo(parent.children,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.1,
          scrollTrigger: { trigger: parent, start: "top 80%", toggleActions: "play none none reverse" } }
      );
    });
  }

  // Parallax: scrubbed y-shift. scale:1.12 is held in both from+to so the
  // yPercent shift never reveals a gap (parent clips via overflow:hidden).
  function parallaxEls() {
    gsap.utils.toArray('[data-motion="parallax"]').forEach(function (el) {
      gsap.fromTo(el,
        { yPercent: -6, scale: 1.12 },
        { yPercent: 10, scale: 1.12, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
      );
    });
  }

  // Count-up: [data-motion-count] wraps its leading numeric run in a span and
  // counts 0→target on enter. Preserves suffix (e.g. "K") and the .unit span.
  function countEls() {
    gsap.utils.toArray("[data-motion-count]").forEach(function (el) {
      var html = el.innerHTML;
      var m = html.match(/^\d+/);
      if (!m) return;
      var target = parseInt(m[0], 10);
      el.innerHTML = html.replace(/^\d+/, '<span class="d2-count">0</span>');
      var span = el.querySelector(".d2-count");
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out", snap: { v: 1 },
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
        onUpdate: function () { span.textContent = Math.round(obj.v); }
      });
    });
  }

  // Chapter tracker: set <html data-chapter="..."> for the active section.
  // demo2.css / Phase E shaders key off this for mood/grade shifts.
  function chapterTracker() {
    gsap.utils.toArray("[data-motion-chapter]").forEach(function (el) {
      var name = el.getAttribute("data-motion-chapter");
      ScrollTrigger.create({
        trigger: el, start: "top 55%", end: "bottom 45%",
        onToggle: function (self) { if (self.isActive) docEl.setAttribute("data-chapter", name); }
      });
    });
    // Default chapter before any scroll.
    var first = document.querySelector("[data-motion-chapter]");
    if (first) docEl.setAttribute("data-chapter", first.getAttribute("data-motion-chapter"));
  }

  // Transition wipe: a fixed overlay (created ONCE at init — no scroll-time DOM
  // injection, per the MutationObserver-discipline rule) that scales in+out when
  // entering a [data-motion-wipe] section. Reserved for marquee transitions.
  function transitionWipe() {
    var wipe = document.createElement("div");
    wipe.className = "demo2-wipe";
    document.body.appendChild(wipe);
    gsap.set(wipe, { scaleY: 0, transformOrigin: "bottom" });
    gsap.utils.toArray("[data-motion-wipe]").forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: "top 70%",
        onEnter: function () {
          gsap.timeline()
            .set(wipe, { transformOrigin: "bottom" })
            .to(wipe, { scaleY: 1, duration: 0.5, ease: "power2.in" })
            .set(wipe, { transformOrigin: "top" })
            .to(wipe, { scaleY: 0, duration: 0.5, ease: "power2.out" });
        },
        onLeaveBack: function () { gsap.set(wipe, { scaleY: 0 }); }
      });
    });
  }

  // ========================================================================
  //  PHASE F — micro-interactions (custom cursor, magnetic CTAs)
  // ========================================================================
  function initMicroInteractions() {
    // Skip on touch / coarse pointers (no cursor) — CSS already hides it.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    var cursor = document.createElement("div");
    cursor.className = "demo2-cursor";
    document.body.appendChild(cursor);
    docEl.classList.add("cursor-on");

    var xTo = gsap.quickTo(cursor, "x", { duration: 0.12, ease: "power2.out" });
    var yTo = gsap.quickTo(cursor, "y", { duration: 0.12, ease: "power2.out" });
    var hoverSel = "a, button, [data-magnetic], input, select, textarea, [data-lightbox]";

    // The cursor lives inside <html> which carries Demo 1's `zoom:0.8` hack, so
    // a translate(clientX) renders at clientX*0.8 (always 20% left/up of the
    // pointer, and stops short of the right edge). Divide by the live zoom so
    // it lands exactly on the pointer.
    var z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    window.addEventListener("resize", function () {
      z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    });

    window.addEventListener("pointermove", function (e) {
      xTo(e.clientX / z); yTo(e.clientY / z);
      cursor.classList.remove("is-hidden");
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) cursor.classList.add("is-hover");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) cursor.classList.remove("is-hover");
    });
    document.documentElement.addEventListener("pointerleave", function () { cursor.classList.add("is-hidden"); });

    // Magnetic CTAs: translate toward the cursor, reset on leave.
    gsap.utils.toArray("[data-magnetic]").forEach(function (el) {
      var mxTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      var myTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        mxTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        myTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      }, { passive: true });
      el.addEventListener("pointerleave", function () { mxTo(0); myTo(0); });
    });

    // Why-GRP material cards: hover scale via GSAP. The stagger reveal leaves an
    // inline transform on each <li>, which would override a CSS :hover transform
    // (inline wins). GSAP composes scale with that inline transform, so the card
    // scales smoothly (composited, no layout) on hover and resets on leave.
    gsap.utils.toArray(".d2-mat").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        gsap.to(el, { scale: 1.08, duration: 0.42, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { scale: 1, duration: 0.42, ease: "power3.out" });
      });
    });
  }

  // ---- Hero image cinematic reveal (clip-path wipe + settle) on load ----
  function heroReveal() {
    var img = document.querySelector(".hero__media img");
    if (!img) return;
    gsap.fromTo(img,
      { clipPath: "inset(100% 0 0 0)", scale: 1.15 },
      { clipPath: "inset(0% 0 0 0)", scale: 1.02, duration: 1.6, ease: "power3.out", delay: 0.2 }
    );
  }

  // ---- Sticky quick-access chip rail (procurement shortcut) ----
  // Chip href="#id" clicks are already routed through Lenis by the generic
  // a[href^="#"] intercept above. This handles (a) revealing the rail once the
  // hero leaves the top, and (b) highlighting the chip whose target is in view,
  // so a procurement officer can jump straight to Product range / Why GRP /
  // Certifications / Enquire without scrolling the pinned 3D chapters.
  function initJumprail() {
    var rail = document.querySelector(".d2-jumprail");
    if (!rail) return;
    if (initJumprail._sts) { initJumprail._sts.forEach(function (s) { try { s.kill(); } catch (e) {} }); }
    if (initJumprail._mo) { try { initJumprail._mo.disconnect(); } catch (e) {} }
    initJumprail._sts = [];
    var chips = gsap.utils.toArray(".d2-jumprail__chip");
    chips.forEach(function (chip) { chip.classList.remove("is-active"); });
    initJumprail._sts.push(ScrollTrigger.create({
      trigger: document.body,
      start: "top -" + Math.max(80, window.innerHeight * 0.4) + "px",
      onToggle: function (self) { rail.classList.toggle("is-visible", self.isActive); }
    }));
  }
  window.__demo2.initJumprail = initJumprail;

  // ---- Core init sequence (runs now; defer guaranteed DOM-ready) ----
  initOverlays();          // grain + bg-fallback nodes (once)
  heroReveal();            // Phase E: cinematic hero image reveal
  initChapters();          // Phase C: reveals + chapters + parallax + count-up + wipe
  initJumprail();          // sticky chip rail: reveal + active-section highlight
  initMicroInteractions(); // Phase F: custom cursor + magnetic CTAs

  // ?debug overlay — visit /?debug to see the live motion state (helps diagnose
  // mobile: is WebGL loading? is the pipe-build pin active? etc.)
  if (/[?&]debug/.test(location.search)) {
    var dbg = document.createElement("div");
    dbg.style.cssText = "position:fixed;bottom:0;left:0;z-index:99999;background:rgba(0,0,0,.85);color:#7CFC00;font:11px/1.4 monospace;padding:6px 8px;max-width:92vw;word-break:break-all;pointer-events:none;";
    document.body.appendChild(dbg);
    setInterval(function () {
      var d = window.__demo2 || {};
      dbg.textContent = JSON.stringify({
        lenis: d.lenis, webgl: d.webgl, webglGate: d.webglGate, fluidBg: d.fluidBg,
        pipeBuild: d.pipeBuild, specsReel: d.specsReel, stCount: d.scrollTriggerCount,
        ua: (navigator.userAgent||"").slice(0,40), cores: navigator.hardwareConcurrency,
        mem: navigator.deviceMemory, vw: window.innerWidth, scrollY: Math.round(window.scrollY)
      });
    }, 400);
  }

  console.info("[demo2] core ready: lenis=" + window.__demo2.lenis + " reducedMotion=" + reduce + " scrollTriggers=" + window.__demo2.scrollTriggerCount);
})();
