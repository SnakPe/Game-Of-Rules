export class State {
    /**
     * if no transition is found, assume that the state "transitions" to itself again
     */
    transitions;
    color;
    constructor(color = "#1d1a1a", trans = []) {
        this.color = color;
        this.transitions = trans;
    }
    /**
     * the transition ID is comprised by a digit per State, so that the digit describes the amount of neighnours of that state
     * The digits are sorted according to the order in the status array in the ruleset to which this status belongs
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
