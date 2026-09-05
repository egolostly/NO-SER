// NO!SER Official Production & License Verification Portal Script

const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

const translations = {
  tr: {
    "nav.license": "Lisans Doğrulama",
    "nav.contact": "İletişim",
    "nav.verifyCta": "Lisans Doğrula",

    "hero.badge": "PROD. BY NO!SER · RESMİ PORTAL",
    "hero.titleSub": "MÜZİK PRODÜKTÖRÜ",
    "hero.lead": "Özgün ses mimarisi, yüksek kaliteli beat prodüksiyonları ve yasal güvenceli resmi lisanslama portalı.",
    "hero.ctaVerify": "Lisans Kodunu Doğrula",
    "hero.ctaContact": "İletişime Geç",
    "hero.stat1": "Yasal Güvence",
    "hero.stat1Sub": "Ticari & Dijital Yayın Hakları",
    "hero.stat2": "Resmi PDF Sözleşme",
    "hero.stat2Sub": "İmzalı Orijinal Belge",
    "hero.stat3": "Canlı Doğrulama",
    "hero.stat3Sub": "Anında Veritabanı Teyidi",

    "license.tag": "LİSANS DOĞRULAMA MERKEZİ",
    "license.title": "Satın Aldığınız Lisansı Doğrulayın",
    "license.desc": "Beat ve prodüksiyon haklarınızı anında teyit edin, yasal mülkiyet bilgilerinizi görüntüleyin ve imzalı resmi PDF sözleşmenizi indirin.",
    "license.boxTitle": "Doğrulama ve Belge Sorgulama",
    "license.boxDesc": "Size iletilen resmi lisans kodunu girerek doğrulamayı başlatın.",
    "license.inputPlaceholder": "Lisans Kodunu Giriniz (Örn: NS-2026-8842)",
    "license.verifyBtn": "Doğrula",

    "cert.officialTag": "RESMİ DİJİTAL SERTİFİKA",
    "cert.registry": "NO!SER OFFICIAL LICENSE REGISTRY",
    "cert.code": "LİSANS KODU",
    "cert.owner": "LİSANS SAHİBİ (ALICI)",
    "cert.type": "LİSANS TÜRÜ / KAPSAM",
    "cert.date": "DÜZENLENME TARİHİ",
    "cert.producer": "PRODÜKTÖR / HAK SAHİBİ",
    "cert.security": "GÜVENLİK PROTOKOLÜ",
    "cert.copy": "Kopyala",
    "cert.copied": "Kopyalandı!",
    "cert.downloadBtn": "Lisans Belgesini İndir (PDF)",
    "cert.previewBtn": "Belgeyi Önizle",
    "cert.shareBtn": "Linki Kopyala",

    "contact.tag": "İLETİŞİM & TALEP",
    "contact.title": "İş Birliği ve Proje Talepleri",
    "contact.desc": "Özel beat talepleri, feature projeleri, ticari sync lisanslama ve stüdyo iş birlikleri için doğrudan ulaşabilirsiniz.",
    "contact.card1.text": "Stüdyo seansları, yeni çalışmalar, duyurular ve doğrudan mesaj.",
    "contact.emailTitle": "E-posta",
    "contact.card2.text": "Lisanslama, sözleşmeler ve ticari prodüksiyon talepleri.",
    "contact.copyBtn": "E-postayı Kopyala",
    "contact.emailCopied": "Kopyalandı!",
    "contact.card3.text": "Tüm prodüksiyonlar, beat yayınları ve remiks arşivi.",
    "contact.openInsta": "Instagram'ı Aç",
    "contact.openSoundcloud": "SoundCloud'ı Aç",

    "theme.dark": "Siyah",
    "theme.light": "Beyaz",
    "footer.rights": "Tüm hakları saklıdır"
  },
  en: {
    "nav.license": "License Verification",
    "nav.contact": "Contact",
    "nav.verifyCta": "Verify License",

    "hero.badge": "PROD. BY NO!SER · OFFICIAL PORTAL",
    "hero.titleSub": "MUSIC PRODUCER",
    "hero.lead": "Bespoke sonic architecture, hard-hitting beat productions, and cryptographically verified licensing.",
    "hero.ctaVerify": "Verify License Code",
    "hero.ctaContact": "Get in Touch",
    "hero.stat1": "Legal Security",
    "hero.stat1Sub": "Commercial & Digital Rights",
    "hero.stat2": "Official PDF Contract",
    "hero.stat2Sub": "Signed Original Agreement",
    "hero.stat3": "Live Verification",
    "hero.stat3Sub": "Instant Server Authentication",

    "license.tag": "LICENSE VERIFICATION HUB",
    "license.title": "Verify Your Production License",
    "license.desc": "Instantly authenticate beat rights, inspect registered ownership, and download your signed official PDF agreement.",
    "license.boxTitle": "Verification & Certificate Console",
    "license.boxDesc": "Enter your official license code below to initiate verification.",
    "license.inputPlaceholder": "Enter License Code (e.g. NS-2026-8842)",
    "license.verifyBtn": "Verify",

    "cert.officialTag": "OFFICIAL DIGITAL CERTIFICATE",
    "cert.registry": "NO!SER OFFICIAL LICENSE REGISTRY",
    "cert.code": "LICENSE CODE",
    "cert.owner": "LICENSEE (CLIENT)",
    "cert.type": "LICENSE TIER",
    "cert.date": "ISSUE DATE",
    "cert.producer": "PRODUCER / RIGHTS OWNER",
    "cert.security": "SECURITY PROTOCOL",
    "cert.copy": "Copy",
    "cert.copied": "Copied!",
    "cert.downloadBtn": "Download License (PDF)",
    "cert.previewBtn": "Preview Document",
    "cert.shareBtn": "Copy Link",

    "contact.tag": "INQUIRIES & CONTACT",
    "contact.title": "Collaboration & Project Inquiries",
    "contact.desc": "Bespoke beat inquiries, feature arrangements, commercial sync licensing, and studio collaborations.",
    "contact.card1.text": "Studio sessions, beat previews, announcements, and direct inquiries.",
    "contact.emailTitle": "Email",
    "contact.card2.text": "Licensing agreements, custom projects, bookings, and business inquiries.",
    "contact.copyBtn": "Copy Email",
    "contact.emailCopied": "Copied!",
    "contact.card3.text": "Full catalog of releases, instrumental beat tapes, and production archives.",
    "contact.openInsta": "Open Instagram",
    "contact.openSoundcloud": "Open SoundCloud",

    "theme.dark": "Dark",
    "theme.light": "Light",
    "footer.rights": "All rights reserved"
  }
};

