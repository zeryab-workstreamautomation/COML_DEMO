declare module 'sap.tnt' {
	export = sap.tnt;
}

/**
 * SAPUI5 library with controls specialized for administrative applications.
 */
declare namespace sap.tnt {

	class NavigationList extends sap.ui.core.Control {
		/**
		 * Constructor for a new NavigationList.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: sap.tnt.NavigationListMetadata);
		/**
		 * Constructor for a new NavigationList.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @note Any overloads to support not documented metadata
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Adds some ariaDescribedBy into the association <code>ariaDescribedBy</code>.
		 * @param vAriaDescribedBy the ariaDescribedBy to add; if empty, nothing is inserted
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		addAriaDescribedBy(vAriaDescribedBy: sap.ui.core.ID|sap.ui.core.Control): NavigationList;
		/**
		 * Adds some ariaLabelledBy into the association <code>ariaLabelledBy</code>.
		 * @param vAriaLabelledBy the ariaLabelledBy to add; if empty, nothing is inserted
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		addAriaLabelledBy(vAriaLabelledBy: sap.ui.core.ID|sap.ui.core.Control): NavigationList;
		/**
		 * Adds some item to the aggregation <code>items</code>.
		 * @param oItem the item to add; if empty, nothing is inserted
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		addItem(oItem: NavigationListItem): NavigationList;
		/**
		 * Attaches event handler <code>fnFunction</code> to the <code>itemSelect</code> event of this <code>sap.tnt.NavigationList</code>.
		 * 
		 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, 
		 * otherwise it will be bound to this <code>sap.tnt.NavigationList</code> itself.
		 * 
		 * Fired when an item is selected.
		 * @param oData An application-specific payload object that will be passed to the event handler along with the event object when firing the event
		 * @param fnFunction The function to be called when the event occurs
		 * @param oListener Context object to call the event handler with. Defaults to this <code>sap.tnt.NavigationList</code> itself(optional)
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		attachItemSelect(oData: any, fnFunction: any, oListener?: any): NavigationList;
		/**
		 * Destroys all the items in the aggregation <code>items</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyItems(): NavigationList;
		/**
		 * Detaches event handler <code>fnFunction</code> from the <code>itemSelect</code> event of this <code>sap.tnt.NavigationList</code>.
		 * 
		 * The passed function and listener object must match the ones used for event registration.
		 * @param fnFunction The function to be called, when the event occurs
		 * @param oListener Context object on which the given function had to be called
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		detachItemSelect(fnFunction: any, oListener: any): NavigationList;
		/**
		 * Creates a new subclass of class sap.tnt.NavigationList with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Control.extend}.
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|NavigationListMetadata, FNMetaImpl?: any): any;
		/**
		 * Creates a subclass of class sap.ui.base.Object with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain three kinds of informations:
		 * <ul>
		 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
		 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
		 * and might contain the following information
		 * <ul>
		 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
		 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
		 * facade of the class</li>
		 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
		 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
		 * </ul>
		 * Subclasses of sap.ui.base.Object can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
		 * </li>
		 * 
		 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
		 * If no constructor function is given, the framework creates a default implementation that delegates all
		 * its arguments to the constructor function of the base class.
		 * </li>
		 * 
		 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
		 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
		 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
		 * make sense to use primitive values here other than to declare public constants.
		 * </li>
		 * 
		 * </ul>
		 * 
		 * The prototype object of the newly created class uses the same prototype as instances of the base class
		 * (prototype chaining).
		 * 
		 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
		 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
		 * itself.
		 * 
		 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
		 * can be specified. Instances of that class will be used to represent metadata for the newly created class
		 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
		 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
		 * @note Overload from base type sap.ui.base.Object
		 * @param sClassName name of the class to be created
		 * @param oClassInfo structured object with informations about the class(optional)
		 * @param FNMetaImpl constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.(optional)
		 * @return the created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.ui.core.Control with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Element.extend}.
		 * @note Overload from base type sap.ui.core.Control
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.ui.core.ControlMetadata, FNMetaImpl?: any): any;
		/**
		 * Fires event <code>itemSelect</code> to attached listeners.
		 * 
		 * Expects the following event parameters:
		 * <ul>
		 * <li><code>item</code> of type <code>sap.ui.core.Item</code>The selected item.</li>
		 * </ul>
		 * @param mArguments The arguments to pass along with the event(optional)
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		fireItemSelect(mArguments?: any): NavigationList;
		/**
		 * Returns array of IDs of the elements which are the current targets of the association <code>ariaDescribedBy</code>.
		 * @return 
		 */
		getAriaDescribedBy(): sap.ui.core.ID[];
		/**
		 * Returns array of IDs of the elements which are the current targets of the association <code>ariaLabelledBy</code>.
		 * @return 
		 */
		getAriaLabelledBy(): sap.ui.core.ID[];
		/**
		 * Gets current value of property <code>expanded</code>.
		 * 
		 * Specifies if the control is in expanded or collapsed mode.
		 * 
		 * Default value is <code>true</code>.
		 * @return Value of property <code>expanded</code>
		 */
		getExpanded(): boolean;
		/**
		 * Gets content of aggregation <code>items</code>.
		 * 
		 * The items displayed in the list.
		 * @return 
		 */
		getItems(): NavigationListItem[];
		/**
		 * Gets current value of property <code>width</code>.
		 * 
		 * Specifies the width of the control.
		 * @return Value of property <code>width</code>
		 */
		getWidth(): sap.ui.core.CSSSize;
		/**
		 * Checks for the provided <code>sap.tnt.NavigationListItem</code> in the aggregation <code>items</code>.
		 * and returns its index if found or -1 otherwise.
		 * @param oItem The item whose index is looked for
		 * @return The index of the provided control in the aggregation if found, or -1 otherwise
		 */
		indexOfItem(oItem: NavigationListItem): number;
		/**
		 * Inserts a item into the aggregation <code>items</code>.
		 * @param oItem the item to insert; if empty, nothing is inserted
		 * @param iIndex the <code>0</code>-based index the item should be inserted at; for
		 *              a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
		 *              greater than the current size of the aggregation, the item is inserted at
		 *              the last position
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		insertItem(oItem: NavigationListItem, iIndex: number): NavigationList;
		/**
		 * Removes all the controls in the association named <code>ariaDescribedBy</code>.
		 * @return An array of the removed elements (might be empty)
		 */
		removeAllAriaDescribedBy(): sap.ui.core.ID[];
		/**
		 * Removes all the controls in the association named <code>ariaLabelledBy</code>.
		 * @return An array of the removed elements (might be empty)
		 */
		removeAllAriaLabelledBy(): sap.ui.core.ID[];
		/**
		 * Removes all the controls from the aggregation <code>items</code>.
		 * 
		 * Additionally, it unregisters them from the hosting UIArea.
		 * @return An array of the removed elements (might be empty)
		 */
		removeAllItems(): NavigationListItem[];
		/**
		 * Removes an ariaDescribedBy from the association named <code>ariaDescribedBy</code>.
		 * @param vAriaDescribedBy The ariaDescribedBy to be removed or its index or ID
		 * @return The removed ariaDescribedBy or <code>null</code>
		 */
		removeAriaDescribedBy(vAriaDescribedBy: number|sap.ui.core.ID|sap.ui.core.Control): sap.ui.core.ID;
		/**
		 * Removes an ariaLabelledBy from the association named <code>ariaLabelledBy</code>.
		 * @param vAriaLabelledBy The ariaLabelledBy to be removed or its index or ID
		 * @return The removed ariaLabelledBy or <code>null</code>
		 */
		removeAriaLabelledBy(vAriaLabelledBy: number|sap.ui.core.ID|sap.ui.core.Control): sap.ui.core.ID;
		/**
		 * Removes a item from the aggregation <code>items</code>.
		 * @param vItem The item to remove or its index or id
		 * @return The removed item or <code>null</code>
		 */
		removeItem(vItem: number|string|NavigationListItem): NavigationListItem;
		/**
		 * Sets a new value for property <code>expanded</code>.
		 * 
		 * Specifies if the control is in expanded or collapsed mode.
		 * 
		 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
		 * 
		 * Default value is <code>true</code>.
		 * @param bExpanded New value for property <code>expanded</code>
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setExpanded(bExpanded: boolean): NavigationList;
		/**
		 * Sets a new value for property <code>width</code>.
		 * 
		 * Specifies the width of the control.
		 * 
		 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
		 * @param sWidth New value for property <code>width</code>
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setWidth(sWidth: sap.ui.core.CSSSize): NavigationList;

		setSelectedKey(key:string): sap.tnt.NavigationList;

		setSelectedItem(selectedItem:string|sap.tnt.NavigationListItem) : sap.tnt.NavigationList|null;

		getSelectedItem() : sap.tnt.NavigationList|null;
	}

	class NavigationListItem extends sap.ui.core.Item {
		/**
		 * Constructor for a new NavigationListItem.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: sap.tnt.NavigationListItemMetadata);
		/**
		 * Constructor for a new NavigationListItem.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @note Any overloads to support not documented metadata
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Adds some item to the aggregation <code>items</code>.
		 * @param oItem the item to add; if empty, nothing is inserted
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		addItem(oItem: NavigationListItem): NavigationListItem;
		/**
		 * Attaches event handler <code>fnFunction</code> to the <code>select</code> event of this <code>sap.tnt.NavigationListItem</code>.
		 * 
		 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, 
		 * otherwise it will be bound to this <code>sap.tnt.NavigationListItem</code> itself.
		 * 
		 * Fired when this item is selected.
		 * @param oData An application-specific payload object that will be passed to the event handler along with the event object when firing the event
		 * @param fnFunction The function to be called when the event occurs
		 * @param oListener Context object to call the event handler with. Defaults to this <code>sap.tnt.NavigationListItem</code> itself(optional)
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		attachSelect(oData: any, fnFunction: any, oListener?: any): NavigationListItem;
		/**
		 * Destroys all the items in the aggregation <code>items</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyItems(): NavigationListItem;
		/**
		 * Detaches event handler <code>fnFunction</code> from the <code>select</code> event of this <code>sap.tnt.NavigationListItem</code>.
		 * 
		 * The passed function and listener object must match the ones used for event registration.
		 * @param fnFunction The function to be called, when the event occurs
		 * @param oListener Context object on which the given function had to be called
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		detachSelect(fnFunction: any, oListener: any): NavigationListItem;
		/**
		 * Creates a new subclass of class sap.tnt.NavigationListItem with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Item.extend}.
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|NavigationListItemMetadata, FNMetaImpl?: any): any;
		/**
		 * Creates a subclass of class sap.ui.base.Object with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain three kinds of informations:
		 * <ul>
		 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
		 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
		 * and might contain the following information
		 * <ul>
		 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
		 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
		 * facade of the class</li>
		 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
		 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
		 * </ul>
		 * Subclasses of sap.ui.base.Object can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
		 * </li>
		 * 
		 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
		 * If no constructor function is given, the framework creates a default implementation that delegates all
		 * its arguments to the constructor function of the base class.
		 * </li>
		 * 
		 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
		 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
		 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
		 * make sense to use primitive values here other than to declare public constants.
		 * </li>
		 * 
		 * </ul>
		 * 
		 * The prototype object of the newly created class uses the same prototype as instances of the base class
		 * (prototype chaining).
		 * 
		 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
		 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
		 * itself.
		 * 
		 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
		 * can be specified. Instances of that class will be used to represent metadata for the newly created class
		 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
		 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
		 * @note Overload from base type sap.ui.base.Object
		 * @param sClassName name of the class to be created
		 * @param oClassInfo structured object with informations about the class(optional)
		 * @param FNMetaImpl constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.(optional)
		 * @return the created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.ui.core.Item with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Element.extend}.
		 * @note Overload from base type sap.ui.core.Item
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.ui.core.ItemMetadata, FNMetaImpl?: any): any;
		/**
		 * Fires event <code>select</code> to attached listeners.
		 * 
		 * Expects the following event parameters:
		 * <ul>
		 * <li><code>item</code> of type <code>sap.ui.core.Item</code>The selected item.</li>
		 * </ul>
		 * @param mArguments The arguments to pass along with the event(optional)
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		fireSelect(mArguments?: any): NavigationListItem;
		/**
		 * Gets current value of property <code>expanded</code>.
		 * 
		 * Specifies if the item is expanded.
		 * 
		 * Default value is <code>true</code>.
		 * @return Value of property <code>expanded</code>
		 */
		getExpanded(): boolean;
		/**
		 * Gets current value of property <code>hasExpander</code>.
		 * 
		 * Specifies if the item has an expander.
		 * 
		 * Default value is <code>true</code>.
		 * @return Value of property <code>hasExpander</code>
		 */
		getHasExpander(): boolean;
		/**
		 * Gets current value of property <code>icon</code>.
		 * 
		 * Specifies the icon for the item.
		 * 
		 * Default value is <code></code>.
		 * @return Value of property <code>icon</code>
		 */
		getIcon(): sap.ui.core.URI;
		/**
		 * Gets content of aggregation <code>items</code>.
		 * 
		 * The sub items.
		 * @return 
		 */
		getItems(): NavigationListItem[];
		/**
		 * Checks for the provided <code>sap.tnt.NavigationListItem</code> in the aggregation <code>items</code>.
		 * and returns its index if found or -1 otherwise.
		 * @param oItem The item whose index is looked for
		 * @return The index of the provided control in the aggregation if found, or -1 otherwise
		 */
		indexOfItem(oItem: NavigationListItem): number;
		/**
		 * Inserts a item into the aggregation <code>items</code>.
		 * @param oItem the item to insert; if empty, nothing is inserted
		 * @param iIndex the <code>0</code>-based index the item should be inserted at; for
		 *              a negative value of <code>iIndex</code>, the item is inserted at position 0; for a value
		 *              greater than the current size of the aggregation, the item is inserted at
		 *              the last position
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		insertItem(oItem: NavigationListItem, iIndex: number): NavigationListItem;
		/**
		 * Removes all the controls from the aggregation <code>items</code>.
		 * 
		 * Additionally, it unregisters them from the hosting UIArea.
		 * @return An array of the removed elements (might be empty)
		 */
		removeAllItems(): NavigationListItem[];
		/**
		 * Removes a item from the aggregation <code>items</code>.
		 * @param vItem The item to remove or its index or id
		 * @return The removed item or <code>null</code>
		 */
		removeItem(vItem: number|string|NavigationListItem): NavigationListItem;
		/**
		 * Sets a new value for property <code>expanded</code>.
		 * 
		 * Specifies if the item is expanded.
		 * 
		 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
		 * 
		 * Default value is <code>true</code>.
		 * @param bExpanded New value for property <code>expanded</code>
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setExpanded(bExpanded: boolean): NavigationListItem;
		/**
		 * Sets a new value for property <code>hasExpander</code>.
		 * 
		 * Specifies if the item has an expander.
		 * 
		 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
		 * 
		 * Default value is <code>true</code>.
		 * @param bHasExpander New value for property <code>hasExpander</code>
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setHasExpander(bHasExpander: boolean): NavigationListItem;
		/**
		 * Sets a new value for property <code>icon</code>.
		 * 
		 * Specifies the icon for the item.
		 * 
		 * When called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.
		 * 
		 * Default value is <code></code>.
		 * @param sIcon New value for property <code>icon</code>
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setIcon(sIcon: sap.ui.core.URI): NavigationListItem;
	}

	class SideNavigation extends sap.ui.core.Control {
		/**
		 * Constructor for a new SideNavigation.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: sap.tnt.SideNavigationMetadata);
		/**
		 * Constructor for a new SideNavigation.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @note Any overloads to support not documented metadata
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Attaches event handler <code>fnFunction</code> to the <code>itemSelect</code> event of this <code>sap.tnt.SideNavigation</code>.
		 * 
		 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, 
		 * otherwise it will be bound to this <code>sap.tnt.SideNavigation</code> itself.
		 * 
		 * Fired when an item is selected.
		 * @param oData An application-specific payload object that will be passed to the event handler along with the event object when firing the event
		 * @param fnFunction The function to be called when the event occurs
		 * @param oListener Context object to call the event handler with. Defaults to this <code>sap.tnt.SideNavigation</code> itself(optional)
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		attachItemSelect(oData: any, fnFunction: any, oListener?: any): SideNavigation;
		/**
		 * Binds aggregation <code>item</code> to model data.
		 * 
		 * See {@link sap.ui.base.ManagedObject#bindAggregation ManagedObject.bindAggregation} for a 
		 * detailed description of the possible properties of <code>oBindingInfo</code>.
		 * @param oBindingInfo The binding information
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		bindItem(oBindingInfo: any): SideNavigation;
		/**
		 * Destroys the fixedItem in the aggregation <code>fixedItem</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyFixedItem(): SideNavigation;
		/**
		 * Destroys the footer in the aggregation <code>footer</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyFooter(): SideNavigation;
		/**
		 * Destroys the item in the aggregation <code>item</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyItem(): SideNavigation;
		/**
		 * Detaches event handler <code>fnFunction</code> from the <code>itemSelect</code> event of this <code>sap.tnt.SideNavigation</code>.
		 * 
		 * The passed function and listener object must match the ones used for event registration.
		 * @param fnFunction The function to be called, when the event occurs
		 * @param oListener Context object on which the given function had to be called
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		detachItemSelect(fnFunction: any, oListener: any): SideNavigation;
		/**
		 * Creates a new subclass of class sap.tnt.SideNavigation with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Control.extend}.
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|SideNavigationMetadata, FNMetaImpl?: any): any;
		/**
		 * Creates a subclass of class sap.ui.base.Object with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain three kinds of informations:
		 * <ul>
		 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
		 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
		 * and might contain the following information
		 * <ul>
		 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
		 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
		 * facade of the class</li>
		 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
		 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
		 * </ul>
		 * Subclasses of sap.ui.base.Object can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
		 * </li>
		 * 
		 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
		 * If no constructor function is given, the framework creates a default implementation that delegates all
		 * its arguments to the constructor function of the base class.
		 * </li>
		 * 
		 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
		 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
		 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
		 * make sense to use primitive values here other than to declare public constants.
		 * </li>
		 * 
		 * </ul>
		 * 
		 * The prototype object of the newly created class uses the same prototype as instances of the base class
		 * (prototype chaining).
		 * 
		 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
		 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
		 * itself.
		 * 
		 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
		 * can be specified. Instances of that class will be used to represent metadata for the newly created class
		 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
		 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
		 * @note Overload from base type sap.ui.base.Object
		 * @param sClassName name of the class to be created
		 * @param oClassInfo structured object with informations about the class(optional)
		 * @param FNMetaImpl constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.(optional)
		 * @return the created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.ui.core.Control with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Element.extend}.
		 * @note Overload from base type sap.ui.core.Control
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.ui.core.ControlMetadata, FNMetaImpl?: any): any;
		/**
		 * Fires event <code>itemSelect</code> to attached listeners.
		 * 
		 * Expects the following event parameters:
		 * <ul>
		 * <li><code>item</code> of type <code>sap.ui.core.Item</code>The selected item.</li>
		 * </ul>
		 * @param mArguments The arguments to pass along with the event(optional)
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		fireItemSelect(mArguments?: any): SideNavigation;
		/**
		 * Gets current value of property <code>expanded</code>.
		 * 
		 * Specifies if the control is expanded.
		 * 
		 * Default value is <code>true</code>.
		 * @return Value of property <code>expanded</code>
		 */
		getExpanded(): boolean;
		setExpanded(expanded:boolean): void;
		/**
		 * Gets content of aggregation <code>fixedItem</code>.
		 * 
		 * Defines the content inside the fixed part.
		 * @return 
		 */
		getFixedItem(): NavigationList;
		/**
		 * Gets content of aggregation <code>footer</code>.
		 * 
		 * Defines the content inside the footer.
		 * @return 
		 */
		getFooter(): NavigationList;
		/**
		 * Gets content of aggregation <code>item</code>.
		 * 
		 * Defines the content inside the flexible part.
		 * @return 
		 */
		getItem(): NavigationList;
		/**
		 * Sets the aggregated <code>fixedItem</code>.
		 * @param oFixedItem The fixedItem to set
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setFixedItem(oFixedItem: NavigationList): SideNavigation;
		/**
		 * Sets the aggregated <code>footer</code>.
		 * @param oFooter The footer to set
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setFooter(oFooter: NavigationList): SideNavigation;
		/**
		 * Sets the aggregated <code>item</code>.
		 * @param oItem The item to set
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setItem(oItem: NavigationList): SideNavigation;
		/**
		 * Unbinds aggregation <code>item</code> from model data.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		unbindItem(): SideNavigation;
	}

	class ToolHeader extends sap.m.OverflowToolbar {
		/**
		 * Constructor for a new ToolHeader.
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Creates a new subclass of class sap.tnt.ToolHeader with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.m.OverflowToolbar.extend}.
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.ui.core.Control with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Element.extend}.
		 * @note Overload from base type sap.ui.core.Control
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.ui.core.ControlMetadata, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.m.Toolbar with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Control.extend}.
		 * @note Overload from base type sap.m.Toolbar
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.m.ToolbarMetadata, FNMetaImpl?: any): any;
	}

	class ToolHeaderUtilitySeparator extends sap.ui.core.Control {
		/**
		 * Constructor for a new ToolHeaderUtilitySeparator.
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Constructor for a new ToolHeaderUtilitySeparator.
		 * @note Any overloads to support not documented metadata
		 * @param sId ID for the new control, generated automatically if no ID is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Creates a new subclass of class sap.tnt.ToolHeaderUtilitySeparator with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Control.extend}.
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.ui.core.Control with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Element.extend}.
		 * @note Overload from base type sap.ui.core.Control
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.ui.core.ControlMetadata, FNMetaImpl?: any): any;
	}

	class ToolPage extends sap.ui.core.Control {
		/**
		 * Constructor for a new ToolPage.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @param sId ID for the new control, generated automatically if no id is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: sap.tnt.ToolPageMetadata);
		/**
		 * Constructor for a new ToolPage.
		 * 
		 * 
		 * Accepts an object literal <code>mSettings</code> that defines initial
		 * property values, aggregated and associated objects as well as event handlers.
		 * See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.
		 * @note Any overloads to support not documented metadata
		 * @param sId ID for the new control, generated automatically if no id is given(optional)
		 * @param mSettings Initial settings for the new control(optional)
		 */
		constructor(sId?: string, mSettings?: any);
		/**
		 * Adds some mainContent to the aggregation <code>mainContents</code>.
		 * @param oMainContent the mainContent to add; if empty, nothing is inserted
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		addMainContent(oMainContent: sap.ui.core.Control): ToolPage;
		/**
		 * Destroys the header in the aggregation <code>header</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyHeader(): ToolPage;
		/**
		 * Destroys all the mainContents in the aggregation <code>mainContents</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroyMainContents(): ToolPage;
		/**
		 * Destroys the sideContent in the aggregation <code>sideContent</code>.
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		destroySideContent(): ToolPage;
		/**
		 * Creates a new subclass of class sap.tnt.ToolPage with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Control.extend}.
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|ToolPageMetadata, FNMetaImpl?: any): any;
		/**
		 * Creates a subclass of class sap.ui.base.Object with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain three kinds of informations:
		 * <ul>
		 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
		 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
		 * and might contain the following information
		 * <ul>
		 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
		 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
		 * facade of the class</li>
		 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
		 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
		 * </ul>
		 * Subclasses of sap.ui.base.Object can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
		 * </li>
		 * 
		 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
		 * If no constructor function is given, the framework creates a default implementation that delegates all
		 * its arguments to the constructor function of the base class.
		 * </li>
		 * 
		 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
		 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
		 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
		 * make sense to use primitive values here other than to declare public constants.
		 * </li>
		 * 
		 * </ul>
		 * 
		 * The prototype object of the newly created class uses the same prototype as instances of the base class
		 * (prototype chaining).
		 * 
		 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
		 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
		 * itself.
		 * 
		 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
		 * can be specified. Instances of that class will be used to represent metadata for the newly created class
		 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
		 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
		 * @note Overload from base type sap.ui.base.Object
		 * @param sClassName name of the class to be created
		 * @param oClassInfo structured object with informations about the class(optional)
		 * @param FNMetaImpl constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.(optional)
		 * @return the created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any, FNMetaImpl?: any): any;
		/**
		 * Creates a new subclass of class sap.ui.core.Control with name <code>sClassName</code>
		 * and enriches it with the information contained in <code>oClassInfo</code>.
		 * 
		 * <code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Element.extend}.
		 * @note Overload from base type sap.ui.core.Control
		 * @param sClassName Name of the class being created
		 * @param oClassInfo Object literal with information about the class(optional)
		 * @param FNMetaImpl Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>(optional)
		 * @return Created class / constructor function
		 */
		extend(sClassName: string, oClassInfo?: any|sap.ui.core.ControlMetadata, FNMetaImpl?: any): any;
		/**
		 * Gets content of aggregation <code>header</code>.
		 * 
		 * The control to appear in the header area.
		 * @return 
		 */
		getHeader(): ToolHeader;
		/**
		 * Gets content of aggregation <code>mainContents</code>.
		 * 
		 * The content section.
		 * @return 
		 */
		getMainContents(): sap.ui.core.Control[];
		/**
		 * Gets content of aggregation <code>sideContent</code>.
		 * 
		 * The side menu of the layout.
		 * @return 
		 */
		getSideContent(): SideNavigation;
		/**
		 * Gets current value of property <code>sideExpanded</code>.
		 * 
		 * Indicates if the side area is expanded. Overrides the expanded property of the sideContent aggregation.
		 * 
		 * Default value is <code>true</code>.
		 * @return Value of property <code>sideExpanded</code>
		 */
		getSideExpanded(): boolean;
		/**
		 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation <code>mainContents</code>.
		 * and returns its index if found or -1 otherwise.
		 * @param oMainContent The mainContent whose index is looked for
		 * @return The index of the provided control in the aggregation if found, or -1 otherwise
		 */
		indexOfMainContent(oMainContent: sap.ui.core.Control): number;
		/**
		 * Inserts a mainContent into the aggregation <code>mainContents</code>.
		 * @param oMainContent the mainContent to insert; if empty, nothing is inserted
		 * @param iIndex the <code>0</code>-based index the mainContent should be inserted at; for
		 *              a negative value of <code>iIndex</code>, the mainContent is inserted at position 0; for a value
		 *              greater than the current size of the aggregation, the mainContent is inserted at
		 *              the last position
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		insertMainContent(oMainContent: sap.ui.core.Control, iIndex: number): ToolPage;
		/**
		 * Removes all the controls from the aggregation <code>mainContents</code>.
		 * 
		 * Additionally, it unregisters them from the hosting UIArea.
		 * @return An array of the removed elements (might be empty)
		 */
		removeAllMainContents(): sap.ui.core.Control[];
		/**
		 * Removes a mainContent from the aggregation <code>mainContents</code>.
		 * @param vMainContent The mainContent to remove or its index or id
		 * @return The removed mainContent or <code>null</code>
		 */
		removeMainContent(vMainContent: number|string|sap.ui.core.Control): sap.ui.core.Control;
		/**
		 * Sets the aggregated <code>header</code>.
		 * @param oHeader The header to set
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setHeader(oHeader: ToolHeader): ToolPage;
		/**
		 * Sets the aggregated <code>sideContent</code>.
		 * @param oSideContent The sideContent to set
		 * @return Reference to <code>this</code> in order to allow method chaining
		 */
		setSideContent(oSideContent: SideNavigation): ToolPage;
		/**
		 * Sets the expand/collapse state of the SideContent.
		 * @param isSideExpanded defines whether the SideNavigation is expanded.
		 * @return Pointer to the control instance for chaining
		 */
		setSideExpanded(isSideExpanded: boolean): ToolPage;
		/**
		 * Toggles the expand/collapse state of the SideContent.
		 * @return Pointer to the control instance for chaining.
		 */
		toggleSideContentMode(): ToolPage;
	}

