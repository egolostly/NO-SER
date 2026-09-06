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

// Rate limiting & Brute-force protection
const failedAuthAttempts = new Map(); // ip -> { count, lockedUntil }

function checkAuthRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const record = failedAuthAttempts.get(ip);

  if (record && record.lockedUntil && record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many failed authentication attempts. Please retry in ${remainingSec} seconds.`
    });
  }

  next();
}

function recordFailedAuth(ip) {
  const now = Date.now();
  const record = failedAuthAttempts.get(ip) || { count: 0, lockedUntil: null };
  record.count += 1;

  if (record.count >= 6) {
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
      cb(new Error('Only PDF files are permitted (.pdf)'));
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
        parsed.masterPasskey = 'EgoLost.6565';
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
    masterPasskey: 'EgoLost.6565',
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
  const masterKey = (admin.masterPasskey || 'EgoLost.6565').trim();

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
    return res.status(401).json({ success: false, message: 'Authentication required. Please log into admin panel.' });
  }

  if (!isValidAdminToken(token)) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }

  const admin = getAdminConfig();
  req.adminUser = admin.username || 'admin';
  next();
}

// Format bytes helper
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

// Initialize seed data
function initializeSeedData() {
  getAdminConfig();
  let licenses = readLicenses();
  if (licenses.length === 0) {
    const sampleLicense = {
      id: 'lic_' + crypto.randomBytes(6).toString('hex'),
      code: 'NS-2026-9999',
      customerName: 'Marcus Vance',
      customerEmail: 'm.vance@soundworks.io',
      trackTitle: 'STRIKER (EXCLUSIVE)',
      licenseType: 'Exclusive Agreement',
      issueDate: '2026-09-06',
      status: 'active',
      pdfOriginalName: 'NOISER_STRIKER_Exclusive_NS-2026-9999.pdf',
      pdfStoredFilename: 'sample_vertica_license.pdf',
      pdfFileSize: 124000,
      pdfMimeType: 'application/pdf',
      notes: 'Master license certificate record.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloadCount: 4,
      lastDownloadedAt: new Date().toISOString()
    };
    licenses = [sampleLicense];
    saveLicenses(licenses);
  }
}
initializeSeedData();

// ================= API ROUTES =================

// Direct Passkey / Gatekeeper Login
app.post('/api/auth/gatekeeper', checkAuthRateLimit, (req, res) => {
  const { passkey } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';

  if (!passkey) {
    recordFailedAuth(ip);
    return res.status(400).json({ success: false, message: 'Master passkey is required.' });
  }

  const admin = getAdminConfig();
  const targetPasskey = admin.masterPasskey || 'EgoLost.6565';

  if (passkey.trim() !== targetPasskey.trim()) {
    recordFailedAuth(ip);
    return res.status(403).json({ success: false, message: 'Invalid Master Passkey.' });
  }

  recordSuccessfulAuth(ip);
  const token = generateToken(admin.username || 'admin');
  res.cookie('noiser_admin_token', token, {
    httpOnly: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    message: 'Master authentication successful.',
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
    return res.status(400).json({ success: false, message: 'Username and password/passkey required.' });
  }

  const admin = getAdminConfig();
  const isPasskeyMatch = password.trim() === (admin.masterPasskey || 'EgoLost.6565').trim();
  const isCredentialMatch = username === admin.username && verifyPassword(password, admin.passwordHash, admin.salt);

  if (!isPasskeyMatch && !isCredentialMatch) {
    recordFailedAuth(ip);
    return res.status(401).json({ success: false, message: 'Invalid credentials or passkey.' });
  }

  recordSuccessfulAuth(ip);
  const token = generateToken(admin.username || 'admin');
  res.cookie('noiser_admin_token', token, {
    httpOnly: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    message: 'Login successful.',
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
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newUsername, newPassword, newMasterPasskey } = req.body;
  const admin = getAdminConfig();

  if (!currentPassword || !verifyPassword(currentPassword, admin.passwordHash, admin.salt)) {
    return res.status(400).json({ success: false, message: 'Current password/passkey is incorrect.' });
  }

  if (newUsername && newUsername.trim()) {
    admin.username = newUsername.trim();
  }

  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    const { hash, salt } = hashPassword(newPassword.trim());
    admin.passwordHash = hash;
    admin.salt = salt;
  }

  if (newMasterPasskey && newMasterPasskey.trim()) {
    if (newMasterPasskey.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Master passkey must be at least 4 characters.' });
    }
    admin.masterPasskey = newMasterPasskey.trim();
  }

  admin.updatedAt = new Date().toISOString();
  saveAdminConfig(admin);

  return res.json({ success: true, message: 'Security credentials updated successfully.' });
});

// --- Public License Verification Endpoint ---
app.get('/api/licenses/verify/:code', (req, res) => {
  try {
    const reqCode = (req.params.code || '').trim().toUpperCase();
    if (!reqCode) {
      return res.status(400).json({ success: false, message: 'License code is required.' });
    }

    const licenses = readLicenses();
    const found = licenses.find(l => l.code.toUpperCase() === reqCode);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: `License code '${reqCode}' not found in registry.`
      });
    }

    const hasPdf = Boolean(found.pdfStoredFilename && fs.existsSync(path.join(UPLOADS_DIR, found.pdfStoredFilename)));

    return res.json({
      success: true,
      license: {
        code: found.code,
        customerName: found.customerName || 'Official Licensee',
        customerEmailMasked: maskEmail(found.customerEmail) || 'Masked / Protected',
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
    return res.status(500).json({ success: false, message: 'Registry lookup failed.' });
  }
});

// --- Public Download Endpoint ---
app.get('/api/licenses/download/:code', (req, res) => {
  try {
    const reqCode = (req.params.code || '').trim().toUpperCase();
    const licenses = readLicenses();
    const found = licenses.find(l => l.code.toUpperCase() === reqCode);

    if (!found || !found.pdfStoredFilename) {
      return res.status(404).send('License PDF document not found.');
    }

    const filePath = path.join(UPLOADS_DIR, found.pdfStoredFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('PDF file does not exist on storage server.');
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
    return res.status(500).send('Unable to download license PDF.');
  }
});

// --- Public Preview Endpoint ---
app.get('/api/licenses/preview/:code', (req, res) => {
  try {
    const reqCode = (req.params.code || '').trim().toUpperCase();
    const licenses = readLicenses();
    const found = licenses.find(l => l.code.toUpperCase() === reqCode);

    if (!found || !found.pdfStoredFilename) {
      return res.status(404).send('License document not found.');
    }

    const filePath = path.join(UPLOADS_DIR, found.pdfStoredFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('PDF file not available for preview.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).send('Unable to load preview.');
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
    return res.status(500).json({ success: false, message: 'Failed to load licenses.' });
  }
});

// Create new license
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

    if (req.file) {
      const isGenuinePdf = validatePdfMagicBytes(req.file.path);
      if (!isGenuinePdf) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid file format. Uploaded file is not a valid PDF.'
        });
      }
    }

    const rawCode = code && code.trim() ? code.trim().toUpperCase() : `NS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    if (!/^[A-Z0-9\-_]{3,40}$/.test(rawCode)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'License code format is invalid (e.g. NS-2026-9999).'
      });
    }

    const licenses = readLicenses();
    const exists = licenses.some(l => l.code.toUpperCase() === rawCode);

    if (exists) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `License code '${rawCode}' already exists in registry.`
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
      customerName: (customerName && customerName.trim()) || 'Official Licensee',
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
      message: 'License and PDF certificate committed to registry ledger successfully.',
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
    return res.status(500).json({ success: false, message: 'Failed to create license: ' + err.message });
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
          message: 'Invalid file format. Uploaded file is not a valid PDF.'
        });
      }
    }

    const licenses = readLicenses();
    const index = licenses.findIndex(l => l.id === licenseId);

    if (index === -1) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'License record not found.' });
    }

    const existing = licenses[index];
    const cleanCode = code ? code.trim().toUpperCase() : existing.code;

    if (cleanCode !== existing.code) {
      const duplicate = licenses.some(l => l.id !== licenseId && l.code.toUpperCase() === cleanCode);
      if (duplicate) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Code '${cleanCode}' is already used by another record.`
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
      message: 'License record updated successfully.',
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
    return res.status(500).json({ success: false, message: 'Update failed: ' + err.message });
  }
});

// Delete license
app.delete('/api/admin/licenses/:id', authMiddleware, (req, res) => {
  try {
    const licenseId = req.params.id;
    const licenses = readLicenses();
    const index = licenses.findIndex(l => l.id === licenseId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'License record not found.' });
    }

    const [deleted] = licenses.splice(index, 1);

    if (deleted.pdfStoredFilename) {
      const filePath = path.join(UPLOADS_DIR, deleted.pdfStoredFilename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    saveLicenses(licenses);
    return res.json({ success: true, message: `License '${deleted.code}' and associated file deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Deletion failed: ' + err.message });
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
  const zipPath = path.join(__dirname, 'NOISER_Website_Complete.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="NOISER_Website_Complete.zip"');
    return res.sendFile(zipPath);
  }
  res.status(404).send('ZIP file not found.');
});

