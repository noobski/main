/*
window.onload = function () {
    console.log('onload');
    test();
} 
*/
function test(){
    create_canvas(400, 400, 'black');
    rect(30,30,9,99,'red',3,false);
    circle(60,300,99,'blue',1,true);
    var arr = [];
    for (let i=0; i<30; i++)
        arr.push({x: Math.random()*400, y: Math.random()*400});
    polygon(arr, 9, 'green', false);
    input = new Input();
}

// GRAPHICS FUNCTIONS
function create_canvas (wx, wy, bg_color){
    var canv = document.createElement("canvas");
    ctx = canv.getContext('2d');
    canv.width = wx;
    canv.height = wy;
    canv.style.position = "absolute";
    canv.style.border   = "1px solid";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canv);
    ctx.fillStyle = bg_color;
    ctx.fillRect(0, 0, wx, wy);
    return {canvas: canv, context: ctx};
}
function rect(x, y, wx, wy, color, line_width, fill){
    set_styles(color, line_width);
    if (fill)
        ctx.fillRect(x, y, wx, wy);
    else 
        ctx.strokeRect(x, y, wx, wy);
}
function circle (x, y, r, color, line_width, fill){
    set_styles(color, line_width);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.stroke();
    if (fill) 
        ctx.fill();
}
function polygon (arr, line_width, color, fill){
    set_styles(color, line_width);
    ctx.beginPath();
    ctx.moveTo(arr[0].x, arr[0].y);
    for (let i=1; i<arr.length; i++) 
        ctx.lineTo(arr[i].x, arr[i].y);
    ctx.stroke();
    if (fill)
        ctx.fill();
}
function insert_image(src, x, y, w, h){
    baseImage = new Image();
    baseImage.src = src;
    baseImage.onload = function(){ ctx.drawImage(baseImage, x, y, w, h); }
    return baseImage;
}
function set_styles (color, line_width){
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.line_width = line_width;
}

// TEXT FUNCTIONS
function text_canv (fontSize, fontName, color, txt, x, y, align){
    // align can be 'center', 'end' or 'start'
    ctx.font = fontSize+'px '+ fontName;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(txt, x, y);
}

// ARRAY FUNCTIONS
function remove_obj_from_list (obj, list){
    let index = list.indexOf(obj);
    list.splice(index, 1);
}

// MEMORY IN BROWSER FUNCTIONS
function set_high_score(game, score){
    localStorage.setItem(game+'highScore', score);
}
function get_high_score(game){
    return localStorage.getItem(game+'highScore')
}

// the constructor of class Input receives a structure of 'up' keys+corresponding_function and 'down' (same)
// e.g.  >> input = key_input({down:['ArrowLeft', camera.panLeft, 'ArrowUp', camera.panUp], up:[]}); 
function key_input(){
    args = arguments;
    input = new Input();
    input.init(args);
    return input;
}
class Input {
    constructor(){
    }
    init(){
        this.args = arguments[0];
        window.addEventListener("keydown", function keydown(e){
            var key = e.key;
            if (!e.repeat)
                input.key_down(key);
        });
        window.addEventListener("keyup", function keyup(e){
            var key = e.key;
            if (!e.repeat)
                input.key_up(key);
        });
        window.addEventListener('contextmenu', input.right_click);
    }
    right_click(e){
        e.preventDefault();
    }
    key_down(key){
        this.handler(this.args[0].down, key);
    }
    key_up(key){
        this.handler(this.args[0].up, key);
    }
    handler(args, key){
        if (!args) return;
        for (let i=0; i<args.length; i+=2) 
            if (key == args[i]) args[i+1]();        
    }
}

// COLLISIONS
function dot_in_rect(dot, rect) { // dot: x,y   rect: l, r, t, b
    return (dot.x>=rect.l && dot.x<=rect.r && dot.y>=rect.t && dot.y<=rect.b)
}    
function check_collision (b, c){
    if (b.y >= (c.y + c.d) || (b.y + b.d) <= c.y || 
        b.x >= (c.x + c.d) || (b.x + b.d) <= c.x) {
        return false;
    }
    return true;
}