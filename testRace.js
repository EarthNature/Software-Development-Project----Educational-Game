// Classes
class Drawable {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Car extends Drawable {
    constructor(x, y, width, height, color, speed) {
        super(x, y, width, height, color);
        this.speed = speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    moveRight(canvasWidth) {
        if (this.x + this.width + this.speed <= canvasWidth) {
            this.x += this.speed;
        } else {
            this.x = canvasWidth - this.width;
        }
    }

    accelerate(speedIncrement) {
        this.speed += speedIncrement;
    }
}

class Road extends Drawable {
    constructor(y, width, height, color) {
        super(0, y, width, height, color);
    }
}

class MathQuestionBox extends Drawable {
    constructor(x, y, width, height, color) {
        super(x, y, width, height, color);
    }

    draw(ctx, question, options, response, resColor) {
        super.draw(ctx);

        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(question, this.x + 10, this.y + 20);

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        options.forEach((option, index) => {
            ctx.fillText(String.fromCharCode(65 + index) + ". " + option, this.x + 10, this.y + 40 + 20 * index);
        });

        // Draw the response text
        ctx.fillStyle = resColor;
        ctx.font = "16px Arial";
        ctx.fillText(response, this.x + 20, this.y + this.height / 2);
    }
}

// Functions
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathQuestion() {
    const num1 = generateRandomNumber(1, 100);
    const num2 = generateRandomNumber(1, 10);
    const operators = ['+', '-', '*', '/'];
    const operator = operators[generateRandomNumber(0, operators.length - 1)];

    let question, correctAnswer;

    switch (operator) {
        case '+':
            question = `${num1} + ${num2} = ?`;
            correctAnswer = num1 + num2;
            break;
        case '-':
            question = `${num1} - ${num2} = ?`;
            correctAnswer = num1 - num2;
            break;
        case '*':
            question = `${num1} * ${num2} = ?`;
            correctAnswer = num1 * num2;
            break;
        case '/':
            question = `${num1 * num2} / ${num2} = ?`;
            correctAnswer = num1;
            break;
    }

    return { question, correctAnswer };
}

function generateWrongAnswer(correctAnswer) {
    let wrongAnswer;
    do {
        const deviation = generateRandomNumber(1, 10);
        wrongAnswer = correctAnswer + (Math.random() < 0.5 ? -deviation : deviation);
    } while (wrongAnswer === correctAnswer);
    return wrongAnswer;
}

function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    while (options.length < 4) {
        const wrongAnswer = generateWrongAnswer(correctAnswer);
        options.push(wrongAnswer);
    }
    return options.sort(() => Math.random() - 0.5);
}

// Function to generate a new question and options
function generateNewQuestion() {
    // Generate question
    ({ question, correctAnswer } = generateMathQuestion());
    options = generateOptions(correctAnswer);

    // Update the math question box with the new question and options
    mathQuestionBox.draw(ctx, question, options, "", "");
}

// Function to handle mouse clicks
function handleMouseClick(event) {
    // Get mouse coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // If a response has been given, disable clicking on options
    if (response) return;

    // Check if the click occurred within the bounds of the options in the math question box
    const optionHeight = 20; // Height of each option text
    const optionY = mathQuestionBox.y + 20; // Y-coordinate of the first option text
    const optionIndex = Math.floor((mouseY - optionY) / optionHeight); // Calculate the index of the clicked option

    // Check if the clicked option is valid
    if (optionIndex >= 0 && optionIndex < options.length) {
        // Get the selected option
        const selectedOption = options[optionIndex];

        // Check if the selected option is the correct answer
        if (selectedOption === correctAnswer) {
            drawResponse("Correct!", "green");
            carMoves = true;
            setTimeout(() => {
                response = ""; // Clear the response after 3 seconds
                mathQuestionBox.draw(ctx, question, options, "", ""); // Clear the response from the MathQuestionBox
                generateNewQuestion(); // Generate a new question after clearing the response
            }, 2000);

            // Accelerate car 1
            car.accelerate(0.3); // Adjust the speed increment as needed

            // Start the timer for stopping car 1
            setTimeout(stopCar, 3000); // Adjust the time as needed
        } else {
            drawResponse("Wrong! The correct answer is: " + correctAnswer, "red");
            setTimeout(() => {
                response = ""; // Clear the response after 3 seconds
                mathQuestionBox.draw(ctx, question, options, "", ""); // Clear the response from the MathQuestionBox
                generateNewQuestion(); // Generate a new question after clearing the response
            }, 2000);
        }
    }
}

// Function to draw response on the canvas
function drawResponse(res, color) {
    response = res;
    resColor = color;
}

// Function to stop car 1 after a certain distance
function stopCar() {
    // Stop car 1 by setting to false
    carMoves = false;
}

function pauseGame() {
    if (!paused) {
        cancelAnimationFrame(animationId); // Pause the animation
        paused = true;

        // Remove mouse click for math questions
        canvas.removeEventListener("click", handleMouseClick);

        // Hide the game canvas
        document.getElementById("gameCanvas").style.display = "none";

        // Display options
        document.getElementById("option").style.display = "block";

        // Hide the option button
        document.getElementById("optionButton").style.display = "none";
        
    } else {
        animationId = requestAnimationFrame(draw); // Resume the animation
        paused = false;
        
        // Add back mouse click for math questions
        canvas.addEventListener("click", handleMouseClick);

        // Hide the game canvas
        document.getElementById("gameCanvas").style.display = "block";

        // Hide options
        document.getElementById("option").style.display = "none";

        // Display the option button
        document.getElementById("optionButton").style.display = "block";
    }
}

// Main game loop
function draw() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw road
    road.draw(ctx);
    road2.draw(ctx);

    // Draw cars
    car.draw(ctx);
    car2.draw(ctx);

    // Draw math question box
    mathQuestionBox.draw(ctx, question, options, response, resColor);

    if (carMoves) {
        car.moveRight(canvas.width);
    }

    // Move car 2 automatically
    car2.moveRight(canvas.width);

    // Request animation frame
    animationId = requestAnimationFrame(draw);

}

function startGame() {
    // Hide the menu
    document.getElementById("menu").style.display = "none";

    // Display the canvas and start the game
    document.getElementById("gameCanvas").style.display = "block";

    // Display the option button
    document.getElementById("optionButton").style.display = "block";

    // Start the game loop
    draw();
}

function mainMenu() {
    // Stop the game
    cancelAnimationFrame(animationId);

    // Hide the game screen
    document.getElementById("gameCanvas").style.display = "none";

    // Hide the options screen
    document.getElementById("option").style.display = "none";

    // Display main menu
    document.getElementById("menu").style.display = "block";
}

// Get canvas element and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions to fit the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const car = new Car(0, canvas.height / 4 - 30, 50, 30, "blue", 2);
const car2 = new Car(0, canvas.height / 4 + 40, 50, 30, "red", 0.5);

const road = new Road(canvas.height / 4, canvas.width, 5, "gray");
const road2 = new Road(canvas.height / 4 + 70, canvas.width, 5, "gray");

const mathQuestionBox = new MathQuestionBox(canvas.width - canvas.width / 1.05, canvas.height / 4 + 150, canvas.width / 1.1, canvas.height / 2, "lightgray");

// Generate initial question
let { question, correctAnswer } = generateMathQuestion();
let options = generateOptions(correctAnswer);

let resColor = "";
let response = "";

let animationId;
let paused = false;

let carMoves = false;

// Add event listener for math questions
canvas.addEventListener("click", handleMouseClick);