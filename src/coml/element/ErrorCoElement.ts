import { Converter } from "../Converter";
import { Render } from "../Render";
import { TargetNode } from "../TargetNode";
import { This } from "../This";
import { BaseCoElement } from "./BaseCoElement";

export class ErrorCoElement extends BaseCoElement {
    protected msg:string;
    constructor(cvt:Converter<This>,tn:TargetNode,msg:string) {
        super(cvt,tn);
        this.msg=msg;
    }

    private getSurname() {
        let name=(this.getTN().snode as Element).tagName.toLowerCase();
        /*
        let dash=name.indexOf('-');
        if (dash>0 && dash<name.length-1) {
            return name.substring(dash+1);
        }*/
        return name;
    }

    onRender(rm: Render) {
        rm.openStart('div',this)
        .class('u-coml-error')
        .class('u-'+this.getSurname())
        .openEnd()
        .text(this.msg);

        this.getCvt().renderChildren(rm,this.getTN());

        rm.close('div');
    }
}