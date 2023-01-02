import { CoElement } from "./CoElement";

/**
 * A Get is a function that can be passed as a paremeter to this.get().
 * It is called when the component is available once.
 */
export type Get<T extends CoElement=CoElement> = (component:T)=>any;



