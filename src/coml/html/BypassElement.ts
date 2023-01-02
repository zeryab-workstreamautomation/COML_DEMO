import { CoElement } from "../CoElement";
import { Converter } from "../Converter";
import { Render } from "../Render";
import { TargetNode } from "../TargetNode";
import { This } from "../This";
import { HtmlElement, HtmlElementFactory } from "./HtmlElement";

/**
*   Bypasses the current node entirely - but its children are rendered to html
*/
class BypassElement extends HtmlElement {
    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
    }

    protected start(rm: Render,cvt: Converter<This>,elem:Element) {
    }

    protected end(rm: Render,cvt: Converter<This>,elem:Element) {
    }
}

/**
* bypasses the current node entirely - its children are rendered to html
*/
export class BypassElementFactory extends HtmlElementFactory {
   

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new BypassElement(cvt,tn) ;
    }

}