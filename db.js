const mongoose = require('mongoose');

// user
// * site requires authentication for artist user
// * user has a username and password to access artist user privileges
const User = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  date: {type: Date, default: Date.now}
});

// a comment
// * comments can be left by any visitors to the site
const Comment = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  date: {type: String, required: true},
  comment: {type: String, required: true}
});

// a commission
// * comments can be made by any visitors to the site
const Commission = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  description: {type: String, required: true},
  url: {type: String, required: true}
});

// a message
// * comments can be left by any visitors to the site
const Message = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  subject: {type: String, required: true},
  message: {type: String, required: true}
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below
mongoose.model('User', User);
mongoose.model('Comment', Comment);
mongoose.model('Commission', Commission);
mongoose.model('Message', Message);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
  // if we're in PRODUCTION mode, then read the configration from a file
  // use blocking file io to do this...
  const fs = require('fs');
  const path = require('path');
  const fn = path.join(__dirname, 'config.json');
  const data = fs.readFileSync(fn);

  // our configuration file will be in json, so parse it and set the
  // conenction string appropriately!
  const conf = JSON.parse(data);
  dbconf = conf.dbconf;
} 
else {
  // if we're not in PRODUCTION mode, then use
  dbconf = 'mongodb://localhost/jn1826';
}

mongoose.connect(dbconf);

