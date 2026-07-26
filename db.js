// دیتابیس ساده مبتنی بر فایل JSON - بدون نیاز به نصب دیتابیس جدا.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA_DIR } = require('./storage');

const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ files: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { files: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function genCode(len = 8) {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[crypto.randomInt(0, chars.length)];
  return out;
}

// ---------- Files ----------
function getFiles() {
  return readDb().files;
}
function findFileByCode(code) {
  return readDb().files.find((f) => f.code === code) || null;
}
function createFile({ originalName, storedName, size, mimeType }) {
  const db = readDb();
  let code;
  do {
    code = genCode(8);
  } while (db.files.some((f) => f.code === code));
  const file = {
    id: crypto.randomBytes(12).toString('hex'),
    code,
    originalName,
    storedName,
    size,
    mimeType: mimeType || 'application/octet-stream',
    downloads: 0,
    createdAt: new Date().toISOString()
  };
  db.files.push(file);
  writeDb(db);
  return file;
}
function incrementDownload(code) {
  const db = readDb();
  const f = db.files.find((x) => x.code === code);
  if (f) {
    f.downloads = (f.downloads || 0) + 1;
    writeDb(db);
  }
}
function deleteFile(code) {
  const db = readDb();
  db.files = db.files.filter((f) => f.code !== code);
  writeDb(db);
}
function getStats() {
  const db = readDb();
  return {
    totalFiles: db.files.length,
    totalDownloads: db.files.reduce((s, f) => s + (f.downloads || 0), 0),
    totalStorageBytes: db.files.reduce((s, f) => s + (f.size || 0), 0)
  };
}

module.exports = {
  getFiles,
  findFileByCode,
  createFile,
  incrementDownload,
  deleteFile,
  getStats
};
