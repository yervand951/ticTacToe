const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

router.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname + '../../../public/views/signIn.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname + '../../../public/views/signUp.html'));
});

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res) => {
    const {body: {username, password}} = req;

    if (!username) {
        return res.status(422).json({
            errors: {
                username: 'is required',
            },
        });
    }

    if (!password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const finalUser = new Users({username, password});

    finalUser.setPassword(password);

    return finalUser.save()
        .then(() => res.redirect('/auth/signIn'));
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    // return res.status(200).json({});

    const {body: {user}} = req;

    if (!user.username) {
        return res.status(422).json({
            errors: {
                username: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }


    return passport.authenticate('local', {session: false}, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({user: user.toAuthJSON()});
        }

        return res.status(400).send(info);
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res) => {
    const {payload: {id}} = req;

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            return res.json({user: user.toAuthJSON()});
        });
});

module.exports = router;
