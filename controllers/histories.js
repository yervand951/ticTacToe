const histories = require('../models/Histories');

/**
 * @createHistory
 * Thes function will create the histori game
 * @param data
 * @return Promise
 */
const createHistory = (data) => {
    return histories.create(data);
};

/**
 * @updateHistory
 * Thes function will update the histori game
 * @param id
 * @param data
 * @return Promise
 */
const updateHistory = (id, data) => {

    return histories.findByIdAndUpdate(id, {$set: data}, {new: true}, function (err, history) {
        if (err) return handleError(err);

        return history;
    });
};

/**
 * @getHistoryByGameId
 * Thes function will find history by game id
 * @param req
 * @param res
 * @return data
 */
const getHistoryByGameId = (req, res) => {
    histories.find({gameId: req.params.gameId}).then((data) => {
        res.json(data);
    }).catch((err) => {
        console.log(err);
    });
};

/**
 * @getHistory
 * Thes function will find One history by  id
 * @param id
 * @return Promise
 */
const getHistory = (id) => {

    return histories.findOne(id);
};

/**
 * @getHistories
 * Thes function will find All historiesl
 // * @param
 * @return Promise
 */
const getHistories = () => {
    return histories.find({});
};

module.exports = {
    createHistory: createHistory,
    updateHistory: updateHistory,
    getHistory: getHistory,
    getHistories: getHistories,
    getHistoryByGameId: getHistoryByGameId
};
