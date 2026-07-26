require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const { consumeFlash } = require('./admin-auth');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PATH = '/' + (process.env.ADMIN_PATH || 'panel-x9k2');

app.set('view engine', 'ejs');
app.set('views', __dirname);
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/main.js', (req, res) => res.sendFile(path.join(__dirname, 'main.js')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'insecure-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

app.use((req, res, next) => {
  res.locals.siteName = process.env.SITE_NAME || 'آپلودیو';
  const messages = consumeFlash(req);
  res.locals.successMsg = messages.success;
  res.locals.errorMsg = messages.error;
  next();
});

app.use('/', require('./routes-seo'));
app.use('/', require('./routes-files'));
app.use(ADMIN_PATH, require('./routes-admin'));

app.use((req, res) => {
  res.status(404).render('404', { title: 'صفحه پیدا نشد', description: 'صفحه مورد نظر پیدا نشد.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('404', { title: 'خطای سرور', description: 'خطایی رخ داد.' });
});

app.listen(PORT, () => {
  console.log(`سرور روی پورت ${PORT} در حال اجراست`);
});
