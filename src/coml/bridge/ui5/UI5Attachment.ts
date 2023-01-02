import { AssetID } from "../../Asset";
import { Patch } from "../../Patch";
import { AttachmentImpl } from "../../impl/AttachmentImpl";
import { Implementations } from "../../Implementations";
import { extendUI5 } from "./UI5ControlClass";


export interface UI5Bridge {
    //setCvt(cvt:Converter);
}

/**
 * An Attachment implementation for UI5. 
 * 
 * @see https://openui5.org/
 * 
 * UI5 controls require a top level ui5 parent control of which they are the children. 
 * 
 * This attachment implementation builds a custom singleton control (the bridge), attaches it to the attachment element
 * in the tdom. This control then renders the COML in its 'onRender()' method, which eventually renders the
 * COML created UI5 controls, so UI5 sees the expected parent / child control rendering behaviour
 * 
 * Strategy: Attach the bridge control to the attachment point using the UI5 placeAt. 
 * Load the coElement asset and when loaded, render it inside the bridge's onRender(). At this point
 * the bridge doesnt have a dom reference, so just store the rendered element. When the bridge's onPostRender() 
 * is called, append this element to the bridge's dom element.
 * 
 */
export class UI5Attachment extends AttachmentImpl {
    protected static bridge : sap.ui.core.Control;
    protected rendered:Node; 
    protected count:number=0;


    public static getBridge() : sap.ui.core.Control {
        return UI5Attachment.bridge;
    }

    protected createPatch(tnode:Node,element:Element) {
        let that=this;
        return new (class implements Patch {
            restorePosition(elem: Node) {
                if (!that.rendered) {
                    // ui5 rerenderig 
                    // do nothing except save the rendered node as the UI5 element will attach rendered to the parent bridge
                    that.rendered=elem;
                } else {
                    // ui5 is not rerending (onPreRender was not called)
                    // so just patch the newly created elem back to the bridge's dom ref
                    let top=UI5Attachment.getBridge();
                    if (top) {
                        let parent:Element=top.getDomRef();
                        if (parent.children.length) {
                            parent.innerHTML="";
                        }
                        parent.appendChild(elem);
                    }
                    else {
                        console.error(`UI5Attachment - Cannot patch back rerendered element to the bridge`);
                    }
                } 
            }

        })();
    }

    onPreRender() {
        this.rendered=null;
    }


    onRender(rm:sap.ui.core.RenderManager) {
        console.warn(`--------------bridge render #${this.count++}---------`);
        rm.openStart('div',UI5Attachment.getBridge())
        .class('u-coml-ui5bridge')
        .openEnd();

        if (this.coElement) {
            let r=Implementations.createRender(this.coElement.getTN().getPatch());
            this.coElement.getCvt().renderNode(r,this.coElement.getTN());
        }

        rm.close('div');
    }

    onPostRender(ref:Element){
        if (this.rendered)
            ref.appendChild(this.rendered);
    }

    
    protected static makeBridgeControl(attachment: UI5Attachment,element: Element,toInsert: string | AssetID) : sap.ui.core.Control {
        let ControlClass=extendUI5("coml.UI5Bridge");//(sap.ui.core.Control as any).extend("coml.UI5Bridge",Object.assign({},UI5Control));

        UI5Attachment.bridge= new (class extends ControlClass implements UI5Bridge {

            constructor() {
                super();

                // delegate UI5 rendering back to the attachment
                this.setControlOptions({
                    onPreRender:()=>attachment.onPreRender(),
                    onRender: (rm)=>attachment.onRender(rm),
                    onPostRender:(ref:any)=>attachment.onPostRender(ref),
                });
            }
            /*
            setCvt(cvt:Converter) {
                this.cvt=cvt;
            }*/
        })() as any;

        return UI5Attachment.bridge;
    }

    
    public attach(element: Element, toInsert: string | AssetID) {
        let top=UI5Attachment.getBridge();

        if (!top){
            // deosnt yet exist - create our signeleton at placeAt the element
            top=UI5Attachment.makeBridgeControl(this,element,toInsert);
            top.placeAt(element);
        }

        this.makeCoElement(element,toInsert)
        .then((value)=>{
            this.handleAttach(value);
            this.coElement=value;
            top.invalidate();
        })
    }

}