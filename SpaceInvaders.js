class Coordinates {  // XXX for later to use instead of x/y?
    constructor (x, y) {
        this.x = x; this.y = y;
    }
}
class Invader {
    constructor (x, y, row, col) {
        this.x = x; this.y = y;
        this.row = row; this.col = col;
        this.width = invaderWidth; this.height = invaderHeight;
        switch (row) {
        case 0: this.src = document.getElementById('noa'); break; 
        case 1: this.src = document.getElementById('ofer'); break; 
        case 2: this.src = document.getElementById('idan'); break; 
        case 3: this.src = document.getElementById('itay'); break; 
        case 4: this.src = document.getElementById('yahel'); break; 
        }
    }
    draw() {
        c.drawImage(this.src, this.x, this.y, this.width, this.height);
    }
}
class Invaders {
    constructor () {
        this.dx = invadersDx; this.dy = 1.5 * invaderHeight;
        this.matrix = []; 
        for (let row=0; row<invaderRows; row++) { 
            for (let col=0; col<invaderCols; col++) {
                var invader = new Invader(canvasBorder + col * spaceBetweenInvaders,
                    canvasBorder + row*this.dy, row, col);
                    this.matrix.push(invader);                    
            }
        }
        this.calcExtremeInvaders();
    }
    calcExtremeInvaders() {
        this.leftMostInvader = this.rightMostInvader = this.bottomMostInvader = this.matrix[0];
        for (let invader of this.matrix) {
            if (invader.x < this.leftMostInvader.x) this.leftMostInvader = invader;
            if (invader.x > this.rightMostInvader.x) this.rightMostInvader = invader;
            if (invader.y > this.bottomMostInvader.y) this.bottomMostInvader = invader;
        }
    }
    draw() {
        for (let invader of this.matrix) { invader.draw(); }
    }
    move() {
        let addToY = 0;
        if (this.leftMostInvader.x < game.leftBorder || this.rightMostInvader.x > game.rightBorder) {  
            this.dx = -this.dx;
            addToY = this.dy;
            // make invaders move faster by shortening their update time by x%
            game.invadersLoopIntervalTime = game.invadersLoopIntervalTime * invadersAccelerationFactor;
            clearInterval(game.callbacks[0]); // stop prev. invaders loop callback
            game.callbacks[0] = setInterval(game.invadersLoop, game.invadersLoopIntervalTime);
        }            
        for (let invader of this.matrix) { invader.x += this.dx; invader.y += addToY; }
        if (this.bottomMostInvader.y > game.bottomBorder) game.over();
    }
    killInvader(invader) {
        remove_obj_from_list(invader, this.matrix);
        if (!this.matrix.length)
            game.win();
        if (this.rightMostInvader == invader || this.leftMostInvader == invader  || this.bottomMostInvader == invader) 
            this.calcExtremeInvaders()
        game.projectiles.lastFire = 0; // allow spaceship to immediately take another shot
    }
}
class Ship {
    constructor (x, y) {
        shipWidth = shipWidth * 2; shipHeight = shipHeight * 3;
        this.x = x; this.y = y;
        this.width = shipWidth; this.height = shipHeight;
        this.dx = 0;
        this.src = document.getElementById('goldi');
    }
    draw(color) {
        if (color == backgroundColor) {
            c.fillStyle = backgroundColor;
            c.fillRect(this.x, this.y-6, this.width, this.height+6);
            return;
        }
        c.drawImage(this.src, this.x, this.y, this.width, this.height);
        c.fillStyle = "brown";
        c.fillRect(this.x+this.width/2-3, this.y-6, 6, 6);
    }
}
class Projectile {
    constructor (type, x, y, dy, width, height) {
        this.x = x; this.y = y;
        this.dy = dy;
        this.type = type;
        this.width = width;
        this.height = height;
    }
    update () { this.y += this.dy; }
    draw (color) {
        c.fillStyle = color;
        c.fillRect(this.x-this.width/2, this.y-this.height, this.width, this.height);
    }
}
class Projectiles {
    constructor () {
        this.matrix = [];
        this.lastFire = (new Date).valueOf();
    }
    fireMissle () {
        let now = (new Date).valueOf();
        if ((now - this.lastFire) > fireInterval) {
            let projectile = new Projectile("missile", game.ship.x+(shipWidth/2), game.ship.y-4, missileSpeed, 4, 12);
            this.matrix.push(projectile);
            this.lastFire = now;
        }
    }
    update () {
        for (let projectile of this.matrix) {
            projectile.update();
            if (projectile.y < canvasBorder) remove_obj_from_list (projectile, this.matrix);
            // check if Hit alien
            for (let invader of game.invaders.matrix) {
                if ((projectile.y<(invader.y+invaderHeight)) && (projectile.y>invader.y) 
                    && (projectile.x>invader.x) && (projectile.x<(invader.x+invaderWidth))) {
                    game.invaders.killInvader(invader);
                    remove_obj_from_list(projectile, game.projectiles.matrix);
                }
            }
        }
    }
    draw (color) {
        for (let projectile of game.projectiles.matrix) 
            projectile.draw(color);
    }
}
class Input {
    constructor () {
        // set keyboard listeners 
        window.addEventListener("keydown", function keydown(e) {
            var keycode = e.which || window.event.keycode;
            game.input.keyDown(keycode);
        });
        window.addEventListener("keyup", function keyup(e) {
            var keycode = e.which || window.event.keycode;
            game.input.keyUp(keycode);
        });
    }
    keyDown (keycode) {
        switch (keycode) {
        case 37: game.ship.dx = -shipSpeed; break;
        case 39: game.ship.dx = shipSpeed; break;
        case 32: game.projectiles.fireState = true; break;
        default: break;
        }
    }
    keyUp (keycode) {
        switch (keycode) {
        case 37: 
            if (game.ship.dx == -shipSpeed) // making sure that the ship is still in the same direction
               game.ship.dx = 0; 
            break;
        case 39: 
            if (game.ship.dx == shipSpeed) // making sure that the ship is still in the same direction
               game.ship.dx = 0; 
            break;
        case 32:
            game.projectiles.fireState = false;
            break;
        default: break;
        }
    }
}
class Game {
    constructor () {
        this.invaders = new Invaders();
        this.ship = new Ship(canvasWidth/2, canvasHeight - canvasBorder);
        this.projectiles = new Projectiles ();
        this.input = new Input ();

        this.rightBorder = canvasWidth - canvasBorder;
        this.leftBorder = canvasBorder; this.bottomBorder = this.ship.y - this.ship.height;
        this.state = "play";
        this.invadersLoopIntervalTime = invadersLoopIntervalTime;
        this.callbacks = [
            setInterval(this.invadersLoop, invadersLoopIntervalTime),
            setInterval(this.shipLoop, shipLoopIntervalTime),
            setInterval(this.projectilesLoop, projectilesLoopIntervalTime),
            ];
        this.redraw();
    }
    redraw() {
        // erase screen 
        c.fillStyle = backgroundColor;
        c.fillRect(0,0,canvasWidth, canvasHeight);
        this.invaders.draw();
        this.ship.draw(this.ship.color);
    }
    over () {
        game.state = "loseAnimation";
        // change the animation speed to normal for final animation
        // xxx
    }   
    win () {
        c.drawImage(game.ship.src, 0,0,canvasWidth, canvasHeight);
        game.state = "end";
    }
    endAnimationMove () {
        let animationSpeed = 25;
        let targetX = canvasWidth-invaderWidth, targetY = canvasHeight;
        var angle, dx, lastInvader, invader;
        if (this.invaders.matrix.length==0) {
            console.log("ENDED ANIMATION");
            this.state = "endGame";
            return;
        }
        for (invader of game.invaders.matrix) {
            if (invader == game.invaders.matrix[0]) {
                angle = (targetY-invader.y)/(targetX-invader.x);
                dx = ( (targetX-invader.x)>0? animationSpeed:-animationSpeed );
                invader.x += dx;
                invader.y += angle*dx;
                if (invader.y > (canvasHeight-80)) {
                    remove_obj_from_list(invader, this.invaders.matrix);
                    return;
                }
                lastInvader = invader;
                continue;
            }
            invader.x += 0.05 * (lastInvader.x - invader.x);
            invader.y += 0.05 * (lastInvader.y - invader.y);
            lastInvader = invader;
        }
    }
    endGame () {
        for (let intervalID of this.callbacks) 
            clearInterval (intervalID);
        console.log("Game has ended");
    }
    invadersLoop () {
        switch (game.state) {
        case "play": game.invaders.move(); break;
        case "endAnimation": game.endAnimationMove(); break;
        }
        game.redraw();
    }
    shipLoop () {
        game.ship.draw(backgroundColor);
        game.ship.x += game.ship.dx;
        if ( game.ship.x<game.leftBorder && game.ship.x>game.rightBorder)
            game.ship.x += -game.ship.dx;
        game.ship.draw("white");
    }
    projectilesLoop () {
        if (game.projectiles.fireState == true) 
            game.projectiles.fireMissle();
        game.projectiles.draw(backgroundColor);
        game.projectiles.update();
        game.projectiles.draw("red");
    }
}

