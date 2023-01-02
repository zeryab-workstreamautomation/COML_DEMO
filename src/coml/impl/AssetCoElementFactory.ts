import { AssetID, isCoElementAsset } from "../Asset";
import { Attachable, isAttachable } from "../Attachable";
import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { Implementations } from "../Implementations";
import { Render } from "../Render";
import { TargetNodeImpl } from "./TargetNodeImpl";
import { isTemplatizable } from "../Templatizable";
import { getAttr } from "../TargetNode";
import { This } from "../This";

/**
 * A CoElementFactory that uses a COML page to build a CoElement
 */
export class AssetCoElementFactory implements CoElementFactory {
    protected assetId:AssetID;
    protected tag:string;

    constructor(assetId:AssetID,tag:string) {
        this.assetId=assetId;
        this.tag=tag;
    }

    makeComponent(tn: TargetNodeImpl, cvt: Converter<This>): Promise<CoElement> {

        let asset=Implementations.getAssetFactory().get(this.assetId);

        if (!isCoElementAsset(asset))
            throw new Error(`import ${this.assetId} is not a CoElementAsset`);

        return(
            asset.asCoElement(undefined,undefined,(attrib:string)=>{
                return getAttr<string>(cvt,tn.snode,attrib);
            })
            .then((co)=>{
                let cvtChild=co.getCvt();
                if (isAttachable(cvt) && isAttachable(cvtChild)) {
                    cvt.addChild(cvtChild);
                }
                if (isTemplatizable(co))
                    co.templatize(cvt,tn.snode);
                return co;
            }));
       
    }

    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory(this.tag,this);    
    }

}