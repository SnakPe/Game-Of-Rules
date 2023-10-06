import {Grid} from "./Grid.js";
import {Ruleset} from "./Ruleset.js";
import {Transition, State} from "./State.js";

const GoL = function(){
    let alive = new State("#d87070", [])
    let dead = new State(undefined, [])
    const transitionsDeadCell: Transition[] =
        [
            ["53", alive]
        ], transitionsAliveCell: Transition[] =
        [
            ["08", dead],
            ["17", dead],
            ["26", dead],
            ["35", dead],
            ["44", dead],
            ["71", dead],
            ["80", dead]
        ];
    alive.transitions = transitionsAliveCell
    dead.transitions = transitionsDeadCell
    
    return new Ruleset([dead, alive]) 
}
const Seeds = function(){
    let alive = new State("#0099ff", [])
    let dead = new State(undefined, [])
    const transitionsDeadCell: Transition[] =
        [
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
    ]
    dead.transitions = transitionsDeadCell
    
    return new Ruleset([dead, alive]) 
}
/**
 * https://en.wikipedia.org/wiki/Wireworld
 */
const Wireworld = function(){
    let empty = new State("#000000",[])
    let head = new State("blue",[])
    let tail = new State("orange",[])
    let cable = new State("yellow",[])

    const transitionsHeadCell : Transition[] = []
    const transitionsTailCell : Transition[] = []
    const transitionsCableCell : Transition[] = []
    for(let emptyNbours = 8; emptyNbours >= 0;emptyNbours--){
        for(let cableNbours = 8 - emptyNbours; cableNbours >= 0;cableNbours--){
            for (let headNbours =  8 - emptyNbours - cableNbours ; headNbours >= 0; headNbours--) {
                let tailNbours = 8 - emptyNbours - cableNbours - headNbours 
                const transID = emptyNbours.toString() + cableNbours + headNbours + tailNbours
                transitionsHeadCell.push([transID,tail])
                transitionsTailCell.push([transID,cable])
                if(headNbours == 1 || headNbours == 2)transitionsCableCell.push([transID,head])
            }
        }
    }
    head.transitions = transitionsHeadCell
    tail.transitions = transitionsTailCell
    cable.transitions = transitionsCableCell
    return new Ruleset([empty,cable,head,tail])
}



let grids : Grid[] = []

let currentGrid = 0

let nextGrid : Grid
let newTransitionGrid : Grid
let stateSelection:{toState : State|undefined, fromState : State|undefined, selectedToState:boolean, setCurrentState:(newState:State) => null|boolean, isValid:() => boolean, reset:() => void, updateUI : () => void} = {
    fromState : undefined,
    toState : undefined,
    selectedToState : false,
    setCurrentState : (newState:State) => {
        let result : boolean = null 
        if(newState == stateSelection.toState || newState == stateSelection.fromState) {
            if (stateSelection.toState == undefined) return
            let temp = stateSelection.toState
            stateSelection.toState = stateSelection.fromState
            stateSelection.fromState = temp
        }
        else {
            if (stateSelection.selectedToState){
                stateSelection.toState = newState
            }else{
                stateSelection.fromState = newState
            }
            result = stateSelection.selectedToState
            stateSelection.selectedToState = !stateSelection.selectedToState
        }
        return result
    },
    isValid : () => {
        return stateSelection.fromState != undefined && stateSelection.toState != undefined && stateSelection.fromState != stateSelection.toState
    },
    reset : () => {
        stateSelection.toState = undefined
        stateSelection.fromState = undefined
        stateSelection.selectedToState = false
    },
    updateUI : () => {
        const stateList = document.getElementById("nextStateList")
        //TODO
    }
}

