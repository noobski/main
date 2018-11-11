var cw, ch, c, cc, sd, ship, ID = 0;
var lw, lh, lx, ly, pause, shipAnglechange, shipSpeedChange, PI;
var numStars, starSpeed, stars, starColors, thrustColors;
var animationID, game, input, explosionImage, fireInterval, numAstroids;
var astroidMaxSize;

// get rid of all the globals

class Bullet {
    constructor (ship) {
        this.type = 'bullet';
        this.x = ship.x; this.y = ship.y;
        this.angle = ship.angle;
        this.speed = ship.speed + 5;
        this.dx = this.speed*Math.cos(this.angle); this.dy = this.speed*Math.sin(this.angle); 
        this.xw = this.yw = 6;
        this.color = ship.color;  
        ship.bullets++;
        game.objects.push(this);
    }
    update () {
        if ((this.x<0) || (this.y<0) || (this.x>cw) || (this.y>ch)) {
            this.kill();
            return;
        }
        this.x += this.dx;
        this.y += this.dy;
    }
    draw () {
        cc.fillStyle = this.color;
        if(Math.random()>0.96) cc.fillStyle = 'red'; // flicker the star 3% of the time
        cc.fillRect(this.x, this.y, this.xw, this.yw);
    }
    collision (object) {
        if (object.type == 'ship') return;
        if (object.type == 'astroid') {
            game.score += object.size;
            this.kill();
            return;
        }
    }
    kill () {
        remove_obj_from_list(this, game.objects);
        ship.bullets--;
        delete this;
    }
}
class Star {
    constructor () {
        this.type = 'star';
        this.x = Math.random()*(cw); this.y = Math.random()*(ch);
        this.color = starColors[Math.floor(Math.random()*(starColors.length-0.1))];
        this.size = Math.random()*3;
        this.dx = this.size/3
        this.dy = Math.random()*starSpeed; 
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
    collision () {
    }
}
class Astroid {
    constructor (size, x, y) {  // 1:large, 2:medium or 3:small (smallest size determined by astroidMaxSize)
        this.type = 'astroid';
        var ms = astroidMaxSize;
        if ((x==0) && (y==0)) {
            this.x = Math.random()*(cw); 
            this.y = Math.random()*(ch);
        } else {
            this.x = x;
            this.y = y;
        }
        this.color = starColors[Math.floor(Math.random()*(starColors.length-0.1))];
        this.size = size;
        this.xw = this.yw = (astroidMaxSize - size+1) * cw/30/astroidMaxSize;
        this.dx = Math.random() * size * 2 - size; // large is slow
        this.dy = Math.random() * size * 2 - size; 
        game.objects.push(this);
    }
    update () {
        checkBounds(this);
        this.x += this.dx;
        this.y += this.dy;
    }
    draw () {
        cc.fillStyle = this.color;
        cc.fillRect(this.x, this.y, this.xw, this.yw);
        cc.font = 30 + 'px Arial';
        cc.textAlign = 'center';
        cc.fillStyle = 'white';
        cc.fillText(this.size, this.x+this.xw/2, this.y+this.yw/2);
    }
    kill () {
        remove_obj_from_list(this, game.objects);
        delete this;
    }
    collision(object) {
        // hit by bullet
        if (object.type == 'bullet') {
            this.kill();
            if (this.size < astroidMaxSize) {
                this.size++;
                new Astroid(this.size, this.x, this.y);
                new Astroid(this.size, this.x, this.y);
            }
            return;
        }        
        // hit by spaceship 
        if (object.type == 'ship') {
            return;
        }
        // hit by other Astroid 
        // if ((object.type == 'astroid') && (object.size != this.size)) {
            // this.dx = -this.dx;
            // this.dy = -this.dy;
            // return;
        // }
    }
}
class Ship {
    constructor (color) {
        this.type = 'ship';
        this.x = Math.random()*(cw-60); this.y = Math.random()*(ch-60);
        this.ddx = 0, this.ddy = 0; this.da = 0;
        this.angle = Math.random()*2*PI;
        this.speed = Math.random()*10;
        this.dx = this.speed*Math.cos(this.angle); this.dy = this.speed*Math.sin(this.angle); 
        this.scale = sd*6/5;
        this.xw = this.yw = sd;
        this.nativeColor = color;
        this.color = color;
        this.thrust = false, this.fireTimer = 0, this.bullets = 0, this.maxBullets = 12;
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
        this.x += this.dx; this.y += this.dy;
        this.dx += this.ddx; this.dy += this.ddy;
        this.angle += this.da;
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
            this.fireTimer = fireInterval;
        }
    }
    collision (object) {
        if (object.type == 'bullet') 
            return;
        // if (game.lives) {
            // game.lives--;
        game.crashed(this);        
        this.kill();
        ship = new Ship('blue');
        return;
        // }
    }
    kill () {
        remove_obj_from_list(this, game.objects);
        delete this;
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
    }
    keyDown (keycode) {
        if (keycode == 40) { game.state = (game.state == 'pause-wait'? 'play':'pause'); }
        if (keycode == 37) { ship.da = -shipAnglechange; }
        if (keycode == 39) { ship.da = shipAnglechange; }
        if (keycode == 38) { ship.thrust = true; }
        if (keycode == 32) { ship.fire = true; }
    }
    keyUp (keycode) {
        if ((keycode == 37) || (keycode == 39)) { ship.da = 0; }
        if (keycode == 38) { ship.thrust = false; }
        if (keycode == 32) { ship.fire = false; }
    }
}
class Game {
    constructor () {
        this.objects = [];
        this.score = 0;
        this.gameSpeed = 300; // call every 40 ms
        this.initVariables();
        this.lives = 3;
        c = document.getElementById('canvas');
        c.width = cw; c.height = ch;
        cc = c.getContext('2d');
        this.pauseFlag = false;
        game = this;
        explosionImage = document.getElementById('explosion');
        this.state = 'play';
        this.start();
    }
    start () { 
        for (let i=0; i<numStars; i++) // create stars
            new Star();
        for (let i=0; i<numAstroids; i++)
            new Astroid(1, 0, 0);
        input = new Input ();
        ship = new Ship("blue");
        this.eraseCanvas();
        message('Astroids! by Ofer Vilenski', -5, 'white', 25);
        message('---------------------------------------', -4, 'white', 25);
        message('Kill the astroids without crashing in to them!', -3, 'gray', 25);
        this.gameLoop();
    }
    initVariables() {
        cw = window.innerWidth-30, ch = window.innerHeight-30, sd = 20;
        starColors = ['red', 'yellow', 'green', 'blue', 'orange'];
        thrustColors = ['yellow', 'yellow', 'red',  'yellow', 'orange'];
        numStars = 500, starSpeed = 1, pause = false;
        shipAnglechange = 0.08, shipSpeedChange = 0.01; PI = Math.PI;
        fireInterval = 6;
        numAstroids = 9; astroidMaxSize = 6;
    }
    gameLoop() { // called by window, so no context
        if (game.state == 'play') { 
            game.eraseCanvas();
            game.drawScores();
            game.updateElements();
            game.drawElements();
            game.check_collisions();
            setTimeout(game.gameLoop, game.speed); 
        }
        if (game.state == 'crash') { 
            setTimeout(explosionAnimation, 0); 
            game.state = 'pause';
        }
        if (game.state == 'pause') { 
            message('Press "arrow down" to continue', 1, 'gray', 25);
            this.state = 'pause-wait';
            setTimeout(game.gameLoop, game.speed); 
        }
        if (game.state == 'pause-wait') { 
            setTimeout(game.gameLoop, game.speed); 
        }
    }
    restart(msg, color) {
        message(msg, -1, color, 50);
        game.drawScores();
        this.state = 'rebirth';
        this.pause();
    }
    crashed(ship) {
        this.state = 'crash';
    }
    continue() {
        window.setTimeout(this.gameLoop, this.gameSpeed);
    }
    drawScores () {
        var fs = 23;
        cc.font = fs + 'px Arial';
        cc.textAlign = 'center';
        cc.fillStyle = 'black';
        cc.fillStyle = 'green'
        cc.fillText("Score: " + game.score, cw/2, ch-fs*1.5);
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
    check_collisions() {
        for (let i=0; i<this.objects.length; i++) {
            let a = this.objects[i];
            if (a.type == 'star') continue;
            for (let j=i; j<this.objects.length; j++) {
                let b = this.objects[j];
                if ((b == a) || (b.type == 'star')) continue;
                if (collision(a,b)) {
                    if (a.type == 'bullet') { // take care of deleting the bullet first
                        a.collision(b);
                        b.collision(a);
                    } else {
                        b.collision(a);
                        a.collision(b);
                    }
                }
            }
        }
    }
}
function collision(a, b) {
    return !( (a.x + a.xw) < b.x || a.x > (b.x + b.xw) || (a.y + a.yw) < b.y || a.y > (b.y + b.yw) );
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
function explosionAnimation(msg, times, x, y) {
    cc.drawImage(explosionImage, x-40, y-40, 70, 70);
    message(ship.color + ' crashes!!!!', 'red', 30);
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



