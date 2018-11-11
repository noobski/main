// 1 hour!!!
// parameters 
var gw = 800, gh = 500, ctx; // game
var bw = 2, bh = 6, bs = -3; // bullet
var pw = 40, ph = 10, ps = 2, px, py; // player
var aw = 40, ah = 15, as = 1, ady = 0, aliens = 0; // alien
var objects = [];

class Object {
    constructor(type, x, y, w, h, color, sx, sy = 0){
        this.x = x, this.y = y, this.w = w, this.h = h, this.color = color;
        this.type = type, this.sx = sx, this.sy = sy;
        objects.push(this);
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    update(){
        this.x += this.sx;
        this.y += this.sy;
        if (this.type == 'player')
            px = this.x;
    }
    kill(){
        remove_obj_from_list(this, objects);
        if (this.type == 'alien')
            if(!--aliens);
                game_over(true);
    }
    crash(other){
        if (this.type == 'player')
            game_over(false);
        this.kill();
    }
}
start();
function start(){
    // create canvas
    var canv = document.getElementById('canv');
    ctx = canv.getContext('2d');
    canv.width = gw;
    canv.height = gh;
    // create aliens
    for (let row=0; row<5; row++)
        for (let col=0; col<10; col++, aliens++)
            new Object('alien', col*2*aw*1.5, row*2*ah*1.5, aw, ah, 'red', as);
    // create player
    py = gh-ph-ph/2;
    px = gw/2-pw/2;
    new Object('player', px, py, pw, ph, 'white', 0, 0);
    // input
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    game_loop();
}
function keydown(e){
    if (e.key == ' ') 
        new Object('bullet', px+pw/2, py-6, bw, bh, 'purple', 0, bs);
    if (e.key == 'ArrowRight') player_move(1);
    if (e.key == 'ArrowLeft') player_move(-1);
}
function keyup(e){
    if (e.key == 'ArrowRight') player_move(0);
    if (e.key == 'ArrowLeft') player_move(0);
}
function player_move(d){
    for (o of objects)
        if (o.type == 'player')
            o.sx = d;
}
function aliens_hit_wall(){
    for (o of objects)
        if (o.type == 'alien') 
            if (o.x<aw/3 || o.x>gw-aw-aw/3)
                return true;
    return false;
}
function aliens_update_sy(){
    for (o of objects)
        if (o.type == 'alien')
        {
            o.y += ah*1.5;
            o.sx = -o.sx;
        }
}
function check_collisions(){
    for (o of objects)
        for (other of objects)
        {
            if (o == other) 
                continue;
            if (!(o.x+o.w<other.x || o.x>other.x+other.w 
                || o.y+o.h<other.y || o.y>other.y+other.h))
            {
                o.crash(other);
                other.crash(o);
            }
        }
}
function game_over(won){
    won ? console.log('you win') : console.log('you lose');
}
function game_loop(){
    // clear screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, gw, gh);
    // update and draw
    if (aliens_hit_wall())
        aliens_update_sy();
    for (o of objects)
    {
        o.update();
        o.draw();
    }
    check_collisions();
    window.requestAnimationFrame(game_loop);
}