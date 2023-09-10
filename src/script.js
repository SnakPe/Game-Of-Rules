class State {
    /**
     * if no transition is found, assume that the state transitions to itself again
     */
    transitions;
    color;
    constructor(color = "#1d1a1a", trans = []) {
        this.color = color;
        this.transitions = trans;
    }
    /**
     * the transition ID is comprised by a digit per State, so that the digit describes the amount of neighnours of that state
     * the first digit describes the amount of nbours belonging to the first state, the second digit describe the ones form the second state ...
     *
     * @param nboursByState
     * @returns
     */
    getTransitionID(nboursByState) {
        let transID = '';
        nboursByState.forEach((nbours) => {
            transID += nbours.toString();
        });
        return transID.toString();
    }
    getNextState(nboursByState) {
        const transID = this.getTransitionID(nboursByState);
        let transition = this.transitions.find((trans) => {
            return trans[0] == transID;
        });
        return transition == undefined ? this : transition[1];
    }
}
class Ruleset {
    /**
     * the first element in the array is the default state, which fills the beginning of the grid at the start
     */
    states;
    constructor(states) {
        this.states = states;
    }
}
const GoL = function () {
    let alive = new State("#d87070", []);
    let dead = new State(undefined, []);
    const transitionsDeadCell = [
        ["53", alive]
    ], transitionsAliveCell = [
        ["08", dead],
        ["17", dead],
        ["26", dead],
        ["35", dead],
        ["44", dead],
        ["71", dead],
        ["80", dead]
    ];
    alive.transitions = transitionsAliveCell;
    dead.transitions = transitionsDeadCell;
    return new Ruleset([dead, alive]);
};
const Seeds = function () {
    let alive = new State("#0099ff", []);
    let dead = new State(undefined, []);
    const transitionsDeadCell = [
        ["62", alive]
    ];
    alive.transitions = [
        ["08", dead],
        ["17", dead],
        ["26", dead],
        ["35", dead],
        ["44", dead],
        ["53", dead],
        ["62", dead],
        ["71", dead],
        ["80", dead]
    ];
    dead.transitions = transitionsDeadCell;
    return new Ruleset([dead, alive]);
};
/**
 * https://en.wikipedia.org/wiki/Wireworld
 */
