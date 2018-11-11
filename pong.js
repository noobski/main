var cw = 700; ch = 500; // canvas width & height
var px=0, py, ph=600, pw=8; // player's paddle
var p2x, p2y, p2dy=2, p2Skill = 3; // PC's paddle
var ballCraziness = 4;
var score = [0, 0, 0];
var balls, clouds, numClouds = 10000; numBalls = 9;

class Ball {
    constructor () {
        this.x = cw/2 + Math.floor(Math.random() * cw/2); 
        this.y = ch/2 + Math.floor(Math.random() * ch/2);
        this.d = 4;
        this.dx = Math.floor(Math.random()*7)-3; this.dy = Math.floor(Math.random()*7)-3;
    }
    update () {
        // check ball collisions canvas and paddles
        let bx = this.x, by = this.y, bd = this.d;
        // check collision with upper/lower canvas bounds
        if ((by>ch-bd) || (by<bd)) {
            this.dy = -this.dy;
        } else if (bx<(pw+bd)) {
            // if hitting left bound, check paddle hit
            if (by>=py && by<=(py+ph)) {
                this.changeDirection(py);
            } else {
                this.win(2, this);
            }
        } else if (bx>(p2x-pw-bd)) {
            // if hitting right bound, check paddle hit
            if (by>=p2y && by<=(p2y+ph)) {
                this.changeDirection(p2y);
            } else {
                this.win(1, this);
            }
        }
        this.x += this.dx; this.y += this.dy;
    }
    draw () {
        cc.fillStyle = 'white';
        cc.fillRect(this.x,this.y,this.d,this.d);
    }
    changeDirection (py) {
        this.dx = -this.dx;
        this.dy = ( this.y-(py+ph/2) ) / (ph /2) * ballCraziness;
        
    }
    win (winner, ball) {
        score[winner]++;
        if (balls.matrix.length !=0) {
            balls.remove(ball);
            return;
        }
    }
}
class Balls {
    constructor () {
        this.matrix = [];
        for (let i=0; i<numBalls; i++)
            this.matrix.push(new Ball());
        this.rightmostBall = this.matrix[0];
    }
    update () {
        for (let ball of this.matrix) {
            ball.update();
            if (ball.x > this.rightmostBall.x)
                this.rightmostBall = ball;            
        }
    }
    draw() {
        for (let ball of this.matrix) 
            ball.draw();
    }
    remove(ball) {
        removeObjectFromList(ball, this.matrix);
        this.rightmostBall = this.matrix[0];
    }
}
class Cloud {
    constructor() {
        this.x=100, this.y=30, this.d=25; 
        this.dx=0.5, this.dy=0.5, this.dt = Math.trunc(Math.random()*100)+50;
        this.col = '#'+Math.floor(Math.random()*16777215).toString(16);
    }
    draw() {
        var cx = this.x, cy = this.y, cw = this.d;
        cc.fillStyle = 'grey';
        cc.fillRect(cx, cy, cw, cw);
        cc.fillStyle = this.col;
        cc.fillRect(cx+1, cy+1, cw-2, cw-2);
    }
    update() {
        // collision with canvas bounds?
        if (this.x < pw || this.x > (cw - pw - this.d)) 
            this.dx =- this.dx;
        if (this.y < 0 || this.y > (ch - this.d)) 
            this.dy =- this.dy;
        // change course of cloud every 100 ticks;
        if (this.dt-- == 0) {
            this.dt = 100;
            this.dx += Math.random()*1 - 0.5;
            this.dy += Math.random()*1 - 0.5;
        }
        this.x += this.dx; this.y += this.dy;
    }
}
class Clouds {
    constructor () {
        this.matrix = [];
        for (let i=0; i<numClouds; i++)
            this.matrix.push(new Cloud());
    }
    update () {
        for (let cloud of this.matrix) 
            cloud.update();
    }
    draw() {
        for (let cloud of this.matrix) 
            cloud.draw();
    }
    remove(cloud) {
        removeObjectFromList(cloud, this.matrix);
    }

}
function check_collision (b, c) { // ball & cloud
    if (b.y >= (c.y + c.d) || (b.y + b.d) <= c.y || 
        b.x >= (c.x + c.d) || (b.x + b.d) <= c.x) {
        return false;
    }
    // there is a collision. Figure out which side of the cloud the ball hit
    if (b.y > (c.y+b.d) && b.y < (c.y+c.d-b.d)) { 
        // its a left/right hit
        b.dx = -b.dx;
        if (b.x < c.x) {
            // its a left hit
            c.col = 'firebrick';
        } else {
            // its a right hit
            c.col = 'forestgreen';
        }
    } else {
        b.dy = -b.dy;
        // its a top/down hit
        if (b.y < c.y) {
            // its a top hit
            c.col = 'gold';
        } else {
            c. col = 'darkslateblue';
        }
    }
    return true;
}
function removeObjectFromList (obj, list) {
    let index = list.indexOf(obj);
    list.splice(index, 1);
}
window.onload = init;
function init() {
    // init canvas, game interval & keyboard
    c = document.getElementById("canvas");
    c.width = cw; c.height = ch;
    cc = c.getContext('2d');
    cc.font = "20px Arial";
    setInterval(tick, 15);
    window.addEventListener('mousemove', movePaddle); 
    // create clouds
    clouds = new Clouds;
    // create ball
    balls = new Balls();
    // create paddles
    px = 0; py = c.height/2-ph/2;
    p2x = c.width-pw; p2y = c.height/2-ph/2;
}
function tick() {
    // erase canvas
    cc.fillStyle = 'black';
    cc.fillRect(0, 0, c.width, c.height);
    // draw score
    cc.fillStyle = 'red';
    cc.fillText("You: " + score[1],cw/5, ch/5);
    cc.fillText("PC Man: " + score[2],4*cw/5, ch/5);
    cc.fillStyle = 'grey';
    cc.fillText("Clouds: " + clouds.matrix.length, cw/2, ch/5);
    // draw paddles
    cc.fillStyle = 'white';
    cc.fillRect(px, py, pw, ph);
    cc.fillRect(p2x, p2y, pw, ph);
    // draw clouds
    clouds.draw();
    // draw balls
    balls.draw();
    // check collision of ball with clouds
    for (let ball of balls.matrix) {
        for (let cloud of clouds.matrix) 
            if(check_collision(ball, cloud))
                clouds.remove(cloud);
    }
    // update ball and clouds
    balls.update();
    clouds.update();
    // computer paddle move
    p2y += Math.sign(balls.rightmostBall.y - (p2y+ph/2)) * p2Skill;
}
function movePaddle(e) {
    py = e.clientY - c.height;
}