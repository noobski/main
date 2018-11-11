window.onload = start;
class Terrain {
    constructor() {
        this.peaks = [];
        this.distanceBetweenPeaks = Math.round(W/(numPeaks-1));
        // create and draw terrain
        var hiLo = -0.25, i;
        for (i=1; i<(numPeaks-1); i++) {
            this.peaks[i] = Math.max(H - Math.round(Math.random() * H * (0.65 + hiLo)), 4 * tankHeight); 
            // make a platform for the left tank
            if (i==1) 
                this.peaks[0] = this.peaks[1] = Math.min(this.peaks[1], H - 4 * tankHeight);
            hiLo = -hiLo;
        }
        // make a platform for the left tank
        this.peaks[numPeaks-1] = this.peaks[numPeaks-2];
        // add to game objects
        objects.push(this);
        // create an array of all the ground points, to make it simple to detect collision
        this.arr = [];
        var x1 = 0, y1 = this.peaks[0], x2, y2;
        for (let i = 1; i < this.peaks.length; i++) {
            x2 = x1 + this.distanceBetweenPeaks; 
            y2 = this.peaks[i];
            for (let j = x1; j < x2; j++) {
                var yt = Math.round(y1 + (j - x1)/this.distanceBetweenPeaks * (y2-y1));
                 this.arr[j] = yt;
            }
            x1 = x2; y1 = y2;
        }
    }
    update() {
        if (game.state == 'over') 
            this.distanceBetweenPeaks -= 3;
    }
    collision(x, y) {
    }
    draw() {
        cc.strokeStyle = 'saddlebrown';
        cc.lineWidth = terrainWidth;
        cc.beginPath();
        tMoveTo(0, H);
        for (let i=0; i<numPeaks; i++) {
            let x = i * this.distanceBetweenPeaks;
            tLineTo(x, this.peaks[i]);
        }
        tLineTo(W, H);
        cc.stroke();
        cc.fillStyle = 'peru';
        cc.fill();
        cc.fillStyle = 'gold';
        for (let i=0; i<W; i++)
            tFillRect(i, terrain.arr[i], 2, 2);
    }
}
class Bullet {
    constructor(exitCannonX, exitCannonY, speed, angle, color, parentTank) {
        this.x = exitCannonX; this.y = exitCannonY; this.color = color; this.w = this.h = 8;
        this.parentTank = parentTank;
        this.exitVelocity = speed;
        this.dx = this.exitVelocity * Math.cos(angle);
        this.dy = -this.exitVelocity * Math.sin(angle);
        // add to game objects
        objects.push(this);
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += gravity;
        if ((this.x > W) || (this.x < 0)) 
            this.collision(this.x, this.y);
    }
    collision(x, y) {
        var expX = x, expY = Math.max(y, 0);
        // make sure explosion is seen on screen
        if ((expX > W) || (expX < 0)) { 
            var expX = ((this.x > W) * (W - 20) + (this.x < 0) * 0);
        }
        // create new explosion
        let exp = new Explosion(expX, expY);
        remove_obj_from_list(this, objects);
        delete this;
        game.state = 'noshot';
    }
    draw() {
        var x = this.x; let y = this.y;
        // if bullet is outside the window, scale out and move screen
        if (y + my < 0) {
            // scale down so that the deltaY at the bottom of the screen equals 
            // the 'y' that the bullet is above the screen's top
            s = 1 + (y + my) / H; 
            // move the picture bottom back to the bottom of the screen
            my = H - H * s;
        } 
        cc.strokeStyle = this.parentTank.color;
        cc.linewidth = 3;
        cc.beginPath();
        tArc(x,y,this.w/2,0,2*PI);
        cc.stroke();
    }
}
class Tank {
    constructor(x, y, angle, color) {
        this.x = x; this.y = y; this.color = this.nativeColor = color;
        this.w = tankWidth; this.h = tankHeight; this.cannonL = 2.3 * this.h;
        this.angle = angle; this.angleChange = 0; this.angleChangeIncrement = 0.01; 
        this.speed = 7; this.speedChange = 0; this.speedChangeIncrement = 0.2; this.maxSpeed = 24;
        // add to game objects
        objects.push(this);
    }
    draw() {
        cc.fillStyle = this.color;
        // draw tank body
        tFillRect(this.x, this.y, this.w, this.h);
        // draw tank cannon
        this.cx = this.cannonL * Math.cos(this.angle);
        this.cy = this.cannonL * Math.sin(this.angle);
        cc.beginPath();
        cc.strokeStyle = this.color;
        cc.lineWidth = 6;
        tMoveTo(this.x + this.w/2,this.y + 5);
        tLineTo(this.x + this.w/2 + this.cx, this.y - this.cy);
        cc.stroke();
        // draw the bullet speed indicator
        cc.fillStyle = 'white';
        tFillRect(this.x, this.y + this.h/4, this.w/this.maxSpeed * this.speed, this.h/2);
        // print the angle and speed
        cc.font = tFont(fs) + 'px Arial';
        cc.fillStyle = this.color;
        cc.textAlign = 'left';
        tFillText('Angle: ' + Math.round(this.angle/PI*180), this.x, this.y + this.h + fs)
        tFillText('Speed: ' + Math.round(this.speed), this.x, this.y + this.h + fs*2.5);
    }
    collision(x, y) {
        let exp = new Explosion(x, y);
        game.state = 'over';
    }
    greyOut() {
        this.color = 'lightGrey';
    }
    colorIn() {
        this.color = this.nativeColor;
    }
    update() {
        // update angle
        this.angle += this.angleChange;
        if (this.angle < 0)  this.angle = 0;
        if (this.angle == PI) this.angle = PI; 
        // update speed
        this.speed += this.speedChange;
        if (this.speed < 0) this.speed = 0;
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    }
    fire() {
        if (game.state == 'shot') return;
        game.state = 'shot';
        this.bullet = new Bullet(this.x + this.w/2 + this.cx, this.y - this.cy, 
                                 this.speed, this.angle, this.color, this);
    }
}
class Game {
    constructor() {
        this.state = 'start' // 'start', 'turn', 'shot', 'noshot', 'over'
        // add to game objects
        objects.push(this);
    }
    draw() {
    }
    update() {
        if (this.state == 'start') {
            tank = tankL;
            tankR.greyOut();
            tankL.colorIn();
            this.state = 'turn';
        }
        if (this.state == 'noshot') {
            // grey out current tank
            tank.greyOut();
            // change tank in play
            tank = otherPlayer();
            // make new tank colorful
            tank.colorIn();
            // change game state
            this.state = 'turn';
        }
    }
}
class Input {
    constructor() {
        window.addEventListener("keydown", function keydown(e) {
            var keycode = e.which || window.event.keycode;
            if (!e.repeat)
                input.keyDown(keycode);
        });
        window.addEventListener("keyup", function keyup(e) {
            var keycode = e.which || window.event.keycode;
            if (!e.repeat)
                input.keyUp(keycode);
        });
        window.addEventListener("wheel", function (e) {
            if (e.altKey) { // move scene
                my += (e.wheelDeltaY/120) * 5;
            } else {        // scale scene
                s += (e.wheelDeltaY/120) * 0.01 * s;
            }
        });
    }
    keyDown (keycode) {
        if (keycode == 37) { tank.angleChange = +tank.angleChangeIncrement; }
        if (keycode == 39) { tank.angleChange = -tank.angleChangeIncrement; }
        if (keycode == 32) { tank.fire(); }
        if (keycode == 38) { tank.speedChange = +tank.speedChangeIncrement; }
        if (keycode == 40) { tank.speedChange = -tank.speedChangeIncrement; }
    }
    keyUp (keycode) {
        if ((keycode == 37) || (keycode == 39)) { tank.angleChange = 0; }
        if ((keycode == 38) || (keycode == 40)) { tank.speedChange = 0; }
    }
}
class Explosion {
    constructor(x, y) {
        this.x = x; this.y = y; this.w = 20;
        if (tank == tankL) {
            this.x -= this.w; this.y -= this.w;
        }
        // add to game objects
        objects.push(this);
    }
    update() {
    }
    draw() {
        if (Math.random()>0.2) {
            tDrawImage(explosion, this.x, this.y, this.w, this.w);
        }
    }
}

