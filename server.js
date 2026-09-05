const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'licenses');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Security Middleware & HTTP Hardening
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Rate limiting and Brute-force protection
const failedAuthAttempts = new Map(); // ip -> { count, lockedUntil }

function checkAuthRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const record = failedAuthAttempts.get(ip);

  if (record && record.lockedUntil && record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Çok fazla hatalı giriş denemesi yapıldı! Lütfen ${remainingSec} saniye sonra tekrar deneyin.`
    });
  }

  next();
}

function recordFailedAuth(ip) {
  const now = Date.now();
  const record = failedAuthAttempts.get(ip) || { count: 0, lockedUntil: null };
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
  }

  failedAuthAttempts.set(ip, record);
}

function recordSuccessfulAuth(ip) {
  failedAuthAttempts.delete(ip);
}

// PDF Magic Byte Validator (ensures uploaded file is genuine %PDF)
function validatePdfMagicBytes(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    return buffer.toString('ascii') === '%PDF';
  } catch (err) {
    return false;
  }
}

// Multer storage configuration for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e6);
    cb(null, `license_${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyaları yüklenebilir (.pdf)'));
    }
  }
});

// Helper functions for Database
function readLicenses() {
  try {
    if (!fs.existsSync(LICENSES_FILE)) return [];
    const data = fs.readFileSync(LICENSES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading licenses:', err);
    return [];
  }
}

function saveLicenses(licenses) {
  try {
    const tempFile = `${LICENSES_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(licenses, null, 2), 'utf8');
    fs.renameSync(tempFile, LICENSES_FILE);
    return true;
  } catch (err) {
    console.error('Error saving licenses:', err);
    return false;
  }
}

// Password hashing
function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const result = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return result === hash;
}

function getAdminConfig() {
  try {
    if (fs.existsSync(ADMIN_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
      if (!parsed.masterPasskey) {
        parsed.masterPasskey = 'NOISER2026';
        saveAdminConfig(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading admin config:', err);
  }
  
  // Default admin configuration
  const { hash, salt } = hashPassword('admin123');
  const defaultAdmin = {
    username: 'admin',
    passwordHash: hash,
    salt: salt,
    masterPasskey: 'NOISER2026',
    name: 'NO!SER Master Admin',
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultAdmin, null, 2), 'utf8');
  return defaultAdmin;
}

function saveAdminConfig(config) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(config, null, 2), 'utf8');
}

// Persistent session map and secret
const activeSessions = new Map();
const ADMIN_SECRET = 'noiser_master_secret_key_2026';

function generateToken(username) {
  const token = crypto.createHmac('sha256', ADMIN_SECRET).update(`${username}-noiser-session`).digest('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  activeSessions.set(token, { username, expiresAt });
  return token;
}

function isValidAdminToken(token) {
  if (!token) return false;
  const admin = getAdminConfig();
  const masterKey = (admin.masterPasskey || 'NOISER2026').trim();

  // 1. Direct match with master passkey
  if (token === masterKey) return true;

  // 2. Match with deterministic token
  const expectedToken = crypto.createHmac('sha256', ADMIN_SECRET).update(`${admin.username || 'admin'}-noiser-session`).digest('hex');
  if (token === expectedToken) return true;

  // 3. Match in active session map
  const session = activeSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return true;
  }

  return false;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] || req.headers['x-master-passkey'];
  const cookieToken = req.cookies && req.cookies.noiser_admin_token;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader;
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Oturum bulunamadı. Lütfen yönetim paneline tekrar giriş yapın.' });
  }

  if (!isValidAdminToken(token)) {
    return res.status(401).json({ success: false, message: 'Oturum süresi doldu veya geçersiz anahtar. Lütfen tekrar giriş yapın.' });
  }

  const admin = getAdminConfig();
  req.adminUser = admin.username || 'admin';
  next();
}

// Initialize seed data
function initializeSeedData() {
  getAdminConfig();
  let licenses = readLicenses();
  if (licenses.length === 0) {
    const sampleLicense = {
      id: 'lic_' + crypto.randomBytes(6).toString('hex'),
      code: 'NS-2026-8842',
      customerName: 'Resmi Lisans Sahibi',
      customerEmail: 'client@example.com',
      trackTitle: 'VERTICA',
      licenseType: 'Official Unlimited Lease',
      issueDate: '2026-09-05',
      status: 'active',
      pdfOriginalName: 'NOISER_VERTICA_License_NS-2026-8842.pdf',
      pdfStoredFilename: 'sample_vertica_license.pdf',
      pdfFileSize: fs.existsSync(path.join(UPLOADS_DIR, 'sample_vertica_license.pdf')) 
        ? fs.statSync(path.join(UPLOADS_DIR, 'sample_vertica_license.pdf')).size 
        : 124000,
      pdfMimeType: 'application/pdf',
      notes: 'Resmi sözleşme kaydı.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloadCount: 0,
      lastDownloadedAt: null
    };
    licenses = [sampleLicense];
    saveLicenses(licenses);
  }
}
initializeSeedData();

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const parts = email.split('@');
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 
    ? name.substring(0, 2) + '*'.repeat(Math.max(3, name.length - 2))
    : name + '***';
  return `${maskedName}@${domain}`;
}

// ================= API ROUTES =================

// Direct Passkey / Gatekeeper Login (Instant Entry with Master Passkey)
app.post('/api/auth/gatekeeper', checkAuthRateLimit, (req, res) => {
  const { passkey } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';

  if (!passkey) {
    recordFailedAuth(ip);
    return res.status(400).json({ success: false, message: 'Master güvenlik anahtarı girilmelidir.' });
  }

  const admin = getAdminConfig();
  const targetPasskey = admin.masterPasskey || 'NOISER2026';

  if (passkey.trim() !== targetPasskey.trim()) {
    recordFailedAuth(ip);
    return res.status(403).json({ success: false, message: 'Geçersiz Master Güvenlik Anahtarı!' });
  }

  recordSuccessfulAuth(ip);
  const token = generateToken(admin.username || 'admin');
  res.cookie('noiser_admin_token', token, {
    httpOnly: false,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    message: 'Master yetkilendirme başarılı.',
    token,
    user: {
      username: admin.username,
      name: admin.name || 'NO!SER Master Admin'
    }
  });
});

// Admin Username / Password Login
app.post('/api/auth/login', checkAuthRateLimit, (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';

  if (!username || !password) {
    recordFailedAuth(ip);
    return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  const admin = getAdminConfig();

  // Allow login with either admin credentials OR master passkey in password field
  const isPasskeyMatch = password.trim() === (admin.masterPasskey || 'NOISER2026').trim();
  const isCredentialMatch = username === admin.username && verifyPassword(password, admin.passwordHash, admin.salt);

  if (!isPasskeyMatch && !isCredentialMatch) {
    recordFailedAuth(ip);
    return res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre / anahtar.' });
  }

  recordSuccessfulAuth(ip);
  const token = generateToken(admin.username || 'admin');
  res.cookie('noiser_admin_token', token, {
    httpOnly: false,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    token,
    user: {
      username: admin.username,
      name: admin.name || 'NO!SER Master Admin'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] || req.headers['x-master-passkey'];
  const cookieToken = req.cookies && req.cookies.noiser_admin_token;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader;
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token || !isValidAdminToken(token)) {
    return res.json({ authenticated: false });
  }

  const admin = getAdminConfig();
  return res.json({
    authenticated: true,
    user: {
      username: admin.username,
      name: admin.name || 'NO!SER Master Admin'
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const cookieToken = req.cookies && req.cookies.noiser_admin_token;
  if (cookieToken) activeSessions.delete(cookieToken);
  res.clearCookie('noiser_admin_token');
  res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
});

app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newUsername, newPassword, newMasterPasskey } = req.body;
  const admin = getAdminConfig();

  if (!currentPassword || !verifyPassword(currentPassword, admin.passwordHash, admin.salt)) {
    return res.status(400).json({ success: false, message: 'Mevcut şifre hatalı.' });
  }

  if (newUsername && newUsername.trim()) {
    admin.username = newUsername.trim();
  }

  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }
    const { hash, salt } = hashPassword(newPassword.trim());
    admin.passwordHash = hash;
    admin.salt = salt;
  }

  if (newMasterPasskey && newMasterPasskey.trim()) {
    if (newMasterPasskey.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Master anahtar en az 4 karakter olmalıdır.' });
    }
    admin.masterPasskey = newMasterPasskey.trim();
  }

  admin.updatedAt = new Date().toISOString();
  saveAdminConfig(admin);

  return res.json({ success: true, message: 'Yönetici ve güvenlik bilgileri başarıyla güncellendi.' });
});

// --- Public License Verification Endpoint ---
app.get('/api/licenses/verify/:code', (req, res) => {
  try {
    const reqCode = (req.params.code || '').trim().toUpperCase();
    if (!reqCode) {
      return res.status(400).json({ success: false, message: 'Lisans kodu gereklidir.' });
    }

    const licenses = readLicenses();
    const found = licenses.find(l => l.code.toUpperCase() === reqCode);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Girdiğiniz lisans kodu veritabanında bulunamadı.'
      });
    }

    const hasPdf = Boolean(found.pdfStoredFilename && fs.existsSync(path.join(UPLOADS_DIR, found.pdfStoredFilename)));

    return res.json({
      success: true,
      license: {
        code: found.code,
        customerName: found.customerName || 'Resmi Lisans Sahibi',
        customerEmailMasked: maskEmail(found.customerEmail) || 'Gizli / Kayıtlı',
        trackTitle: found.trackTitle || 'Prod. by NO!SER',
        licenseType: found.licenseType || 'Official License',
        issueDate: found.issueDate || new Date().toISOString().split('T')[0],
        status: found.status || 'active',
        hasPdf,
        pdfSizeFormatted: formatBytes(found.pdfFileSize || 0),
        downloadUrl: `/api/licenses/download/${encodeURIComponent(found.code)}`,
        previewUrl: `/api/licenses/preview/${encodeURIComponent(found.code)}`
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ success: false, message: 'Sorgulama sırasında bir hata oluştu.' });
  }
});

// --- Public Download Endpoint ---
app.get('/api/licenses/download/:code', (req, res) => {
  try {
    const reqCode = (req.params.code || '').trim().toUpperCase();
    const licenses = readLicenses();
    const found = licenses.find(l => l.code.toUpperCase() === reqCode);

    if (!found || !found.pdfStoredFilename) {
      return res.status(404).send('Lisans belgesi (PDF) bulunamadı.');
    }

    const filePath = path.join(UPLOADS_DIR, found.pdfStoredFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('PDF dosyası sunucuda mevcut değil.');
    }

    found.downloadCount = (found.downloadCount || 0) + 1;
    found.lastDownloadedAt = new Date().toISOString();
    saveLicenses(licenses);

    const downloadName = found.pdfOriginalName || `NOISER_License_${found.code}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).send('Dosya indirilemedi.');
  }
});

