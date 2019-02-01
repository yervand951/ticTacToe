const Board = require('./board.js');
const Bot = require('./bot.js');
const UserPlayer = require('./user.js');

class Game {
  constructor(size) {
    this.tttboard = new Board( null, size );
    this.humanPlayer = new UserPlayer( 'x', size );
    this.computerPlayer = new Bot( 'o', size );
    this.currentPlayer = this.humanPlayer;
    this.lastPoss = [];
    this.size = size;
  }

  get board() {
    return this.tttboard.board;
  }

  get humanWon() {
    return this.tttboard.won(this.humanPlayer.mark);
  }

  get computerWon() {
    return this.tttboard.won(this.computerPlayer.mark);
  }

  get gameOver() {
    return this.tttboard.gameOver();
  }

  winner() {
    return this.tttboard.winner(this);
  }

  makeMove(pos) {

    this.tttboard.placeMark(pos, this.currentPlayer);
    if (this.gameOver) {
      return;
    }
    if (this.currentPlayer === this.humanPlayer) {
      
      this.currentPlayer = this.computerPlayer;
      this.lastPoss = this.computerPlayer.choosePosition(this);
      this.currentPlayer = this.humanPlayer;
    }
  }
}

module.exports = Game;