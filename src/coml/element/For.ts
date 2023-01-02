import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { BaseCoElement } from "../element/BaseCoElement";
import { Render } from "../Render";
import { ctn, getAttr, TargetNode } from "../TargetNode";
import { This } from "../This";



/**
 * A for loop iterates over a list or a fixed count. The current value can be read from the `this` object
 * in a field given by the `countername` attribute.
 * 
 * Fixed count:
 * ```html
 * <for count="10" countername="cnx">
     <div>${this.cnx}</div>
 * </for>
 * ```
 * 
 * Over a list in an attribute 'in'
 * ```html
 * <for in="Oranges,Apples,Bananas" countername="fruit">
 *    
 *        <div>${this.fruit}</div>
 *    
 * </for>
 * ```
 * 
 * Over a list specified via code:
 * ```html
 * <script>
 *    this.cars=[
 *      {model:'Corolla',engSize:'medium'},
 *      {model:'Camry',engSize:'big'},
 *    ];
 * </script>
 * 
 * <for countername="car" inthis="cars">
 *    
 *        <div>${this.car.model}</div>
 *        <div>${this.car.engineSize}</div>
 *    
 * </for>
 * ```
 * 
 */
class ForElement extends BaseCoElement {
    public repeat:number;
    public ins:string|string[]|number[]|object[];
    public countername:string;
    public counter:any;
    public list:object[];

    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
    }


    onRender(rm: Render): void {
        const {cvt,tn}=ctn(this);
        rm.openStart('div',this)
        .class('co-for');
        cvt.copyAttrExcept(rm,tn.snode);
        cvt.encodeWSE(rm,tn);
        rm.openEnd();

        this.countername=getAttr<string>(cvt,tn.snode,'countername','_ws_loop_count',tn);

        let inthis=getAttr<string>(cvt,tn.snode,'inthis');
        if (inthis)
            this.list=cvt.getThis()[inthis];

        if (!this.list) {
            this.repeat=getAttr<number>(cvt,tn.snode,'ws-count',0,tn) || getAttr<number>(cvt,tn.snode,'count',0,tn);
            this.ins=getAttr<string>(cvt,tn.snode,'in');
            if (this.ins) {
                this.ins=this.ins.split(',');
                this.repeat=this.ins.length;
            } else {
                this.ins=[] as number[];
                for(let i=0;i<this.repeat;i++) {
                    this.ins.push(i);
                }
            }
        } else {
            this.ins=this.list;
            this.repeat=this.list.length;
        }

       
        this.counter=0;
        for(let i=0;i<this.repeat;i++) { // execute the loop. save the counter 
            let x=(this.ins.length) ? this.ins[i%this.ins.length]:i;
            cvt.getThis()[this.countername]=x;
            this.counter=x;
            cvt.renderChildren(rm,tn,i);
        }

        rm.close('div');
    }

}

export default class WSLoopFactory implements CoElementFactory {
    registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('for',this);
    }

    makeComponent(tn:TargetNode,cvt:Converter<This>): CoElement {
        switch((tn.snode as Element).tagName.toLowerCase()) {
            case 'for':return new ForElement(cvt,tn); 
        }
    }

}