// --- Public Preview Endpoint ---
app.get('/api/licenses/preview/:code', (req, res) => {
  try {
    const reqCode = (req.params.code || '').trim().toUpperCase();
    const licenses = readLicenses();
    const found = licenses.find(l => l.code.toUpperCase() === reqCode);

    if (!found || !found.pdfStoredFilename) {
      return res.status(404).send('Lisans belgesi bulunamadı.');
    }

    const filePath = path.join(UPLOADS_DIR, found.pdfStoredFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('PDF dosyası sunucuda mevcut değil.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).send('Önizleme yüklenemedi.');
  }
});

// --- Admin License Management APIs ---

// Get all licenses
app.get('/api/admin/licenses', authMiddleware, (req, res) => {
  try {
    const licenses = readLicenses();
    const formatted = licenses.map(item => ({
      ...item,
      hasPdf: Boolean(item.pdfStoredFilename && fs.existsSync(path.join(UPLOADS_DIR, item.pdfStoredFilename))),
      pdfSizeFormatted: formatBytes(item.pdfFileSize || 0),
      downloadUrl: `/api/licenses/download/${encodeURIComponent(item.code)}`,
      previewUrl: `/api/licenses/preview/${encodeURIComponent(item.code)}`
    }));
    return res.json({ success: true, licenses: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lisanslar yüklenemedi.' });
  }
});

// Create new license (Allows simple Code + PDF upload, auto-populating defaults)
app.post('/api/admin/licenses', authMiddleware, upload.single('pdfFile'), (req, res) => {
  try {
    const {
      code,
      customerName,
      customerEmail,
      trackTitle,
      licenseType,
      issueDate,
      status,
      notes
    } = req.body;

    // Validate uploaded file authenticity if provided
    if (req.file) {
      const isGenuinePdf = validatePdfMagicBytes(req.file.path);
      if (!isGenuinePdf) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Geçersiz PDF dosyası! Yüklenen dosya gerçek bir PDF formatı taşımıyor.'
        });
      }
    }

    const rawCode = code && code.trim() ? code.trim().toUpperCase() : `NS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Strict Code Format Check
    if (!/^[A-Z0-9\-_]{3,40}$/.test(rawCode)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Lisans kodu sadece harf, rakam ve tire içermelidir (Örn: NS-2026-8842).'
      });
    }

    const licenses = readLicenses();
    const exists = licenses.some(l => l.code.toUpperCase() === rawCode);

    if (exists) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `'${rawCode}' kodlu bir lisans zaten mevcut. Lütfen benzersiz bir lisans kodu girin.`
      });
    }

    let pdfOriginalName = null;
    let pdfStoredFilename = null;
    let pdfFileSize = 0;
    let pdfMimeType = null;

    if (req.file) {
      pdfOriginalName = req.file.originalname;
      pdfStoredFilename = req.file.filename;
      pdfFileSize = req.file.size;
      pdfMimeType = req.file.mimetype;
    }

    const newLicense = {
      id: 'lic_' + crypto.randomBytes(8).toString('hex'),
      code: rawCode,
      customerName: (customerName && customerName.trim()) || 'Resmi Lisans Sahibi',
      customerEmail: (customerEmail && customerEmail.trim()) || 'client@noiser.com',
      trackTitle: (trackTitle && trackTitle.trim()) || 'Prod. by NO!SER',
      licenseType: licenseType || 'Official License',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      status: status || 'active',
      pdfOriginalName,
      pdfStoredFilename,
      pdfFileSize,
      pdfMimeType,
      notes: (notes && notes.trim()) || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloadCount: 0,
      lastDownloadedAt: null
    };

    licenses.unshift(newLicense);
    saveLicenses(licenses);

    return res.status(201).json({
      success: true,
      message: 'Lisans belgesi ve PDF sisteme başarıyla eklendi ve anında yayına alındı.',
      license: {
        ...newLicense,
        hasPdf: Boolean(newLicense.pdfStoredFilename),
        pdfSizeFormatted: formatBytes(newLicense.pdfFileSize || 0),
        downloadUrl: `/api/licenses/download/${encodeURIComponent(newLicense.code)}`,
        previewUrl: `/api/licenses/preview/${encodeURIComponent(newLicense.code)}`
      }
    });
  } catch (err) {
    console.error('Error creating license:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({ success: false, message: 'Lisans oluşturulurken bir hata meydana geldi: ' + err.message });
  }
});

// Update license
app.put('/api/admin/licenses/:id', authMiddleware, upload.single('pdfFile'), (req, res) => {
  try {
    const licenseId = req.params.id;
    const {
      code,
      customerName,
      customerEmail,
      trackTitle,
      licenseType,
      issueDate,
      status,
      notes
    } = req.body;

    if (req.file) {
      const isGenuinePdf = validatePdfMagicBytes(req.file.path);
      if (!isGenuinePdf) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Geçersiz PDF dosyası! Yüklenen dosya gerçek bir PDF formatı taşımıyor.'
        });
      }
    }

    const licenses = readLicenses();
    const index = licenses.findIndex(l => l.id === licenseId);

    if (index === -1) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Güncellenecek lisans bulunamadı.' });
    }

    const existing = licenses[index];
    const cleanCode = code ? code.trim().toUpperCase() : existing.code;

    if (cleanCode !== existing.code) {
      const duplicate = licenses.some(l => l.id !== licenseId && l.code.toUpperCase() === cleanCode);
      if (duplicate) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `'${cleanCode}' lisans kodu başka bir lisans tarafından kullanılıyor.`
        });
      }
    }

    existing.code = cleanCode;
    if (customerName !== undefined) existing.customerName = customerName.trim();
    if (customerEmail !== undefined) existing.customerEmail = customerEmail.trim();
    if (trackTitle !== undefined) existing.trackTitle = trackTitle.trim();
    if (licenseType) existing.licenseType = licenseType;
    if (issueDate) existing.issueDate = issueDate;
    if (status) existing.status = status;
    if (notes !== undefined) existing.notes = notes.trim();
    existing.updatedAt = new Date().toISOString();

    if (req.file) {
      if (existing.pdfStoredFilename) {
        const oldFile = path.join(UPLOADS_DIR, existing.pdfStoredFilename);
        if (fs.existsSync(oldFile)) {
          try { fs.unlinkSync(oldFile); } catch (e) {}
        }
      }
      existing.pdfOriginalName = req.file.originalname;
      existing.pdfStoredFilename = req.file.filename;
      existing.pdfFileSize = req.file.size;
      existing.pdfMimeType = req.file.mimetype;
    }

    licenses[index] = existing;
    saveLicenses(licenses);

    return res.json({
      success: true,
      message: 'Lisans başarıyla güncellendi.',
      license: {
        ...existing,
        hasPdf: Boolean(existing.pdfStoredFilename),
        pdfSizeFormatted: formatBytes(existing.pdfFileSize || 0),
        downloadUrl: `/api/licenses/download/${encodeURIComponent(existing.code)}`,
        previewUrl: `/api/licenses/preview/${encodeURIComponent(existing.code)}`
      }
    });
  } catch (err) {
    console.error('Error updating license:', err);
    return res.status(500).json({ success: false, message: 'Lisans güncellenirken bir hata oluştu: ' + err.message });
  }
});

// Delete license
app.delete('/api/admin/licenses/:id', authMiddleware, (req, res) => {
  try {
    const licenseId = req.params.id;
    const licenses = readLicenses();
    const index = licenses.findIndex(l => l.id === licenseId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Silinecek lisans bulunamadı.' });
    }

    const [deleted] = licenses.splice(index, 1);

    if (deleted.pdfStoredFilename) {
      const filePath = path.join(UPLOADS_DIR, deleted.pdfStoredFilename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    saveLicenses(licenses);
    return res.json({ success: true, message: `'${deleted.code}' kodlu lisans ve PDF dosyası başarıyla silindi.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lisans silinirken hata oluştu: ' + err.message });
  }
});

// Admin Dashboard Stats
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const licenses = readLicenses();
  const total = licenses.length;
  const active = licenses.filter(l => l.status === 'active').length;
  const totalDownloads = licenses.reduce((sum, l) => sum + (l.downloadCount || 0), 0);
  
  let totalStorageBytes = 0;
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    files.forEach(f => {
      const st = fs.statSync(path.join(UPLOADS_DIR, f));
      if (st.isFile()) totalStorageBytes += st.size;
    });
  } catch (e) {}

  const recent = [...licenses]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8)
    .map(item => ({
      id: item.id,
      code: item.code,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      trackTitle: item.trackTitle,
      licenseType: item.licenseType,
      status: item.status,
      issueDate: item.issueDate,
      downloadCount: item.downloadCount || 0,
      hasPdf: Boolean(item.pdfStoredFilename && fs.existsSync(path.join(UPLOADS_DIR, item.pdfStoredFilename)))
    }));

  res.json({
    success: true,
    stats: {
      totalLicenses: total,
      activeLicenses: active,
      totalDownloads,
      storageUsed: formatBytes(totalStorageBytes),
      storageBytes: totalStorageBytes,
      recentLicenses: recent
    }
  });
});

