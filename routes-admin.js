const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { checkAdminPassword, ensureAdmin, flash, consumeFlash } = require('./admin-auth');
const { formatBytes, timeAgo } = require('./helpers');
const { UPLOAD_DIR } = require('./storage');

const router = express.Router();

// همه‌ی این روت‌ها زیر مسیر مخفی‌ای که در ADMIN_PATH تعریف شده مونت می‌شوند
// (نگاه کن به server.js) — یعنی هیچ‌جای سایت لینکی به این‌ها اشاره نمی‌کند.
// از req.baseUrl برای ریدایرکت‌ها استفاده می‌شود تا صرف‌نظر از اسلش انتهایی
// همیشه به مسیر درست برگردیم.

router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect(req.baseUrl + '/');
  const messages = consumeFlash(req);
  res.render('admin-login', {
    title: 'ورود مدیریت',
    description: 'ورود به پنل مدیریت',
    errorMsg: messages.error,
    adminBase: req.baseUrl
  });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (checkAdminPassword(password)) {
    req.session.isAdmin = true;
    return res.redirect(req.baseUrl + '/');
  }
  flash(req, 'error', 'رمز عبور اشتباه است.');
  res.redirect(req.baseUrl + '/login');
});

router.post('/logout', ensureAdmin, (req, res) => {
  req.session.isAdmin = false;
  res.redirect(req.baseUrl + '/login');
});

router.get('/', ensureAdmin, (req, res) => {
  const stats = db.getStats();
  const files = db.getFiles().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render('admin', {
    title: `پنل مدیریت | ${process.env.SITE_NAME || 'آپلودیو'}`,
    description: 'مدیریت فایل‌های سایت.',
    stats,
    files,
    formatBytes,
    timeAgo,
    adminBase: req.baseUrl
  });
});

router.post('/files/:code/delete', ensureAdmin, (req, res) => {
  const file = db.findFileByCode(req.params.code);
  if (file) {
    const filePath = path.join(UPLOAD_DIR, file.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.deleteFile(file.code);
  }
  flash(req, 'success', 'فایل حذف شد.');
  res.redirect(req.baseUrl + '/');
});

module.exports = router;
