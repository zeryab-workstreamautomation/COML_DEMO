import { AssetType, DocumentAsset } from "../Asset";
import { Implementations } from "../Implementations";
import { MergedTree, Overlap } from "./MergedTree";
import { SingleTree } from "./SingleTree";






/**
 * Merges two DOM trees from a single staring node in each (root1 and root2). the merge is
 * performed based on nodes that overlap between r1 and r2.
 * 
 * The rules:
 * 
 * 1. if two nodes overlap, then the node from r1 replaces the one from r2.
 *    The children of r2 are then merged with the children of r1 (become also children of r1) 
 * 2. the root nodes, r1 and r2, are deemed to overlap.
 * 3. All other overlaps are supplied in a map 'overlaps' - which contain the nodes of r2 that overlap with r1. (key is r1 node, value is r2 node)
 * 4. We define a depth for each node as: "the level below the root". For example, the depth of a root node is 0. Nodes 1 level deep are 1 etc.
 * 5. The merge works between the starting overlapped nodes r1 and r2, and the ending overlaps given in 'overlaps'. So we have
 *    two sets of nodes of the same size: e1 (end nodes 1) which are descendents of r1, and e2 (of r2). 
 * 6. The maxdepth(rX) is defined as the maximum depth of any node of eX. 
 * 7. The merge works by creating a virtual depth for each node in each tree. The virtual depth is the depth of nodes from the
 *     other tree to which this node will be mapped to during merge.
 * 8. If maxdepth(r1) == maxdepth(r2), then the virtual depth for all nodes of r1 and r2 are the same as their real depths.
 * 9  Otherwise, the tree with the lesser maxdepth is adjusted by 'bottom aligning' all its nodes other than the root, to the
 *    other tree. The root node is kept at the same level (0), for all children, adjust their virtualdepth downwards introducing
 *    empty layers. Example:
 ```text
-- Bottom alignig example:
 For the folowing trees, overlap is [Xb1=>Yd2], [Xc1=>Ye2]
REAL DEPTH:
 0   Xa0                 Ya0                                                                
 1  Xb1 Xc1             Yb1 Yc1      
 2                   Yd2 Ye2                                                             

   As X is shorter, so its level 2 is bottom aligned:
VIRTUAL DEPTH
 0   Xa0
 1   [empty]
 2  Xb1[=Yd2] Xc1[=Ye2]
 ```
 * 10. The merge begins from each member of e1 and traverses up the tree:
       A1. Equalize tree depths at overlaps, e.g. insert empty nodes at the top of the smaller tree. If the difference in real depth of all members of e1 and their overlapping e2, is not the same, then the tree merge
           fails with an 'inconsistent merge depth' error.
       A. Set currnode = e1. overlapnode= overlap(e1), (Depth of both is the same because of A1)
       B. Generate c1 = MergeNode(currnode,overlapnode,mode). (mode = 'keep children of currnode','keep children of both')
       C. Set currnode =  parent of currnode, overlappnode = parent of overlappnode.
       D. Repeat from c until currnode = r1. and overlappnode=r2
    At this point the merge root has all the leafs originating from the overlaps, but lacks other leafs of r1,r2

 * 
 * 11. Find all leafs of r1 that are NOT descendents of overlaps. For each find its nearest ancestor that is already
 *    in the merge root from (10). Join the merge root's tree at that point.
 * 
 * 12. Repeat for r2.
 * 
 * 
 */

export class TreeMerge {
    protected r0:Node;
    protected r1:Node;
    protected overlaps:Overlap[];
    protected r0isShadow:boolean;

    constructor(r0:Node,r0isShadow:boolean,r1:Node,overlaps?:Overlap[]) {
        this.r0=r0;
        this.r0isShadow=r0isShadow;
        this.r1=r1;
        this.overlaps=overlaps;
    }

    /**
     * Returns the depth of e to its ancestor r.
     * 
     * @param r 
     * @param e 
     * @returns 
     */
    protected depth(r:Node,e:Node) : number {
        let cdepth=0;
        while(e && e!=r) {
            cdepth++;
            e=e.parentNode;
        }
        return cdepth;
    }


