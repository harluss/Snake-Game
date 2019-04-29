let canvas;
let ctx;

const COLOR_FILL_SNAKE = 'lime';
const COLOR_FILL_APPLE = 'magenta';
const COLOR_FILL_CANVAS = 'black';
const TEXT_NORMAL = "16px Impact";
const TEXT_BIG = "32px Impact";
// NOTE: set canvans to an even multiplier of GRID_SIZE 
const GRID_SIZE = 20;
const SCORE_WINNING = 200;
let apple;
let snake;
let isGameOver = false;

window.onload = function () {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    const FRAMES_PER_SECOND = 8;
    snake = new Snake();
    apple = new Apple();

    document.addEventListener('keydown', keyPressed);
    // execute 'runGame' X (FRAMES_PER_SECOND) times a sec
    setInterval(runGame, 1000 / FRAMES_PER_SECOND);
}

// key controls, preventing user from reversing
function keyPressed(evt) {
    const ARROW_LEFT = 37;
    const ARROW_UP = 38;
    const ARROW_RIGHT = 39;
    const ARROW_DOWN = 40
    const SPACEBAR = 32;

    if (evt.keyCode == ARROW_LEFT && snake.speedX != 1) {
        snake.setDirection(-1, 0);
    } else if (evt.keyCode == ARROW_UP && snake.speedY != 1) {
        snake.setDirection(0, -1);
    } else if (evt.keyCode == ARROW_RIGHT && snake.speedX != -1) {
        snake.setDirection(1, 0);
    } else if (evt.keyCode == ARROW_DOWN && snake.speedY != -1) {
        snake.setDirection(0, 1);
    } else if (evt.keyCode == SPACEBAR && isGameOver) {
        resetGame();
    }
}

class Snake {
    constructor() {
        this.x = canvas.height / 2;
        this.y = canvas.height / 2;
        this.speedX = 0;
        this.speedY = 1;
        this.score = 0;
        this.tail = [];
    }

    setDirection(x, y) {
        this.speedX = x;
        this.speedY = y;
    }

    update(apple) {
        // if apple was eaten
        if (apple) {
            // increase the score by 1
            this.score++;

            // check if score reached winning score
            if (this.score == SCORE_WINNING) {
                isGameOver = true;

                return;
            }
        } else {
            // otherwise shift all tail elements by 1, making space for current position
            for (let i = 0; i < this.tail.length - 1; i++) {
                this.tail[i] = this.tail[i + 1];
            }
        }

        // insert current position
        this.tail[this.score] = { x: this.x, y: this.y };
        this.x += this.speedX * GRID_SIZE;
        this.y += this.speedY * GRID_SIZE;
    }

    draw() {
        // draw each tail element
        this.tail.forEach(function (cell) {
            colorRect(cell.x, cell.y, GRID_SIZE, GRID_SIZE, COLOR_FILL_SNAKE);
        });
    }
}

class Apple {
    constructor() {
        // get number of rows and columns of the canvas
        let gridRows = canvas.height / GRID_SIZE;
        let gridCols = canvas.width / GRID_SIZE;

        // generate random location for the apple
        this.x = Math.floor(Math.random() * gridCols) * GRID_SIZE;
        this.y = Math.floor(Math.random() * gridRows) * GRID_SIZE;
    }

    draw() {
        colorRect(this.x, this.y, GRID_SIZE, GRID_SIZE, COLOR_FILL_APPLE);
    }
}

function runGame() {
    clearCanvas();

    if (isGameOver) {
        showMessage();

        return;
    }

    apple.draw();
    snake.update();
    checkForCollision();
    snake.draw();
    drawScore();
}

function clearCanvas() {
    colorRect(0, 0, canvas.width, canvas.height, COLOR_FILL_CANVAS);
}

function drawScore() {
    ctx.font = TEXT_NORMAL;
    ctx.fillStyle = COLOR_FILL_APPLE;
    ctx.fillText(snake.score, 20, 25);
}

// game over message
function showMessage() {
    if (snake.score == SCORE_WINNING) {
        var message = 'YOU WIN!';
    } else {
        message = 'GAME OVER!';
    }

    ctx.textAlign = "center";
    ctx.fillStyle = COLOR_FILL_APPLE;
    ctx.font = TEXT_BIG;
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 25);
    ctx.fillStyle = COLOR_FILL_SNAKE;
    ctx.font = TEXT_NORMAL;
    ctx.fillText(`Score: ${snake.score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press SPACE to play again', canvas.width / 2, canvas.height / 2 + 25);
}

function colorRect(x, y, width, height, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
}

function checkForCollision() {
    // check if snake went head first into a wall
    if (snake.x < 0 || snake.x > canvas.width - GRID_SIZE || snake.y < 0 || snake.y > canvas.height - GRID_SIZE) {
        isGameOver = true;
    }

    // check if snake got tangled up in its own tail
    snake.tail.forEach(function (cell) {
        if (snake.x == cell.x && snake.y == cell.y) {
            isGameOver = true;
        }
    });

    // check if snake devoured the apple
    if (snake.x == apple.x && snake.y == apple.y) {
        snake.update(true);
        getApple();
    }
}

// get new apple, check if its location is taken by snake's tail, in which case get another apple and check again
function getApple() {
    apple = new Apple();

    snake.tail.forEach(function (cell) {
        if (apple.x == cell.x && apple.y == cell.y) {
            getApple();
        }
    });
}

function resetGame() {
    snake = new Snake();
    apple = new Apple();
    isGameOver = false;
}