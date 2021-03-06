const jwt = require('jsonwebtoken');
const gamesController = require('../controllers/games');
const historiesController = require('../controllers/histories');
const Game = require('../classes/game');

module.exports = (server) => {
    const io = require('socket.io')(server);

    let roomsCount = 0;

    io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, 'secret', (err, decoded) => {
                if (err) {
                    socket.emit('authentication_error');
                    return next(new Error('Authentication error'));
                }
                socket.decoded = decoded;

                next();
            });
        } else {
            socket.emit('authentication_error');
            next(new Error('Authentication error'));
        }
    }).on('connection', (socket) => {
        let BOARD_SIZE = 0;
        let stateOfTheGame = [];
        let sign = "0";
        let gameId = 0;
        let type = 'multi';
        let count = 0;
        let game = {};

        socket.on('createGame', (data) => {
            gamesController.createGame({
                type: data.type,
                size: +data.size,
                gamer1: {
                    id: socket.decoded.id,
                    username: socket.decoded.username
                }
            }).then((gameModel) => {
                
                BOARD_SIZE = +data.size;
                sign = data.sign;
                gameId = gameModel._id;
                stateOfTheGame = new Array(BOARD_SIZE * 2 + 2);

                stateOfTheGame.fill(0);
                socket.join('room_' + ++roomsCount);

                if (data.type === 'single') {
                    type = 'single';
                    game = new Game(data.size);

                    

                    socket.emit('gameCreated', {
                        name: data.name,
                        size: data.size,
                        gameId: data._id,
                        room: 'room_' + roomsCount
                    });
                } else {
                    type = 'multi';
                    socket.emit('gameCreated', {
                        name: data.name,
                        size: data.size,
                        gameId: data._id,
                        room: 'room_' + roomsCount
                    });

                    socket.broadcast.emit('newGame', {
                        name: data.name,
                        size: data.size,
                        gameId: gameModel._id,
                        sign: (data.sign === 'X') ? '0' : 'X',
                        room: 'room_' + roomsCount
                    });
                }
            })
        });

        socket.on('JoinGame', (data) => {
            gameId = data.gameId;
            let room = io.nsps['/'].adapter.rooms[data.room];
            if (room && room.length === 1) {
                gamesController.updateGame(data.gameId, {
                    gamer2: {
                        id: socket.decoded.id,
                        username: socket.decoded.username
                    }
                }).then((game, err) => {
                    socket.join(data.room);
                    socket.broadcast.to(data.room).emit('player1', {});
                    socket.emit('player2', {name: data.name, size: data.size, room: data.room})

                })

            } else {
                socket.emit('err', {message: 'Sorry, The room is full!'});
            }

            BOARD_SIZE = +data.size;
            stateOfTheGame = new Array(BOARD_SIZE * 2 + 2);

            stateOfTheGame.fill(0);
        });

        socket.on('gameEnded', function (data) {
            socket.broadcast.to(data.room).emit('gameEnd', data);
        });

        socket.on('sendLoc', (data) => {
            if (BOARD_SIZE !== 0) {

                if (isWon(data.row, data.col, sign)) {
                    gamesController.updateGame(gameId, {
                        end: Date.now(),
                        win: socket.decoded.id
                    });

                    socket.broadcast.to(data.room).emit('louse_game', data);
                    socket.emit('win_game', data);
                    socket.broadcast.to(data.room).emit('turnPlayed', data);

                    BOARD_SIZE = 0;
                    stateOfTheGame = [];

                } else {

                    historiesController.createHistory({
                        row: +data.row,
                        column: +data.col,
                        bot: false,
                        gameId: gameId,
                        date: Date.now()
                    });

                    if (type === 'single') {

                        game.makeMove([ data.row, data.col ]);

                        socket.emit('turnPlayed', { row: game.lastPoss.pos[0], col: game.lastPoss.pos[1] });

                        historiesController.createHistory({
                            row: game.lastPoss.pos[0],
                            column: game.lastPoss.pos[1],
                            bot: true,
                            gameId: gameId,
                            date: Date.now()
                        });

                        if (isWon(game.lastPoss.pos[0], game.lastPoss.pos[1], game.computerPlayer.mark)) {
                            gamesController.updateGame(gameId, {
                                end: Date.now(),
                                win: 'bot'
                            });

                            socket.emit('louse_game', data);

                            BOARD_SIZE = 0;
                            stateOfTheGame = [];

                        }
                    } else {

                        socket.broadcast.to(data.room).emit('turnPlayed', data);
                    }
                }
                if (++count === ( BOARD_SIZE * 2 ) - 1) {

                    socket.emit('draw_game', data);
                    socket.broadcast.emit('draw_game', data);

                    BOARD_SIZE = 0;
                    stateOfTheGame = [];
                    count = 0;

                }
            }
        });

        function isWon(row, column, player) {
            let point = (player === sign) ? -1 : 1;

            stateOfTheGame[row] += point;
            stateOfTheGame[BOARD_SIZE + column] += point;

            if (row === column) {
                stateOfTheGame[2 * BOARD_SIZE] += point;

                let shouldUpdateDia2 = (BOARD_SIZE + 1) / 2 === column;
                if (shouldUpdateDia2) {
                    stateOfTheGame[2 * BOARD_SIZE + 1] += point
                }
            }

            if (row + column === BOARD_SIZE + 1) {
                stateOfTheGame[2 * BOARD_SIZE + 1] += point;
            }

            let i = stateOfTheGame.indexOf(BOARD_SIZE);
            let j = stateOfTheGame.indexOf(-BOARD_SIZE);

            return (i >= 0 || j >= 0);
        }
    });
};

