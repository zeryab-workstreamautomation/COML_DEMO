import { AjaxCache } from "../Ajax";
import { AssetID, AssetFactory } from "../Asset";
import { CoElement } from "../CoElement";
import { CoElementFactory } from "../CoElementFactory";
import { Converter } from "../Converter";
import { Render } from "../Render";
import { TargetNode } from "../TargetNode";
import { This } from "../This";


/**
 * Does not render the node or its children. e.g. <head>
 */
 class DoNotRenderElement implements CoElement {

    params() {
        throw new Error("Method not implemented.");
    }
    iter(parentTag: string): number {
        return 0;
    }

    onPostRender?(node: any) {
        throw new Error("Method not implemented.");
    }
    onPreRender?() {
        throw new Error("Method not implemented.");
    }
    cleanup?() {
        throw new Error("Method not implemented.");
    }
    attr<T extends string | number | boolean = string>(attr: string, defvalue?: T): T {
        throw new Error("Method not implemented.");
    }

    content() : string {
        return '';
    }
    
    invalidate(node: string | TargetNode | Node) {
        throw new Error("Method not implemented.");
    }
    get<T extends CoElement<This>>(node: string | Node): T {
        throw new Error("Method not implemented.");
    }
    $(node: string | TargetNode | Node, changeid?: string, changer?: (Element: any) => any): Element {
        throw new Error("Method not implemented.");
    }
    attach(parent: string | Node, toAttach: string | AssetID | CoElement<This>, parameters?: { [key: string]: any; }): Promise<CoElement<This>> {
        throw new Error("Method not implemented.");
    }
    detach(toDetach: string | CoElement<This>): Promise<any> {
        throw new Error("Method not implemented.");
    }
    ajax(callName: string, jsonToSend: any, cache?: AjaxCache, responseDataType?: "xml" | "json" | "script" | "html" | "jsonp" | "text"): Promise<any> {
        throw new Error("Method not implemented.");
    }
    assets(): AssetFactory {
        throw new Error("Method not implemented.");
    }
    
    dispatchEvent(eventname: string, detail?: { [key: string]: any; }, options?: EventInit): Event {
        throw new Error("Method not implemented.");
    }

    getCvt(): Converter<This> {
        return;
    }
    getTN(): TargetNode {
        return;
    }

    onRender(rm: Render) {
        
    }

}


/**
 * Does not render the node or its children. e.g. <head>
 */
 export class DoNotRenderElementFactory implements CoElementFactory {
    

    makeComponent(tn: TargetNode, cvt: Converter<This>): CoElement {
        return new DoNotRenderElement();
    }

    registerFactory(cvt: Converter<This>) {
       
    }

}
