export class State {
    /**
     * if no transition is found, assume that the state "transitions" to itself again
     */
    transitions;
    color;
    index;
    constructor(color = "#1d1a1a", trans = [], index) {
        this.color = color;
        this.transitions = trans;
        if (index != undefined)
            this.index = index;
    }
}
