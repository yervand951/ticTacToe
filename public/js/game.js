class Game {
    constructor(roomId) {
        this.roomId = roomId;
        this.board = [];
        this.moves = 0;

    }

    updateBoard(type, row, col, tile) {
        let ell = document.getElementById(tile);
        ell.setAttribute('class', player.getSingClass(type));
        bizi.push(ell);
        this.moves++;
    }

    getRoomId() {
        return this.roomId;
    }

    playTurn(tile) {
        var clickedTile = $(tile).attr('id');
        var turnObj = {
            tile: clickedTile,
            room: this.getRoomId()
        };

        socket.emit('playTurn', turnObj);
    }

    checkWinner() {
        var currentPlayerPositions = player.getMovesPlayed();
        Player.wins.forEach(function (winningPosition) {
            if (winningPosition && currentPlayerPositions == winningPosition) {
                game.announceWinner();
            }
        });

        var tied = this.checkTie();
        if (tied) {
            socket.emit('gameEnded', {room: this.getRoomId(), message: 'Game Tied :('});
            alert('Game Tied :(');
            location.reload();
        }
    }


    announceWinner() {
        var message = player.getPlayerName() + ' wins!';
        socket.emit('gameEnded', {room: this.getRoomId(), message: message});
        alert(message);
        location.reload();
    }
}