require('dotenv').config();
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const generalController = require('./controllers/general');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
  uri: process.env.DB_DETAIL,
  collection: 'sessions'
})
const csrfProtection = csrf();


app.set('view engine', 'ejs');
app.set('views', 'views');

const atecRoutes = require('./routes/atec');
const weeklynoteRoutes = require('./routes/weeklynote');
const laporanRoutes = require('./routes/laporan');
const drugMultivitaminRoutes = require('./routes/drug-multivitamin');
const authRoutes = require('./routes/auth');
const generalRoutes = require('./routes/general');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(
  {
    secret: 'my long string secret',
    resave: false,
    saveUninitialized: false,
    store: store
  }
));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));   
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use(atecRoutes);
app.use(weeklynoteRoutes);
app.use(laporanRoutes);
app.use(drugMultivitaminRoutes);
app.use(authRoutes);
app.use(generalRoutes);

app.use(generalController.get404);

mongoose
  .connect(
    process.env.DB_DETAIL, {
      useNewUrlParser: true,
      useUnifiedTopology: true 
  })
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
