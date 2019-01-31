const router = require('express').Router();
const controller = require('../../controllers/games');

router.get('/', controller.getGames);

router.get('/single/:gameId', controller.getGame);

module.exports = router;
