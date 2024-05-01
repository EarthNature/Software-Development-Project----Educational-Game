let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/test.html');
});

app.use('/client', express.static(__dirname + '/client'));



serv.listen(2000);
console.log("Server started.");

let SOCKET_LIST = {};
let PLAYER_LIST = {};
let playerCount = 0;
let lobbyCount = 1;
let canvas_width;
let canvas_height;

Player = function (y, id, role, lobby) {
    let self = {
        x: 0,
        y: y,
        id: id,
        role: role,
        name: "",
        lobby: lobby
    }
    return self;
}

let io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    let y, role, lobby;

    if (playerCount % 2 === 0) {
        lobbyCount++;
        console.log("playerCount: " + playerCount);
        console.log("lobbyCount: " + lobbyCount);
    }
    lobby = lobbyCount;

    if (playerCount % 2 === 0) {
        y = canvas_height / 4 - 30;
        role = 'Player 1';
    } else if (playerCount % 2 === 1) {
        y = canvas_height / 4 + 40;
        role = 'Player 2';
    }
        
    let player = Player(y, socket.id, role, lobby);
    PLAYER_LIST[socket.id] = player;
    playerCount++;
    console.log("playerCount: " + playerCount);
    console.log("lobbyCount: " + lobbyCount);

    socket.on('canvasSize', function(size) {
        canvas_width = size.width;
        canvas_height = size.height;
    });

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        playerCount--;
        console.log("playerCount: " + playerCount);
        console.log("lobbyCount: " + lobbyCount);
        if (playerCount % 2 === 0) {
            lobbyCount--;
            console.log("playerCount: " + playerCount);
            console.log("lobbyCount: " + lobbyCount);
        }
    })
});

sendMathQuestion = function () {
    let question = generateMathQuestion();
    io.sockets.emit('mathQuestion', question);
}

generateMathQuestion = function () {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
    let question = num1 + ' ' + operator + ' ' + num2;
    let answer = eval(question);
    return { question: question, answer: answer };
}

setInterval(function () {
    let lobbyPacks = {};
    for (let i in PLAYER_LIST) {
        let player = PLAYER_LIST[i];
        //player.x++;
        if (!lobbyPacks[player.lobby]) {
            lobbyPacks[player.lobby] = [];
        }
        lobbyPacks[player.lobby].push({
            x: player.x,
            y: player.y,
            role: player.role,
            name: player.name
        });
    }

    for (let i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i];
        let player = PLAYER_LIST[socket.id];
        if (lobbyPacks[player.lobby]) {
            socket.emit('newPositions', lobbyPacks[player.lobby]);
        }
    }
}, 60);

sendMathQuestion();