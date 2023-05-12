
class State{
    stateId:number
    color: String;

    transitions = Array(9) //transtions[nbours] = stateID
    //startingState: number;

    constructor(id:number, color = "#FFFFFF", trans:number[]){
        this.stateId = id
        this.color = color;
        this.transitions = trans
        //this.transitions.fill([]);
    }

    getNextStateID(nbours:number){
        return this.transitions[nbours];
    }
}
class RuleSet{
    states:State[]
    defaultState:State
    constructor(states:State[],defaultState:State){
        this.states = states
        this.defaultState = defaultState
    }

}
function GoL(){
    let dead = new State(0, undefined, [0,0,0,1,0,0,0,0,0]);
    let alive = new State(1, undefined, [0,0,1,1,0,0,0,0,0]);
    return new RuleSet([dead,alive],dead);
}
class Grid{

    rules:RuleSet;

    xPos:number;
    yPos:number;

    CELL_WIDTH = 10;
    CELL_HEIGHT = 10;

    GRID_WIDTH = 70;
    GRID_HEIGHT = 70;
    cells: State[][];

    constructor(rules:RuleSet, xPos = 0, yPos = 0, cells?:State[][]){
        if(!cells)cells = Array(this.CELL_WIDTH).fill(Array(this.CELL_HEIGHT).fill(rules.defaultState));
        this.xPos = xPos;
        this.yPos = yPos;
        this.rules = rules;
    }

    draw(gridCanvas:HTMLCanvasElement){
        let ctx = gridCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.beginPath();
        for(let x = 0; x < gridCanvas.width;x++){
            for(let y = 0; y < gridCanvas.height;y++){
                ctx.moveTo(x*this.CELL_WIDTH,0);
                ctx.lineTo(x*this.CELL_WIDTH,gridCanvas.height);
            }
        }
    }
}

onload = () => {
    let gridCanvas = document.getElementById("grid") as HTMLCanvasElement;
    let ctx = gridCanvas.getContext("2d");
    let grid = new Grid(GoL());
    gridCanvas.width = grid.GRID_WIDTH * grid.CELL_WIDTH;
    gridCanvas.height = grid.GRID_HEIGHT * grid.CELL_HEIGHT;
    
    grid.draw(gridCanvas);

}