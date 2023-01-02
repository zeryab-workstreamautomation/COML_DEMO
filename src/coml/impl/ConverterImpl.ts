import { AssetID, AssetType, isCoElementAsset, restoreAssetID, stringifyAssetID } from "../Asset";
import { Converter } from "../Converter";
import { CoElement, isCoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Render } from "../Render";
import { isTargetNode, TargetNode, TNS } from "../TargetNode";
import { TargetNodeImpl } from "./TargetNodeImpl";
import { GetAttrT, This } from "../This";
import { Attachable, isAttachable } from "../Attachable";
import { AttachmentImpl } from "./AttachmentImpl";
import { Style } from "./Style";
import { AssetCoElementFactory } from "./AssetCoElementFactory";
import { Implementations } from "../Implementations";
import { HtmlElementFactory } from "../html/HtmlElement";
import { BypassElementFactory } from "../html/BypassElement";
import { ScriptElementFactory } from "../html/ScriptElement";
import { DoNotRenderElementFactory } from "../html/DoNotRenderElement";
import { ErrorCoElement } from "../element/ErrorCoElement";
import { Patch } from "../Patch";
import { toStr } from "./Debug";
import { EventHandlers } from "../html/EventHandlers";
import { StateChanger, StateChangers } from "../StateChanger";
import { Get } from "../Get";

declare var require:any; // the AMD loader must be present

interface TagMatch {
    match:(tag:string)=>boolean,
    factory:CoElementFactory
}

/**
 * A COML to Html converter - reads the DOM tree of a given Html file with COML markup and renders all nodes in the tree to 
 * html by calling factories of MarkupComponents. Normal html nodes in the original html dom tree are preserved.
 * 
 * ### Principles:
 * 1. There is a source dom (sdom) which is converted to the target dom (tdom).
 * 2. Each node in the sdom is converted to 0 or many nodes in the tdom.
 * 3. Objects that implement the CoElement interface handle the conversion. For each sdom node, they generate 0,1 or many tdom nodes.
 * 4. There can be many instances of a CoElement linked to any single sdom node.
 * 5. The conversion can be asyncronous, because A CoElement may need information to render its tdom based on an async. call - typically a jsoncall.
 * 6. MarkupComponents support 'mutation' of the tdom element. This means at runtime an event such as a user click may change dynamically the attributes of
 *    a sdom node. This will cause the CoElement to regenerate the subnodes of the tdom only for that sdom node.
 * 7. A CoElement may render its content using any htmlcontrol. 
 * 
 * ### Implementation: (Objective is to maintain state between rerenders, for example controls created during one render are availabe at the next)
 * 
 * 1. During rendering, a tree is created from the `root` object for each coml tag encountered. Each CoElement's
 *    `onRender()` function adds its own tags, then calls the `renderChildren()` to add further child nodes. 
 *    If no matching CoElement is found for a tag, the sdom node is copied verbatim to the tdom. Each node in this tree is a 'TargetNode'
 * 2. Each TargetNode is a mapping of 1 snode via a CoElement to many tnodes. Once the tree has been created,
 *    subsequent renders call the same CoElement instance. If a previously rendered
 *    TargetNode is not visited during this render, then the TargetNode is removed from the parent.
 * 4. Looping. If a parent CoElement renders its children multiple time, it uses the `renderChildren()`'s `iteration` parameter
 *    to pass in the iteration count. The TargetNode then maintains the children generated per iteration. 
 */
export class ConverterImpl<T extends This=This> implements Converter<T> {
    protected static sharedElemFactories:Map<string,CoElementFactory>; // shared by all instances of ConverterImpl
    protected instanceFactories:Map<string,CoElementFactory>=new Map(); // specific to this instance - loaded via imports
    protected matchingFactories:TagMatch[]=[];
    protected DEFAULT_FACTORY:HtmlElementFactory = new HtmlElementFactory();
    protected This:T; // the 'this' of any scripts.
    protected ready:boolean=false;
    protected root:TargetNode; // the root from which to start rendering
    protected doc:Document;
    protected observer:MutationObserver;
    public    static blockMutation:boolean; // needed to stop mutation observer during template operations
    protected renderComments:boolean=true; // if true, comments like <!-- some comment --> in the source dom will be rendered as <ws-comment style="display:none;"> some comment </ws-comment>
    protected importedDocs:Set<Document>;
    protected assetId: AssetID;
    protected fnGetAttr : GetAttrT;

    // listeners
    protected onAfterRenderCallbacks:(()=>void)[]=[];
    protected onThisCreatedCallbacks:((This:This)=>void)[]=[];


    protected initialize() {
        if (!ConverterImpl.sharedElemFactories) {
            ConverterImpl.sharedElemFactories=new Map();

            //ConverterImpl.sharedElemFactories.set('document',new DocumentElementFactory()); // handled by BaseThis
            ConverterImpl.sharedElemFactories.set('head',new DoNotRenderElementFactory());
            ConverterImpl.sharedElemFactories.set('html',new BypassElementFactory());
            ConverterImpl.sharedElemFactories.set('body',new BypassElementFactory());
            ConverterImpl.sharedElemFactories.set('script',new ScriptElementFactory());
        }
    }

    /**
     * Constructor. If two ConverterImpls share state (This and imprts), then pass the original . This is needed when
     * two seperate render chains are run from the same HtmlPage, (for example the WSToolkit element)
     */
    constructor(copyStateFrom?:Converter<T>) {
        if (!copyStateFrom) 
        {
            this.initialize(); // set up factories

            //this.This=new BaseThis(this);

            
        }
        else {
            this.This=copyStateFrom.getThis();
            this.instanceFactories=(copyStateFrom as unknown as ConverterImpl<T>).instanceFactories; // so the parents imports are avalable to us
            this.matchingFactories=(copyStateFrom as unknown as ConverterImpl<T>).matchingFactories;
        }

    }

    /**
     * Sets the functon that will be used to expand attributes
     * 
     * @param fnGetAttr 
     */
    setGetAttrFn(fnGetAttr: GetAttrT) {
        this.fnGetAttr=fnGetAttr;
    }


