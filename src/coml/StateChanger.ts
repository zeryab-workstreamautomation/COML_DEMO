
/**
 * A state changer is a function that can be called during tnode generation to apply (and reapply)
 * state changes (attribute changes, event listeners, etc).
 */
export type StateChanger = (tnode:Element)=>any;


/**
 * A set of state changers stored by logical change id. 
 */
export interface StateChangers {
    [changeid:string]:StateChanger;
}
