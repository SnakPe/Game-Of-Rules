import {Ruleset} from "./Ruleset";
import {State} from "./State";

export class Grid {
    table : State[][];
    rules : Ruleset;
    GRID_WIDTH = 100;
    GRID_HEIGHT = 80;
    constructor(ruleset, canvas) {
        this.canvas = canvas;
        this.rules = ruleset;
        this.createTable();
    }
    createTable() {
        this.table = [];
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            this.table.push([]);
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                this.table[x].push(this.rules.states[0]);
            }
        }
    }
    mod(a:number, b:number) {
        let result = a % b;
        return result < 0 ? b + result : result;
    }
    getNboursByState(x, y) {
        let nbours = [];
        for (let states = 0; states < this.rules.states.length; states++)
            nbours.push(0);
        for (let xPos = x - 1; xPos <= x + 1; xPos++) {
            for (let yPos = y - 1; yPos <= y + 1; yPos++) {
                if (xPos == x && yPos == y)
                    continue;
                else {
                    let stateIndex = this.rules.states.findIndex((state) => {
                        return this.table[this.mod(xPos, this.GRID_WIDTH)][this.mod(yPos, this.GRID_HEIGHT)] == state;
                    });
                    nbours[stateIndex]++;
                }
            }
        }
        return nbours;
    }
    getStateIndex(state) {
        return this.rules.states.findIndex((st) => state == st);
    }
    /**
     * @deprecated use drawTransition to transition and draw instead. Having a seperate draw and transition function is inefficient
     */
    transition() {
        let newTable = [];
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            newTable.push([]);
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                newTable[x].push(this.table[x][y].getNextState(this.getNboursByState(x, y)));
            }
        }
        this.table = newTable;
        this.draw();
    }
    //interface stuff
    CELL_WIDTH = 10; // 10 is best
    CELL_HEIGHT = 10;
    CELL_COLOR = "#333333";
    BORDER_WIDTH = 1; // 1 is best
    canvas : HTMLCanvasElement;
    /**
     * This redraws the entire canvas
     * When only drawing the next generation of the grid, use {@link drawTransition()} instead
     *
     */
    draw() {
        let ctx = this.canvas.getContext("2d");
        ctx.lineWidth = this.BORDER_WIDTH;
        ctx.strokeStyle = this.CELL_COLOR;
        let CellX = 0;
        let CellY = 0;
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                ctx.fillStyle = this.table[x][y].color;
                ctx.fillRect(CellX + .0, CellY + .0, this.CELL_WIDTH, this.CELL_HEIGHT);// add 0.5 to x and y pos if you have weird leftover borders or sth
                CellY += this.CELL_HEIGHT;
            }
            CellY = 0;
            CellX += this.CELL_WIDTH;
        }
        // this.drawGridWithLines();
        ctx.strokeStyle = "red";
        ctx.strokeRect(Math.ceil(this.GRID_WIDTH / 2 - 1) * this.CELL_WIDTH + .5, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT  + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
    }
    drawTransition() {
        let newTable = Array.from(Array(this.GRID_WIDTH), () => new Array(this.GRID_HEIGHT));
        let ctx = this.canvas.getContext("2d");
        ctx.lineWidth = this.BORDER_WIDTH;
        ctx.strokeStyle = this.CELL_COLOR;
        let CellX = 0;
        let CellY = 0;
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                let nextState = this.table[x][y].getNextState(this.getNboursByState(x, y));
                newTable[x][y] = nextState;
                if (nextState == this.table[x][y]) {
                    CellY = CellY + this.CELL_HEIGHT;
                    continue;
                }
                ctx.fillStyle = newTable[x][y].color;
                ctx.fillRect(CellX + 0, CellY + 0, this.CELL_WIDTH, this.CELL_HEIGHT);// add 0.5 to x and y pos if you have weird leftover borders or sth
                CellY += this.CELL_HEIGHT;
            }
            CellY = 0;
            CellX += this.CELL_WIDTH;
        }
        // this.drawGridWithLines();
        ctx.strokeStyle = "red";
        ctx.strokeRect(Math.ceil(this.GRID_WIDTH / 2 - 1) * this.CELL_WIDTH + .5, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        this.table = newTable;
    }
    /**
     * Draws the cell at (x,y) on the canvas
     * @param x x coordinate
     * @param y y coordinate
     */
    drawCell(x:number, y:number) {
        let ctx = this.canvas.getContext("2d");
        ctx.lineWidth = this.BORDER_WIDTH;
        ctx.strokeStyle = this.CELL_COLOR;
        ctx.fillStyle = this.table[x][y].color;
        ctx.fillRect(this.CELL_WIDTH * x + 0, this.CELL_HEIGHT * y + .0, this.CELL_WIDTH, this.CELL_HEIGHT); // add 0.5 to x and y pos if you have weird leftover borders or sth
        //ctx.strokeRect(this.CELL_WIDTH * x + .5, this.CELL_HEIGHT * y + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        let redCellXDist = x - Math.floor(this.GRID_WIDTH / 2 - 1);
        let redCellYDist = y - Math.ceil(this.GRID_HEIGHT / 2 - 1);
        if (redCellXDist >= -1 && redCellXDist <= 1 && redCellYDist >= -1 && redCellYDist <= 1) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(Math.ceil(this.GRID_WIDTH / 2 - 1) * this.CELL_WIDTH + .5, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        }
    }
    /**
     * this is for performance testing only
     * somehow this makes performance worse tho?!!???!?!??!?!??!
     */
    drawGridWithLines() {
        let ctx = this.canvas.getContext("2d");
        ctx.lineWidth = this.BORDER_WIDTH;
        ctx.strokeStyle = this.CELL_COLOR;
        let CellX = 0;
        let CellY = 0;
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                ctx.strokeRect(CellX+.5, CellY+.5, this.CELL_WIDTH, this.CELL_HEIGHT);
                CellY += this.CELL_HEIGHT;
            }
            CellY = 0;
            CellX += this.CELL_WIDTH;
        }
    }
}