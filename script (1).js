// NO!SER — Auditory Architecture & License Registry Terminal Engine

// DOM Elements
const verifyForm = document.getElementById("verify-form");
const licenseCodeInput = document.getElementById("license-code-input");
const verifyState = document.getElementById("verify-state");
const certResult = document.getElementById("cert-result");

const resCode = document.getElementById("res-code");
const resCustomerName = document.getElementById("res-customer-name");
const resTrackTitle = document.getElementById("res-track-title");
const resLicenseType = document.getElementById("res-license-type");
const resIssueDate = document.getElementById("res-issue-date");
const resStatusBadge = document.getElementById("res-status-badge");
const resDownloadBtn = document.getElementById("res-download-btn");
const resPreviewBtn = document.getElementById("res-preview-btn");
const btnCopyCode = document.getElementById("btn-copy-code");

// Modal Elements
const sitePdfModal = document.getElementById("site-pdf-modal");
const sitePdfIframe = document.getElementById("site-pdf-iframe");
const sitePdfTitle = document.getElementById("site-pdf-title");
const sitePdfDownloadLink = document.getElementById("site-pdf-download-link");

// Scroll progress bar
const scrollProgressBar = document.getElementById("scroll-progress-bar");

let currentVerifiedLicense = null;

// Dynamic Scroll Progress
function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });

// Live Clock in Footer (UTC / Istanbul Time)
function updateFooterClock() {
  const clockEl = document.getElementById("footer-clock");
  if (!clockEl) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour12: false });
  clockEl.textContent = `${timeStr} (UTC+3) // ISTANBUL`;
}
setInterval(updateFooterClock, 1000);
updateFooterClock();

// Status Message Render
function showVerifyState(type, message) {
  if (!verifyState) return;
  verifyState.style.display = "flex";
  
  if (type === "loading") {
    verifyState.className = "terminal-status terminal-status--loading";
    verifyState.innerHTML = `
      <div class="terminal-spinner"></div>
      <span>QUERYING REGISTRY LEDGER: "${escapeHtml(message)}"...</span>
    `;
  } else if (type === "error") {
    verifyState.className = "terminal-status terminal-status--error";
    verifyState.innerHTML = `
      <span>[ERROR] ${escapeHtml(message)}</span>
    `;
  }
}

function hideVerifyState() {
  if (verifyState) verifyState.style.display = "none";
}

// Verification Core Engine
async function executeVerification(code) {
  if (!code || !code.trim()) return;
  const cleanCode = code.trim().toUpperCase();

  if (certResult) certResult.style.display = "none";
  showVerifyState("loading", cleanCode);

  try {
    const res = await fetch(`/api/licenses/verify/${encodeURIComponent(cleanCode)}`);
    const data = await res.json();

    hideVerifyState();

    if (data.success && data.license) {
      currentVerifiedLicense = data.license;
      const lic = data.license;

      if (resCode) resCode.textContent = lic.code;
      if (resTrackTitle) resTrackTitle.textContent = lic.trackTitle || "Prod. by NO!SER";
      if (resCustomerName) resCustomerName.textContent = lic.customerName || "-";
      if (resLicenseType) resLicenseType.textContent = lic.licenseType || "Official License";
      if (resIssueDate) resIssueDate.textContent = lic.issueDate || "-";

      if (resStatusBadge) {
        if (lic.status === "active") {
          resStatusBadge.textContent = "VALID & REGISTERED";
          resStatusBadge.style.color = "#0a0a0a";
          resStatusBadge.style.backgroundColor = "#00FF66";
        } else if (lic.status === "expired") {
          resStatusBadge.textContent = "EXPIRED & INACTIVE";
          resStatusBadge.style.color = "#ffffff";
          resStatusBadge.style.backgroundColor = "#FF2247";
        } else {
          resStatusBadge.textContent = "SUSPENDED";
          resStatusBadge.style.color = "#0a0a0a";
          resStatusBadge.style.backgroundColor = "#f5f5f5";
        }
      }

      if (resDownloadBtn) {
        if (lic.hasPdf) {
          resDownloadBtn.href = lic.downloadUrl;
          resDownloadBtn.style.display = "inline-flex";
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

      if (certResult) certResult.style.display = "block";
    } else {
      currentVerifiedLicense = null;
      showVerifyState("error", data.message || `LICENSE NOT FOUND: '${cleanCode}' does not exist in registry.`);
    }
  } catch (err) {
    showVerifyState("error", "CONNECTION ERROR: Unable to query registry server.");
  }
}

// Form Handler
if (verifyForm) {
  verifyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (licenseCodeInput) {
      executeVerification(licenseCodeInput.value);
    }
  });
}

// Quick Sample Autofill & Verify
window.fillAndVerify = function(code) {
  if (licenseCodeInput) {
    licenseCodeInput.value = code;
    const verifySection = document.getElementById("verify");
    if (verifySection) verifySection.scrollIntoView({ behavior: "smooth" });
    executeVerification(code);
  }
};

// Copy Code Button
if (btnCopyCode) {
  btnCopyCode.addEventListener("click", () => {
    if (!currentVerifiedLicense) return;
    copyToClipboard(currentVerifiedLicense.code, btnCopyCode, "COPIED CODE");
  });
}

function copyToClipboard(text, btnElement, feedbackText = "COPIED") {
  const originalText = btnElement ? btnElement.textContent : "";
  const onCopied = () => {
    if (btnElement) {
      btnElement.textContent = feedbackText;
      setTimeout(() => { btnElement.textContent = originalText; }, 1800);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopied).catch(() => fallbackCopy(text, onCopied));
  } else {
    fallbackCopy(text, onCopied);
  }
}

function fallbackCopy(text, callback) {
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

// PDF Modal Controls
function openSitePdfModal(code, previewUrl, downloadUrl) {
  if (!sitePdfModal) return;
  if (sitePdfTitle) sitePdfTitle.textContent = `NO!SER // ${code} — CONTRACT PREVIEW`;
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

// URL Param Query (?code=NS-2026-XXXX)
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || params.get("license") || params.get("verify");
  if (code) {
    if (licenseCodeInput) licenseCodeInput.value = code;
    setTimeout(() => {
      const el = document.getElementById("verify");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      executeVerification(code);
    }, 200);
  }
}

// Helper
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Init Year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

checkUrlParams();
