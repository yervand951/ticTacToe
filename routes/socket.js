const jwt = require('jsonwebtoken');
const gamesController = require('../controllers/games');
const historiesController = require('../controllers/histories');
const Game = require('../helpers/game');

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
        let bot = {};
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
                game = new Game(data.size);
                BOARD_SIZE = +data.size;
                sign = data.sign;
                gameId = gameModel._id;
                stateOfTheGame = new Array(BOARD_SIZE * 2 + 2);

                stateOfTheGame.fill(0);
                socket.join('room_' + ++roomsCount);

                if (data.type === 'single') {
                    type = 'single';
                    bot = new Bot(
                        data.sign === 'X' ? '0' : 'X',
                        +data.size
                    );

                    

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

        socket.on( 'sendLoc', (data) => {
            console.log('qqqqqq');
            console.log(game.makeMove([ data.row, data.col ]));
            // socket.emit('win_game', data);
            console.log(game);
            socket.emit('turnPlayed', { row: game.lastPoss.pos[0], col: game.lastPoss.pos[1] });
        });

        socket.on('sendLoc1', (data) => {
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

                        bot.gamerTurn(data.row, data.col);
                        let turn = bot.turn();
                        if (turn.col === -1) {
                            socket.emit('draw_game', data);
                            socket.broadcast.emit('draw_game', data);

                            BOARD_SIZE = 0;
                            stateOfTheGame = [];
                            bot = {};
                        }
                        socket.emit('turnPlayed', turn);
                        historiesController.createHistory({
                            row: +turn.row,
                            column: +turn.col,
                            bot: true,
                            gameId: gameId,
                            date: Date.now()
                        });

                        if (isWon(turn.row, turn.col, turn.sign)) {
                            gamesController.updateGame(gameId, {
                                end: Date.now(),
                                win: 'bot'
                            });

                            socket.emit('louse_game', data);

                            BOARD_SIZE = 0;
                            stateOfTheGame = [];
                            bot = {};
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
                    let bot = {};

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

        class Bot {
            constructor(sign, size) {
                this.sign = sign;
                this.size = size;
                this.stateOfWin = this.createState(size).fill(0);
                this.stateOfLouse = this.createState(size).fill(0);
            }

            createState(size) {
                return new Array(size * 2);
            }

            setPoint(row, column) {
                let point = 1;

                this.stateOfWin[row] += point;
                this.stateOfWin[row] += -point;

                stateOfTheGame[BOARD_SIZE + column] += point
            }

            bigger(arr) {

                return arr.reduce((max, val) => {
                    max = (max === undefined || val >= max) ? val : max;
                    return max;
                }, []);
            }

            gamerTurn(value, index) {

                this.stateOfLouse[value] += 1;
                delete this.stateOfWin[index];

                if (Number.isInteger(this.stateOfLouse[this.size + value])) {

                    this.stateOfLouse[this.size + value] += 1;
                    delete this.stateOfWin[this.size + value];
                }

                if (value === index) {

                    if (Number.isInteger(this.stateOfLouse[2 * this.size])) {

                        this.stateOfLouse[2 * this.size] += 1;
                        delete this.stateOfWin[2 * this.size];
                    }

                    if ((this.size + 1) / 2 === value && Number.isInteger(this.stateOfLouse[2 * this.size + 1])) {
                        this.stateOfLouse[2 * this.size + 1] += 1;
                        delete this.stateOfWin[2 * this.size + 1];

                    }
                }

                if (index + value === this.size + 1 && Number.isInteger(this.stateOfLouse[2 * this.size + 1])) {
                    this.stateOfLouse[2 * this.size + 1] += 1;
                    delete this.stateOfWin[2 * this.size + 1];
                }
            }

              minimax(board) {
                let bestMove = { utility: Number.NEGATIVE_INFINITY };
                for (let i = 0; i < this.size; i++) {
                  for (let j = 0; j < this.size; j++) {
                    if (!board[i][j]) {
                      const simulatedBoard = Board.generateSimBoard(
                        board,
                        [i, j],
                        this.mark
                      );
                      const move = this.minVal(simulatedBoard);
                      if (move > bestMove.utility) {
                        bestMove.utility = move;
                        bestMove.pos = [i, j];
                      }
                    }
                  }
                }
                return bestMove;
            }

            turn() {

                let value = this.bigger(this.stateOfWin);
                let index = this.stateOfWin.indexOf(value);

                if (index >= this.size) {

                    let value1 = value;
                    value = index - this.size;
                    index = value1;

                }

                this.stateConvert(value, index);

                if (index >= this.size) {
                    let value1 = value;
                    value = index - this.size;
                    index = value1;
                }

                return {
                    col: index,
                    row: value,
                    sign: this.sign
                }

            }

            stateConvert(value, index) {

                if (Number.isInteger(this.stateOfWin[index])) {

                    this.stateOfWin[index] += 1;
                    delete this.stateOfLouse[index];
                }

                if (Number.isInteger(this.stateOfWin[this.size + value])) {

                    this.stateOfWin[this.size + value] += 1;
                    delete this.stateOfLouse[this.size + value];
                }

                if (value === index && Number.isInteger(this.stateOfWin[2 * this.size])) {

                    this.stateOfWin[2 * this.size] += 1;
                    delete this.stateOfLouse[2 * this.size];

                    if ((this.size + 1) / 2 === value && Number.isInteger(this.stateOfWin[2 * this.size + 1])) {

                        this.stateOfWin[2 * this.size + 1] += 1;
                        delete this.stateOfLouse[2 * this.size + 1];

                    }
                }

                if (index + value === this.size + 1 && Number.isInteger(this.stateOfWin[2 * this.size + 1])) {

                    this.stateOfWin[2 * this.size + 1] += 1;
                    delete this.stateOfLouse[2 * this.size + 1];
                }
            }
        }

    });
};

