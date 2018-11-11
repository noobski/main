var table, changes=0;

class Cell {
    constructor (index, row, col, value) {
        this.index = index;
        this.row = row; 
        this.col = col; 
        this.quad =   (Math.floor(row/3)*3) + Math.floor(col/3); 
        this.value = (value? value:" ");
        this.possibles = (value? []:[1,2,3,4,5,6,7,8,9]);
    }
    cannotBe(value) {
        if (!remove_obj_from_list(this.possibles, value)) 
            return; // the value was not possible anyway, so no change was made
        changes++;
        document.getElementById(`cellpossibles${this.index}`).innerHTML = this.possibles;
        if (this.possibles.length==1) 
            table.setCellValue(this, this.possibles[0]); 
    }
    isPossible(value) { return (this.possibles.indexOf(value) != -1); }
}

class Table {
    constructor (puzzle) {
        this.tableElement = document.getElementById("table");
        this.HTML = "", this.cells = [], this.emptyCells = 81;
        for (let index=0; index<81; index++) {
            let value = puzzle[index];
            this.cells[index] = new Cell(index, Math.floor(index/9), index%9, value);
            this.emptyCells -= (value? 1:0);
        }
        this.drawHTML();
    }
    getCell(row, col){ return this.cells[row*9+col%9]; }
    collectCandidates(func, selector, num){
        let candidates = [];
        for (let cell of this.cells)
        {
            let hit = 0;
            switch (selector) {
            case 'row': hit += cell.row==num; break;
            case 'col': hit += cell.col==num; break;
            case 'quad': hit += cell.quad==num; break;
            case 'all': hit++; break;
            }
            if (hit && func(cell))
                candidates.push(cell);
        }
        return candidates;
    }
    setCellValue (cell, value) {
        cell.value = value;
        cell.possibles = [];
        this.emptyCells--;
        document.getElementById(`cell${cell.index}`).innerHTML =  `<font color=${"blue"}>${value}</font>`;
        changes++;
        this.recalcPossibles(cell);
    }
    drawHTML () {    
        for (let index=0; index<81; index++) 
        {
            this.HTML += (!index%9? '<tr>':'')+
                `<td id=cell${index}>${this.cells[index].value}<div id=cellpossibles${index}></div></td>`+
                (index%9==8? '</tr>\n':'');
        }
        this.tableElement.innerHTML = this.HTML;  
    }
    initializePossibles () {
        let candidates = this.collectCandidates(cellNotEmpty, "all", 0);
        for (let i=0; i<candidates.length; i++) {
            this.recalcPossibles(candidates[i]);
        }
    }    
    recalcPossibles (updatedCell) {
        let candidates = this.collectCandidates(cellIsEmpty, "row", updatedCell.row);
        candidates = candidates.concat(this.collectCandidates(cellIsEmpty, "col", updatedCell.col) );
        candidates = candidates.concat(this.collectCandidates(cellIsEmpty, "quad", updatedCell.quad) ); 
        for (let cand of candidates) 
            cand.cannotBe(updatedCell.value);
    }
    fillLastPossiblesInQuadrant () {
        for (let quad = 0; quad < 9; quad++) {
            let candidates = this.collectCandidates(cellIsEmpty, 'quad', quad);
            for (let lastNumberCandidate = 1; lastNumberCandidate <= 9; lastNumberCandidate++) 
            {
                let possibleLast = [];
                for (let cand of candidates) 
                {
                        if (cand.isPossible(lastNumberCandidate))  
                            possibleLast.push(cand);
                }
                if (possibleLast.length==1)  
                    this.setCellValue(possibleLast[0], lastNumberCandidate); 
            }
        }
    }
    fillTwoPossiblesInRowColQuad () {
        for (let type of ['row', 'col', 'quad'])
        {
            for (let i=0; i<9; i++) { 
                let candidates = this.collectCandidates(hasTwoPossibles, type, i);
                let results = [];
                if (candidates.length <= 1) { continue; }
                if (candidates.length == 2) 
                { 
                    if ((candidates[0].possibles[0] == candidates[1].possibles[0]) && 
                        (candidates[0].possibles[1] == candidates[1].possibles[1]))
                         { 
                            results.push(candidates[0]); 
                            results.push(candidates[1]);
                         }
                }
                if (candidates.length > 2) {
                    for (let currCand of candidates)
                    {
                        for (let compareCand of candidates)
                        {
                            if (compareCand.index == currCand.index) continue;
                            if ( (currCand.possibles[0] == compareCand.possibles[0]) && 
                                 (currCand.possibles[1] == compareCand.possibles[1]) )
                                 { 
                                    results.push(currCand);
                                 }
                        }
                    }
                }
                if (results.length)
                {
                    let updatedCell = results[0];
                    let candidates = this.collectCandidates(cellIsEmpty, type, updatedCell[`${type}`]);
                    for (let cand of candidates) 
                    {
                        if (cand.index==results[0].index || cand.index==results[1].index) { continue; }
                        cand.cannotBe(updatedCell.possibles[0]);
                        cand.cannotBe(updatedCell.possibles[1]);
                    }
                }
            }
        }
    }
    checkValid() {
        if (this.emptyCells) {console.log("couldn't finish solving"); return;}
        let numbers = [0,0,0,0,0,0,0,0,0];
        for (let cell of this.cells) 
            numbers[cell.value-1]++;
        console.log(numbers);
    }
}

