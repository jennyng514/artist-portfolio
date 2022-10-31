const express = require('express');
const router = express.Router();
const db = require('../db.js');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [
        {msg: 'Please enter all fields'},
        {msg: 'Passwords do not match'},
        {msg: 'Password must be at least 6 characters'}
    ];
    if (name && email && password && password2) {
        errors = errors.filter((error) => {
            return error.msg != 'Please enter all fields';
        });
    }
    if (password == password2) {
        errors = errors.filter((error) => {
            return error.msg != 'Passwords do not match';
        });
    }
    if (password.length >= 6) {
        errors = errors.filter((error) => {
            return error.msg != 'Password must be at least 6 characters';
        });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else {
        User.findOne({ email: email }).then(user => {
            if (user) {
              errors.push({ msg: 'Email already exists' });
              res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
              });
            }
            else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                      if (err) throw err;
                      newUser.password = hash;
                      newUser
                        .save()
                        .then(user => {
                        req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                        );
                          res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                    });
                });
                console.log(newUser);              
            }
        });     
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;