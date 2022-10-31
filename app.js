const db = require('./db.js');
const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const Commission = mongoose.model('Commission');
const Message = mongoose.model('Message');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const passport = require('passport');
require('./config/passport')(passport);
const flash = require('connect-flash');
// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true
};

const {ensureAuthenticated} = require('./config/auth');
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
	console.log("Method: " + req.method + "\n" + "Path: " + req.path + "\n" + JSON.stringify(req.query));
	next();
});

app.use('/users', require('./routes/users.js'));

app.get('/', ensureAuthenticated, (req, res) => {
  Commission.find({}, (err, commissions, count) => {
      if (err) {
          console.log(err);
      }
      res.render('index', {commission: commissions, name: req.user.name, ensureAuthenticated:{ensureAuthenticated}});
  });
});

app.get('/commission', ensureAuthenticated, (req, res) => {
  res.render('commission', {ensureAuthenticated:{ensureAuthenticated}});
});

app.post('/commission', (req, res) => {
  const addCommission = new Commission ({
      name: req.user.name, 
      email: req.user.email,
      description: req.body.description,
      url: req.body.url
  });
  addCommission.save((err, addCommission) => {
      if (err){
          console.log(err);
      } 
      if (addCommission) {
        res.redirect('/');
      }
      else {
        req.flash('error_msg', 'Please fill out fields properly');
        res.redirect('/commission');
      }
  });
});

app.get('/portfolio', ensureAuthenticated, (req, res) => {
  Comment.find({}, (err, comments, count) => {
      if (err) {
          console.log(err);
      }
      res.render('portfolio', {comment: comments, ensureAuthenticated:{ensureAuthenticated}});
  });
});

app.post('/portfolio', (req, res) => {
  const addComment = new Comment ({
      name: req.user.name, 
      email: req.user.email,
      date: new Date().toLocaleDateString(),
      comment: req.body.comment 
  });
  addComment.save((err, addComment) => {
      if (err){
          console.log(err);
      } 
      if (!addComment) {
        req.flash('error_msg', 'Please fill out fields properly');
      }
      res.redirect('/portfolio');
  });
});

app.get('/about', ensureAuthenticated, (req, res) => {
  res.render('about', {ensureAuthenticated:{ensureAuthenticated}});
});

app.get('/contact', ensureAuthenticated, (req, res) => {
  res.render('contact', {ensureAuthenticated:{ensureAuthenticated}});
});

app.post('/contact', (req, res) => {
  const addMessage = new Message ({
      name: req.user.name, 
      email: req.user.email,
      subject: req.body.subject,
      message: req.body.message
  });
  addMessage.save((err, addMessage) => {
      if (err){
          console.log(err);
      } 
      if (addMessage) {
        req.flash('success_msg', 'Message sent');
      }
      else {
        req.flash('error_msg', 'Please fill out fields properly');
      }
      res.redirect('/contact');
  });
});

app.listen(process.env.PORT || 3000);


