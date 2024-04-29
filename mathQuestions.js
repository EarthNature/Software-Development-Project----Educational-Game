// Generate a math question with random numbers and operators
function generateMathQuestion(difficulty) {
    let questionData;
    if (difficulty === 'easy') {
        questionData = generateEasyMathQuestion();
    } else if (difficulty === 'medium') {
        questionData = generateMediumMathQuestion();
    } else if (difficulty === 'hard') {
        questionData = generateHardMathQuestion();
    }

    return {
        question: questionData.question,
        correctAnswer: questionData.answer,
        topic: questionData.topic
    };
}

// Easy Level (Grade 9)
function generateEasyMathQuestion() {
    const topics = ['+', '-', '*', '/'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let question, answer;

    if (topic === '+' || topic === '-' || topic === '*' || topic === '/') {
        // Basic arithmetic operations
        let num1, num2;
        if (topic === '/') {
            // Ensure no division by zero and that the result is an integer
            num2 = Math.floor(Math.random() * 10) + 1; // divisor
            num1 = num2 * (Math.floor(Math.random() * 10) + 1); // dividend
        } else {
            num1 = Math.floor(Math.random() * 20);
            num2 = Math.floor(Math.random() * 20);
        }
        question = `${num1} ${topic} ${num2}`;
        answer = topic === '+' ? num1 + num2 :
            topic === '-' ? num1 - num2 :
            topic === '*' ? num1 * num2 :
            num1 / num2;
    } else if (topic === 'linear') {
        // Solving linear equations (e.g., ax + b = c)
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 20) - 10; // Ensure solution is within reasonable range
        const x = (c - b) / a;
        question = `${a}x + ${b} = ${c}, find x`;
        answer = x;
    } else if (topic === 'factor') {
        // Basic factoring (e.g., factoring linear expressions)
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        question = `Factor: ${a}x + ${b}`;
        answer = `x(${a}) + ${b / a}`;
    } else if (topic === 'simplify') {
        // Simplifying expressions (e.g., combining like terms)
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) + 1;
        question = `Simplify: ${a}x + ${b}x + ${c}`;
        answer = `${a + b}x + ${c}`;
    }

    return { question, answer, topic };
}

// Generate a wrong answer that is different from the correct answer for easy questions
function generateWrongAnswerEasy(correctAnswer, topic) {
    let wrongAnswer;

    if (topic === '+' || topic === '-') {
        // For addition and subtraction, generate a wrong answer by adding or subtracting a random number
        do {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) + 1;
        } while (wrongAnswer === correctAnswer);
    } else if (topic === '*') {
        // For multiplication, generate a wrong answer by multiplying the correct answer by a random number
        do {
            wrongAnswer = correctAnswer * (Math.floor(Math.random() * 5) + 2); // Random multiplier between 2 and 6
        } while (wrongAnswer === correctAnswer);
    } else if (topic === '/') {
        // For division, generate a wrong answer by dividing the correct answer by a random number
        let divisor;
        do {
            divisor = Math.floor(Math.random() * 5) + 2; // Random divisor between 2 and 6
            wrongAnswer = Math.round(correctAnswer / divisor); // Round the division result to the nearest integer
        } while (wrongAnswer === correctAnswer);
    } else if (topic === 'linear') {
        // For linear equations, generate a wrong answer by adding or subtracting a random number
        do {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) + 1;
        } while (wrongAnswer === correctAnswer);
    } else if (topic === 'factor') {
        // For factoring, generate a wrong answer by swapping coefficients or adding a random number
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        wrongAnswer = `x(${b}) + ${a / b}`;
    } else if (topic === 'simplify') {
        // For simplifying expressions, generate a wrong answer by adding or subtracting a random number
        do {
            wrongAnswer = `${correctAnswer + Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)}`;
        } while (wrongAnswer === correctAnswer);
    }

    return wrongAnswer;
}

