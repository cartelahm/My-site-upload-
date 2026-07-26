const express = require('express');
const db = require('./db');

const router = express.Router();

router.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const files = db.getFiles();
  const staticUrls = [{ loc: `${base}/`, priority: '1.0' }];
  const fileUrls = files.map((f) => ({ loc: `${base}/f/${f.code}`, priority: '0.5', lastmod: f.createdAt.slice(0, 10) }));
  const urls = [...staticUrls, ...fileUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

router.get('/robots.txt', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  // عمداً هیچ مسیری disallow نمی‌شود چون مسیر پنل مدیریت مخفی است
  // و نباید در یک فایل عمومی مثل robots.txt لو برود.
  res.type('text/plain').send(`User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`);
});

module.exports = router;
