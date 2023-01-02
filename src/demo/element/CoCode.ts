import { isTextAsset, restoreAssetID } from "../../coml/Asset";
import { CoElement } from "../../coml/CoElement";
import { CoElementFactory } from "../../coml/CoElementFactory";
import { Converter } from "../../coml/Converter";
import { BaseCoElement } from "../../coml/element/BaseCoElement";
import { DocumentAssetImpl } from "../../coml/impl/DocumentAssetImpl";
import { Implementations } from "../../coml/Implementations";
import { Render } from "../../coml/Render";
import { TargetNode, getAttr, ctn } from "../../coml/TargetNode";
import { This } from "../../coml/This";
import { isFromCodeAssetFactory } from "../FromCodeAssetFactory";


export interface CodeMirrorType {
	/**
	 * Convert a textarea in elem to a CodeMirror.
	 * @param elem 
	 * @param config 
	 */
	fromTextArea(elem:Element,config?:CodeSettings) :CodeMirrorType;

	/**
	 * Return the code inside the editor as text.
	 */
	getValue() : string;

	/**
	 * Set the code inside the editor.
	 * 
	 * @param code 
	 */
	setValue(code:string); 
}

declare var CodeMirror: CodeMirrorType;

export interface CodeSettings {
	value?: string;//"function myScript(){return 100;}\n",
	mode?:  string;//"javascript"
	lineWrapping?:boolean;
	lineNumbers?:boolean;
	tabSize?:number;
	theme?:string;
	foldGutter?: boolean;
    gutters?: string[];//["CodeMirror-linenumbers", "CodeMirror-foldgutter"];
}

/**
 * Displays code using codemirror
 * 
 * Put these script tags in your html before using:
 * 
 * ```html
 *     <!--codemirror and friends-->
    <script src='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js'></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/css/css.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/htmlmixed/htmlmixed.js"></script>

    <!-- js beautify for code mirror -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-css.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-html.js"></script>

 * ```

    Then example usage :

```html
    <code  src="tabs.html" mode="htmlmixed" lineNumbers="true" tabSize="2"></code>
```
 * 
 */
class CodeElement extends BaseCoElement {
    protected codeMirror:CodeMirrorType;


    constructor(cvt:Converter<This>,tn:TargetNode) {
       super(cvt,tn);
    }

    public setCodeText(code:string,mode:string) {
        let fn='html_beautify';
        if (mode=='javascript')
            fn='js_beautify';
        if (this.codeMirror && (window as any).html_beautify) {
            code=(window as any)[fn](code,{ // see https://beautifier.io/
                "indent_size": "2",
                "indent_char": " ",
                "max_preserve_newlines": "5",
                "preserve_newlines": true,
                "keep_array_indentation": false,
                "break_chained_methods": false,
                "indent_scripts": "normal",
                "brace_style": "collapse",
                "space_before_conditional": true,
                "unescape_strings": false,
                "jslint_happy": false,
                "end_with_newline": false,
                "wrap_line_length": "0",
                "indent_inner_html": false,
                "comma_first": false,
                "e4x": false,
                "indent_empty_lines": false
              });

              
            

        }
        if (this.codeMirror) {
            
            let lines = code.split(/\r\n|\r|\n/).length;
            if (lines<10)
                code=code+`\n\n\n\n\n\n\n\n`; 
            this.codeMirror.setValue(code);
        }
    }


    onRender(rm: Render) {
        rm.openStart('div',this)
        .class('u-co-code')
        .copyAttrExcept(this)
		.openEnd()

            .openStart('textarea')
            .class('u-codecontrol')
            .copyAttrExcept(this)
            .openEnd()


            .close('textarea')

        .close('div');
    }

    protected getContent() : string {
        let text=(this.getTN().snode as Element).innerHTML;
        if (text)
            text=text.trim();
        if (text.length>0)
            return text.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    }

    protected getCode() : Promise<string> {
        let src = this.attr<string>('src');
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

    protected getCodeSettings() : CodeSettings{
        const {cvt,tn} = ctn(this);
        return {
            lineWrapping:this.attr('lineWrapping',false),
            lineNumbers:this.attr('lineNumbers',true),
            //foldGutter:this.attr('foldGutter',false),
            tabSize:this.attr<number>('tabSize',2),
            theme:this.attr<string>('theme','default'),
            mode:this.attr<string>('mode','htmlmixed'),
            //gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        }        
    }

    /**
     * Override if you need to be called on onAfterRendering(). ref is this control's domref
     * 
     * @param ref 
     */
    onPostRender(ref: any) {
        let elem:Element=(ref as Element);
        if (elem)
            elem=elem.querySelector('textarea');
		if (elem) {
            let settings=this.getCodeSettings();
			this.codeMirror = CodeMirror.fromTextArea(elem,settings);
            let code=this.getCode();
            if (code) {
                code.then((text)=>{
                    if (text) {
                        this.setCodeText(text,settings.mode);
                    }
                });
            }
		}
        this.registerContentAsAsset();
	}

    public getAssetId() {
        return /*this.getAttr('src')||*/this.attr('id');
    }

    /**
     * Register a callback with our demo asset factory so that when a document is 
     * retrived for execution, we return the (possibly user modified) contents from
     * code mirror.
     */
    protected registerContentAsAsset() {
        let assf=Implementations.getAssetFactory();
        if (isFromCodeAssetFactory(assf)) {
            let id=this.getAssetId();
            if (id) {
                let that=this;
                assf.addAsset(id,(assetId)=>{
                    return new class extends DocumentAssetImpl {
                        public getText() : Promise<string> {
                            return Promise.resolve(that.codeMirror.getValue());
                        }
                    }(restoreAssetID(assetId));
                })
            }

        }
    }

	public getCodeMirror() : CodeMirrorType {
		return this.codeMirror;
	}

}

/**
 * The factory class is registered into the UI5Converter, example when imported via a script in the <head>
 * 
 * ```
 * <head>
    <script>
        this.import('demo/element/CoCode');
    </script>
  </head> 
 * ```
 * 
 */
  export default class CoCodeFactory implements CoElementFactory {
    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('co-code', this);
    }

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new CodeElement(cvt, tn);
    }

}

