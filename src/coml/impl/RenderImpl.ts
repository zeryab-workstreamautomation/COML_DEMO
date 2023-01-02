import { Converter } from "../Converter";
import { CoElement } from "../CoElement";
import { Render } from "../Render";
import { Patch } from "../Patch";

type GetId =(c:CoElement)=>string;



export class RenderImpl implements Render {
    protected getId:GetId;
    protected pn:Element[]=[]; // the node to which we are adding
    protected tdoc:Document;
    protected patch:Patch;

    constructor(patch:Patch,getId:GetId) {
        this.getId=getId;
        this.tdoc=document;
        this.patch=patch;
    }

    

    protected e() : Element {
        return this.pn[this.pn.length-1];
    }

    attr(sName: string, vValue: any): this {
        this.e().setAttribute(sName,vValue);
        return this;
    }
    class(sClass: string): this {
        this.e().classList.add(sClass);
        return this;
    }


    close(sTagName: string): this {
        if (this.pn.length==0) {
            console.error(`RM - mismatched close tag ${sTagName}`);
            return;
        }
        let laste=this.pn.pop();
        this.insertRendered(laste);
        return this;
    }

    /**
     * Copy attributes and classes with ${} expansion into the last opened HTML element.
     * 
     * 
     * @param component The component 
     * @param doNotCopy (Optional) an array of attributes to NOT copy.
     * @param copyFrom  (Optional) the element to copy from. If not specified, defaults to this component's source node
     */
    copyAttrExcept(component:CoElement,doNotCopy?: string[],copyFrom?: Node) : this {
        component.getCvt().copyAttrExcept(this,(copyFrom) ? copyFrom:component.getTN().snode,doNotCopy,component.getTN());
        return this;
    }


    public renderChildren(component:CoElement, iteration?:number,parametersPerChild?:{[tagname:string]:any}): this {
        if (parametersPerChild) {
            for(let tagname in parametersPerChild) {
                component.getTN().childParams(iteration,tagname,parametersPerChild[tagname]);
            }
        }
        component.getCvt().renderChildren(this,component.getTN(),iteration);
        return this;
    }

    /**
     * Insert a prerendered dom node into the current rendering position.
     * 
     * @param elem 
     * @returns 
     */
    insertRendered(elem:Node) : this {
        if (this.pn.length>=1) { // atleast one item remains on the stack, make elem child of that
            //console.log(` ${this.pn.length} RM adding child ${this.toStr(elem)} to ${this.toStr(this.e())}`);
            this.e().appendChild(elem);
        } else { // we just build the last object, so use the patch to restore it
            //console.log(` ${this.pn.length} RM restoring child ${this.toStr(this.e())}`);
            this.patch.restorePosition(elem);
        }

        return this;
    }

    destroy(): void {
    }

    openEnd(): this {
        return this;
    }

    /**
	 * Creates an HTML element from the given tag name and parent namespace
	 */
	protected createElement(sTagName:string, oParent?:Element) : Element{
		if (sTagName == "svg") {
			return this.tdoc.createElementNS("http://www.w3.org/2000/svg", "svg");
		}

		var sNamespaceURI = oParent && oParent.namespaceURI;
		if (!sNamespaceURI || sNamespaceURI == "http://www.w3.org/1999/xhtml" || oParent.localName == "foreignObject") {
			return this.tdoc.createElement(sTagName);
		}

		return this.tdoc.createElementNS(sNamespaceURI, sTagName);
	};

    openStart(sTagName: string, comp?: CoElement,noCoId?:boolean): this {
        let e=this.createElement(sTagName,(this.pn.length>0) ? this.e():undefined);
        if (comp) {
            comp.getTN().tnode=e;
            if (!noCoId) {
                e.setAttribute('data-coid',comp.getTN().getId())
            }
        }
        this.pn.push(e);
        return this;
    }



    style(sName: string, sValue: string): this {
        (this.e() as HTMLElement).style.cssText += `${sName}:${sValue};`;
        return this;
    }

    text(sText: string): this {
        const textNode = document.createTextNode(sText);
        //this.e().appendChild(textNode);
        this.insertRendered(textNode);
        return this;
    }

    unsafeHtml(sHtml: string): this {
        //this.e().innerHTML=sHtml;
        return this;
    }
    
}