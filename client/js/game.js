//-------*** Game Objects ***-------//
Entity = function (x, y, width, height, color) {
    let self = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color,
    }

    self.draw = function (ctx) {
        ctx.fillStyle = self.color;
        ctx.fillRect(self.x, self.y, self.width, self.height);
    }

    return self;
}

Car = function (x, y, width, height, color, speed, image, name) {
    let self = Entity(x, y, width, height, color);

    self.speed = speed;
    self.image = image;
    self.name = name;
    self.game;

    let drawY = self.y + 10;

    self.draw = function (ctx) {
        ctx.drawImage(self.image, 0, 0, self.image.width, self.image.height, self.x, drawY, self.width, self.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Roboto";
        ctx.fillText(self.name, self.x + 10, self.y + 5);
    };

    self.moveLeft = function () {
        self.x -= self.speed;
    }

    self.moveRight = function (canvasWidth) {
        if (self.x + self.width + self.speed <= canvasWidth) {
            self.x += self.speed;
        } else {
            self.x = canvasWidth - self.width;
        }
    }

    self.accelerate = function (speedIncrement) {
        self.speed += speedIncrement;
    }

    return self;
}

Road = function (y, width, height, color) {
    let self = Entity(0, y, width, height, color);

    return self;
}

MathQuestionBox = function (x, y, width, height, color) {
    let self = Entity(x, y, width, height, color);

    self.level;
    self.question;
    self.correctAnswer;
    self.options;
    self.topic;

    let super_draw = self.draw;
    self.draw = function (ctx, question, options, response, responseColor) {
        super_draw(ctx);

        ctx.fillStyle = "black";
        ctx.font = "20px Roboto";
        ctx.fillText("Question", self.x + 10, self.y + 20);

        ctx.fillStyle = "black";
        ctx.font = "20px Roboto";
        ctx.fillText(question + " = ?", self.x + 10, self.y + 50);

        ctx.fillStyle = "black";
        ctx.font = "20px Roboto";
        options.forEach((option, index) => {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(self.x + 10, self.y + 60 + 30 * index, self.width - 20, 25);
            ctx.fillText(String.fromCharCode(65 + index) + ". " + option, self.x + 20, self.y + 80 + 30 * index);
        });

        // Draw the response text
        ctx.fillStyle = responseColor;
        ctx.font = "16px Roboto";
        ctx.fillText(response, self.x + 20, self.y + self.height / 1.7);
    }

    return self;
}

// Function to get random image
getRandomImage = function (images) {
    return images[Math.floor(Math.random() * images.length)];
}

//-------*** Game Logic ***-------//
// Function to select game mode
selectType = function (gt) {
    gameType = gt;
    if (gameType === 'SP') {
        display('none', 'block', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none');
    }
    if (gameType === 'MP') {
        display('none', 'none', 'none', 'none', 'none', 'none', 'block', 'none', 'none', 'none');
    }
}

// Function to manipulate display
display = function (a, b, c, d, e, f, g, h, i, j) {
    document.getElementById("menu").style.display = a;
    document.getElementById("difficultyScreen").style.display = b;
    document.getElementById("gameCanvas").style.display = c;
    document.getElementById("option").style.display = d;
    document.getElementById("optionButton").style.display = e;
    document.getElementById("gameStateScreen").style.display = f;
    document.getElementById("signDiv").style.display = g;
    document.getElementById("globalChat").style.display = h;
    document.getElementById("returnLobby").style.display = i;
    document.getElementById("waitingScreen").style.display = j;
}

// Start the game
startGame = function (difficulty) {
    display("none", "none", "block", "none", "block", "none", "none", "none", "none", "none");
    if (gameType === 'SP') {
        Img.car = new Image();
        Img.car.src = "../img/" + getRandomImage(vehicleImage);
        Img.car2 = new Image();
        Img.car2.src = "../img/" + getRandomImage(vehicleImage);

        car.x = 0;
        car.speed = 0.1;
        car2.x = 0;
        car2.speed = 0.1;
        car.image = Img.car;
        car2.image = Img.car2;
        paused = false;
        carMoves = false;
        responseColor = "";
        response = "";
        mathQuestionBox.level = difficulty;

        generateNewQuestion();
        canvas.addEventListener("click", handleMouseClick);

        interval = setInterval(draw, 40);
    }
    if (gameType === 'MP') {
        display("none", "none", "block", "none", "block", "none", "none", "none", "none", "block");
        socket.emit('setLobby');

        mathQuestionBox.level = difficulty;

        generateNewQuestion();
        canvas.addEventListener("click", checkAnswer);

        interval2 = setInterval(function () {
            resizeGame();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!Player.list[selfId]) {
                return;
            }

            let currentLobby = Player.list[selfId].lobby;
            let checkLobby = 0;
            let winningPlayer = null;
            let losingPlayer = null;
            let gameEnded = false;

            for (let i in Player.list) {
                let player = Player.list[i];
                if (player.lobby === currentLobby) {
                    checkLobby++;
                    if (player.x + player.width >= canvas.width) {
                        winningPlayer = player;
                    } else {
                        losingPlayer = player;
                    }
                }
            }

            if (checkLobby == 2) {
                display("none", "none", "block", "none", "block", "none", "none", "none", "none", "none");
                inLobby = true;
                road.draw(ctx);
                road2.draw(ctx);
                for (let i in Player.list) {
                    let player = Player.list[i];
                    if (player.lobby === currentLobby) {
                        Img.player = new Image();
                        Img.player.src = '/client/img/' + player.image;
                        player.draw();
                    }
                }
                mathQuestionBox.draw(ctx, mathQuestionBox.question, mathQuestionBox.options, response, responseColor);
            }

            if (winningPlayer && losingPlayer) {
                gameEnded = true;
                drawGameState("green", "You Win!", winningPlayer.id);
                drawGameState("red", "Game Over!", losingPlayer.id);
            }

            if (inLobby == true && checkLobby == 1) {
                inLobby = false;
                checkLobby = 0;
                gameEnded = true;
                drawGameState("green", "You Win!");
            }

            if (gameEnded) {
                clearInterval(interval2);
            }

            checkLobby = 0;
        }, 60);
    }

}

// Main game loop
draw = function () {
    if (paused) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    road.draw(ctx);
    road2.draw(ctx);
    car.draw(ctx);
    car2.draw(ctx);
    mathQuestionBox.draw(ctx, mathQuestionBox.question, mathQuestionBox.options, response, responseColor);

    if (carMoves)
        car.moveRight(canvas.width);

    car2.moveRight(canvas.width);

    if (car.x + car.width >= canvas.width) {
        clearGame();
        drawGameState("green", "You Win!");
        return;
    }
    if (car2.x + car2.width >= canvas.width) {
        clearGame();
        drawGameState("red", "Game Over!");
        return;
    }
}

// Function to clear canvas
clearGame = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearTimeout(timer1);
    clearTimeout(timer2);
}

