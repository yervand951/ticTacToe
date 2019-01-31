const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');

/**
 * @getHistories
 * The are we will check and auth users
 * @param done
 * @return Promise
 */
passport.use(new LocalStrategy({
    usernameField: 'user[username]',
    passwordField: 'user[password]'
}, (username, password, done) => {
    Users.findOne({username}).then((user) => {
        if (!user) {
            return done(null, false, {errors: {username: 'is invalid'}});
        } else if (!user.validatePassword(password)) {
            return done(null, false, {errors: {password: 'is invalid'}});
        }
        return done(null, user);
    }).catch(done);
}));
