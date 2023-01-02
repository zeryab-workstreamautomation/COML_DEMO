import { isTextAsset, restoreAssetID } from "../../../coml/Asset";
import { CoElement } from "../../../coml/CoElement";
import { CoElementFactory } from "../../../coml/CoElementFactory";
import { Converter } from "../../../coml/Converter";
import { BaseCoElement } from "../../../coml/element/BaseCoElement";
import { Implementations } from "../../../coml/Implementations";
import { Render } from "../../../coml/Render";
import { TargetNode, getAttr, ctn } from "../../../coml/TargetNode";
import { This } from "../../../coml/This";


export interface ChartjsType {
	/**
	 * Convert MD to html
	 * @param elem 
	 * @param config 
	 */
    makeHtml(text:string) :string;

}

declare var Chart: any;

export interface ChartjsSettings {
	
}

/**
 * 
 */
class ChartjsElement extends BaseCoElement {
    protected chart:ChartjsType;


    constructor(cvt:Converter<This>,tn:TargetNode) {
       super(cvt,tn);
    }

   


    onRender(rm: Render) {
        const {cvt,tn} = ctn(this);

        rm.openStart('div',this);
		rm.class('u-chartjs');
        cvt.copyAttrExcept(rm,tn.snode);
		rm.openEnd();

            rm
            .openStart('canvas')
            .class('u-chartjs-canvas')
            .openEnd()
            .close('canvas');


		rm.close('div');  
    }

   
    protected getScriptText(scriptElem:Node) {
        let script:string;
        for (let i = 0; i < scriptElem.childNodes.length; i++) {
            let cn=scriptElem.childNodes[i];

            if (cn.nodeType==Node.TEXT_NODE) {
                //console.log(cn.nodeValue);
                if (!script)
                    script=cn.nodeValue;
                else 
                    script+=('\n'+cn.nodeValue);
            }
        }
        return script;
    }

    /**
     * Fetch settings from any <scrip> block of our snode.
     * 
     * @returns the Settings object needed to initialize the UI5 Control that we will host
     */
    protected getSettings() {
        const {tn,cvt} = ctn(this);

        let script;
        for(let i=0;i<(tn.snode as Element).children.length;i++) {
            if ((tn.snode as Element).children[i].tagName.toLowerCase()=='script') {
                script=this.getScriptText((tn.snode as Element).children[i]);
            }
        }


        
        let settings={};
        if (script) {
            (cvt.getThis() as any).settings=(incoming)=>{
                settings=incoming;
            }
            cvt.executeScript(script);
        }
        return settings;
    }

    /**
     * Override if you need to be called on onAfterRendering(). ref is this control's domref
     * 
     * @param ref 
     */
    onPostRender(ref: any) {
        let elem:Element=(ref as Element);
		if (elem) {
            let canvas=elem.querySelector('canvas');
			
            let settings=this.getSettings();

            this.chart=new Chart(canvas,settings);
		}
	}

	public getChartjs() : ChartjsType {
		return this.chart;
	}

}

/**
 * The factory class is registered when imported via a script in the <head>
 * 
 * ```
 * <head>
    <script>
        this.import('coml/bridge/chartjs/CoChartjs');
    </script>
  </head> 
 * ```
 * 
 */
  export default class CoChartjsFactory implements CoElementFactory {
    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('co-chartjs', this);
    }

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new ChartjsElement(cvt, tn);
    }

}

