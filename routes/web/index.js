const express = require('express');
const router = express.Router();

const main = require('./main');
const auth = require('./auth');
const game = require('./game');

router.use('/auth', auth);
router.use('/game', game);
router.use('/', main);

module.exports = router;
