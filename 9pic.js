// need to learn the document loading process, as the picture doesn't show until the logic of the script is done
// make the moving of the sector be fluid

// puzArr - the playing puzzle
// img    - the original image

// globals
var c, ctx, img, w, h, spacer, puzzle, puzzleSize, moves;
var squareRemoved, blankSector, puzSectorSize, moves, fs;
function ofer() {document.getElementById('chosenImage').src='./images/oferv.jpg'; start();}
function noa() {document.getElementById('chosenImage').src='./images/noathumb.jpg'; start();}
function idan() {document.getElementById('chosenImage').src='./images/idans.jpg'; start();}
function itay() {document.getElementById('chosenImage').src='./images/itays.jpg'; start();}
function yahel() {document.getElementById('chosenImage').src='./images/yahels.jpg'; start();}
function start () {
    // init global variables
    spacer = 5; imgD = 210,  moves = 0, fs = 40; 
    puzSectorSize = 210; imgSectorSize = imgD / 3;
    puzDimension = puzSectorSize*3 + spacer*2;
    puzArr =   [ -1, -1, -1, -1, -1, -1, -1, -1, -1 ]; 
    // create canvas & context
    canvas = document.getElementById('canvas');
    canvas.width = canvas.height = puzDimension;
    ctx = canvas.getContext('2d');
    // listen for clicks on the canvas
    canvas.addEventListener('click', clicked);
    // get picture (needs to be square for now)
    img = document.getElementById('chosenImage'); 
    img.width = img.height = imgD;
    // fill the puzzle with squares from the pic
    for (let imgSector=0; imgSector<8; imgSector++) {
        do {
            newPuzSector = Math.floor(Math.random() * 9);
        } while (puzArr[newPuzSector] != -1); 
        // found an empty spot in the puzzle to fill
        puzArr[newPuzSector] = imgSector;
    }
    redrawPuzzle();
    puzBlankSector = puzArr.indexOf(-1);
}
function redrawPuzzle() {
    ctx.fillStyle = 'beige';
    ctx.fillRect(0, 0, puzDimension, puzDimension);
   for (let i=0; i<9; i++)
        drawSector(i);
    // draw score (moves made so far)
    ctx.font = fs + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'green'
    ctx.fillText("Moves: " + moves, puzDimension/2, fs*2);
    if (isDone(puzArr)) {
        ctx.fillStyle = 'red';
        ctx.fillText("Winner!!", puzDimension/2, fs*4);
    }
}
function drawSector(sector) {
    if (puzArr[sector] == -1) return; // blank sector
    let imgSector = puzArr[sector];
    let imgStartX = imgSector % 3 * imgSectorSize;
    let imgStartY = Math.floor(imgSector / 3) * imgSectorSize;
    let puzStartX = sector % 3 * (puzSectorSize + spacer);
    let puzStartY = Math.floor(sector / 3) * (puzSectorSize + spacer);
    ctx.drawImage(img, imgStartX, imgStartY, imgD / 3, imgD / 3, 
                  puzStartX, puzStartY, puzSectorSize, puzSectorSize); 
}
function clicked(e) {
    moves++;
    var x = e.clientX, y = e.clientY;
    // find the sector clicked
    var sectorClicked = Math.floor(x / (puzSectorSize + spacer)) 
                      + Math.floor(y / (puzSectorSize + spacer)) * 3;  
    // Move sector if possible
    if (areAdjacent(sectorClicked, puzBlankSector)) 
        swapWithBlank(sectorClicked);
    redrawPuzzle();
}
function isDone(arr) {
    for (let i = 0; i<8; i++)
        if (i != puzArr[i]) return false;
    return true;
}
function swapWithBlank (puzClickedSector) {
    // move the image clicked in to the blank sector of the puzzle
    puzArr[puzBlankSector] = puzArr[puzClickedSector];
    // make the one clicked to be blank now
    puzArr[puzClickedSector] = -1;
    puzBlankSector = puzClickedSector;
}
function areAdjacent(a, b) {
    if (a%3 == 0) return ((b == a+1) || (b == a-3) || (b == a+3));
    if (a%3 == 1) return ((b == a-1) || (b == a+1) || (b == a+3) || (b == a-3));
    if (a%3 == 2) return ((b == a-1) || (b == a+3) || (b == a-3));
}

