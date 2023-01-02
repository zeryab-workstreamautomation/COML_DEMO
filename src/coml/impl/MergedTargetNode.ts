import { CoElement, isCoElement } from "../CoElement";
import { Converter } from "../Converter";
import { EventHandlers } from "../html/EventHandlers";
import { TargetNode } from "../TargetNode";
import { This } from "../This";
import { MergedTree } from "./MergedTree";
import { TargetNodeImpl } from "./TargetNodeImpl";



/**
 * A target node that represents a merged node . 
 * n0 represents one tree (the caller) and n1 represents the callee tree (the template)
 * 
 * 
 */
export class MergedTargetNode extends TargetNodeImpl {
    protected mnode:MergedTree;
    protected cvt0:Converter<This>;
    protected cvt1:Converter<This>;
    protected mchildren:(Node|MergedTree)[];

    constructor(mnode:MergedTree,cvt0:Converter<This>,cvt1:Converter<This>) {
        super(mnode.shadow? mnode.n1:mnode.n0||mnode.n1, undefined, undefined);
        this.cvt0 = cvt0;
        this.cvt1 = cvt1;
        this.mnode=mnode;
    }

    matchSnode(matcher:(snode:Node)=>boolean) : boolean {
        if (super.matchSnode(matcher))
            return true;
        return (this.mnode.n0 && matcher(this.mnode.n0)) || (this.mnode.n1 && matcher(this.mnode.n1))
    }

    protected runStateChanges(): void {
        super.runStateChanges(); 
        if (!this.mnode.shadow && this.mnode.n0 && this.mnode.n1 && this.tnode) {
            // Run state changers set by cvt1 on n1
            this.runStateChangeFor(this.cvt1,this.mnode.n1);

            // ensure n1's classes and attributes NOT set by n0 are copied to the tnode.
            // The classes from n0 will already have been copied during the normal expansion
            this.cvt1.copyAttrExceptToTNode(this.tnode,this.mnode.n1,this.getAttribsThatAreNotClassStyleOrEvent(this.mnode.n0 as Element));
        }
    }

