

import { AssetID } from "./Asset";
import { CoElement } from "./CoElement";
import { CoElementFactory } from "./CoElementFactory";
import { Get } from "./Get";
import { Render }from "./Render";
import { StateChanger, StateChangers } from "./StateChanger";
import { TargetNode } from "./TargetNode";
import { GetAttrT, This } from "./This";


/**
 * Interface for the object that converts COML to Html.
 */
export interface Converter<T extends This> {
	
    
    /**
     * Sets the functon that will be used to expand attributes
     * 
     * @param fnGetAttr 
     */
    setGetAttrFn(fnGetAttr: GetAttrT);

    /**
     * Sets the source COML document that this converter will translate to html.
     * Imports scripts and styles, and sets the document as the root node.
     * 
     * @param doc The document to load.
     * @param assetId If the document was loaded from an asset, the assetId. We start monitoring scope changes for this asset (which represents the top level page), so that styles are removed when not in scope.
     * 
     * @return A promise that resolves when this converter has loaded its styles to the current SPA.
     */
    setDocument(doc:Document,assetId:AssetID,root?:TargetNode) : Promise<Converter<This>>;

    /**
     * Returns the source document 
     */
    getDocument() : Document;

    /**
     * Return the root target node
     */
    getRoot() : TargetNode;

    /**
     * Replace the root, e.g. during templatization.
     * @param root 
     */
    replaceRoot(root:TargetNode);
    

    /**
     * Call so any template's installed onAfterRender callbacks are called.
     * 
     * @param ref 
     */
    onAfterRender();


    /**
     * Copies all attributes from node to the RenderManager (using `rm.attr()`) except for any specified in the doNotCopy list.
     * This should be used while creating the outermost element in the target DOM.
     * 
     * Attributes containing `${}` templates are first expanded then copied.
     * 
     * 
     * Example usage:
     * ```typescript
     onRender(rm: Render,cvt:ComlConverter,tn:TreeNode) {
        rm.openStart('div')
        rm.class('u-wschild');
        cvt.copyAttrExcept(rm,tn.snode);
        rm.openEnd();

        // renderChildren etc

        rm.close('div');    
     }   
     * ```
     * 
     * @param rm 
     * @param node 
     * @param doNotCopy 
     */
    copyAttrExcept(rm: Render, node: Node, doNotCopy?: string[],currtn?:TargetNode);

    /**
     *  Copy's the snode's attributes and classes and styles to the tnode 
     * 
     * 
     * @param tnode The tnode to copy to.
     * @param snode The node to copy from.
     * @param doNotCopy A list of attribute NOT to copy
     * @param attr2set Additional attributes to set (array of key/value pairs)
     */
    copyAttrExceptToTNode(tnode:Node, snode: Node, doNotCopy?: string[],attr2set?:string[][],currtn?:TargetNode);

    /**
     * Returns the this object that is visible to scripts and string templates in the html page
     */
    getThis(): T;

   

    /**
    * Finds the parent of 'tn' fow which 'matcher' returns true.
    * 
    * @param tn The target node to find parent of
    * @param matcher Matching function
    * @returns The parent found or undefined if non.
    */
    findParent(tn: TargetNode, matcher: (tn: TargetNode) => boolean): TargetNode;

    /**
     * Finds the parent of 'tn' for which 'matcher' returns true. Similar to
     * findParent, except the iteration that resulted in the child 'tn' is also returned.
     * 
     * @param tn 
     * @param matcher 
     * @returns Either {parent:The parent found,iteration:The iteration of the branch that resulted in the child } or undefined if no parent
     */
    findParentAndIteration(tn: TargetNode, matcher: (parenttn: TargetNode,iteration?:number) => boolean): { parent: TargetNode, iteration: number }



    /**
     * Finds the first child of 'tn' for which 'matcher' returns true.
     * 
     * @param tn The target node to find children of
     * @param matcher Matching function
     * @returns The parent found or undefined if non.
     */
    findChild(tn: TargetNode, matcher: (tn: TargetNode) => boolean): TargetNode


    /**
     * Register a factory which will be called when this converter is called to convert 
     * a node with tagName 'tag'.
     * 
     * @param tag The tag string to match or a function that returns true for a matching tag
     * @param factory The factory to use for the matching tag
     */
    registerFactory(tag: string|((tag:string)=>boolean), factory: CoElementFactory);




    /**
    * Adds a listener that will be called just before any element whose tag matches any entry in 'tags' renders the source tree.
    * 
    * @param tags 
    * @param listener 
    */
    addOnElementRenderListener(tags: string[], listener: (tag: string, e: CoElement) => void);

    /**
     * Removes a previously added listener from the tags against which it was added.
     * 
     * @param tags 
     * @param listener 
     * @returns 
     */
    removeOnElementRenderListener(tags: string[], listener: (tag: string, e: CoElement) => void);



    /**
     * Render the children of node.
     * 
     * @param rm 
     * @param parenttn The parent treenode whose snode's children are to be rendered 
     * @param iteration the repeat iteration (0 for first and incrementing for each successive repeat)
     */
    renderChildren(rm: Render, parenttn: TargetNode, iteration?: number);

    /**
     * Render the dom node to ui5 using a RenderManager. Takes an optional elementSTack which will be
     * used for any visitParentElements() calls, this is useful to push the original parents during an
     * async render.
     * <p>
     * @param node 
     */
    renderNode(rm: Render, tn: TargetNode);


    /**
     * execute the javascript in 'script' after setting its 'this' to point to the This object.
     * Returns any value if there is a 'return()' statement - else undefined.
     * 
     * @param script 
     */
    executeScript(script: string): any;

    /**
     * expand any ${} string expansions in 'str'
     * 
     * @param str 
     */
    expandString(str: string,__currtn:TargetNode): string;


