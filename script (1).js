const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

const translations = {
  en: {
    "nav.tracks": "Tracks",
    "nav.license": "License",
    "nav.contact": "Contact",
    "hero.label": "MUSIC PRODUCER",
    "hero.title": "Music Producer",
    "hero.role": "Beatmaker",
    "hero.copy": "Prod. by NO!SER",
    "hero.cta": "Listen to tracks",
    "tracks.label": "SELECTED TRACKS",
    "tracks.title": "Tracks.",
    "tracks.lead": "Stream the latest releases — prod. by NO!SER.",
    "tracks.original": "Original release",

    "pricing.label": "LICENSING",
    "pricing.title1": "License",
    "pricing.title2": "your music.",
    "pricing.lead": "Every beat is available under a legally binding license, delivered instantly with a signed, hash-authenticated certificate. Choose the tier that fits your release.",
    "pricing.included.delivery": "Instant Delivery",
    "pricing.included.legal": "Legally Binding Contract",
    "pricing.included.verified": "Verified & Hash-Authenticated",
    "pricing.included.worldwide": "Worldwide Rights",
    "pricing.badge.popular": "Most Popular",
    "pricing.badge.exclusive": "Full Ownership",

    "pricing.card1.name": "Basic Lease",
    "pricing.card1.desc": "Perfect for testing the waters — demos, mixtapes and independent releases.",
    "pricing.card1.format": "MP3 File (320kbps)",
    "pricing.card1.feat1": "Unlimited streams & downloads",
    "pricing.card1.feat2": "Worldwide distribution rights",
    "pricing.card1.feat3": "Use on all major platforms",
    "pricing.card1.feat4": "Non-exclusive license",
    "pricing.card1.cta": "Get this license",

    "pricing.card2.name": "Premium Lease",
    "pricing.card2.desc": "Studio-grade audio for serious releases, radio play and sync placements.",
    "pricing.card2.format": "MP3 (320kbps) + WAV",
    "pricing.card2.feat1": "Everything in Basic Lease",
    "pricing.card2.feat2": "Uncompressed WAV file",
    "pricing.card2.feat3": "Broadcast & radio-ready quality",
    "pricing.card2.feat4": "Ideal for commercial releases",
    "pricing.card2.cta": "Get this license",

    "pricing.card3.name": "Unlimited Lease",
    "pricing.card3.desc": "Complete creative control with full trackout stems for professional mixing and mastering.",
    "pricing.card3.format": "MP3 + WAV + Full Trackout Stems",
    "pricing.card3.feat1": "Everything in Premium Lease",
    "pricing.card3.feat2": "Full trackout stems included",
    "pricing.card3.feat3": "Total mix & master flexibility",
    "pricing.card3.feat4": "Preferred by professional studios",
    "pricing.card3.cta": "Get this license",

    "pricing.card4.name": "Exclusive",
    "pricing.card4.price": "Contact for pricing",
    "pricing.card4.desc": "The beat is yours — and only yours. Full copyright and master ownership transfer.",
    "pricing.card4.format": "MP3 + WAV + Stems + Session Files",
    "pricing.card4.feat1": "100% ownership & copyright transfer",
    "pricing.card4.feat2": "Full publishing rights transfer",
    "pricing.card4.feat3": "Beat permanently removed from sale",
    "pricing.card4.feat4": "One buyer — no other licenses issued",
    "pricing.card4.cta": "Contact for exclusive rights",

    "pricing.footnote": "All licenses are delivered with a signed agreement, a unique verification hash and a QR-authenticated certificate confirming their validity.",

    "contact.label": "CONTACT",
    "contact.title1": "For collaboration",
    "contact.title2": "and questions.",
    "contact.lead": "Beats, features and full productions — reach out through whichever channel fits the work. Replies land within 48 hours.",
    "contact.email": "Email",
    "contact.card1.desc": "For questions, information and more.",
    "contact.card2.desc": "For bookings, licensing and project inquiries.",
    "contact.card3.desc": "For all stream and productions.",
    "footer.rights": "All rights reserved",
    "footer.topLabel": "Back to top"
  },
  tr: {
    "nav.tracks": "Parçalar",
    "nav.license": "Lisans",
    "nav.contact": "İletişim",
    "hero.label": "MÜZİK PRODÜKTÖRÜ",
    "hero.title": "Müzik Prodüktörü",
    "hero.role": "Beatmaker",
    "hero.copy": "Prod. by NO!SER",
    "hero.cta": "Parçaları dinle",
    "tracks.label": "PARÇALAR",
    "tracks.title": "Parçalar.",
    "tracks.lead": "Son yayınları dinle — prod. by NO!SER.",
    "tracks.original": "Orijinal yayın",

    "pricing.label": "LİSANSLAMA",
    "pricing.title1": "Müziğini",
    "pricing.title2": "lisansla.",
    "pricing.lead": "Her beat, imzalı ve hash ile doğrulanmış bir sertifikayla anında teslim edilen, yasal olarak bağlayıcı bir lisans altında sunulur. Projene uygun paketi seç.",
    "pricing.included.delivery": "Anında Teslimat",
    "pricing.included.legal": "Yasal Bağlayıcı Sözleşme",
    "pricing.included.verified": "Doğrulanmış & Hash Korumalı",
    "pricing.included.worldwide": "Dünya Çapında Haklar",
    "pricing.badge.popular": "En Popüler",
    "pricing.badge.exclusive": "Tam Sahiplik",

    "pricing.card1.name": "Basic Lease",
    "pricing.card1.desc": "Demo, mixtape ve bağımsız yayınlar için ideal bir başlangıç.",
    "pricing.card1.format": "MP3 Dosyası (320kbps)",
    "pricing.card1.feat1": "Sınırsız stream ve indirme",
    "pricing.card1.feat2": "Dünya çapında dağıtım hakları",
    "pricing.card1.feat3": "Tüm büyük platformlarda kullanım",
    "pricing.card1.feat4": "Exclusive olmayan lisans",
    "pricing.card1.cta": "Bu lisansı al",

    "pricing.card2.name": "Premium Lease",
    "pricing.card2.desc": "Ciddi yayınlar, radyo çalınması ve sync kullanımları için stüdyo kalitesinde ses.",
    "pricing.card2.format": "MP3 (320kbps) + WAV",
    "pricing.card2.feat1": "Basic Lease'teki her şey",
    "pricing.card2.feat2": "Sıkıştırılmamış WAV dosyası",
    "pricing.card2.feat3": "Yayın ve radyo kalitesinde ses",
    "pricing.card2.feat4": "Ticari yayınlar için ideal",
    "pricing.card2.cta": "Bu lisansı al",

    "pricing.card3.name": "Unlimited Lease",
    "pricing.card3.desc": "Profesyonel mix ve mastering için tam trackout stemleriyle eksiksiz kontrol.",
    "pricing.card3.format": "MP3 + WAV + Tam Trackout Stemleri",
    "pricing.card3.feat1": "Premium Lease'teki her şey",
    "pricing.card3.feat2": "Tam trackout stemleri dahil",
    "pricing.card3.feat3": "Tam mix ve mastering esnekliği",
    "pricing.card3.feat4": "Profesyonel stüdyoların tercihi",
    "pricing.card3.cta": "Bu lisansı al",

    "pricing.card4.name": "Exclusive",
    "pricing.card4.price": "Fiyat için iletişime geç",
    "pricing.card4.desc": "Beat sadece sana ait olur. Tam telif hakkı ve master sahiplik devri.",
    "pricing.card4.format": "MP3 + WAV + Stemler + Session Dosyaları",
    "pricing.card4.feat1": "%100 sahiplik ve telif hakkı devri",
    "pricing.card4.feat2": "Tam publishing hakkı devri",
    "pricing.card4.feat3": "Beat kalıcı olarak satıştan kaldırılır",
    "pricing.card4.feat4": "Tek alıcı — başka lisans verilmez",
    "pricing.card4.cta": "Exclusive haklar için iletişime geç",

    "pricing.footnote": "Tüm lisanslar imzalı sözleşme, benzersiz doğrulama hash'i ve QR ile doğrulanmış sertifika ile teslim edilir.",

    "contact.label": "İLETİŞİM",
    "contact.title1": "İş birliği",
    "contact.title2": "ve sorular için.",
    "contact.lead": "Beat, feature ve tam prodüksiyon talepleri için uygun kanaldan ulaş. Dönüşler 48 saat içinde.",
    "contact.email": "E-posta",
    "contact.card1.desc": "Sorular, bilgi ve daha fazlası için.",
    "contact.card2.desc": "Booking, lisanslama ve proje talepleri için.",
    "contact.card3.desc": "Tüm yayınlar ve prodüksiyonlar için.",
    "footer.rights": "Tüm hakları saklıdır",
    "footer.topLabel": "Yukarı çık"
  }
};