// Function to display option
displayOption = function () {
    if (gameType === 'SP') {
        if (!paused) {
            paused = true;
            canvas.removeEventListener("click", handleMouseClick);
            display("none", "none", "none", "block", "none", "none", "none", "none", "none", "none");
        } else {
            paused = false;
            canvas.addEventListener("click", handleMouseClick);
            display("none", "none", "block", "none", "block", "none", "none", "none", "none", "none");
        }
    }
    if (gameType === 'MP') {
        if (!paused) {
            paused = true;
            canvas.removeEventListener("click", handleMouseClick);
            display("none", "none", "none", "block", "none", "none", "none", "none", "block", "none");
        } else {
            paused = false;
            canvas.addEventListener("click", handleMouseClick);
            display("none", "none", "block", "none", "block", "none", "none", "none", "none", "none");
        }
    }

}

// Display the main menu
displayMainMenu = function () {
    if (gameType === 'SP') {
        display("block", "none", "none", "none", "none", "none", "none", "none", "none", "none");
        clearGame();
        canvas.removeEventListener("click", handleMouseClick);
        clearInterval(interval);
    }

    if (gameType === 'MP') {
        display("block", "none", "none", "none", "none", "none", "none", "none", "none", "none");
        canvas.removeEventListener("click", checkAnswer);
        socket.emit('leaveLobby');
    }
}

// Function to display lobby
returnLobby = function () {
    display('none', 'none', 'none', 'none', 'none', 'none', 'none', 'block', 'none', 'none');
    socket.emit('leaveLobby');
}

// Draw response text on the canvas
drawResponse = function (res, color) {
    response = res;
    responseColor = color;
}

