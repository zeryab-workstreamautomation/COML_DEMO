

/**
 * A tree structore of nodes whose virtial depth of nodes can be increased via the shiftDownBy() function.
 */
export class SingleTree  {
    n?:Node;
    parent:SingleTree;
    children?:SingleTree[];

    constructor(r?:Node,parent?:SingleTree) {
        if (parent)
            this.parent=parent;
        if (r) {
            this.n=r; 

            for(let i=0;i<r.childNodes.length;i++) {
                if (!this.children)
                    this.children=[];
                this.children.push(new SingleTree(r.childNodes[i],this));
            }
        }
    }

    /**
     * Increases the tree's depth down by 'count' by adding 'count' empty nodes between this node and its children.
     * 
     * @param count 
     */
    shiftDownBy(count: number) {
        let empty=new SingleTree(undefined,this);
        empty.children=this.children;
        this.children=[empty];
        empty.updateChildrensParents();
        count--;
        if (count>0) {
            empty.shiftDownBy(count);
        }
    }

    protected updateChildrensParents() {
       if (this.children) {
        this.children.forEach((child)=>{
            child.parent=this;
        })
       }
    }

    /**
     * Finds the MergedNode that matches overlap.
     * 
     * @param n 
     * @returns 
     */
    find(n:Node) : SingleTree {
        if (n==this.n)
            return this;
        if (this.children) {
            for(let i=0;i<this.children.length;i++) {
                let f=this.children[i].find(n);
                if (f)
                    return f;
            }
        }
    }

    protected plumb(depth:number) : {deep:number,node:SingleTree} {
        if (!this.children ||this.children.length==0)
            return {deep:depth,node:this};

        let all:{deep:number,node:SingleTree}[]=[];

        for(let i=0;i<this.children.length;i++) 
            all.push(this.children[i].plumb(depth+1));

        if (all.length>1) {
            all.sort((a,b)=>{
                return b.deep-a.deep;
            })
        }

        return all[0];
    }

    deepest() : SingleTree {
        return this.plumb(0).node;
    }

}