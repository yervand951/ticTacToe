const Board = require('./board.js');
const Bot = require('./bot.js');
const UserPlayer = require('./user.js');

class Game {
  constructor(size) {
    this.nativeBoard = new Board( null, size );
    this.userPlayer = new UserPlayer( 'x', size );
    this.computerPlayer = new Bot( 'o', size );
    this.currentPlayer = this.userPlayer;
    this.lastPoss = [];
    this.size = size;
  }

  get board() {
    return this.nativeBoard.board;
  }

  get humanWon() {
    return this.nativeBoard.won(this.userPlayer.mark);
  }

  get computerWon() {
    return this.nativeBoard.won(this.computerPlayer.mark);
  }

  get gameOver() {
    return this.nativeBoard.gameOver();
  }

  winner() {
    return this.nativeBoard.winner(this);
  }

  makeMove(pos) {

    this.nativeBoard.placeMark(pos, this.currentPlayer);
    if (this.gameOver) {
      return;
    }
    if (this.currentPlayer === this.userPlayer) {
      
      this.currentPlayer = this.computerPlayer;
      this.lastPoss = this.computerPlayer.choosePosition(this);
      this.currentPlayer = this.userPlayer;
    }
  }
}

module.exports = Game;