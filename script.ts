
class State{
    stateId:number
    color: String;

    transitions = Array(9).fill([]) as Number[][] //[nbours][new State]
    startingState: number;

    constructor(){
        //this.transitions.fill([]);
    }
}
class RuleSet{
    states:State[]
    constructor(){
        
    }

}
function GoL(){
    return 
}
class Grid{


    xPos:number;
    yPos:number;

    CELL_WIDTH = 10;
    CELL_HEIGHT = 10;

    GRID_WIDTH = 70;
    GRID_HEIGHT = 70
    cells: State[][];

    constructor(xPos = 0, yPos = 0){

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
    let grid = new Grid();
    gridCanvas.width = grid.GRID_WIDTH * grid.CELL_WIDTH;
    gridCanvas.height = grid.GRID_HEIGHT * grid.CELL_HEIGHT;
    
    grid.draw(gridCanvas);

}