function setLanguage(language) {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[language][key] !== undefined) {
      element.textContent = translations[language][key];
    }
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === language);
    button.setAttribute("aria-pressed", String(button.dataset.lang === language));
  });
  document.querySelectorAll("[data-price-usd]").forEach((el) => {
    el.textContent = language === "tr" ? el.dataset.priceTry : el.dataset.priceUsd;
  });
  localStorage.setItem("noiser-language", language);
}

const legacyHashes = { muzikler: "tracks", iletisim: "contact" };

function scrollToSection(id, behavior = "smooth") {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior, block: id === "contact" ? "start" : "start" });
}

function handleInPageLink(event) {
  const link = event.currentTarget;
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("#") || href.length < 2) return;
  event.preventDefault();
  scrollToSection(href.slice(1));
  history.replaceState(null, "", location.pathname + location.search);
}

document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => link.addEventListener("click", handleInPageLink));

// Header logosuna tıklayınca en üste yumuşak kaydırma
const brandLogo = document.querySelector(".brand");
if (brandLogo) {
  brandLogo.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  });
}

const initialHash = location.hash.slice(1);
if (initialHash) {
  const targetId = legacyHashes[initialHash] || initialHash;
  scrollToSection(targetId, "auto");
  history.replaceState(null, "", location.pathname + location.search);
}