	interface NavigationListMetadata extends sap.ui.core.ControlMetadata {
		/**
		 * Specifies the width of the control.
		 */
		width?: sap.ui.core.CSSSize;
		/**
		 * Specifies if the control is in expanded or collapsed mode.
		 * @default true
		 */
		expanded?: boolean;
		/**
		 * Fired when an item is selected.
		 * @param item The selected item.
		 */
		itemSelect?: (item: sap.ui.core.Item) => void;
	}

	interface NavigationListItemMetadata extends sap.ui.core.ItemMetadata {
		/**
		 * Specifies the icon for the item.
		 * @default 
		 */
		icon?: sap.ui.core.URI;
		/**
		 * Specifies if the item is expanded.
		 * @default true
		 */
		expanded?: boolean;
		/**
		 * Specifies if the item has an expander.
		 * @default true
		 */
		hasExpander?: boolean;
		/**
		 * Fired when this item is selected.
		 * @param item The selected item.
		 */
		select?: (item: sap.ui.core.Item) => void;
	}

	interface SideNavigationMetadata extends sap.ui.core.ControlMetadata {
		/**
		 * Specifies if the control is expanded.
		 * @default true
		 */
		expanded?: boolean;
		/**
		 * Fired when an item is selected.
		 * @param item The selected item.
		 */
		itemSelect?: (item: sap.ui.core.Item) => void;
	}

