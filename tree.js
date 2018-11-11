window.onload = start();

// 18:26 (     ) - start
// 18:38 (12min) - finish initial coding of whole thing (30 lines)
// 18:42 (4 min) - finish debugging by re-reading, starting to run program
// 18:54 (12min) - first stem is working (didn't do the math right on the growth + didn't get the scope of cc right
// 19:00 (6 min) - first working tree, but looks strange. trying larger stems. (also, why didn't the external PI scope work?)
// 19:07 (7 min) - working perfectly, now playing around with the result
// go back to making space invaders smaller

function start () {
    branchShort = 0.83; PI = Math.PI;
    let treeColors = ['darkolivegreen', 'goldenrod', 'sienna', 'DarkSeaGreen ', 'Chartreuse ', 'DarkSlateGray', 'Gold',  'Khaki', 'IndianRed ', 'GreenYellow ']
    c = document.getElementById('canvas'); cc = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight-50;
    cc.fillStyle = 'black'; cc.fillRect(0,0,c.width,c.height);
    for (let i=0; i<20; i++)
        stem(Math.random()*(c.width-50)+25, c.height, Math.random()*90, 0, 8, treeColors[Math.floor(Math.random()*treeColors.length)]);
}
function stem(x, y, length, direction, stumpWidth, color) {
    if (length < 7) {
        // cc.strokeStyle = 'lightgreen'; cc.lineWidth = 1; cc.beginPath(); cc.moveTo(x, y); cc.lineTo(x,y-1); cc.stroke();
        return;
    }
    let newAngle = 0.5 * PI + direction * Math.random() * 0.65 * PI 
    let newX = x + length * Math.cos(newAngle);
    let newY = y - length * Math.sin(newAngle);
    cc.strokeStyle = color; cc.lineWidth = stumpWidth; cc.beginPath(); cc.moveTo(x, y); cc.lineTo(newX, newY); cc.stroke();
    stem(newX, newY, length * branchShort, 1, Math.max(stumpWidth-2, 1), color);
    stem(newX, newY, length * branchShort, -1, Math.max(stumpWidth-2, 1), color);
    stem(newX, newY, length * branchShort * 0.45, -1, Math.max(stumpWidth-2, 1), color);
    if (Math.random() > 0.9) 
        stem((x+newX)/2, (y+newY)/2, length * branchShort * 0.3, 1, Math.max(stumpWidth-2, 1), color);
}
