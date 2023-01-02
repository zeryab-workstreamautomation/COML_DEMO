import { Asset, AssetFactory, AssetID } from "../Asset";
import { Converter } from "../Converter";
import { CoElement } from "../CoElement";
import { ctn, getAttr, TargetNode } from "../TargetNode";
import { GetAttrT, This } from "../This";
import { AjaxCache } from "../Ajax";
import { Implementations } from "../Implementations";
import { Render } from "../Render";
import { Templatizable } from "../Templatizable";
import { BeforeMergeTargetNode } from "./BeforeMergeTargetNode";
import { Get } from "../Get";


/**
 * The base implementation of the This interface.
 * By default this class is used to implement `this` for a coml page.
 * 
 * You can override this by subclassing this class, adding page functionality to it, and 
 * setting it inside a page by use of the <meta name="thisclass" content="path/ToYourClass"> tag in the
 * <head> of the coml html page.
 */
export default class BaseThis implements This, Templatizable {
	public document: Document;
	protected cvt: Converter<this>;
	protected uid: string;
	protected fnGetAttr: GetAttrT;
	public parameters:any;

	constructor(cvt: Converter<This>, stateFrom?: BaseThis, fnGetAttr?: GetAttrT) {
		this.fnGetAttr = fnGetAttr;
		this.cvt = cvt as Converter<this>;
		this.cvt.getRoot().component = this; // so the top 'document' element is rendered by us
		this.document = cvt.getDocument();
		if (stateFrom) {
			// copy state already initialized in the original object
		}
	}

	protected castToType<T>(value: string, type: number | string | boolean): T {
		// convert
		if (typeof type == 'number')
			return Number.parseFloat(value) as any;
		if (typeof type == 'boolean')
			return (value.trim().toLowerCase() == 'true') as any;
		return (value as any);
	}

	protected getAttrInt<T extends (number | string | boolean) = string>(attr: string, defvalue?: T): T {
		if (this.fnGetAttr) {
			let value = this.fnGetAttr(attr);
			if (!value)
				return defvalue;

			return this.castToType<T>(value, defvalue);
		}
		return getAttr<T>(this.cvt, this.getTN().snode, attr, defvalue as any,this.getTN());
	}

	/**
     * Finds this element's 0 based iteration in its parent with the tag 'parentTag'
	 * The last passed currtn to expandString will be used.
     * 
     * @param parentTag 
     * @returns iteration number;
     */
    public iter(parentTag:string) : number {
		let currtn:TargetNode=(this as any).__currtn; // see ConverterImpl.expandString();
		if (!currtn)
			currtn=this.getTN();

        let pi = this.getCvt().findParentAndIteration(currtn,(tn)=>{
            return (tn.snode as Element).tagName.toLowerCase()==parentTag;        
        });
        return (pi?  pi.iteration:0);
    }



	public attr<T extends (number | string | boolean) = string>(attr: string, defvalue?: T): T {
		if (this['parameters'] && attr in this['parameters']) {
			let rawv = this['parameters'][attr];
			if (typeof rawv != 'undefined') {
				if (typeof rawv == typeof defvalue)
					return rawv;
				return this.castToType('' + rawv, defvalue);
			}
		}
		return this.getAttrInt<T>(attr, defvalue);
	}

	/**
	 * Returns the text content of this ELement, after evaluating any ${} expressions.
	 */
	public content() : string {
        return this.getCvt().expandString((this.getTN().snode as unknown as Element).textContent,this.getTN());
    }


	/**
     * Returns the parameter block as set by any parent Component for us
     */
    public params() : any {
		return this.parameters;
	}

	public getId(): string {
		if (!this.uid) {
			this.uid = 'this' + Math.floor(Math.random() * 1000000000);
		}
		return this.uid;
	}

	public assetId(): AssetID {
		return this.cvt.getAssetId();
	}

	/**
	 * Import a COML factory.
	 * 
	 * @param importee The fully qualified path to a COML CoElementFactory (e.g. `coml/element/CoFields`) or the assetId of a COML page.
	 * @param tagForAsset optional, required only if importee is an assetId. The tag to use for this asset's CoElement
	 */
	import(importee: string | AssetID, tagForAsset?: string): Promise<any> {
		return this.cvt.import(importee, tagForAsset);
	}

	public onAfterRender(cb: () => void): void {
		this.cvt.addOnAfterRenderListener(cb);
	}

	public getSourceDocument(): Document {
		return this.cvt.getDocument()
	}

	public invalidate(node?: Node | string | TargetNode,forget?:boolean): void {
		if (!node)
			node=this.getTN();
		this.cvt.invalidate(node,forget);
	}

	public get<T extends CoElement>(node: Node | string,getfunc?:Get<T>): T {
		return this.cvt.get(node,getfunc) as unknown as T;
	}

	/**
		* Returns the generated target node (tnode) for the given parameter. Optionally lets the caller specify a 'state changer'
		* callback that will be called to effect changes of state to the tnode. The state changer is stored so that
		* the changes are recreated on every repaint of the tnode.
		*  
		* @param node an snode, TargetNode or source document selector.
		* @param changeid (Optional but required if changer is specified) a unique id of the change (If the change is readded with the same id, it will replace the earlier change)
		* @param changer (Optional) The callback to effect changes, that will be called when the tnode is available. If currently available, the callback will be called immediately. The callback will also be called on any subsequent repaint of the tnode.
		*/
	public $(node?: Node | string | TargetNode, changeid?: string, changer?: (Element) => any): Element {
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

	/**
	 * Dispatch a DOM synthetic event on the root node of this object.
	 * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
	 * 
	 * @param eventname 
	 * @param detail 
	 */
	public dispatchEvent(eventname: string, detail?: { [key: string]: any }, options?: EventInit): Event {
		return this.getTN().dispatchEvent(eventname, detail, options);
	}


	/************************
	 * implement CoElement 
	 ************************/

	/**
	 * Return this component's converter.
	 */
	getCvt(): Converter<This> {
		return this.cvt;
	}


	/**
	 * Return this converter's TargetNode
	 */
	getTN(): TargetNode {
		let n = this.getCvt().getRoot();
		if (!n.component) {
			n.component = this;
		}
		return n;
	}

	templatize(caller: Converter<This>, replaced: Node) {
		let templateTN = new BeforeMergeTargetNode(this.getCvt().getDocument().body, undefined, caller, this.getCvt(), replaced);
		this.getCvt().replaceRoot(templateTN);
	}


	/**
	 * Override if you need to be called on onAfterRendering(). ref is this control's domref
	 * 
	 * @param ref 
	 */
	onPostRender?(node: any) {
		if (this.getCvt()) {
			Promise.resolve()
				.then(() => {
					this.getCvt().onAfterRender();
				});
		}
	}

	/**
	 * Override if you need to be called on before rendering starts. 
	 * @param ref 
	 */
	onPreRender() {

	}


	onRender(rm: Render) {
		const { cvt, tn } = ctn(this);
		let elem = tn.snode;
		let elem2 = (tn instanceof BeforeMergeTargetNode) ? tn.getReplacedNode() : null;

		rm.openStart('div', this)
			.class('u-document');

		cvt.copyAttrExcept(rm, elem, [],tn);
		if (elem2)
			cvt.copyAttrExcept(rm, elem2,[],tn);

		rm.openEnd();

		cvt.renderChildren(rm, tn);


		rm.close('div');
	}
}