    /**
     * Instatiate this from the `<meta name="thisclass" content="path/To/Class">` meta.
     * If not found, just use an instance of BaseThis.
     * 
     * @param doc 
     */
    protected instantiateThis(doc:Document) : Promise<any> {
        let meta=doc.querySelector('meta[name="thisclass"]') as HTMLMetaElement;
        if (meta && meta.content && meta.content.length) {
            let thisClass=meta.content;

            return(
                this.newThis(thisClass)
                .then((instance:T)=>{
                    this.This=instance;
                    this.onThisCreated();
                })
            );
        } else {
            this.This=Implementations.createThis(this,this.fnGetAttr) as T; 
            this.onThisCreated();
            return Promise.resolve();
        }

    }

    protected newThis(path:string) : Promise<T> {
		let res,rej;
		let promise:Promise<any>=new Promise((resolve,reject)=>{
			res=resolve;
			rej=reject;
		});

		(require as any)([path],
		(module)=>{
			let instance=new module.default(this,this.This,this.fnGetAttr);
			res(instance);
		});

		return promise;
	}


    


    /**
     * Calls any registered callbacks on This creation
     * 
     * @param ref 
     */
    protected onThisCreated() {
        if (this.onThisCreatedCallbacks.length > 0) {
            for (let cb of this.onThisCreatedCallbacks) {
                try {
                    cb(this.This);
                } catch (x) {
                    console.error(x);
                }
            }
        }
    }

    public getAssetId() : AssetID {
        return this.assetId;
    }

    /**
     * Add a listener to be called when the topcontrol finishes rendering.
     * 
     * @param cb 
     */
    public addOnThisCreatedListener(cb: (This: This) => void) {
        this.onThisCreatedCallbacks.push(cb);
    }

    


    /**
     * Start observing the source document - any changes to attrinutes causes will trigger a redraw of the
     * node that changed.
     */
    protected startObserving() {
        this.observer = new MutationObserver((mutations)=> {
            if (ConverterImpl.blockMutation)
                return;
            let changed:Set<TargetNode>;
            mutations.forEach((mutation:MutationRecord)=>{
              if (mutation.type === "attributes") {
                /*
                console.log(`MUTATED: ${mutation.attributeName} on target=${toStr(mutation.target)} from ${mutation.oldValue} to ${(mutation.target as HTMLElement).getAttribute(mutation.attributeName)}`);
                let tn=this.find(this.root,(tn)=>(tn.snode==mutation.target || tn.replaced==mutation.target));
                if (tn) {
                    if (!changed)
                        changed=new Set();
                    changed.add(tn);
                } else {
                    console.log(`MUTATED: ${mutation.attributeName} could not find target from root=${toStr(this.root.snode)}`);
                } */
                console.error(`MUTATED: ${mutation.attributeName} on target=${toStr(mutation.target)} from ${mutation.oldValue} to ${(mutation.target as HTMLElement).getAttribute(mutation.attributeName)}`);
                console.error('DO NOT CHANGE SOURCE NODES (SNODES) - USE this.$(selector,(elem)=>{elem.setAttribute("key","value")}) INSTEAD.');
              }
            });

            if (changed) {
                changed.forEach((tn)=>{
                    this.rebuildInt(tn);
                })
            }
          });
        this.observer.observe(this.getDocument(), {attributes: true,subtree:true});        
    }

     /**
     * Perform unwatched changes on an snode via changes(). Won't trigger a rebuild.
     * 
     * @param snode 
     * @param changes 
     *
    unwatchedSnodeChange(snode:Node,changes:()=>any) {
        try { // block mutation till after the 
            ConverterImpl.blockMutation=true;
            changes();
        } finally {
            Promise
            .resolve()
            .then(()=>{
                ConverterImpl.blockMutation=false;
            })
        }
    } */


    public getRoot() : TargetNode {
        return this.root;
    }

    /**
     * Replace the root, e.g. during templatization.
     * @param root 
     */
    public replaceRoot(root:TargetNode) {
        this.root=root;
    }
    

    public getDocument() : Document {
        return this.doc;
    }

    /**
     * imports a document by importing its styles and the executing its <script> block from the head.
     * 
     *   
     */
    protected importDocumentInt(doc:Document) : Promise<any> {
        return(this.importMarkupComponents(doc));
    }

    

    /**
     * Imports scripts and styles, and sets the document as the root node.
     * 
     * @param doc 
     * @param assetId If the document was loaded from an asset, the assetId. This is stored in the This object. Also, we start monitoring scope changes for this asset (which represents the top level page), so that styles are removed when not in scope 
     */
    public setDocument(doc:Document,assetId:AssetID,root?:TargetNode) : Promise<Converter<This>> {
        this.root=(root) ? root:new TargetNodeImpl(doc.body);
        if (!this.root.snode)
            this.root.snode=doc.body;
        doc.body.setAttribute('data-asset-id',stringifyAssetID(assetId));
        //if (attachmentNode)
        //    this.root.attachmentNode=attachmentNode;
        this.doc=doc; // so This construction use of $ will have doc available
        return(
            this.instantiateThis(doc)
            .then(()=>{ 
                return this.importDocumentInt(doc)
            })
            .then(()=>{
                this.doc=doc;
                this.getThis().document=this.doc;
        
                this.assetId=assetId;
                this.startObserving();
                return this;
            })
        );
    }



    /**
     * Call so any template's installed onAfterRender callbacks are called.
     * 
     * @param ref 
     */
    public onAfterRender() {
        if (this.onAfterRenderCallbacks.length>0)   {
            for(let cb of this.onAfterRenderCallbacks) {
                try {
                    cb();
                } catch(x) {
                    console.error(x);
                }
            }
        }
    }

    /**
     * Add a listener to be called when the topcontrol finishes rendering.
     * 
     * @param cb 
     */
    public addOnAfterRenderListener(cb: () => void) {
        this.onAfterRenderCallbacks.push(cb);
	}


