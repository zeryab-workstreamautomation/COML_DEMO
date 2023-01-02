import { AssetID } from "./Asset";
import { CoElement } from "./CoElement";
import { TargetNode } from "./TargetNode";

/**
 * A function that is used to evaluate the attributes that are in the source element.
 */
export type GetAttrT = (attr:string)=>string;

/**
 * The 'this' object that is available inside the coml scripts as 'this'
 * It represents a CoElement that renders content from an Html Asset.
 */
 export interface This extends CoElement {

    /**
     * Parameters can include any objects. They are used to supply parameters to a CoElement template.
     * Use getAttr() to access parameters.
     * 
     * `this.getAttr('xyz')` will first read this.parameters[xyz] before reading <ws-element xyz="somvevalue">.
     */
	parameters:any;


    getId() : string;


    /**
     * The source document.
     */
    document:Document;
    


    /**
     * Import a COML factory.
     * 
     * @param importee The fully qualified path to a COML CoElementFactory (e.g. `coml/element/CoFields`) or the assetId of a COML page.
     * @param tagForAsset optional, required only if importee is an assetId. The tag to use for this asset's CoElement
     */
    import(importee:string|AssetID,tagForAsset?:string) : Promise<any>;

    /**
     * Installs a callback that is called after rendering is complete.
     * @param cb 
     */
    onAfterRender(cb:()=>void) : void;

    /**
     * Returns the source document
     */
    getSourceDocument():Document;


}