function showGrid(gridIndex: number){
    currentGrid = gridIndex
    grids[gridIndex].draw()

    let StateListView = document.getElementById("CurrentStateList") as HTMLDivElement
    StateListView.innerHTML = ""

    grids[gridIndex].rules.states.forEach((state) => {
        let StateView = getNewStateDOMElement(state.color)
        StateView.addEventListener("click",() => {
            let markedState = document.getElementById("CurrentStateList").getElementsByClassName("MarkedFrom").item(0)
            if(markedState != null)markedState.classList.remove("MarkedFrom")
            StateView.classList.add("MarkedFrom")
            document.getElementById("CurrentTransitionsList").innerHTML = ""
            document.getElementById("CurrentTransitionsList").append(...getCurrentTransitionListDOMElement(grids[currentGrid],state,undefined))
        })
        StateListView.appendChild(StateView)
    })
}
function getNewStateDOMElement(color : string){
    let StateView = document.createElement("div")
    StateView.classList.add("State")
    StateView.style.backgroundColor = color
    return StateView
}

function getCurrentTransitionListDOMElement(grid:Grid, from?:State,to?:State){
    
    let transList = from.transitions
    if(to)transList = transList.filter((trans) => {
        return trans[1] == to
    })
    let DOMlist = [] as Node[]
    transList.forEach((trans) => {
        let nBourCounts = trans[0].split("")
        let transBox = document.createElement("div")
        transBox.classList.add("TransitionBox")
        nBourCounts.forEach((count,stateId) => {
            let stateDom = getNewStateDOMElement(grid.rules.states[stateId].color)
            stateDom.innerText = nBourCounts[stateId]
            transBox.append(stateDom)
        })
        if(!to){
            transBox.append("\u2192",getNewStateDOMElement(trans[1].color))
        }
        DOMlist.push(transBox)
    })
    return DOMlist
}

