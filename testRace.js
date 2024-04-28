// Variables and functions declared outside any function scope
let canvas;
let ctx;
let car;
let car2;
let road;
let road2;
let mathQuestionBox;
let animationId;
let paused;
let carMoves;
let timer1;
let timer2;
let responseColor;
let response;
let level;
let question;
let options;
let topic;

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

    draw(ctx, question, options, response, responseColor) {
        super.draw(ctx);

        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(question, this.x + 10, this.y + 20);

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        options.forEach((option, index) => {
            // Draw options in black border boxes
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 10, this.y + 40 + 20 * index, this.width - 20, 20);
            ctx.fillText(String.fromCharCode(65 + index) + ". " + option, this.x + 20, this.y + 55 + 20 * index);
        });

        // Draw the response text
        ctx.fillStyle = responseColor;
        ctx.font = "16px Arial";
        ctx.fillText(response, this.x + 20, this.y + this.height / 2);
    }
}

// Functions
// Handle mouse clicks on the canvas to select options for the math question
function handleMouseClick(event) {
    // Get mouse coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // If a response has been given, disable clicking on options
    if (response) return;

    // Check if the click occurred within the bounds of the options in the math question box
    const optionHeight = 20; // Height of each option box
    const optionY = mathQuestionBox.y + 40; // Y-coordinate of the first option box
    const optionIndex = Math.floor((mouseY - optionY) / optionHeight); // Calculate the index of the clicked option

    // Check if the clicked option is valid
    if (optionIndex >= 0 && optionIndex < options.length) {
        // Get the selected option
        const selectedOption = options[optionIndex];

        // Check if the selected option is the correct answer
        if (selectedOption === correctAnswer) {
            drawResponse("Correct!", "green");
            carMoves = true;
            timer1 = setTimeout(() => {
                response = ""; // Clear the response after 3 seconds
                // Generate initial question and options
                generateNewQuestion(); // Generate a new question after clearing the response
            }, 3000); // Adjust timeout as needed

            // Accelerate car 1
            car.accelerate(0.3); // Adjust the speed increment as needed

            // Start the timer for stopping car 1
            timer2 = setTimeout(stopCar, 3000); // Adjust the time as needed
        } else {
            drawResponse("Wrong! The correct answer is: " + correctAnswer, "red");
            timer1 = setTimeout(() => {
                response = ""; // Clear the response after 3 seconds            
                generateNewQuestion(); // Generate a new question after clearing the response
            }, 3000); // Adjust timeout as needed
        }
    }
}

// Draw response text on the canvas
function drawResponse(res, color) {
    response = res;
    responseColor = color;
}

// Stop car 1 after a certain distance
function stopCar() {
    // Stop car 1 by setting carMoves to false
    carMoves = false;
}

// Pause the game
function pauseGame() {
    if (!paused) {
        cancelAnimationFrame(animationId); // Pause the animation
        paused = true;

        // Remove mouse click listener for math questions
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

        // Add back mouse click listener for math questions
        canvas.addEventListener("click", handleMouseClick);

        // Display the game canvas
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
    mathQuestionBox.draw(ctx, question, options, response, responseColor);

    if (carMoves) {
        car.moveRight(canvas.width);
    }

    // Move car 2 automatically
    car2.moveRight(canvas.width);

    // Check if car 1 has reached the end first
    if (car.x + car.width >= canvas.width) {
        // Display "You Win" screen
        drawWinScreen();
        return;
    }

    // Check if car 2 has reached the end first
    if (car2.x + car2.width >= canvas.width) {
        // Display "Game Over" screen
        drawGameOverScreen();
        return;
    }

    // Request animation frame
    animationId = requestAnimationFrame(draw);
}

// Draw "You Win" screen
function drawWinScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "green";
    ctx.font = "40px Arial";
    ctx.fillText("You Win!", canvas.width / 2 - 80, canvas.height / 2);

    clearTimeout(timer1);
    clearTimeout(timer2);
}

// Draw "Game Over" screen
function drawGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);

    clearTimeout(timer1);
    clearTimeout(timer2);
}

// Start the game
function startGame(difficulty) {
    // Display the difficulty options
    document.getElementById("difficultyScreen").style.display = "none";

    // Display the game canvas and option button
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("optionButton").style.display = "block";

    // Get canvas and context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // Set canvas dimensions to fit the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize game objects
    car = new Car(0, canvas.height / 4 - 30, 50, 30, "blue", 2);
    car2 = new Car(0, canvas.height / 4 + 40, 50, 30, "red", 0.5);
    road = new Road(canvas.height / 4, canvas.width, 5, "gray");
    road2 = new Road(canvas.height / 4 + 70, canvas.width, 5, "gray");
    mathQuestionBox = new MathQuestionBox(canvas.width - canvas.width / 1.05, canvas.height / 4 + 150, canvas.width / 1.1, canvas.height / 2, "lightgray");

    // Initialize game state variables
    paused = false;
    carMoves = false;
    responseColor = "";
    response = "";
    level = difficulty;

    // Generate initial question and options
    ({ question, correctAnswer, topic } = generateMathQuestion(level));
    options = generateOptions(correctAnswer, level, topic);

    // Add event listener for mouse clicks on canvas
    canvas.addEventListener("click", handleMouseClick);

    // Start the game loop
    draw();
}

// Display the main menu
function mainMenu() {
    // Stop the game
    cancelAnimationFrame(animationId);
    clearTimeout(timer1);
    clearTimeout(timer2);

    // Hide the game canvas and options
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("option").style.display = "none";

    // Display the main menu
    document.getElementById("menu").style.display = "block";
}

// Display the difficulty options
function showDifficultyOptions() {
    // Hide the menu
    document.getElementById("menu").style.display = "none";

    // Display the difficulty options
    document.getElementById("difficultyScreen").style.display = "block";
}