let currentLanguage = "tr";

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[language] && translations[language][key] !== undefined) {
      element.textContent = translations[language][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (translations[language] && translations[language][key] !== undefined) {
      element.placeholder = translations[language][key];
    }
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  localStorage.setItem("noiser-language", language);
}

document.querySelectorAll(".lang-btn").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

// ================= THEME SWITCHER (SIYAH TEMA & BEYAZ TEMA) =================
const themeSwitchBtns = document.querySelectorAll("[data-theme-val]");

function getActiveTheme() {
  return localStorage.getItem("noiser-theme") || "dark";
}

function applyTheme(theme) {
  const selectedTheme = (theme === "light") ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", selectedTheme);
  if (selectedTheme === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
  } else {
    document.body.classList.remove("theme-light");
    document.body.classList.add("theme-dark");
  }
  localStorage.setItem("noiser-theme", selectedTheme);

  // Update button active state
  themeSwitchBtns.forEach(btn => {
    const isActive = btn.dataset.themeVal === selectedTheme;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

themeSwitchBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    applyTheme(btn.dataset.themeVal);
  });
});

// Initialize Theme
applyTheme(getActiveTheme());

// Initialize Language
const savedLang = localStorage.getItem("noiser-language") || (navigator.language.startsWith("tr") ? "tr" : "en");
setLanguage(savedLang);

// Smooth in-page scrolling
function scrollToSection(id, behavior = "smooth") {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior, block: "start" });
}

document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#") || href.length < 2) return;
    event.preventDefault();
    scrollToSection(href.slice(1));
    history.replaceState(null, "", location.pathname + location.search);
  });
});

// Mobile Menu
if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuButton.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Set Current Year in Footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ================= TOP SCROLL PROGRESS & ACTIVE NAV =================
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const siteHeader = document.querySelector(".site-header");
const sectionNavLinks = [...document.querySelectorAll('.site-nav__link[href^="#"]')];
const sectionIds = sectionNavLinks.map((link) => link.getAttribute("href").slice(1));

function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  
  if (scrollProgressBar) {
    scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
  }
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", scrollTop > 20);
  }

  // Track active section link
  if (sectionIds.length) {
    const offset = window.innerHeight * 0.35;
    let currentId = sectionIds[0];
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= offset) {
        currentId = id;
      }
    });
    sectionNavLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
    });
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

