import { Patch as Patch } from "./Patch";

/**
 * The default Patch.
 * 
 * A Repaint patch is an operation that remembers the position of a document node in its original parent
 * and reattaches it after the node is regenerated.
 * 
 * If the node does not currently have a parent (for example on first generation), then the supplied
 * parent in the constructor is used.
 */
export class Repaint implements Patch {
    // id
    protected potentialParent:Node; // current or future parent

    // state
    protected index:number;
    protected parentNode:Node;
    protected tnode:Node;


    constructor(potentialParent:Node,tnode:Node) {
        this.potentialParent=potentialParent;
        this.tnode=tnode;
        this.savePosition();
    }

    protected removeChild() {
        // detach tnode from parent.
        if (this.index>=0 && this.tnode && this.potentialParent && this.potentialParent.contains(this.tnode))
            this.potentialParent.removeChild(this.tnode);
    }


    public restorePosition(elem: Node) {
        this.removeChild();
        this.reattachTNodeFromPosition(elem);
    }

    protected savePosition()  {

        if (this.tnode && this.tnode.parentNode) {
            this.potentialParent=this.tnode.parentNode; // note: overwrites the original potential parent
            this.index=Array.prototype.indexOf.call(this.potentialParent.childNodes, this.tnode);
        }
    }

    protected reattachTNodeFromPosition(tnode:Node) {
        // attach tnode
        let e=tnode as Element;
        //if (e.tagName.toLowerCase()!='div')
        //    console.log('Here');
        if (tnode && this.potentialParent) {
            if (this.index<0||this.index>=this.potentialParent.childNodes.length) {
                this.potentialParent.appendChild(tnode);
            } else {
                this.potentialParent.insertBefore(tnode,this.potentialParent.childNodes[this.index]);
            }
        }
    }


}