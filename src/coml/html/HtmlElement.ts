import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { ConverterImpl } from "../impl/ConverterImpl";
import { TargetNode } from "../TargetNode";
import { Render } from "../Render";
import { EventHandlers } from "./EventHandlers";
import { BaseCoElement } from "../element/BaseCoElement";
import { This } from "../This";

/**
 * elements like <div><p>,<h1>,<div><span> etc that can be rendered as themselves into html.
 * 
 */
 export class HtmlElement  extends BaseCoElement {

    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
    }

    
    protected getTagName(elem:Element) {
        return elem.tagName.toLowerCase();
    }

    protected start(rm: Render,cvt: Converter<This>,elem:Element,tn:TargetNode) {
        rm.openStart(this.getTagName(elem),this);
        if (elem.classList && elem.classList.length) {
            for(let i=0;i<elem.classList.length;i++) {
                let str=cvt.expandString(elem.classList[i],tn);
                if (!str || str.length==0)  {
                    console.warn(`class [${elem.classList[i]}] expanded to empty string`)
                } else {
                    rm.class(str);
                }
            }
        }

        

        // set inline styles
        let str=elem.getAttribute('style');
        if (str && str.length) {
            let estr=cvt.expandString(str,tn);
            let pairs:string[][]=estr.slice(0, estr.length - 1).split(';').map(x => x.split(':')); //// gives [ ['color', 'blue'], ['display', 'flex'] ]
            for(let pair of pairs) {
                if (pair && pair.length>1 && pair[0] && pair[1] && pair[0].trim().length)  {
                    rm.style(pair[0].trim(),pair[1]);
                }
            }
        }

        let attrs = elem.attributes;
        for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name!='class' && attrs[i].name!='style' && !EventHandlers.isEventAttr(attrs[i].name)) {
                rm.attr(attrs[i].name,cvt.expandString(attrs[i].value,tn));
            }
        }
        //cvt.encodeWSE(rm,tn);
        rm.openEnd();
    }

 

    protected children(rm: Render,cvt: Converter<This>,tn:TargetNode) {
        cvt.renderChildren(rm,tn);
    }

    protected end(rm: Render,cvt: Converter<This>,elem:Element) {
        rm.close(this.getTagName(elem));
    }

    onRender(rm: Render): void {
        let elem=(this.tn.snode as unknown as Element) ;

        this.start(rm,this.cvt,elem,this.tn);

        this.children(rm,this.cvt,this.tn);

        this.end(rm,this.cvt,elem);

    }

    

}

export class HtmlElementFactory  implements CoElementFactory {
   

    registerFactory(cvt: Converter<This>) {
       
    }


    
    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new HtmlElement(cvt,tn) ;
    }

}