menuButton.addEventListener("click", () => {
  const open = siteNav.classList.toggle("is-open");
  menuButton.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  siteNav.classList.remove("is-open");
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}));

document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
setLanguage(localStorage.getItem("noiser-language") || (navigator.language.startsWith("tr") ? "tr" : "en"));
document.getElementById("year").textContent = new Date().getFullYear();

const siteHeader = document.querySelector(".site-header");
const sectionNavLinks = [...document.querySelectorAll('.site-nav a[href^="#"]:not([href="#"])')];
const sectionIds = sectionNavLinks.map((link) => link.getAttribute("href").slice(1));

function updateHeaderState() {
  if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
}

function updateActiveNav() {
  if (!sectionIds.length) return;
  const offset = window.innerHeight * 0.35;
  let currentId = sectionIds[0];
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= offset) currentId = id;
  });
  sectionNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
  });
}

function onScroll() {
  updateHeaderState();
  updateActiveNav();
}

window.addEventListener("scroll", onScroll, { passive: true });
updateHeaderState();
updateActiveNav();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${index * 0.08}s`;
    element.addEventListener("transitionend", function clearDelay(evt) {
      if (evt.propertyName === "opacity" || evt.propertyName === "transform") {
        element.style.transitionDelay = "";
        element.removeEventListener("transitionend", clearDelay);
      }
    });
    revealObserver.observe(element);
  });

  const contactSection = document.querySelector(".contact");
  if (contactSection) {
    const contactObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          contactSection.querySelectorAll(".contact-reveal").forEach((element, index) => {
            element.style.transitionDelay = `${index * 0.05}s`;
            element.classList.add("is-visible");
            element.addEventListener("transitionend", function clearDelay(evt) {
              if (evt.propertyName === "opacity" || evt.propertyName === "transform") {
                element.style.transitionDelay = "";
                element.removeEventListener("transitionend", clearDelay);
              }
            });
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -4% 0px" }
    );
    contactObserver.observe(contactSection);
  }
} else {
  document.querySelectorAll(".reveal, .contact-reveal").forEach((element) => element.classList.add("is-visible"));
}

const vinylEl = document.querySelector(".hero__vinyl");
if (vinylEl) {
  const DEFAULT_SPIN = 40; // deg/sec, matches previous 9s/360deg pace
  const MAX_SPIN = 260;
  let rotation = 0;
  let spinSpeed = DEFAULT_SPIN;
  let isDragging = false;
  let lastAngle = 0;
  let lastTime = null;

  function angleFromEvent(evt) {
    const rect = vinylEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const point = evt.touches ? evt.touches[0] : evt;
    return Math.atan2(point.clientY - cy, point.clientX - cx) * (180 / Math.PI);
  }

  function onPointerDown(evt) {
    isDragging = true;
    lastAngle = angleFromEvent(evt);
    vinylEl.classList.add("is-dragging");
    evt.preventDefault();
  }

  function onPointerMove(evt) {
    if (!isDragging) return;
    const angle = angleFromEvent(evt);
    let delta = angle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rotation += delta;
    lastAngle = angle;
    vinylEl.style.transform = `rotate(${rotation}deg)`;
    evt.preventDefault();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    vinylEl.classList.remove("is-dragging");
  }

  function tick(time) {
    if (lastTime === null) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (!isDragging) {
      rotation += spinSpeed * dt;
      vinylEl.style.transform = `rotate(${rotation}deg)`;
      spinSpeed += (DEFAULT_SPIN - spinSpeed) * Math.min(dt * 0.8, 1);
    }
    requestAnimationFrame(tick);
  }

  vinylEl.addEventListener("mousedown", onPointerDown);
  vinylEl.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("mousemove", (evt) => {
    if (!isDragging) return;
    const angle = angleFromEvent(evt);
    let delta = angle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    spinSpeed = Math.max(Math.min(delta * 60, MAX_SPIN), -MAX_SPIN);
    onPointerMove(evt);
  });
  window.addEventListener("touchmove", (evt) => {
    if (!isDragging) return;
    const angle = angleFromEvent(evt);
    let delta = angle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    spinSpeed = Math.max(Math.min(delta * 60, MAX_SPIN), -MAX_SPIN);
    onPointerMove(evt);
  }, { passive: false });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  requestAnimationFrame(tick);
}

// ================= ÖZGÜN AUDIO PLAYER =================
function formatPlayerTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

document.querySelectorAll("[data-player]").forEach((player) => {
  const audio = player.querySelector("[data-audio]");
  const toggle = player.querySelector("[data-play]");
  const scrub = player.querySelector("[data-scrub]");
  const fill = player.querySelector("[data-fill]");
  const handle = player.querySelector("[data-handle]");
  const currentEl = player.querySelector("[data-current]");
  const durationEl = player.querySelector("[data-duration]");
  if (!audio || !toggle || !scrub || !fill || !handle) return;

  let duration = 0;
  let isScrubbing = false;

  function setProgress(ratio) {
    const pct = Math.min(Math.max(ratio, 0), 1) * 100;
    fill.style.width = `${pct}%`;
    handle.style.left = `${pct}%`;
    scrub.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  function ratioFromEvent(evt) {
    const rect = scrub.getBoundingClientRect();
    const point = evt.touches ? evt.touches[0] : evt;
    return Math.min(Math.max((point.clientX - rect.left) / rect.width, 0), 1);
  }

  function seekTo(ratio) {
    if (!duration) return;
    const time = ratio * duration;
    audio.currentTime = time;
    if (currentEl) currentEl.textContent = formatPlayerTime(time);
    setProgress(ratio);
  }

  audio.addEventListener("loadedmetadata", () => {
    duration = audio.duration || 0;
    if (durationEl) durationEl.textContent = formatPlayerTime(duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (isScrubbing || !duration) return;
    if (currentEl) currentEl.textContent = formatPlayerTime(audio.currentTime);
    setProgress(audio.currentTime / duration);
  });

  audio.addEventListener("play", () => {
    document.querySelectorAll("[data-player]").forEach((other) => {
      if (other === player) return;
      const otherAudio = other.querySelector("[data-audio]");
      if (otherAudio && !otherAudio.paused) otherAudio.pause();
    });
    player.classList.add("is-playing");
    toggle.classList.add("is-playing");
    if (toggle.dataset.pauseLabel) toggle.setAttribute("aria-label", toggle.dataset.pauseLabel);
  });

  audio.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    toggle.classList.remove("is-playing");
    if (toggle.dataset.playLabel) toggle.setAttribute("aria-label", toggle.dataset.playLabel);
  });

  audio.addEventListener("ended", () => {
    setProgress(0);
    if (currentEl) currentEl.textContent = "0:00";
  });

  audio.addEventListener("error", () => {
    console.error("Ses dosyası yüklenemedi:", audio.currentSrc || audio.src);
    player.classList.add("has-error");
  });

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("Oynatma başarısız:", audio.currentSrc || audio.src, err);
      });
    } else {
      audio.pause();
    }
  });

  scrub.addEventListener("pointerdown", (evt) => {
    isScrubbing = true;
    scrub.setPointerCapture(evt.pointerId);
    seekTo(ratioFromEvent(evt));
  });
  scrub.addEventListener("pointermove", (evt) => {
    if (!isScrubbing) return;
    seekTo(ratioFromEvent(evt));
  });
  ["pointerup", "pointercancel"].forEach((eventName) => {
    scrub.addEventListener(eventName, (evt) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      if (scrub.hasPointerCapture(evt.pointerId)) scrub.releasePointerCapture(evt.pointerId);
    });
  });

  scrub.addEventListener("keydown", (evt) => {
    if (!duration) return;
    const step = Math.max(duration * 0.05, 1);
    if (evt.key === "ArrowRight" || evt.key === "ArrowUp") {
      audio.currentTime = Math.min(audio.currentTime + step, duration);
      evt.preventDefault();
    } else if (evt.key === "ArrowLeft" || evt.key === "ArrowDown") {
      audio.currentTime = Math.max(audio.currentTime - step, 0);
      evt.preventDefault();
    } else if (evt.key === " " || evt.key === "Enter") {
      toggle.click();
      evt.preventDefault();
    }
  });
});

// Sadece "Yukarı Çık" butonu için scroll-to-top davranışı
// (footer içindeki sosyal ikonlar ve mailto linki artık normal çalışır)
const backToTopLink = document.querySelector(".footer__top");
if (backToTopLink) {
  backToTopLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  });
}