    public merge() : MergedTree {
        let t0:SingleTree=new SingleTree(this.r0);
        let t1:SingleTree=new SingleTree(this.r1);

        if (!this.overlaps||this.overlaps.length==0) {
            // create a default overlap by taking the deepest member of each tree:
            this.overlaps=[{
                n0:t0.deepest().n,
                n1:t1.deepest().n
            }];
        }

        // 10 A1. equalize depth by adding extra empty nodes if needed:
        let first=true;
        let ldepth0:number;
        let ldepth1:number;
        this.overlaps.forEach((ov)=>{
            let depth0=this.depth(this.r0,ov.n0);
            let depth1=this.depth(this.r1,ov.n1);
            if (first) {
                if (depth0<depth1) {
                    t0.shiftDownBy(depth1-depth0);
                } else if (depth1<depth0) {
                    t1.shiftDownBy(depth0-depth1);
                }
                ldepth0=depth0;
                ldepth1=depth1;
                first=false;
            } else if (ldepth0-ldepth1!=depth0-depth1) {
                throw new Error(`Inconsistent merge depth, last=${ldepth0-ldepth1} now=${depth0-depth1}`);
            }
        });

        return this.mergeUp(t0,t1);
    }

    /**
     * Merges equalized depth trees t0,t1 into a MergedNode
     * 
     * @param t0 
     * @param t1 
     * @returns 
     */
    protected mergeUp(t0:SingleTree,t1:SingleTree): MergedTree {
        let mergeRoot:MergedTree;
        let counter=0;

        this.overlaps.forEach((ov)=>{
            /*
                Step 10:
                A. Set currnode = e1. overlapnode= overlap(e1), (Depth of both is the same because of A1)
                B. Generate c1 = MergeNode(currnode,overlapnode,mode). (mode = 'keep children of currnode','keep children of both')
                C. Set currnode =  parent of currnode, overlappnode = parent of overlappnode.
                D. Repeat from c until currnode = r1. and overlappnode=r2
            */
            
            let currnode0:SingleTree=t0.find(ov.n0);
            let currnode1:SingleTree=t1.find(ov.n1);

            let merged=new MergedTree(currnode0,currnode1);

            while(currnode0!=t0 && currnode1!=t1) {
                currnode0=currnode0.parent;
                currnode1=currnode1.parent;

                merged=merged.mergeParent(currnode0,currnode1);
                if (mergeRoot) {
                    let existing=mergeRoot.find(merged.n0,merged.n1);
                    if (existing) {
                        existing.takeoverChildren(merged);
                        break; // joined to the existing root's heirarchy so done for this run.
                    }
                }
            }

            if (!mergeRoot) // first run
                mergeRoot=merged;
            else if (counter>0 && (currnode0==t0 && currnode1==t1)) {
                console.error(`MERGE- Finished overlap merge #${counter} without joining to the existing root.`);
            }

            counter++;
        });

    /* 11. Find all leafs of r0 that are NOT descendents of overlaps. For each find its nearest ancestor that is already
        in the merge root from (10). Join the merge root's tree at that point. */
    
    /* NO NEED< as this can be done 'on the fly' during child TargetNode generation 
    let ovset:Set<Node>=new Set();
    this.overlaps.forEach((ov)=>{
        ovset.add(ov.n0);
    })
    let leafs:Node[]=t0.leafsExceptIn(ovset);

    leafs.forEach((leaf)=>{
        let currnode:Node=leaf;

        while(currnode!=t0.n) {
            currnode=currnode.parentNode;

            let existing=mergeRoot.find0(currnode);
            if (existing) {
                existing.takeoverChildren(merged);
                break; // joined to the existing root's heirarchy so done for this run.
            }
            
        }
    }) */

    if (this.r0isShadow)
        mergeRoot.shadow=true

    return mergeRoot;

    }

    
}

export class Tests {
    test1() {
        let assA=Implementations.getAssetFactory().get({name:'A.html',type:AssetType.page});
        let assB=Implementations.getAssetFactory().get({name:'B.html',type:AssetType.page});

        let all:Promise<Document>[]=[];
        all.push((assA as DocumentAsset).getDocument());
        all.push((assB as DocumentAsset).getDocument());

        Promise.all(all)
        .then((docs)=>{
            let r0=docs[0].querySelector('#roota');
            let r1=docs[1].querySelector('#rootb');
            let overlaps:Overlap[]=[
               // {n0:docs[0].querySelector('#a1'),n1:docs[1].querySelector('#b1')},
               // {n0:docs[0].querySelector('#a2'),n1:docs[1].querySelector('#b2')}
            ];

            let tm=new TreeMerge(r0,false,r1,overlaps);
            let t=tm.merge();

            console.log(t);

        })
        
    }
}