function start() {
    // init global variables
    PI = Math.PI; terrainWidth = 8; 
    s = 1; mx = 0; my = 0; // scaling and moving
    gravity = 0.1; tankWidth = 60; tankHeight = 18; fs = 15;
    gamestate = ['p1', 'p2', 'p1fire', 'p2fire', 'end'];
    objects = [];
    numPeaks = Math.floor((window.innerWidth-220)/(tankWidth*3/2));
    explosion = new Image(); explosion.src = 'explosion.png'; explosion.width = explosion.height = 40;
    // make odd number of peaks so that both tanks are in valleys
    if (numPeaks % 2 == 0) numPeaks--; 
    // get canvas context and fill with black
    c = document.getElementById('cv');
    c.width = W = Math.round((window.innerWidth - 30)/numPeaks)*numPeaks; c.height = H = window.innerHeight-30;
    cc = c.getContext('2d');
    // create the terrain
    terrain = new Terrain();
    // create tanks
    tankL = new Tank(0 + tankWidth/3*2, terrain.peaks[0] - tankHeight - terrainWidth/2, 0.25 * PI, 'darkgreen');  
    tankR = new Tank(W - tankWidth/2*3, terrain.peaks[numPeaks-1] - tankHeight - terrainWidth/2, 0.75 * PI, 'darkred');  
    // create game operating system
    game = new Game();
    // listen to keyboard
    input = new Input();
    // start the game
    tank = tankL; // Left tank plays first
    gameLoop();
}
function gameLoop() {
    check_collisions();
    updateObjects();
    drawObjects();
    requestAnimationFrame(gameLoop);
}
function updateObjects() {
    for (let object of objects)
        object.update();
}
function drawObjects() {
    resetScreen();
    for (let object of objects)
        object.draw();
}
function otherPlayer() {
    return (tank == tankL? tankR:tankL);
}
function check_collisions() {
    // check if there's a bullet in the air
    if (game.state == 'shot') {
        // get a reference to the bullet
        var bullet = objects.filter(function(o) { return (o instanceof Bullet); })[0];
        var bx = Math.round(bullet.x), by = Math.round(bullet.y);
        // check if it hit the other player
        var other = otherPlayer();
        if (check_collision(bullet, other)) {
            bullet.collision(bx, by);
            other.collision(bx, by);
        }
        // check if it hit the terrain
        var yt = terrain.arr[bx];
        if (by > yt) {
            bullet.collision(bx, yt);
            terrain.collision(bx, yt);
        }
    }
}
function check_collision (b, c) {
    if (b.y >= (c.y + c.h) || (b.y + b.h) <= c.y || 
        b.x >= (c.x + c.w) || (b.x + b.w) <= c.x) {
        return false;
    }
    return true;
}
function resetScreen() {
    cc.fillStyle = 'LightSkyBlue ';
    cc.fillRect(0,0,W,H);
}
function remove_obj_from_list (value, list) {
    let index = list.indexOf(value);
    if (index == -1)
        return false;
    list.splice(index, 1);
    return true;
}

function tDrawImage(a, b, c, d, e) {
    cc.drawImage(a, s*b+mx, s*c+my, s*d, s*e);
}
function tArc(a, b, c, d, e) {
    cc.arc(s*a+mx, s*b+my, s*c, d, e);
}
function tFillRect(a, b, c, d) {
    cc.fillRect(s*a+mx, s*b+my, s*c, s*d);
}
function tMoveTo(a, b) {
    cc.moveTo(s*a+mx, s*b+my);
}
function tLineTo(a, b) {
    cc.lineTo(s*a+mx, s*b+my,);
}
function tFillText(a, b, c) {
    cc.fillText(a, s*b+mx, s*c+my);
}
function tFont(a) {
    return s*a;
}
