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
    "hero.stat2": "Resmi PDF Sözleşme",
    "hero.stat3": "Canlı Doğrulama",

    "license.tag": "LİSANS DOĞRULAMA MERKEZİ",
    "license.title": "Satın Aldığınız Lisansı Doğrulayın",
    "license.desc": "Beat ve prodüksiyon haklarınızı anında teyit edin, yasal mülkiyet bilgilerinizi görüntüleyin ve imzalı resmi PDF sözleşmenizi indirin.",

    "verify.consoleTitle": "LİSANS NUMARANIZI GİRİN",
    "verify.placeholder": "Lisans kodunuzu yazın (Örn: NS-2026-XXXX)",
    "verify.btnText": "Doğrula",
    "verify.loading": "Lisans kaydı doğrulanıyor...",
    "verify.errorDefault": "Girdiğiniz lisans numarası sistemde bulunamadı. Lütfen kontrol ediniz.",

    "cert.verifiedTag": "DOĞRULANMIŞ RESMİ LİSANS",
    "cert.heading": "NO!SER Lisans Belgesi",
    "cert.codeLabel": "LİSANS NUMARASI",
    "cert.clientLabel": "LİSANS SAHİBİ (ALICI)",
    "cert.emailLabel": "KAYITLI E-POSTA",
    "cert.trackLabel": "LİSANSLANAN BEAT / ESER",
    "cert.tierLabel": "LİSANS PAKETİ",
    "cert.dateLabel": "DÜZENLENME TARİHİ",
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
    "hero.stat2": "Official PDF Contract",
    "hero.stat3": "Live Verification",

    "license.tag": "LICENSE VERIFICATION HUB",
    "license.title": "Verify Your Production License",
    "license.desc": "Instantly authenticate beat rights, inspect registered ownership, and download your signed official PDF agreement.",

    "verify.consoleTitle": "ENTER LICENSE NUMBER",
    "verify.placeholder": "Enter license code (e.g. NS-2026-XXXX)",
    "verify.btnText": "Verify",
    "verify.loading": "Verifying license record...",
    "verify.errorDefault": "License code not found in our database. Please double check.",

    "cert.verifiedTag": "OFFICIALLY VERIFIED LICENSE",
    "cert.heading": "NO!SER License Certificate",
    "cert.codeLabel": "LICENSE NUMBER",
    "cert.clientLabel": "LICENSEE (CLIENT)",
    "cert.emailLabel": "REGISTERED EMAIL",
    "cert.trackLabel": "LICENSED BEAT / TRACK",
    "cert.tierLabel": "LICENSE TIER",
    "cert.dateLabel": "ISSUE DATE",
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

// Brand Logo Click Scroll to Top
const brandLogo = document.querySelector(".brand");
if (brandLogo) {
  brandLogo.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  });
}

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
const licenseVerifyForm = document.getElementById("license-verify-form");
const licenseVerifyInput = document.getElementById("license-verify-input");
const verifyLoading = document.getElementById("verify-loading");
const verifyError = document.getElementById("verify-error");
const verifyResult = document.getElementById("verify-result");

// Result Nodes
const resCode = document.getElementById("res-code");
const resCustomerName = document.getElementById("res-customer-name");
const resCustomerEmail = document.getElementById("res-customer-email");
const resTrackTitle = document.getElementById("res-track-title");
const resTierPill = document.getElementById("res-tier-pill");
const resIssueDate = document.getElementById("res-issue-date");
const resStatusBadge = document.getElementById("res-status-badge");
const resDownloadBtn = document.getElementById("res-download-btn");
const resPdfSize = document.getElementById("res-pdf-size");
const resPreviewBtn = document.getElementById("res-preview-btn");
const btnCopyCode = document.getElementById("btn-copy-code");
const btnShareLink = document.getElementById("btn-share-link");

// Modal Nodes
const sitePdfModal = document.getElementById("site-pdf-modal");
const sitePdfIframe = document.getElementById("site-pdf-iframe");
const sitePdfTitle = document.getElementById("site-pdf-title");
const sitePdfDownloadLink = document.getElementById("site-pdf-download-link");

