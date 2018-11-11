var cw = 1400, ch = 900, c, cc, sd = 20, ship1, ship2, ID, stars;
var lw = 60, lh = 20, lx = cw/2-(lw/2), ly = ch-lh;
var starColors = ['red', 'yellow', 'green', 'blue', 'orange'];
var numStars = 500, starSpeed = 1, pause = false;
var animationID, animationTick = -1, game, input, objects = [];
var shipAnglechange = 0.15, shipSpeedChange = 0.01; PI = Math.PI;

class Star {
    constructor () {
        this.x = Math.random()*(cw); this.y = Math.random()*(ch);
        this.color = starColors[Math.round(Math.random()*(starColors.length-0.1))];
        this.size = Math.random()*3;
        this.dx = this.size/3
        this.dy = Math.random()*starSpeed; 
        }
    update () {
        // check bounds
        if (this.x > cw) this.x = 0;
        if (this.y > ch) this.y = 0;
        if (this.x < 0) this.x = cw;
        if (this.y < 0) this.y = ch;
        this.x += this.dx;
        this.y += this.dy;
    }
    draw () {
        cc.fillStyle = this.color;
        if( Math.round(Math.random()*30)==1 ) cc.fillStyle = 'black';
        cc.fillRect(this.x, this.y, this.size, this.size);
    }
}
class Stars {
    constructor () {
        this.matrix = [];
        for (let i=0; i<numStars; i++) {
            this.matrix[i] = new Star();
        }
    }
    update() {
        for (let star of this.matrix) 
            star.update();
    }
    draw() {
        for (let star of this.matrix) 
            star.draw();
    }
}
class Ship {
    constructor (color) {
        this.x = Math.random()*(cw-60); this.y = Math.random()*(ch-60);
        this.ddx = 0, this.ddy = 0; this.da = 0;
        this.angle = Math.random()*2*PI;
        this.speed = Math.random()*14;
        this.dx = this.speed*Math.cos(this.angle); this.dy = this.speed*Math.sin(this.angle); 
        this.scale = sd*6/5;
        this.xw = this.yw = sd;
        this.color = color;
        this.fireKeys = [];
        this.fire = false;
        objects.push(this);
    }
    draw () {
        cc.fillStyle = this.color;
        cc.fillRect(this.x, this.y, sd, sd);
    }
    drawNew() {
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
        cc.strokeStyle = this.color;
        cc.moveTo(headx, heady);
        cc.lineTo(tailRx, tailRy);
        cc.lineTo(midx, midy);
        cc.lineTo(tailLx, tailLy);
        cc.lineTo(headx, heady);
        cc.stroke();
        cc.fillStyle = this.color;
        cc.fill();
        if (this.fire) {
            cc.beginPath();
            cc.strokeStyle = 'yellow';
            cc.fillStyle = 'yellow';
            cc.moveTo(tailRx, tailRy);
            cc.lineTo(x + scale*4*Math.cos(angle-PI), y + scale*4*Math.sin(angle-PI));
            cc.lineTo(tailLx, tailLy);
            cc.lineTo(tailRx, tailRy);
            cc.stroke();
            cc.fill();
        }
    }
    drawFire (code) {
        var flame = 50;
        var x, y, xw, yw;
        if ((code == 37) || (code == 90)) {
            x= this.x + sd + 3; y = this.y; xw = flame; yw = sd;
        }
        if ((code == 38) || (code == 83)) {
            x=this.x; y= this.y + sd + 3; xw= sd, yw = flame;
        }
        if ((code == 39) || (code == 67)) {
            x= this.x - flame - 3; y= this.y; xw = flame; yw = sd;
        }
        if ((code == 40) || (code == 88)) {
            x = this.x; y= this.y - flame - 3; xw= sd; yw= flame;
        }
        cc.fillStyle = 'yellow';
        cc.fillRect(x, y, xw, yw);
        cc.fillStyle = 'red';
        cc.fillRect(this.x, this.y, sd, sd);
    }
    check_collision () {
        if ((this.x + sd) < lx || this.x > lx+lw || (this.y+sd)<ly) return false;
        return true;
        }
    checkShipCollision (x,y) {
        if ( ((this.x + sd)< x) || (this.x > (x + sd)) || ((this.y+sd)<y) || (this.y > (y+sd)) )
            return false;
        return true;
    }
    update () {
        // check bounds
        if (this.x > cw)
            this.x = 0;
        if (this.x < 0)
            this.x = cw;
        if (this.y > ch)
            this.y = 0;
        if (this.y < 0) 
            this.y = ch;
        // check if landed
        if (this.check_collision()) {
            if ((Math.abs(this.dx) < 1.5) && (Math.abs(this.dy) < 1.5) && (this.angle < PI) && (this.angle > -PI))
                game.won(this.color);
            else
                game.lost(this.color);
        }
        this.x += this.dx;
        this.y += this.dy;
        this.dx += this.ddx;
        this.dy += this.ddy;
        this.angle += this.da;
        if ((this.angle >= 2*PI) || (this.angle <= -2*PI)) { this.angle = 0; }
        if (this.fire) {
            this.ddx += shipSpeedChange * Math.cos(this.angle);
            this.ddy += shipSpeedChange * Math.sin(this.angle);
        }
    }
}
function remove_obj_from_list (value, list) {
    let index = list.indexOf(value);
    list.splice(index, 1);
}

