const exp = require('constants');
let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/server/game.js');
});
app.use('/client', express.static(__dirname + '/client'));
app.use('/server', express.static(__dirname + '/server'));
app.use('/img', express.static(__dirname + '/img'));

serv.listen(2000);
console.log("Server started.");

let SOCKET_LIST = {};
let PLAYER_LIST = {};
let playerCount = 0;
let lobbyCount = 0;
let canvas_width;
let canvas_height;
let canvasReceived;

Player = function (y, id, role, lobby, img, speed) {
    let self = {
        x: 0,
        y: y,
        width: 50,
        height: 30,
        id: id,
        role: role,
        name: "",
        lobby: lobby,
        img: img,
        speed: speed
    }
    self.moveRight = function (canvasWidth) {
        if (self.x + self.width + self.speed <= canvasWidth) {
            self.x += self.speed;
        } else {
            self.x = canvasWidth - self.width;
        }
    }
    return self;
}

getRandomImage = function (images) {
    return "../img/" + images[Math.floor(Math.random() * images.length)];
}

playerMoveRight = function (state) {
    if (state) {
        player.moveRight(canvas_width);
    }
}

let vehicleImage = ["bluecar.png", "bubblecar.png", "turbo.png", "van.png", "vintage.png"];

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) { // Client connection

    let randomImage = getRandomImage(vehicleImage);
    console.log("Random Image: ", randomImage);

    socket.on('canvasSize', function (data) {
        canvas_width = data.width;
        canvas_height = data.height;
        console.log("canvas received");
        if (canvas_width && canvas_height) {
            canvasReceived = true;
        }
    })

    if (canvasReceived) {
        console.log("start generate data");
        socket.id = Math.random();
        SOCKET_LIST[socket.id] = socket;
        let y, role, lobby, img, speed;
        speed = 0.1;
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

        socket.emit('question');
        img = getRandomImage(vehicleImage);

        let player = Player(y, socket.id, role, lobby, img, speed);
        console.log(player);
        PLAYER_LIST[socket.id] = player;
        playerCount++;
        console.log("playerCount: " + playerCount);
        console.log("lobbyCount: " + lobbyCount);

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

        
    }

    if (playerCount > 0) {
        console.log('setInterval running');
        setInterval(function () {
            let lobbyPacks = {};
            for (let i in PLAYER_LIST) {
                let player = PLAYER_LIST[i];
                //player.x++;
                socket.on('response', function () {
                    console.log('moving');
                    player.moveRight(canvas_width);
                });
                if (!lobbyPacks[player.lobby]) {
                    lobbyPacks[player.lobby] = [];
                }
                lobbyPacks[player.lobby].push({
                    x: player.x,
                    y: player.y,
                    width: player.width,
                    height: player.height,
                    role: player.role,
                    name: player.name,
                    img: player.img
                });
            }
        
            for (let i in SOCKET_LIST) {
                let socket = SOCKET_LIST[i];
                let player = PLAYER_LIST[socket.id];
                if (lobbyPacks[player.lobby]) {
                    socket.emit('update', lobbyPacks[player.lobby]);
                }
            }
        }, 60);
    }

});