// Reveal animations on scroll
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${(index % 3) * 0.06}s`;
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

// ================= EMAIL CLIPBOARD COPY =================
const btnCopyEmail = document.getElementById("btn-copy-email");
const copyEmailText = document.getElementById("copy-email-text");

if (btnCopyEmail && copyEmailText) {
  btnCopyEmail.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const emailToCopy = btnCopyEmail.dataset.email || "qnoiser@gmail.com";
    const originalText = copyEmailText.textContent;
    const copiedLabel = translations[currentLanguage]["contact.emailCopied"] || "Kopyalandı!";

    const feedback = () => {
      copyEmailText.textContent = copiedLabel;
      btnCopyEmail.style.borderColor = "var(--navy)";
      btnCopyEmail.style.background = "var(--navy)";
      btnCopyEmail.style.color = "#FFFFFF";
      setTimeout(() => {
        copyEmailText.textContent = originalText;
        btnCopyEmail.style.borderColor = "";
        btnCopyEmail.style.background = "";
        btnCopyEmail.style.color = "";
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailToCopy).then(feedback).catch(() => fallbackCopyText(emailToCopy, feedback));
    } else {
      fallbackCopyText(emailToCopy, feedback);
    }
  });
}

function fallbackCopyText(text, callback) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    if (callback) callback();
  } catch (e) {}
  document.body.removeChild(ta);
}

// ================= LICENSE VERIFICATION SYSTEM =================
const verifyForm = document.getElementById("verify-form") || document.getElementById("license-verify-form");
const licenseCodeInput = document.getElementById("license-code-input") || document.getElementById("license-verify-input");
const verifyState = document.getElementById("verify-state");
const certResult = document.getElementById("cert-result") || document.getElementById("verify-result");

// Result Elements
const resCode = document.getElementById("res-code");
const resCustomerName = document.getElementById("res-customer-name");
const resCustomerEmail = document.getElementById("res-customer-email");
const resTrackTitle = document.getElementById("res-track-title");
const resLicenseType = document.getElementById("res-license-type") || document.getElementById("res-tier-pill");
const resIssueDate = document.getElementById("res-issue-date");
const resStatusBadge = document.getElementById("res-status-badge");
const resDownloadBtn = document.getElementById("res-download-btn");
const resPdfSize = document.getElementById("res-pdf-size");
const resPreviewBtn = document.getElementById("res-preview-btn");
const btnCopyCode = document.getElementById("btn-copy-code");
const btnShareLink = document.getElementById("btn-share-link");

// Modal Elements
const sitePdfModal = document.getElementById("site-pdf-modal");
const sitePdfIframe = document.getElementById("site-pdf-iframe");
const sitePdfTitle = document.getElementById("site-pdf-title");
const sitePdfDownloadLink = document.getElementById("site-pdf-download-link");

let currentVerifiedLicense = null;

function showVerifyState(type, message) {
  if (!verifyState) return;
  verifyState.style.display = "flex";
  
  if (type === "loading") {
    verifyState.className = "verify-state verify-state--loading";
    verifyState.innerHTML = `
      <div class="verify-spinner"></div>
      <span>${message || (currentLanguage === "tr" ? "Lisans kaydı doğrulanıyor..." : "Verifying license record...")}</span>
    `;
  } else if (type === "error") {
    verifyState.className = "verify-state verify-state--error";
    verifyState.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>${message}</span>
    `;
  }
}

function hideVerifyState() {
  if (verifyState) verifyState.style.display = "none";
}

