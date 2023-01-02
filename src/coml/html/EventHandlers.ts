import { Converter } from "../Converter";
import { TargetNode } from "../TargetNode";
import { This } from "../This";

/**
 * Installs DOM event handlers on a target node from the attributes of a source node.
 */
export class EventHandlers {
    protected tnode:Element;
    protected tn:TargetNode;

    constructor(tnode:Element,tn:TargetNode) {
        this.tnode=tnode;
        this.tn=tn;
    }

    /**
     * if 'attr' is an attribute name that follows the naming convention of an event handler, returns the event name, else nothing
     * 
     * @param attr 
     *
    */
    static isEventAttr(attr: string) {
        if (attr.startsWith('on'))
            return attr.substring(2);
        if (attr.startsWith('co-on'))
            return attr.substring(5);
    }

    /**
     * Returns an event handler as installed on an elements 'on<event>' attribute.
     * 
     * @param script The value of the attribute (script text, e.g. 'this.onclick(event)')
     * @param cvt The converter to use for string expansion, and whose This will be bound to the handler.
     * @returns A functaion
     */
    public makeEventHandler(script:string,cvt: Converter<This>) : (event:Event)=>any {
        let scriptbody=cvt.expandString(script,this.tn);
        if (scriptbody)
            return (new Function('event',scriptbody)).bind(cvt.getThis());
    }

    /**
     * Installs all event handlers declared on snode onto tnode
     * 
     * @param snode 
     * @param cvt 
     */
    public addEventHandlersFromAttrsOf(snode: Element, cvt: Converter<This>) {
       /* if (snode.tagName.toLowerCase()=='ws-palette-color')
            console.log(`FOUND 1`);

        if (snode.getAttribute('id')=='xyz')
            console.log("FOUND"); */
        let attrs = snode.attributes;
        for (let i = 0; i < attrs.length; i++) {
            let evname;
            if (attrs[i].name!='class' && attrs[i].name!='style' && (evname=EventHandlers.isEventAttr(attrs[i].name))) {
                let handler=this.makeEventHandler(attrs[i].value,cvt);
                if (handler)
                    this.tnode.addEventListener(evname,handler);
            }
        }
    }

    
}