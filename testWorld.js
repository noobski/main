window.onload = start();

function panRight() {
    camera.setPanXMove(1);
}
function panLeft() {
    camera.setPanXMove(-1);
}
function panUp() {
    camera.setPanYMove(-1);
}
function panDown() {
    camera.setPanYMove(1);
}
function panXStop() {
    camera.setPanXMove(0);
}
function panYStop() {
    camera.setPanYMove(0);
}
function axisXMovePlus() {
    camera.setAxisXMove(1);
}
function axisXMoveMinus() {
    camera.setAxisXMove(-1);
}
function axisXMoveStop() {
    camera.setAxisXMove(0);
}
function axisYMovePlus() {
    camera.setAxisYMove(1);
}
function axisYMoveMinus() {
    camera.setAxisYMove(-1);
}
function axisYMoveStop() {
    camera.setAxisYMove(0);
}
function start() {
    PI = Math.PI;
    colors = ['red', 'orange', 'blue', 'purple', 'grey', 'olive'];
    world = new World(9.8);
    // generate 100 objects, in and out of the camera's world
    for (let i=0; i<100; i++) {
        // newObject(x, y, z, dimension, speed, angle, color)
        world.newObject(rnd(2000, 1), rnd(2000, 1), rnd(2000, 1), rnd(100, 1), 
            rnd(2, 0), rnd(2*PI, 0), colors[rnd(colors.length, 1)]);
    }
    camera = new Camera(0,0,1000,1000);
    input = new Input({down:['ArrowLeft', panLeft, 'ArrowUp', panUp, 
        'ArrowRight', panRight, 'ArrowDown', panDown, '2', axisXMoveMinus, 
        '8', axisXMovePlus, '4', axisYMoveMinus, '6', axisYMovePlus],
        up:['ArrowLeft', panXStop, 'ArrowRight', panXStop, 'ArrowUp', panYStop, 
        'ArrowDown', panYStop, '2', axisXMoveStop, '8', axisXMoveStop,
        '4', axisYMoveStop, '6', axisYMoveStop]});
    gameLoop();
}
function gameLoop() {
    camera.draw();
    camera.update();
    world.update();
    window.requestAnimationFrame(gameLoop);
}

function rnd(num, isInt) {
    let a = Math.random() * num;
    if (isInt) return Math.floor(a);
    return a;
}
