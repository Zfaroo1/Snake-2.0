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

function startGame() {
    setup();
    startButton.disabled = true;
    pauseButton.disabled = false;
}

function setup() {
    snake = [];
    snake[0] = { x: Math.floor(columns / 2) * scale, y: Math.floor(rows / 2) * scale };
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
        foodSound.play(); // Play sound when food is eaten
        updateLevel();
        xpDisplay.textContent = `XP: ${xp} / ${xpRequired}`;
        scoreDisplay.textContent = `Score: ${score}`;
    } else {
        snake.unshift(newHead);
        snake.pop();
    }

    if (noLosing) {
        if (headX < 0) headX = canvas.width - scale;
        if (headX >= canvas.width) headX = 0;
        if (headY < 0) headY = canvas.height - scale;
        if (headY >= canvas.height) headY = 0;

        snake[0] = { x: headX, y: headY };
    } else if (checkCollision()) {
        setup();
    }

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'green';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x, snake[i].y, scale, scale);
    }

    ctx.drawImage(foodImage, food.x, food.y, scale, scale);
}

function checkCollision() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height) {
        return true;
    }

    return false;
}

function updateLevel() {
    if (xp >= xpRequired) {
        level++;
        xp -= xpRequired;
        xpRequired = Math.floor(xpRequired * 1.5);
        levelDisplay.textContent = `Level: ${level}`;
    }
}

function increaseSpeed() {
    if (statPoints >= speedIncreaseCost) {
        speed = Math.max(50, speed - 10);
        statPoints -= speedIncreaseCost;
        speedIncreaseCost = Math.max(1, speedIncreaseCost - 1);
        statPointsDisplay.textContent = `Stat Points: ${statPoints}`;
        clearInterval(intervalId);
        intervalId = setInterval(update, speed);
    }
}

function increaseSize() {
    if (statPoints >= sizeIncreaseCost) {
        scale += 5;
        statPoints -= sizeIncreaseCost;
        sizeIncreaseCost = Math.max(1, sizeIncreaseCost - 1);
        statPointsDisplay.textContent = `Stat Points: ${statPoints}`;
    }
}

function increaseXP() {
    if (statPoints >= xpIncreaseCost) {
        xp += 10;
        statPoints -= xpIncreaseCost;
        xpDisplay.textContent = `XP: ${xp} / ${xpRequired}`;
        statPointsDisplay.textContent = `Stat Points: ${statPoints}`;
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
}

function toggleCheats() {
    const isHidden = cheatsButtons.style.display === 'none';
    cheatsButtons.style.display = isHidden ? 'block' : 'none';
    cheatsMessage.style.display = isHidden ? 'block' : 'none';
}

function toggleCheat(cheatName) {
    if (cheatName === 'noLosing') {
        noLosing = !noLosing;
    } else if (cheatName === 'infiniteStatPoints') {
        infiniteStatPoints = !infiniteStatPoints;
        if (infiniteStatPoints) {
            statPoints = Infinity;
        }
    } else if (cheatName === 'doubleScore') {
        doubleScore = !doubleScore;
    }
    cheatsMessage.textContent = `Using Cheats: ${cheatName}`;
}

function disableAllCheats() {
    noLosing = false;
    infiniteStatPoints = false;
    doubleScore = false;
    cheatsMessage.textContent = 'Cheats Disabled';
    cheatsButtons.style.display = 'none';
    cheatsMessage.style.display = 'none';
    statPoints = 0; // or a different value
}

function move(direction) {
    if (isPaused) return;

    switch (direction) {
        case 'LEFT':
            if (direction !== 'RIGHT') newDirection = 'LEFT';
            break;
        case 'UP':
            if (direction !== 'DOWN') newDirection = 'UP';
            break;
        case 'RIGHT':
            if (direction !== 'LEFT') newDirection = 'RIGHT';
            break;
        case 'DOWN':
            if (direction !== 'UP') newDirection = 'DOWN';
            break;
    }
}
