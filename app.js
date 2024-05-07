require('./Player');

let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use('/img', express.static(__dirname + '/img'));

serv.listen(2000);
console.log("Server started.");

let socket_list = {};
let DEBUG = false;

let USERS = {
    //username: password
    "admin": "admin",
}

let isValidPassword = function(data, cb) {
    setTimeout(function() {
        cb(USERS[data.username] === data.password);
    }, 10);
}

let isUsernameTaken = function(data, cb) {
    setTimeout(function() {
        cb(USERS[data.username]);
    }, 10);
}

let addUser = function(data, cb) {
    setTimeout(function() {
        USERS[data.username] = data.password;
        cb();
    }, 10);
}

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
    console.log('A user connected');
    socket.id = Math.random();
    socket_list[socket.id] = socket;

    socket.on('canvasSize', function(data) {
        Player.setCanvasSize(data.width, data.height);
    });

    socket.on('signIn', function(data) {
        isValidPassword(data, function(res) {
            if (res) {
                socket.username = data.username;               
                socket.emit('signInResponse', {success: true});
            } else {
                socket.emit('signInResponse', {success: false});
            }
        });     
    }); 

    socket.on('signUp', function(data) {
        isUsernameTaken(data, function(res) {
            if (res) {
                socket.emit('signUpResponse', {success: false});
            } else {
                addUser(data, function() {
                    socket.emit('signUpResponse', {success: true});
                });            
            }
        });       
    }); 

    socket.on('setLobby', function() {
        Player.onConnect(socket, socket.username);
    });

    socket.on('sendMsgToServer', function(data) {
        for (let i in socket_list) {
            socket_list[i].emit('addToChat', socket.username + ': ' + data);
        }
    });

    socket.on('sendPmToServer', function(data) {
        let recipientSocket = null;

        for (let i in socket_list) {
            if (socket_list[i].username === data.username) {
                recipientSocket = socket_list[i];
            }
        }
        if (recipientSocket === null) {
            socket.emit('addToChat', 'The player ' + data.username + ' is not online.');
        } else {
            recipientSocket.emit('addToChat', 'From ' + socket.username + ':' + data.message);
            socket.emit('addToChat', 'To ' + data.username + ':' + data.message);
        }
    });

    socket.on('disconnect', function() {
        delete socket_list[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('leaveLobby', function() {
        Player.onDisconnect(socket);
    });

    socket.on('evalServer', function(data) {
        if(!DEBUG) {
            return;
        }
        let res = eval(data);
        socket.emit('evalAnswer', res);
    })
});

setInterval(function () {
    let packs = Player.getFrameUpdateData();
    for (let i in socket_list) {
        let socket = socket_list[i];
        socket.emit('init', packs.initPack);
        socket.emit('update', packs.updatePack);
        socket.emit('remove', packs.removePack);
    }
} , 60);