	interface ToolPageMetadata extends sap.ui.core.ControlMetadata {
		/**
		 * Indicates if the side area is expanded. Overrides the expanded property of the sideContent aggregation.
		 * @default true
		 */
		sideExpanded?: boolean;
	}


	/* urooj added InfoLabels from `C:\java\openui5-types` */
    interface $InfoLabelSettings extends sap.ui.core.ControlMetadata {
		/**
		 * Specifies the text inside the `InfoLabel` control.
		 */
		text?: string;
  
		/**
		 * Specifies the type of the `InfoLabel` paddings - loose or narrow. **Note:** By default the padding is
		 * loose. It is recommended to use narrow (smaller) paddings for numeric texts.
		 */
		renderMode?: sap.tnt.RenderMode;
  
		/**
		 * Specifies the fill and text color of the control. Accepts a number between 1 and 10 as a value. You can
		 * choose from 10 predefined background and text color combinations. The color schemes are non-semantic,
		 * you can select them according to your own preferences. **Note:** ColorScheme 10 is available only in
		 * Fiori 3 theme. The default `colorScheme` is 7.
		 */
		colorScheme?: number;
  
		/**
		 * Specifies the width of the `InfoLabel` control. By default, the `InfoLabel` control has the width of
		 * the content. Set this property to restrict the width to a custom value.
		 */
		width?: sap.ui.core.CSSSize;
  
