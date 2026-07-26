const crypto = require('crypto');

// حفاظت پنل مدیریت: بدون سیستم کاربری، فقط یک رمز عبور تنها که در Variables
// ریلوی ست می‌شود. نشست (session) فقط برای نگه‌داشتن وضعیت لاگین ادمین است.

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // مقایسه‌ی طول‌ثابت حتی وقتی طول‌ها فرق دارند، برای جلوگیری از حمله‌ی زمان‌سنجی
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkAdminPassword(input) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real) return false;
  return safeCompare(input || '', real);
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect(req.baseUrl + '/login');
}

// پیام‌های فلش ساده (بدون وابستگی connect-flash)
function flash(req, type, message) {
  if (!req.session.flashMessages) req.session.flashMessages = { success: [], error: [] };
  req.session.flashMessages[type].push(message);
}

function consumeFlash(req) {
  const messages = req.session.flashMessages || { success: [], error: [] };
  req.session.flashMessages = { success: [], error: [] };
  return messages;
}

module.exports = { checkAdminPassword, ensureAdmin, flash, consumeFlash };
