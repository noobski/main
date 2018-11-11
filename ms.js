// total time: 2 hours
window.onload = start;
var cell_width = 33,  font_size = 20, font = 'comic sans ms', w; 
var game, board, canv = 0, header, header_height = 60, high_score, is_best_time;
var bg_color = 'WhiteSmoke', fg_color = 'darkgrey';
var game_sizes = [{c: 10, r:10, m:15}, {c:16, r:16, m:38}, {c:28, r:27, m:114}];
var mines_left, timer, timer_id = 0, curr_size;
var colors = ['', 'blue', 'green',  'red',  'purple',  'brown',  'orange'];
var smiley_sources = ['./images/smiley.png', './images/frowney.png',
    './images/jubilent.png'];
class Cell {
    constructor(col, row){
        this.col = col, this.row = row;
        this.mine = this.open = this.flag = this.blasted = false;
        this.iteration = false; this.num = -1; this.d = cell_width;
        this.l = col*cell_width, this.r = this.l + cell_width;
        this.t = header_height+row*cell_width, this.b = this.t + cell_width;
    }
    add_flag(){
        this.flag = true;
        mines_left--;
        header.draw_mines_left();
    }
    remove_flag(){
        this.flag = false;
        mines_left++;
        header.draw_mines_left();
    }
    draw(){
        var d = this.d, x = this.l, y = this.t;
        if (!this.open)
        {
            rect(x, y, d-1, d-1, fg_color, 1, true);
            polygon([{x:x+1, y:y+d-2}, {x:x+1, y:y+1}, {x:x+d-2, y:y+1}],
                1, 'white', false);
            if (this.flag)
            {
                circle(x+d/2, y+d/2, d*1/3, 'red', 1, true);
                circle(x+d/2, y+d/2, d*1/10, 'black', 1, true);
            }
        }
        if (this.open)
        {
            rect(x, y, d-1, d-1, bg_color, 1, true);
            if (this.blasted)
                rect(x, y, d-1, d-1, 'red', 1, true);
            if (this.mine)
            {
                circle(x+d/2, y+d/2, d*1/3, 'black', 1, true);
                circle(x+d/2, y+d/2, d*1/14, 'red', 1, true);
            }
            if (this.flag)
            {
                circle(x+d/2, y+d/2, d*1/3, 'red', 1, true);
                if (!this.mine)
                {
                    polygon([{x: x, y:y},{x:x+d, y:y+d}, {x:x+d, y:y},
                        {x:x, y:y+d}], 1, 'black', false);
                }
            }
            let n = this.num;
            if (n > 0)
                text_canv(d*2/3, font, colors[n], n, x+d/2, y+d*3/4, 'center');
        }
    }
}
class Board {
    constructor(cols, rows, mines){
        this.cols = cols, this.rows = rows, this.mines = mines;
        // Create board array
        this.board = new Array;
        for (let i=0; i<cols; i++)
        {
            this.board.push(new Array);
            for (let j=0; j<rows; j++)
                this.board[i].push(new Cell(i, j));
        }
        // add mines to the board's cells
        this.mines = mines;
        mines_left = this.mines;
        while (mines_left)
        {
            let col = Math.floor(Math.random()*cols);
            let row = Math.floor(Math.random()*rows);
            if (!this.board[col][row].mine)
            {
                this.board[col][row].mine = true;
                mines_left--;
            }
        }
        mines_left = this.mines; // init this for the 'score'
        // figure out the number of mines in neighbors for each cell
        for (let i=0; i<cols; i++)
            for (let j=0; j<rows; j++)
            {
                var cell = this.board[i][j];
                if (cell.mine) continue;
                cell.num = 0;
                let neighbors = this.get_neighbors(cell);
                for (let neighbor of neighbors)
                    if (neighbor.mine)
                        cell.num++;
            }
        this.draw_board();
    }
    get_neighbors(cell){
        var neighbors = [];
        for (let col_off=-1; col_off<=1; col_off++)
            for (let row_off=-1; row_off<=1; row_off++)
            {
                var col = cell.col+col_off;
                var row = cell.row+row_off;
                if ((col_off || row_off) &&
                    (col>=0 && col<this.cols && row>=0 && row<this.rows))
                    {
                        neighbors.push(this.board[col][row]);
                    }
            }
       return neighbors;
    }
    draw_board(){
        for (let i=0; i<this.cols; i++)
            for (let j=0; j<this.rows; j++)
                this.board[i][j].draw();
    }
    open_zeros(cell){
        if (cell.num || cell.iteration)
        {
            if (!cell.flag)
                cell.open = true;
        } 
        else 
        {
            cell.open = true;
            cell.iteration = true; // don't iterate on it again in recursion
            var neighbors = this.get_neighbors(cell);
            for (let neighbor of neighbors)
                this.open_zeros(neighbor);
        }
    }
    check_if_won(){
        var won = true;
        for (let i=0; i<this.cols; i++)
            for (let j=0; j<this.rows; j++)
            {
                if (this.board[i][j].mine && !this.board[i][j].flag)
                    won = false;
            }
        game.game_over(won);
    }
    get_cell_clicked(dot){
        for (let i=0; i<this.cols; i++)
            for (let j=0; j<this.rows; j++)
            {
                let cell = board.board[i][j];
                if (dot_in_rect(dot, cell))
                    return cell;
            }
    }
    click(dot){
        var cell = board.get_cell_clicked(dot);
        if (cell.open)
            return;
        if (cell.mine)
        {
            cell.blasted = true;
            cell.open = true;
            game.game_over(false);
        }
        if (!cell.num)
            board.open_zeros(cell);
        if (cell.num > 0)
            cell.open = true;
        board.draw_board();
    }
    right_click(dot){
        var cell = board.get_cell_clicked(dot);
        if (!cell.open)
        {
            cell.flag ? cell.remove_flag() : cell.add_flag();
            if (!mines_left)
                this.check_if_won();
        }
        if (cell.open && cell.num)
        {
            // open the rest of the cells around the number if its flags are ok
            var neighbors = board.get_neighbors(cell), flags = 0;
            for (let neighbor of neighbors)
                if (neighbor.flag) flags++;
            if (flags==cell.num)
                for (let neighbor of neighbors)
                {
                    if (neighbor.flag)
                        continue;
                    if (neighbor.mine)
                    {
                        game.game_over(false);
                        return;
                    } 
                    else
                    {
                        neighbor.open = true;
                        if (!neighbor.num)
                            board.open_zeros(neighbor); 
                    }
                }
        }
        board.draw_board();
    }
    open_all(){
        for (let i=0; i<game.cols; i++)
            for (let j=0; j<game.rows; j++)
                board.board[i][j].open = true;
        this.draw_board();
    }
}
class Header {
    constructor(x, y){
        this.x = w/2, this.y = header_height/2;
        this.smiley_state = 0;
        this.draw();
    }
    change_smiley(state){ // 0 - smile (regular), 1 - frown, 2 - winner
        this.smiley_state = state;
        this.draw();
    }
    draw (){
        // draw the header background
        let h = header_height, x = this.x, y = this.y;
        rect(1, 1, w-2, h-3, fg_color, 1, true);
        // draw the smiley button
        this.smiley = {l: x-h/2, r: x+h/2-6, t: y-h/2+2, b: y+h-6};
        insert_image(smiley_sources[this.smiley_state],
            this.smiley.l, this.smiley.t, h-6, h-6);
        // draw the game size icons
        var right = this.smiley.r;
        let s = this.small = {l: right+3, r: right+13, t: 1.5*h/5, b: 1.5*h/5+10};
        let m = this.med = {l: right+3, r: right+23, t: 2.5*h/5, b: 2.5*h/5+10};
        let l = this.large = {l: right+3, r: right+33, t: 3.5*h/5, b: 3.5*h/5+10};
        rect(s.l, s.t, s.r-s.l, 10, 'green', 1, true);
        rect(m.l, m.t, m.r-s.l, 10, 'yellow', 1, true);
        rect(l.l, l.t, l.r-s.l, 10, 'red', 1, true);
        this.draw_mines_left();
        this.draw_timer();
    }
    draw_mines_left(){
        rect(5, 5, font_size*5, header_height-10, 'black', 1, true);
        polygon([{x:5, y:header_height-5}, {x:5, y:6}, {x:font_size*5+5, y:6}],
            1, 'white', false);
        text_canv(font_size*1.5, font, 'red', mines_left, font_size*2.5,
            header_height/2+font_size/2, 'center');
        text_canv(font_size*0.5, font, 'red', board.mines, font_size*4.2,
            header_height/2+font_size, 'center');
    }
    draw_timer(){
        var bg = is_best_time ? 'red' : 'black';
        var fg = is_best_time ? 'black' : 'red';
        rect(w-font_size*5-5, 5, font_size*5, header_height-10, bg, 1, true);
        polygon([{x:w-font_size*5-5, y:header_height-5},
            {x:w-font_size*5-5, y:6}, {x:w-5, y:6}], 1, 'white', false);
        text_canv(font_size*1.5, font, fg, Math.max(timer,0), 
            w-font_size*2.5-5, header_height/2+font_size/2, 'center')
        text_canv(font_size*0.5, font, fg, high_score, w-font_size*1-5,
            header_height/2+font_size, 'center')
    }
    header_clicked(dot){
        var scr;
        if (dot_in_rect(dot, this.smiley))
            scr = curr_size;
        else if (dot_in_rect(dot, this.small))
            scr = 0;
        else if (dot_in_rect(dot, this.med))
            scr = 1;
        else if (dot_in_rect(dot, this.large))
            scr = 2;
        game = new Game(scr);
    }
}
class Game {
    constructor(size){
        curr_size = size;
        is_best_time = false;
        this.cols = game_sizes[curr_size].c;
        this.rows = game_sizes[curr_size].r;
        this.mines = game_sizes[curr_size].m;
        timer = -1, start = false;
        w=this.cols*cell_width;
        canv.canvas.width = this.cols*cell_width;
        canv.canvas.height = header_height + this.rows*cell_width;
        canv.context.fillStyle = 'black';
        canv.context.fillRect(0, 0, canv.canvas.width, canv.canvas.height);
        rect(0,0, canv.canvas.width, canv.canvas.height, 'grey', 2, false);
        board = new Board(this.cols, this.rows, this.mines);
        canv.canvas.addEventListener('click', this.click);
        canv.canvas.addEventListener('contextmenu', this.right_click);
        if (!(high_score = get_high_score('ms'+curr_size)))
            high_score = 9999;
        header = new Header();
        if (timer_id)
            this.stop_timer();
    }
    start_timer(){
        timer = 0;
        timer_id = setInterval(this.increment_timer, 1000);
    }
    stop_timer(){
        clearInterval(timer_id);
    }
    increment_timer(){
        timer++;
        header.draw_timer();
    }
    screen_to_canvas(e){
        return {x: e.clientX - canv.canvas.offsetLeft,
            y: e.clientY - canv.canvas.offsetTop};
    }
    click(e){
        if (timer==-1)
            game.start_timer();
        let c = game.screen_to_canvas(e);
        if (c.y<header_height)
            header.header_clicked({x: c.x, y: c.y})
        else
            board.click({x: c.x, y: c.y});
    }
    right_click(e){
        e.preventDefault();
        let c = game.screen_to_canvas(e);
        if (c.y>header_height)
            board.right_click({x: c.x, y: c.y});
    }
    game_over(won){
        board.open_all();
        game.stop_timer();
        if (!won) { 
            header.change_smiley(1);
            return;
        }
        header.change_smiley(2);
        if (timer<high_score)
        {
            set_high_score('ms'+curr_size, timer);
            is_best_time = true;
            header.draw(true);
        }
    }
}
function start() {
    canv = create_canvas(10, 10, 'black');
    game = new Game(1); // start with default size = medium
}
// 381