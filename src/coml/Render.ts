import { CoElement } from "./CoElement";

/**
 * Used to render a component. Supplies methods that should be used to render target nodes.
 */
export interface Render {
    /**
     * Adds an attribute name-value pair to the last open HTML element.
     *
     * This is only valid when called between `openStart/voidStart` and `openEnd/voidEnd`. The attribute name
     * must not be equal to `style` or `class`. Styles and classes must be set via dedicated `class` or `style`
     * methods. To update the DOM correctly, all attribute names have to be used in their canonical form. For
     * HTML elements, {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes attribute names} must
     * all be set in lowercase. For foreign elements, such as SVG, {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
     * attribute names} can be set in upper camel case (e.g. viewBox).
     */
    attr(
        /**
         * Name of the attribute
         */
        sName: string,
        /**
         * Value of the attribute
         */
        vValue: any
    ): this;
    /**
     * @SINCE 1.0.0
     *
     * Adds a class name to the class collection of the last open HTML element.
     *
     * This is only valid when called between `openStart/voidStart` and `openEnd/voidEnd`. Class name must not
     * contain any whitespace.
     */
    class(
        /**
         * Class name to be written
         */
        sClass: string
    ): this;


    /**
     * @SINCE 1.0.0
     *
     * Closes an open tag started with `openStart` and ended with `openEnd`.
     *
     * This indicates that there are no more children to append to the open tag.
     */
    close(
        /**
         * Tag name of the HTML element
         */
        sTagName: string
    ): this;



    /**
     * Insert a prerendered dom node into the current rendering position.
     * 
     * @param elem 
     * @returns 
     */
    insertRendered(elem:Element) : this

    /**
     * Cleans up the resources associated with this instance.
     *
     * After the instance has been destroyed, it must not be used anymore. Applications should call this function
     * if they don't need the instance any longer.
     */
    destroy(): void;

    /**
     * @SINCE 1.0.0
     *
     * Ends an open tag started with `openStart`.
     *
     * This indicates that there are no more attributes to set to the open tag.
     */
    openEnd(): this;
    /**
     * @SINCE 1.0.0
     *
     * Opens the start tag of an HTML element.
     *
     * This must be followed by `openEnd` and concluded with `close`. To allow a more efficient DOM update,
     * all tag names have to be used in their canonical form. For HTML elements, {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element
     * tag names} must all be set in lowercase. For foreign elements, such as SVG, {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element
     * tag names} can be set in upper camel case (e.g. linearGradient).
     */
    openStart(
        /**
         * Tag name of the HTML element
         */
        sTagName: string,
        /**
         * Control instance to identify the element
         */
        vControl?: CoElement,

        /**
         * If true, do not add the 'data-coid' id.
         */
        noCoId?:boolean
    ): this;

    /**
     * Renders the children snodes (i.e. any elements embedded within) the calling component.
     * If called multile times by a COmponent, for example to create multiple iterations,
     * then the 'iteration' parameter must be increased from previous (starting from 0) on each successive call.
     * 
     * @param component The component whose children are to be rendered.
     * @param iteration The iteration - if not specified to 0
     * @param parametersPerChild The parameters to store per child tag. The child can retrieve this using its `this.params()` call. 
     */
    renderChildren(component:CoElement, iteration?:number,parametersPerChild?:{[tagname:string]:any}) : this;


    /**
     * Copy attributes and classes with ${} expansion into the last opened HTML element.
     * 
     * 
     * @param component The component 
     * @param doNotCopy (Optional) an array of attributes to NOT copy.
     * @param copyFrom  (Optional) the element to copy from. If not specified, defaults to this component's source node
     */
    copyAttrExcept(component:CoElement,doNotCopy?: string[],copyFrom?: Node) : this;

    /**
     * @SINCE 1.0.0
     *
     * Adds a style name-value pair to the style collection of the last open HTML element.
     *
     * This is only valid when called between `openStart/voidStart` and `openEnd/voidEnd`.
     */
    style(
        /**
         * Name of the style property
         */
        sName: string,
        /**
         * Value of the style property
         */
        sValue: string
    ): this;
    /**
     * @SINCE 1.0.0
     *
     * Sets the text content with the given text.
     */
    text(
        /**
         * The text to be written
         */
        sText: string
    ): this;

    /**
     * @SINCE 1.0.0
     *
     * Sets the given HTML markup without any encoding or sanitizing.
     *
     * This must not be used for plain texts; use the `text` method instead.
     */
    unsafeHtml(
        /**
         * Well-formed, valid HTML markup
         */
        sHtml: string
    ): this;


}