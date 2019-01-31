class Player {
    constructor(name = '', sign) {
        this.sign = sign;
        this.name = name;
        this.currentTurn = true;
        this.movesPlayed = 0;
    }

    getSingClass(sign = this.sign) {
        if (sign === 'X') {

            return 'xSing';
        }

        return 'zeroSing'
    }

    updateMovesPlayed(tileValue) {
        this.movesPlayed += tileValue;
    }

    getMovesPlayed() {
        return this.movesPlayed;
    }

    setCurrentTurn(turn) {
        this.currentTurn = turn;
        if (turn) {
            document.getElementById('turn').innerHTML = 'Your turn.';
        } else {
            document.getElementById('turn').innerHTML = 'Waiting for Opponent';
        }
    }

    getPlayerName() {
        return this.name;
    }

    getPlayerType() {
        return this.sign;
    }

    getCurrentTurn() {
        return this.currentTurn;
    }
}