// Medium Level (Grade 10)
function generateMediumMathQuestion() {
    const topics = ['arithmetic', 'quadratic', 'geometry'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let question, answer;

    if (topic === 'arithmetic') {
        // Operations involving exponents, roots, and scientific notation
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 5);
        const exponent = Math.floor(Math.random() * 4) + 2; // Random exponent between 2 and 5
        const scientific = Math.random() < 0.5; // Determine whether to use scientific notation
        if (scientific) {
            question = `${num1} * 10^${exponent} ${Math.random() < 0.5 ? '*' : '/'} ${num2} * 10^${exponent}`;
            answer = num1 / num2;
        } else {
            question = `${num1}^${exponent} ${Math.random() < 0.5 ? '*' : '/'} ${num2}^${exponent}`;
            answer = Math.pow(num1 / num2, exponent);
        }
    } else if (topic === 'quadratic') {
        // Solving quadratic equations
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) - 5; // To allow for roots with both positive and negative values
        const discriminant = b ** 2 - 4 * a * c;

        if (discriminant > 0) {
            const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            question = `Solve ${a}x^2 + ${b}x + ${c} = 0`;
            answer = `x = ${root1.toFixed(2)}, ${root2.toFixed(2)}`;
        } else if (discriminant === 0) {
            const root = -b / (2 * a);
            question = `Solve ${a}x^2 + ${b}x + ${c} = 0`;
            answer = `x = ${root.toFixed(2)}`;
        } else {
            question = `Solve ${a}x^2 + ${b}x + ${c} = 0`;
            answer = "No real roots";
        }
    } else if (topic === 'geometry') {
        // Area, perimeter, and volume calculations for basic geometric shapes
        const shapes = ['triangle', 'rectangle', 'circle', 'prism'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        if (shape === 'triangle') {
            const base = Math.floor(Math.random() * 10) + 1;
            const height = Math.floor(Math.random() * 10) + 1;
            question = `Find the area of a triangle with base ${base} units and height ${height} units`;
            answer = 0.5 * base * height;
        } else if (shape === 'rectangle') {
            const length = Math.floor(Math.random() * 10) + 1;
            const width = Math.floor(Math.random() * 10) + 1;
            question = `Find the area of a rectangle with length ${length} units and width ${width} units`;
            answer = length * width;
        } else if (shape === 'circle') {
            const radius = Math.floor(Math.random() * 5) + 1;
            question = `Find the area of a circle with radius ${radius} units`;
            answer = Math.PI * radius ** 2;
        } else if (shape === 'prism') {
            const length = Math.floor(Math.random() * 10) + 1;
            const width = Math.floor(Math.random() * 10) + 1;
            const height = Math.floor(Math.random() * 10) + 1;
            question = `Find the volume of a prism with length ${length} units, width ${width} units, and height ${height} units`;
            answer = length * width * height;
        }
    }

    return { question, answer, topic };
}

// Generate a wrong answer for medium-level math questions
function generateWrongAnswerMedium(correctAnswer, topic) {
    let wrongAnswer;

    // Based on the topic, generate a wrong answer that differs from the correct answer
    switch (topic) {
        case 'arithmetic':
            // For arithmetic operations, add or subtract a random number from the correct answer
            const deviation = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviation : correctAnswer - deviation;
            break;
        case 'quadratic':
            // For quadratic equations, generate a random number within a reasonable range different from the correct roots
            const randomOffset = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = correctAnswer + randomOffset;
            break;
        case 'geometry':
            // For geometry questions, add or subtract a random number from the correct answer
            const deviationGeo = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviationGeo : correctAnswer - deviationGeo;
            break;
    }

    return wrongAnswer;
}


