/* =========================================================================
   demo2-webgl.js — lazy-loaded Three.js layer (the "Down the Pipe" journey)
   Injected by demo2-motion.js core (async=false, after three.min.js) ONLY on
   capable desktops with motion allowed. Self-inits on load.

   ONE continuous scroll-driven 3D journey through a vertical GRP pipe:
   hero (camera outside, side view of the pipe + its top circular opening) →
   the camera turns to look down into the opening → descends through the bore
   past each section as a "station" (content overlays cross-fade) → exits the
   bottom ("poop out") onto the enquire form.

   Reuses the existing patterns: scrubbed camera via a tweened plain object,
   ONE pinned ScrollTrigger, render-loop-only-while-active, boundary reset on
   leave, failNoWebgl fallback. Procedural geometry only; no external 3D model.
   ========================================================================= */
(function () {
  "use strict";

  var THREE = window.THREE;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!THREE || !gsap || !ScrollTrigger) {
    console.info("[demo2-webgl] missing deps — skipping");
    return;
  }
  window.__demo2.webgl = true;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Helpers ----
  function smoothstep(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // =========================================================================
  //  THE PIPE JOURNEY — the single continuous scroll-driven 3D chapter.
  // =========================================================================
  function initPipeJourney() {
    var stage = document.querySelector("[data-pipe-journey]");
    var canvasEl = document.querySelector("[data-pipe-journey-canvas]");
    if (!stage || !canvasEl) return;

    // ---- Renderer ----
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (e) { failNoWebgl(); return; }
    if (!renderer.getContext || !renderer.getContext()) { failNoWebgl(); return; }

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060D2E);
    scene.fog = new THREE.FogExp2(0x060D2E, 0.013); // light fog — the pipe is clearly visible at the hero distance, depth during descent
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

    // ---- Lighting: a camera-attached point light (lights the bore around the
    // camera; far parts fall into fog) + low ambient + a warm rim. ----
    scene.add(new THREE.AmbientLight(0x4a5a7a, 0.6));
    var camLight = new THREE.PointLight(0xffffff, 1.5, 30, 1.4);
    scene.add(camLight);
    var rim = new THREE.DirectionalLight(0xDBB85C, 0.8); rim.position.set(-8, 4, -6); scene.add(rim);
    var key = new THREE.DirectionalLight(0xffffff, 0.6); key.position.set(8, 6, 8); scene.add(key);

    // ---- The vertical layered GRP pipe (along Y). 3 nested open cylinders
    // (outer gray / structural blue / inner gold) + the bore. Open top + bottom
    // so the cross-section rings (the 3 layers) are visible at both openings. ----
    var L = 32;   // pipe length
    var R = 2.4;  // bore radius (inner liner)
    function layer(r, color, rough, metal, map) {
      var mat = new THREE.MeshStandardMaterial({
        color: color, metalness: metal != null ? metal : 0.1, roughness: rough,
        side: THREE.DoubleSide
      });
      if (map) { mat.map = map; mat.needsUpdate = true; }
      var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 96, 1, true), mat);
      scene.add(m);
      return m;
    }
    var outerM  = layer(R + 0.20, 0x9AA6B5, 0.5, 0.2);            // outer liner (gray)
    var structM = layer(R + 0.10, 0x1E4D72, 0.6, 0.1);           // structural (blue)
    var innerM = layer(R, 0xDBB85C, 0.32, 0.1, makeFilamentTexture()); // inner liner (gold, filament texture)
    innerM.material.side = THREE.BackSide; // visible from inside the bore, hidden from the exterior hero side-view
    innerM.material.emissive = new THREE.Color(0x3a2a10);
    innerM.material.emissiveIntensity = 0.25;

    // ---- Filament-winding texture: a canvas gold helix on the inner wall.
    // Reads as the wound-glass pattern scrolling past during descent. ----
    function makeFilamentTexture() {
      var c = document.createElement("canvas"); c.width = 256; c.height = 1024;
      var g = c.getContext("2d");
      var grd = g.createLinearGradient(0, 0, 0, 1024);
      grd.addColorStop(0, "#7a5e1a"); grd.addColorStop(0.5, "#C9A227"); grd.addColorStop(1, "#7a5e1a");
      g.fillStyle = grd; g.fillRect(0, 0, 256, 1024);
      // diagonal helix bands (gold winding)
      g.lineCap = "round";
      for (var pass = 0; pass < 2; pass++) {
        g.strokeStyle = pass === 0 ? "rgba(255,235,170,0.55)" : "rgba(120,90,30,0.4)";
        g.lineWidth = pass === 0 ? 3 : 2;
        var dir = pass === 0 ? 1 : -1;
        for (var y0 = -300; y0 < 1320; y0 += 36) {
          g.beginPath();
          for (var x = -20; x <= 276; x += 4) {
            var yy = y0 + dir * x * 0.55;
            if (x <= -16) g.moveTo(x, yy); else g.lineTo(x, yy);
          }
          g.stroke();
        }
      }
      var t = new THREE.CanvasTexture(c);
      if ("SRGBColorSpace" in THREE) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(8, 4);
      return t;
    }

    // ---- End rings (torus) at the top + bottom openings — emphasize the
    // layered cross-section edge (visible at the hero + exit). ----
    var ringMat = new THREE.MeshStandardMaterial({ color: 0xDBB85C, emissive: 0xC9A227, emissiveIntensity: 0.4, metalness: 0.6, roughness: 0.3 });
    function endRing(y) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.22, 0.05, 12, 96), ringMat);
      ring.position.y = y; ring.rotation.x = Math.PI / 2; // lie in X-Z plane (the opening)
      scene.add(ring);
    }
    endRing(L / 2);   // top opening
    endRing(-L / 2);  // bottom opening

    // ---- Camera keyframes (stops). progress 0→1 → camera pos + lookAt.
    // 0.00–0.06 hero side → 0.16 rise above the opening → 0.26 dive straight
    // down through the opening into the bore → 0.50 mid descend → 0.88 near
    // bottom → 1.00 settle + dissolve into the form. ----
    var stops = [
      { at: 0.00, px: 20, py: 5,  pz: 20,  lx: 0, ly: 3,   lz: 0 },   // hero side — pipe visible in the lower frame, below the hero text
      { at: 0.06, px: 20, py: 5,  pz: 20,  lx: 0, ly: 3,   lz: 0 },   // hero hold (brief)
      { at: 0.16, px: 0,  py: 24, pz: 0.5, lx: 0, ly: 16,  lz: 0 },   // rise: camera moves up + over the top opening, looking straight down at the gold ring
      { at: 0.26, px: 0,  py: 14, pz: 0.5, lx: 0, ly: 6,   lz: 0 },   // dive: camera drops straight down through the opening into the bore
      { at: 0.50, px: 0,  py: 0,  pz: 0.6, lx: 0, ly: -5,  lz: 0 },   // mid descend
      { at: 0.88, px: 0,  py: -13, pz: 0.6, lx: 0, ly: -18, lz: 0 }, // near bottom — camera slows, approaches the bottom opening
      { at: 1.00, px: 0,  py: -17, pz: 0.6, lx: 0, ly: -22, lz: 0 }  // settle at the bottom opening → canvas dissolves into the form
    ];
    function camTargetForProgress(p) {
      var i = 0;
      while (i < stops.length - 1 && p > stops[i + 1].at) i++;
      var a = stops[Math.max(0, i)];
      var b = stops[Math.min(stops.length - 1, i + 1)];
      var t = smoothstep(a.at, b.at, p);
      return {
        px: lerp(a.px, b.px, t), py: lerp(a.py, b.py, t), pz: lerp(a.pz, b.pz, t),
        lx: lerp(a.lx, b.lx, t), ly: lerp(a.ly, b.ly, t), lz: lerp(a.lz, b.lz, t)
      };
    }
    var lookCur = new THREE.Vector3(stops[0].lx, stops[0].ly, stops[0].lz);
    camera.position.set(stops[0].px, stops[0].py, stops[0].pz);
    camera.lookAt(lookCur);
    camLight.position.copy(camera.position);

    // ---- Hero overlay (the small text at the top). Fades out as the camera
    // begins turning (progress 0 → 0.06). ----
    var heroEl = document.querySelector("[data-pipe-hero]");

    // ---- Station overlays (HTML .pj-station panels). Fade in/out at progress
    // ranges via updateStations(). ----
    var stationEls = gsap.utils.toArray(".pj-station");
    var STATIONS = [
      { at: 0.16, end: 0.38 }, // capabilities — earlier + longer (first info section)
      { at: 0.38, end: 0.50 }, // about
      { at: 0.50, end: 0.64 }, // range
      { at: 0.64, end: 0.78 }, // why-grp
      { at: 0.78, end: 0.90 }  // certs
    ];
    function updateStations(p) {
      for (var i = 0; i < stationEls.length && i < STATIONS.length; i++) {
        var s = STATIONS[i];
        var op = smoothstep(s.at, s.at + 0.03, p) * (1 - smoothstep(s.end - 0.03, s.end, p));
        stationEls[i].style.opacity = op;
        stationEls[i].style.pointerEvents = op > 0.1 ? "auto" : "none";
      }
    }

    // ---- Sizing ----
    function resize() {
      var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // ---- ONE pinned ScrollTrigger drives the whole journey. ----
    var active = false;
    var target = { p: 0 };
    window.__demo2.pipeJourney = { active: false, progress: 0, renderCount: 0 };
    var journeyTween = gsap.to(target, {
      p: 1, ease: "none",
      scrollTrigger: {
        trigger: stage, start: "top top", end: "+=700%", pin: true, scrub: true,
        anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: function () { active = true; },
        onLeave: function () { leaveJourney(1); },
        onEnterBack: function () { active = true; },
        onLeaveBack: function () { leaveJourney(0); },
        onUpdate: function (self) {
          target.p = self.progress;
          updateStations(self.progress);
          window.__demo2.pipeJourney.progress = self.progress;
        }
      }
    });

    // ---- Boundary reset: snap to the boundary frame + render once on leave so
    // a fast scroll never freezes the canvas on a random mid-frame. The exit
    // stop is the LAST stop (camera below the pipe, fog-receded → seamless
    // dark handoff to the enquire form below). ----
    // ---- Smoothed progress — the single scalar that drives the camera. On
    // fast scroll-back the raw target.p jumps, but smoothP eases toward it
    // with a VARIABLE damping factor: high for large deltas (catches up
    // quickly = no lag/jitter on fast scroll), low for small (silky on slow).
    // The camera is computed directly from smoothP via camTargetForProgress
    // (which uses smoothstep between stops) — so the camera follows the eased
    // path smoothly, no position-lerp jitter. ----
    var smoothP = 0;
    function leaveJourney(boundary) {
      active = false;
      smoothP = boundary; // snap the smoothed progress to the boundary
      var stop = boundary >= 1 ? stops[stops.length - 1] : stops[0];
      camera.position.set(stop.px, stop.py, stop.pz);
      lookCur.set(stop.lx, stop.ly, stop.lz); camera.lookAt(lookCur);
      camLight.position.copy(camera.position);
      updateStations(boundary);
      if (heroEl) heroEl.style.opacity = boundary >= 1 ? 0 : 1;
      canvasEl.style.opacity = boundary >= 1 ? 0 : 1;
      renderer.render(scene, camera);
    }

    // ---- Render loop: smooth the progress, compute camera from it, only while
    // the journey is active. The camera-attached light follows. ----
    gsap.ticker.add(function () {
      window.__demo2.pipeJourney.active = active;
      if (!active) return;
      // Variable damping: 0.05 for slow scroll (silky), up to 0.3 for fast
      // scroll (catches up quickly = no lag on fast scroll-back).
      var delta = Math.abs(target.p - smoothP);
      var k = Math.min(0.3, 0.05 + delta * 1.5);
      smoothP = lerp(smoothP, target.p, k);
      var t = camTargetForProgress(smoothP);
      camera.position.set(t.px, t.py, t.pz);
      lookCur.set(t.lx, t.ly, t.lz);
      var now = performance.now();
      camera.position.z += Math.sin(now / 1400) * 0.015; // subtle breath
      camera.lookAt(lookCur);
      camLight.position.copy(camera.position);
      // Hero overlay fades out as the camera turns (using smoothP, not raw).
      if (heroEl) heroEl.style.opacity = 1 - smoothstep(0, 0.06, smoothP);
      // Canvas dissolves at the end (smoothP, not raw). Starts earlier (0.86)
      // so the pipe fades gradually as the form emerges below.
      canvasEl.style.opacity = 1 - smoothstep(0.86, 1.0, smoothP);
      camLight.position.copy(camera.position);
      renderer.render(scene, camera);
      window.__demo2.pipeJourney.renderCount++;
    });

    // Initial frame: sync to ScrollTrigger's current progress immediately so
    // reloads at a restored scroll position don't flash the hero overlay.
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    target.p = journeyTween.scrollTrigger ? journeyTween.scrollTrigger.progress : 0;
    smoothP = target.p;
    updateStations(target.p);
    var initial = camTargetForProgress(target.p);
    camera.position.set(initial.px, initial.py, initial.pz);
    lookCur.set(initial.lx, initial.ly, initial.lz);
    if (heroEl) heroEl.style.opacity = 1 - smoothstep(0, 0.06, target.p);
    canvasEl.style.opacity = 1 - smoothstep(0.86, 1.0, target.p);
    camera.lookAt(lookCur); camLight.position.copy(camera.position);
    renderer.render(scene, camera);
    if (window.__demo2RevealPage) window.__demo2RevealPage();

    window.addEventListener("resize", function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });

    function failNoWebgl() {
      document.documentElement.classList.add("demo2-no-webgl");
      window.__demo2.webgl = false;
      if (window.__demo2RevealPage) window.__demo2RevealPage();
      console.info("[demo2-webgl] pipe journey: WebGL unavailable — CSS fallback shown");
    }
  }

  // =========================================================================
  //  Fluid shader background (Phase E) — preserved unchanged.
  //  Inert on the home one-pager (opaque section gradients hide it); active on
  //  interior pages (none built in this demo). Desktop-only.
  // =========================================================================
  var CHAPTER_TINT = {
    hero:        [0x060D2E, 0x0C1B64],
    "pipe-journey":[0x03060f, 0x0B1650],
    capabilities:[0x0A1547, 0x0C1B64],
    about:       [0x060D2E, 0x0C1B64],
    range:       [0x060D2E, 0x0C1B64],
    "why-grp":   [0x060D2E, 0x0C1B64],
    certs:       [0x0A1547, 0x0C1B64],
    enquire:     [0x060D2E, 0x0B1650]
  };
  function initFluidBackground() {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (document.body && document.body.classList.contains("d2-home")) return;
    var canvas = document.querySelector(".demo2-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "demo2-canvas";
      document.body.appendChild(canvas);
    }
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    } catch (e) { fluidFail(canvas); return; }
    if (!renderer.getContext || !renderer.getContext()) { fluidFail(canvas); return; }

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var uniforms = {
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
      uColA: { value: new THREE.Color(0x060D2E) }, uColB: { value: new THREE.Color(0x0C1B64) },
      uGrain: { value: 0.04 }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: ["void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }"].join("\n"),
      fragmentShader: [
        "precision mediump float;",
        "uniform vec2 uRes; uniform float uTime; uniform vec3 uColA; uniform vec3 uColB; uniform float uGrain;",
        "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }",
        "float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);",
        "  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }",
        "float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }",
        "void main(){",
        "  vec2 uv = gl_FragCoord.xy/uRes;",
        "  vec2 q = uv*1.6;",
        "  q.x += uTime*0.018;",
        "  q.y += uTime*0.012;",
        "  float n = fbm(q + 0.5*fbm(q + vec2(uTime*0.025, 0.0)));",
        "  vec3 col = mix(uColA, uColB, smoothstep(0.18, 0.85, n));",
        "  float vig = smoothstep(1.25, 0.35, length(uv-0.5));",
        "  col *= mix(0.72, 1.0, vig);",
        "  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))+uTime)*43758.5453);",
        "  col += (g-0.5)*uGrain;",
        "  gl_FragColor = vec4(col, 1.0);",
        "}"
      ].join("\n")
    });
    var quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    function resize() {
      var z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      var w = (window.innerWidth / z) || 1, h = (window.innerHeight / z) || 1;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * (window.devicePixelRatio || 1), h * (window.devicePixelRatio || 1));
    }
    resize();
    window.addEventListener("resize", resize);

    function applyTint() {
      var ch = document.documentElement.getAttribute("data-chapter");
      var pair = CHAPTER_TINT[ch] || CHAPTER_TINT["hero"];
      uniforms.uColA.value.setHex(pair[0]);
      uniforms.uColB.value.setHex(pair[1]);
    }
    applyTint();
    var tintObs = new MutationObserver(applyTint);
    tintObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-chapter"] });

    var visible = true;
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; });

    gsap.ticker.add(function () {
      if (!visible) return;
      uniforms.uTime.value += 0.016;
      renderer.render(scene, camera);
    });
    window.__demo2.fluidBg = true;

    function fluidFail(c) {
      if (c && c.parentNode) c.parentNode.removeChild(c);
      document.documentElement.classList.add("demo2-no-webgl");
      console.info("[demo2-webgl] fluid bg unavailable — CSS fallback");
    }
  }

  // ---- Init (defer guaranteed DOM-ready; three.min.js loaded before this) ----
  if (reduce) {
    window.__demo2.webgl = false;
    document.documentElement.classList.add("demo2-no-webgl");
    return;
  }
  var inited = false;
  function start() {
    if (inited) return;
    inited = true;
    initFluidBackground();
    initPipeJourney(); // ONE pin — no ordering fragility (single pinned ST).
    // Enquire section: smooth fade-in as it enters the viewport after the pipe
    // exit. The content is NOT gate-hidden (no data-motion) so it's visible
    // immediately; this just adds a silky opacity + slide as the section scrolls
    // in, making the pipe→form handoff feel like one continuous motion.
    var enquire = document.querySelector("#enquire");
    if (enquire) {
      gsap.fromTo(enquire, { opacity: 0 }, {
        opacity: 1, duration: 1.0, ease: "power2.out",
        scrollTrigger: { trigger: enquire, start: "top 95%", toggleActions: "play none none reverse" }
      });
    }
    if (window.__demo2 && typeof window.__demo2.initJumprail === "function") {
      window.__demo2.initJumprail();
    }
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }
  if (window.ScrollTrigger) window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
})();