const Wireworld = function () {
    let empty = new State("#000000", []);
    let head = new State("blue", []);
    let tail = new State("orange", []);
    let cable = new State("yellow", []);
    const transitionsHeadCell = [];
    const transitionsTailCell = [];
    const transitionsCableCell = [];
    for (let emptyNbours = 8; emptyNbours >= 0; emptyNbours--) {
        for (let cableNbours = 8 - emptyNbours; cableNbours >= 0; cableNbours--) {
            for (let headNbours = 8 - emptyNbours - cableNbours; headNbours >= 0; headNbours--) {
                let tailNbours = 8 - emptyNbours - cableNbours - headNbours;
                const transID = emptyNbours.toString() + cableNbours + headNbours + tailNbours;
                transitionsHeadCell.push([transID, tail]);
                transitionsTailCell.push([transID, cable]);
                if (headNbours == 1 || headNbours == 2)
                    transitionsCableCell.push([transID, head]);
            }
        }
    }
    head.transitions = transitionsHeadCell;
    tail.transitions = transitionsTailCell;
    cable.transitions = transitionsCableCell;
    return new Ruleset([empty, cable, head, tail]);
};
function mod(a, b) {
    let result = a % b;
    if (result < 0)
        result = b + result;
    return result;
}
class Grid {
    table;
    rules;
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
                        return this.table[mod(xPos, this.GRID_WIDTH)][mod(yPos, this.GRID_HEIGHT)] == state;
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
    CELL_WIDTH = 10;
    CELL_HEIGHT = 10;
    BORDER_WIDTH = .2;
    canvas;
    /**
     * When drawing the next generation of the grid, use {@link drawTransition()} instead
     */
    draw() {
        let ctx = this.canvas.getContext("2d");
        ctx.lineWidth = this.BORDER_WIDTH;
        ctx.strokeStyle = "white";
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                ctx.fillStyle = this.table[x][y].color;
                ctx.fillRect(x * this.CELL_WIDTH, y * this.CELL_HEIGHT, this.CELL_WIDTH, this.CELL_HEIGHT);
                ctx.strokeRect(x * this.CELL_WIDTH, y * this.CELL_HEIGHT, this.CELL_WIDTH, this.CELL_HEIGHT);
            }
        }
        ctx.strokeStyle = "red";
        ctx.strokeRect(Math.floor(this.GRID_WIDTH / 2) * this.CELL_WIDTH, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT, this.CELL_WIDTH, this.CELL_HEIGHT);
        ctx.strokeStyle = "white";
    }
    drawTransition() {
        let newTable = Array.from(Array(this.GRID_WIDTH), () => new Array(this.GRID_HEIGHT));
        let ctx = this.canvas.getContext("2d");
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.BORDER_WIDTH;
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                newTable[x][y] = (this.table[x][y].getNextState(this.getNboursByState(x, y)));
                ctx.fillStyle = newTable[x][y].color;
                const CellX = x * this.CELL_WIDTH;
                const CellY = y * this.CELL_HEIGHT;
                ctx.fillRect(CellX, CellY, this.CELL_WIDTH, this.CELL_HEIGHT);
                ctx.strokeRect(CellX, CellY, this.CELL_WIDTH, this.CELL_HEIGHT);
            }
        }
        ctx.strokeStyle = "red";
        ctx.strokeRect(Math.floor(this.GRID_WIDTH / 2) * this.CELL_WIDTH, Math.ceil(this.GRID_HEIGHT / 2 - 1) * this.CELL_HEIGHT, this.CELL_WIDTH, this.CELL_HEIGHT);
        this.table = newTable;
    }
}
let grids = [];
let currentGrid = 0;
let nextGrid;
let newTransitionGrid;
let stateSelection = {
    fromStateIndex: undefined,
    toStateIndex: undefined,
    selectedToState: false,
    setCurrentState: (newState) => {
        let result = null;
        if (newState == stateSelection.toStateIndex || newState == stateSelection.fromStateIndex) {
            if (stateSelection.toStateIndex == undefined)
                return;
            let temp = stateSelection.toStateIndex;
            stateSelection.toStateIndex = stateSelection.fromStateIndex;
            stateSelection.fromStateIndex = temp;
        }
        else {
            if (stateSelection.selectedToState) {
                stateSelection.toStateIndex = newState;
            }
            else {
                stateSelection.fromStateIndex = newState;
            }
            stateSelection.selectedToState = !stateSelection.selectedToState;
            result = !stateSelection.selectedToState;
        }
        return result;
    },
    isValid: () => {
        return stateSelection.fromStateIndex != undefined && stateSelection.toStateIndex != undefined && stateSelection.fromStateIndex != stateSelection.toStateIndex;
    },
    reset: () => {
        stateSelection.toStateIndex = undefined;
        stateSelection.fromStateIndex = undefined;
        stateSelection.selectedToState = false;
    },
};
function drawGrid(gridId) {
    currentGrid = gridId;
    grids[gridId].draw();
    let StateListView = document.getElementById("CurrentStateList");
    StateListView.innerHTML = "";
    grids[gridId].rules.states.forEach((state) => {
        let StateView = getNewStateDOMElement(state.color);
        StateView.addEventListener("click", () => {
            let markedState = document.getElementById("CurrentStateList").getElementsByClassName("MarkedFrom").item(0);
            if (markedState != null)
                markedState.classList.remove("MarkedFrom");
            StateView.classList.add("MarkedFrom");
            document.getElementById("CurrentTransitionsList").innerHTML = "";
            document.getElementById("CurrentTransitionsList").append(...getCurrentTransitionListDOMElement(grids[currentGrid], state, undefined));
        });
        StateListView.appendChild(StateView);
    });
}
function getNewStateDOMElement(color) {
    let StateView = document.createElement("div");
    StateView.classList.add("State");
    StateView.style.backgroundColor = color;
    return StateView;
}
function getCurrentTransitionListDOMElement(grid, from, to) {
    let transList = from.transitions;
    if (to)
        transList = transList.filter((trans) => {
            return trans[1] == to;
        });
    let DOMlist = [];
    transList.forEach((trans) => {
        let nBourCounts = trans[0].split("");
        let transBox = document.createElement("div");
        transBox.classList.add("TransitionBox");
        nBourCounts.forEach((count, stateId) => {
            let stateDom = getNewStateDOMElement(grid.rules.states[stateId].color);
            stateDom.innerText = nBourCounts[stateId];
            transBox.append(stateDom);
        });
        if (!to) {
            transBox.append("\u2192", getNewStateDOMElement(trans[1].color));
        }
        DOMlist.push(transBox);
    });
    return DOMlist;
}
onload = () => {
    let gridCanvas = document.getElementById("MainGrid");
    gridCanvas.getContext("2d").lineWidth = .1;
    //grid function for comfortability
    function grid() {
        return grids[currentGrid];
    }
    addTestGrids(gridCanvas);
    //Set up grid
    gridCanvas.width = grid().GRID_WIDTH * grid().CELL_WIDTH;
    gridCanvas.height = grid().GRID_HEIGHT * grid().CELL_HEIGHT;
    drawGrid(currentGrid);
    //Set up next Grid made by user
    nextGrid = new Grid(new Ruleset([]), gridCanvas);
    //Add State draw functionality
    function gridChangeState(grid, canv, ev) {
        const tableX = Math.floor((ev.pageX - canv.offsetLeft) / grid.CELL_WIDTH);
        const tableY = Math.floor((ev.pageY - canv.offsetTop) / grid.CELL_HEIGHT);
        console.log("x:", tableX, ",y:", tableY);
        const clickedCell = grid.table[tableX][tableY];
        grid.table[tableX][tableY] = grid.rules.states[(grid.getStateIndex(clickedCell) + 1) % grid.rules.states.length];
        grid.draw();
    }
    gridCanvas.addEventListener("mousedown", (ev) => {
        gridChangeState(grid(), gridCanvas, ev);
    });
    document.getElementById("TransitionAdditionGrid").addEventListener("mousedown", (ev) => {
        if (newTransitionGrid != undefined) {
            let temp = newTransitionGrid.table[1][1];
            gridChangeState(newTransitionGrid, document.getElementById("TransitionAdditionGrid"), ev);
            newTransitionGrid.table[1][1] = temp;
            newTransitionGrid.draw();
        }
    });
    //Add nextState functionality
    document.getElementById("TransitionButton").addEventListener("click", () => {
        grid().drawTransition();
    });
    //everything in this function is a giant meme, and I love it
    function firstBlock() {
        let button = document.getElementById("AutomaticTransitionButton");
        button.removeEventListener("click", firstBlock);
        const id = setInterval(() => { grid().drawTransition(); }, 100);
        button.innerText = "StopAutoNext";
        function secondBlock() {
            button.removeEventListener("click", secondBlock);
            clearInterval(id);
            button.innerText = "AutoNext";
            button.addEventListener("click", firstBlock);
        }
        button.addEventListener("click", secondBlock);
    }
    document.getElementById("AutomaticTransitionButton").addEventListener("click", firstBlock);
    //Add reset grid functionality
    document.getElementById("ResetButton").addEventListener("click", () => {
        for (let x = 0; x < grid().GRID_WIDTH; x++) {
            for (let y = 0; y < grid().GRID_HEIGHT; y++) {
                grid().table[x][y] = grid().rules.states[0];
            }
        }
        if (document.getElementById("AutomaticTransitionButton").innerText == "StopAutoNext")
            document.getElementById("AutomaticTransitionButton").click();
        grid().draw();
    });
    //Add "add state" functionality 
    document.getElementById("StateCreationButton").addEventListener("click", () => {
        nextGrid.rules.states.forEach((state) => { state.transitions = []; });
        document.getElementById("nextTransitionList").innerHTML = "";
        let nextStateList = document.getElementById("nextStateList");
        let color = document.getElementById("StateColorSelector").value;
        let transAdderGrid = document.getElementById("TransitionAdditionGrid");
        if (nextGrid.rules.states.length >= 1) {
            newTransitionGrid = new Grid(nextGrid.rules, transAdderGrid);
            newTransitionGrid.GRID_HEIGHT = newTransitionGrid.GRID_WIDTH = 3;
            newTransitionGrid.CELL_HEIGHT = newTransitionGrid.CELL_WIDTH = 100;
            transAdderGrid.width = newTransitionGrid.GRID_WIDTH * newTransitionGrid.CELL_WIDTH;
            transAdderGrid.height = newTransitionGrid.GRID_HEIGHT * newTransitionGrid.CELL_HEIGHT;
            transAdderGrid.classList.add("Grid");
        }
        function updateTransInput() {
            if (newTransitionGrid == undefined)
                return;
            newTransitionGrid.createTable();
            newTransitionGrid.table[1][1] = nextGrid.rules.states[stateSelection.fromStateIndex];
            newTransitionGrid.draw();
        }
        let newState = new State(color);
        newState.transitions = [];
        nextGrid.rules.states.push(newState);
        let StateDOM = getNewStateDOMElement(color);
        let index = nextGrid.rules.states.length - 1;
        StateDOM.addEventListener("click", () => {
            let allDOMElements = document.getElementById("nextStateList").children;
            let changedState = stateSelection.setCurrentState(index);
            if (changedState == null) {
                let state1 = document.getElementById("nextStateList").getElementsByClassName("MarkedFrom").item(0);
                let state2 = document.getElementById("nextStateList").getElementsByClassName("MarkedTo").item(0);
                if (state1 != null && state2 != null) {
                    state1.classList.remove("MarkedFrom");
                    state1.classList.add("MarkedTo");
                    state2.classList.remove("MarkedTo");
                    state2.classList.add("MarkedFrom");
                }
            }
            else {
                let markType = changedState ? "MarkedTo" : "MarkedFrom";
                let otherState = document.getElementsByClassName(markType).item(0);
                if (otherState != null)
                    otherState.classList.remove(markType);
                StateDOM.classList.add(markType);
            }
            document.getElementById("nextTransitionList").innerHTML = "";
            if (stateSelection.isValid())
                document.getElementById("nextTransitionList").append(...getCurrentTransitionListDOMElement(nextGrid, nextGrid.rules.states[stateSelection.fromStateIndex], nextGrid.rules.states[stateSelection.toStateIndex]));
            updateTransInput();
        });
        nextStateList.appendChild(StateDOM);
        StateDOM.click();
    });
    //Add "add transition" functionality
    document.getElementById("TransitionCreationButton").addEventListener("click", () => {
        if (!stateSelection.isValid())
            return;
        let fromState = newTransitionGrid.rules.states[stateSelection.fromStateIndex];
        let transId = fromState.getTransitionID(newTransitionGrid.getNboursByState(1, 1));
        if (fromState.transitions.find((transition) => transition[0] == transId) == undefined) {
            fromState.transitions.push([transId, newTransitionGrid.rules.states[stateSelection.toStateIndex]]);
        }
        document.getElementById("nextTransitionList").innerHTML = "";
        if (stateSelection.isValid())
            document.getElementById("nextTransitionList").append(...getCurrentTransitionListDOMElement(nextGrid, nextGrid.rules.states[stateSelection.fromStateIndex], nextGrid.rules.states[stateSelection.toStateIndex]));
    });
    //Add create Ruleset functionality
    document.getElementById("RulesetCreationButton").addEventListener("click", () => {
        if (nextGrid.rules.states.length < 2)
            return;
        //small workaround. To create the table in the new Grid, I can create a copy of the current next grid by passing it's rules through the grid constructor
        //which creates the table for me
        grids.push(new Grid(nextGrid.rules, gridCanvas));
        let button = document.createElement("button");
        button.innerText = document.getElementById("RulesetNameInput").value;
        let temp = grids.length.valueOf() - 1;
        button.addEventListener("click", () => {
            drawGrid(temp);
            if (document.getElementById("AutomaticTransitionButton").innerText == "StopAutoNext")
                document.getElementById("AutomaticTransitionButton").click();
        });
        document.getElementById("GridSelection").appendChild(button);
        nextGrid = new Grid(new Ruleset([]), gridCanvas);
        stateSelection.reset();
        document.getElementById("RulesetNameInput").value = "";
        document.getElementById("nextStateList").innerHTML = "";
        document.getElementById("TransitionAddition").innerHTML = "<canvas id=\"TransitionAdditionGrid\"></canvas>";
        document.getElementById("nextTransitionList").innerHTML = "";
    });
    //Add delete Ruleset functionality
    document.getElementById("GridDeletionButton").addEventListener("click", () => {
        if (grids.length == 1)
            return;
        grids.splice(currentGrid, 1);
        let gridDomList = document.getElementById("GridSelection");
        gridDomList.removeChild(gridDomList.childNodes.item(currentGrid));
        if (currentGrid > 0)
            drawGrid(currentGrid - 1);
        else
            drawGrid(0);
    });
};
function addTestGrids(gridCanvas) {
    function selectGrid(button) {
        let list = document.getElementById("GridSelection").childNodes;
        for (let i = 0; i < list.length; i++) {
            if (list.item(i) == button) {
                drawGrid(i);
                break;
            }
        }
        if (document.getElementById("AutomaticTransitionButton").innerText == "StopAutoNext")
            document.getElementById("AutomaticTransitionButton").click();
    }
    grids.push(new Grid(GoL(), gridCanvas), new Grid(Seeds(), gridCanvas), new Grid(Wireworld(), gridCanvas));
    let button1 = document.createElement("button");
    button1.innerHTML = "Conway's Game of Life";
    button1.addEventListener("click", () => { selectGrid(button1); });
    let button2 = document.createElement("button");
    button2.innerHTML = "Seeds";
    button2.addEventListener("click", () => { selectGrid(button2); });
    let button3 = document.createElement("button");
    button3.innerHTML = "Wireworld";
    button3.addEventListener("click", () => { selectGrid(button3); });
    document.getElementById("GridSelection").appendChild(button1);
    document.getElementById("GridSelection").appendChild(button2);
    document.getElementById("GridSelection").appendChild(button3);
}
