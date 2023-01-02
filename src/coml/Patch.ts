
/**
 * A patch is responsibe for 'patching' a tnode back to its original position
 * in its target dom's parent element. It is used during the repaint of an interim node
 * to patch the rebuilt tnode back to its original position
 */
export interface Patch {

    /**
     * Restore the newly generated 'elem' to its original location in its parent.
     * 
     * @param elem 
     */
    restorePosition(elem:Node);
}