{ // Defaults (global)  XXX make this all a .config [] (array) of the game 
    function start () {
        cv = document.getElementById("gameCanvas");
        c = cv.getContext("2d");
        game = new Game(); // initialize game, set event callbacks, and draw initial screen
    }
    function remove_obj_from_list (value, list) {
        let index = list.indexOf(value);
        if (index == -1)
            return false;
        list.splice(index, 1);
        return true;
    }
    { // globals
        var c;
        var invadersLoopFunc;
        // Canvas
        var canvasWidth = 1300;
        var canvasHeight = 800;
        var canvasBorder = 80;
        var backgroundColor = "black";
        // Speeds
        invadersLoopIntervalTime = 100;
        shipLoopIntervalTime = 3
        projectilesLoopIntervalTime = 10;
        // Invaders 
        var invadersDx = canvasWidth/220; 
        var invaderRows = 5;
        var invaderCols = 10;
        var invaderWidth = 48;
        var invaderHeight = 36;
        var spaceBetweenInvaders = 1.5 * invaderWidth;
        var invadersAccelerationFactor = 0.97
        //  Ship
        var shipWidth = 50;
        var shipHeight = 20;
        var shipSpeed = 1;
        // projectiles and Other
        var fireInterval = 500;
        var missileSpeed = -2;
        var c;
    }
}


