import {Ruleset} from "./Ruleset";
import { State } from "./State";
import {Cell} from "./Cell.js";
export class Grid {
    table : Cell[][];
    rules : Ruleset;
    GRID_WIDTH = 100;
    GRID_HEIGHT = 80;
    constructor(ruleset : Ruleset, canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.rules = ruleset;
        this.createTable();
        this.setupNeighbourPointersInStates();
    }
    createTable() {
        this.table = [];
       
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            this.table.push([]);
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                const newCell = new Cell(this.rules.states[0])
                newCell.createGetTransitionID(this.rules.states.length)
                this.table[x].push(newCell);
            }
        }
    }
    setupNeighbourPointersInStates(){
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {


                for(let nbourX = x-1; nbourX <= x+1; nbourX++){
                    for(let nbourY = y-1; nbourY <= y+1; nbourY++){
                        if(nbourX == x && nbourY == y)continue;
                        this.table[x][y].neighbours.push(this.table[this.mod(nbourX, this.GRID_WIDTH)][this.mod(nbourY, this.GRID_HEIGHT)])
                    }
                }
            }
        }
    }
    mod(a:number, b:number) {
        let result = a % b;
        return result < 0 ? b + result : result;
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
                newTable[x].push(this.table[x][y].getNextState());
            }
        }
        this.table = newTable;
        this.draw();
    }
    //interface stuff
    CELL_WIDTH = 10; // 10 is best
    CELL_HEIGHT = 10;
    CELL_COLOR = "#333333";
    BORDER_WIDTH = 1; // 2 is best
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
                ctx.fillStyle = this.table[x][y].state.color;
                ctx.fillRect(CellX + .5, CellY + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
                CellY += this.CELL_HEIGHT;
            }
            CellY = 0;
            CellX += this.CELL_WIDTH;
        }
        this.drawGridLines();
        ctx.strokeStyle = "red";
        ctx.strokeRect(Math.ceil(this.GRID_WIDTH / 2 - 1) * this.CELL_WIDTH + .5, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT  + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
    }
    drawTransition() {
        let newCellStates = Array.from(Array(this.GRID_WIDTH), () => new Array(this.GRID_HEIGHT)) as State[][];
        let ctx = this.canvas.getContext("2d");
        ctx.lineWidth = this.BORDER_WIDTH;
        ctx.strokeStyle = this.CELL_COLOR;
        let CellX = 0;
        let CellY = 0;
        
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                let nextState = this.table[x][y].getNextState();
                newCellStates[x][y] = nextState

                if (nextState == this.table[x][y].state) {
                    CellY = CellY + this.CELL_HEIGHT;
                    continue;
                }
                ctx.fillStyle = newCellStates[x][y].color;
                ctx.fillRect(CellX + .5, CellY + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
                CellY += this.CELL_HEIGHT;
            }
            CellY = 0;
            CellX += this.CELL_WIDTH;
        }
        this.drawGridLines();
        ctx.strokeStyle = "red";
        ctx.strokeRect(Math.ceil(this.GRID_WIDTH / 2 - 1) * this.CELL_WIDTH + .5, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                this.table[x][y].state = newCellStates[x][y]
            }
        }
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
        ctx.fillStyle = this.table[x][y].state.color;
        ctx.fillRect(this.CELL_WIDTH * x + .5, this.CELL_HEIGHT * y + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        ctx.strokeRect(this.CELL_WIDTH * x + .5, this.CELL_HEIGHT * y + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        let redCellXDist = x - Math.floor(this.GRID_WIDTH / 2 - 1);
        let redCellYDist = y - Math.ceil(this.GRID_HEIGHT / 2 - 1);
        if (redCellXDist >= -1 && redCellXDist <= 1 && redCellYDist >= -1 && redCellYDist <= 1) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(Math.ceil(this.GRID_WIDTH / 2 - 1) * this.CELL_WIDTH + .5, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT + .5, this.CELL_WIDTH, this.CELL_HEIGHT);
        }
    }
    /**
     * draws the lines from the grid lol
     * good comments
     */
    drawGridLines() {
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