// Import licenses backup
app.post('/api/admin/import', authMiddleware, (req, res) => {
  try {
    const importedData = req.body;
    if (!Array.isArray(importedData)) {
      return res.status(400).json({ success: false, message: 'Invalid JSON data format.' });
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
      message: `${importedData.length} license records processed and merged.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Import failed: ' + err.message });
  }
});

// Admin Static Route Handler
// If query parameter contains key, automatically authenticate
app.use('/admin', (req, res, next) => {
  const queryKey = req.query.key || req.query.passkey || req.query.secret || req.query.access || req.query.vault || req.query.token;
  if (queryKey && isValidAdminToken(queryKey)) {
    const admin = getAdminConfig();
    const deterministicToken = crypto.createHmac('sha256', ADMIN_SECRET).update(`${admin.username || 'admin'}-noiser-session`).digest('hex');
    activeSessions.set(deterministicToken, {
      username: admin.username,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    res.cookie('noiser_admin_token', deterministicToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }
  next();
}, express.static(path.join(__dirname, 'admin')));

// Serve root static files
app.use(express.static(__dirname));

// General SPA fallback for other routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    if (req.path.startsWith('/admin')) {
      return res.sendFile(path.join(__dirname, 'admin', 'index.html'));
    }
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.sendFile(path.join(__dirname, 'index (2).html'));
  }
  res.status(404).send('Not Found');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NO!SER Production Server running on http://0.0.0.0:${PORT}`);
});
