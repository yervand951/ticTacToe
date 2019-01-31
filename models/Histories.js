const mongoose = require('mongoose');

const {Schema} = mongoose;

const HistoriesSchema = new Schema({
    row: Number,
    column: Number,
    gameId: String,
    bot: {type: Boolean, default: false},
    date: Date
});

module.exports = mongoose.model('Histories', HistoriesSchema);
