 /**
* saved as[transitionId,nextState]
*/
export type Transition = [string,State]
export class State{
   /**
    * if no transition is found, assume that the state "transitions" to itself again
    */
   transitions: Transition[]
   color: string

   constructor(color = "#1d1a1a",trans:Transition[] = []){
       this.color = color
       this.transitions = trans
   }

   /**
    * the transition ID is comprised by a digit per State, so that the digit describes the amount of neighnours of that state
    * The digits are sorted according to the order in the status array in the ruleset to which this status belongs   
    * 
    * @param nboursByState 
    * @returns 
    */
   getTransitionID(nboursByState: number[]){
       let transID = ''
       nboursByState.forEach((nbours) => {
           transID += nbours.toString()
       })
       return transID.toString()
   }
   getNextState(nboursByState: number[]){
       const transID = this.getTransitionID(nboursByState)
       let transition = this.transitions.find((trans) => {
          return trans[0] == transID
       })
       return transition == undefined ? this : transition[1]
   }

   /*addTransition(transID:String, nextState: State):void;
   addTransition(nboursByState: number[], nextState: State):void;

   addTransition(nboursOrId:any, nextState: State):void{
       switch (typeof(nboursOrId)) {
           case "object":
               if(nboursOrId.constructor === Array)
                   this.transitions.push([this.getTransitionID(nboursOrId),nextState])
               else
                   console.log("Error: transition should be number[], but is not an Array")
               break;
           case "number":
               this.transitions.push([nboursOrId.toString(),nextState])
               break;
           case "string":
               this.transitions.push([nboursOrId,nextState])
               break;
           default:
               console.log("Error: transition element has wrong type: " + typeof(nboursOrId))
       }

   }*/
   

   
}