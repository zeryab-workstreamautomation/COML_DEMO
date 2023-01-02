import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { BaseCoElement } from "../element/BaseCoElement";
import { Render } from "../Render";
import { TargetNode } from "../TargetNode";
import { This } from "../This";

/**
 * executes any <script> tags in the context of the ConverterImpl's 'This' object.
 */
 export class ScriptElement  extends BaseCoElement {

    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
    }


    onRender(rm: Render): void {
        let script:string;
        for (let i = 0; i < this.tn.snode.childNodes.length; i++) {
            let cn=this.tn.snode.childNodes[i];

            if (cn.nodeType==Node.TEXT_NODE) {
                //console.log(cn.nodeValue);
                if (!script)
                    script=cn.nodeValue;
                else 
                    script+=('\n'+cn.nodeValue);
            }
        }

        
        if (script) {
            this.cvt.executeScript(script);
        }
    }

}



/**
 * executes any <script> tags in the context of the ConverterImpl's 'This' object.
 */
 export class ScriptElementFactory  implements CoElementFactory {

    registerFactory(cvt: Converter<This>) {
        
    }


    makeComponent(tn: TargetNode,cvt:Converter<This>): CoElement {
        return new ScriptElement(cvt,tn);
    }

}
