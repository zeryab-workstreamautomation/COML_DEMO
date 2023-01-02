import { Ajax } from "./Ajax";
import { AssetFactory } from "./Asset";
import { Converter } from "./Converter";
import { Patch } from "./Patch";
import { Render } from "./Render";
import { Attachment } from "./Attachment";
import { ConverterImpl } from "./impl/ConverterImpl";
import { GetAttrT, This } from "./This";
import BaseThis from "./impl/BaseThis";


/**
 * A singleton from which all implementations of interfaces can be fetched.
 * 
 */
export abstract class Implementations {
    protected static imp:Implementations;

    protected constructor() {
        Implementations.imp=this;
    }

    protected abstract getAjaxImpl() : Ajax;
    protected abstract getAssetFactoryImpl() : AssetFactory;
    protected abstract createConverterImpl(copyStateFrom?:Converter<This>) : Converter<This>;
    protected abstract createRenderImpl(pos:Patch) : Render;
    protected abstract createAttachmentImpl() : Attachment;
    protected abstract createThisImpl(cvt:Converter<This>,fnGetAttr:GetAttrT): This;

    /**
     * Return the current Ajax implementaion.
     * 
     * @returns 
     */
    public static getAjax() : Ajax {
        return Implementations.imp.getAjaxImpl();
    }

    /**
     * Return the current AssetFactory implementaion.
     * 
     * @returns 
     */
     public static getAssetFactory() : AssetFactory {
        return Implementations.imp.getAssetFactoryImpl();
    }

    /**
     * Create a new instance of a ComlConverter.
     * 
     * @returns 
     */
    public static createConverter(copyStateFrom?:Converter<This>) : Converter<This> {
        return Implementations.imp.createConverterImpl(copyStateFrom);
    }

    /**
     * Create a new instance of a Render.
     * 
     * @returns 
     */
    public static createRender(pos:Patch) : Render {
        return Implementations.imp.createRenderImpl(pos);
    }

     /**
     * Create a new instance of an ATtachment.
     * 
     * @returns 
     */
    public static createAttachment() : Attachment {
        return Implementations.imp.createAttachmentImpl();
    }

    /**
     * Create a new instance of a This object for the given Converter.
     * 
     * @param cvt 
     * @returns 
     */
    public static createThis(cvt:Converter<This>,fnGetAttr:GetAttrT): This {
        return Implementations.imp.createThisImpl(cvt,fnGetAttr);
    }


}