onload = () => {
    let gridCanvas = document.getElementById("MainGrid") as HTMLCanvasElement
    gridCanvas.getContext("2d").lineWidth = .1
    //grid function for comfortability
    function grid(){
        return grids[currentGrid]
    }

    addTestGrids(gridCanvas)

    //Set up grid
    gridCanvas.width = grid().GRID_WIDTH * grid().CELL_WIDTH
    gridCanvas.height = grid().GRID_HEIGHT * grid().CELL_HEIGHT

    showGrid(currentGrid)
    
    //Set up next Grid made by user
    nextGrid = new Grid(new Ruleset([]),gridCanvas)
    

    //Add State draw functionality
    function changeGridCell(grid:Grid,canv : HTMLCanvasElement, ev:MouseEvent){
        const tableX = Math.floor((ev.pageX - canv.offsetLeft)/grid.CELL_WIDTH)
        const tableY = Math.floor((ev.pageY - canv.offsetTop)/grid.CELL_HEIGHT)
        const clickedCell = grid.table[tableX][tableY]
        grid.table[tableX][tableY] = grid.rules.states[(grid.getStateIndex(clickedCell) + 1) % grid.rules.states.length]
        grid.drawCell(tableX,tableY)
    }

    gridCanvas.addEventListener("mousedown",(ev) => {
            changeGridCell(grid(),gridCanvas,ev)
    })
    document.getElementById("TransitionAdditionGrid").addEventListener("mousedown",(ev) => {
        if(newTransitionGrid != undefined){
            let temp = newTransitionGrid.table[1][1]
            changeGridCell(newTransitionGrid,document.getElementById("TransitionAdditionGrid") as HTMLCanvasElement, ev)
            newTransitionGrid.table[1][1] = temp
            newTransitionGrid.draw()
        }
    })

    //Add nextState functionality
    document.getElementById("TransitionButton").addEventListener("click", () => {
        grid().drawTransition()
    })

    //everything in this function is a giant meme, and I love it
    function firstBlock(){
        let button = document.getElementById("AutomaticTransitionButton")
        button.removeEventListener("click",firstBlock)
        const id = setInterval(() => {grid().drawTransition()}, 100)
        button.innerText = "StopAutoNext"
        function secondBlock(){
            button.removeEventListener("click",secondBlock)
            clearInterval(id)
            button.innerText = "AutoNext"
            button.addEventListener("click",firstBlock)
        }
        button.addEventListener("click",secondBlock)
    }
    document.getElementById("AutomaticTransitionButton").addEventListener("click",firstBlock)
    
    //Add reset grid functionality
    document.getElementById("ResetButton").addEventListener("click",() => {
        for(let x = 0; x < grid().GRID_WIDTH; x++){
            for(let y = 0; y < grid().GRID_HEIGHT; y++){
                grid().table[x][y] = grid().rules.states[0]
            }
        }
        if(document.getElementById("AutomaticTransitionButton").innerText == "StopAutoNext")document.getElementById("AutomaticTransitionButton").click()
        grid().draw()
    })
 
    //Add "add state" functionality 
    document.getElementById("StateCreationButton").addEventListener("click",() => {
        nextGrid.rules.states.forEach((state) => {state.transitions = []})
        document.getElementById("nextTransitionList").innerHTML = ""

        let nextStateList = document.getElementById("nextStateList") as HTMLDivElement
        let color = (document.getElementById("StateColorSelector") as HTMLInputElement).value

        let transAdderGrid = document.getElementById("TransitionAdditionGrid") as HTMLCanvasElement
        if(nextGrid.rules.states.length >= 1){
            newTransitionGrid = new Grid(nextGrid.rules,transAdderGrid)

            newTransitionGrid.GRID_HEIGHT = newTransitionGrid.GRID_WIDTH = 3
            newTransitionGrid.CELL_HEIGHT = newTransitionGrid.CELL_WIDTH = 50

            transAdderGrid.width = newTransitionGrid.GRID_WIDTH * newTransitionGrid.CELL_WIDTH
            transAdderGrid.height = newTransitionGrid.GRID_HEIGHT * newTransitionGrid.CELL_HEIGHT

            transAdderGrid.classList.add("Grid")
        }
        function updateTransInput(){
            if(newTransitionGrid == undefined)return;
            
            newTransitionGrid.createTable()
            newTransitionGrid.table[1][1] = stateSelection.fromState

            newTransitionGrid.draw()
        }

        let newState = new State(color)
        newState.transitions = []
        nextGrid.rules.states.push(newState)

        let StateDOM = getNewStateDOMElement(color)
        StateDOM.addEventListener("click",() => {
            const allDOMElements = (document.getElementById("nextStateList") as HTMLDivElement).childNodes

            let index:number;
            allDOMElements.forEach((DOMElement,i) => {
                if(DOMElement == StateDOM){
                    index = i;
                    return
                }
            })
            let changedState = stateSelection.setCurrentState(nextGrid.rules.states[index])

            if(changedState == null) {
                let state1 = document.getElementById("nextStateList").getElementsByClassName("MarkedFrom").item(0) as HTMLDivElement
                let state2 = document.getElementById("nextStateList").getElementsByClassName("MarkedTo").item(0) as HTMLDivElement
                if (state1 != null && state2 != null) {
                    state1.classList.remove("MarkedFrom")
                    state1.classList.add("MarkedTo")
                    state2.classList.remove("MarkedTo")
                    state2.classList.add("MarkedFrom")
                }
            }
            else {
                let markType = changedState ? "MarkedTo" : "MarkedFrom"
                let otherState = document.getElementById("nextStateList").getElementsByClassName(markType).item(0)
                if (otherState != null) otherState.classList.remove(markType)
                StateDOM.classList.add(markType)
            }
            document.getElementById("nextTransitionList").innerHTML = ""
            if(stateSelection.isValid())document.getElementById("nextTransitionList").append(...getCurrentTransitionListDOMElement(nextGrid,stateSelection.fromState,stateSelection.toState))
            updateTransInput()
        })
        nextStateList.appendChild(StateDOM)

        StateDOM.click()
        
        
    })
    
    //Add "add transition" functionality
    document.getElementById("TransitionCreationButton").addEventListener("click",() => {
        if(!stateSelection.isValid())return
        const fromState = stateSelection.fromState
        const transId = fromState.getTransitionID(newTransitionGrid.getNboursByState(1,1))
        if(fromState.transitions.find((transition) => transition[0] == transId) == undefined){
            fromState.transitions.push([transId,stateSelection.toState])
            document.getElementById("nextTransitionList").innerHTML = ""
            document.getElementById("nextTransitionList").append(...getCurrentTransitionListDOMElement(nextGrid,stateSelection.fromState,stateSelection.toState))
            
        }
    })

    //Add create Ruleset functionality
    document.getElementById("RulesetCreationButton").addEventListener("click",() => {
        if(nextGrid.rules.states.length < 2)return
        //small workaround. To create the table in the new Grid, I can create a copy of the current next grid by passing it's rules through the grid constructor
        //which creates the table for me
        grids.push(new Grid(nextGrid.rules,gridCanvas))

        //Create new Button
        let button = document.createElement("button")
        button.innerText = (document.getElementById("RulesetNameInput") as HTMLInputElement).value
        button.addEventListener("click", (ev) => {
            let index: number;
            document.getElementById("GridSelection").childNodes.forEach((gridButton,i) => {
                if(gridButton == button)index = i
            })
            showGrid(index)
            if(document.getElementById("AutomaticTransitionButton").innerText == "StopAutoNext")document.getElementById("AutomaticTransitionButton").click()
        })
        document.getElementById("GridSelection").appendChild(button)

        //reset the ruleset creator 
        nextGrid = new Grid(new Ruleset([]),gridCanvas);
        stateSelection.reset();
        (document.getElementById("RulesetNameInput") as HTMLInputElement).value = ""
        document.getElementById("nextStateList").innerHTML = ""
        document.getElementById("TransitionAddition").innerHTML = "<canvas id=\"TransitionAdditionGrid\"></canvas>"
        document.getElementById("TransitionAdditionGrid").addEventListener("mousedown",(ev) => {
            if(newTransitionGrid != undefined){
                let temp = newTransitionGrid.table[1][1]
                changeGridCell(newTransitionGrid,document.getElementById("TransitionAdditionGrid") as HTMLCanvasElement, ev)
                newTransitionGrid.table[1][1] = temp
                newTransitionGrid.draw()
            }
        })
        document.getElementById("nextTransitionList").innerHTML = ""
    })

    //Add delete Ruleset functionality
    document.getElementById("GridDeletionButton").addEventListener("click",() => {
        if(grids.length == 1)return
        grids.splice(currentGrid,1)
        let gridDomList = document.getElementById("GridSelection")
        gridDomList.removeChild(gridDomList.childNodes.item(currentGrid))
        if(currentGrid > 0)showGrid(currentGrid-1)
        else showGrid(0)
    })
} 

function addTestGrids(gridCanvas : HTMLCanvasElement){
    function selectGrid(button : HTMLButtonElement){
        let list = document.getElementById("GridSelection").childNodes as NodeListOf<HTMLButtonElement>
        for(let i = 0; i < list.length;i++) {
            if (list.item(i) == button){
                showGrid(i)
                break
            }
        }
        if(document.getElementById("AutomaticTransitionButton").innerText == "StopAutoNext")document.getElementById("AutomaticTransitionButton").click()
    }

    grids.push(new Grid(GoL(),gridCanvas), new Grid(Seeds(),gridCanvas), new Grid(Wireworld(),gridCanvas))
    let button1 = document.createElement("button")
    button1.innerHTML = "Conway's Game of Life"
    button1.addEventListener("click", () => {selectGrid(button1)})
    let button2 = document.createElement("button")
    button2.innerHTML = "Seeds"
    button2.addEventListener("click", () => {selectGrid(button2)})
    let button3 = document.createElement("button")
    button3.innerHTML = "Wireworld"
    button3.addEventListener("click", () => {selectGrid(button3)})

    document.getElementById("GridSelection").appendChild(button1)
    document.getElementById("GridSelection").appendChild(button2)
    document.getElementById("GridSelection").appendChild(button3)
}