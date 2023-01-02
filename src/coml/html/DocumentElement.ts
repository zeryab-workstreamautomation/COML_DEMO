import { CoElement } from "../CoElement";
import { Converter } from "../Converter";
import { Render } from "../Render";
import { TargetNode } from "../TargetNode";
import { This } from "../This";
import { HtmlElement, HtmlElementFactory } from "./HtmlElement";

/**
*   DocumentElement handles a document node. It is rendered as a <div>

    @deprecated - not used. The document node is now handled by the This object.
*/
class DocumentElement extends HtmlElement {
    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
    }

    protected start(rm: Render,cvt: Converter<This>,elem:Element) {
        rm.openStart('div',this)
        .class('u-document');
        if ((elem instanceof Document) && (elem as Document).body) {
            cvt.copyAttrExcept(rm, (elem as Document).body,['id'],this.tn);
        }


        rm.openEnd();
    }

    protected end(rm: Render,cvt: Converter<This>,elem:Element) {
        rm.close('div');
    }

    onPostRender(ref: any) {
        if (this.cvt) {
            Promise.resolve()
            .then(()=>{
                this.cvt.onAfterRender();
            });
        }
    }
}

/**
* 
*/
export class DocumentElementFactory extends HtmlElementFactory {
   

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new DocumentElement(cvt,tn) ;
    }

}