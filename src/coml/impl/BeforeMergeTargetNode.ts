import { CoElement, isCoElement } from "../CoElement";
import { Converter } from "../Converter";
import { TargetNode } from "../TargetNode";
import { MergedTree, Overlap } from "./MergedTree";
import { MergedTargetNode } from "./MergedTargetNode";
import { TargetNodeImpl } from "./TargetNodeImpl";
import { TreeMerge } from "./TreeMerge";
import { EventHandlers } from "../html/EventHandlers";
import { This } from "../This";
import { Get } from "../Get";



/**
 * A target node from the start of the template document's tree, as inserted into the caller's TargetTree
 * 
 * Keeps on delivering the template doc's nodes until the 'insertion-root' node
 * is reached, whereupon switches to the MergedTargetNode 
 */
export class BeforeMergeTargetNode extends TargetNodeImpl {
    protected cvt0:Converter<This>;
    protected cvt1:Converter<This>;
    protected replacedNode:Node; //  see 'getReplacedNode()' - the node that was replaced by this template, its contents will bemerged to the template's insertion-root

    /**
     * 
     * @param snode The snode to use before the merge point (from the template or callee)
     * @param parent 
     * @param cvt0 The caller's cvt
     * @param cvt1 The callee's cvt
     * @param replaced The caller's replaced snode.
     */
    constructor(snode:Node,parent?:TargetNode,cvt0?:Converter<This>,cvt1?:Converter<This>,replaced?:Node) {
        super(snode, undefined,parent);
        this.cvt0 = cvt0;
        this.cvt1 = cvt1;
        this.replacedNode=replaced; 
        if (this.replaceChild) {
            //this.copyEventHandlersFrom
        }
    }

    /**
     * Returns the converters - if zero, then cvt0 (Caller), else cvt1 (callee)
     * 
     * @param zero 
     * @returns 
     */
    protected getCvt(zero:boolean) : Converter<This> {
        let c:BeforeMergeTargetNode=this;

        if (zero) {
            while(!c.cvt0)  
                c=c.parent as BeforeMergeTargetNode;
            return c.cvt0;
        } else {
            while(!c.cvt1)  
                c=c.parent as BeforeMergeTargetNode;
            return c.cvt1;
        }
    }

    /**
     * Returns the node in caller that was replaced by the template. EG, in the following, it will be the <co-foo> ELement
     * ``` 
     * this.import({name:'foo.html'},'co-foo');
     * 
     * <body>
     *    <co-foo>
     *        <div>Bar</div>
     *    </co-foo>
     * </body>
     * 
     * ```
     *  
     * 
     * @returns 
     */
    public getReplacedNode() {
        let c:BeforeMergeTargetNode=this;

        while(!c.replacedNode)  
            c=c.parent as BeforeMergeTargetNode;
        return c.replacedNode;
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
        let ctn:TargetNode;
        if (snode.nodeType==Node.ELEMENT_NODE) {
            let e:Element=(snode as Element);

            let iroot=e.getAttribute('insertion-root');
            if (iroot) {
                let overlaps=this.makeOverlaps();
                const {callerRoot,shadow}=this.getCallerRoot();// (this.getReplacedNode() as Element).firstElementChild;

                let treem=new TreeMerge(callerRoot,shadow,e,overlaps);
                let mt=treem.merge();
                //console.log('======================================');
                //mt.print();
                ctn=new MergedTargetNode(mt,this.getCvt(true),this.getCvt(false));
            }
        }
        if (!ctn)
            ctn=new BeforeMergeTargetNode(snode,this);

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
     * Returns the node from the Caller that should be mapped to the temlplate's insertion-root node during merge.
     * 'shadow' is true if there is no declared root attribute within the replaced node. In this case
     * the calleer root is the replaced element itself.
     */
    protected getCallerRoot() : {callerRoot:Element,shadow:boolean} {
        let ret={
            callerRoot:null,
            shadow:false            
        };

        let top:Element=(this.getReplacedNode() as Element);
        let root=top.querySelector('[root]');

        ret.callerRoot=root||top;
        ret.shadow=!root;


        return ret;
    }

    protected makeOverlaps() : Overlap[] {
        let overlaps:Overlap[]=[];
        let holes=this.getCvt(false).getDocument().querySelectorAll('[hole]');
        if (holes.length==0)
            return null;

        let plugs:Map<string,Node[]>;
        for(let i=0;i<holes.length;i++) {
            let hole=holes[i];
            let holeid=hole.getAttribute('hole');
            if (holeid) {
                if (!plugs) {
                    plugs=this.makePlugsMap();
                    if (!plugs)
                        return null;                
                }
                let plug=plugs.get(holeid);
                if (plug) {
                    plug.forEach((pl)=>{
                        overlaps.push({n0:pl,n1:hole});
                    });
                }
            }
        }

        return overlaps;
    }
    
    protected makePlugsMap(): Map<string, Node[]> {
        let sid=this.getCallerRoot().callerRoot.getAttribute('sid');
        return this.makePlugsFromNode(this.getCallerRoot().callerRoot,sid,null,true);
    }

    protected makePlugsFromNode(node:Node,sid:string,map:Map<string,Node[]>,ignorenode?:boolean) : Map<string,Node[]> {
        if (node.nodeType==Node.ELEMENT_NODE) {
            if (!ignorenode) {
                let plughole=(node as Element).getAttribute('plughole');
                if (plughole) {
                    if (sid) {
                        if (plughole.startsWith(sid+'.')) {
                            plughole=plughole.substring(sid.length+1);
                        } else {
                            // doesnt match ours - abort
                            plughole=null;
                        }
                    } else if (plughole.indexOf('.')>=0) {
                        // no sid in the callerRoot, but the plughule has a . so no match
                        plughole=null;
                    }

                    if (plughole) {
                        if (!map)
                            map=new Map();
                        let all=map.get(plughole);
                        if (!all)
                            map.set(plughole,all=[]);
                        all.push(node);
                    }
                }
            }
            
            // handle children
            for(let i=0;i<node.childNodes.length;i++) {
                map=this.makePlugsFromNode(node.childNodes[i],sid,map);
            }
        }

        return map;
    }

    /**
     * Apply all attribute based event handlers (either 'onXXX' or 'co-onXXX') in snode to the 
     * tnode as 'addEventListener('xxxx').
     * 
     * Override so that if we are the top level and have 'replaced', we can install the replaced elements
     * event handlers using cvt0, then add any
     */
    protected attachEventHandlersFromAttributes() {
        if (!this.replacedNode) {
            super.attachEventHandlersFromAttributes();
            return;
        }

        // merge the event handlers. first apply the ones from replaced. then from 2 
        if (this.tnode && this.snode && this.component) {
            let eh=new EventHandlers(this.tnode as Element,this);

            eh.addEventHandlersFromAttrsOf(this.snode as Element,this.component.getCvt());
            eh.addEventHandlersFromAttrsOf(this.replacedNode as Element,this.cvt0);
        }
    }
    
    /**
     * Override so we can cover the replacedNode.
     * 
     * @param matcher 
     * @returns 
     */
    public matchSnode(matcher:(snode:Node)=>boolean) : boolean {
        return super.matchSnode(matcher)  || (this.replacedNode && this.replacedNode!=this.replaced && matcher(this.replacedNode));
    }

    protected runGetsForAllCvts(snode:Node) {
        if (this.cvt0)
            this.runGetsForCvt(this.cvt0,snode);
        if (this.cvt1)
            this.runGetsForCvt(this.cvt1,snode);
    }
}

