var State = /** @class */ (function () {
    function State() {
        this.transitions = Array(9).fill([]); //[nbours][new State]
        //this.transitions.fill([]);
    }
    return State;
}());
var RuleSet = /** @class */ (function () {
    function RuleSet() {
    }
    return RuleSet;
}());
var Grid = /** @class */ (function () {
    function Grid(xPos, yPos) {
        if (xPos === void 0) { xPos = 0; }
        if (yPos === void 0) { yPos = 0; }
        this.CELL_WIDTH = 10;
        this.CELL_HEIGHT = 10;
        this.GRID_WIDTH = 70;
        this.GRID_HEIGHT = 70;
    }
    Grid.prototype.draw = function (gridCanvas) {
        var ctx = gridCanvas.getContext("2d");
        ctx.beginPath();
        for (var x = 0; x < gridCanvas.width; x++) {
            for (var y = 0; y < gridCanvas.height; y++) {
                ctx.moveTo(x * this.CELL_WIDTH, 0);
                ctx.lineTo(x * this.CELL_WIDTH, gridCanvas.height);
            }
        }
    };
    return Grid;
}());
onload = function () {
    var gridCanvas = document.getElementById("grid");
    var ctx = gridCanvas.getContext("2d");
    var grid = new Grid();
    gridCanvas.width = grid.GRID_WIDTH * grid.CELL_WIDTH;
    gridCanvas.height = grid.GRID_HEIGHT * grid.CELL_HEIGHT;
    grid.draw(gridCanvas);
};
