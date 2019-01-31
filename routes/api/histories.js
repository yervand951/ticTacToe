const router = require('express').Router();
const historiesController = require('../../controllers/histories');
const gamesController = require('../../controllers/games');

router.get( '/', gamesController.getGames);
router.get('/:gameId', historiesController.getHistoryByGameId);

module.exports = router;
