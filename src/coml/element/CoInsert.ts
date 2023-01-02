import { isDocumentAsset, restoreAssetID } from "../Asset";
import { isAttachable } from "../Attachable";
import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { Implementations } from "../Implementations";
import { Render } from "../Render";
import { getAttr, TargetNode } from "../TargetNode";
import { This } from "../This";
import { BaseCoElement } from "./BaseCoElement";


/**
 * <co-insert src="asset">
 * 
 *  Will insert a DocumentAsset into the sdom and rebuild it.
 *  This is for importing resources , the current converter will treat the imported document as if it was part
 *  of the sdom, the document of the imported item replacing the snode at this point.
 * 
 *  Note the object therefore shares the 'this' of the component to which it is being inserted.
 *  (This is different from an import or an attach)
 */
export class CoInsertElement extends BaseCoElement {
    protected src: string;
    protected error: string;

    constructor(cvt: Converter<This>, tn: TargetNode) {
        super(cvt, tn);
        this.src = getAttr<string>(cvt, tn.snode, 'src',undefined,tn);
        if (this.src) {
            let assetId=restoreAssetID(this.src);


            let asset=Implementations.getAssetFactory()
                .get(assetId);
            if (!asset) {
                this.error=`co-insert: can't find an asset with id =${this.src}`;
                return;
            }


            if (!isDocumentAsset(asset)) {
                this.error=`co-insert: asset with id =${this.src} is not a DocumentAsset`;
                return;
            }

            asset.getDocument()
            .then((doc) => {
                let replaced=this.tn.snode;
                if (this.tn.snode instanceof HTMLElement) {
                    replaced=this.tn.snode;// before we replace, store original so find during mutation finds it.
                }
                this.tn.snode=doc.body;
                this.tn.component=this.cvt.makeCoElement(this.tn) as CoElement;
                this.tn.replaced=replaced;
                //this.cvt.rebuild(this.tn);
                this.cvt.invalidate(this.tn);
            })
            .catch((error)=>{
                this.error=`co-insert: asset with id =${this.src} error=${error}`;
                this.cvt.invalidate(this.tn);
            })
        }

    }


    public onRender(rm: Render): void {
        if (this.error) {
            rm.openStart('div',this)
            .class('u-coml-error')
            .openEnd()
            .text(this.error);
    
    
            rm.close('div');
        } else {
            rm.openStart('div',this)
            .class('u-co-insert')
            .openEnd()
            .close('div');
        }
    }


};

export default class InsertFactory implements CoElementFactory {
    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('co-insert', this);
    }

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new CoInsertElement(cvt, tn);
    }

}