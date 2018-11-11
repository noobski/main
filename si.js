// TOTAL: 2:45

var alien_w = 40, alien_h = 20, bullet_h = 8, bullet_w = 3, bullet_interval = 350;
var ctx, game, swarm, player, bullets;
var objects = [];

class Alien {
    constructor(x, y){
        this.w = alien_w, this.h = alien_h;
        this.l = x, this.r = x+this.w, this.t = y, this.b = y+this.h;
        this.color = 'white';
        objects.push(this);
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.l, this.t, this.w, this.h);
    }
    update(){
    }
    kill(){
        remove_obj_from_list(this, objects);
        delete this;
        // check if no more aliens
        if (!objects.filter(obj => obj instanceof Alien).length)
            game.over(true);
    }
    crash(){
        this.kill();
    }
}
class Swarm {
    constructor(rows, cols){
        this.rows = rows, this.cols = cols;
        this.dir = 1, this.speed = 100;
        // create aliens
        for (var r=0; r<rows; r++)
            for (var c=0; c<cols; c++) 
                var alien = new Alien ((c+0.2)*alien_w*1.5, (r+1)*alien_h*1.5);
    }
    update_edges(){
        var left=999, right=0, bottom=0;
        for (obj of objects)
        {
            if (!(obj instanceof Alien))
                continue;
            left = obj.l < left ? obj.l : left;
            right = obj.r > right ? obj.r : right;
            bottom = obj.b > bottom ? obj.b : bottom;
        }
        this.l = left, this.r = right, this.b = bottom;
    }
    update(){
        var delta_y = 0, row_height = alien_h*1.5;
        if (this.r >= (game.w - 0.2*alien_w) || this.l <= (0.2*alien_w))
        {
            this.dir = -this.dir;
            delta_y = row_height;
            if (this.bottom >= game.bottom)
            {
                game.over(false);
                return;
            }
        }
        // update each alien's xy
        for (obj of objects)
            if (obj instanceof Alien)
            {
                obj.l += this.dir * alien_w * 0.15;
                obj.r += this.dir * alien_w * 0.15;
                obj.t += delta_y;
                obj.b += delta_y;
            }
        this.update_edges();
   }
}
function keydown(e){
    if (e.code == 'Space')
        fire = true;
    if (e.code == 'ArrowLeft')
        player.dx = -3;
    if (e.code == 'ArrowRight')
        player.dx = 3;
}
function keyup(e){
    if (e.code == 'Space')
        fire = false;
    if (e.code == 'ArrowLeft')
        if (player.dx<0)
            player.dx = 0;
    if (e.code == 'ArrowRight')
        if (player.dx>0)
            player.dx = 0;
}
class Game {
    constructor(){
        this.stop = false;
        this.canv = document.getElementById('canv');
        this.w = this.canv.width = 800; 
        this.h = this.canv.height = 500;
        this.bottom = canv.height * 0.8; // the bottom most part of the swarm
        ctx = canv.getContext('2d');
        this.clear();
        swarm = new Swarm(5, 10);
        player = new Player(this.w/2, this.h - 40);
        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);
        window.requestAnimationFrame(game_loop);
    }
    clear(){
        ctx.fillStyle = 'grey';
        ctx.fillRect(0,0, canv.width, canv.height);
    }
    over(won){
        if (won)
        {
            console.log('you won');
        } 
        else
        {
            console.log('you lost');
        }            
        game.stop = true;
    }
}
class Player {
    constructor(x, y){
        this.w = 40, this.h = 20;
        this.color = 'white';
        this.l = x, this.r = x+this.w, this.t = y, this.b = y+this.h;
        objects.push(this);
        this.dx = 0;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.l, this.t, this.w, this.h);
    }
    update(){
        this.l += this.dx;
        this.r += this.dx;
    }        
    crash(){
        game.over(false);
        delete this;
    }
}
class Bullet {
    constructor(x, y, dy){
        this.w = bullet_w, this.h = bullet_h;
        this.color = 'red';
        this.l = x, this.r = x+this.w, this.t = y, this.b = y+this.h;
        this.dy = dy;
        objects.push(this);
    }
    update(){
        this.t += this.dy;
        this.b += this.dy;
        if (this.t <=20 || this.b >= player.b)
            this.kill();
    }
    kill(){
        remove_obj_from_list(this, objects);
        delete this;
    }
    crash(){
        this.kill();
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.l, this.t, this.w, this.h);
    }

}
function check_collisions(){
    for (obj of objects)
    {
        for (obj2 of objects) 
        {
            if (obj == obj2 ||
                obj.l<obj2.l || obj.r>obj2.r || obj.t<obj2.t || obj.b>obj2.b)
                continue;
            // crash has occurred
            console.log('collission between: '+obj+obj2);
            obj.crash(obj2);
            obj2.crash(obj);
        }
    }
}
var swarm_time = 0, fire_time=0, fire = false;
function game_loop(time = 0){
    if (fire && (time - fire_time > bullet_interval))
    {
        fire_time = time;
        var bullet = new Bullet(player.l+player.w/2, player.t-3, -2);
    }
    check_collisions();
    game.clear();
    for (obj of objects)
        obj.update();
    if (time - swarm_time>100)
    {
        swarm_time = time;
        swarm.update();
        for (obj of objects)
            if(obj instanceof Alien)
                obj.update();
    }
    game.clear();
    for (obj of objects)
        obj.draw();
    if (!game.stop)
        window.requestAnimationFrame(game_loop);
}
game = new Game();

