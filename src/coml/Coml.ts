import { AssetFactory, AssetID } from "./Asset";
import { AjaxCache } from "./Ajax";
import { CoElement } from "./CoElement";
import { TargetNode } from "./TargetNode";
import { Get } from "./Get";

/**
 * The Coml API used for writing COML components, Templates and apps.
 */
export interface Coml {

    /**
     * Invalidate a component, causing it to be repainted. The repaint is asyncronous and does not happen during the invalidate invocation.
     * 
     * @param selectorOrNode The source or target node (element) , querySelector or TargetNode to invalidate
	 * @param forget If true, the CoElement is asked to `forget()` state.
     */
    invalidate(selectorOrNode: Node | string | TargetNode,forget?:boolean);

    /**
     * Return a Component if the component has currently been instantiated for this selector or node
	 * 
	 * if a getfunc is provided, this is called exactly once - either immediately if the coelement is available
	 * or later when it is instantiated.
     * 
     * @param selectorOrNode 
	 * @param getfunc an optional function that will be called now or later exactly once with the CoElement of this node supplied.
     */
	get<T extends CoElement>(selectorOrNode: Node | string,getfunc?:Get<T>): T;

	/**
		* Returns the generated target node (tnode) for the given parameter. Optionally lets the caller specify a 'state changer'
		* callback that will be called to effect changes of state to the tnode. The state changer is stored so that
		* the changes are recreated on every repaint of the tnode.
		*  
		* @param selectorOrNode an snode, TargetNode or source document selector.
		* @param changeid (Optional but required if changer is specified) a unique id of the change (If the change is readded with the same id, it will replace the earlier change)
		* @param changer (Optional) The callback to effect changes, that will be called when the tnode is available. If currently available, the callback will be called immediately. The callback will also be called on any subsequent repaint of the tnode.
		*/
	$(selectorOrNode: Node | string | TargetNode, changeid?: string, changer?: (Element) => any): Element;

	/**
     * Returns the value of an attribute from the source node, after evaluating any ${} expressions.
     * 
     * @param attr The attribute from the Component to return
     * @param defvalue (Optional) The default value to use if the attribute does not exist.
     */
    attr<T extends (number|string|boolean)=string>(attr:string,defvalue?:T) : T;

	/**
	 * Returns the text content of this Element, after evaluating any ${} expressions.
	 */
	content() : string;


	/**
     * Finds the current element's 0 based iteration in a parent with the tag 'parentTag'.
	 * The iteration is found from the point at which this function was called.
     * 
     * @param parentTag 
     * @returns iteration number;
     */
    iter(parentTag:string) : number;


	/**
	 * Attach an asset's control to the target node. The new control will be rendered from the attachment parent.
	 * 
	 * @param  parent The source or target dom node or query selector whose child the new control will become.
	 * @param  toAttach The control or asset to attach.
	 * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
	 * 
	 * @return A promise that resolves when the control is loaded
	 */
	attach(parent: Node | string, toAttach: CoElement | AssetID | string, parameters?: { [key: string]: any }): Promise<CoElement>;

	/**
	* Detaches a previously attached() control.
	* 
	* @param toDetach The control that was attached, or the source or target node or query selector of the parent from which to detach all previously attached controls
	*/
	detach(toDetach: string | CoElement): Promise<any>;

    /**
     * Issue an async call.
     * 
     * @param callName 
     * @param jsonToSend 
     * @param cache 
     * @param responseDataType 
     */
	ajax(callName: string, jsonToSend: any, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text'): Promise<any>;

    /**
     * Get the current AssetFactory.
     */
	assets(): AssetFactory;

	/**
	 * Dispatch a DOM synthetic event on the root node of this object.
	 * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
	 * 
	 * @param eventname The event to send, example 'myevent'. 
	 * @param detail  (Optional) the object that will be received by any listener in the `event.detail` parameter. Use this to send any information to the listener. The property `event.detail.sender` is automatically set to the caller.
	 */
	dispatchEvent(eventname: string, detail?: { [key: string]: any }, options?: EventInit): Event;

	/**
     * Returns the parameter block as set by any parent Component for this component
     */
    params() : any;

}