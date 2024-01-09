// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await User.findUserByEmail(email);

    if (!user) {
      return done(null, false, { errorMessage: 'No user with that email' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      return done(null, user);
    } else {
      return done(null, false, { errorMessage: 'Password incorrect' });
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
