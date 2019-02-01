const Board  = require('./board.js');

class Bot {
  constructor(mark ,size) {
    this.humanPlayer = false;
    this.mark = mark;
    this.humanMark = mark === 'x' ? 'o' : 'x';
    this.size = size;
  }

  choosePosition(game) {
    const bestMove = this.minimax(game.board);

    game.makeMove(bestMove.pos);
    return bestMove;
  }

  minimax(board) {
    let bestMove = { utility: Number.NEGATIVE_INFINITY };
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!board[i][j]) {

          const simulatedBoard = Board.generateSimBoard(
            board,
            [i, j],
            this.mark,
            this.size
          );
          const move = this.minVal(simulatedBoard,0);
          if (move > bestMove.utility) {
            bestMove.utility = move;
            bestMove.pos = [i, j];
          }
        }
      }
    }
    return bestMove;
  }

  minVal(board,int) {

    if (board.gameOver()) {
      if (board.won(this.mark)) {
        return 1;
      } else if (board.tie()) {
        return 0;
      }
      return -1;
    }
    let utility = Number.MAX_VALUE;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!board.board[i][j] && !int ) {
          const simulatedBoard = Board.generateSimBoard(
            board.board,
            [i, j],
            this.humanMark,
            this.size
          );
          const move = this.maxVal(simulatedBoard,int++);
          if (move < utility) {
            utility = move;
          }
        }
      }
    }
    return utility;
  }

  maxVal(board,int) {
    if (board.gameOver()) {
      if (board.won(this.humanMark)) {
        return -1;
      } else if (board.tie()) {
        return 0;
      }
      return 1;
    }
    let utility = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if ( !board.board[i][j] ) {

          const simulatedBoard = Board.generateSimBoard(
            board.board,
            [i, j],
            this.mark,
            this.size
          );
          const move = this.minVal(simulatedBoard,++int);
          if (move > utility) {
            utility = move;
          }
        }
      }
    }
    return utility;
  }
}

module.exports = Bot;