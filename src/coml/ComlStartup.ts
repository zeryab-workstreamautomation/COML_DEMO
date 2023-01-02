import { AssetID } from "./Asset";
import { Attachment } from "./Attachment";
import { UI5Attachment } from "./bridge/ui5/UI5Attachment";
import { AttachmentImpl } from "./impl/AttachmentImpl";
import { DefaultImplementations } from "./impl/DefaultImplementations";
import { JQueryAjax } from "./impl/JQueryAjax";
import { SimpleAssetFactory } from "./impl/SimpleAssetFactory";
import { Tests } from "./impl/TreeMerge";
import { Implementations } from "./Implementations";

/**
 * The default COML entrypoint.
 * 
 * Install your attachment, asset factory and attach COML to an element of your SPA's start html file.
 */
export default class ComlStartup {
    protected dontUseUI5: boolean;

    constructor(dontUseUI5:boolean) {
        this.dontUseUI5=dontUseUI5;
        this.configureImplementations()
    }

    protected configureImplementations() {
        /* set up the implemntations of ajax, assets, Converter and Render */
        let that=this;
        new (class extends DefaultImplementations {
            protected createAttachmentImpl(): Attachment {
                if (!that.dontUseUI5)
                    return new UI5Attachment();
                return new AttachmentImpl();
            }
        })
        (
            new JQueryAjax(),
            new SimpleAssetFactory()
        );
    }

    attachTo(id:string,page:string|AssetID) {
        let inserter=Implementations.createAttachment();
        let element=document.querySelector(`#${id}`);
        element.innerHTML='';
        inserter.attach(element,page);
    }
}