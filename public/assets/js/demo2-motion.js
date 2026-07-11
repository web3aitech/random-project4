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
    return;
  }

  // ---- Libs present + motion allowed → activate the hide gate. ----
  // Adding .demo2-motion is the FIRST action so [data-motion] hides resolve
  // before any animation runs. (Two-class gate: .demo2 + .demo2-motion.)
  var docEl = document.documentElement;
  docEl.classList.add("demo2-motion");

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

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

  // Menu toggle: script.js's nav-toggle handler always opens (setMobile(true));
  // intercept in capture + stopImmediatePropagation so the morphing X icon
  // TOGGLES (open on first click, close on second). Esc + link clicks still
  // close (separate listeners). Pauses Lenis while the overlay is open.
  (function () {
    var nt = document.querySelector(".nav-toggle");
    var mn = document.querySelector(".mobile-nav");
    if (!nt || !mn) return;
    nt.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var next = !mn.classList.contains("open");
      nt.setAttribute("aria-expanded", String(next));
      mn.classList.toggle("open", next);
      document.body.style.overflow = next ? "hidden" : "";
      if (next && mn.focus) mn.focus();
      if (lenis) { if (next) lenis.stop(); else lenis.start(); }
      if (window.__demo2) window.__demo2.menuOpen = next;
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
    if (!WEBGL_READY) return false;
    if (reduce) return false;
    // Note: no min-width gate — modern phones (4+ cores, WebGL) load the
    // pipe-build + specs reel scenes. The always-on fluid bg is gated to
    // desktop inside demo2-webgl (initFluidBackground) to save mobile GPU.
    var cores = navigator.hardwareConcurrency || 2;
    if (cores < 4) return false;
    // Quick WebGL1 probe.
    try {
      var c = document.createElement("canvas");
      var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      return !!gl;
    } catch (e) { return false; }
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
    loadScript("/assets/js/demo2-webgl.js", true);
    window.__demo2.webgl = "loading";
  }
  // Defer the WebGL decision until after first paint so it never blocks LCP.
  window.addEventListener("load", function () {
    if (shouldInitWebGL()) injectWebGL();
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

  // ---- Anatomy: scrubbed cross-section build with labels in sync (Phase G) ----
  // Pinned, scrubbed. Reveals each layer outer→structural→inner→bore with its
  // callout + list item, then draws the Ø2400mm dimension line. Outside-in so
  // each smaller disk leaves the previous layer visible as a ring.
  var anatomyTL = null;
  function initAnatomy() {
    // Kill any previous instance (re-called by demo2-webgl after the pipe-build
    // pin is created, so the anatomy ST measures against the final layout — a
    // pinned ST's start won't otherwise update via refresh() once another pin's
    // spacer shifts it).
    if (anatomyTL) {
      try { anatomyTL.scrollTrigger && anatomyTL.scrollTrigger.kill(); } catch (e) {}
      try { anatomyTL.kill(); } catch (e) {}
      anatomyTL = null;
    }
    var section = document.querySelector('[data-motion-chapter="anatomy"]');
    var svg = section && section.querySelector(".pipe-diagram");
    if (!section || !svg) return;
    var circles = svg.querySelectorAll("circle");
    if (circles.length < 5) return;
    var outer = circles[0], structural = circles[1], inner = circles[2], bore = circles[3], ring = circles[4];
    var callouts = svg.querySelectorAll("g.callout");       // [0]=01 inner, [1]=02 structural, [2]=03 outer
    var dimText = svg.querySelector("text.callout");
    var dims = svg.querySelectorAll(".dim");
    var list = section.querySelectorAll(".d2-anatomy-list li"); // [0]=l1 inner, [1]=l2 structural, [2]=l3 outer

    // dim lines already hidden via the gate CSS (dashoffset 300); animate to 0.
    // Build completes by t=4.0 (progress ~0.8); a final 1s hold lets the finished
    // diagram breathe before the pin releases, so the build never feels cut off.
    var tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=200%", pin: true, scrub: true, anticipatePin: 1,
        invalidateOnRefresh: true }
    });
    // 1) Outer liner (gray) + 03 outer label + list l3
    tl.to(outer, { opacity: 1, duration: 1 }, 0)
      .to(callouts[2], { opacity: 1, duration: 0.6 }, 0.15)
      .to(list[2], { opacity: 1, duration: 0.6 }, 0.15)
      // 2) Structural (blue) + 02 + list l2
      .to(structural, { opacity: 1, duration: 1 }, 1.0)
      .to(callouts[1], { opacity: 1, duration: 0.6 }, 1.15)
      .to(list[1], { opacity: 1, duration: 0.6 }, 1.15)
      // 3) Inner liner (gold) + 01 + list l1
      .to(inner, { opacity: 1, duration: 1 }, 2.0)
      .to(callouts[0], { opacity: 1, duration: 0.6 }, 2.15)
      .to(list[0], { opacity: 1, duration: 0.6 }, 2.15)
      // 4) Bore + ring outline + dimension line draw + dimension text
      .to(bore, { opacity: 1, duration: 0.6 }, 3.0)
      .to(ring, { opacity: 1, duration: 0.5 }, 3.1)
      .to(dims, { strokeDashoffset: 0, duration: 0.8, ease: "none" }, 3.2)
      .to(dimText, { opacity: 1, duration: 0.4 }, 3.6)
      // 5) Hold on the completed diagram (absorbs scrub lag; pin releases cleanly)
      .to({}, { duration: 1.0 }, 4.0);
    anatomyTL = tl;
    window.__demo2.scrollTriggerCount = (ScrollTrigger.getAll() || []).length;
  }
  // Exposed so demo2-webgl can re-run it after the pipe-build pin is created.
  window.__demo2.initAnatomy = initAnatomy;

  // ---- Core init sequence (runs now; defer guaranteed DOM-ready) ----
  initOverlays();          // grain + bg-fallback nodes (once)
  heroReveal();            // Phase E: cinematic hero image reveal
  initChapters();          // Phase C: reveals + chapters + parallax + count-up + wipe
  initAnatomy();           // Phase G: scrubbed cross-section build with labels
  initMicroInteractions(); // Phase F: custom cursor + magnetic CTAs

  console.info("[demo2] core ready: lenis=" + window.__demo2.lenis + " reducedMotion=" + reduce + " scrollTriggers=" + window.__demo2.scrollTriggerCount);
})();
