 /**
* saved as[neighbourArray,nextState]
*/
export type Transition = [string,State]
export class State{
   /**
    * if no transition is found, assume that the state "transitions" to itself again
    */
    transitions: Transition[]
    color: string
    
    index:number
    constructor(color = "#1d1a1a",trans:Transition[] = [],index? : number){
       this.color = color
       this.transitions = trans
       if(index != undefined)this.index = index
    }
}