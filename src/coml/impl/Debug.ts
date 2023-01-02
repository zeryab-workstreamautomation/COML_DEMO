import { isTargetNode, TargetNode } from "../TargetNode";


/**
 * returns 'cht' repeated cnt times.
 * 
 * @param cnt 
 * @param chr 
 */
export function pad(cnt:number,chr:string='-') : string {
    let s='';
    while(cnt>0)    {
        s+=chr;
        cnt--;
    }
    return s;
}

/**
     * For debugging, display an identifiable string for a node.
     * @param node 
     * @returns 
     */
 export function toStr(node:Node|string|TargetNode) {
    if (!node)
        return 'undefined';
    if (typeof node=='string')
        return node;
    if (isTargetNode(node))
        node=node.snode;
    if (node instanceof HTMLElement) {
        let id=(node as Element).id;
        let tag=node.tagName.toLowerCase()
        let classes='';

        if (node.classList && node.classList.length) {
            for(let i=0;i<node.classList.length;i++) {
                classes+=node.classList[i];
                classes+='.';
            }
        }

        if (classes.length>0) {
            return `${tag}${(id)? '#'+id:''}.`+classes;
        } else {
            return `${tag}${(id)? '#'+id:''}`;
        }

    }
    else {
        let type='node';
        switch((node as any).nodeType) {
            case Node.ATTRIBUTE_NODE: type='ATTRIBUTE_NODE';break;
            /** node is a CDATASection node. */
            case Node.CDATA_SECTION_NODE: type='CDATA_SECTION_NODE';break;
            /** node is a Comment node. */
            case Node.COMMENT_NODE: type='COMMENT_NODE';break;
            /** node is a DocumentFragment node. */
            case Node.DOCUMENT_FRAGMENT_NODE: type='DOCUMENT_FRAGMENT_NODE';break;
            /** node is a document. */
            case Node.DOCUMENT_NODE: 
                type='DOCUMENT_NODE '+(node as Document).documentURI;
                break;
            /** Set when other is a descendant of node. */
            case Node.DOCUMENT_POSITION_CONTAINED_BY: type='DOCUMENT_POSITION_CONTAINED_BY';break;
            /** Set when other is an ancestor of node. */
            case Node.DOCUMENT_POSITION_CONTAINS: type='DOCUMENT_POSITION_CONTAINS';break;
            /** Set when node and other are not in the same tree. */
            case Node.DOCUMENT_POSITION_DISCONNECTED: type='DOCUMENT_POSITION_DISCONNECTED';break;
            /** Set when other is following node. */
            case Node.DOCUMENT_POSITION_FOLLOWING: type='DOCUMENT_POSITION_FOLLOWING';break;
            case Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: type='DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC';break;
            /** Set when other is preceding node. */
            case Node.DOCUMENT_POSITION_PRECEDING: type='DOCUMENT_POSITION_PRECEDING';break;
            /** node is a doctype. */
            case Node.DOCUMENT_TYPE_NODE: type='DOCUMENT_TYPE_NODE';break;
            /** node is an element. */
            case Node.ELEMENT_NODE: type='ELEMENT_NODE';break;
            case Node.ENTITY_NODE: type='ENTITY_NODE';break;
            case Node.ENTITY_REFERENCE_NODE: type='ENTITY_REFERENCE_NODE';break;
            case Node.NOTATION_NODE: type='NOTATION_NODE';break;
            /** node is a ProcessingInstruction node. */
            case Node.PROCESSING_INSTRUCTION_NODE: type='PROCESSING_INSTRUCTION_NODE';break;
            /** node is a Text node. */
            case Node.TEXT_NODE: type='TEXT_NODE';break;      
        }  

        return type;
    }
}