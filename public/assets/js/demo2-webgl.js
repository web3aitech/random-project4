/* =========================================================================
   demo2-webgl.js — lazy-loaded Three.js layer (Phase D: pipe-build scene)
   Injected by demo2-motion.js core (async=false, after three.min.js) ONLY on
   capable desktops with motion allowed. Self-inits on load.

   Phase D: the signature "pipes building as you scroll" chapter — a pinned
   ScrollTrigger scrubs a procedural GRP pipe build (mandrel rotation →
   filament helix winding → resin cure → saw cut to length → finished pipe
   stays put). All geometry is procedural; no external 3D model.
   Phase E (shader bg + post) will be added here too.
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

  // ---- Smoothstep helper ----
  function smoothstep(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // ---- Caption steps (verified against the source's Production Process page:
  // Continuous Filament Winding / Reciprocal Helical Winding — glass roving
  // impregnated with resin wound onto a rotating steel mandrel, layered, cured,
  // then cut to length by a synchronized saw. No flanges — those are a separate
  // fittings product, not a straight-pipe production step.) ----
  var STEPS = [
    { at: 0.00, text: "A steel mandrel begins to rotate." },
    { at: 0.15, text: "Glass roving, impregnated with resin, is wound onto the mandrel in a prescribed pattern." },
    { at: 0.45, text: "Layers build up — inner liner, structural wall, outer liner — as the resin cures." },
    { at: 0.72, text: "After curing, a synchronized saw cuts the pipe to length." },
    { at: 0.90, text: "The finished GRP pipe is ready for testing and dispatch." }
  ];

  function initPipeBuild() {
    var stage = document.querySelector("[data-pipe-build-stage]");
    var canvasEl = document.querySelector("[data-pipe-build-canvas]");
    var captionEl = document.querySelector("[data-pipe-build-caption]");
    if (!stage || !canvasEl) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (e) {
      failNoWebgl();
      return;
    }
    var gl = renderer.getContext && renderer.getContext();
    if (!gl) { failNoWebgl(); return; }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0.6, 1.4, 5.6);
    camera.lookAt(0, 0, 0);

    // ---- Lighting: industrial key + warm rim + cool fill ----
    scene.add(new THREE.AmbientLight(0x2a3a5a, 0.7));
    var key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(3, 5, 4); scene.add(key);
    var rim = new THREE.DirectionalLight(0xDBB85C, 0.7); rim.position.set(-4, 2.5, -3); scene.add(rim);
    var fill = new THREE.DirectionalLight(0x4a6a9a, 0.4); fill.position.set(0, -3, 2); scene.add(fill);

    // ---- Mandrel (the rotating drum) ----
    var MANDREL_LEN = 4.2, MANDREL_R = 0.5;
    var mandrel = new THREE.Mesh(
      new THREE.CylinderGeometry(MANDREL_R, MANDREL_R, MANDREL_LEN, 48, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x8a97a8, metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide })
    );
    mandrel.rotation.z = Math.PI / 2; // lay along X
    scene.add(mandrel);

    // Mandrel end caps (so it reads as a solid drum)
    var capMat = new THREE.MeshStandardMaterial({ color: 0x4a5566, metalness: 0.8, roughness: 0.3 });
    var capGeo = new THREE.CircleGeometry(MANDREL_R, 48);
    var capA = new THREE.Mesh(capGeo, capMat); capA.position.x = -MANDREL_LEN / 2; capA.rotation.y = -Math.PI / 2; scene.add(capA);
    var capB = new THREE.Mesh(capGeo, capMat); capB.position.x = MANDREL_LEN / 2; capB.rotation.y = Math.PI / 2; scene.add(capB);

    // ---- Structural pipe wall (grows opaque as resin cures) ----
    var pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(MANDREL_R + 0.02, MANDREL_R + 0.02, MANDREL_LEN, 64, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x214B6E, metalness: 0.1, roughness: 0.65,
        transparent: true, opacity: 0, side: THREE.DoubleSide
      })
    );
    pipe.rotation.z = Math.PI / 2;
    scene.add(pipe);
    var pipeMat = pipe.material;

    // ---- Filament helices (wound glass) ----
    function makeHelix(turns, radius, length, phase, segments) {
      var pts = [];
      for (var i = 0; i <= segments; i++) {
        var t = i / segments;
        var ang = t * turns * Math.PI * 2 + phase;
        pts.push(new THREE.Vector3((t - 0.5) * length, Math.cos(ang) * radius, Math.sin(ang) * radius));
      }
      return new THREE.CatmullRomCurve3(pts);
    }
    function makeFilament(turns, phase) {
      var curve = makeHelix(turns, MANDREL_R + 0.025, MANDREL_LEN, phase, 220);
      var geo = new THREE.TubeGeometry(curve, 220, 0.012, 6, false);
      var mat = new THREE.MeshStandardMaterial({
        color: 0xDBB85C, emissive: 0xC9A227, emissiveIntensity: 0.35,
        metalness: 0.5, roughness: 0.4
      });
      var m = new THREE.Mesh(geo, mat);
      m.userData.totalVerts = geo.index ? geo.index.count : geo.attributes.position.count;
      m.userData.indexed = !!geo.index;
      return m;
    }
    var filA = makeFilament(7, 0);
    var filB = makeFilament(7, Math.PI);
    scene.add(filA, filB);

    function setFilamentProgress(m, p) {
      var n = Math.max(0, Math.floor(m.userData.totalVerts * p));
      m.geometry.setDrawRange(0, n);
    }
    setFilamentProgress(filA, 0);
    setFilamentProgress(filB, 0);

    // ---- Saw (cuts the cured pipe to length — the real post-cure step per
    // the source, replacing the earlier invented flange-seating) ----
    var sawGeo = new THREE.TorusGeometry(MANDREL_R + 0.16, 0.014, 8, 48);
    var sawMat = new THREE.MeshStandardMaterial({
      color: 0xDBB85C, emissive: 0xC9A227, emissiveIntensity: 0.9,
      metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0
    });
    var saw = new THREE.Mesh(sawGeo, sawMat);
    saw.rotation.y = Math.PI / 2;
    saw.visible = false;
    scene.add(saw);

    // ---- (No end advance — the finished pipe stays put; scroll continues.) ----

    // ---- Sizing ----
    function resize() {
      var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // ---- Caption + progress UI ----
    var lastStep = -1;
    function updateCaption(p) {
      var idx = 0;
      for (var i = 0; i < STEPS.length; i++) { if (p >= STEPS[i].at) idx = i; }
      if (idx !== lastStep) {
        lastStep = idx;
        if (captionEl) {
          gsap.fromTo(captionEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
          captionEl.textContent = STEPS[idx].text;
        }
      }
    }

    // ---- Scene state from a single progress value 0→1 ----
    var cureColor = new THREE.Color(0xDBB85C); // warm curing tint
    var finalColor = new THREE.Color(0x214B6E); // finished structural blue
    var tmpColor = new THREE.Color();

    function applyProgress(p) {
      // Mandrel rotation: spins throughout, faster mid-build.
      mandrel.rotation.x = p * Math.PI * 14;
      capA.rotation.y = -Math.PI / 2; capB.rotation.y = Math.PI / 2; // caps don't spin visibly (circles)

      // Filament winding: grows 0→full over 0.1→0.7, second lags slightly.
      var filP1 = smoothstep(0.10, 0.70, p);
      var filP2 = smoothstep(0.18, 0.74, p);
      setFilamentProgress(filA, filP1);
      setFilamentProgress(filB, filP2);

      // Resin cure / wall opacity: 0.30→0.80, color warms→cools.
      var cure = smoothstep(0.30, 0.85, p);
      pipeMat.opacity = cure * 0.92;
      tmpColor.copy(cureColor).lerp(finalColor, cure);
      pipeMat.color.copy(tmpColor);
      pipeMat.emissive = pipeMat.emissive || new THREE.Color();
      pipeMat.emissive.setScalar(0); // keep simple

      // Saw cut: a glowing ring sweeps along the pipe from left to right
      // during 0.72–0.88 (the synchronized saw cutting to length), then fades.
      var sawPos = smoothstep(0.72, 0.88, p);
      saw.position.x = -MANDREL_LEN / 2 + sawPos * MANDREL_LEN;
      var sawFade = p < 0.72 ? 0 : (p < 0.88 ? 0.95 : Math.max(0, 0.95 * (1 - smoothstep(0.88, 0.95, p))));
      sawMat.opacity = sawFade;
      saw.visible = sawFade > 0.02;

      // No end slide — the finished pipe stays put and the scroll continues to
      // the next section. (Camera fixed at its build position.)

      updateCaption(p);
    }

    // ---- ScrollTrigger pin + scrub ----
    var active = false;
    var obj = { v: 0 };
    var st = null;
    st = gsap.to(obj, {
      v: 1, ease: "none",
      scrollTrigger: {
        trigger: stage, start: "top top", end: "+=220%", pin: true, scrub: true,
        anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: function () { active = true; },
        onLeave: function () { active = false; },
        onEnterBack: function () { active = true; },
        onLeaveBack: function () { active = false; },
        onUpdate: function (self) { applyProgress(self.progress); window.__demo2.pipeBuild.progress = self.progress; }
      }
    });

    // ---- Render loop (only while the chapter is active) ----
    var renderCount = 0;
    window.__demo2.pipeBuild = { active: false, renderCount: 0, progress: 0 };
    gsap.ticker.add(function () {
      window.__demo2.pipeBuild.active = active; // reflect closure state every frame
      if (!active) return;
      // subtle idle rotation of filaments' emissive pulse
      filA.material.emissiveIntensity = 0.3 + 0.15 * Math.sin(performance.now() / 400);
      filB.material.emissiveIntensity = filA.material.emissiveIntensity;
      renderer.render(scene, camera);
      renderCount++;
      window.__demo2.pipeBuild.renderCount = renderCount;
    });

    // Initial state + one render so it isn't blank before first scroll.
    applyProgress(0);
    renderer.render(scene, camera);

    window.addEventListener("resize", function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });

    function failNoWebgl() {
      document.documentElement.classList.add("demo2-no-webgl");
      window.__demo2.webgl = false;
      console.info("[demo2-webgl] WebGL unavailable — CSS fallback shown");
    }
  }

  // ---- Fluid shader background (Phase E) ----
  // A fixed full-screen canvas (z-index:-1) rendering a slow FBM gradient in
  // brand colors, tinted per chapter. Dark sections are made translucent in
  // demo2.css so this bleeds through; light sections stay opaque for legibility.
  // Zoom-aware sizing: html{zoom:0.8} would leave a gap with naive 100vw sizing,
  // so the canvas is sized to innerWidth/zoom × innerHeight/zoom.
  var CHAPTER_TINT = {
    hero:        [0x060D2E, 0x0C1B64],
    stats:       [0x0A1547, 0x0E1E73],
    intro:       [0x0A1547, 0x0C1B64],
    process:     [0x060D2E, 0x0C1B64],
    "pipe-build":[0x03060f, 0x0B1650],
    anatomy:     [0x060D2E, 0x1a2a55],
    certs:       [0x0A1547, 0x0C1B64],
    flowtite:    [0x060D2E, 0x0C1B64],
    enquire:     [0x060D2E, 0x0B1650]
  };
  function initFluidBackground() {
    // Always-on fluid shader is desktop-only — on phones it would drain GPU/
    // battery for a background. Mobile falls back to the dark .demo2-bg-fallback
    // gradient; the pinned pipe-build + specs scenes still load on mobile.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    // The home one-pager uses opaque chaining section gradients (navy→black)
    // for its background, so the fluid would be hidden — skip it to save GPU.
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
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uColA: { value: new THREE.Color(0x060D2E) },
      uColB: { value: new THREE.Color(0x0C1B64) },
      uGrain: { value: 0.04 }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: [
        "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }"
      ].join("\n"),
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
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * (window.devicePixelRatio || 1), h * (window.devicePixelRatio || 1));
    }
    resize();
    window.addEventListener("resize", resize);

    // Chapter tinting: watch <html data-chapter>.
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

  // ---- Specs reel: cinematic metric tour (Phase G) ----
  // A single GRP pipe; the camera moves through three eased "moments" like a
  // car-engine ad panning between parts: diameter (end view) → pressure (mid
  // wall, internal glow pulsing) → length (zoom out, dimension line). Scrubbed,
  // pinned. Metric UI crossfades per stop.
  function initSpecsScene() {
    var stage = document.querySelector("[data-specs-stage]");
    var canvasEl = document.querySelector("[data-specs-canvas]");
    if (!stage || !canvasEl) return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (e) { return; }
    if (!renderer.getContext || !renderer.getContext()) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);

    scene.add(new THREE.AmbientLight(0x2a3a5a, 0.7));
    var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0xDBB85C, 0.6); rim.position.set(-5, 3, -4); scene.add(rim);

    // ---- The pipe (along X, length 12, x -6..6) ----
    var LEN = 12, R = 1.2;
    var pipe = new THREE.Group();
    function tube(radius, color, side, rough) {
      var m = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, LEN, 64, 1, true),
        new THREE.MeshStandardMaterial({ color: color, metalness: 0.15, roughness: rough != null ? rough : 0.6, side: side || THREE.DoubleSide })
      );
      m.rotation.z = Math.PI / 2;
      pipe.add(m);
      return m;
    }
    var outerM = tube(R, 0xB7C2CF, THREE.DoubleSide, 0.6);            // outer liner (gray)
    var structM = tube(R * 0.96, 0x214B6E, THREE.DoubleSide, 0.65);   // structural (blue)
    var innerM = tube(R * 0.92, 0xDBB85C, THREE.DoubleSide, 0.5);     // inner liner (gold)
    var boreM = tube(R * 0.88, 0x0E3045, THREE.BackSide, 0.9);        // bore interior
    scene.add(pipe);

    // Internal pressure glow (visible at the pressure stop)
    var pressure = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.78, R * 0.78, LEN * 0.92, 48, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xDBB85C, emissive: 0xC9A227, emissiveIntensity: 0.7, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    pressure.rotation.z = Math.PI / 2;
    scene.add(pressure);

    // Length dimension line + end ticks (visible at the length stop)
    var dimMat = new THREE.MeshStandardMaterial({ color: 0xDBB85C, emissive: 0xDBB85C, emissiveIntensity: 0.5, transparent: true, opacity: 0 });
    var dimLine = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, LEN, 8), dimMat);
    dimLine.rotation.z = Math.PI / 2; dimLine.position.y = R + 1.0; scene.add(dimLine);
    var tickGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
    var tickA = new THREE.Mesh(tickGeo, dimMat); tickA.position.set(-LEN / 2, R + 1.0, 0); scene.add(tickA);
    var tickB = new THREE.Mesh(tickGeo, dimMat); tickB.position.set(LEN / 2, R + 1.0, 0); scene.add(tickB);

    // ---- Camera keyframes (3 stops) ----
    var stops = [
      { px: 10.5, py: 0.4, pz: 0.6, lx: 6, ly: 0, lz: 0 },  // 0: diameter — end face; pulled back so full Ø2400 circle fits
      { px: 0.0, py: 2.6, pz: 4.4, lx: 0, ly: 0, lz: 0 },   // 1: pressure — mid wall, outside
      { px: 0.0, py: 6.5, pz: 18,  lx: 0, ly: 0, lz: 0 }    // 2: length — far back, full pipe
    ];
    var cam = { px: stops[0].px, py: stops[0].py, pz: stops[0].pz, lx: stops[0].lx, ly: stops[0].ly, lz: stops[0].lz };
    function applyCam() { camera.position.set(cam.px, cam.py, cam.pz); camera.lookAt(cam.lx, cam.ly, cam.lz); }
    applyCam();

    // ---- Metric UI ----
    var metricEl = document.querySelector("[data-specs-metric]");
    var numEl = document.querySelector("[data-specs-num]");
    var capEl = document.querySelector("[data-specs-caption]");
    var stepEl = document.querySelector("[data-specs-step]");
    var gaugeEl = document.querySelector("[data-specs-gauge]");
    var gaugeNeedle = gaugeEl ? gaugeEl.querySelector(".sg-needle") : null;
    var gaugeFill = gaugeEl ? gaugeEl.querySelector(".sg-fill") : null;
    var METRICS = [
      { metric: "Max diameter", num: "2400<span>mm</span>", cap: "The bore carries the Gulf's largest water and sewerage flows." },
      { metric: "Pressure rating", num: "32<span>bar</span>", cap: "Engineered to hold extreme internal pressure without yielding." },
      { metric: "Standard length", num: "12<span>m</span>", cap: "Long 12-metre sections mean fewer joints, faster installation." }
    ];
    var lastMetric = -1;
    function updateMetric(p) {
      var idx = p < 0.3 ? 0 : (p < 0.7 ? 1 : 2);
      if (idx === lastMetric) return;
      lastMetric = idx;
      var m = METRICS[idx];
      if (metricEl) { gsap.fromTo(metricEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }); metricEl.textContent = m.metric; }
      if (numEl) { gsap.fromTo(numEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }); numEl.innerHTML = m.num; }
      if (capEl) { gsap.fromTo(capEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }); capEl.textContent = m.cap; }
      if (stepEl) stepEl.textContent = "0" + (idx + 1) + " / 0" + METRICS.length;
      // Pressure gauge: sweep the needle 0->32 bar and fill the arc when
      // entering the pressure beat. The "from" values reset to 0 at tween start
      // (invisible — the gauge is fading/blur in), so leaving the beat just
      // fades + blurs the gauge out with the needle still at 32 (no snap). The
      // reset to 0 happens here on the next enter, never on the way out.
      if (stage) stage.classList.toggle("is-pressure", idx === 1);
      if (gaugeNeedle && gaugeFill && idx === 1) {
        // Sweep the needle tip 0 -> 32 bar by animating its x2/y2 attributes
        // (trig, not a CSS transform) — bulletproof, no transform-origin or
        // filter-blur interaction. 32 bar = 54° from up, radius 74.
        gsap.fromTo(gaugeNeedle, { attr: { x2: 26, y2: 100 } }, { attr: { x2: 160, y2: 56.5 }, duration: 1.3, ease: "power3.out" });
        gsap.fromTo(gaugeFill, { strokeDashoffset: 100 }, { strokeDashoffset: 20, duration: 1.3, ease: "power3.out" });
      }
    }

    // progress-driven viz (pressure glow + length dimension)
    function applyViz(p) {
      // Pressure glow (stop 2)
      var pres = smoothstep(0.25, 0.45, p) * (1 - smoothstep(0.55, 0.75, p));
      pressure.material.opacity = pres * 0.4;
      // Length dimension (stop 3)
      var len = smoothstep(0.7, 0.85, p);
      dimMat.opacity = len;
    }

    // ---- Sizing ----
    function resize() {
      var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // ---- Camera timeline (scrubbed, pinned) ----
    var active = false;
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: "top top", end: "+=200%", pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: function () { active = true; },
        onLeave: function () { active = false; },
        onEnterBack: function () { active = true; },
        onLeaveBack: function () { active = false; },
        onUpdate: function (self) { updateMetric(self.progress); applyViz(self.progress); window.__demo2.specsReel.progress = self.progress; }
      }
    });
    // Segment 1: stop0 -> stop1 (settles near the pressure view)
    tl.to(cam, { px: stops[1].px, py: stops[1].py, pz: stops[1].pz, lx: stops[1].lx, ly: stops[1].ly, lz: stops[1].lz, duration: 5, ease: "power2.inOut", onUpdate: applyCam }, 0);
    // Segment 2: stop1 -> stop2 (zoom out to full length)
    tl.to(cam, { px: stops[2].px, py: stops[2].py, pz: stops[2].pz, lx: stops[2].lx, ly: stops[2].ly, lz: stops[2].lz, duration: 6, ease: "power2.inOut", onUpdate: applyCam }, 5);

    // ---- Render loop (only while the chapter is active) ----
    window.__demo2.specsReel = { active: false, renderCount: 0, progress: 0 };
    gsap.ticker.add(function () {
      window.__demo2.specsReel.active = active;
      if (!active) return;
      var t = performance.now();
      pressure.material.emissiveIntensity = 0.5 + 0.35 * (0.5 + 0.5 * Math.sin(t / 240));
      pipe.rotation.x = Math.sin(t / 1600) * 0.02; // subtle live tilt
      renderer.render(scene, camera);
      window.__demo2.specsReel.renderCount++;
    });

    applyCam(); applyViz(0); updateMetric(0);
    renderer.render(scene, camera);
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
    initPipeBuild();
    // Re-run initAnatomy now (after the pipe-build pin) so its ST measures
    // against the final layout — a pinned ST's start won't update via refresh().
    if (window.__demo2 && typeof window.__demo2.initAnatomy === "function") {
      window.__demo2.initAnatomy();
    }
    // Specs reel last: its ST must be created after the anatomy pin so the
    // anatomy pin-spacer (which shifts specs) is already in place.
    initSpecsScene();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  // Wait for fonts/layout to settle before pinning + sizing (single init).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }
  if (window.ScrollTrigger) window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
})();