async function executeLicenseVerification(licenseCode) {
  if (!licenseCode || !licenseCode.trim()) return;
  const cleanCode = licenseCode.trim().toUpperCase();

  if (certResult) certResult.style.display = "none";
  showVerifyState("loading");

  try {
    const res = await fetch(`/api/licenses/verify/${encodeURIComponent(cleanCode)}`);
    const data = await res.json();

    hideVerifyState();

    if (data.success && data.license) {
      currentVerifiedLicense = data.license;
      const lic = data.license;

      if (resCode) resCode.textContent = lic.code;
      if (resCustomerName) resCustomerName.textContent = lic.customerName || "-";
      if (resCustomerEmail) resCustomerEmail.textContent = lic.customerEmailMasked || lic.customerEmail || "-";
      if (resTrackTitle) resTrackTitle.textContent = lic.trackTitle || "Prod. by NO!SER";
      if (resLicenseType) resLicenseType.textContent = lic.licenseType || "Official License";
      if (resIssueDate) resIssueDate.textContent = lic.issueDate || "-";

      if (resStatusBadge) {
        if (lic.status === "active") {
          resStatusBadge.textContent = currentLanguage === "tr" ? "AKTİF & GEÇERLİ" : "ACTIVE & VALID";
          resStatusBadge.className = "cert-valid-badge";
        } else if (lic.status === "expired") {
          resStatusBadge.textContent = currentLanguage === "tr" ? "SÜRESİ DOLDU" : "EXPIRED";
          resStatusBadge.className = "cert-valid-badge";
          resStatusBadge.style.color = "#F87171";
          resStatusBadge.style.borderColor = "rgba(239, 68, 68, 0.4)";
          resStatusBadge.style.background = "rgba(239, 68, 68, 0.15)";
        } else {
          resStatusBadge.textContent = currentLanguage === "tr" ? "ASKIDA" : "SUSPENDED";
          resStatusBadge.className = "cert-valid-badge";
          resStatusBadge.style.color = "#FBBF24";
          resStatusBadge.style.borderColor = "rgba(245, 158, 11, 0.4)";
          resStatusBadge.style.background = "rgba(245, 158, 11, 0.15)";
        }
      }

      if (resDownloadBtn) {
        if (lic.hasPdf) {
          resDownloadBtn.href = lic.downloadUrl;
          resDownloadBtn.style.display = "inline-flex";
          if (resPdfSize) {
            resPdfSize.textContent = lic.pdfSizeFormatted || "PDF";
            resPdfSize.style.display = "inline-block";
          }
        } else {
          resDownloadBtn.style.display = "none";
        }
      }

      if (resPreviewBtn) {
        if (lic.hasPdf) {
          resPreviewBtn.style.display = "inline-flex";
          resPreviewBtn.onclick = () => openSitePdfModal(lic.code, lic.previewUrl, lic.downloadUrl);
        } else {
          resPreviewBtn.style.display = "none";
        }
      }

      if (certResult) {
        certResult.style.display = "block";
      }
    } else {
      currentVerifiedLicense = null;
      const errorMsg = data.message || (currentLanguage === "tr" 
        ? `'${cleanCode}' kodlu lisans veritabanında bulunamadı. Lütfen kontrol ediniz.` 
        : `License code '${cleanCode}' was not found in our database. Please check again.`);
      showVerifyState("error", errorMsg);
    }
  } catch (err) {
    const errorMsg = currentLanguage === "tr" 
      ? "Sunucuya bağlanılamadı. Lütfen tekrar deneyiniz." 
      : "Could not connect to server. Please try again.";
    showVerifyState("error", errorMsg);
  }
}

if (verifyForm) {
  verifyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (licenseCodeInput) {
      executeLicenseVerification(licenseCodeInput.value);
    }
  });
}

// Copy Code Button
if (btnCopyCode) {
  btnCopyCode.addEventListener("click", () => {
    if (!currentVerifiedLicense) return;
    copyToClipboard(currentVerifiedLicense.code, btnCopyCode);
  });
}

// Share Link Button
if (btnShareLink) {
  btnShareLink.addEventListener("click", () => {
    if (!currentVerifiedLicense) return;
    const shareUrl = `${window.location.origin}/?code=${encodeURIComponent(currentVerifiedLicense.code)}#license`;
    copyToClipboard(shareUrl, btnShareLink);
  });
}

function copyToClipboard(text, btnElement) {
  const originalHtml = btnElement.innerHTML;
  const copiedLabel = currentLanguage === "tr" ? "Kopyalandı!" : "Copied!";

  const onCopied = () => {
    btnElement.textContent = copiedLabel;
    setTimeout(() => { btnElement.innerHTML = originalHtml; }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopied).catch(() => fallbackCopyText(text, onCopied));
  } else {
    fallbackCopyText(text, onCopied);
  }
}

// PDF Modal Controls
function openSitePdfModal(code, previewUrl, downloadUrl) {
  if (!sitePdfModal) return;
  if (sitePdfTitle) sitePdfTitle.textContent = `${code} — Lisans Belgesi`;
  if (sitePdfIframe) sitePdfIframe.src = previewUrl;
  if (sitePdfDownloadLink) sitePdfDownloadLink.href = downloadUrl;
  sitePdfModal.classList.add("is-open");
}