// Hard Level (Grade 11-12)
function generateHardMathQuestion() {
    const topics = ['algebra', 'trigonometry', 'calculus'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let question, answer;

    if (topic === 'algebra') {
        // Solving equations involving rational expressions, radicals, and logarithms
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) + 1;
        const x = Math.floor(Math.random() * 5) + 1;
        const y = Math.floor(Math.random() * 5) + 1;

        const expressionType = Math.floor(Math.random() * 3); // 0: rational, 1: radical, 2: logarithm
        if (expressionType === 0) {
            // Rational expression
            question = `Solve ${(a * x + b) / (c * y - b)} = ${x}`;
            answer = ((a * x + b) / (c * y - b) === x) ? "True" : "False";
        } else if (expressionType === 1) {
            // Radical expression
            question = `Simplify √(${a * x} + ${b * y})`;
            answer = Math.sqrt(a * x + b * y);
        } else {
            // Logarithmic expression
            question = `Solve log(${a * x}) = ${b * y}`;
            answer = Math.pow(10, b * y) / a;
        }
    } else if (topic === 'trigonometry') {
        // Solving trigonometric equations, using trigonometric identities, and solving problems involving angles and triangles
        const angles = ['sin', 'cos', 'tan'];
        const angle = angles[Math.floor(Math.random() * angles.length)];
        const value = Math.floor(Math.random() * 90) + 1; // Angle in degrees

        if (angle === 'sin') {
            question = `Find the value of ${angle}(${value}°)`;
            answer = Math.sin(value * (Math.PI / 180)); // Convert degrees to radians
        } else if (angle === 'cos') {
            question = `Find the value of ${angle}(${value}°)`;
            answer = Math.cos(value * (Math.PI / 180)); // Convert degrees to radians
        } else {
            question = `Find the value of ${angle}(${value}°)`;
            answer = Math.tan(value * (Math.PI / 180)); // Convert degrees to radians
        }
    } else if (topic === 'calculus') {
        // Understanding limits, derivatives, and integrals
        const calculusConcepts = ['limits', 'derivatives', 'integrals'];
        const concept = calculusConcepts[Math.floor(Math.random() * calculusConcepts.length)];

        if (concept === 'limits') {
            question = `Find the limit of f(x) as x approaches 0`;
            answer = "Depends on the function f(x)";
        } else if (concept === 'derivatives') {
            question = `Find the derivative of f(x) = ${Math.floor(Math.random() * 10)}x^2 + ${Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)}`;
            answer = `f'(x) = ${2 * Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)}`;
        } else {
            question = `Find the integral of f(x) = ${Math.floor(Math.random() * 10)}x + ${Math.floor(Math.random() * 10)} from a to b`;
            answer = `${Math.floor(Math.random() * 10) / 2}x^2 + ${Math.floor(Math.random() * 10)}x | from a to b`;
        }
    }

    return { question, answer, topic };
}

// Generate a wrong answer for hard-level math questions
function generateWrongAnswerHard(correctAnswer, topic) {
    let wrongAnswer;

    // Based on the topic, generate a wrong answer that differs from the correct answer
    switch (topic) {
        case 'algebra':
            // For algebraic expressions, add or subtract a random number from the correct answer
            const deviationAlg = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviationAlg : correctAnswer - deviationAlg;
            break;
        case 'trigonometry':
            // For trigonometric functions, generate a random angle and compute its trigonometric value
            const randomAngle = Math.floor(Math.random() * 90) + 1;
            const randomFunction = ['sin', 'cos', 'tan'][Math.floor(Math.random() * 3)];
            wrongAnswer = randomFunction === 'sin' ? Math.sin(randomAngle * (Math.PI / 180)) :
                          randomFunction === 'cos' ? Math.cos(randomAngle * (Math.PI / 180)) :
                          Math.tan(randomAngle * (Math.PI / 180));
            break;
        case 'calculus':
            // For calculus questions, manipulate the correct answer by adding or subtracting a random number
            const deviationCalc = Math.floor(Math.random() * 10) + 1;
            wrongAnswer = Math.random() < 0.5 ? correctAnswer + deviationCalc : correctAnswer - deviationCalc;
            break;
    }

    return wrongAnswer;
}

// Generate options for the math question, including one correct answer and three wrong answers
function generateOptions(correctAnswer, level, topic) {
    const options = [correctAnswer];
    const wrongAnswers = new Set(); // Use a Set to store unique wrong answers
    while (options.length < 4) {
        let wrongAnswer;
        if (level === 'easy') {
            wrongAnswer = generateWrongAnswerEasy(correctAnswer, topic);
        } else if (level === 'medium') {
            wrongAnswer = generateWrongAnswerMedium(correctAnswer, topic);
        } else if (level === 'hard') {
            wrongAnswer = generateWrongAnswerHard(correctAnswer, topic);
        } else {
            console.error('Invalid level specified');
            return;
        }
        if (!wrongAnswers.has(wrongAnswer)) {
            // Add the wrong answer to the options if it's unique
            options.push(wrongAnswer);
            wrongAnswers.add(wrongAnswer);
        }
    }
    return options.sort(() => Math.random() - 0.5);
}

// Generate a new question and options for the math question box
function generateNewQuestion() {
    ({ question, correctAnswer, topic } = generateMathQuestion(level));
    options = generateOptions(correctAnswer, level, topic);
}