    protected getAttribsThatAreNotClassStyleOrEvent(elem:Element) : string[] {
        let attrs = elem.attributes;

        let filtered:string[]=[];
        for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name!='class' && // 
                attrs[i].name!='style' &&  // 
                attrs[i].name!='remove'  && 
                !EventHandlers.isEventAttr(attrs[i].name)
                ) { // 
                filtered.push(attrs[i].name);
            }
        } 

        return filtered;
    }

    /**
     * Override so we can attach event handlers from n1 (the template)
     * 
     * Apply all attribute based event handlers (either 'onXXX' or 'co-onXXX') in snode to the 
     * tnode as 'addEventListener('xxxx').
     */
    protected attachEventHandlersFromAttributes() {
        super.attachEventHandlersFromAttributes();
        if (this.tnode && this.mnode.n1) {
            let eh=new EventHandlers(this.tnode as Element,this);

            eh.addEventHandlersFromAttrsOf(this.mnode.n1 as Element,this.cvt1);
        }
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
        let mchildren=this.getMergedChildren();
        let ctn:TargetNode;

        for(let i=0;i<mchildren.length;i++) {
            let m=mchildren[i];

            if (m instanceof Node) {
                if (m==snode)   {
                    /*
                    if (snode.nodeType==Node.ELEMENT_NODE) {
                        let e:Element=snode as Element;
                        if (e.id=='p0') {
                           // debugger;
                           console.log('find p0');
                        }
                    }*/
                    ctn=new TargetNodeImpl(snode);
                    break;
                }
            } else {
                if (snode==m.n0 || snode==m.n1) {
                    ctn=new MergedTargetNode(m,this.cvt0,this.cvt1);
                    break;
                }                
            }
        }

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
     * @returns The Converter to use to render this TargetNode
     */
    public getOwner(defaultOwner: Converter<This>) {
        if (this.mnode.n0 && !this.mnode.shadow)
            return this.cvt0;
        return this.cvt1;
    }

    protected makeMergedChildren() : (Node|MergedTree)[] {
        let childs:(Node|MergedTree)[]=[];

        if (this.mnode.n0 && !this.mnode.n1) {
            // only n0;
            for(let i=0;i<this.mnode.n0.childNodes.length;i++) {
                let cn=this.mnode.n0.childNodes[i];
                let mn:MergedTree=this.mnode.findChild0(cn);
                if (!mn && this.usedFurtherDown0(cn))
                    continue; // skip as this raw cn is used further down - because of tree stretching
                childs.push(mn||cn);
            }
        } else if (this.mnode.n1 && !this.mnode.n0) {
            // only n0;
            for(let i=0;i<this.mnode.n1.childNodes.length;i++) {
                let cn=this.mnode.n1.childNodes[i];
                let mn:MergedTree=this.mnode.findChild1(cn);
                if (!mn && this.usedFurtherDown1(cn))
                    continue; // skip as this raw cn is used further down - because of tree stretching
                childs.push(mn||cn);
            }
        } else {
            // both n0 and n1. use position to order
            let order:Map<Node|MergedTree,number>=new Map();
            for(let i=0;i<this.mnode.n0.childNodes.length;i++) {
                let cn=this.mnode.n0.childNodes[i];
                let mn:MergedTree=this.mnode.findChild0(cn);
                if (!mn && this.usedFurtherDown0(cn))
                    continue; // skip as this raw cn is used further down - because of tree stretching
                let either=mn||cn;
                childs.push(either);
                order.set(either,i);
            }
            for(let i=0;i<this.mnode.n1.childNodes.length;i++) {
                let cn=this.mnode.n1.childNodes[i];
                if (cn.nodeType==Node.TEXT_NODE)
                    continue;
                let mn:MergedTree=this.mnode.findChild1(cn);
                if (mn && mn.n0)
                    continue; // already counted above
                if (!mn && this.usedFurtherDown1(cn))
                    continue; // skip as this raw cn is used further down - because of tree stretching
                let either=mn||cn;
                childs.push(either);
                order.set(either,i+0.2);
            }
            
            childs.sort((a,b)=>{
                let ao=order.get(a);
                let bo=order.get(b);

                //return bo-ao;
                return ao-bo;
            });
            
        }

        return childs;
    }

    /**
     * returns true if mnodes 0 children has a child equal to cn. Note we skip direct children of mnode
     * @param cn 
     */
    protected usedFurtherDown0(cn: Node) : boolean {
        if (!this.mnode.children)
            return;
        for (let i = 0; i < this.mnode.children.length; i++) {
            let f=this.mnode.children[i].findChild0(cn,true);
            if (f)
                return true;
        }
    }

    protected usedFurtherDown1(cn: Node) : boolean {
        if (!this.mnode.children)
            return;
        for (let i = 0; i < this.mnode.children.length; i++) {
            let f=this.mnode.children[i].findChild1(cn,true);
            if (f)
                return true;
        }
    }


    protected getMergedChildren() :  (Node|MergedTree)[] {
        if (!this.mchildren)
            this.mchildren=this.makeMergedChildren();
        return this.mchildren;
    }

    /**
     * Returns the html child Nodes of this TargetNode which should be used for creating 
     * child TargetNodes.
     * 
     * Our children are children of n0 intersected with children of n1. The intersecting members
     * are those that have both n0 and n1.
     * 
     * @returns 
     */
    public sourceChildNodes(): NodeListOf<ChildNode> | Node[] {
        
        let children:Node[]=[];
        let mchildren=this.getMergedChildren();
        for(let i=0;i<mchildren.length;i++) {
            let mn=mchildren[i];
            if (mn instanceof Node) {
                children.push(mn);
            } else if (!mn.shadow) {
                /* deleted - cant change cached snodes. DO the mrge using statechangers
                if (mn.n0 && mn.n1) {
                    let mnode=mn;
                    this.cvt0.unwatchedSnodeChange(mn.n0,()=>{
                        this.addClassesFrom(mnode.n0,mnode.n1 as Element);
                    });
                } */
                children.push(mn.n0||mn.n1);
            } else {
                children.push(mn.n1);
            }
        }

        return children;
    }

    /*
    protected addClassesFrom(to: Node, from: Element) {
        if (to.nodeType==Node.ELEMENT_NODE) {
            for(let i=0;i<from.classList.length;i++) {
                (to as Element).classList.add(from.classList[i]);
            }
        }
    }*/


}