import { AjaxCache } from "../Ajax";
import { AssetID, AssetFactory } from "../Asset";
import { CoElement } from "../CoElement";
import { Converter } from "../Converter";
import { Get } from "../Get";
import { Implementations } from "../Implementations";
import { Render } from "../Render";
import { getAttr, TargetNode } from "../TargetNode";
import { This } from "../This";

/**
 * Utililty class that acts as a base for writing your own CoElements.
 */
export class BaseCoElement<T extends This=This> implements CoElement<T> {
    protected tn:TargetNode;
    protected cvt:Converter<T>;

    constructor(cvt:Converter<T>,tn:TargetNode) {
        this.tn=tn;
        this.cvt=cvt;
    }

    getCvt(): Converter<T> {
        return this.cvt;        
    }

    getTN(): TargetNode {
        return this.tn;        
    }


    /**
     * Returns the parameter block as set by any parent Component for us
     */
    public params() : any {
        // find the first parent that has
        let found:any;
        let me=(this.getTN().snode as Element).tagName.toLowerCase();
        this.getCvt().findParentAndIteration(this.getTN(),(tn,iteration)=>{
            found=tn.childParams(iteration,me);
            return found;
        });

        return found;
    }

    /**
     * Finds the current element's 0 based iteration in a parent with the tag 'parentTag'.
     * 
     * @param parentTag 
     * @returns iteration number;
     */
    public iter(parentTag:string) : number {
        const {parent,iteration} = this.getCvt().findParentAndIteration(this.getTN(),(tn)=>{
            return (tn.snode as Element).tagName.toLowerCase()==parentTag;        
        });
        return iteration;
    }

    public attr<T extends (number | string | boolean) = string>(attr: string, defvalue?: T): T {
        if (!(this.getTN().snode as Element).hasAttribute(attr)) { // if it doesnt exist on our element, delegate to the owning this
            return this.getCvt().getThis().attr(attr,defvalue);
        }
        return getAttr<T>(this.getCvt(),this.getTN().snode,attr,defvalue,this.tn);
    }

    /**
	 * Returns the text content of this ELement, after evaluating any ${} expressions.
	 */
	public content() : string {
        return this.getCvt().expandString((this.getTN().snode as unknown as Element).textContent,this.getTN());
    }
    /**
     * Given a source tagname, returns the first matching parent CoElement.
     * 
     * @param parentTag 
     * @returns 
     */
    protected parent<T extends CoElement>(parentTag:string) : T {
        let found=this.getCvt().findParent(this.getTN(),(tn)=>{
            return (tn.snode as Element).tagName.toLowerCase()==parentTag;
        });

        if (found)
            return found.component as T;
    }

    onRender(rm: Render) {
        
    }

    /**
     * Dispatch a DOM synthetic event on the root node of this object.
     * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
     * 
     * @param eventname 
     * @param detail 
     */
    public dispatchEvent(eventname:string,detail?:{[key:string]:any},options?:EventInit) : Event {
        return this.getTN().dispatchEvent(eventname,detail,options);
    }

    public invalidate(node?: string | Node | TargetNode,forget?:boolean) {
		if (!node) // means us
			node=this.getTN();
        this.cvt.invalidate(node,forget);
    }

    public get<T extends CoElement<This>>(node: string | Node,getfunc?:Get<T>): T {
		if (!node) { // means us
            if (getfunc)
                getfunc(this as any);
            return this as any;
        }
        return this.cvt.get(node,getfunc) as unknown as T;
    }

    public $(node?: string | Node | TargetNode, changeid?: string, changer?: (Element: any) => any): Element {
		if (!node)
			node=this.getTN();
        return this.cvt.$(node,changeid,changer);
    }

	/**
	 * Attach an asset's control to the target node.
	 * 
	 * @param  parent The target dom node or query selector whose child the new control will become.
	 * @param  toAttach The control or asset to attach.
	 * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
	 * 
	 * @return A promise that resolves with the control. 
	 */
	public attach(parent: Node | string, toAttach: CoElement | AssetID | string, parameters?: { [key: string]: any }): Promise<CoElement> {
		return this.cvt.attach(parent, toAttach, parameters);
	}

	/**
	* Detaches a previously attached() control.
	* 
	* @param toDetach The control that was attached, or the target node or query selector of the parent from which to attach all previously attached controls
	*/
	public detach(toDetach: string | CoElement): Promise<any> {
		return this.cvt.detach(toDetach);
	}

    public ajax(callName: string, jsonToSend: any, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text'): Promise<any> {
		return Implementations.getAjax().ajax(callName, jsonToSend, cache, responseDataType);
	}

	public assets(): AssetFactory {
		return Implementations.getAssetFactory();
	}

    

}