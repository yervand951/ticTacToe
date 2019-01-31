const mongoose = require('mongoose');

const {Schema} = mongoose;

const GamesSchema = new Schema({
    type: String,
    gamer1: {
        username: String
    },
    gamer2: {
        username: String
    },
    result: String,
    size: Number,
    win: String,
    start: {type: Date, default: Date.now},
    end: Date,
});

GamesSchema.index({name: 'text', 'gamer1.username': 'text'});

module.exports = mongoose.model('Games', GamesSchema);
