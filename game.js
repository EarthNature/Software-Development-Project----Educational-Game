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

Car = function (x, y, width, height, color, speed) {
    let self = Entity(x, y, width, height, color);

    self.speed = speed;

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
        ctx.font = "16px Arial";
        ctx.fillText(question, self.x + 10, self.y + 20);

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        options.forEach((option, index) => {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(self.x + 10, self.y + 40 + 20 * index, self.width - 20, 20);
            ctx.fillText(String.fromCharCode(65 + index) + ". " + option, self.x + 20, self.y + 55 + 20 * index);
        });

        // Draw the response text
        ctx.fillStyle = responseColor;
        ctx.font = "16px Arial";
        ctx.fillText(response, self.x + 20, self.y + self.height / 2);
    }

    return self;
}

//-------*** Game Logic ***-------//
// Display the difficulty options
showDifficultyOptions = function () {
    document.getElementById("menu").style.display = "none";
    document.getElementById("difficultyScreen").style.display = "block";
}

// Display the game canvas
displayGame = function () {
    document.getElementById("difficultyScreen").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("optionButton").style.display = "block";
}

// Display options screen
showOptions = function (gc, op, opB) {
    document.getElementById("gameCanvas").style.display = gc;
    document.getElementById("option").style.display = op;
    document.getElementById("optionButton").style.display = opB;
}

// Display the main menu
displayMainMenu = function () {
    cancelAnimationFrame(animationId);
    clearTimeout(timer1);
    clearTimeout(timer2);

    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("option").style.display = "none";
    document.getElementById("menu").style.display = "block";
    canvas.removeEventListener("click", handleMouseClick);
}

// Start the game
startGame = function (difficulty) {
    canvas.removeEventListener("click", handleMouseClick);
    displayGame();

    car.x = 0;
    car.speed = 0.1;
    car2.x = 0;
    paused = false;
    carMoves = false;
    responseColor = "";
    response = "";

    mathQuestionBox.level = difficulty;

    generateMathQuestion(mathQuestionBox.level);
    generateOptions(mathQuestionBox.correctAnswer, mathQuestionBox.level, mathQuestionBox.topic);
    canvas.addEventListener("click", handleMouseClick);

    draw();
    return mathQuestionBox;
}

// Pause the game
pauseGame = function () {
    if (!paused) {
        cancelAnimationFrame(animationId);
        paused = true;

        canvas.removeEventListener("click", handleMouseClick);
        showOptions("none", "block", "none");
    } else {
        animationId = requestAnimationFrame(draw);
        paused = false;

        canvas.addEventListener("click", handleMouseClick);
        showOptions("block", "none", "block");
    }
}

// Main game loop
draw = function () {
    try {
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
            drawGameState("green", "You Win!");
            return;
        }
        if (car2.x + car2.width >= canvas.width) {
            drawGameState("red", "Game Over!");
            return;
        }
        animationId = requestAnimationFrame(draw);
    } catch (error) {
        console.error("An error occurred in the game loop:", error);
    }
}

// Draw response text on the canvas
drawResponse = function (res, color) {
    response = res;
    responseColor = color;
}

// Draw "You Win" or "Game Over" screen
drawGameState = function (color, text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = "40px Arial";
    ctx.fillText(text, canvas.width / 2 - 80, canvas.height / 2);

    clearTimeout(timer1);
    clearTimeout(timer2);
}

// Handle mouse clicks on the canvas to select options for the math question
handleMouseClick = function (event) {
    try {
        const rect = canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;

        if (response) return;

        const optionHeight = 20;
        const optionY = mathQuestionBox.y + 40;
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
                }, 3000);

                car.accelerate(0.3);
                timer2 = setTimeout(stopCar, 3000);
            } else {
                drawResponse("Wrong! The correct answer is: " + mathQuestionBox.correctAnswer, "red");
                timer1 = setTimeout(() => {
                    response = "";
                    responseColor = "";
                    generateNewQuestion();
                }, 3000);
            }
        }
    } catch (error) {
        console.error("An error occurred in handling mouse click:", error);
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
generateEasyMathQuestion = function() {
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
generateWrongAnswerEasy = function(correctAnswer, topic) {
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
