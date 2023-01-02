import { Implementations } from "../Implementations";
import { CoElement } from "../CoElement";
import { Render } from "../Render";
import { Asset, AssetID, isCoElementAsset, stringifyAssetID } from "../Asset";
import { Converter } from "../Converter";
import { Dependency } from "../Dependency";
import { Attachable, isAttachable } from "../Attachable";
import { TargetNodeImpl } from "./TargetNodeImpl";
import { Patch } from "../Patch";
import { Attachment } from "../Attachment";

/**
 * Attaches a CoElement as a child of the window.document - i.e. the browser-visible document.
 * The default implementation
 * 
 * Manages the dependencies such as styles of Coml documents as they attach/detach to the main window. 
 */
export class AttachmentImpl implements Attachment {
    protected dependencies: Map<string, Dependency>;
    protected coElement:CoElement;

    constructor() {
    }


    /**
     * Returns the Patch implementation that will attach the top component to the outside html.
     * 
     * @param tnode 
     * @param element 
     * @returns 
     */
    protected createPatch(tnode:Node,element:Element) : Patch {
        return new PatchExternalElement(tnode,element);
    }

    protected makeCoElement(element: Element, toInsert: string | AssetID) : Promise<CoElement> {

        let asset=Implementations.getAssetFactory()
            .get(toInsert);

        if (!asset)
            throw new Error(`Can't find an asset for ${stringifyAssetID(toInsert)}`);

        if (isCoElementAsset(asset)) {
            // create a ChildNode that will reattach at the sole position in the attachment element:
            let that=this;
            let tn = new (class extends TargetNodeImpl {
                public getPatch() : Patch {
                    return that.createPatch(this.tnode,element);
                }
            })(null);

            return (
                asset
                .asCoElement(tn)        
            )
        } else {
            throw new Error(`Asset ${stringifyAssetID(toInsert)} is not a CoElementAsset`);
        }
    }

    public attach(element: Element, toInsert: string | AssetID) {

        this.makeCoElement(element,toInsert)
        .then((coElement)=>{
            this.handleAttach(coElement);

            //this.renderFromTop(cvt, element);
            coElement.getCvt().invalidate(coElement.getTN());
        })

    }

    protected handleAttach(coElement:CoElement) {
        this.coElement=coElement;
        let cvt = coElement.getCvt();
        if (isAttachable(cvt)) {
            cvt.setAttachment(this);
        }
    }

    public detach() {
        if (this.coElement) {
            let cvt = this.coElement.getCvt();
            if (isAttachable(cvt)) {
                cvt.setAttachment(null);
            }
        }
    }

    /**
     * Add a new dependency
     * 
     * @param dep 
     * @returns 
     */
    public addDependency(dep: Dependency): Promise<any> {
        if (!this.dependencies)
            this.dependencies = new Map();
        let already = this.dependencies.get(dep.getId());
        if (already) {
            already.updateRefCount(1);
            return Promise.resolve();
        } else {
            this.dependencies.set(dep.getId(), dep);
            return dep.attach();
        }
    }

    public removeDependency(dep: Dependency) {
        let already = this.dependencies.get(dep.getId());
        if (already) {
            if (already.getRefCount() > 1) {
                already.updateRefCount(-1);
            }
            else {
                this.dependencies.delete(dep.getId());
                return dep.detach();
            }
        }
    }

}

/**
 * Remembers and restores the Attachment of the COML document in the external element 
 */
class PatchExternalElement implements Patch {
    protected index:number=-1;
    protected tnode:Node;
    protected attachedToElement:Element;

    constructor(tnode:Node,attachedToElement:Element) {
        this.tnode=tnode;
        this.attachedToElement=attachedToElement;
        if (this.tnode) {
            this.index=Array.prototype.indexOf.call(attachedToElement.childNodes, this.tnode);
        }
    }

    restorePosition(elem: Element) {
        if (this.tnode && this.index>=0)
            this.attachedToElement.removeChild(this.tnode)
        else {
            this.attachedToElement.innerHTML='';
        }

        this.attachedToElement.appendChild(elem);
    }
}