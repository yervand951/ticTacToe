const games = require('../models/Games');

/**
 * @createGame
 * Thes function will insert game to the mongo
 * @param data
 * @return promise
 */
const createGame = (data) => {
    return games.create(data);
};

/**
 * @updateGame
 * Thes function will update a game object
 * @param id
 * @param data
 * @return promise
 */
const updateGame = (id, data) => {

    return games.findByIdAndUpdate(id, {$set: data}, {new: true}, function (err, game) {
        if (err) return handleError(err);

        return game;
    });
};

/**
 * @getGame
 * Thes function will find and return One game object by id
 * @param req
 * @param res
 * @return data
 */
const getGame = (req, res) => {
    games.findOne({_id: req.params.gameId}).then((data) => {
        res.json(data);

    }).catch((err) => {
        console.log(err);
    });
};

/**
 * @getGames
 * Thes function will find and return Many games objects by search and sort params
 * @param req
 * @param res
 * @return data
 */
const getGames = (req, res) => {
    let query = {};
    if (req.query.search) {
        query = {$text: {$search: req.query.search}}
    }
    console.log(req.query.sort);
    games.find(query, {}, {sort: req.query.sort, skip: req.query.skip, limit: 10}).then((data) => {
        res.json(data);
    })
};


module.exports = {
    createGame: createGame,
    updateGame: updateGame,
    getGame: getGame,
    getGames: getGames
};