// Export licenses backup
app.get('/api/admin/export', authMiddleware, (req, res) => {
  const licenses = readLicenses();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="noiser_licenses_backup_${Date.now()}.json"`);
  res.send(JSON.stringify(licenses, null, 2));
});

// Download full project zip directly
app.get('/download-zip', (req, res) => {
  const zipPath = path.join(__dirname, 'noiser-site-complete.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="NOISER_Website_Complete.zip"');
    return res.sendFile(zipPath);
  }
  res.status(404).send('Zip dosyası henüz oluşturulmadı.');
});

// Import licenses backup
app.post('/api/admin/import', authMiddleware, (req, res) => {
  try {
    const importedData = req.body;
    if (!Array.isArray(importedData)) {
      return res.status(400).json({ success: false, message: 'Geçersiz veri formatı.' });
    }

    const currentLicenses = readLicenses();
    const map = new Map();
    currentLicenses.forEach(item => map.set(item.code.toUpperCase(), item));
    importedData.forEach(item => {
      if (item.code) map.set(item.code.toUpperCase(), item);
    });

    const merged = Array.from(map.values());
    saveLicenses(merged);

    return res.json({
      success: true,
      message: `${importedData.length} adet lisans kaydı başarıyla işlendi.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Yedek geri yüklenirken hata oluştu: ' + err.message });
  }
});

