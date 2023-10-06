export class Ruleset {
    /**
     * the first element in the array is the default state, which fills the beginning of the grid at the start
     */
    states;
    constructor(states) {
        this.states = states;
    }
}
