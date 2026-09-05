// NO!SER Admin Dashboard Script - High Speed & Live Integration

let currentAdminUser = null;
let allLicensesCache = [];
let deleteTargetId = null;

// ================= DOM ELEMENTS =================
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const authKey = document.getElementById('auth-key');
const authError = document.getElementById('auth-error');
const toastContainer = document.getElementById('toast-container');

// Tabs
const navButtons = document.querySelectorAll('.admin-nav__btn');
const tabSections = document.querySelectorAll('.admin-tab');

// Forms & Inputs
const addLicenseForm = document.getElementById('add-license-form');
const addCodeInput = document.getElementById('add-code');
const btnGenerateCode = document.getElementById('btn-generate-code');
const addPdfInput = document.getElementById('add-pdf-file');
const pdfDropzone = document.getElementById('pdf-dropzone');
const dropzoneFileInfo = document.getElementById('dropzone-file-info');
const dropzoneFilename = document.getElementById('dropzone-filename');
const dropzoneFilesize = document.getElementById('dropzone-filesize');
const btnRemoveSelectedFile = document.getElementById('btn-remove-selected-file');

// Tables
const allLicensesTbody = document.getElementById('all-licenses-tbody');
const badgeTotalCount = document.getElementById('badge-total-count');

// Stats Elements
const statTotalLicenses = document.getElementById('stat-total-licenses');
const statActiveLicenses = document.getElementById('stat-active-licenses');
const statTotalDownloads = document.getElementById('stat-total-downloads');
const statStorageUsed = document.getElementById('stat-storage-used');

// Filter & Search
const licenseFilterSearch = document.getElementById('license-filter-search');
const btnRefreshLicenses = document.getElementById('btn-refresh-licenses');

// Quick Search
const quickSearchInput = document.getElementById('quick-search-input');
const btnQuickSearch = document.getElementById('btn-quick-search');
const quickSearchResult = document.getElementById('quick-search-result');

// Modals
const editModal = document.getElementById('edit-modal');
const editLicenseForm = document.getElementById('edit-license-form');
const previewModal = document.getElementById('preview-modal');
const previewModalTitle = document.getElementById('preview-modal-title');
const previewModalIframe = document.getElementById('preview-modal-iframe');
const previewModalDownloadBtn = document.getElementById('preview-modal-download-btn');
const deleteModal = document.getElementById('delete-modal');
const deleteCodeDisplay = document.getElementById('delete-code-display');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

