class Board {
  static generateSimBoard( board, pos, mark, size ) {
    const newBoard = Board.generateNewBoard( size );
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        newBoard[i][j] = board[i][j];
      }
    }
    newBoard[pos[0]][pos[1]] = mark;
    const simBoard = new Board(newBoard,size);
    return simBoard;
  }

  static generateNewBoard( size ) {
    let arr = []
    for( let i = 0; i < size; i++ ) {
      arr.push([]);
      for( let j = 0; j < size; j++) {
        arr[i].push('');
      }
    }

    return arr;
  }

  constructor(board,size) {
    this.board = board ||
    Board.generateNewBoard( size );
    this.size = size;
    this.stateOfTheGame = new Array(this.size * 2 + 2);
    this.stateOfTheGame.fill(0);
  }

  placeMark(pos, player) {

    this.board[pos[0]][pos[1]] = player.mark;
  }

  isEmpty() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  winner(game) {
    if (this.isWin(game.humanPlayer.mark)) {
      return game.humanPlayer;
    }
    return game.computerPlayer;
  }

  won(mark) {
    if (!this.isEmpty() && this.isWin(mark)) {
      return true;
    }
    return false;
  }

  tie() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!this.board[i][j]) {
          return false;
        }
      }
    }
    if (!(this.won('x') || this.won('o'))) {
      return true;
    }
  }

  gameOver() {
    if (this.won('x') || this.won('o') || this.tie()) {
      return true;
    }
    return false;
  }

  verticalWin(mark) {
    if ((mark === this.board[0][0] && this.board[0][0] === this.board[0][1] && this.board[0][0] === this.board[0][2]) ||
      (mark === this.board[1][0] && this.board[1][0] === this.board[1][1] && this.board[1][0] === this.board[1][2]) ||
      (mark === this.board[2][0] && this.board[2][0] === this.board[2][1] && this.board[2][0] === this.board[2][2])) {
      return true;
    }
    return false;
  }

  isWin( mark ) {
    let verticalWin = 0;
    let horizontalWin = 0;
    let diagonalWin = 0;
    let diagonalWin2 = 0;
    for( let i = 0; i < this.size; i++) {
      
      for( let j = 0; j < this.size; j++) {
        if( mark === this.board[i][j] ) verticalWin++

        if( mark === this.board[j][i] ) horizontalWin++

        if( mark === this.board[i][i] ) diagonalWin++

        if( ( i + j ) === (this.size -1) && mark === this.board[i][j] ) 
          diagonalWin2++

        if( verticalWin === this.size || horizontalWin === this.size || diagonalWin === this.size || diagonalWin2 === this.size ) {
          return true;
        }

      }
    }
    return false;
  }

  horizontalWin(mark) {
    if ((mark === this.board[0][0] && this.board[0][0] === this.board[1][0] && this.board[0][0] === this.board[2][0]) ||
      (mark === this.board[0][1] && this.board[0][1] === this.board[1][1] && this.board[0][1] === this.board[2][1]) ||
      (mark === this.board[0][2] && this.board[0][2] === this.board[1][2] && this.board[0][2] === this.board[2][2])) {
      return true;
    }
    return false;
  }

  diagonalWin(mark) {
    if ((mark === this.board[0][0] && this.board[0][0] === this.board[1][1] && this.board[0][0] === this.board[2][2]) ||
      (mark === this.board[0][2] && this.board[0][2] === this.board[1][1] && this.board[0][2] === this.board[2][0])) {
      return true;
    }
    return false;
  }
}

module.exports = Board;