window.onload = init();
function init() {
    //Globals
    backgroundColor = "black";
    ax = 0; ay = 0;
    vx = -1; vy = 0;
    gridSize = 40; 
    tailLength = 5;
    tail = [{x:gridSize/2, y:gridSize/2}];
    highScore = lastHighScore = lastScore = 0;
    snakeHeadColor = 'FireBrick';
    snakeColor = 'FloralWhite';
    snakeGrowth = 5;
    pause = false;
    fps = 4;
    //
    canvas = document.getElementById("gc")
    canvasSize = canvas.width;
    ppg = canvasSize / gridSize;
    c = canvas.getContext("2d");
    c.fillStyle = backgroundColor;
    c.fillRect(0,0,canvasSize, canvasSize);
    createNewApple();
    document.addEventListener("keydown", keypress);
	intervalID = setInterval(game,1000/fps);
}
function createNewApple() {
    ax = Math.floor(Math.random()*(gridSize-1));
    ay = Math.floor(Math.random()*(gridSize-1));
    c.fillStyle = 'red';
    c.fillRect(ax*ppg, ay*ppg, ppg, ppg);
}
function game() {
    head = {x:tail[tail.length-1].x, y:tail[tail.length-1].y};
    head.x += vx; head.y += vy;
    if (head.x == gridSize) 
        head.x=0;
    if (head.x < 0)
        head.x=gridSize-1;
    if (head.y == gridSize)
        head.y=0;
    if (head.y < 0)
        head.y=gridSize-1;
    for (let segment of tail) {
        if ((head.x == segment.x) && (head.y == segment.y)) { // crash
            c.fillStyle = 'DeepSkyBlue';
            c.font = "30px Arial";
            c.fillText(`Game Over!  Your score was ${tailLength}`, (gridSize/2-10)*ppg, (gridSize/2)*ppg);
            clearInterval(intervalID);
            setTimeout(init, 3000);
            return;
        }
    }
    tail.push(head);
    if (tail.length > tailLength) { // snake is longer than it should be
        let junk = tail.shift();
        drawSegment(junk, backgroundColor);
    }
    drawSegment(head, snakeHeadColor);
    drawSegment(tail[tail.length-2], snakeColor);
    if ((head.x == ax) && (head.y == ay)) { // apple eaten
        tailLength += snakeGrowth;
        fps += 2;
        clearInterval(intervalID);
        intervalID = setInterval(game,1000/fps);
        createNewApple();
    }
    printScore();
}
function printScore() {
    highScore = (tailLength>highScore? tailLength:highScore);
    c.fillStyle = backgroundColor;
    c.fillRect(11*ppg,1*ppg,1*ppg,1*ppg);
    c.fillRect(11*ppg,2*ppg,1*ppg,1*ppg);
    c.font = '15px Arial';
    c.fillStyle = 'grey';
    c.fillText('Score:', 1*ppg, 2*ppg);
    c.fillText(tailLength, 11*ppg, 2*ppg);
    c.fillText('High Score:', 1*ppg, 3*ppg);
    c.fillText(highScore, 11*ppg, 3*ppg);
    lastScore = tailLength;
    lastHighScore = highScore;
}
function drawSegment(segment, color) {
        c.fillStyle = color;
        c.fillRect(segment.x*ppg, segment.y*ppg, ppg, ppg);
}
function pause() {
    // do nothing
}
function keypress(event) {
    switch (event.keyCode) {
    case 32: 
        clearInterval(intervalID);
        if (pause) {
            text_on_canvas(c, 30, 'Arial', backgroundColor, "Press space to continue...", 10*ppg, 20*ppg);
            intervalID = setInterval(game, 1000/fps);
            pause = !pause;
        } else {
            text_on_canvas(c, 30, 'Arial', 'DeepSkyBlue', "Press space to continue...", 10*ppg, 20*ppg);
            intervalID = setInterval(pause, 1000/fps);
            pause = !pause;
        }
        break;
    case 37: vx = -1; vy = 0; break;
    case 38: vx = 0; vy = -1; break;
    case 39: vx = 1; vy = 0; break;
    case 40: vx = 0; vy = 1; break;
    }
}