// Draw "You Win" or "Game Over" screen
drawGameState = function (color, text, playerId) {
    if (!playerId || Player.list[selfId].id === playerId) {
        display("none", "none", "none", "none", "block", "block", "none", "none", "none");
        document.getElementById("gameStateTitle").innerText = text;
        document.getElementById("gameStateTitle").style.color = color;
    }
}

// Function to check answer
checkAnswer = function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;

    if (response) return;

    const optionHeight = 30;
    const optionY = mathQuestionBox.y + 60;
    const optionIndex = Math.floor((mouseY - optionY) / optionHeight);

    if (optionIndex >= 0 && optionIndex < mathQuestionBox.options.length) {
        const selectedOption = mathQuestionBox.options[optionIndex];

        if (selectedOption === mathQuestionBox.correctAnswer) {
            drawResponse("Correct!", "green");
            socket.emit('mouseClick', { input: 'question', state: true });
            socket.emit('setSpeed', true);
            timer1 = setTimeout(() => {
                response = "";
                responseColor = "";
                generateNewQuestion();
                socket.emit('mouseClick', { input: 'question', state: false });
            }, 2000);
        } else {
            drawResponse("Wrong! The correct answer is: " + mathQuestionBox.correctAnswer, "red");
            socket.emit('setSpeed', false);
            timer1 = setTimeout(() => {
                response = "";
                responseColor = "";
                generateNewQuestion();
            }, 2000);
        }
    }
}

// Handle mouse clicks on the canvas to select options for the math question
handleMouseClick = function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;

    if (response) return;

    const optionHeight = 30;
    const optionY = mathQuestionBox.y + 60;
    const optionIndex = Math.floor((mouseY - optionY) / optionHeight);

    if (optionIndex >= 0 && optionIndex < mathQuestionBox.options.length) {
        const selectedOption = mathQuestionBox.options[optionIndex];

        if (selectedOption === mathQuestionBox.correctAnswer) {
            drawResponse("Correct!", "green");
            carMoves = true;
            timer1 = setTimeout(() => {
                response = "";
                responseColor = "";
                generateNewQuestion();
            }, 2000);
            car2.speed = 0.1;
            car.accelerate(0.3);
            timer2 = setTimeout(stopCar, 3000);
        } else {
            drawResponse("Wrong! The correct answer is: " + mathQuestionBox.correctAnswer, "red");
            timer1 = setTimeout(() => {
                response = "";
                responseColor = "";
                generateNewQuestion();
            }, 2000);
            car.speed = 0.1;
            car2.accelerate(0.3);
        }
    }
}

// Stop car 1 after a certain distance
stopCar = function () {
    carMoves = false;
}

//-------*** Math Logic ***-------//
// Generate a math question with random numbers and operators
generateMathQuestion = function (difficulty) {
    try {
        if (difficulty === 'easy') {
            generateEasyMathQuestion();
        } else if (difficulty === 'medium') {
            generateMediumMathQuestion();
        } else if (difficulty === 'hard') {
            generateHardMathQuestion();
        }
    } catch (error) {
        // Handle any runtime errors gracefully
        console.error("An error occurred in generating math question:", error);
    }
}

// Generate a new question and options for the math question box
generateNewQuestion = function () {
    generateMathQuestion(mathQuestionBox.level);
    generateOptions(mathQuestionBox.correctAnswer, mathQuestionBox.level, mathQuestionBox.topic);
}