class Input {
    constructor() {
        // set keyboard listeners 
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
        var ship = 0;
        var speedChange = 0.25;
        if (keycode == 32) { game.pause(); }
        if ((keycode == 90) || (keycode == 67) || (keycode == 88)) 
            ship = ship1;
        if ((keycode == 37) || (keycode == 39) || (keycode == 40)) 
            ship = ship2;
        if ((keycode == 90) || (keycode == 37)) { ship.da = -shipAnglechange; }
        if ((keycode == 67) || (keycode == 39)) { ship.da = shipAnglechange; }
        if ((keycode == 88) || (keycode == 40)) { ship.fire = true; }
        if (ship) { 
            ship.fireKeys.push(keycode); 
        }
    }
    keyUp (keycode) {
        var ship = 0;
        if ((keycode == 90) || (keycode == 67) || (keycode == 88))
            ship = ship1;
        if ((keycode == 37) || (keycode == 39) || (keycode == 40))
            ship = ship2;
        if (ship) { 
            if ((keycode == 90) || (keycode == 67) || (keycode == 37) || (keycode == 39)) { ship.da = 0; }
            if ((keycode == 88) || (keycode == 40)) { ship.fire = false; ship.ddx = 0; ship.ddy = 0; }
            remove_obj_from_list(keycode, ship.fireKeys); 
        }
    }
}
class Game {
    constructor () {
        c = document.getElementById('canvas');
        c.width = cw; c.height = ch;
        cc = c.getContext('2d');
        objects.push({x: lx, y: ly, xw: lw, yw: 20, color: 'red'}); // landing pad
        this.pauseFlag = false;
    }
    start () { 
        this.eraseCanvas();
        var fontSize = 20, vl = ch/2-200, row = 0;
        cc.font = fontSize + "px Arial";
        cc.fillStyle = 'white';
        cc.textAlign = "center";
        cc.fillText('Welcome to Space Cold War!', cw/2, vl+row++*fontSize*1.5);
        cc.fillText('---------------------------------------', cw/2, vl+row++*fontSize*1.5);
        cc.fillText('Land your ship on the red platform before your opponent!', cw/2, vl+row++*fontSize*1.5);
        cc.fillText('Crash your ship in to your opponent to teleport him to somewhere else.', cw/2, vl+row++*fontSize*1.5);
        cc.fillText('Green moves: left-z right-c up-s down-x', cw/2, vl+row++*fontSize*1.5);
        cc.fillText('Blue moves: with the arrows', cw/2, vl+row++*fontSize*1.5);
        this.pause();
    }
    gameLoop() { // called by window, so no context
        game.eraseCanvas();
        game.drawLandingPad();
        game.drawVelocities();
        game.updateElements();
        game.drawElements();
        game.checkShipCollisions();
    }
    pause() {
        if (this.pauseFlag) {
            this.pauseFlag = !this.pauseFlag;
            this.resume();
            return;
        }
        this.pauseFlag = !this.pauseFlag;
        this.stop();
        cc.font = "15px Arial";
        cc.fillStyle = 'grey';
        cc.fillText('Press "space" to continue', cw/2, ch/2);
    }
    won(color) {
        this.stop();
        // message
        cc.font = "50px Arial";
        cc.fillStyle = color;
        cc.fillText("Perfect Landing - " + color + " Wins!!!!", cw/2, ch/2-20);
    }
    lost (color) {
        this.stop();
        // message
        cc.font = "50px Arial";
        cc.fillStyle = 'red';
        cc.fillText("Crash - " + color + " Loses!!!!", cw/2, ch/2-20);
    }
    stop() {
        clearInterval(ID);
    }
    resume() {
        ID = setInterval(this.gameLoop, 30);
    }
    drawVelocities () {
        var fs = 25;
        var ships = [ship1, ship2];
        cc.font = fs + 'px Arial';
        cc.textAlign = 'center';
        cc.fillStyle='grey';
        cc.fillRect(0, 0, 6*fs, 5*fs);
        cc.fillRect(cw-6*fs, 0, 6*fs, 5*fs);
        for (let ship of ships) {
            var xPos = (ship == ship1? 3*fs:(cw-3*fs));
            cc.fillStyle = ship.color;
            cc.fillText("dX: "+Math.trunc(ship.dx*10)/10, xPos, 1.5*fs);
            cc.fillText("dY: "+Math.trunc(ship.dy*10)/10, xPos, 3*fs);
            cc.fillText("Angle: "+Math.trunc(ship.angle*10)/10, xPos, 4.5*fs);
        }
    }
    eraseCanvas () {
        cc.fillStyle = 'black';
        cc.fillRect(0,0,cw,ch);
    }    
    drawLandingPad () {
        cc.fillStyle = 'red';
        cc.fillRect(lx,ly,lw,lh);
    }
    updateElements () {
        stars.update();
        ship1.update();
        ship2.update();     
    }
    drawElements () {
        stars.draw();
        ship1.drawNew();
        ship2.drawNew();
    }
    checkShipCollisions () {
        if ( (ship1.checkShipCollision(ship2.x, ship2.y) || (ship2.checkShipCollision(ship1.x, ship1.y))) ) {
            this.stop();
            animationID = setInterval(animation, 30, "collision", 30, ship1.x, ship1.y);
            ship1 = new Ship("green");
            ship2 = new Ship("blue");
        }
    }
}
function animation(type, times, x, y) {
    if (animationTick == -1) // first time here
        animationTick = times;
    animationTick--;
    var color = starColors[Math.floor(Math.random()*starColors.length)];
    cc.beginPath();
    cc.fillStyle = color;
    cc.moveTo(x-30,y-30);
    cc.lineTo(x-20,y);
    cc.lineTo(x,y+10);
    cc.lineTo(x+30,y-5);
    cc.lineTo(x+20,y+20);
    cc.lineTo(x+30,y+30);
    cc.lineTo(x,y+20);
    cc.lineTo(x-25,y+30);
    cc.lineTo(x-30,y)
    cc.lineTo(x-30,y-30);
    cc.fill();
    cc.stroke();
    cc.font = "30px Arial";
    cc.fillText("Ships crashed!!! Teleporting to new location!", cw/2, ch/2);
    if (!animationTick) { // finished animation
        clearInterval(animationID);
        game.resume();
    }
}
window.onload = start();
function start () {
    game = new Game ();
    input = new Input ();
    ship1 = new Ship("green");
    ship2 = new Ship("blue");
    stars = new Stars();
    game.start();
    // window.requestAnimationFrame(shipAnimation);
    
}

function shipAnimation() {
    ship1.angle += 0.06;
    ship1.scale += 0.01*sd;
    cc.fillStyle = 'white';
    cc.fillRect(0,0,cw, ch);
    ship1.drawNew();
    window.requestAnimationFrame(shipAnimation);
}






