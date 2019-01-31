const socket = io.connect('http://localhost:8000', {
    query: {token: localStorage.getItem('token')}
});

socket.on('error', (err) => {
    if (err === 'Authentication error') {
        window.location.replace("/auth/signin");
    }
});


function createNewGame(ell) {

    socket.emit('createGame', {
        size: ell.size.value,
        sign: ell.sign.value,
        type: ell.type.value,//single
    });

    player = new Player(name, ell.sign.value);

    return false;
}


const sendLoc = (data) => {
    socket.emit('sendLoc', data);
};

socket.on('turnPlayed', function (data) {
    let row = data.row;
    let col = data.col;
    let opponentType = player.getPlayerType() == P1 ? P2 : P1;
    game.updateBoard(opponentType, row, col, `button_${row}${col}`);
    player.setCurrentTurn(true);
});

socket.on('newGame', (data) => {
    let content = document.getElementById('pendingCont');
    let size = data.size;

    let div = document.createElement("div");
    let p = document.createElement("p");
    let button = document.createElement("button");

    content.appendChild(div);
    div.appendChild(p);
    div.appendChild(button);

    p.innerHTML = `The ${data.name} started game ${data.size}`;
    p.setAttribute('class', data.room);

    button.setAttribute('value', data.room);
    button.setAttribute('size', data.size);
    button.addEventListener('click', function () {
        socket.emit('JoinGame', {
            room: this.value,
            size: size,
            gameId: data.gameId,
            name: localStorage.getItem('username')
        });
    });
    player = new Player(name, data.sign);
})

socket.on('player2', function (data) {

    game = new Game(data.room);
    gameGenerate(data.size);
    player.setCurrentTurn(false);

});

socket.on('player1', function () {
    player.setCurrentTurn(true);
});

socket.on('louse_game', () => {
    alert('You louse game');
});


socket.on('win_game', () => {
    alert('You win game');
});

socket.on('draw_game', () => {
    alert('draw game');
});

socket.on('gameCreated', (data) => {
    game = new Game(data.room);
    gameGenerate(data.size);
});

const gameGenerate = (size) => {

    while (gameContent.firstChild) {
        gameContent.removeChild(gameContent.firstChild);
    }

    for (let i = 0; i < size; i++) {
        let tr = document.createElement("tr");
        gameContent.appendChild(tr);
        for (let j = 0; j < size; j++) {
            let td = document.createElement("td");
            let id = `button_${i}${j}`;
            td.id = id;
            tr.appendChild(td);
            td.addEventListener('click', function () {
                if (checkPosition(this) && player.getCurrentTurn()) {
                    player.setCurrentTurn(false);
                    bizi.push(this);
                    this.setAttribute('class', player.getSingClass());
                    sendLoc({row: i, col: j, id: id, room: game.roomId});
                }
            });
        }
    }

}