    /**
     * Copies all attributes from node to the Render (using rm.attr()) except for any specified in the doNotCopy list.
     * 
     * @param rm 
     * @param node 
     * @param doNotCopy 
     */
    public copyAttrExcept(rm: Render, node: Node, doNotCopy?: string[],currtn?:TargetNode) {
        let elem:Element = (node as any as Element);
        let attrs = elem.attributes;
        let ignoreset:Set<string>;
        if (doNotCopy &&doNotCopy.length) {
            ignoreset=new Set<string>();
            for(let ig of doNotCopy)
                ignoreset.add(ig.toLowerCase());
        }
        for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name!='class' && attrs[i].name!='style' &&  !EventHandlers.isEventAttr(attrs[i].name)) {
                if (ignoreset && ignoreset.has(attrs[i].name.toLowerCase()))
                    continue;
                rm.attr(attrs[i].name,this.expandString(attrs[i].value,currtn));
            }
        }  
        
        // copy class and attributes
        if (elem.classList && elem.classList.length) {
            for(let i=0;i<elem.classList.length;i++) {
                let str=this.expandString(elem.classList[i],currtn);
                if (!str || str.length==0)  {
                    console.warn(`class [${elem.classList[i]}] expanded to empty string`);
                } else {
                    rm.class(str);
                }
            }
        }

        // set inline styles
        let str=elem.getAttribute('style');
        if (str && str.length) {
            let pairs:string[][]=str.slice(0, str.length - 1).split(';').map(x => x.split(':')); //// gives [ ['color', 'blue'], ['display', 'flex'] ]
            for(let pair of pairs) {
                if (pair && pair.length>1 && pair[0] && pair[1] && pair[0].trim().length)  {
                    rm.style(pair[0].trim(),this.expandString(pair[1],currtn));
                }
            }
        }
    }

    /**
     *  Copy's the snode's attributes and classes and styles to the tnode 
     * 
     * 
     * @param tnode The tnode to copy to.
     * @param snode The node to copy from.
     * @param doNotCopy A list of attribute NOT to copy
     * @param attr2set Additional attributes to set (array of key/value pairs)
     */
     public copyAttrExceptToTNode(tnode:Node, snode: Node, doNotCopy?: string[],attr2set?:string[][],currtn?:TargetNode) {
        let elem:Element = (snode as any as Element);
        let telem:Element = (tnode as Element);
        let attrs = elem.attributes;
        let ignoreset:Set<string>;
        if (doNotCopy &&doNotCopy.length) {
            ignoreset=new Set<string>();
            for(let ig of doNotCopy)
                ignoreset.add(ig.toLowerCase());
        }

        //let tnodeJQ=$(tnode);

        for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name!='class' && // class handled seperately via classlist below
                attrs[i].name!='style' &&  // styles handled seperately
                attrs[i].name!='remove'  && 
                !EventHandlers.isEventAttr(attrs[i].name)
                && attrs[i].name!='id') { // as its a control, we cant overwrite the ui5 id with the source's
                if (ignoreset && ignoreset.has(attrs[i].name.toLowerCase()))
                    continue;
                telem.setAttribute(attrs[i].name,this.expandString(attrs[i].value,currtn));
            }
        }  

        // if any attributes to set, copies these too:
        if (attr2set) {
            for(let kv of attr2set) {
                telem.setAttribute(kv[0],kv[1]);
            }
        }
        
        // copy class and attributes
        if (!(ignoreset && ignoreset.has('class'))) {
            if (elem.classList && elem.classList.length) {
                for(let i=0;i<elem.classList.length;i++) {
                    telem.classList.add(this.expandString(elem.classList[i],currtn));
                }
            }
        }

        // set inline styles
        let str=elem.getAttribute('style');
        if (str && str.length) {
            let stylestr=(telem.getAttribute('style')) ? telem.getAttribute('style'):'';
            /* why parse to pairs? 
            let pairs:string[][]=str.slice(0, str.length - 1).split(';').map(x => x.split(':')); //// gives [ ['color', 'blue'], ['display', 'flex'] ]
            for(let pair of pairs) {
                if (pair && pair.length>1 && pair[0] && pair[1] && pair[0].trim().length)  {
                    stylestr+=`${pair[0].trim()}:${this.expandString(pair[1])};`;
                }
            }*/
            stylestr+=this.expandString(str,currtn);
            if (stylestr.length>0) {
                telem.setAttribute('style',stylestr);
            }

        }
        
        
        // remove
        for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name=='remove') {
                telem.removeAttribute(attrs[i].value);
            }
        }
        
    }

    

    


    /**
     * Returns the this object that is visible to scripts and string templates in the html page
     */
    public getThis() : T {
        return this.This;
    }



    protected loadElementPromises:Promise<any>[]=[];
    /**
     * imports any ws-element import statements in the head of the template, then sets the ready flag.
     * Returns a promise that resolves when all imports are done and the ready flag is set.
     * 
     * @param doc 
     * 
     */
    public importMarkupComponents(doc: Document) : Promise<any> {
        let head=doc.getElementsByTagName('head');

        this.loadElementPromises=[];
        if (head && head.length>0) {
            let scripts=head[0].getElementsByTagName('script');

            for(let i=0;i<scripts.length;i++) {
                let tn=new TargetNodeImpl(scripts[i]);
                let e=this.makeCoElement(tn); // will use the script factory
                if (isCoElement(e)) {
                    e.onRender(null); // this will push to this.loadElementPromises
                }
            }

        }

        return (
            Promise.all(this.loadElementPromises)
            .then(()=>{
                this.setReady(true);
            })
        );
    }

    public setReady(ready: boolean) {
        this.ready=ready;
    }


    /**
     * Loads a js script using AMD and creates a CoElement out of the loaded module (Module.default)
     * This is then istalled on this instance's element factories.
     * This function also pushes the promise onto this.loadElementPromises, which can be used
     * to wait for all ws-elements to load before rendering the template.
     * 
     * @param js 
     * @returns 
     */
    public loadMarkupFactory(js:string) : Promise<CoElementFactory> {
        // normal page:
        let promise=
         new Promise<CoElementFactory>((resolve,reject)=>{
            require([js], 
                (Module) => {
                    //console.log("here!");
                    try {
                        let factory;
                        if (typeof Module.default === 'function') {
                            factory=new Module.default(); // is an AMD module (compiled ts class)
                        } else {
                            throw `${js} is not a Module`;
                        }

                        resolve(factory);
                    } catch(err)    {
                        if (reject)
                            reject(err);
                        else
                            throw err;
                    }             
                },
                (error)=>{
                    if (reject)
                        reject(error);
                    else
                        throw new Error(error);
                }) ;   
        });

        this.loadElementPromises.push(promise);

        return promise;

    }

    /**
     * execute the javascript in 'script' after setting its 'this' to point to the This object.
     * 
     * @param script 
     */
    public executeScript(script:string) {
        let f=(new Function(script)).bind(this.This);

        return f();
    }

    public expandString(str:string,__currtn:TargetNode) : string {
        //let x=str;
        if (str && str.indexOf('${')>=0) {
            // expand
            (this.This as any).__currtn=__currtn;
            let f=(new Function("try {\n return `"+str+"`;\n}\n catch(e) {\nreturn '';\n}\n")).bind(this.This);
            str=f();
            delete (this.This as any).__currtn;
        } 
        //console.log('INPUT:'+x);
        //console.log(' CVTD:'+str);
        return str;
    }

    protected makeCoElementForTag(tag:string,tn:TargetNode) : CoElement | Promise<CoElement> {
        // use instance factories first
        for(let i=0;i<this.matchingFactories.length;i++)    {
            if (this.matchingFactories[i].match(tag)) {
                return this.matchingFactories[i].factory.makeComponent(tn,this);
            }
        }

        let f=this.instanceFactories.get(tag);
        if (f) {
            if (f.makeComponent)
                return f.makeComponent(tn,this);
            else 
                return new ErrorCoElement(this,tn,`${tag} - no makeComponent()`);
        }


            

        // use static factories next
        f=ConverterImpl.sharedElemFactories.get(tag);
        if (f)
            return f.makeComponent(tn,this);


        // fallback to the default html handler
        return this.DEFAULT_FACTORY.makeComponent(tn,this);
    }


    public makeCoElement(tn:TargetNode) : CoElement | Promise<CoElement> {
        let snode:Node=(tn.replaced) ? tn.replaced:tn.snode;
        switch(snode.nodeType) {
            //case Node.DOCUMENT_NODE: // now handled by BaseThis
            //    return this.makeCoElementForTag('document',tn);
                
            case Node.ELEMENT_NODE: {
                // use static factories first
                let tag=(snode as Element).tagName.toLowerCase();
                return this.makeCoElementForTag(tag,tn);
            }

            default:
                console.warn(`Do not know how to handle ${tn.snode.nodeType}`);
        }

    }

    /**
     * Register a factory which will be called when this converter is called to convert 
     * a node with tagName 'tag'.
     * 
     * @param tag 
     * @param factory 
     */
    public registerFactory(tag:string|((tag:string)=>boolean),factory:CoElementFactory) {
        if (typeof tag=='string')
            this.instanceFactories.set(tag,factory);
        else 
            this.matchingFactories.push({match:tag,factory:factory})
    }

    protected isAsset(pass:any): pass is AssetID {
        return typeof pass =='object' && ('name' in pass);
    }

    /**
     * Import a COML factory.
     * 
     * @param importee The fully qualified path to a COML CoELementFactory (e.g. `coml/element/CoFields`) or the assetId of a COML page.
     */
    public import(importee:string|AssetID,tagForAsset?:string) : Promise<any> {
        if (this.isAsset(importee)) {
            if (!tagForAsset)
                throw new Error(`import(${importee}) -- no tag specified`);
            let factory=new AssetCoElementFactory(importee,tagForAsset);
            factory.registerFactory(this);
            return Promise.resolve();
        } else {
            return(
                this.loadMarkupFactory(importee)
                .then((factory)=>{
                    factory.registerFactory(this);
                })
            )
        }
    }

    /**
     * Finds the parent of 'tn' for which 'matcher' returns true.
     * 
     * @param tn 
     * @param matcher 
     * @returns The parent found or undefined if non.
     */
    public findParent(tn:TargetNode,matcher:(tn:TargetNode)=>boolean) : TargetNode {
        while(tn.parent) {
            if (matcher(tn.parent))
                return tn.parent;
            tn=tn.parent
        }   
    }

    /**
     * Finds the parent of 'tn' for which 'matcher' returns true. Similar to
     * findParent, except the iteration that resulted in the child 'tn' is also returned.
     * 
     * @param tn 
     * @param matcher 
     * @returns Either {parent:The parent found,iteration:The iteration of the branch that resulted in the child } or undefined if no parent
     */ 
    public findParentAndIteration(tn:TargetNode,matcher:(parenttn:TargetNode,iteration?:number)=>boolean) : {parent:TargetNode,iteration:number} {
        while(tn.parent) {
            let iteration=tn.parent.getIterationOfChild(tn);
            if (matcher(tn.parent,iteration)) {
                return {
                    parent:tn.parent,
                    iteration:iteration
                }
            }
            tn=tn.parent;
        }   
    }

    /**
     * Finds the first child of 'tn' for which 'matcher' returns true.
     * 
     * @param tn The root to find children of
     * @param matcher Matching function
     * @returns The parent found or undefined if non.
     */
    public findChild(tn:TargetNode,matcher:(tn:TargetNode)=>boolean) : TargetNode {
        return this.find(tn,matcher);
    }

    protected log2depth(depth:number,msg:string){
        let m='||';
        for(let i=0;i<depth;i++)    {
            m+='--';
        }
        m+=msg;
        console.log(m);
    }

    protected find(tn:TargetNode,matcher:(tn:TargetNode)=>boolean,depth?:number) : TargetNode {
        if (typeof depth=='undefined')
            depth=0;
        //this.log2depth(depth,'tn='+toStr(tn.snode));
        if (matcher(tn)) {
            //this.log2depth(depth,'FOUND');
            return tn;
        }
        for(let i=0;i<tn.children.length;i++) {
            for(let j=0;j<tn.children[i].length;j++) {
                let f=this.find(tn.children[i][j],matcher,depth+1);
                if (f)
                    return f;
            }
        }
    }



    
    

    /**
     * Given a tdoc node, checks if it has a 'data-coid' tag and if so, finds the TargetNode that matches it
     * 
     * @param node A tnode
     * @returns The found TargetNode
     */
    protected findTargetNodeByTNode(node:Node) : TargetNode {
        if (node instanceof Element) {
            let wsid=node.getAttribute('data-coid');
            if (wsid)
                return(this.findChild(this.root,(tn)=>tn.getId()==wsid))
        }
    }

    /**
     * Returns the snode given a selector in either the source or target dom.
     * 
     * This source document is first searched, then its imported.
     * 
     * If not found and the 'couldBeTdocSelector' is true, will then search the target document .If found, its wsid is used to find
     * the snode.
     * 
     * @param selector The sdom or tdom selector.
     * @param couldBeTdocSelector 
     * @returns The found snode
     */
    protected getSnodeFromSorTselector(selector:string,couldBeTdocSelector?:boolean) : Node {
        let snode=this.doc.querySelector(selector);
        if (snode)
            return snode;
        if (this.importedDocs)  {
            this.importedDocs.forEach((doc)=>{
                if (!snode) {
                    snode=doc.querySelector(selector);
                }
            })
        }
        if (snode)
            return snode;
        if (couldBeTdocSelector) {
            let tnode=document.querySelector(selector);
            if (tnode) {
                let tn=this.findTargetNodeByTNode(tnode);
                if (tn)
                    return tn.snode;
            }
        }
    }



    /**
     * Returns the target node.
     * 
     * @param node An snode,tnode or selector on either source document or target document.
     * @returns The first found TargetNode
     */
    protected asTargetNode(node:Node|string|TargetNode) : {snode:Node,tn:TargetNode} {
        
        if (typeof node=='string') { 
            // its a query selector
            let n=this.getSnodeFromSorTselector(node); // try directly on the source doc
            if (!n) {
                // could it be a querySelector on the target document?
                let e=document.querySelector(node);
                if (e) {
                    let tn=this.findTargetNodeByTNode(e);
                    if (tn) // it was a tnode
                        return {tn:tn,snode:tn.snode};
                }
            } else {
                // found the snode, find its TargetNode
                let tn=this.find(this.root,tn=>tn.matchSnode(snode2match=>snode2match==n));
                return {tn:tn,snode:n};
            }
        } else if (isTargetNode(node)) {
            // its a TargetNode
            return {tn:node,snode:node.snode};
        }
        else {
            // its a Node
            let n=this.findTargetNodeByTNode(node);
            if (n) // it was a tnode
                return {tn:n,snode:n.snode};
        }
        return {tn:null,snode:null}
    }

    /**
     * Finds an snode given an snode,tnode,TargetNode or sdoc / tdoc selector.
     * 
     * @param node 
     * @returns The found source document node.
     */
    protected snodeFromAny(node:Node|string|TargetNode) {
        let snode:Node;
        if (typeof node=='string')
            snode=this.getSnodeFromSorTselector(node,true);
        else if (node instanceof Node) {
            snode=node;
            let tn=this.findTargetNodeByTNode(snode);
            if (tn)
                snode=tn.snode;
        } else {
            snode=node.snode;
        }

        return snode;
    }

    /**
     * Returns the generated target node (tnode) for the given parameter. Optionally lets the caller specify a 'state changer'
     * callback that will be called to effect changes of state to the tnode. The state changer is stored so that
     * the changes are recreated on every repaint of the tnode.
     *  
     * @param node an snode, TargetNode or source or target document selector.
     * @param changeid (Optional but required if changer is specified) a unique id of the change (If the change is readded with the same id, it will replace the earlier change)
     * @param changer (Optional) The callback to effect changes, that will be called when the tnode is available. If currently available, the callback will be called immediately. The callback will also be called on any subsequent repaint of the tnode.
     */
    public $(node:Node|string|TargetNode,changeid?:string,changer?:(Element)=>any) : Element {
        if (!changer && !changeid) {
            const {tn,snode}=this.asTargetNode(node);
            if (tn && tn.tnode instanceof Element)
                return tn.tnode;
        } else {
            if (changeid.length==0)
                changeid=undefined;
            // we need the snode, so we can attach/remove the change to it (TN may not exist)
            let snode:Node=this.snodeFromAny(node);

            if (snode) {
                if (changeid) // persist or delete
                    this.stateChanger(changeid,snode,changer); // add, or delete if changer is null or changeid is empty (single shot)
                if (changer) {
                    // run now
                    let tn=this.find(this.root,tn=>tn.matchSnode(snode2match=>snode2match==snode));
                    if (tn && tn.tnode)
                        changer(tn.tnode); 
                    else if (!changeid) {
                        // persist once
                        let onceid='@ONCE'+Math.floor(Math.random() * 1000000000);
                        this.stateChanger(onceid,snode,changer); // add with an id that will cause it to be removed on first call
                    }
                }
            }
        }
    }

    /**
     * Adds a state change function, which can make changes to the attributes etc of a tnode that are different from those
     * copied from the snode. The changer callback is called on every render of the tnode so that state changes affected
     * once are not lost due to regeneration.
     * 
     * @param id A unique id of the state change.
     * @param snode The snode to add/remove the changer for
     * @param changer The changer callback to add or undefined to remove existing changers. This will be called with the tnode ELement and can make any changes to it.
     */
    public stateChanger(id:string,snode:Node,changer?:StateChanger) {
        if (changer) {
            let statechangers=this.getStateChangers(snode,true);
            statechangers[id]=changer;
        } else {
            // deleting             
            let statechangers=this.getStateChangers(snode);
            if (statechangers) {
                delete statechangers[id];
                if (Object.keys(statechangers).length==0)
                    this.removeStateChangers(snode);
            }
        }
    }

    /**
     * Given a selector or element in either the source or target document, finds the associated CoElement.
     * 
     * @param selectorOrNode an snode,tnode, TargetNode or source or target document selector.
     * @returns The CoElement associated with the 
     */
    public  get(selectorOrNode:Node|string|TargetNode,getfunc?:Get) : CoElement<T> {
        const {tn,snode}=this.asTargetNode(selectorOrNode);
        if (tn) {
            if (getfunc) {
                if (tn.component) {
                    getfunc(tn.component);
                } else if (snode) {
                    // add as a pending get
                    this.setGets(snode,getfunc);
                }
            }
            return tn.component as CoElement<T>;
        } else if (getfunc && snode) {
            // add as a pending get
            this.setGets(snode,getfunc);
        }
    }

    /**
	 * Adds an event handler to the given node.
	 * 
	 * @param node      The node or its selector
	 * @param eventname The event name, e.g. 'click' or 'mycustomevent'
	 * @param handler  The callback.
	 */
	//public addEventListener(node:Node|string|TargetNode,eventname:string,handler:(event:Event)=>any) {
    //    this.asTargetNode(node).addEventListener(eventname,handler);
    //}

    /**
     * Removes an eventhandler added via addEventListener.
     * 
     * @param eventname 
     * @param handler 
     * @returns 
     */
	//public removeEventListener(node:Node|string|TargetNode,eventname:string,handler:(event:Event)=>any) {
    //    this.asTargetNode(node).removeEventListener(eventname,handler);
    //}


    /**
     * Rebuild the given node as if from new. This is a more expensive operation than an invalidate
     * as the node's component and children are rebuilt.
     * 
     * @param snode The snode, its sdom query selector, or the target node to rebuild. If not specified, defaults to teh root TargetNode
     *
    public  rebuild(snode?:Node|string|TargetNode) {
        let tn:TargetNode=(snode) ? this.asTargetNode(snode):this.root;
        if (!tn) {
            throw new Error(`rebuild() - cant find ${toStr(snode)}`);
        }
        this.rebuildInt(tn);
    }*/

    protected rebuildIntCo(tn:TargetNode,co:CoElement,patch:Patch) {
        tn.component=co;
        if (co.getTN()!=tn && tn.parent) {
            tn.parent.replaceChild(tn,co.getTN());
            tn=co.getTN();
        }
        this.invalidateInt(tn,patch);
    }

    protected rebuildInt(tn:TargetNode) {
        let patch:Patch=tn.getPatch(); // get the patch BEFORE we reset - otherwise position info may be lost
        tn.reset(); // resets the tn to prestine
        let co=this.makeCoElement(tn);
        if (isCoElement(co)) {
            this.rebuildIntCo(tn,co,patch);
        }
        else {
            co.
            then((co)=>{
                this.rebuildIntCo(tn,co,patch);
            })
        }
    }

    public invalidate(toinvalidate?:Node|string|TargetNode,forget?:boolean) {
        const {tn,snode}=(toinvalidate) ? this.asTargetNode(toinvalidate):{tn:this.root,snode:this.root.snode};
        if (!tn) {
            throw new Error(`invalidate() - cant find ${toStr(toinvalidate)}`);
        }
        this.invalidateInt(tn,undefined,forget);
    }

    protected isNonElementGenerating(tn:TargetNode) : boolean {
        // hack
        if (tn.snode.nodeType==Node.ELEMENT_NODE) {
            let tag=(tn.snode as Element).tagName.toLowerCase();
            if (tag=='html'||tag=='body')
                return true;
        }
    }

    protected invalidated:Map<TargetNode,boolean>=new Map();

    protected invalidateInt(tn:TargetNode,patch?:Patch,forget?:boolean) {
        if (forget && tn.component && tn.component.forget) {
            tn.component.forget();
            return; // do NOT call render() below - as the forget() should have called it, or will call it when it rebuilds state
        }

        if (this.invalidated.has(tn))
            return;
        try {
            this.invalidated.set(tn,forget);
            Promise.resolve()
            .then(()=>{
                let forget=this.invalidated.get(tn);
                this.invalidated.delete(tn);
                //console.log(`-------repainting from ${toStr(tn)}------`);
                //if ('ws-page-container.u-app-viewer-container.'==toStr(tn))
                //    console.log('--------here---------');
                // note we cannot render if
                // 1. there is no Patch available (Cant patch back to the parent)
                // 2. the coelement does not generate its own element (its children will write to a parent element that does not exist)
                let origTN=tn;
                if (!patch)
                    patch=tn.getPatch();
                while(tn.parent && (!patch || this.isNonElementGenerating(tn)))   {
                    tn=tn.parent;
                    patch=tn.getPatch();
                }
                
                if (patch) {
                    //console.log(`     (actual= ${toStr(tn)})`)
                    let rm=Implementations.createRender(patch);
                    this.renderNode(rm,tn);
                } else {
                    console.warn(`invalidateInt() - unable to repaint ${toStr(origTN)} because neither it nor an ancestor has a position.`);
                }
            })
            .catch(()=>{
                this.invalidated.delete(tn);
            })
        } catch(x) {
            this.invalidated.delete(tn);
        }
    }



    protected deserialize(val:string) : any {
        if (typeof val =='string') {
            if (val.indexOf('{')>=0) {
                try {
                    return JSON.parse(val.replace(/'/g,'"'));
                } catch(e) {
                    return val;
                }
            }
        }
        return val;
    }

    /**
     * Finds the source TargetNode that generated the target id or node 'idnode'
     * 
     * @param nodeIdOrSelector The target node, or its 'data-coid' attribute id, or a selector.
     * @returns The found source target node or null if non found. To fetch the node, use `tn.snode`
     *
    public getSourceNode(nodeIdOrSelector:Node|string) : TargetNode {
        let id:string;
        if (nodeIdOrSelector && (typeof nodeIdOrSelector!='string')) {
            id=(nodeIdOrSelector as Element).getAttribute('data-coid');
        } else {
            // is it an id (number) ?
            let isnum = /^\d+$/.test(id);
            if (isnum) {
                id=nodeIdOrSelector as string;
            }
            else { // its a selector
                return this.getSourceNode(this.$(nodeIdOrSelector));
            }
        }
        return(this.findChild(this.root,(tn)=>tn.getId()==id))
    } */

    
    

    protected attachControl(parent:Node|string|TargetNode,control:CoElement)  {
        const {tn,snode}=this.asTargetNode(parent);
        if (!tn) {
            console.warn(`Unable to attach control to node ${toStr(parent)}`);
            return;
        } else {
            let cvt = control.getCvt();
            if (isAttachable(cvt)) {
                this.addChild(cvt);
            }

            tn.attachControl(control);
            this.invalidateInt(tn);
        }
    }


    /**
     * Attach an asset's control to the target node.
     * 
     * @param  parent The target dom node or query selector whose child the new control will become.
     * @param  toAttach The control or asset to attach.
     * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
     * 
     * @return A promise when the control is loaded (if it was an asset) attached.
     */
     public attach(parent:Node|string,toAttach:AssetID|string|CoElement,parameters?:{[key:string]:any}) : Promise<CoElement> {
        if (isCoElement(toAttach)) {
            // its a control
            this.attachControl(parent,toAttach);
            return Promise.resolve(toAttach);
        }

        let asset=Implementations.getAssetFactory()
                    .get(toAttach);

        if (!isCoElementAsset(asset))
            throw new Error(`attach: ${stringifyAssetID(toAttach)} is not a CoElementAsset`);
        
        return(
            asset
            .asCoElement(undefined,(cvt)=>{
                cvt.addOnThisCreatedListener((This:This)=>{
                    This.parameters=parameters;
				});
            })
            .then((coElement) => {

                this.attachControl(parent,coElement);
                return coElement
            })
        );
    }

    /**
     * Returns the TargetNode and control that was attached at toCheck 
     * 
     * @param toCheck 
     * @returns 
     */
    public findAttached(toCheck:string|CoElement) : {targetnode:TargetNode,control:CoElement} {
        let parent:TargetNode;
        let control:CoElement;
        if (isCoElement(toCheck)) {
            parent=this.find(this.root,(tn)=>tn.isAttached(control=toCheck));
        } else {
            let snode=this.doc.querySelector(toCheck);
            if (snode) {
                parent=this.find(this.root,tn=>tn.matchSnode(snode2match=>snode2match==snode));
            }
        }
        return {targetnode:parent,control:control};
    }

    /**
     * Detaches a previously attached() control.
     * 
     * @param toDetach The control that was attached, or the target node or query selector of the parent from which to attach all previously attached controls
     */
    public detach(toDetach:string|CoElement) : Promise<any> {
        const {targetnode: parent,control}=this.findAttached(toDetach);
        if (parent) {
            // find the attached
            if (control) {
                parent.removeAttachedControl(control);
                let cvt=control.getCvt();
                if (isAttachable(cvt)) {
                    this.removeChild(cvt);
                }
            } else {
                parent.removeAllAttachedControls((control)=>{
                    let cvt=control.getCvt();
                    if (isAttachable(cvt)) {
                        this.removeChild(cvt);
                    }
                });
            }
            return Promise.resolve(this.invalidateInt(parent));
        }
    } 

    /**
     * Adds the id of the source targetnode to the rendered object. Should be called 
     * prior to rm.openEnd().
     *      * <p>
     * @param rm 
     * @param tn 
     * @returns 
     */
    public encodeWSE(rm:Render,tn:TargetNode) : Render  {
        //rm.attr('data-coid',tn.getId());
        
        return rm;
    }



    /**
     * Render the children of node.
     * 
     * @param rm 
     * @param parenttn The parent treenode whose snode's children are to be rendered 
     * @param iteration the repeat iteration (0 for first and incrementing for each successive repeat)
     */
     public renderChildren(rm: Render,parenttn:TargetNode,iteration:number=0) {

        // render any attached (temp) components only on the first iteration:
        if (iteration==0)
            parenttn.renderAttached(rm,this);

        let childNodes=parenttn.sourceChildNodes();
        for (let i = 0; i < childNodes.length; i++) {
            let cn=childNodes[i];

            if (cn.nodeType==Node.ELEMENT_NODE) {
                let cindex=parenttn.findChildForNode(cn,iteration);
                let ctn:TargetNode;
                if (cindex==-1) {
                    // create a new one

                    ctn=parenttn.makeTargetNode(cn,this);// new TargetNode(cn,undefined,parenttn);
                    parenttn.addChild(ctn,iteration);
                } else {
                    ctn=parenttn.children[iteration][cindex];
                    ctn.marked=TNS.REUSED;
                }
                // parent heriarchy must be complete so during render a wselemnt can traverse to top - e.g. to add controls.
                ctn.getOwner(this).renderNode(rm,ctn);
            }
            else if (cn.nodeType==Node.TEXT_NODE) {
                rm.text(this.expandString(cn.nodeValue,parenttn));
            }
            else if (this.renderComments && cn.nodeType==Node.COMMENT_NODE) {
                let content=cn.textContent;
                //console.log(content);
                if (content) {
                    rm.unsafeHtml(`<!--${content}-->`);
                }

            }
        }
    }



    protected elemenRenderListeners:Map<string,((tag:string,e:CoElement)=>void)[]>;

    /**
     * Adds a listener that will be called just before any element whose tag matches any entry in 'tags' renders the source tree.
     * 
     * @param tags 
     * @param listener 
     */
    public addOnElementRenderListener(tags:string[],listener:(tag:string,e:CoElement)=>void) {
        if (!this.elemenRenderListeners)
            this.elemenRenderListeners=new Map();
        
        for(let tag of tags) {
            let ners=this.elemenRenderListeners.get(tag);
            if (!ners)  {
                ners=[];
                this.elemenRenderListeners.set(tag,ners);
            }
            ners.push(listener);
        }
    }

    /**
     * Removes a previously added listener from the tags against which it was added.
     * 
     * @param tags ws-element to triggerthe listener or '' for all
     * @param listener 
     * @returns 
     */
    public removeOnElementRenderListener(tags:string[],listener:(tag:string,e:CoElement)=>void) {
        if (!this.elemenRenderListeners)
            return;
        
        for(let tag of tags) {
            let ners=this.elemenRenderListeners.get(tag);
            if (ners && ners.length>0)  {
                let n=ners.indexOf(listener);
                if (n!=-1) {
                    ners.splice(n,1);
                }
            }
        }
    }

    private combine(a:((tag:string,e:CoElement)=>void)[],b:((tag:string,e:CoElement)=>void)[]) : ((tag:string,e:CoElement)=>void)[] {
        if (!a)
            return b;
        if (!b)
            return a;
        return a.concat(b);
    }

    protected triggerListeners(node:Node,e:CoElement) {
        if (!this.elemenRenderListeners || !this.elemenRenderListeners.size) {
            return;
        }
        if (node instanceof HTMLElement) {
            let tag=(node as HTMLElement).localName;
            let listeners0=this.elemenRenderListeners.get(tag);
            let listeners1=this.elemenRenderListeners.get('');
            let listeners=this.combine(listeners0,listeners1);
            if (listeners && listeners.length) {
                for(let listener of listeners)
                    listener(tag,e);
            }
        }
    }

    protected allCompleted:Promise<any>[]; // keeps track of the promises of any AsyncLoadingElements
    private depth:number=0;

    private dots(count:number) {
        let s='';
        while(count-->0)
            s+='-';
        return s;
    }

    private preRenderLog(tn:TargetNode) {
        console.log(`D[${this.assetId.name}]${this.dots(this.depth)}->S[${toStr(tn.snode)}] T[${toStr(tn.tnode)}]`);
    }

    private postRenderLog(tn:TargetNode) {
        console.log(`D[${this.assetId.name}]${this.dots(this.depth)}-<S[${toStr(tn.snode)}] T[${toStr(tn.tnode)}]`);
    }

    public renderNode(rm:Render,tn:TargetNode)  {
        /*if (tn==this.getRoot()) {
            console.log(`rendering root  ${toStr(tn.snode)} allcomp=${this.allCompleted.length}`);
            this.allCompleted=[];
        }*/
        tn.initMark();
        if (tn.component) {
            this.triggerListeners(tn.snode,tn.component);
            try {
                //this.preRenderLog(tn);
                this.depth++;
                //if (toStr(tn)=='head')
                //    debugger;
                tn.render(rm);
            }
            catch(x) {
                console.error(`An exception occurred during rendering of ${toStr(tn)}`);
                console.error(x);
            } 
            finally{
                this.depth--;
                //this.postRenderLog(tn);
            }
            if (this.allCompleted && typeof (tn.component as any).completed == 'function') {
                this.allCompleted.push((tn.component as any).completed());
            }
        }
        tn.retireUnused();
    }

    /**
     * Returns a promise that resolves when all async loading ws elemets complete rendering, or rejects if any rejects.
     * @returns 
     *
    public completed() : Promise<any> {
        return Promise.all(this.allCompleted);
    }

    public howMany() {
        console.log(`--At this time ${this.allCompleted.length} promises`);
    }*/

    /////////////////////////////////////////////////////////////////////////
    // Attachable
    ///////////////////////////////////////////////////////////////////////// 
    protected attachment:AttachmentImpl;
    protected parent:Attachable;
    protected children:Attachable[]=[];


    protected addStylesToAttachment(attachment:AttachmentImpl) {
        if (this.getDocument()) {
            attachment.addDependency(new Style(this.getDocument(),this.assetId));
        }
    }

    protected removeStylesFromAttachment(attachment:AttachmentImpl) {
        if (this.getDocument()) {
            attachment.removeDependency(new Style(this.getDocument(),this.assetId));
        }
    }

    /**
     * Set the attachment on this converter - when it is attached to a node on the window.document
     * 
     * @param attachment 
     */
    setAttachment(attachment:AttachmentImpl) {
        if (this.attachment) {
            this.removeStylesFromAttachment(this.attachment);
        }
        this.attachment=attachment;
        if (this.attachment)
            this.addStylesToAttachment(this.attachment);

        this.children.forEach((child)=>{
            child.setAttachment(this.attachment);
        });
    }

        
    addChild(child:Attachable) {
        this.children.push(child);
        child.setParent(this);
        child.setAttachment(this.attachment);
    }

    removeChild(child:Attachable) {
        let index=this.children.indexOf(child);
        if (index>=0) {
            child.setAttachment(null);
            this.children.splice(index,1);
            child.setParent(null);
        }
    }

    setParent(parent:Attachable) {
        this.parent=parent;
    }

    getParent(parent:Attachable) : Attachable {
        return this.parent;
    }

    protected changersBySnode:Map<Node,StateChangers>;


    /**
     * Remove a state changer for this snode.
     * 
     */
    protected removeStateChangers(snode: Node): void {
        if (this.changersBySnode) {
            this.changersBySnode.delete(snode);
            if (this.changersBySnode.size==0)
                this.changersBySnode=null;
        }
    }


    /**
     * Get StateChangers for this snode. if 'createIfNotExist' is true, then create if it doesnt exist
     * 
     * @param snode 
     * @param createIfNotExists 
     */
    public getStateChangers(snode: Node, createIfNotExists?: boolean): StateChangers {
        if (!this.changersBySnode && createIfNotExists)
            this.changersBySnode=new Map();
        if (this.changersBySnode) {
            let sc=this.changersBySnode.get(snode);
            if (sc)
                return sc;
            if (createIfNotExists) {
                sc={};
                this.changersBySnode.set(snode,sc);
                return sc;                
            }
        }
    }

    protected gets:Map<Node,Get[]>;

    /**
     * Set a Gets function on the snode. If no Get then all Gets are removed from the given snode.
     * 
     * @param snode 
     * @param get 
     */
    public setGets(snode: Node,get?:Get): void {
        if (get) {
            if (!this.gets) {
                this.gets=new Map();
            }
            let arr:Get[]=this.gets.get(snode);
            if (!arr) {
                arr=[];
                this.gets.set(snode,arr);
            }
            arr.push(get);
        } else {
            // delete
            if (this.gets) {
                this.gets.delete(snode);
            }
        }
    }


    /**
     * Returns all currently set Get functions on this snode.
     * 
     * @param snode 
     */
    public getGets<T extends CoElement=CoElement>(snode: Node): Get<T>[] {
        if (this.gets) {
            return this.gets.get(snode);
        }
    }
     

}