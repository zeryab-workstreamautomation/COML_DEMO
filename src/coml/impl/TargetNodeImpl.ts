import { Converter } from "../Converter";
import { Implementations } from "../Implementations";
import { CoElement, isCoElement } from "../CoElement";
import { Render } from "../Render";
import { Repaint } from "../Repaint";
import { Patch } from "../Patch";
import { TargetNode, TNS } from "../TargetNode";
import { pad, toStr } from "./Debug";
import { EventHandlers } from "../html/EventHandlers";
import { This } from "../This";
import { StateChanger, StateChangers } from "../StateChanger";
import { Get } from "../Get";


export type SourceChildNodesSupplyer = (tn:TargetNodeImpl)=> NodeListOf<ChildNode> | Node[] ;

export type MakeTargetNode = (snode:Node,wselement?:CoElement,parent?:TargetNodeImpl) => TargetNodeImpl;

/**
 * TargetNode stores the state of the conversion between a Source node (snode) in the COML html file
 * and the rendered final Node (target node or tnode).
 * 
 * 
 */
 export class TargetNodeImpl implements TargetNode  {
    /**
     * The source node that this target node represents
     */
    public snode:Node;
    /**
     * The target node that is generated by the CoElement's onRender()
     */
    public tnode:Node;  
    public replaced:Node; // used when an snode is replaced during templating or attach. The node that was replaced.
    public component:CoElement;
    public parent?:TargetNode;
    public children:TargetNode[/* iteration */][/* index */]=[]; 
    public marked:TNS;

    protected id;
    protected attached:CoElement[];
    protected childp?:{[iteration:number]:{[tag:string]:any}};


    constructor(snode:Node,wselement?:CoElement,parent?:TargetNode) {
        this.snode=snode;
        this.component=wselement;
        this.parent=parent;
    }

    /**
     * Given a child snode (as returned by sourceChildNodes()), create its TargetNode
     * with component
     * 
     * The implementation will:
     *      1. use its owning Converter to create the CoElement for the new child.
     *      2. Create a new instance of a TargetNode as the child
     *      3. Add this CoElement to the child's 'component'
     * 
     * @param snode 
     * @returns 
     */
    public makeTargetNode(snode:Node,cvt:Converter<This>): TargetNode {
        let ctn:TargetNode=new TargetNodeImpl(snode);
        ctn.parent=this; // so if the constructor of the CoElement tries to access parent, it will work
        let co=ctn.getOwner(cvt).makeCoElement(ctn);
        if (isCoElement(co)) {
            ctn.component=co;
        } else {
            co
            .then((co)=>{
                if (co.getTN()!=ctn && ctn.parent) {
                    ctn.parent.replaceChild(ctn,co.getTN());
                    let octn=ctn;
                    ctn=co.getTN();
                    ctn.replaced=octn.snode;
                }
                co.getCvt().invalidate(ctn);
            });
        }
        return ctn;
    }


    /**
     * Return the Converter that 'owns' this TargetNode. This converter will be used
     * to render this TargetNode, and hence its 'This' will be use during rendering of the TargetNode.
     * 
     * @param defaultOwner The default owner.
     * @returns 
     */
    public getOwner(defaultOwner:Converter<This>) {
        return defaultOwner;
    }


    public getId(): any {
        if (!this.id) {
            this.id=''+Math.floor(Math.random() * 1000000000);
        }
        return this.id;
    }



    /**
     * Returns the html child Nodes of this TargetNode which should be used for creating 
     * child TargetNodes.
     * 
     * During templating, the actual nodes returned may be different from the true children of this.snode
     * 
     * @returns 
     */
    public sourceChildNodes() : NodeListOf<ChildNode> | Node[]{
        //if (this.sourceChildNodesSupplyer)
        //   return this.sourceChildNodesSupplyer(this);
        return this.snode.childNodes;
    }


    /**
     * returns all target nodes generated by this source node.
     * 
     * @returns 
     */
    public getGeneratedNodes(): Node[] {
        if (!this.id)
            return;

        let al=document.querySelectorAll(`[data-coid="${this.id}"]`);
        if (al) {
            let ns:Node[];

            al.forEach((el)=>{
                if (!ns)
                    ns=[];
                ns.push(el);
            });

            return ns;
        }

    }

    /**
     * Adds a  child target node as a child to this target node, for the iteration.
     * 
     * @param tn 
     * @param iteration 
     */
    public addChild(tn:TargetNode,iteration:number) {
        tn.parent=this;
        if (this.children.length<iteration+1) {
            for(let i=this.children.length;i<iteration+1;i++) {
                this.children.push([]);
            }
        }
        this.children[iteration].push(tn);
        tn.marked=TNS.ADDED;
    }

    /**
     * Replace the child 'tn' with the replacement 'rtn'
     * 
     * @param tn 
     * @param rtn 
     */
    public replaceChild(tn: TargetNode, rtn: TargetNode) {
        tn.parent=this;
        for(let i=0;i<this.children.length;i++) {
            let c=this.children[i];
            for(let j=0;j<c.length;j++) {
                if (c[j]==tn) {
                    c[j]=rtn;
                    rtn.parent=this;
                }
            }  
        }
    
    }


    /**
     * Remove this target node from the render tree, and all its children.
     */
    remove(dontNullParent?:true) {
        this.removeAllChildren();
        if (!dontNullParent)
            this.parent=undefined;
        if (this.component && this.component.cleanup)
            this.component.cleanup();
        this.component=undefined;
        //this.sourceChildNodesSupplyer=undefined;
        //this.targetNodeMaker=undefined;
        if (this.replaced)
            this.snode=this.replaced;
    }

    /**
     * Remove all children from this target node.
     */
    public removeAllChildren() {
        for(let it of this.children)
            for(let t of it)
                t.remove();
        this.children=[];    
    }


    
    /**
     * remove any unused children, calling the attached wselement's 'cleanup' if supplied.
     * 
     * @param parenttn 
     */
    public retireUnused() {
        for(let i=this.children.length-1;i>=0;i--) {
            let c=this.children[i];
            for(let j=c.length-1;j>=0;j--) {
                if (c[j].marked==TNS.MARKED) {
                    // marked for removal
                    c[j].remove();
                    c.splice(j,1);
                }
            }
            if (c.length==0)    {
                this.children.splice(i,1);
            }
        }
    }
    

    /**
     * Returns the index in children of the child whose node matches 'cn'
     * and was generated in iteration number 'iteration' previously.
     * 
     * @param cn 
     * @param iteration 
     * @returns the index in children or -1 if not found.
     */
    public findChildForNode(cn: Node,iteration:number) : number {
        if (this.children && this.children[iteration]) {
            for(let i=0;i<this.children[iteration].length;i++) {
                if (this.children[iteration][i].snode===cn || this.children[iteration][i].replaced==cn) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Returns the iteration to which the direct child `child` belongs.
     * 
     * @param child A direct child of this TargetNode
     * @returns The iteration, or -1 if not found.
     */
    public getIterationOfChild(child:TargetNode) : number {
        if (this.children) {
            for(let iteration=0;iteration<this.children.length;iteration++) {
                if (this.children[iteration]) {
                    for(let i=0;i<this.children[iteration].length;i++) {
                        if (this.children[iteration][i]===child) {
                            return iteration;
                        }
                    }
                }
            }
        }
        return -1;
    }

    

    public initMark() {
        for(let it of this.children)
            for(let t of it)
                t.marked=TNS.MARKED;
    }

    

    /*
    public getControl() : CoElement {
        return this.control;
    }*/

    /**
     * Add an 'attached' control (such as added by this.attach()) to this node.
     * 
     */
    public attachControl(control: CoElement) {
        if (!this.attached)
            this.attached=[];
        this.attached.push(control);
        //this.addControlToParent(control);
    }

    public removeAttachedControl(control:CoElement) {
        if (!this.attached)
            return;
        let found=-1;
        this.attached.forEach((c,index)=>{
            if (c==control)
                found=index;
        });
        if (found!=-1) {
            //this.removeControlFromParent(control);
            this.attached.splice(found,1);
            if (this.attached.length==0)
                this.attached=null;
        }
    }

    public removeAllAttachedControls(cb?:(comp:CoElement)=>any) {
        if (!this.attached)
            return;
        
        if (cb) {
            this.attached.forEach((control)=>{
                cb(control);
            })
        }
        this.attached=null;
    }

    public isAttached(control: CoElement): boolean {
        if (!this.attached)
            return false;
        let found=false;
        this.attached.forEach((attached)=>{
            if (attached==control)
                found=true;
        });

        return found;
    }


    public renderAttached(rm:Render,cvt:Converter<This>) {
        if (!this.attached)
            return;
        this.attached.forEach((control)=>{
            //rm.renderControl(control);
            control.getCvt().renderNode(rm,control.getTN());
        })
    }

    /**
     * Renders this target node.
     * This should only be called by a Converter.
     * 
     * @param rm 
     */
    public render(rm:Render) {
        let listenerArray:((ref?:any)=>any)[];
        if (this.listeners && (listenerArray=this.listeners['onPreRender'])) {
            listenerArray.forEach((l)=>{
                l();
            })
        }
        if (this.component.onPreRender) {
            this.component.onPreRender();
        }

        /*
        this.matchSnode((snode)=>{
            if (snode instanceof Element) {
                if (snode.tagName.toLowerCase().indexOf('creature')>=0) {
                    console.log('CREATURE FOUND');
                }
            }
            return false;
        }); */

        this.component.onRender(rm); // this will change this.tnode

        this.attachEventHandlersFromAttributes();
        

        if (this.component.onPostRender)
            this.component.onPostRender(this.tnode);

        this.dispatchEvent('postrender');

        // execute state
        this.runStateChanges();

        // run any pending gets() that didnt resolve because the TargetNode hadnt been created then
        this.runPendingGets();

        if (this.listeners && (listenerArray=this.listeners['onPostRender'])) {
            listenerArray.forEach((l)=>{
                l(this.tnode);
            })
        }
        
    }

    /**
     * Apply all attribute based event handlers (either 'onXXX' or 'co-onXXX') in snode to the 
     * tnode as 'addEventListener('xxxx').
     */
    protected attachEventHandlersFromAttributes() {
        if (this.tnode && this.snode && this.component) {
            let eh=new EventHandlers(this.tnode as Element,this);

            eh.addEventHandlersFromAttrsOf(this.snode as Element,this.component.getCvt());
        }
    }

    

    /**
     * Dispatch a DOM synthetic event on the root node of this object.
     * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
     * 
     * @param eventname The event to send , e.g. 'myevent' 
     * @param detail An arbotrary payload. If not supplied, {sender:this.coelement} will be used.
     * 
     * @returns The custom event. 
     */
    public dispatchEvent(eventname:string,detail?:{[key:string]:any},options?:EventInit) : Event {
		if (!detail)
			detail={sender:this.component}
		else if (!detail.sender) {
			detail.sender=this.component;
		}

		// custom event, see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
		let event=new CustomEvent(eventname,(options) ? Object.assign(options,{detail:detail}):{bubbles:true,detail:detail});

        if (this.tnode) {
		    this.tnode.dispatchEvent(event);
        } else {
            // No tnode - usually because the CoElement does not render a div (e.g. see WSCarousel).
            // In this case we see if the 'on<eventname>' attribute exists on the snode, create a handler bound to our This and call that.
            if (this.snode instanceof Element && this.component && this.component.getCvt()) {
                let script=this.snode.getAttribute('on'+eventname);
                if (script){
                    let eh=new EventHandlers(this.tnode as Element,this);

                    let handler=eh.makeEventHandler(script,this.component.getCvt());
                    if (handler)
                        handler(event);
                }
            }
        }
		return event;
	}

    protected runStateChangeFor(cvt:Converter<This>,snode:Node) {
        if ((this.tnode instanceof Element)) {
            let statechangers:StateChangers=cvt.getStateChangers(snode);

            let tbremoved:string[];
            for(let stateid in statechangers) {
                statechangers[stateid](this.tnode);
                if (stateid.startsWith('@ONCE')) {
                    if (!tbremoved)
                        tbremoved=[];
                    tbremoved.push(stateid);
                }
            }

            if (tbremoved) {
                for(let stateid of tbremoved) {
                    cvt.stateChanger(stateid,snode);
                }
            }

        }
    }

    protected runStateChanges() {
        this.runStateChangeFor(this.component.getCvt(),this.snode);
    }

    protected runGetsForCvt(cvt:Converter<This>,snode:Node) {
        let gets:Get[]=cvt.getGets(snode);
        if (gets) {// delete all
            cvt.setGets(snode); 

            for(let get of gets) {
                get(this.component);
            }
        }
    }

    protected runGetsForAllCvts(snode:Node) {
        this.runGetsForCvt(this.component.getCvt(),snode);
    }

    /**
     * Run any pending gets - `this.gets('co-something',(co)=>{})` calls that are still pending
     */
    protected runPendingGets() {
        if (this.component) {

            let all:Node[]=[];
            this.matchSnode((snode)=>{
                all.push(snode);
                return false;
            });

            for(let snode of all) {
                this.runGetsForAllCvts(snode);
            }
        }
    }

    /**
     * Returns a Patch object that is used during invalidation to attach
     * the regenerated node back to its parent.
     */
    public getPatch() : Patch {
        let parentTnode:Node;
        if (this.tnode && this.tnode.parentNode)
            parentTnode=this.tnode.parentNode;

        if (!parentTnode && (this.parent && this.parent.tnode))
            parentTnode=this.parent.tnode;

        /*
        if (!parentTnode && (this.attachmentNode && this.attachmentNode.tnode))
            parentTnode=this.attachmentNode.tnode;
        */

        if (parentTnode) { 
            return new Repaint(parentTnode,this.tnode);
        }
    }

    
    /**
     * Empty this node, as if it had just been added to its parent, prior to a full regeneration
     */
    public reset() {
        this.remove(true);
    }

    /**
     * Adds a style class to the target node.
     * 
     * @param clazz 
     */
    public addStyleClass(clazz:string) {
        if (this.tnode)
            (this.tnode as Element).classList.add(clazz);
    }

    /**
     * Removes a style from the tnode.
     * 
     * @param clazz 
     */
    public removeStyleClass(clazz:string) {
        if (this.tnode)
            (this.tnode as Element).classList.remove(clazz);
    }

    protected customData?:any;
    protected findCustomData(key:string) {
        if (!this.customData)
            return;
        return this.customData[key];
    }
    protected setCustomData(key:string, value:any) {
        if (!this.customData)
            this.customData={};
        this.customData[key]=value;
    }

    /**
	 * Retrieves, modifies or removes custom data attached to a CoElement.
	 *
	 * Usages:
	 * <h4>Setting the value for a single key</h4>
	 * <pre>
	 *    data("myKey", myData)
	 * </pre>
	 * Attaches <code>myData</code> (which can be any JS data type, e.g. a number, a string, an object, or a function)
	 * to this element, under the given key "myKey". If the key already exists,the value will be updated.
	 *
	 *
	 * <h4>Setting a value for a single key (rendered to the DOM)</h4>
	 * <pre>
	 *    data("myKey", myData, writeToDom)
	 * </pre>
	 * Attaches <code>myData</code> to this element, under the given key "myKey" . If the key already exists,the value will be updated.
	 * While <code>oValue</code> can be any JS data type to be attached, it must be a string to be also
	 * written to DOM. The key must also be a valid HTML attribute name (it must conform to <code>sap.ui.core.ID</code>
	 * and may contain no colon) and may not start with "sap-ui". When written to HTML, the key is prefixed with "data-".
	 *
	 *
	 * <h4>Getting the value for a single key</h4>
	 * <pre>
	 *    data("myKey")
	 * </pre>
	 * Retrieves whatever data has been attached to this element (using the key "myKey") before.
	 *
	 *
	 * <h4>Removing the value for a single key</h4>
	 * <pre>
	 *    data("myKey", null)
	 * </pre>
	 * Removes whatever data has been attached to this element (using the key "myKey") before.
	 *
	 *
	 * <h4>Removing all custom data for all keys</h4>
	 * <pre>
	 *    data(null)
	 * </pre>
	 *
	 *
	 * <h4>Getting all custom data values as a plain object</h4>
	 * <pre>
	 *    data()
	 * </pre>
	 * Returns all data, as a map-like object, property names are keys, property values are values.
	 *
	 *
	 * <h4>Setting multiple key/value pairs in a single call</h4>
	 * <pre>
	 *    data({"myKey1": myData, "myKey2": null})
	 * </pre>
	 * Attaches <code>myData</code> (using the key "myKey1" and removes any data that had been
	 * attached for key "myKey2".
	 *
     *
	 * @param {string|Object<string,any>|null} [vKeyOrData]
	 *     Single key to set or remove, or an object with key/value pairs or <code>null</code> to remove
	 *     all custom data
	 * @param {string|any} [vValue]
	 *     Value to set or <code>null</code> to remove the corresponding custom data
	 * @returns {Object<string,any>|any|null}
	 *     A map with all custom data, a custom data value for a single specified key or <code>null</code>
	 *     when no custom data exists for such a key or this element when custom data was to be removed.
	 * @throws {TypeError}
	 *     When the type of the given parameters doesn't match any of the documented usages
	 * 
	 */
	public data(..._args) : any {
		let argLength = arguments.length;

		if (argLength == 0) {                    // return ALL data as a map
			let aData = this.customData,
				result = {};
			if (aData) {
				for (let i = 0; i < aData.length; i++) {
					result[aData[i].getKey()] = aData[i].getValue();
				}
			}
			return result;

		} else if (argLength == 1) {
			let arg0 = arguments[0];

			if (arg0 === null) {                  // delete ALL data
				delete this.customData; // delete whole map
				return this;

			} else if (typeof arg0 == "string") { // return requested data element
				return this.findCustomData(arg0);

			} else if (typeof arg0 == "object") { // should be a map - set multiple data elements
				for (let key in arg0) { // TODO: improve performance and avoid executing setData multiple times
					this.setCustomData(key, arg0[key]);
				}
				return this;

			} else {
				// error, illegal argument
				throw new TypeError("When data() is called with one argument, this argument must be a string, an object or null, but is " + (typeof arg0) + ":" + arg0 + " (on UI Element with ID '" + this.getId() + "')");
			}

		} else if (argLength == 2) {            // set or remove one data element
			this.setCustomData(arguments[0], arguments[1]);
			return this;

		}  else {
			// error, illegal arguments
			throw new TypeError("data() may only be called with 0-2 arguments (on CoElement with tag '" + (this.snode as Element).tagName.toLowerCase() + "')");
		}
	};

    protected listeners:{[key:string]:((ref?:any)=>any)[]};

    /**
     * Add a listener for the given function.
     * 
     * @param name The function to listen to
     * @param listener The callback to call
     */
    public addListener(name:'onPreRender'|'onPostRender',listener:(ref?:any)=>any) {
        if (!this.listeners)
            this.listeners={};
        let arr=this.listeners[name];
        if (!arr)   {
            arr=[];
            this.listeners[name]=arr;
        }
        arr.push(listener);
    }

    /**
     * Removes a previously added listener for the given function.
     * 
     * @param name 
     * @param listener 
     * @returns 
     */
    public removeListener(name:'onPreRender'|'onPostRender',listener:(ref?:any)=>any) {
        if (!this.listeners)
            return;
        let arr=this.listeners[name];
        if (!arr)   
            return;
        let index=arr.indexOf(listener);
        if (index>=0) {
            arr.splice(index,1);
            if (arr.length==0)
                delete this.listeners[name];
        }

    }


    /**
     * For debugging - prints the target tree snodes to the console.
     * 
     * @param depth 
     */
    print(depth:number=0) {
        if (this.snode && this.snode.nodeType!=Node.TEXT_NODE) {
            console.log(`${pad(depth)} snode=${toStr(this.snode)} ++ tnode=${toStr(this.tnode)} (${this.constructor.name})#${this.getId()}`);
            if (this.replaced)
                console.log(`${pad(depth,' ')} replaced=${toStr(this.replaced)}`);
        }
        
        for(let i=0;i<this.children.length;i++) {
            let c=this.children[i];
            for(let j=0;j<c.length;j++) {
                (c[j]as TargetNodeImpl).print(depth+1);
            }
        }
    }

    /**
     * Calls the matcher function against all snodes this TargetNode implementation is handling.
     * This provides an extensible way for traversing each TargetNodes's snode(s), for example, to find
     * TargetNodes by snodes.
     * 
     * @param matcher 
     * @returns The first true from matcher.
     */
    public matchSnode(matcher:(snode:Node)=>boolean) : boolean {
        return matcher(this.snode) || (this.replaced && matcher(this.replaced));
    }

    /**
     * Gets or sets parameters for children by their iteration and tag name.
     * 
     * @param iteration 
     * @param tagname 
     * @param parameters If specified, sets the parameters, else returns them
     */
    public childParams(iteration:number,tagname:string,parameters?:any) : any {
        if (parameters) {
            // insert
            if (!this.childp)
                this.childp={};
            if (!this.childp[iteration])
                this.childp[iteration]={};
            this.childp[iteration][tagname]=parameters;
        } else if (this.childp && this.childp[iteration]) {
            return this.childp[iteration][tagname];
        }
    }



}


