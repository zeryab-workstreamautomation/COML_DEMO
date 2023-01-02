import { pad, toStr } from "./Debug";
import { SingleTree } from "./SingleTree";

export interface Overlap {
    n0: Node;
    n1: Node;
}

/**
 * A Tree that stores the result of a TreeMerge. Each object is a node in this tree
 * with the Html node of either the 0th (n0) or first (n1) stored, and children after mege stored in 'children'
 * 
 */
export class MergedTree {
    n0?: Node;
    n1?: Node;
    parent: MergedTree;
    children?: MergedTree[];
    shadow?: boolean; // means n0 is shadow - (normally n1 is shadow) - the non shadow n is the one whose attributes are expressed.

    constructor(s0: SingleTree, s1: SingleTree) {
        this.n0 = s0.n;
        this.n1 = s1.n;
    }

    /**
     * Add a parent to ths node from the merging of c0,c1 and return it
     * 
     * @param c0 
     * @param c1 
     */
    mergeParent(c0: SingleTree, c1: SingleTree): MergedTree {
        let p = new MergedTree(c0, c1);
        p.children = [this];
        this.parent = p;
        return this.parent;
    }

    /**
     * Add any children of 'other' as children of this node only if those children are different
     * from this's existing children
     * 
     * @param other 
     */
    takeoverChildren(other:MergedTree) {
        if (other.children) {
            let toadd:MergedTree[]=[];
            for (let i = 0; i < other.children.length; i++) {
                if (!this.findChild(other.children[i].n0,other.children[i].n1))
                    toadd.push(other.children[i]);
            }
            if (toadd.length) {
                if (!this.children)
                    this.children=[];
                for (let i = 0; i < toadd.length; i++) {
                    this.children.push(toadd[i]);
                    toadd[i].parent=this;
                }
            }
        }
    }

    /**
     * find an immediate child containing both n1,n0
     * 
     * @param n0 
     * @param n1 
     * @returns 
     */
    findChild(n0: Node, n1: Node) {
        if (!this.children)
            return;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].find(n0,n1,true))
                return this.children[i];
        }
    }

    /**
     * Find immediate child that contains n as n0
     * 
     * @param n 
     * @returns 
     */
    findChild0(n: Node,recurse?:boolean) {
        if (!this.children)
            return;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].n0==n)
                return this.children[i];
            else if (recurse) {
                let f=this.children[i].findChild0(n,true);
                if (f)
                    return f;
            }
        }
    }

    /**
     * Find immediate child that contains n as n0
     * 
     * @param n 
     * @returns 
     */
    findChild1(n: Node,recurse?:boolean) {
        if (!this.children)
            return;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].n1==n)
                return this.children[i];
            else if (recurse) {
                let f=this.children[i].findChild1(n,true);
                if (f)
                    return f;
            }
        }
    }


    /**
     * Finds the MergedTree node down the tree that matches n0,n1.
     * 
     * @param n 
     * @returns 
     */
    find(n0: Node, n1: Node,noChildren?:boolean): MergedTree {
        if (n0 == this.n0 && n1==this.n1)
            return this;
        if (this.children && !noChildren) {
            for (let i = 0; i < this.children.length; i++) {
                let f = this.children[i].find(n0,n1);
                if (f)
                    return f;
            }
        }
    }

    /**
     * For debugging - prints the merged tree to the console.
     * 
     * @param depth 
     */
    print(depth:number=0) {
        console.log(`${pad(depth)} n0=${toStr(this.n0)} ++ n1=${toStr(this.n1)}`);
        if (this.children) {
            this.children.forEach((c)=>{
                c.print(depth+1);
            })
        }
    }


}