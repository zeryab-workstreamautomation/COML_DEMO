import { CoElement } from "../../CoElement";
import { CoElementFactory } from "../../CoElementFactory";
import { Converter } from "../../Converter";
import { BaseCoElement } from "../../element/BaseCoElement";
import { Render } from "../../Render";
import { ctn, getAttr, TargetNode } from "../../TargetNode";
import { This } from "../../This";
import { UI5Attachment } from "./UI5Attachment";
import { extendUI5 } from "./UI5ControlClass";


export class UI5CoElement extends BaseCoElement {
    protected control:sap.ui.core.Control;
    //protected settings={};

    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
    }

    public getControl() {
        return this.control;
    }

    protected getScriptText(scriptElem:Node) {
        let script:string;
        for (let i = 0; i < scriptElem.childNodes.length; i++) {
            let cn=scriptElem.childNodes[i];

            if (cn.nodeType==Node.TEXT_NODE) {
                //console.log(cn.nodeValue);
                if (!script)
                    script=cn.nodeValue;
                else 
                    script+=('\n'+cn.nodeValue);
            }
        }
        return script;
    }

    /**
     * Fetch settings from any <scrip> block of our snode.
     * 
     * @returns the Settings object needed to initialize the UI5 Control that we will host
     */
    protected getSettings() {
        const {tn,cvt} = ctn(this);

        let script;
        for(let i=0;i<(tn.snode as Element).children.length;i++) {
            if ((tn.snode as Element).children[i].tagName.toLowerCase()=='script') {
                script=this.getScriptText((tn.snode as Element).children[i]);
            }
        }


        
        let settings={};
        if (script) {
            (cvt.getThis() as any).settings=(incoming)=>{
                settings=incoming;
            }
            cvt.executeScript(script);
        }
        return settings;
    }

   

    protected renderUI5Control(rm:Render,control:sap.ui.core.Control,onControlDomRefAvailable:(domRef:Element)=>any,dontCopyAttrToCtrl?:boolean) {
        let oCore = sap.ui.getCore();
        let oRenderManager:sap.ui.core.RenderManager = oCore.createRenderManager();
        oRenderManager.renderControl(control);
        let dummy:HTMLDivElement=document.createElement('div');
        if (!control.getDomRef()) { // first time, only the RM has the dom ref, so flush to a dummy
            try {
                oRenderManager.flush(dummy as any,false,true);
            } catch(x) {
                // this exception happens on sap.m.MultiComboBox. The Tokenizer tries to install a listener but the element is ref is null.
                // ignoring the error seems to work
                console.error(x);
            }
            if (dummy.children.length>0) {
                let rendered=dummy.children[0];
                rendered.remove();
                onControlDomRefAvailable(rendered);
                if (!dontCopyAttrToCtrl)
                    this.getCvt().copyAttrExceptToTNode(rendered,this.getTN().snode,['id','class']);
        
                rm.insertRendered(rendered);
            }
        } else {
            oRenderManager.flush(dummy as any,false,true); // doesnt do anything 
            onControlDomRefAvailable(control.getDomRef());
            rm.insertRendered(control.getDomRef());
        }
        oRenderManager.destroy();
    }

    protected static WrapperClass:any;
    protected controlOrItsWrapper:sap.ui.core.Control;

    protected static wrapperClass() {
        if (!UI5CoElement.WrapperClass)
            UI5CoElement.WrapperClass=extendUI5("coml.UI5WRapper");//(sap.ui.core.Control as any).extend("coml.UI5WRapper",Object.assign(UI5Control));

        return UI5CoElement.WrapperClass;
    }

    /**
     * WRap the actual control by one that stops the invalidation() of controls to propagate to the top level bridge,
     * which causes a repaint of the entire COML app. We set display:contents on our element so that the wrapping has no affect as 
     * far as html layouting is concerned.
     * 
     * @param towrap 
     * @returns 
     */
    protected wrapControl(towrap:sap.ui.core.Control) {
        let WrapperClass=UI5CoElement.wrapperClass();

        let wrapper:sap.ui.core.Control=new (class extends WrapperClass {
            
            constructor() {
                super();

                this.renderCount=0;

                // delegate UI5 rendering back to the attachment
                this.setControlOptions({
                    onPreRender:()=>{},
                    onRender: (rm:sap.ui.core.RenderManager)=> {
                        rm
                        .openStart('div',this as any)
                        .class('u-ui5-wrap')
                        .style('display','contents')
                        .openEnd();

                        /*
                        let ref=(this as any as sap.ui.core.Control).getDomRef();
                        console.log(`REF[${this.getId()}]==`+ref); */
                        if (this.renderCount) {
                            //console.log(`renderCount=${this.renderCount} - renderiing wrapped`);
                            rm.renderControl(towrap);
                        }
                        else {
                            Promise.resolve()
                            .then(()=>{
                                //console.log(`renderCount=${this.renderCount} - invalidating`);
                                super.invalidate();
                            })
                        }

                        rm.close('div');
                    },
                    onPostRender:(ref:any)=>{
                        this.renderCount++;
                        //console.log(`renderCount=${this.renderCount} - onPostRender`);
                    },
                });
            }

            invalidate() {
                // deliberate do nothing - this stops the first time invalidation all the way to the bridger, which causes COML apps to lose state
                //super.invalidate();
            }


        })() as sap.ui.core.Control;

        (towrap as any).setParent(wrapper,'children',true);

        return wrapper;
    }


    protected wrap(towrap:sap.ui.core.Control) : sap.ui.core.Control {
        if (!this.controlOrItsWrapper) {
            if (this.attr<boolean>('wrap',true)) {
                this.controlOrItsWrapper=this.wrapControl(towrap);
            } else {
                this.controlOrItsWrapper=towrap;
            }
        }
        return this.controlOrItsWrapper;
    }

    onRender(rm: Render) {
        let controlToRender:sap.ui.core.Control;
        if (!this.control) {
                    
            this.control=this.createControl();  

            
            if (this.control) {    
                controlToRender=this.wrap(this.control);

                let elem=this.getTN().snode as Element;
                if (elem.classList && elem.classList.length) {
                    for(let i=0;i<elem.classList.length;i++) {
                        this.control.addStyleClass(this.getCvt().expandString(elem.classList[i],this.getTN()));
                    }
                }
    
                //this.control.placeAt(this.getTN().tnode);
                let bridge=UI5Attachment.getBridge();

                (controlToRender as any).setParent(bridge,'children',true);
            }
        } else {
            controlToRender=this.wrap(this.control);
        }

        if (controlToRender) {
            //console.log(`<-- end len=${pe.children.length}`);
            this.renderUI5Control(rm,controlToRender,(ui5elem)=>{
                this.getTN().tnode=ui5elem;
                ui5elem.setAttribute('data-coid',this.getTN().getId());
            })
        }

    }

    /**
     * Create the UI5 control.
     * Override if you want to return your own control.
     * 
     * @returns 
     */
    protected createControl() : sap.ui.core.Control {
        let ui5class=this.attr<string>('ui5class');

        let path=ui5class.split('.');
        let obj=globalThis;

        for(let i=0;i<path.length;i++){
            obj=obj[path[i]];
            if (!obj) {
                console.warn(`ui5control - cant find object ${path[i]} in ui5class=[${ui5class}] position ${i}`);
                return;
            }
        }

        return new (obj as any)(undefined,this.getSettings()) as sap.ui.core.Control;
    }


    cleanup?() {
        if (this.control)
            this.control.destroy(true);        
    }

}

export default class UI5CoElementFactory implements CoElementFactory {
    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        switch((tn.snode as Element).tagName.toLowerCase()) {
            case 'ui5':return new UI5CoElement(cvt,tn);
        }
        
    }

    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('ui5',this);
    }

}