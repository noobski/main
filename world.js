// world library
// this emulates the physical world - locations (x,y,z), gravity, power / acceleration / speed, and later 
//   other stuff like light traversal, etc.
// it does not emulate how this world looks like on the screen (that will be 'camera' or something)
// Axis: infinite x,y,z axis, meeting at zero

class World {
    constructor(gravity) {
        this.g = gravity;
        this.objects = [];
    }
    newObject(x, y, z, dimension, speed, speedAngle, color) { 
        var obj = new Object(x, y, z, dimension, speed, speedAngle, color);
        this.objects.push(obj);
    }
    killObject(obj) {
        remove_obj_from_list(obj, this.objects);
        obj.kill();
    }
    update() {
        for (let obj of this.objects) {
            obj.x += obj.speed * Math.cos(obj.speedAngle);
            obj.y += obj.speed * Math.sin(obj.speedAngle);
            obj.z += 0;
            obj.speed += obj.acc;
            obj.updateCoords();
        }
    }
    getObjects(xs, xe, ys, ye, zs, ze) {
        this.objects.filter(function(o) {
            // return (o.x
        });
    }
}
class Object {
    constructor(x, y, z, dimension, speed, speedAngle, color) {
        this.x = x; this.y = y; this.z = z; this.speed = speed; this.speedAngle = speedAngle;
        this.acc = 0; this.d = dimension; this.color = color;
        this.updateCoords();
    }
    kill() {
        delete this;
    }
    updateCoords() { // coords are how the objects looks like in a straight coord system 
        var coords = [];
        var x = this.x, y = this.y, z = this.z, d = this.d;
        coords[0] = {x:x, y:y, z:z};
        coords[1] = {x:x+d, y:y, z:z};
        coords[2] = {x:x+d, y:y+d, z:z};
        coords[3] = {x:x, y:y+d, z:z};
        coords[4] = {x:x, y:y, z:z};
        coords[5] = {x:x, y:y, z:z+d};
        coords[6] = {x:x+d, y:y, z:z+d};
        coords[7] = {x:x+d, y:y+d, z:z+d};
        coords[8] = {x:x, y:y+d, z:z+d};
        coords[9] = {x:x, y:y, z:z+d};
        this.coords = coords;
    }
}

