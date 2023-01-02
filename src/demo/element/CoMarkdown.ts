import { isTextAsset, restoreAssetID } from "../../coml/Asset";
import { CoElement } from "../../coml/CoElement";
import { CoElementFactory } from "../../coml/CoElementFactory";
import { Converter } from "../../coml/Converter";
import { BaseCoElement } from "../../coml/element/BaseCoElement";
import { Implementations } from "../../coml/Implementations";
import { Render } from "../../coml/Render";
import { TargetNode, getAttr, ctn } from "../../coml/TargetNode";
import { This } from "../../coml/This";


export interface ShowdownType {
	/**
	 * Convert MD to html
	 * @param elem 
	 * @param config 
	 */
    makeHtml(text:string) :string;

}

declare var showdown: any;

export interface ShowdownSettings {
	
}

/**
 * 
 */
class MarkdownElement extends BaseCoElement {
    protected converter:ShowdownType;


    constructor(cvt:Converter<This>,tn:TargetNode) {
       super(cvt,tn);

    }

   


    onRender(rm: Render) {
        rm.openStart('div',this)
		.class('u-markdown')
        .copyAttrExcept(this)
		.openEnd()

		.close('div')  
    }

    protected getContent() : string {
        let text:string;
        if (this.getTN().snode.childNodes) {
            let cn=this.getTN().snode.childNodes;
            text='';
            for(let i=0;i<cn.length;i++) {
                if (cn[i].nodeType==Node.TEXT_NODE)
                    text+=cn[i].nodeValue;
            }
            return text;
        }

        if (text)
            text=text.trim();
        if (text.length>0)
            return text;
    }

    protected getMarkdown() : Promise<string> {
        const {cvt,tn} = ctn(this);
        let src = getAttr<string>(cvt, tn.snode, 'src');
        if (src) {
            let assetId=restoreAssetID(src);


            let asset=Implementations.getAssetFactory()
                .get(assetId);
            if (!asset) {
                console.error(`co-code: can't find an asset with id =${src}`);
                return;
            }        

            if (isTextAsset(asset)) {
                return asset.getText();
            }
        }

        return Promise.resolve(this.getContent());

    }

    protected getSettings() : ShowdownSettings{
        const {cvt,tn} = ctn(this);
        return {
          
        }        
    }

    /**
     * Override if you need to be called on onAfterRendering(). ref is this control's domref
     * 
     * @param ref 
     */
    onPostRender(ref: any) {
        let elem:Element=(ref as Element);
		if (elem) {
            if (!this.converter)
                this.converter=new showdown.Converter({});

            let code=this.getMarkdown();
            if (code) {
                code.then((text)=>{
                    if (text) {
                        let html=this.converter.makeHtml(text);

                        elem.innerHTML=html;
                    }
                });
            }
		}
	}

	public getShowdown() : ShowdownType {
		return this.converter;
	}

}

/**
 * The factory class is registered into the UI5Converter, example when imported via a script in the <head>
 * 
 * ```
 * <head>
    <script>
        this.import('demo/element/CoMarkdown');
    </script>
  </head> 
 * ```
 * 
 */
  export default class CoCodeFactory implements CoElementFactory {
    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('co-markdown', this);
    }

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new MarkdownElement(cvt, tn);
    }

}