// Easy Level
generateEasyMathQuestion = function () {
    const topics = ['+', '-', '*', '/'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let num1, num2, question, answer;

    switch (topic) {
        case '+':
            num1 = Math.floor(Math.random() * 20);
            num2 = Math.floor(Math.random() * 20);
            break;
        case '-':
            num1 = Math.floor(Math.random() * 20);
            num2 = Math.floor(Math.random() * 20);
            break;
        case '*':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            break;
        case '/':
            num2 = Math.floor(Math.random() * 20) + 2;
            num1 = num2 * (Math.floor(Math.random() * 20) + 3);
            break;
    }

    question = `${num1} ${topic} ${num2}`;
    answer = eval(question);

    mathQuestionBox.question = question;
    mathQuestionBox.correctAnswer = answer;
    mathQuestionBox.topic = topic;

    return mathQuestionBox;
}

// Medium Level
generateMediumMathQuestion = function () {
    const topics = ['arithmetic', 'quadratic', 'geometry'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let question, answer;

    switch (topic) {
        case 'arithmetic':
            // Generate arithmetic expression with exponents
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 5) + 1;
            const exponent = Math.floor(Math.random() * 4) + 2;
            const scientific = Math.random() < 0.5;
            const base = scientific ? 10 : num1;
            question = `${base}^${exponent} ${Math.random() < 0.5 ? '*' : '/'} ${num2}^${exponent}`;
            answer = Math.pow(base / num2, exponent);
            break;
        case 'quadratic':
            // Generate quadratic equation
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 10) - 5;
            question = `Solve ${a}x^2 + ${b}x + ${c} = 0`;
            const discriminant = b ** 2 - 4 * a * c;
            if (discriminant > 0) {
                const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                answer = `x = ${root1.toFixed(2)}, ${root2.toFixed(2)}`;
            } else if (discriminant === 0) {
                const root = -b / (2 * a);
                answer = `x = ${root.toFixed(2)}`;
            } else {
                answer = "No real roots";
            }
            break;
        case 'geometry':
            // Generate geometry questions
            const shapes = ['triangle', 'rectangle', 'circle', 'prism'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            switch (shape) {
                case 'triangle':
                    const base = Math.floor(Math.random() * 10) + 1;
                    const height = Math.floor(Math.random() * 10) + 1;
                    question = `Find the area of a triangle with base ${base} units and height ${height} units`;
                    answer = 0.5 * base * height;
                    break;
                case 'rectangle':
                    const length = Math.floor(Math.random() * 10) + 1;
                    const width = Math.floor(Math.random() * 10) + 1;
                    question = `Find the area of a rectangle with length ${length} units and width ${width} units`;
                    answer = length * width;
                    break;
                case 'circle':
                    const radius = Math.floor(Math.random() * 5) + 1;
                    question = `Find the area of a circle with radius ${radius} units`;
                    answer = Math.PI * radius ** 2;
                    break;
                case 'prism':
                    const prismLength = Math.floor(Math.random() * 10) + 1;
                    const prismWidth = Math.floor(Math.random() * 10) + 1;
                    const prismHeight = Math.floor(Math.random() * 10) + 1;
                    question = `Find the volume of a prism with length ${prismLength} units, width ${prismWidth} units, and height ${prismHeight} units`;
                    answer = prismLength * prismWidth * prismHeight;
                    break;
            }
            break;
    }

    mathQuestionBox.question = question;
    mathQuestionBox.correctAnswer = answer;
    mathQuestionBox.topic = topic;

    return mathQuestionBox;
}

// Hard Level
generateHardMathQuestion = function () {
    const topics = ['algebra', 'trigonometry', 'calculus'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let question, answer;

    switch (topic) {
        case 'algebra':
            // Generate algebra questions
            const x = Math.floor(Math.random() * 5) + 1;
            const y = Math.floor(Math.random() * 5) + 1;
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 10) + 1;
            const expressionType = Math.floor(Math.random() * 3);
            switch (expressionType) {
                case 0:
                    question = `Solve ${(a * x + b) / (c * y - b)} = ${x}`;
                    answer = ((a * x + b) / (c * y - b) === x) ? "True" : "False";
                    break;
                case 1:
                    question = `Simplify √(${a * x} + ${b * y})`;
                    answer = Math.sqrt(a * x + b * y);
                    break;
                case 2:
                    question = `Solve log(${a * x}) = ${b * y}`;
                    answer = Math.pow(10, b * y) / a;
                    break;
            }
            break;
        case 'trigonometry':
            // Generate trigonometry questions
            const angles = ['sin', 'cos', 'tan'];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            const value = Math.floor(Math.random() * 90) + 1;
            question = `Find the value of ${angle}(${value}°)`;
            answer = Math[angle](value * (Math.PI / 180));
            break;
        case 'calculus':
            // Generate calculus questions
            const calculusConcepts = ['limits', 'derivatives', 'integrals'];
            const concept = calculusConcepts[Math.floor(Math.random() * calculusConcepts.length)];
            switch (concept) {
                case 'limits':
                    question = `Find the limit of f(x) as x approaches 0`;
                    answer = "Depends on the function f(x)";
                    break;
                case 'derivatives':
                    question = `Find the derivative of f(x) = ${Math.floor(Math.random() * 10)}x^2 + ${Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)}`;
                    answer = `f'(x) = ${2 * Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)}`;
                    break;
                case 'integrals':
                    question = `Find the integral of f(x) = ${Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)} from a to b`;
                    answer = `${Math.floor(Math.random() * 10) / 2}x^2 + ${Math.floor(Math.random() * 10)}x | from a to b`;
                    break;
            }
            break;
    }

    mathQuestionBox.question = question;
    mathQuestionBox.correctAnswer = answer;
    mathQuestionBox.topic = topic;

    return mathQuestionBox;
}

// Generate a wrong answer that is different from the correct answer for easy questions
generateWrongAnswerEasy = function (correctAnswer, topic) {
    let wrongAnswer;

    switch (topic) {
        case '+':
            do {
                wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) + 1;
            } while (wrongAnswer === correctAnswer);
            break;
        case '-':
            do {
                wrongAnswer = correctAnswer - Math.floor(Math.random() * 10) + 1;
            } while (wrongAnswer === correctAnswer);
            break;
        case '*':
            do {
                wrongAnswer = correctAnswer * Math.floor(Math.random() * 5) + 2;
            } while (wrongAnswer === correctAnswer);
            break;
        case '/':
            let divisor;
            do {
                wrongAnswer = correctAnswer * Math.floor(Math.random() * 5) + 2;
            } while (wrongAnswer === correctAnswer);
            break;
        default:
            wrongAnswer = null;
            break;
    }

    return wrongAnswer;
}

