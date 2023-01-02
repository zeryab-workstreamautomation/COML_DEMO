import { CoElement } from "../../coml/CoElement";
import { CoElementFactory } from "../../coml/CoElementFactory";
import { Converter } from "../../coml/Converter";
import { BaseCoElement } from "../../coml/element/BaseCoElement";
import { Render } from "../../coml/Render";
import { TargetNode, getAttr, ctn } from "../../coml/TargetNode";
import { This } from "../../coml/This";


/**
 * Displays an error/success message
 * 
 */
class ErrorElement extends BaseCoElement {


    constructor(cvt:Converter<This>,tn:TargetNode) {
       super(cvt,tn);
    }



    protected errorAsText(error:string|Error) : string {
        if (typeof error=='string')
            return error;
        if (typeof error.message == 'string')
            return error.message;
    }

    /**
     * Adds an message to the code.
     * 
     * @param message The string or thrown error to show.
     * @param errtype If the error happened at compile or run time.
     */
    public setMessage(message?:string|Error,errtype?:'compile'|'run'|'success') {
        const {cvt,tn} = ctn(this);
        let ctag:Element=tn.tnode as Element;
        if (!message) {
            // remove
            let etag=ctag.querySelector('div.u-code-error');
            if (etag) {
                etag.remove();
            }
        } else {
            let etag=ctag.querySelector('div.u-code-error');
            if (!etag) {
                etag=document.createElement('div');
                etag.className='';
                ctag.appendChild(etag);
            }
            etag.classList.add('u-code-error');
            etag.classList.add(errtype);
            etag.textContent=this.errorAsText(message);
            window.setTimeout(()=>{
                etag.classList.add('u-fade');
            },2000);
        }
        
    }

    onRender(rm: Render) {
        rm.openStart('div',this)
        .class('u-co-error')
        .copyAttrExcept(this)
		.openEnd()

        .close('div');
    }

}

/**
 * The factory class is registered into the UI5Converter, example when imported via a script in the <head>
 * 
 * ```
 * <head>
    <script>
        this.import('demo/element/CoError');
    </script>
  </head> 
 * ```
 * 
 */
  export default class CoErrorFactory implements CoElementFactory {
    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('co-error', this);
    }

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new ErrorElement(cvt, tn);
    }

}