// Anti-Scanner Honeypot: Automated exploit scanners hitting common vulnerability paths get banned immediately
const HONEYPOT_PATHS = [
  '/wp-admin', '/wp-login.php', '/phpmyadmin', '/pma', '/administrator',
  '/admin.php', '/login.php', '/cpanel', '/.env', '/config.php', '/web.config',
  '/.git/config', '/xmlrpc.php', '/setup.php'
];

app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase();
  if (HONEYPOT_PATHS.some(hp => reqPath === hp || reqPath.startsWith(hp + '/'))) {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown-ip';
    console.warn(`[SECURITY HONEYPOT] Bot scanner banned from IP: ${clientIp} for requesting: ${req.path}`);
    recordFailedAuth(clientIp);
    recordFailedAuth(clientIp);
    recordFailedAuth(clientIp);
    recordFailedAuth(clientIp);
    recordFailedAuth(clientIp); // Immediate IP lockout
    return res.status(404).send(getGeneric404Html());
  }
  next();
});

function getGeneric404Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080A0F; color: #8E9BB0; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .wrap { max-width: 460px; padding: 24px; }
    h1 { font-size: 56px; color: #F4F7FC; margin: 0 0 12px; font-weight: 800; }
    p { font-size: 15px; margin: 0 0 24px; line-height: 1.5; }
    a { color: #D4AF37; text-decoration: none; font-weight: 700; border: 1px solid rgba(212, 175, 55, 0.4); padding: 8px 18px; border-radius: 6px; }
    a:hover { background: #D4AF37; color: #080A0F; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>404</h1>
    <p>The requested URL was not found on this server.</p>
    <a href="/">Return to Home</a>
  </div>
</body>
</html>`;
}

// Stealth Admin Gatekeeper Middleware (Disguises Admin Panel behind 404 to unauthenticated requests)
function stealthAdminMiddleware(req, res, next) {
  // Check 1: Key provided in query parameter (e.g. ?key=YOUR_PASSKEY or ?vault=YOUR_PASSKEY)
  const queryKey = req.query.key || req.query.passkey || req.query.secret || req.query.access || req.query.vault || req.query.token;
  if (queryKey && isValidAdminToken(queryKey)) {
    const admin = getAdminConfig();
    const deterministicToken = crypto.createHmac('sha256', ADMIN_SECRET).update(`${admin.username || 'admin'}-noiser-session`).digest('hex');
    activeSessions.set(deterministicToken, {
      username: admin.username,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
    res.cookie('noiser_admin_token', deterministicToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return next();
  }

  // Check 2: Header Authorization / Custom Header
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] || req.headers['x-master-passkey'];
  const cookieToken = req.cookies && req.cookies.noiser_admin_token;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader;
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (token && isValidAdminToken(token)) {
    return next();
  }

  // Unauthorized: Return generic 404 Not Found so public visitors and automated scanners believe no admin portal exists!
  return res.status(404).send(getGeneric404Html());
}

// Serve static admin files under stealth protected routes
app.use('/admin', stealthAdminMiddleware, express.static(path.join(__dirname, 'admin')));
app.use('/_vault_', stealthAdminMiddleware, express.static(path.join(__dirname, 'admin')));
app.use('/_ns_core_', stealthAdminMiddleware, express.static(path.join(__dirname, 'admin')));

// Admin route fallback for secret routes
app.get(/^\/(admin|_vault_|_ns_core_)/, stealthAdminMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Serve root static files
app.use(express.static(__dirname));

// General SPA fallback for other routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.sendFile(path.join(__dirname, 'index (2).html'));
  }
  res.status(404).send(getGeneric404Html());
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NO!SER Production Server running on http://0.0.0.0:${PORT}`);
  console.log(`Stealth Security Active [Management Access via ?key=YOUR_PASSKEY]`);
});