		/**
		 * Determines if the `InfoLabel` is in `displayOnly` mode. When set to `true` the control size adjusts to
		 * fit other controls, for example non-editable `Forms`.
		 */
		displayOnly?: boolean;
  
		/**
		 * Available options for the text direction are LTR and RTL. By default the control inherits the text direction
		 * from its parent control.
		 */
		textDirection?: sap.ui.core.TextDirection;
  
		/**
		 * @SINCE 1.74
		 *
		 * Defines the icon to be displayed as graphical element within the `InfoLabel`. It can be an icon from
		 * the icon font.
		 */
		icon?: sap.ui.core.URI;
	  }

/**
     * @SINCE 1.54
     *
     * The `InfoLabel` is a small non-interactive control which contains text information and non-semantic color
     * chosen from a list of predefined color schemes. It serves the purpose to attract the user attention to
     * some piece of information (state, quantity, condition, etc.).
     *
     * Overview:
     *
     * The control visualizes text information without user interaction. The text inside the control is always
     * in upper case. It can have smaller or larger side paddings which can be specified by the `renderMode`
     * property. The text-background color pair can be changed by setting a number between 1 and 10 that corresponds
     * to the 10 predefined color combinations of the `colorScheme` property. The control is designed to be
     * vertically aligned with UI5 Input and Button control families. When using `InfoLabel` in non-editable
     * `Forms`, `Tables`, etc., set `displayOnly=true` for best visual results.
     *
     * Usage Guidelines:
     * 	 - If the text is longer than the width of the control, it doesn’t wrap. Instead, it’s represented as
     * 			ellipsis.
     * 	 - When truncated, the full text in the control is not visible. Therefore, it’s recommended to make
     * 			more space for longer items to be fully displayed.
     * 	 - Colors are not semantic and have no visual representation in sap_belize_hcb and sap_belize_hcw themes.
     *
     * 	 - The control shows plain text only, formatting is not visualized.
     */
	class InfoLabel
		extends sap.ui.core.Control
		implements sap.ui.core.IFormContent {
		/**
		 * Constructor for a new `InfoLabel`.
		 *
		 * Accepts an object literal `mSettings` that defines initial property values, aggregated and associated
		 * objects as well as event handlers. See {@link sap.ui.base.ManagedObject#constructor} for a general description
		 * of the syntax of the settings object.
		 */
		constructor(
			/**
				* ID for the new control, generated automatically if no ID is given
				*/
			sId?: string,
			/**
				* Initial settings for the new control
				*/
			mSettings?: $InfoLabelSettings
		);

		/**
		 * Binds property {@link #getText text} to model data.
		 *
		 * See {@link sap.ui.base.ManagedObject#bindProperty ManagedObject.bindProperty} for a detailed description
		 * of the possible properties of `oBindingInfo`
		 */
		bindText(
			/**
				* The binding information
				*/
			oBindingInfo: object
		): this;
		/**
		 * Creates a new subclass of class sap.tnt.InfoLabel with name `sClassName` and enriches it with the information
		 * contained in `oClassInfo`.
		 *
		 * `oClassInfo` might contain the same kind of information as described in {@link sap.ui.core.Control.extend}.
		 */
		// @ts-ignore
		static extend<T extends Record<string, unknown>>(
			/**
				* Name of the class being created
				*/
			sClassName: string,
			/**
				* Object literal with information about the class
				*/
			oClassInfo?: T & ThisType<T & sap.tnt.InfoLabel>,
			/**
				* Constructor function for the metadata object; if not given, it defaults to the metadata implementation
				* used by this class
				*/
			FNMetaImpl?: Function
		): Function;
		/**
		 * Gets current value of property {@link #getColorScheme colorScheme}.
		 *
		 * Specifies the fill and text color of the control. Accepts a number between 1 and 10 as a value. You can
		 * choose from 10 predefined background and text color combinations. The color schemes are non-semantic,
		 * you can select them according to your own preferences. **Note:** ColorScheme 10 is available only in
		 * Fiori 3 theme. The default `colorScheme` is 7.
		 *
		 * Default value is `7`.
		 */
		getColorScheme(): number;
		/**
		 * Gets current value of property {@link #getDisplayOnly displayOnly}.
		 *
		 * Determines if the `InfoLabel` is in `displayOnly` mode. When set to `true` the control size adjusts to
		 * fit other controls, for example non-editable `Forms`.
		 *
		 * Default value is `false`.
		 */
		getDisplayOnly(): boolean;
		/**
		 * @SINCE 1.74
		 *
		 * Gets current value of property {@link #getIcon icon}.
		 *
		 * Defines the icon to be displayed as graphical element within the `InfoLabel`. It can be an icon from
		 * the icon font.
		 *
		 * Default value is `empty string`.
		 */
		getIcon(): sap.ui.core.URI;
		/**
		 * Returns a metadata object for class sap.tnt.InfoLabel.
		 */
		// @ts-ignore
		static getMetadata(): sap.ui.core.ElementMetadata;
		/**
		 * Gets current value of property {@link #getRenderMode renderMode}.
		 *
		 * Specifies the type of the `InfoLabel` paddings - loose or narrow. **Note:** By default the padding is
		 * loose. It is recommended to use narrow (smaller) paddings for numeric texts.
		 *
		 * Default value is `Loose`.
		 */
		getRenderMode(): sap.tnt.RenderMode;
		/**
		 * Gets current value of property {@link #getText text}.
		 *
		 * Specifies the text inside the `InfoLabel` control.
		 *
		 * Default value is `empty string`.
		 */
		getText(): string;
		/**
		 * Gets current value of property {@link #getTextDirection textDirection}.
		 *
		 * Available options for the text direction are LTR and RTL. By default the control inherits the text direction
		 * from its parent control.
		 *
		 * Default value is `Inherit`.
		 */
		getTextDirection(): sap.ui.core.TextDirection;
		/**
		 * Gets current value of property {@link #getWidth width}.
		 *
		 * Specifies the width of the `InfoLabel` control. By default, the `InfoLabel` control has the width of
		 * the content. Set this property to restrict the width to a custom value.
		 */
		getWidth(): sap.ui.core.CSSSize;
		/**
		 * Sets a new value for property {@link #getColorScheme colorScheme}.
		 *
		 * Specifies the fill and text color of the control. Accepts a number between 1 and 10 as a value. You can
		 * choose from 10 predefined background and text color combinations. The color schemes are non-semantic,
		 * you can select them according to your own preferences. **Note:** ColorScheme 10 is available only in
		 * Fiori 3 theme. The default `colorScheme` is 7.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 *
		 * Default value is `7`.
		 */
		setColorScheme(
			/**
				* New value for property `colorScheme`
				*/
			iColorScheme?: number
		): this;
		/**
		 * Sets a new value for property {@link #getDisplayOnly displayOnly}.
		 *
		 * Determines if the `InfoLabel` is in `displayOnly` mode. When set to `true` the control size adjusts to
		 * fit other controls, for example non-editable `Forms`.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 *
		 * Default value is `false`.
		 */
		setDisplayOnly(
			/**
				* New value for property `displayOnly`
				*/
			bDisplayOnly?: boolean
		): this;
		/**
		 * @SINCE 1.74
		 *
		 * Sets a new value for property {@link #getIcon icon}.
		 *
		 * Defines the icon to be displayed as graphical element within the `InfoLabel`. It can be an icon from
		 * the icon font.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 *
		 * Default value is `empty string`.
		 */
		setIcon(
			/**
				* New value for property `icon`
				*/
			sIcon?: sap.ui.core.URI
		): this;
		/**
		 * Sets a new value for property {@link #getRenderMode renderMode}.
		 *
		 * Specifies the type of the `InfoLabel` paddings - loose or narrow. **Note:** By default the padding is
		 * loose. It is recommended to use narrow (smaller) paddings for numeric texts.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 *
		 * Default value is `Loose`.
		 */
		setRenderMode(
			/**
				* New value for property `renderMode`
				*/
			sRenderMode?: sap.tnt.RenderMode
		): this;
		/**
		 * Sets a new value for property {@link #getText text}.
		 *
		 * Specifies the text inside the `InfoLabel` control.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 *
		 * Default value is `empty string`.
		 */
		setText(
			/**
				* New value for property `text`
				*/
			sText?: string
		): this;
		/**
		 * Sets a new value for property {@link #getTextDirection textDirection}.
		 *
		 * Available options for the text direction are LTR and RTL. By default the control inherits the text direction
		 * from its parent control.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 *
		 * Default value is `Inherit`.
		 */
		setTextDirection(
			/**
				* New value for property `textDirection`
				*/
			sTextDirection?: sap.ui.core.TextDirection
		): this;
		/**
		 * Sets a new value for property {@link #getWidth width}.
		 *
		 * Specifies the width of the `InfoLabel` control. By default, the `InfoLabel` control has the width of
		 * the content. Set this property to restrict the width to a custom value.
		 *
		 * When called with a value of `null` or `undefined`, the default value of the property will be restored.
		 */
		setWidth(
			/**
				* New value for property `width`
				*/
			sWidth?: sap.ui.core.CSSSize
		): this;
		/**
		 * Unbinds property {@link #getText text} from model data.
		 */
		unbindText(): this;
	}
	
	/* urooj end */
}
