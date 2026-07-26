function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 بایت';
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  const intervals = [
    { label: 'سال', secs: 31536000 },
    { label: 'ماه', secs: 2592000 },
    { label: 'روز', secs: 86400 },
    { label: 'ساعت', secs: 3600 },
    { label: 'دقیقه', secs: 60 }
  ];
  for (const it of intervals) {
    const count = Math.floor(seconds / it.secs);
    if (count >= 1) return `${count} ${it.label} پیش`;
  }
  return 'همین الان';
}

function safeFileName(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '-');
}

module.exports = { formatBytes, timeAgo, safeFileName };
