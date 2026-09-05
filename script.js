/* ============================================================
   NO!SER — site behaviour
   ============================================================ */
(function () {
  "use strict";

  /* ---------- device detection ---------- */
  var IS_TOUCH = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  if (IS_TOUCH) document.documentElement.classList.add("is-touch");

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- theme (light / dark) ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var savedTheme = localStorage.getItem("noiser-theme") || "light";
  root.setAttribute("data-theme", savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("noiser-theme", next);
    });
  }

  /* ---------- scroll progress ---------- */
  var bar = document.getElementById("progressBar");
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (bar) bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- smooth scroll to top ---------- */
  function scrollTop(e) {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  var brand = document.getElementById("brandLogo");
  var backTop = document.getElementById("backToTop");
  if (brand) brand.addEventListener("click", scrollTop);
  if (backTop) backTop.addEventListener("click", scrollTop);

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-button");
  var nav = document.getElementById("site-nav");

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  /* (touch-specific styling is handled via the .is-touch class on <html>) */

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- vinyl: idle spin (everywhere) + drag-to-spin (desktop/mouse only) ---------- */
  var vinyl = document.getElementById("vinyl");
  if (vinyl) {
    var angle = 0;
    var dragging = false;
    var pointerId = null;
    var lastPointerAngle = 0;
    var velocity = 0;      // deg / s
    var lastTs = 0;
    var IDLE_SPEED = 14;   // deg / s
    var FRICTION = 0.975;

    function pointerAngle(e) {
      var rect = vinyl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    }

    /* hand-spin is mouse-only: touch/pen pointers fall through so the page scrolls normally */
    function onDown(e) {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      pointerId = e.pointerId;
      lastPointerAngle = pointerAngle(e);
      velocity = 0;
      vinyl.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var a = pointerAngle(e);
      var delta = a - lastPointerAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      angle += delta;
      velocity = delta * 60; // rough deg/s
      lastPointerAngle = a;
    }
    function onUp(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
    }

    vinyl.addEventListener("pointerdown", onDown);
    vinyl.addEventListener("pointermove", onMove);
    vinyl.addEventListener("pointerup", onUp);
    vinyl.addEventListener("pointercancel", onUp);

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      var dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;
      if (!dragging) {
        if (!reduced) angle += IDLE_SPEED * dt;
        if (Math.abs(velocity) > 1) {
          angle += velocity * dt;
          velocity *= FRICTION;
        } else {
          velocity = 0;
        }
      }
      vinyl.style.transform = "rotate(" + angle + "deg)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- block copying of logos ---------- */
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    img.addEventListener("dragstart", function (e) { e.preventDefault(); });
  });

  /* ---------- language switch (EN / TR) ---------- */
  var STRINGS = {
    en: {
      "nav.services": "Services",
      "nav.contact": "Contact",
      "hero.label": "MUSIC PRODUCER",
      "hero.title": "Music Producer",
      "hero.role": "Beatmaker",
      "hero.copy": "Prod. by NO!SER",
      "hero.availability": "Open for commissions",
      "hero.cta": "Listen on SoundCloud",
      "vinyl.hint": "Drag to spin",
      "services.label": "WHAT I DO",
      "services.title1": "Crafted",
      "services.title2": "for the culture.",
      "services.c1.title": "Beat Production",
      "services.c1.desc": "Original beats built from scratch — melody, drums and texture with a signature sound.",
      "services.c2.title": "Mix & Mastering",
      "services.c2.desc": "Clean, loud and balanced mixes ready for streaming, radio and the club.",
      "services.c3.title": "Custom Beats",
      "services.c3.desc": "Exclusive instrumentals tailored to your style — from demo to final release.",
      "contact.label": "CONTACT",
      "contact.title1": "Let's",
      "contact.title2": "work.",
      "contact.lead": "Beats, features and full productions — reach out through whichever channel fits the work. Replies land within 48 hours.",
      "contact.email": "Email",
      "contact.c1.desc": "Behind-the-scenes sessions, previews and daily process.",
      "contact.c2.desc": "For bookings, licensing and project inquiries.",
      "contact.c3.desc": "Full catalogue of releases and production credits.",
      "footer.rights": "All rights reserved",
      "footer.top": "Back to top"
    },
    tr: {
      "nav.services": "Hizmetler",
      "nav.contact": "İletişim",
      "hero.label": "MÜZİK YAPIMCISI",
      "hero.title": "Müzik Yapımcısı",
      "hero.role": "Beatmaker",
      "hero.copy": "Prod. by NO!SER",
      "hero.availability": "Komisyonlara açık",
      "hero.cta": "SoundCloud'da Dinle",
      "vinyl.hint": "Çevirmek için sürükle",
      "services.label": "NE YAPIYORUM",
      "services.title1": "Kültür için",
      "services.title2": "üretildi.",
      "services.c1.title": "Beat Prodüksiyon",
      "services.c1.desc": "Sıfırdan özgün beat'ler — melodi, davul ve imza niteliğinde doku.",
      "services.c2.title": "Mix & Mastering",
      "services.c2.desc": "Yayın, radyo ve kulüp için temiz, güçlü ve dengeli mix'ler.",
      "services.c3.title": "Özel Beatler",
      "services.c3.desc": "Tarzına özel, sadece sana ait enstrümantaller — demodan yayına.",
      "contact.label": "İLETİŞİM",
      "contact.title1": "Birlikte",
      "contact.title2": "çalışalım.",
      "contact.lead": "Beat, feat ve komple prodüksiyonlar — işe uygun kanaldan ulaş. 48 saat içinde dönüş yapılır.",
      "contact.email": "E-posta",
      "contact.c1.desc": "Kamera arkası seanslar, önizlemeler ve günlük süreç.",
      "contact.c2.desc": "Rezervasyon, lisanslama ve proje talepleri için.",
      "contact.c3.desc": "Tüm yayınlar ve prodüksiyon kredileri.",
      "footer.rights": "Tüm hakları saklıdır",
      "footer.top": "Yukarı çık"
    }
  };

  var langButtons = document.querySelectorAll(".language-switch button");
  var langSwitch = document.querySelector(".language-switch");
  var savedLang = localStorage.getItem("noiser-lang") || "en";

  function applyLang(lang) {
    var dict = STRINGS[lang] || STRINGS.en;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    langButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (langSwitch) langSwitch.setAttribute("data-active", lang);
    document.documentElement.lang = lang;
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      localStorage.setItem("noiser-lang", lang);
      applyLang(lang);
    });
  });

  applyLang(savedLang);
})();
