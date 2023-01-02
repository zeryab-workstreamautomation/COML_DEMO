import { AssetID } from "../coml/Asset";
import { Attachment } from "../coml/Attachment";
import { UI5Attachment } from "../coml/bridge/ui5/UI5Attachment";
import { FromCodeAssetFactory } from "./FromCodeAssetFactory";
import { AttachmentImpl } from "../coml/impl/AttachmentImpl";
import { DefaultImplementations } from "../coml/impl/DefaultImplementations";
import { JQueryAjax } from "../coml/impl/JQueryAjax";
import { Implementations } from "../coml/Implementations";
import ComlStartup from "../coml/ComlStartup";
import { BaseCoElement } from "../coml/element/BaseCoElement";
import { Converter } from "../coml/Converter";
import { This, GetAttrT } from "../coml/This";
import { DemoConverterImpl } from "./DemoConverterImpl";

/**
 * The starting point for the demo app.
 * 
 * We install our special FromCodeAssetFactory so that the CoCode elements can deliver user code on the fly to
 * display in <pages>. Also, we add the 'expose' function.
 */
export default class DemoApp extends ComlStartup {
    constructor(dontUseUI5:boolean) {
        super(dontUseUI5);
    }

    /**
     * Override so we can add our special asset factory, which will serve up modified code assets straight from
     * the <co-code></co-code> elements.
     */
    protected configureImplementations() {
        /* set up the implemntations of ajax, assets, Converter and Render */
        let that=this;
        new (class extends DefaultImplementations {
            protected createAttachmentImpl(): Attachment {
                if (!that.dontUseUI5)
                    return new UI5Attachment();
                return new AttachmentImpl();
            }

            protected createConverterImpl(copyStateFrom?: Converter<This>): Converter<This> {
                return new DemoConverterImpl(copyStateFrom);
            }
        })
        (
            new (class extends JQueryAjax { // add the 'demo' to the path
                protected assetsFolder(assetId:AssetID) : string {
                    return this.getBasePath()+'demo/html/';
                }
            })(),
            new FromCodeAssetFactory()
        );

        this.addComlObjectsToGlobalScope();
    }

    protected addComlObjectsToGlobalScope() {
        globalThis.BaseCoElement=BaseCoElement;

        globalThis.expose = function(...classes:any) {
            for(const clazz of classes) {
                if (clazz.name)
                    globalThis[clazz.name]=clazz;
                else  {
                    console.log('Unable to hoist class');
                    console.log(clazz);
                }
            }
        }
    }


    attachTo(id:string,page:string|AssetID) {
        let inserter=Implementations.createAttachment();
        let element=document.querySelector(`#${id}`);
        element.innerHTML='';
        inserter.attach(element,page);
    }
}