// Settings
const changePasswordForm = document.getElementById('change-password-form');
const importBackupFile = document.getElementById('import-backup-file');
const btnLogout = document.getElementById('btn-logout');

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else {
    iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ================= HELPER FUNCTIONS =================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateRandomCode() {
  const currentYear = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NS-${currentYear}-${rand}`;
}

// Auto generate initial code
if (addCodeInput && !addCodeInput.value) {
  addCodeInput.value = generateRandomCode();
}

if (btnGenerateCode && addCodeInput) {
  btnGenerateCode.addEventListener('click', () => {
    addCodeInput.value = generateRandomCode();
  });
}

// ================= AUTHENTICATION FLOW =================

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();

    if (data.authenticated && data.user) {
      currentAdminUser = data.user;
      showDashboardView();
      loadDashboardData();
    } else {
      showAuthView();
    }
  } catch (err) {
    showAuthView();
  }
}

function showAuthView() {
  if (authView) authView.style.display = 'flex';
  if (dashboardView) dashboardView.style.display = 'none';
  if (authKey) {
    authKey.value = '';
    authKey.focus();
  }
}

function showDashboardView() {
  if (authView) authView.style.display = 'none';
  if (dashboardView) dashboardView.style.display = 'block';
}

if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (authError) authError.style.display = 'none';
    const key = authKey.value.trim();

    try {
      // 1. Try gatekeeper master passkey
      const gateRes = await fetch('/api/auth/gatekeeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key })
      });
      const gateData = await gateRes.json();

      if (gateData.success && gateData.user) {
        currentAdminUser = gateData.user;
        showToast('Master anahtar doğrulandı. Panele giriş yapıldı!', 'success');
        showDashboardView();
        loadDashboardData();
        return;
      }

      // 2. Try standard login credentials
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: key })
      });
      const loginData = await loginRes.json();

      if (loginData.success && loginData.user) {
        currentAdminUser = loginData.user;
        showToast('Giriş başarılı!', 'success');
        showDashboardView();
        loadDashboardData();
      } else {
        if (authError) {
          authError.textContent = 'Geçersiz Master Anahtar veya Şifre! Lütfen kontrol ediniz.';
          authError.style.display = 'block';
        }
      }
    } catch (err) {
      if (authError) {
        authError.textContent = 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.';
        authError.style.display = 'block';
      }
    }
  });
}

// Logout
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      currentAdminUser = null;
      showToast('Oturum kapatıldı.', 'info');
      showAuthView();
    } catch (err) {
      showAuthView();
    }
  });
}

// ================= TABS =================
function switchTab(tabId) {
  navButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.tab === tabId);
  });
  tabSections.forEach((section) => {
    section.classList.toggle('is-active', section.id === `tab-${tabId}`);
  });
  if (tabId === 'licenses-list') {
    renderAllLicensesTable();
  }
}
window.switchTab = switchTab;

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ================= LOAD DATA =================
async function loadDashboardData() {
  await Promise.all([loadStats(), loadAllLicenses()]);
}

async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();

    if (data.success && data.stats) {
      const s = data.stats;
      if (statTotalLicenses) statTotalLicenses.textContent = s.totalLicenses || 0;
      if (statActiveLicenses) statActiveLicenses.textContent = s.activeLicenses || 0;
      if (statTotalDownloads) statTotalDownloads.textContent = s.totalDownloads || 0;
      if (statStorageUsed) statStorageUsed.textContent = s.storageUsed || '0 B';
      if (badgeTotalCount) badgeTotalCount.textContent = s.totalLicenses || 0;
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
}

async function loadAllLicenses() {
  try {
    const res = await fetch('/api/admin/licenses');
    const data = await res.json();

    if (data.success && data.licenses) {
      allLicensesCache = data.licenses;
      if (badgeTotalCount) badgeTotalCount.textContent = allLicensesCache.length;
      renderAllLicensesTable();
    }
  } catch (err) {
    console.error('Licenses error:', err);
  }
}

// ================= RENDER LICENSES TABLE =================
function renderAllLicensesTable() {
  if (!allLicensesTbody) return;

  const searchQuery = (licenseFilterSearch && licenseFilterSearch.value.trim().toLowerCase()) || '';

  let filtered = allLicensesCache.filter((lic) => {
    if (searchQuery) {
      const matchCode = (lic.code || '').toLowerCase().includes(searchQuery);
      const matchName = (lic.customerName || '').toLowerCase().includes(searchQuery);
      const matchEmail = (lic.customerEmail || '').toLowerCase().includes(searchQuery);
      const matchTrack = (lic.trackTitle || '').toLowerCase().includes(searchQuery);
      if (!matchCode && !matchName && !matchEmail && !matchTrack) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    allLicensesTbody.innerHTML = '<tr><td colspan="8" class="table-empty">Kayıtlı lisans bulunamadı.</td></tr>';
    return;
  }

  allLicensesTbody.innerHTML = filtered.map((lic) => `
    <tr>
      <td>
        <span class="table-code">${escapeHtml(lic.code)}</span>
        <button type="button" class="btn-copy-code" onclick="copyText('${lic.code}', 'Lisans kodu kopyalandı!')" title="Kodu Kopyala">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      </td>
      <td>
        <div class="client-info">
          <span class="client-name">${escapeHtml(lic.customerName || '-')}</span>
          <span class="client-email">${escapeHtml(lic.customerEmail || '-')}</span>
        </div>
      </td>
      <td><strong>${escapeHtml(lic.trackTitle || '-')}</strong></td>
      <td>
        ${lic.hasPdf 
          ? `<span class="pdf-badge" title="${lic.pdfOriginalName || ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> ${lic.pdfSizeFormatted || 'PDF'}</span>` 
          : '<span style="color: rgba(255,255,255,0.3);">PDF Yok</span>'}
      </td>
      <td><strong>${lic.downloadCount || 0}</strong></td>
      <td>${escapeHtml(lic.issueDate || '-')}</td>
      <td><span class="status-badge status-badge--${lic.status || 'active'}">${lic.status === 'active' ? 'Aktif' : lic.status === 'expired' ? 'Süresi Doldu' : 'Askıda'}</span></td>
      <td style="text-align: right;">
        <div class="action-buttons">
          ${lic.hasPdf ? `<button type="button" class="action-btn" onclick="openPdfPreview('${lic.code}')" title="PDF Önizle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>` : ''}
          ${lic.hasPdf ? `<a href="/api/licenses/download/${encodeURIComponent(lic.code)}" class="action-btn" title="PDF İndir" download><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>` : ''}
          <button type="button" class="action-btn" onclick="openPublicVerifyLink('${lic.code}')" title="Sorgulama Sayfasında Gör"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
          <button type="button" class="action-btn" onclick="openEditModalById('${lic.id}')" title="Düzenle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button type="button" class="action-btn action-btn--delete" onclick="openDeleteModal('${lic.id}', '${lic.code}')" title="Sil"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </td>
    </tr>
  `).join('');
}

if (licenseFilterSearch) licenseFilterSearch.addEventListener('input', renderAllLicensesTable);
if (btnRefreshLicenses) {
  btnRefreshLicenses.addEventListener('click', async () => {
    await loadDashboardData();
    showToast('Veriler güncellendi.', 'info');
  });
}

// ================= DROPZONE =================
if (addPdfInput && pdfDropzone) {
  addPdfInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      pdfDropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      pdfDropzone.classList.remove('is-dragover');
    });
  });

  pdfDropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files.length) {
      addPdfInput.files = e.dataTransfer.files;
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
}

function handleFileSelect(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    showToast('Lütfen sadece PDF formatında dosya yükleyin.', 'error');
    if (addPdfInput) addPdfInput.value = '';
    return;
  }
  if (dropzoneFileInfo && dropzoneFilename && dropzoneFilesize) {
    dropzoneFilename.textContent = file.name;
    dropzoneFilesize.textContent = formatBytes(file.size);
    dropzoneFileInfo.style.display = 'flex';
    const contentBox = pdfDropzone.querySelector('.pdf-dropzone__content');
    if (contentBox) contentBox.style.display = 'none';
  }
}

if (btnRemoveSelectedFile) {
  btnRemoveSelectedFile.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addPdfInput) addPdfInput.value = '';
    if (dropzoneFileInfo) dropzoneFileInfo.style.display = 'none';
    const contentBox = pdfDropzone.querySelector('.pdf-dropzone__content');
    if (contentBox) contentBox.style.display = 'block';
  });
}

function resetAddForm() {
  if (addLicenseForm) addLicenseForm.reset();
  if (addCodeInput) addCodeInput.value = generateRandomCode();
  if (btnRemoveSelectedFile) btnRemoveSelectedFile.click();
}
window.resetAddForm = resetAddForm;

// ================= CREATE LICENSE (LIVE AUTOMATIC INTEGRATION) =================
if (addLicenseForm) {
  addLicenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-add-license');
    if (btnSubmit) btnSubmit.disabled = true;

    try {
      const formData = new FormData(addLicenseForm);
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        showToast('Lisans ve PDF başarıyla yüklendi ve anında yayına alındı!', 'success');
        resetAddForm();
        await loadDashboardData();
        switchTab('licenses-list');
      } else {
        showToast(data.message || 'Lisans eklenemedi.', 'error');
      }
    } catch (err) {
      showToast('Sunucu hatası oluştu.', 'error');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
}

// ================= EDIT LICENSE =================
function openEditModalById(licenseId) {
  const lic = allLicensesCache.find((l) => l.id === licenseId);
  if (!lic) return;

  document.getElementById('edit-id').value = lic.id;
  document.getElementById('edit-code').value = lic.code;
  document.getElementById('edit-customer-name').value = lic.customerName || '';
  document.getElementById('edit-customer-email').value = lic.customerEmail || '';
  document.getElementById('edit-track-title').value = lic.trackTitle || '';
  document.getElementById('edit-status').value = lic.status || 'active';

  const editPdfInfo = document.getElementById('edit-current-pdf-info');
  if (editPdfInfo) {
    if (lic.hasPdf) {
      editPdfInfo.textContent = `Mevcut Dosya: ${lic.pdfOriginalName || 'license.pdf'} (${lic.pdfSizeFormatted || ''}).`;
    } else {
      editPdfInfo.textContent = 'Mevcut bir PDF belgesi yüklenmemiş.';
    }
  }

  if (editModal) editModal.classList.add('is-open');
}
window.openEditModalById = openEditModalById;

function closeEditModal() {
  if (editModal) editModal.classList.remove('is-open');
}
window.closeEditModal = closeEditModal;

if (editLicenseForm) {
  editLicenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const licenseId = document.getElementById('edit-id').value;
    const formData = new FormData(editLicenseForm);

    try {
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseId)}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        showToast('Lisans güncellendi!', 'success');
        closeEditModal();
        await loadDashboardData();
      } else {
        showToast(data.message || 'Güncelleme başarısız.', 'error');
      }
    } catch (err) {
      showToast('Sunucu hatası.', 'error');
    }
  });
}

// ================= DELETE LICENSE =================
function openDeleteModal(id, code) {
  deleteTargetId = id;
  if (deleteCodeDisplay) deleteCodeDisplay.textContent = code;
  if (deleteModal) deleteModal.classList.add('is-open');
}
window.openDeleteModal = openDeleteModal;

function closeDeleteModal() {
  deleteTargetId = null;
  if (deleteModal) deleteModal.classList.remove('is-open');
}
window.closeDeleteModal = closeDeleteModal;

if (btnConfirmDelete) {
  btnConfirmDelete.addEventListener('click', async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(deleteTargetId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        showToast('Lisans ve PDF silindi.', 'success');
        closeDeleteModal();
        await loadDashboardData();
      } else {
        showToast(data.message || 'Silme başarısız.', 'error');
      }
    } catch (err) {
      showToast('Sunucu hatası.', 'error');
    }
  });
}

// ================= PDF PREVIEW =================
function openPdfPreview(code) {
  if (!previewModal) return;
  if (previewModalTitle) previewModalTitle.textContent = `${code} — PDF Belgesi`;
  if (previewModalIframe) previewModalIframe.src = `/api/licenses/preview/${encodeURIComponent(code)}`;
  if (previewModalDownloadBtn) previewModalDownloadBtn.href = `/api/licenses/download/${encodeURIComponent(code)}`;
  previewModal.classList.add('is-open');
}
window.openPdfPreview = openPdfPreview;

function closePreviewModal() {
  if (!previewModal) return;
  previewModal.classList.remove('is-open');
  if (previewModalIframe) previewModalIframe.src = '';
}
window.closePreviewModal = closePreviewModal;

// ================= QUICK SEARCH IN ADMIN =================
if (btnQuickSearch && quickSearchInput) {
  const handleQuickSearch = async () => {
    const query = quickSearchInput.value.trim();
    if (!query) return;

    if (quickSearchResult) {
      quickSearchResult.style.display = 'block';
      quickSearchResult.innerHTML = 'Sorgulanıyor...';
    }

    try {
      const res = await fetch(`/api/licenses/verify/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success && data.license) {
        const lic = data.license;
        quickSearchResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: var(--gold); font-family: ui-monospace, monospace; font-size: 15px;">${escapeHtml(lic.code)}</strong>
            <span class="status-badge status-badge--${lic.status}">${lic.status === 'active' ? 'Aktif' : lic.status}</span>
          </div>
          <p><strong>Müşteri:</strong> ${escapeHtml(lic.customerName || '-')} (${escapeHtml(lic.customerEmailMasked || '-')})</p>
          <p><strong>Parça:</strong> ${escapeHtml(lic.trackTitle || '-')}</p>
          <div style="margin-top: 10px; display: flex; gap: 8px;">
            ${lic.hasPdf ? `<button type="button" class="btn btn--gold btn--xs" onclick="openPdfPreview('${lic.code}')">PDF Gör</button>` : ''}
            ${lic.hasPdf ? `<a href="/api/licenses/download/${encodeURIComponent(lic.code)}" class="btn btn--outline btn--xs" download>İndir</a>` : ''}
            <button type="button" class="btn btn--outline btn--xs" onclick="openPublicVerifyLink('${lic.code}')">Sitede Doğrula</button>
          </div>
        `;
      } else {
        quickSearchResult.innerHTML = `<span style="color: #f87171;">'${escapeHtml(query)}' koduna ait lisans bulunamadı.</span>`;
      }
    } catch (err) {
      quickSearchResult.innerHTML = '<span style="color: #f87171;">Sorgulama hatası oluştu.</span>';
    }
  };

  btnQuickSearch.addEventListener('click', handleQuickSearch);
  quickSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQuickSearch();
  });
}

function copyText(text, successMessage = 'Kopyalandı!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(successMessage, 'success'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMessage, 'success');
    } catch (e) {}
    document.body.removeChild(ta);
  }
}
window.copyText = copyText;

function openPublicVerifyLink(code) {
  window.open(`/?code=${encodeURIComponent(code)}#license`, '_blank');
}
window.openPublicVerifyLink = openPublicVerifyLink;

// Escape key to close modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEditModal();
    closePreviewModal();
    closeDeleteModal();
  }
});

// Settings Form
if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('settings-current-password').value;
    const newMasterPasskey = document.getElementById('settings-new-master-passkey').value;
    const newPassword = document.getElementById('settings-new-password').value;

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newMasterPasskey, newPassword })
      });
      const data = await res.json();

      if (data.success) {
        showToast('Güvenlik bilgileri güncellendi.', 'success');
        changePasswordForm.reset();
      } else {
        showToast(data.message || 'Güncelleme başarısız.', 'error');
      }
    } catch (err) {
      showToast('Sunucu hatası.', 'error');
    }
  });
}

// Backup import
if (importBackupFile) {
  importBackupFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });
      const data = await res.json();

      if (data.success) {
        showToast('Yedek başarıyla yüklendi!', 'success');
        await loadDashboardData();
      } else {
        showToast(data.message || 'Geri yükleme başarısız.', 'error');
      }
    } catch (err) {
      showToast('JSON dosyası okunamadı.', 'error');
    } finally {
      importBackupFile.value = '';
    }
  });
}

// Start
checkAuthStatus();
