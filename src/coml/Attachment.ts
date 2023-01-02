import { AssetID } from "./Asset";
import { Dependency } from "./Dependency";

/**
 * An Attachment implements the connection of a COML Asset to the tdom.
 */
export interface Attachment {

    /**
     * Attaches `toInsert` (an asset) to the given tdom element.
     * 
     * @param element 
     * @param toInsert 
     */
    attach(element:Element,toInsert:string|AssetID);

    /**
     * Detach the previously attached from the tdom
     */
    detach();


    /**
     * Add a new dependency
     * 
     * @param dep 
     * @returns 
     */
     addDependency(dep:Dependency) : Promise<any>;

     removeDependency(dep:Dependency);
}