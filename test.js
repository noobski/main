const canvas = document.getElementById('canv');
const ctx = canvas.getContext('2d');
const scale = 20;

var piece = ['orange', 'red', 'yellow', 'red', 'orange'];

function draw(x, y){
    piece.forEach(function(color, index){
        ctx.fillStyle = color;
        ctx.fillRect((x+index)*scale, (y+index)*scale, scale, scale);
        console.log(index);
    });
}




// update();

var last_time = 0, x=0, y=1;
// function update(time){
    // console.log(time);
    // if (!(Math.floor(time)%500))
        // y+=3;
    // if (!(Math.floor(time)%1000))
        // x+=10;
    // ctx.fillStyle = 'blue';
    // ctx.fillRect(1, 1, canvas.width, canvas.height);
    // ctx.fillStyle = piece[Math.floor(Math.random()*piece.length)];
    // ctx.fillRect(x, y, 10, 10);
    // requestAnimationFrame(update);
// }

class Test {
    constructor(){
        this.x = 100;
        console.log('constructor: '+this.x);
        tester();
    }
}
function tester(){
    console.log('tester: '+this.x);
}
var test = new Test();