// camera
// - right now, all it does is transform the object to an x/y space
// - camera defines a box its looking at, gets from world all the objects in that space, projects
//   them on an x/y plane and draws them

class Camera {
    constructor(xs, ys, w, h) {
        // should define here the block to look at
        // for now will grab all objects from the world, and project them on x/y
        this.view = {xStart:xs,  yStart:ys, width:w, height:h };
        this.canvas = document.getElementById('canvas');
        this.canvas.w = this.canvas.width = window.innerWidth - 30; 
        this.canvas.h = this.canvas.height = window.innerHeight - 30;
        this.c = this.canvas.getContext('2d');
        this.scale = this.canvas.w / this.view.width;
        this.panX = this.panY = 0; this.panSpeed = 5;
        this.axisXAngle = 0; this.axisXchange = 0; this.axisPosChangeSpeed = 0.01;
        this.axisYAngle = 0; this.axisYchange = 0; 
        this.coordOrder = [0, 1, 2, 3, 0, 5, 6, 7, 8, 5, 6, 1, 2, 7, 8, 3];
    }
    update() {
        this.view.xStart += this.panX;
        this.view.yStart += this.panY;
        this.axisXAngle += this.axisXchange;
        this.axisYAngle += this.axisYchange;
    }
    draw() {
        // collect the objects that are visible to the camera (right now all)
        var objects = [];
        objects = objects.concat(this.collectObjects()); 
        // erase canvas
        var c = this.c;
        this.resetCanvas();
        // draw the image on the screen from the camera's perspective
        for (let obj of objects) {
            c.beginPath();
            c.lineWidth = 2;
            c.fillStyle = c.strokeStyle = obj.color;
            var t = this.transformX({x: obj.coords[0].x, y: obj.coords[0].y, z: obj.coords[0].z});
            t = this.transformY(t);
            t = this.transformScaleAndPan(t);
            c.moveTo(t.x, t.y);
            for (let i of this.coordOrder) {
                t = this.transformX({x: obj.coords[i].x, y: obj.coords[i].y, z: obj.coords[i].z});
                t = this.transformY(t);
                t = this.transformScaleAndPan(t);
                c.lineTo(t.x, t.y);
            }
            this.c.stroke();
        }    
    }
    transformX(cor) {
        // x axis changes
        var newX = cor.x;
        var newY = cor.y * Math.cos(this.axisXAngle) - cor.z * Math.sin(this.axisXAngle);
        var newZ = cor.y * Math.sin(this.axisXAngle) + cor.z * Math.cos(this.axisXAngle);
        return {x: newX, y: newY, z: newZ};
    }
    transformY(cor) {
        // y axis changes
        var newX = cor.x * Math.cos(this.axisYAngle) + cor.z * Math.sin(this.axisYAngle);
        var newY = cor.y;
        var newZ = cor.z * Math.cos(this.axisYAngle) - cor.x * Math.sin(this.axisYAngle);
        return {x: newX, y: newY, z: newZ};
    }
    transformScaleAndPan(cor) {
        // scale changes
        var newX = cor.x * this.scale - this.view.xStart;
        var newY = cor.y * this.scale - this.view.yStart;
        var newZ = cor.z * this.scale;
        return {x: newX, y: newY, z: newZ};
    }
    resetCanvas() {
        this.c.fillStyle = 'white';
        this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    collectObjects() {
        // world.getObjects(0, 1000, 0, 1000, 0, 1000);
        return world.objects;
    }
    setPanXMove(d) {
        this.panX = d * this.panSpeed;
    }
    setPanYMove(d) {
        this.panY = d * this.panSpeed;
    }
    setAxisXMove(d) {
        this.axisXchange = d * this.axisPosChangeSpeed;
    }
    setAxisYMove(d) {
        this.axisYchange = d * this.axisPosChangeSpeed;
    }
}