function closeSitePdfModal() {
  if (!sitePdfModal) return;
  sitePdfModal.classList.remove("is-open");
  if (sitePdfIframe) sitePdfIframe.src = "";
}

window.closeSitePdfModal = closeSitePdfModal;

// ================= SECRET ADMIN MODAL & HIDDEN TRIGGERS =================
const secretAdminModal = document.getElementById("secret-admin-modal");
const secretAuthForm = document.getElementById("secret-auth-form");
const secretPasskeyInput = document.getElementById("secret-passkey-input");
const secretAuthError = document.getElementById("secret-auth-error");
const brandLogoBtn = document.getElementById("brand-logo-btn");

function openSecretAdminModal() {
  if (!secretAdminModal) {
    window.location.href = "/admin";
    return;
  }
  if (secretAuthError) secretAuthError.style.display = "none";
  if (secretPasskeyInput) secretPasskeyInput.value = "";
  secretAdminModal.classList.add("is-open");
  setTimeout(() => {
    if (secretPasskeyInput) secretPasskeyInput.focus();
  }, 100);
}

function closeSecretAdminModal() {
  if (!secretAdminModal) return;
  secretAdminModal.classList.remove("is-open");
}
window.closeSecretAdminModal = closeSecretAdminModal;

// Secret Gesture: 3 rapid clicks on the logo
let logoClickCount = 0;
let logoClickTimer = null;

if (brandLogoBtn) {
  brandLogoBtn.addEventListener("click", (e) => {
    logoClickCount++;
    if (logoClickCount === 1) {
      logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
        // Standard single click behavior: scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", location.pathname + location.search);
      }, 400);
    } else if (logoClickCount >= 3) {
      clearTimeout(logoClickTimer);
      logoClickCount = 0;
      e.preventDefault();
      e.stopPropagation();
      openSecretAdminModal();
    }
  });

  // Long press trigger (1.5 seconds)
  let longPressTimer = null;
  brandLogoBtn.addEventListener("mousedown", () => {
    longPressTimer = setTimeout(openSecretAdminModal, 1500);
  });
  brandLogoBtn.addEventListener("mouseup", () => clearTimeout(longPressTimer));
  brandLogoBtn.addEventListener("mouseleave", () => clearTimeout(longPressTimer));
  brandLogoBtn.addEventListener("touchstart", () => {
    longPressTimer = setTimeout(openSecretAdminModal, 1500);
  }, { passive: true });
  brandLogoBtn.addEventListener("touchend", () => clearTimeout(longPressTimer));
}

// Keyboard Shortcut: Ctrl + Shift + A or Ctrl + Shift + N
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a" || e.key === "N" || e.key === "n")) {
    e.preventDefault();
    openSecretAdminModal();
  }
  if (e.key === "Escape") {
    closeSitePdfModal();
    closeSecretAdminModal();
  }
});

// Secret Form Submit
if (secretAuthForm) {
  secretAuthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const passkey = (secretPasskeyInput && secretPasskeyInput.value.trim()) || "";
    if (!passkey) return;

    try {
      const res = await fetch("/api/auth/gatekeeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("noiser_admin_token", data.token);
        sessionStorage.setItem("noiser_admin_token", data.token);
        closeSecretAdminModal();
        window.location.href = "/admin";
      } else {
        if (secretAuthError) {
          secretAuthError.textContent = data.message || "Geçersiz Güvenlik Anahtarı!";
          secretAuthError.style.display = "block";
        }
      }
    } catch (err) {
      if (secretAuthError) {
        secretAuthError.textContent = "Sunucuya bağlanılamadı.";
        secretAuthError.style.display = "block";
      }
    }
  });
}

// Check URL query parameters on load (?code=NS-2026-XXXX)
function checkUrlForLicenseQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  let codeParam = searchParams.get("code") || searchParams.get("license");

  if (!codeParam && window.location.hash.includes("?")) {
    const hashQuery = window.location.hash.split("?")[1];
    const hashParams = new URLSearchParams(hashQuery);
    codeParam = hashParams.get("code") || hashParams.get("license");
  }

  if (codeParam) {
    if (licenseCodeInput) licenseCodeInput.value = codeParam;
    setTimeout(() => {
      scrollToSection("license");
      executeLicenseVerification(codeParam);
    }, 300);
  }
}

checkUrlForLicenseQuery();
