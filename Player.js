let playerCount = 0;
let lobbyCount = 0;
let initPack = {player: []};
let removePack = {player: []};
let canvasWidth, canvasHeight;
let vehicleImage = ["bluecar.png", "bubblecar.png", "turbo.png", "van.png", "vintage.png"]

getRandomImage = function (images) {
    return images[Math.floor(Math.random() * images.length)];
}

Player = function(param) {
    let self = {
        id: param.id,
        socket: param.socket,
        x: param.x,
        y: canvasHeight / 4 - param.y,
        width: 50,
        height: 30,
        username: param.username,
        role: param.role,
        question: false,
        maxSpd: param.maxSpd,
        lobby: param.lobby,
        image: param.image,
    }

    self.update = function(canvasWidth) {
        if(self.question && (self.x + self.width <= canvasWidth)) {
            self.x += self.maxSpd;
        }
    }

    self.getInitPack = function() {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            width: self.width,
            height: self.height,
            username: self.username,
            role: self.role,
            lobby: self.lobby,
            image: self.image,
        };
    }
    
    self.getUpdatePack = function() {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            width: self.width,
            height: self.height,
            username: self.username,
            role: self.role,
            lobby: self.lobby,
            image: self.image,
        };
    }
    Player.list[self.id] = self;

    initPack.player.push(self.getInitPack());
    return self;
    
}
Player.list = {};

Player.getFrameUpdateData = function() {
    let pack = {
        initPack: {
            player: initPack.player,
        },
        removePack: {
            player: removePack.player,
        },
        updatePack: {
            player: Player.update(),
        }
    };

    initPack.player = [];
    removePack.player = [];
    return pack;
}

Player.setCanvasSize = function(width, height) {
    canvasWidth = width;
    canvasHeight = height;
}

Player.onConnect = function(socket, username) {
    // Declare variable to be added to player
    let y, role;

    if (playerCount % 2 === 0) {
        lobbyCount++;
        console.log("Player Count: " + playerCount);
        console.log("Lobby Count: " + lobbyCount);
    }

    lobby = lobbyCount;

    if (playerCount % 2 === 0) {
        y = 30;
        role = 'Player 1';
    } else if (playerCount % 2 === 1) {
        y = -40;
        role = 'Player 2';
    }
    // Add variable here
    let player = Player({
        id: socket.id,
        socket: socket,
        x: 0,
        y: y,
        username: username,
        role: role,
        maxSpd: 0.1,
        lobby: lobby,
        image: getRandomImage(vehicleImage),
    });
    playerCount++;
    console.log('Player Count: ' + playerCount);
    console.log("Lobby Count: " + lobbyCount);

    socket.on('mouseClick', function(data) {
        if(data.input === 'question') {
            player.question = data.state;
        }
    });

    socket.on('setSpeed', function(data) {
        if(data) {
            player.maxSpd += 0.5; 
        } else {
            player.maxSpd = 0.1;
        }
    })

    socket.emit('init', {
        selfId: socket.id,
        player: Player.getAllInitPack(),
    });
}

Player.getAllInitPack = function() {
    let players = [];
    for (let i in Player.list) {
        players.push(Player.list[i].getInitPack());
        return players;
    }
}

Player.onDisconnect = function(socket) {
    let player = Player.list[socket.id];
    if (!player) {
        return;
    }
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
    if (playerCount > 0 && playerCount !== 0) {
        playerCount--;
    }
    console.log('Player Count: ' + playerCount);
    console.log("Lobby Count: " + lobbyCount);
    if (playerCount % 2 === 0 && lobbyCount !== 0) {
        lobbyCount--;
        console.log("playerCount: " + playerCount);
        console.log("lobbyCount: " + lobbyCount);
    }
}

Player.update = function() {
    let pack = [];
    for (let i in Player.list) {
        let player = Player.list[i];
        player.update(canvasWidth);
        pack.push(player.getUpdatePack());  
    }
    return pack;
}