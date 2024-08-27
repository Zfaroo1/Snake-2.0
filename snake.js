const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const scoreDisplay = document.getElementById('score');
const xpDisplay = document.getElementById('xp');
const levelDisplay = document.getElementById('level');
const statPointsDisplay = document.getElementById('statPoints');
const increaseSpeedButton = document.getElementById('increaseSpeed');
const increaseSizeButton = document.getElementById('increaseSize');
const increaseXPButton = document.getElementById('increaseXP');
const cheatsButton = document.getElementById('cheatsButton');
const cheatsButtons = document.getElementById('cheatsButtons');
const cheatsMessage = document.getElementById('cheatsMessage');
const noLosingButton = document.getElementById('noLosing');
const infiniteStatPointsButton = document.getElementById('infiniteStatPoints');
const doubleScoreButton = document.getElementById('doubleScore');
const disableAllCheatsButton = document.getElementById('disableAllCheatsButton');
const darkModeToggle = document.getElementById('darkModeToggle');
const foodSound = document.getElementById('foodSound');

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let food;
let direction;
let newDirection;
let intervalId;
const baseSpeed = 200;
let speed = baseSpeed;
let score;
let xp;
let level;
let isPaused = false;
let xpMultiplier = 1;
let sizeIncreaseCost = 5;
let speedIncreaseCost = 5;
let xpIncreaseCost = 5;
let xpRequired = 10;
let statPoints = 0;
let noLosing = false;
let infiniteStatPoints = false;
let doubleScore = false;
let isDarkMode = false;

const foodImage = new Image();
foodImage.src = 'snakefood.jpg';

// Ensure the audio is preloaded
foodSound.addEventListener('canplaythrough', () => {
    console.log('Audio is ready to play.');
}, false);

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
increaseSpeedButton.addEventListener('click', increaseSpeed);
increaseSizeButton.addEventListener('click', increaseSize);
increaseXPButton.addEventListener('click', increaseXP);
cheatsButton.addEventListener('click', toggleCheats);
noLosingButton.addEventListener('click', () => toggleCheat('noLosing'));
infiniteStatPointsButton.addEventListener('click', () => toggleCheat('infiniteStatPoints'));
doubleScoreButton.addEventListener('click', () => toggleCheat('doubleScore'));
disableAllCheatsButton.addEventListener('click', disableAllCheats);
darkModeToggle.addEventListener('click', toggleDarkMode);

function startGame() {
    setup();
    startButton.disabled = true;
    pauseButton.disabled = false;
}

function setup() {
    snake = [{ x: Math.floor(columns / 2) * scale, y: Math.floor(rows / 2) * scale }];
    direction = 'RIGHT';
    newDirection = 'RIGHT';
    createFood();
    score = 0;
    xp = 0;
    level = 1;
    xpRequired = 10;
    statPoints = 0;
    xpMultiplier = 1;
    sizeIncreaseCost = 5;
    speedIncreaseCost = 5;
    xpIncreaseCost = 5;
    speed = baseSpeed;
    noLosing = false;
    infiniteStatPoints = false;
    doubleScore = false;
    cheatsMessage.style.display = 'none';
    xpDisplay.textContent = `XP: ${xp} / ${xpRequired}`;
    scoreDisplay.textContent = `Score: ${score}`;
    levelDisplay.textContent = `Level: ${level}`;
    statPointsDisplay.textContent = `Stat Points: ${statPoints}`;
    document.addEventListener('keydown', changeDirection);
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(update, speed);
}

function createFood() {
    let foodX, foodY;
    let validPosition = false;

    while (!validPosition) {
        foodX = Math.floor(Math.random() * columns) * scale;
        foodY = Math.floor(Math.random() * rows) * scale;

        // Check if food position overlaps with any segment of the snake
        validPosition = !snake.some(segment => segment.x === foodX && segment.y === foodY);
    }

    food = { x: foodX, y: foodY };
}

function changeDirection(event) {
    if (isPaused) return;

    const key = event.keyCode;
    if (key === 37 && direction !== 'RIGHT') newDirection = 'LEFT';
    if (key === 38 && direction !== 'DOWN') newDirection = 'UP';
    if (key === 39 && direction !== 'LEFT') newDirection = 'RIGHT';
    if (key === 40 && direction !== 'UP') newDirection = 'DOWN';
}

function update() {
    if (isPaused) return;

    direction = newDirection;

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === 'LEFT') headX -= scale;
    if (direction === 'UP') headY -= scale;
    if (direction === 'RIGHT') headX += scale;
    if (direction === 'DOWN') headY += scale;

    const newHead = { x: headX, y: headY };

    if (headX === food.x && headY === food.y) {
        snake.unshift(newHead);
        createFood();
        xp += xpMultiplier;
        score += doubleScore ? 2 : 1;
        foodSound.play();
        updateStats();
    } else {
        snake.pop();
        snake.unshift(newHead);
    }

    if (checkCollision() || !isValidPosition(headX, headY)) {
        if (noLosing) {
            setup();
        } else {
            alert('Game Over!');
            clearInterval(intervalId);
            startButton.disabled = false;
            pauseButton.disabled = true;
            document.removeEventListener('keydown', changeDirection);
        }
    }

    draw();
}

function checkCollision() {
    const head = snake[0];
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

function isValidPosition(x, y) {
    return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, scale, scale);
    });

    ctx.drawImage(foodImage, food.x, food.y, scale, scale);
}

function togglePause() {
    if (isPaused) {
        intervalId = setInterval(update, speed);
        isPaused = false;
        pauseButton.textContent = 'Pause';
    } else {
        clearInterval(intervalId);
        isPaused = true;
        pauseButton.textContent = 'Resume';
    }
}

function increaseSpeed() {
    if (statPoints >= speedIncreaseCost) {
        speed = Math.max(50, speed - 10);
        statPoints -= speedIncreaseCost;
        speedIncreaseCost += 5;
        updateStats();
    }
}

function increaseSize() {
    if (statPoints >= sizeIncreaseCost) {
        snake.push({ ...snake[snake.length - 1] });
        statPoints -= sizeIncreaseCost;
        sizeIncreaseCost += 5;
        updateStats();
    }
}

function increaseXP() {
    if (statPoints >= xpIncreaseCost) {
        xpRequired = Math.max(1, xpRequired - 1);
        statPoints -= xpIncreaseCost;
        xpIncreaseCost += 5;
        updateStats();
    }
}

function updateStats() {
    scoreDisplay.textContent = `Score: ${score}`;
    xpDisplay.textContent = `XP: ${xp} / ${xpRequired}`;
    levelDisplay.textContent = `Level: ${level}`;
    statPointsDisplay.textContent = `Stat Points: ${statPoints}`;
}

function toggleCheats() {
    cheatsButtons.style.display = cheatsButtons.style.display === 'none' ? 'block' : 'none';
}

function toggleCheat(cheat) {
    switch (cheat) {
        case 'noLosing':
            noLosing = !noLosing;
            break;
        case 'infiniteStatPoints':
            infiniteStatPoints = !infiniteStatPoints;
            statPoints = infiniteStatPoints ? Infinity : statPoints;
            break;
        case 'doubleScore':
            doubleScore = !doubleScore;
            break;
    }
    cheatsMessage.style.display = (noLosing || infiniteStatPoints || doubleScore) ? 'block' : 'none';
}

function disableAllCheats() {
    noLosing = false;
    infiniteStatPoints = false;
    doubleScore = false;
    cheatsMessage.style.display = 'none';
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
}
