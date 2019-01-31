const express = require('express');
const router = express.Router();

const users = require('./users');
const games = require('./games');
const histories = require('./histories');

router.use('/users', users);
router.use('/game', games);
router.use('/history', histories);

module.exports = router;
