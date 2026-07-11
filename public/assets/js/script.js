/* Dubai Pipes Factory Co. - shared site script (Demo 1).
 * Vanilla JS, no dependencies. Handles: mobile nav, dropdowns, language
 * picker, scroll-reveal, image lightbox, carousel, Leaflet map, contact form,
 * back-to-top, active-nav, and CMS-scaffold rendering (blog/projects/products).
 */
(function () {
  "use strict";

  /* Flag JS-active so CSS can gate motion that should only run when JS will
     drive it (e.g. the pipe-diagram line-draw). No-JS users see the final state. */
  document.documentElement.classList.add("js");

  /* ---------- helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- mobile nav ---------- */
  const navToggle = $(".nav-toggle");
  const mobileNav = $(".mobile-nav");
  const mobileClose = $(".mobile-nav__close");
  function setMobile(open) {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    mobileNav.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) mobileNav.focus?.();
    if (!open) {
      $$(".mobile-has-sub").forEach((li) => li.classList.remove("is-open"));
      $$(".mobile-parent-btn").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  }
  navToggle?.addEventListener("click", () => setMobile(true));
  mobileClose?.addEventListener("click", () => setMobile(false));
  $$(".mobile-nav a").forEach((a) =>
    a.addEventListener("click", () => setMobile(false))
  );

  /* Mobile nav sub-menu accordion (Products toggle) */
  $$(".mobile-parent-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const li = btn.closest(".mobile-has-sub");
      if (!li) return;
      const isOpen = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav?.classList.contains("open")) setMobile(false);
  });

  /* ---------- desktop dropdown (click + keyboard) ---------- */
  $$(".primary-nav__toggle").forEach((btn) => {
    const item = btn.closest(".primary-nav__item");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const open = btn.getAttribute("aria-expanded") === "true";
      $$(".primary-nav__toggle").forEach((b) => {
        if (b !== btn) b.setAttribute("aria-expanded", "false");
      });
      btn.setAttribute("aria-expanded", String(!open));
    });
    item?.addEventListener("keydown", (e) => {
      if (e.key === "Escape") btn.setAttribute("aria-expanded", "false");
    });
  });
  // close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".primary-nav__item")) {
      $$(".primary-nav__toggle").forEach((b) =>
        b.setAttribute("aria-expanded", "false")
      );
    }
  });

  /* ---------- language picker (UI only; AR does nothing for now) ---------- */
  $$(".lang-picker").forEach((pick) => {
    const btn = $(".lang-picker__btn", pick);
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = pick.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
    $$(".lang-picker__menu button", pick).forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        if (b.dataset.code) {
          const flagEl = $(".lang-picker__flag", pick);
          const labelEl = $(".lang-picker__label", pick);
          if (flagEl && b.dataset.flag) {
            if (flagEl.tagName === "IMG") {
              flagEl.src = `/assets/images/flag-${b.dataset.flag}.svg`;
              flagEl.alt = `${b.dataset.flag.toUpperCase()} flag`;
            } else {
              flagEl.textContent = b.dataset.flag;
            }
          }
          if (labelEl) labelEl.textContent = b.dataset.code;
        }
        pick.classList.remove("open");
        btn?.setAttribute("aria-expanded", "false");
      })
    );
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".lang-picker")) {
        pick.classList.remove("open");
        btn?.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- active nav link by path ---------- */
  const path = location.pathname.replace(/\/index\.html$/, "/").replace(/index\.html$/, "/");
  $$(".primary-nav__link, .mobile-nav a, .hf-item").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const target = href.replace(/\/index\.html$/, "/");
    if (target === path || (target !== "/" && path.indexOf(target) === 0)) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------- scroll reveal ---------- */
  const revealEls = $$("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            obs.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.01 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- back to top ---------- */
  const toTop = $(".to-top");
  if (toTop) {
    const onScroll = () => toTop.classList.toggle("show", window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
    onScroll();
  }

  /* ---------- lightbox ----------
     Overlay markup is built here (not per-page) so every page - including the
     hand-authored home page - gets it. Clicking any content image opens THAT
     single image in the on-site viewer (no slideshow, no prev/next). Logos,
     flags (incl. the language-picker dropdown) and the cert carousel are
     excluded so they keep their normal behaviour. X close button sits
     top-right; Esc and backdrop click also close. */
  let lb = $(".lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.tabIndex = -1;
    lb.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close image viewer" title="Close (Esc)">×</button>' +
      '<img class="lightbox__img" alt="">' +
      '<p class="lightbox__caption"></p>';
    document.body.appendChild(lb);
  }
  const lbImg = $(".lightbox__img", lb);
  const lbCap = $(".lightbox__caption", lb);

  // Exclude chrome imagery that should not open in the viewer.
  // .leaflet-container img covers the map marker icon, shadows and controls so
  // clicking the pin opens Leaflet's own popup, not the image viewer.
  const LB_EXCLUDE = ".brand__logo, .lang-picker img, .cert-strip__item img, .leaflet-container img, [data-no-lightbox] img, [data-no-lightbox]";
  const lbExcluded = (el) => !!el.closest(LB_EXCLUDE);
  // An image opens the viewer unless it is chrome, or it sits inside a normal
  // <a> (a link to another page) - those should navigate, not pop the viewer.
  // Images inside [data-lightbox] anchors and bare content images do open it.
  function lbEligible(img) {
    if (!img || !img.src || lbExcluded(img)) return false;
    const a = img.closest("a");
    return !(a && !a.hasAttribute("data-lightbox"));
  }
  function srcFor(img) {
    const a = img.closest("a[data-lightbox]");
    if (a && a.getAttribute("href")) return a.getAttribute("href");
    return img.currentSrc || img.src;
  }
  function capFor(img) {
    const a = img.closest("a[data-lightbox]");
    if (a) return a.dataset.caption || a.getAttribute("title") || img.alt || "";
    return img.alt || img.getAttribute("title") || "";
  }
  function lbOpen(img) {
    lbImg.src = srcFor(img);
    lbImg.alt = capFor(img);
    lbCap.textContent = capFor(img);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".lightbox__close", lb)?.focus();
  }
  function lbClose() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  // Tag eligible images with the zoom cursor. Re-runs on DOM changes so
  // CMS-rendered cards (blog/projects) and lazy-loaded thumbs get it too.
  function lbIndex() {
    $$("img").forEach((img) => {
      img.classList.toggle("js-zoom", lbEligible(img));
    });
  }
  lbIndex();
  if ("MutationObserver" in window) {
    new MutationObserver(() => lbIndex()).observe(document.body, { childList: true, subtree: true });
  }
  // Clicking any eligible image opens the viewer showing only that image;
  // prevent the underlying [data-lightbox] link's navigation to the raw file.
  document.addEventListener("click", (e) => {
    const img = e.target.closest && e.target.closest("img");
    if (!lbEligible(img)) return;
    e.preventDefault();
    lbOpen(img);
  });
  $(".lightbox__close", lb)?.addEventListener("click", lbClose);
  lb.addEventListener("click", (e) => { if (e.target === lb) lbClose(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lbClose();
  });

  /* ---------- carousel (optional) ---------- */
  $$("[data-carousel]").forEach((root) => {
    const track = $(".carousel__track", root) || root;
    const prev = $("[data-carousel-prev]", root);
    const next = $("[data-carousel-next]", root);
    const step = () => track.clientWidth * 0.8;
    prev?.addEventListener("click", () =>
      track.scrollBy({ left: -step(), behavior: "smooth" })
    );
    next?.addEventListener("click", () =>
      track.scrollBy({ left: step(), behavior: "smooth" })
    );
  });

  /* ---------- Leaflet map ---------- */
  const mapEl = $("#map");
  if (mapEl && window.L) {
    // Dubai Investments Park, Jebel Ali Industrial Area (approx centroid)
    const lat = 24.9750,
      lng = 55.1750;
    const map = L.map(mapEl, { scrollWheelZoom: false }).setView([lat, lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    // Marker icons resolve relative to the JS file - set explicitly.
    L.Icon.Default.mergeOptions({
      imagePath: "/assets/vendor/leaflet/images/",
    });
    const marker = L.marker([lat, lng]).addTo(map);
    const popup =
      '<div class="map-card"><h3>Dubai Pipes Factory Co.</h3>' +
      "<p>Jebel Ali Industrial Area<br>inside Dubai Investments Park<br>Dubai, UAE · P.O. Box 32902</p>" +
      '<p><a href="tel:+97148851333">+971 4 885 1333</a></p></div>';
    marker.bindPopup(popup).openPopup();
    // enable scroll-zoom only after focus
    mapEl.addEventListener("focus", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("blur", () => map.scrollWheelZoom.disable());
    mapEl.setAttribute("tabindex", "0");
  }

  /* ---------- contact form (no backend; demo success state) ---------- */
  const form = $("#quote-form");
  if (form) {
    const success = $("#quote-form-success");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // INTEGRATION POINT: wire this form to a backend / form service / Vercel
      // function. Currently it only fakes a success state. Replace the block
      // below with a fetch() to your endpoint and handle the real response.
      if (success) {
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  /* ---------- CMS scaffold: render blog + projects + products ---------- */
  function renderCards(container, items, makeCard) {
    if (!container || !items) return;
    if (!items.length) {
      const empty = container.querySelector("[data-empty]");
      if (empty) empty.style.display = "block";
      return;
    }
    container.innerHTML = items.map(makeCard).join("");
  }

  const blog = $("#blog-grid");
  if (blog && window.BLOG_POSTS) {
    renderCards(blog, window.BLOG_POSTS, (p) => `
      <article class="media-card" data-reveal>
        <div class="media-card__media"><img src="${p.image}" alt="${escapeAttr(p.title)}" loading="lazy"></div>
        <div class="media-card__body">
          <span class="eyebrow">${escapeHtml(p.date)} · ${escapeHtml(p.category)}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.excerpt)}</p>
        </div>
      </article>`);
  }

  const proj = $("#projects-grid");
  if (proj && window.PROJECTS) {
    renderCards(proj, window.PROJECTS, (p) => `
      <article class="media-card" data-reveal>
        <div class="media-card__media"><img src="${p.image}" alt="${escapeAttr(p.title)}" loading="lazy"></div>
        <div class="media-card__body">
          <span class="eyebrow">${escapeHtml(p.location)} · ${escapeHtml(p.scope)}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.summary)}</p>
        </div>
      </article>`);
  }

  const specTable = $("#spec-table");
  if (specTable && window.PRODUCTS) {
    const rows = window.PRODUCTS
      .map(
        (r) => `<tr><td>${escapeHtml(r.parameter)}</td><td>${escapeHtml(r.value)}</td></tr>`
      )
      .join("");
    specTable.innerHTML =
      `<thead><tr><th>Parameter</th><th>Range / Values</th></tr></thead><tbody>${rows}</tbody>`;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }
})();
