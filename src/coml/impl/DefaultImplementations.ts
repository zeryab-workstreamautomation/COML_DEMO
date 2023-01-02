import { Ajax } from "../Ajax";
import { AssetFactory } from "../Asset";
import { Converter } from "../Converter";
import { Implementations } from "../Implementations";
import { Patch } from "../Patch";
import { Render } from "../Render";
import { ConverterImpl } from "./ConverterImpl";
import { RenderImpl } from "./RenderImpl";
import { Attachment } from "../Attachment";
import { AttachmentImpl } from "./AttachmentImpl";
import { GetAttrT, This } from "../This";
import BaseThis from "./BaseThis";

/**
 * Default implementations of all interfaces.
 * 
 */
export class DefaultImplementations extends Implementations {
    protected ajax:Ajax;
    protected assetFactory:AssetFactory;

    constructor(ajax:Ajax,assetFactory:AssetFactory) {
        super();
        this.ajax=ajax;
        this.assetFactory=assetFactory;
    }


    protected getAjaxImpl(): Ajax {
        return this.ajax;
    }
    protected getAssetFactoryImpl(): AssetFactory {
        return this.assetFactory;
    }

    protected createConverterImpl(copyStateFrom?: Converter<This>): Converter<This> {
        return new ConverterImpl(copyStateFrom);
    }
    protected createRenderImpl(pos:Patch): Render {
        return new RenderImpl(pos,(c)=>{
            return '_id'+Math.floor(Math.random()*10000000);
        });
    }

    protected createAttachmentImpl(): Attachment {
        return new AttachmentImpl();
    }

    protected createThisImpl(cvt:Converter<This>,fnGetAttr:GetAttrT): This {
        return new BaseThis(cvt,undefined,fnGetAttr);
    }
}