    /**
     * 
     * @deprecated does nothing. 'data-coid' is generated by Render.openStart() now.
     * 
    * 
    * <p>
    * @param rm 
    * @param tn 
    * @returns 
    */
    encodeWSE(rm: Render, tn: TargetNode): Render;


    /**
     * Adds a listener that will be called when the This object is created.
     * 
     * @param onCreate 
     * 
     */
    addOnThisCreatedListener(onCreate: (This: This) => void);

    /**
     * Returns the AssetID of the asset that was used to build the sdom document in this Converter.
     */
	getAssetId(): AssetID;


    

    /**
     * Import a COML factory.
     * 
     * @param importee The fully qualified path to a COML CoElementFactory (e.g. `coml/element/CoFields`) or the assetId of a COML page.
     * @param tagForAsset optional, required only if importee is an assetId. The tag to use for this asset's CoElement
     */
    import(importee:string|AssetID,tagForAsset?:string) : Promise<any>;


	/**
	 * Add a listener that is called when the This object has finidhed rendering.
	 */
	addOnAfterRenderListener(cb: () => void): unknown;


    /**
     * Marks a node for repainting
     * 
     * @param node A node in the sdom,tdon or their querySelector or the TargetNode to invalidate
     * @param forget If set, the COmponent should discard any cached state.
     * 
     */
	invalidate(node: string | Node | TargetNode,forget?:boolean);

    /**
     * Given a selector or element in either the source or target document, finds the associated CoElement.
     * 
     * @param selectorOrNode an snode,tnode, TargetNode or source or target document selector.
     * @returns The CoElement associated with the 
     */
	get(selectorOrNode: string | Node | TargetNode,getfunc?:Get): CoElement<T>;


    /**
     * Returns the generated target node (tnode) for the given parameter. Optionally lets the caller specify a 'state changer'
     * callback that will be called to effect changes of state to the tnode. The state changer is stored so that
     * the changes are recreated on every repaint of the the tnode.
     *  
     * @param node an snode, TargetNode or source document selector.
     * @param changeid (Optional but required if changer is specified) a unique id of the change (If the change is readded with the same id, it will replace the earlier change)
     * @param changer (Optional) The callback to effect changes, that will be called when the tnode is available. If currently available, the callback will be called immediately. The callback will also be called on any subsequent repaint of the tnode.
     */
     $(node:Node|string|TargetNode,changeid?:string,changer?:(Element)=>any) : Element;

   /**
	 * Adds an event handler to the given node.
	 * 
	 * @param node      The node or its selector
	 * @param eventname The event name, e.g. 'click' or 'mycustomevent'
	 * @param handler  The callback.
	 */
	//addEventListener(node:Node|string|TargetNode,eventname:string,handler:(event:Event)=>any);

    /**
     * Removes an eventhandler added via addEventListener.
     * 
     * @param eventname 
     * @param handler 
     * @returns 
     */
	//removeEventListener(node:Node|string|TargetNode,eventname:string,handler:(event:Event)=>any);


    /**
     * Rebuilds the TargetNode tree from the supplied sdom. All children are also rebuilt.
     * 
     * @param node 
     */
	//rebuild(node: string | Node | TargetNode);

    /**
     * Finds the source TargetNode that generated the target id or node 'idnode'
     * 
     * @param node The target node, or its 'data-coid' attribute id, or a selector.
     * @returns The found source target node or null if non found. To fetch the node, use `tn.snode`
     */
	//getSourceNode(node: string | Node): TargetNode;

    /**
     * Attach an asset's control to the target node.
     * 
     * @param  parent The target dom node or query selector whose child the new control will become.
     * @param  toAttach The control or asset to attach.
     * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
     * 
     * @return A promise when the control is loaded (if it was an asset) attached.
     */
    attach(parent:Node|string,toAttach:AssetID|string|CoElement,parameters?:{[key:string]:any}) : Promise<CoElement>;

    /**
     * Detaches a previously attached() control.
     * 
     * @param toDetach The control that was attached, or the target node or query selector of the parent from which to attach all previously attached controls
     */
    detach(toDetach:string|CoElement) : Promise<any>;

    makeCoElement(tn:TargetNode): CoElement | Promise<CoElement> 

    /**
     * Perform unwatched changes on an snode via changes(). Won't trigger a rebuild.
     * 
     * @param snode 
     * @param changes 
     *
    unwatchedSnodeChange(snode:Node,changes:()=>any);
    */

    /**
     * Remove a state changer for this snode.
     * 
     *
    removeStateChangers(snode: Node): void; */


    /**
     * Get StateChangers for this snode. if 'createIfNotExist' is true, then create if it doesnt exist
     * 
     * @param snode 
     * @param createIfNotExists 
     **/
    getStateChangers(snode: Node, createIfNotExists?: boolean): StateChangers;

    /**
     * Adds a state change function, which can make changes to the attributes etc of a tnode that are different from those
     * copied from the snode. The changer callback is called on every render of the tnode so that state changes affected
     * once are not lost due to regeneration.
     * 
     * @param id A unique id of the state change.
     * @param snode The snode to add/remove the changer for
     * @param changer The changer callback to add or undefined to remove existing changers. This will be called with the tnode ELement and can make any changes to it.
     */
    stateChanger(id:string,snode:Node,changer?:StateChanger);

    /**
     * Set a Gets function on the snode. If no Get then all Gets are removes.
     * 
     * @param snode 
     * @param get 
     */
    setGets(snode: Node,get?:Get): void;


    /**
     * Returns all currently set Get functions on this snode.
     * 
     * @param snode 
     */
    getGets<T extends CoElement=CoElement>(snode: Node): Get<T>[];


}

