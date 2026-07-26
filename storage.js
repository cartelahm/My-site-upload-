// همه‌ی داده‌های پایدار (دیتابیس JSON + فایل‌های آپلودی) زیر یک پوشه‌ی
// واحد قرار می‌گیرند تا فقط لازم باشد یک Volume در Railway مونت شود.
//
// روی Railway: یک Volume با Mount Path دقیقاً "/app/storage" بساز.
// اگر می‌خوای مسیر دیگری استفاده کنی، متغیر محیطی STORAGE_DIR را ست کن
// و همان مقدار را به‌عنوان Mount Path در Railway بگذار.
//
// اگر پوشه (هنوز) قابل‌نوشتن نباشد (مثلاً درست attach نشده)، به‌جای کرش
// کردن کل برنامه، یک هشدار در لاگ چاپ می‌کنیم و به یک پوشه‌ی موقت داخل
// پروژه سوییچ می‌کنیم تا سایت حداقل بالا بیاید (بدون پایداری کامل داده).

const fs = require('fs');
const path = require('path');

function resolveWritableDir(preferred, fallback) {
  try {
    fs.mkdirSync(preferred, { recursive: true });
    fs.accessSync(preferred, fs.constants.W_OK);
    return preferred;
  } catch (err) {
    console.warn(
      `[storage] نتونستم از مسیر "${preferred}" استفاده کنم (${err.code || err.message}). ` +
        `موقتاً از "${fallback}" استفاده می‌کنم — یعنی Volume درست attach نشده. ` +
        `تو Railway چک کن Mount Path دقیقاً همون STORAGE_DIR باشه.`
    );
    try {
      fs.mkdirSync(fallback, { recursive: true });
    } catch (e) {
      // اگر حتی fallback هم نشد، دیگه واقعا مشکل دیسک/پرمیشنه؛
      // اجازه می‌دیم برنامه بالا بیاد و خطا موقع نوشتن واقعی فایل نشون داده بشه
      console.error('[storage] fallback هم شکست خورد:', e.message);
    }
    return fallback;
  }
}

const BASE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(__dirname, 'storage');

const RESOLVED_BASE = resolveWritableDir(BASE_DIR, path.join(__dirname, '.local-storage'));

const DATA_DIR = path.join(RESOLVED_BASE, 'data');
const UPLOAD_DIR = path.join(RESOLVED_BASE, 'uploads');

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  console.error('[storage] ساخت زیرپوشه‌های data/uploads شکست خورد:', err.message);
}

module.exports = { DATA_DIR, UPLOAD_DIR };