let currentVerifiedLicense = null;

async function executeLicenseVerification(licenseCode) {
  if (!licenseCode || !licenseCode.trim()) return;
  const cleanCode = licenseCode.trim().toUpperCase();

  if (verifyError) verifyError.style.display = "none";
  if (verifyResult) verifyResult.style.display = "none";
  if (verifyLoading) verifyLoading.style.display = "flex";

  try {
    const res = await fetch(`/api/licenses/verify/${encodeURIComponent(cleanCode)}`);
    const data = await res.json();

    if (verifyLoading) verifyLoading.style.display = "none";

    if (data.success && data.license) {
      currentVerifiedLicense = data.license;
      const lic = data.license;

      if (resCode) resCode.textContent = lic.code;
      if (resCustomerName) resCustomerName.textContent = lic.customerName || "-";
      if (resCustomerEmail) resCustomerEmail.textContent = lic.customerEmailMasked || lic.customerEmail || "-";
      if (resTrackTitle) resTrackTitle.textContent = lic.trackTitle || "Prod. by NO!SER";
      if (resTierPill) resTierPill.textContent = lic.licenseType || "Official License";
      if (resIssueDate) resIssueDate.textContent = lic.issueDate || "-";

      if (resStatusBadge) {
        if (lic.status === "active") {
          resStatusBadge.textContent = currentLanguage === "tr" ? "Aktif & Geçerli" : "Active & Valid";
          resStatusBadge.style.background = "#ECFDF5";
          resStatusBadge.style.color = "#047857";
          resStatusBadge.style.borderColor = "#A7F3D0";
        } else if (lic.status === "expired") {
          resStatusBadge.textContent = currentLanguage === "tr" ? "Süresi Doldu" : "Expired";
          resStatusBadge.style.background = "#FEF2F2";
          resStatusBadge.style.color = "#B91C1C";
          resStatusBadge.style.borderColor = "#FCA5A5";
        } else {
          resStatusBadge.textContent = currentLanguage === "tr" ? "Askıda" : "Suspended";
          resStatusBadge.style.background = "#FFFBEB";
          resStatusBadge.style.color = "#B45309";
          resStatusBadge.style.borderColor = "#FDE68A";
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

      if (verifyResult) {
        verifyResult.style.display = "block";
      }
    } else {
      currentVerifiedLicense = null;
      if (verifyError) {
        verifyError.style.display = "flex";
        const errorMsgEl = document.getElementById("verify-error-msg");
        if (errorMsgEl) {
          errorMsgEl.textContent = currentLanguage === "tr" 
            ? `'${cleanCode}' kodlu lisans veritabanında bulunamadı. Lütfen kontrol ediniz.` 
            : `License code '${cleanCode}' was not found in our database. Please check again.`;
        }
      }
    }
  } catch (err) {
    if (verifyLoading) verifyLoading.style.display = "none";
    if (verifyError) {
      verifyError.style.display = "flex";
      const errorMsgEl = document.getElementById("verify-error-msg");
      if (errorMsgEl) {
        errorMsgEl.textContent = currentLanguage === "tr" 
          ? "Sunucuya bağlanılamadı. Lütfen tekrar deneyiniz." 
          : "Could not connect to server. Please try again.";
      }
    }
  }
}

if (licenseVerifyForm) {
  licenseVerifyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (licenseVerifyInput) {
      executeLicenseVerification(licenseVerifyInput.value);
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

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSitePdfModal();
});

// Shortcut: Ctrl + Shift + A to open Admin Panel
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
    e.preventDefault();
    window.open("/admin", "_blank");
  }
});

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
    if (licenseVerifyInput) licenseVerifyInput.value = codeParam;
    setTimeout(() => {
      scrollToSection("license");
      executeLicenseVerification(codeParam);
    }, 300);
  }
}

checkUrlForLicenseQuery();
