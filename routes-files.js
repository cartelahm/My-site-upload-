const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./db');
const { formatBytes, timeAgo, safeFileName } = require('./helpers');
const { flash } = require('./admin-auth');
const { UPLOAD_DIR } = require('./storage');

const router = express.Router();

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 } });

router.get('/', (req, res) => {
  res.render('index', {
    title: `${process.env.SITE_NAME || 'آپلودیو'} — آپلود و اشتراک‌گذاری رایگان فایل`,
    description: 'فایل خود را آپلود کنید و یک لینک اختصاصی برای اشتراک‌گذاری دریافت کنید.',
    maxSizeMb: MAX_FILE_SIZE_MB
  });
});

router.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? `حجم فایل نباید بیشتر از ${MAX_FILE_SIZE_MB} مگابایت باشد.`
          : 'خطا در آپلود فایل. دوباره تلاش کنید.';
      flash(req, 'error', msg);
      return res.redirect('/');
    }
    if (!req.file) {
      flash(req, 'error', 'لطفا یک فایل انتخاب کنید.');
      return res.redirect('/');
    }
    const file = db.createFile({
      originalName: safeFileName(req.file.originalname),
      storedName: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    res.redirect(`/f/${file.code}?new=1`);
  });
});

router.get('/f/:code', (req, res) => {
  const file = db.findFileByCode(req.params.code);
  if (!file) return res.status(404).render('404', { title: 'فایل پیدا نشد', description: 'این فایل وجود ندارد.' });
  const shareUrl = `${req.protocol}://${req.get('host')}/f/${file.code}`;
  res.render('file', {
    title: `دانلود ${file.originalName} | ${process.env.SITE_NAME || 'آپلودیو'}`,
    description: `دانلود فایل ${file.originalName} با حجم ${formatBytes(file.size)}.`,
    file,
    shareUrl,
    isNew: req.query.new === '1',
    formatBytes,
    timeAgo
  });
});

router.get('/download/:code', (req, res) => {
  const file = db.findFileByCode(req.params.code);
  if (!file) return res.status(404).render('404', { title: 'فایل پیدا نشد', description: 'این فایل وجود ندارد.' });
  const filePath = path.join(UPLOAD_DIR, file.storedName);
  if (!fs.existsSync(filePath)) return res.status(410).render('404', { title: 'فایل دیگر در دسترس نیست', description: 'این فایل حذف شده است.' });
  db.incrementDownload(file.code);
  res.download(filePath, file.originalName);
});

module.exports = router;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
