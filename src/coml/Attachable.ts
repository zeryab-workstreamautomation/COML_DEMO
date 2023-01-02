import { AttachmentImpl } from "./impl/AttachmentImpl";


/**
 * A heirarchy of objects that need to know when they attach or detach
 */
export interface Attachable {
    /**
     * Set the attachment on this convertr - when it is attached to a node on the window.document
     * 
     * @param attachment 
     */
    setAttachment(attachment:AttachmentImpl) ;

    
    addChild(child:Attachable);

    removeChild(child:Attachable);

    setParent(parent:Attachable);

    getParent(parent:Attachable) : Attachable;

}

export function isAttachable(obj: any): obj is Attachable {
    return typeof obj == 'object' && 'setAttachment' in obj;
}