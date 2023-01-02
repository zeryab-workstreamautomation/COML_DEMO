import { Asset, AssetID, AssetType, isCoElementAsset, stringifyAssetID } from "../Asset"
import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { Render } from "../Render";
import { ctn, getAttr, TargetNode } from "../TargetNode";
import { BaseCoElement } from "../element/BaseCoElement";
import { Implementations } from "../Implementations";
import { This } from "../This";
import { DocumentAssetImpl } from "../impl/DocumentAssetImpl";


/**
 * A component which contains other coml pages. Any page can be shown by calling the show() method.
 */
class Pages extends BaseCoElement {
    protected name:string;
    protected local:boolean;
    protected child:CoElement;
    protected cache:Map<string,CoElement>=new Map();

    constructor(cvt:Converter<This>,tn:TargetNode) {
        super(cvt,tn);
        this.name=getAttr<string>(cvt,tn.snode,'name',undefined,tn);
        this.local=getAttr<boolean>(cvt,tn.snode,'local',false,tn);

        //this.registerServiceEvents();
    }


    /**
     * Shows direct html content inside this page.
     * 
     * @param html 
     * @param animation 
     */
    public showHtml(html:string,animation?:'to'|'back'|'up'|'down',params?:{[key:string]:any}) {
        let anonAsset=new class extends DocumentAssetImpl {
            public getText() : Promise<string> {
                return Promise.resolve(html);
            }
        }({name:'__anon',type:AssetType.page});
        this.showAsset(anonAsset,animation,true,params);
    }

    protected showAsset(asset:Asset,
        animation?:'to'|'back'|'up'|'down',
        dontReuse?:boolean,
        params?:{[key:string]:any}) {

        if (isCoElementAsset(asset)) {
            let asControl: Promise<CoElement>;
            if (!dontReuse) {
                let control = this.fromCache(asset.getId());
                if (control) {
                    asControl = Promise.resolve(control);
                }
            }
            if (!asControl)
                asControl = asset.asCoElement(undefined,(cvt)=>{
                    if (params) {
                        cvt.addOnThisCreatedListener((t:This)=>{
                            t.parameters=params;
                        })
                    }
                });

            asControl
                .then((control) => {
                    control.getTN().data("__asset_id", asset.getId()); // note: serializing the assetid causes a problem , ui5 tries to bind it (I think '{' throws it)})
                    //console.log(`---id1=${control.data("__asset_id")}`);
                    //if (callback) {
                    //    callback(control, ((control as any).getThis) ? (control as any).getThis() : undefined);
                    //}
                    this.toCache(asset.getId(), control);
                    this.setChildControl(control, animation);
                    //console.log(`---id2=${control.data("__asset_id")}`);
                    this.getCvt().getThis().dispatchEvent('pagechanged',{asset:asset});
                })
        }
    }

    public show(pageid: string|AssetID,
                animation?:'to'|'back'|'up'|'down',
                dontReuse?:boolean,
                params?:{[key:string]:any}) {
        let assetid: string | AssetID;
        if (typeof pageid == 'string' && pageid.indexOf('{') < 0) {
            // its not a stringified id
            assetid = { type: AssetType.page, name: pageid };
        } else {
            assetid = pageid;
        }

        let asset = Implementations.getAssetFactory().get(assetid);
        if (!asset && typeof pageid == 'string') {
            // try converting to an asset id
            asset = Implementations.getAssetFactory().get({ type: AssetType.indexpage, name: pageid });
        }

        if (asset)
            this.showAsset(asset,animation,dontReuse,params);
         
    }

    /**
     * Sets a new child control, or removes current child it if `control` is null.
     */
    protected setChildControl(control:CoElement,animation?:'to'|'back'|'up'|'down') {
        const {cvt,tn} = ctn(this);
        let lastControl:CoElement;
        //let changed=(this.child!=control);
        if (this.child) {
            lastControl=this.child;
            cvt.detach(this.child);
        }

        this.child=control;
        if (this.child) {

            cvt.attach(tn.tnode,this.child)
            .then(()=>{
                this.animate(this.child,animation);
                //cvt.invalidate(tn);
            })
        } else {
            cvt.invalidate(tn);
        }
    }

    protected animateOld(control: CoElement,animation?:'to'|'back'|'up'|'down') {
        if (animation) { // animation

            let lastEventDelegate=control.getTN().data('__animator');
            if (lastEventDelegate) {
                control.getTN().removeListener('onPostRender',lastEventDelegate);
            }
            control.getTN().addListener('onPostRender',lastEventDelegate=(domRef:Element)=> {
                domRef.classList.add('co-animation-'+animation);
                setTimeout(()=>{
                    domRef.classList.remove('co-animation-'+animation);
                },500);
            });
            control.getTN().data('__animator',lastEventDelegate); // so we can remove the function again
        }
    }

    static anum=0;
    protected animate(control: CoElement,animation?:'to'|'back'|'up'|'down') {
        if (animation) { // animation
            let num=Pages.anum++;
            control.$(null,'__animator',(elem)=>{
                //let aid=(control.getTN().snode as Element).getAttribute('data-asset-id');
                //console.log('-----ANIM['+aid+']----['+num+']='+animation);
                elem.classList.add('co-animation-'+animation);
                setTimeout(()=>{
                    control.$(null,'__animator'); // remove 
                    elem.classList.remove('co-animation-'+animation);
                },500);
            });
        } else {
            control.$(null,'__animator');
        }
    }

    protected toCache(assetId:AssetID,control: CoElement) {
        let key=stringifyAssetID(assetId);
        this.cache.set(key,control);
    }

    protected fromCache(assetId:AssetID) : CoElement {
        let key=stringifyAssetID(assetId);
        return this.cache.get(key);
    }

    onRender(rm: Render): void {
        rm.openStart('div',this);
        rm.class('u-ws-page-container');
        if (!this.child)
            rm.class('u-ws-nochild');
        rm.copyAttrExcept(this,['id']);
        this.cvt.encodeWSE(rm,this.tn);
        rm.openEnd();

        this.getCvt().renderChildren(rm,this.getTN());

        rm.close('div');
    }

}


export default class PagesFactory implements CoElementFactory {
    public registerFactory(cvt: Converter<This>) {
        cvt.registerFactory('pages',this);
    }

    public makeComponent(tn:TargetNode,cvt:Converter<This>): CoElement {
        return new Pages(cvt,tn) ;
    }

}

