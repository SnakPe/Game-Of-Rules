import { State,Transition } from "./State"
export class Cell{
    state : State
    neighbours: Cell[]
    constructor(state:State){
        this.state = state
        this.neighbours = []
    }

    /**
     * this function creates the {@link getTransitionID} function.
     * since {@link totalNumOfStates} can only be known by the Grid class, i use this factory-type function to create {@link getTransitionID}
     * @see {@link getTransitionID} for more information
     * @param totalNumOfStates total number of states in the grid
     */
    createGetTransitionID(totalNumOfStates : number){
        this.getTransitionID = () => {
            let cumulativeNboursAmount = []
            for(let i = 0; i < totalNumOfStates;i++)cumulativeNboursAmount.push(0)
            this.neighbours.forEach((nbour) => {
                if(cumulativeNboursAmount[nbour.state.index] == undefined)cumulativeNboursAmount[nbour.state.index] = 0
                cumulativeNboursAmount[nbour.state.index]++
            })
            let transID = ""
            cumulativeNboursAmount.forEach((amount) => {
                if(amount == undefined)transID += "0"
                else transID += amount.toString()
            })
            return transID
        }
    }

    /**
     * 
    * the transition ID is comprised by a digit per State, so that the digit describes the amount of neighnours of that state.
    * The digits are sorted according to the order in the status array in the ruleset to which this status belongs
    * 
    * since getTransitionID needs to know the total number of states in the grid, it is defined in {@link createGetTransitionID}
    * 
    */
    getTransitionID: () => string

    getNextState(){
        const transID = this.getTransitionID()
        let transition = this.state.transitions.find((trans) => {
            return trans[0] == transID
        })
        return transition == undefined ? this.state : transition[1]
    }
    
}