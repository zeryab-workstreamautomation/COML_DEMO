import { Coml } from "./Coml";
import { Converter } from "./Converter";
import { Render } from "./Render";
import { TargetNode } from "./TargetNode";
import { This } from "./This";


export interface CoElement<T extends This=This> extends Coml {

    /**
     * An optional method - if implemented, will ba called when an invalidate with 'forget' is called on an existing Component.
     * The component should implement logic to reset any cached state.
     */
    forget?() : void;

    /**
     * Return this component's converter.
     */
    getCvt() : Converter<T>;

    /**
     * Return this converter's TargetNode
     */
    getTN() : TargetNode;

    /**
     * Override if you need to be called on onAfterRendering(). ref is this control's domref
     * 
     * @param ref 
     */
    onPostRender?(node: any);

    /**
     * Override if you need to be called on before rendering starts. 
     * @param ref 
     */
    onPreRender?();


    onRender(rm: Render);

    cleanup?();


}

export function isCoElement(pot:any) : pot is CoElement<any> {
    return pot && typeof pot == 'object' && 'onRender' in pot;
}