// Generate a wrong answer for medium-level math questions
generateWrongAnswerMedium = function (correctAnswer, topic) {
    let wrongAnswer;

    switch (topic) {
        case 'arithmetic':
            const deviation = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviation : correctAnswer - deviation;
            break;
        case 'quadratic':
            const randomOffset = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = correctAnswer + randomOffset;
            break;
        case 'geometry':
            const deviationGeo = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviationGeo : correctAnswer - deviationGeo;
            break;
        default:
            wrongAnswer = null;
            break;
    }

    return wrongAnswer;
}

// Generate a wrong answer for hard-level math questions
generateWrongAnswerHard = function (correctAnswer, topic) {
    let wrongAnswer;

    switch (topic) {
        case 'algebra':
            const deviationAlg = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviationAlg : correctAnswer - deviationAlg;
            break;
        case 'trigonometry':
            const randomAngle = Math.floor(Math.random() * 90) + 1;
            const randomFunction = ['sin', 'cos', 'tan'][Math.floor(Math.random() * 3)];
            wrongAnswer = randomFunction === 'sin' ? Math.sin(randomAngle * (Math.PI / 180)) :
                randomFunction === 'cos' ? Math.cos(randomAngle * (Math.PI / 180)) :
                    Math.tan(randomAngle * (Math.PI / 180));
            break;
        case 'calculus':
            const deviationCalc = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviationCalc : correctAnswer - deviationCalc;
            break;
        default:
            wrongAnswer = null;
            break;
    }

    return wrongAnswer;
}

// Generate options for the math question, including one correct answer and three wrong answers
generateOptions = function (correctAnswer, level, topic) {
    try {
        const options = [correctAnswer];
        const wrongAnswers = new Set();
        let attempts = 0; // Track the number of attempts
        const maxAttempts = 10; // Maximum number of attempts

        while (options.length < 4 && attempts < maxAttempts) {
            let wrongAnswer;
            if (level === 'easy') {
                wrongAnswer = generateWrongAnswerEasy(correctAnswer, topic);
            } else if (level === 'medium') {
                if (correctAnswer === 'No real roots') {
                    options.push('real roots');
                    break;
                }
                wrongAnswer = generateWrongAnswerMedium(correctAnswer, topic);
            } else if (level === 'hard') {
                wrongAnswer = generateWrongAnswerHard(correctAnswer, topic);
            } else {
                console.error('Invalid level specified');
                return;
            }
            if (!wrongAnswers.has(wrongAnswer)) {
                options.push(wrongAnswer);
                wrongAnswers.add(wrongAnswer);
            }
            attempts++; // Increment attempts
        }

        options.sort(() => Math.random() - 0.5);
        mathQuestionBox.options = options;
    } catch (error) {
        // Handle any runtime errors gracefully
        console.error("An error occurred in generating options for math question:", error);
    }
}