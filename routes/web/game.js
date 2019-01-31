const path = require( 'path' );
const router = require('express').Router();
const auth = require('../auth');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '../../../public/views/games.html'));
});

router.get('/:id', (req, res) => {
    res.sendFile(path.join(__dirname + '../../../public/views/single.html'));
});

module.exports = router;