function remove_obj_from_list (list, value) {
    let index = list.indexOf(value);
    if (index == -1)
        return false;
    list.splice(index, 1);
    return true;
}
let hasTwoPossibles = cell=>cell.possibles.length==2;    
let cellNotEmpty = cell=>cell.value!=' ';
function cellIsEmpty (cell) {
    return cell.value==" ";
}

function start(){
    table.initializePossibles();
    while (table.emptyCells && changes) {
        changes = 0;
        table.fillLastPossiblesInQuadrant();
        table.fillTwoPossiblesInRowColQuad();
    }
    table.checkValid();
}

function drawEasy(){
    table = new Table(puzzleEasy);
}
function drawHard1 () {
    table = new Table(puzzleHard132);
}
function drawHard2 () {
    table = new Table(puzzleHard130);
}
function drawHardOther1 () {
    table = new Table(puzzleHardOther1);
}
function drawEvil () {
    table = new Table(puzzleEvil);
}

puzzle0 = [
    0, 0, 0,   0, 0, 0,   0, 0, 0,
    0, 0, 0,   0, 0, 0,   0, 0, 0,
    0, 0, 0,   0, 0, 0,   0, 0, 0,

    0, 0, 0,   0, 0, 0,   0, 0, 0,
    0, 0, 0,   0, 0, 0,   0, 0, 0,
    0, 0, 0,   0, 0, 0,   0, 0, 0,

    0, 0, 0,   0, 0, 0,   0, 0, 0,
    0, 0, 0,   0, 0, 0,   0, 0, 0,
    0, 0, 0,   0, 0, 0,   0, 0, 0,
];
puzzleEasy = [
    0, 0, 1,   6, 0, 0,   0, 0, 0,
    0, 2, 0,   8, 0, 0,   9, 0, 0,
    9, 0, 3,   0, 0, 0,   8, 0, 6,

    0, 7, 0,   5, 6, 3,   2, 0, 1,
    5, 0, 0,   0, 0, 0,   0, 0, 3,
    0, 0, 0,   0, 4, 1,   0, 6, 0,

    1, 0, 9,   0, 8, 0,   6, 0, 4,
    0, 0, 7,   0, 0, 4,   0, 8, 9,
    0, 0, 0,   0, 0, 6,   1, 0, 0
];
puzzleHard132 = [
    0, 4, 0,   0, 0, 3,   0, 2, 0,
    0, 0, 3,   0, 6, 0,   0, 5, 0,
    0, 0, 8,   2, 0, 0,   1, 0, 0,

    0, 0, 0,   0, 0, 8,   2, 0, 0,
    7, 0, 2,   0, 5, 0,   4, 0, 9,
    0, 0, 1,   7, 0, 0,   0, 0, 0,

    0, 0, 9,   0, 0, 2,   3, 0, 0,
    0, 3, 0,   0, 7, 0,   8, 0, 0,
    0, 7, 0,   9, 0, 0,   0, 6, 2
];
puzzleHard130 = [
    5, 0, 0,   0, 1, 0,   3, 6, 0,
    0, 0, 0,   0, 0, 6,   0, 0, 9,
    0, 7, 0,   0, 0, 0,   0, 0, 2,

    0, 0, 3,   4, 7, 0,   9, 0, 0,
    1, 6, 0,   0, 0, 0,   0, 5, 0,
    0, 0, 9,   0, 8, 5,   1, 0, 0,

    7, 0, 0,   0, 0, 0,   0, 8, 0,
    4, 0, 0,   3, 0, 0,   0, 0, 5,
    0, 8, 5,   0, 4, 0,   0, 0, 1
    ];
puzzleHardOther1 = [
    4, 2, 0,   0, 0, 0,   0, 0, 0,
    1, 0, 0,   0, 3, 2,   7, 0, 0,
    0, 0, 8,   0, 0, 1,   0, 4, 0,

    0, 5, 0,   0, 6, 0,   0, 9, 0,
    0, 8, 0,   0, 4, 0,   0, 6, 0,
    9, 0, 0,   0, 7, 0,   0, 0, 8,

    0, 3, 0,   8, 0, 0,   6, 0, 0,
    0, 0, 2,   3, 1, 0,   0, 0, 9,
    0, 0, 0,   0, 0, 0,   0, 1, 5
    ];        
puzzleEvil = [
    0, 0, 0,   9, 0, 0,   0, 5, 0,
    0, 0, 0,   0, 0, 6,   2, 0, 0,
    2, 9, 8,   0, 7, 0,   0, 0, 4,

    0, 1, 5,   4, 0, 0,   0, 0, 0,
    3, 0, 0,   0, 0, 0,   0, 0, 5,
    0, 0, 0,   0, 0, 9,   8, 1, 0,

    1, 0, 0,   0, 4, 0,   6, 9, 7,
    0, 0, 7,   2, 0, 0,   0, 0, 0,
    0, 4, 0,   0, 0, 3,   0, 0, 0
    ];

           