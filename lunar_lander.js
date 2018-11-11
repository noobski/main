var cw, ch, c, cc, sd, ship1, ship2, ID = 0;
var lw, lh, lx, ly, pause, shipAnglechange, shipSpeedChange, PI;
var numStars, starSpeed, stars, starColors, thrustColors;
var animationID, game, input, explosionImage, landingPad, fireInterval;

// XXX make the landing pad have several places to land, with differnt scores (highest in the middle of it)

class Bullet {
    constructor (ship) {
        this.x = ship.x; this.y = ship.y;
        this.angle = ship.angle;
        this.speed = ship.speed + 5;
        this.dx = this.speed*Math.cos(this.angle); this.dy = this.speed*Math.sin(this.angle); 
        this.xw = this.yw = 6;
        this.color = ship.color;   
        this.mother = ship;
        game.objects.push(this);
    }
    update () {
        if ((this.x<0) || (this.y<0) || (this.x>cw) || (this.y>ch)) {
            remove_obj_from_list(this, game.objects);
            this.mother.bullets--;
            delete this;
            return;
        }
        this.x += this.dx;
        this.y += this.dy;
        if (this.mother == ship1) {
            if (collision(this, ship2)) game.crashed(ship2);
        } else {
            if (collision(this, ship1)) game.crashed(ship1);
        }
    }
    draw () {
        cc.fillStyle = this.color;
        if(Math.random()>0.96) cc.fillStyle = 'red'; // flicker the star 3% of the time
        cc.fillRect(this.x, this.y, this.xw, this.yw);
    }
}
class Star {
    constructor () {
        this.x = Math.random()*(cw); this.y = Math.random()*(ch);
        this.color = starColors[Math.floor(Math.random()*(starColors.length-0.1))];
        this.size = Math.random()*3;
        this.dx = this.size/3
        this.dy = Math.random()*starSpeed * this.size/3;
        game.objects.push(this);
    }
    update () {
        checkBounds(this);
        this.x += this.dx;
        this.y += this.dy;
    }
    draw () {
        cc.fillStyle = this.color;
        if( Math.round(Math.random()*30)==1 ) cc.fillStyle = 'black'; // flicker the star 3% of the time
        cc.fillRect(this.x, this.y, this.size, this.size);
    }
}
class LandingPad {
    constructor () {
        this.x = lx, this.y = ly, this.xw = lw, this.yw = 20, this.color = 'red';
        game.objects.push(this); 
    }
    update() {
    }
    draw() {
        cc.fillStyle = 'OrangeRed';
        cc.fillRect(this.x, this.y, this.xw, this.yw);
        let s=9;
        for (let color of starColors) {
            cc.fillStyle = color;
            cc.fillRect(this.x+Math.random()*(this.xw-s*2), this.y+Math.random()*this.xw, s*2, s);
        }
    }
}
function collision(a, b) {
    return !( (a.x + a.xw) < b.x || a.x > (b.x + b.xw) || (a.y + a.yw) < b.y || a.y > (b.y + b.yw) );
}
class Ship {
    constructor (color) {
        this.x = Math.random()*(cw-60); this.y = Math.random()*(ch-60);
        this.ddx = 0, this.ddy = 0; this.da = 0;
        this.angle = Math.random()*2*PI;
        this.speed = Math.random()*10;
        this.dx = this.speed*Math.cos(this.angle); this.dy = this.speed*Math.sin(this.angle); 
        this.scale = sd*6/5;
        this.xw = this.yw = sd;
        this.nativeColor = color;
        this.color = color;
        this.thrust = false, this.fireTimer = 0, this.bullets = 0, this.maxBullets = 3;
        game.objects.push(this);
    }
    draw() {
        cc.linewidth = 1;
        var x = this.x, y = this.y, angle = this.angle;
        var headx, heady, tailRx, tailRy, midx, midy, tailLx, tailLy;
        var scale = this.scale;
        var mx = x+sd/2, my = y+sd/2;
        headx = x + scale*Math.cos(angle);
        heady = y + scale*Math.sin(angle);
        tailRx = x + scale*Math.cos(angle-(3/4*PI)); 
        tailRy = y + scale*Math.sin(angle-(3/4*PI));
        midx = x + scale*(2/5)*Math.cos(angle-PI); 
        midy = y + scale*(2/5)*Math.sin(angle-PI);
        tailLx = x + scale*Math.cos(angle-(5/4*PI)); 
        tailLy = y + scale*Math.sin(angle-(5/4*PI));
        cc.beginPath();
        cc.moveTo(headx, heady);
        cc.lineTo(tailRx, tailRy); cc.lineTo(midx, midy);
        cc.lineTo(tailLx, tailLy); cc.lineTo(headx, heady);
        cc.fillStyle = this.color;
        cc.fill();
        if (this.thrust) {
            cc.beginPath();
            cc.fillStyle = starColors[Math.floor(Math.random()*(thrustColors.length-0.1))];
            cc.moveTo(tailRx, tailRy);
            cc.lineTo(x + scale*4*Math.cos(angle-PI), y + scale*4*Math.sin(angle-PI));
            cc.lineTo(tailLx, tailLy);
            cc.lineTo(midx, midy);
            cc.lineTo(tailRx, tailRy);
            cc.fill();
        }
    }
    update () {
        checkBounds(this);
        // check if landed
        if (collision(this, landingPad)) {
            if (this.isSafe()) {
                this.color = this.nativeColor;
                game.landed(this);
            } else {
                game.crashed(this);
            }
        }
        // XXX collision handler should be an external "emitter" object that checks for all collisions and notifies the objects that collided
        this.x += this.dx; this.y += this.dy;
        this.dx += this.ddx; this.dy += this.ddy;
        this.angle += this.da;
        this.color = (this.isSafe()? 'grey':this.nativeColor);
        if ((this.angle >= 2*PI) || (this.angle <= -2*PI)) { this.angle = 0; }
        if (this.thrust) {
            this.ddx += shipSpeedChange * Math.cos(this.angle);
            this.ddy += shipSpeedChange * Math.sin(this.angle);
        } else {
            this.ddx = this.ddy = 0;
        }
        if (this.fireTimer) this.fireTimer--;
        if ((this.fire) && (this.fireTimer<=0) && (this.bullets < this.maxBullets)) {
            new Bullet(this);
            this.bullets++;
            this.fireTimer = fireInterval;
        }
    }
    isSafe() {
        return ((Math.abs(this.dx) < 1.5) && (Math.abs(this.dy) < 1.5));
    }
}
function checkBounds(object) {
    if (object.x > cw) object.x = 0;
    if (object.y > ch) object.y = 0;
    if (object.x < 0) object.x = cw;
    if (object.y < 0) object.y = ch;
}
function remove_obj_from_list (value, list) {
    let index = list.indexOf(value);
    list.splice(index, 1);
}
function stopShips() {
    ship1.dx = ship1.dy = ship2.dx = ship2.dy = 0;
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
    }
    keyDown (keycode) {
        var ship = this.shipActive(keycode);
        if (keycode == 32) { game.pause(); }
        if ((keycode == 90) || (keycode == 37)) { ship.da = -shipAnglechange; }
        if ((keycode == 67) || (keycode == 39)) { ship.da = shipAnglechange; }
        if ((keycode == 88) || (keycode == 40)) { ship.thrust = true; }
        if ((keycode == 83) || (keycode == 38)) { ship.fire = true; }
    }
    keyUp (keycode) {
        var ship = this.shipActive(keycode);
        if ((keycode == 90) || (keycode == 67) || (keycode == 37) || (keycode == 39)) { ship.da = 0; }
        if ((keycode == 88) || (keycode == 40)) { ship.thrust = false; }
        if ((keycode == 83) || (keycode == 38)) { ship.fire = false; }
    }
    shipActive(keycode) {
        if ((keycode == 90) || (keycode == 67) || (keycode == 88) || (keycode == 83)) { return ship1; }
        return ship2;
    }
}
class Game {
    constructor () {
        this.objects = [];
        this.score1 = this.score2 = 0;
        this.initVariables();
        c = document.getElementById('canvas');
        c.width = cw; c.height = ch;
        cc = c.getContext('2d');
        this.pauseFlag = false;
        game = this;
        this.state = 'play';
        this.start();
    }
    start () { 
        landingPad = new LandingPad();
        for (let i=0; i<500; i++) // create stars
            new Star();
        input = new Input ();
        ship1 = new Ship("green");
        ship2 = new Ship("blue");
        explosionImage = document.getElementById('explosion');
        this.eraseCanvas();
        message('Welcome to Space Cold War!', -5, 'white', 25);
        message('---------------------------------------', -4, 'white', 25);
        message('Landing: +5 | Crashing or killing: -1', -3, 'gray', 25);
        message('Crash your ship in to your opponent to teleport him', -2, 'gray', 25);
        message('May the force be with you!', -1, 'white', 25);
        this.pause();
    }
    initVariables() {
        cw = window.innerWidth-30, ch = window.innerHeight-30, sd = 20;
        lw = 60, lh = 20, lx = cw/2-(lw/2), ly = ch-lh;
        starColors = ['red', 'yellow', 'green', 'blue', 'orange'];
        thrustColors = ['yellow', 'yellow', 'red',  'yellow', 'orange'];
        numStars = 500, starSpeed = 1, pause = false;
        shipAnglechange = 0.15, shipSpeedChange = 0.01; PI = Math.PI;
        fireInterval = 6;
    }
    gameLoop() { // called by window, so no context
        game.eraseCanvas();
        game.drawScores();
        game.updateElements();
        game.drawElements();
        game.checkShipCollisions();
    }
    pause() {
        if (this.pauseFlag) {
            this.pauseFlag = !this.pauseFlag;
            if (this.state == 'rebirth') {
                remove_obj_from_list(ship1, game.objects);
                remove_obj_from_list(ship2, game.objects);
                ship1 = new Ship("green");
                ship2 = new Ship("blue");
                this.state = 'play';
            }
            ID = setInterval(this.gameLoop, 30);
            return;
        }
        this.pauseFlag = !this.pauseFlag;
        this.stop();
        message('Press "space" to continue', 1, 'gray', 25);
    }
    restart(msg, color) {
        message(msg, -1, color, 50);
        game.drawScores();
        this.state = 'rebirth';
        this.pause();
    }
    landed(ship) {
        this.stop();
        if (ship == ship1) {
            this.score1 += 5;
        } else {
            this.score2 += 5;
        }
        this.restart('perfect landing ' + ship.color + ' !!!!', ship.color);
    }
    crashed(ship) {
        this.stop();
        if (ship == ship1) {
            this.score2++;
        } else {
            this.score1++;
        }
        animationID = setInterval(explosionAnimation, 30, ship.color + ' crashes!!!!', 10, ship.x, ship.y);
    }
    stop() {
        if (ID) clearInterval(ID);
        ID = 0;
    }
    drawScores () {
        var fs = 23;
        cc.font = fs + 'px Arial';
        cc.textAlign = 'center';
        cc.fillStyle = 'black';
        cc.fillRect(0, landingPad.y, cw/2-landingPad.xw/2-fs, landingPad.yw);
        cc.fillRect(cw/2+landingPad.xw/2+fs, landingPad.y, cw/2-landingPad.xw/2, landingPad.yw);
        cc.fillStyle = 'green'
        cc.fillText("Green: " + game.score1, landingPad.x+landingPad.xw/2 - 5*fs, landingPad.y+fs/1.3);
        cc.fillStyle = 'blue'
        cc.fillText("Blue: " + game.score2, landingPad.x+landingPad.xw/2 + 5*fs, landingPad.y+fs/1.3);
    }
    eraseCanvas () {
        cc.fillStyle = 'black';
        cc.fillRect(0,0,cw,ch);
    }    
    updateElements () {
        for (let object of this.objects) 
            object.update();
    }
    drawElements () {
        for (let object of this.objects)
            object.draw();
    }
    checkShipCollisions () {
        if (collision(ship1, ship2)) {
            this.stop();
            animationID = setInterval(explosionAnimation, 30, 'Ships crashed!!! Teleporting to new location!', 10, ship1.x, ship1.y);
        }
    }
}
function explosionAnimation(msg, times, x, y) {
    cc.drawImage(explosionImage, x-40, y-40, 70, 70);
    clearInterval(animationID);
    game.restart(msg, 'red');
}
function message (msg, row, color, fontSize) {
        cc.font = fontSize + "px Arial";
        cc.fillStyle = color;
        cc.textAlign = "center";
        cc.fillText(msg, cw/2, ch/2+row*fontSize*1.5);
}
window.onload = start();
function start () {
    game = new Game ();
}



