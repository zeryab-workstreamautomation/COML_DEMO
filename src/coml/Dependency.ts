
/**
 * A dependency is something that a COElement relies upon being present in the current window's document.
 * This interface defines an API that can be used to manage attachment and detachment of dependencies.
 */
export interface Dependency {

    /**
     * Returns an id that uniquly identifies this dependency
     */
    getId() : string;

    /**
     * Returns the number of times this dependency has been attached to the document.
     */
    getRefCount() : number;

    /**
     * Update the attachment of this dependency by the increment given in `by`
     * 
     * @param by 
     */
    updateRefCount(by:number);

    /**
     * Attach this dependency from the current window's document and set its reference count to 1
     */
    attach() : Promise<any>;

    /**
     * detach (remove) this dependency from the current window's document.
     */
    detach();
}