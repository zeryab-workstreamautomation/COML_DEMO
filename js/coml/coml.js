var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
define("coml/This", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/CoElementFactory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/Get", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/Render", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/StateChanger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/Converter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/Patch", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/Repaint", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Repaint = void 0;
    /**
     * The default Patch.
     *
     * A Repaint patch is an operation that remembers the position of a document node in its original parent
     * and reattaches it after the node is regenerated.
     *
     * If the node does not currently have a parent (for example on first generation), then the supplied
     * parent in the constructor is used.
     */
    var Repaint = /** @class */ (function () {
        function Repaint(potentialParent, tnode) {
            this.potentialParent = potentialParent;
            this.tnode = tnode;
            this.savePosition();
        }
        Repaint.prototype.removeChild = function () {
            // detach tnode from parent.
            if (this.index >= 0 && this.tnode && this.potentialParent && this.potentialParent.contains(this.tnode))
                this.potentialParent.removeChild(this.tnode);
        };
        Repaint.prototype.restorePosition = function (elem) {
            this.removeChild();
            this.reattachTNodeFromPosition(elem);
        };
        Repaint.prototype.savePosition = function () {
            if (this.tnode && this.tnode.parentNode) {
                this.potentialParent = this.tnode.parentNode; // note: overwrites the original potential parent
                this.index = Array.prototype.indexOf.call(this.potentialParent.childNodes, this.tnode);
            }
        };
        Repaint.prototype.reattachTNodeFromPosition = function (tnode) {
            // attach tnode
            var e = tnode;
            //if (e.tagName.toLowerCase()!='div')
            //    console.log('Here');
            if (tnode && this.potentialParent) {
                if (this.index < 0 || this.index >= this.potentialParent.childNodes.length) {
                    this.potentialParent.appendChild(tnode);
                }
                else {
                    this.potentialParent.insertBefore(tnode, this.potentialParent.childNodes[this.index]);
                }
            }
        };
        return Repaint;
    }());
    exports.Repaint = Repaint;
});
define("coml/TargetNode", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isTargetNode = exports.ctn = exports.getObjectAttr = exports.getAttr = exports.TNS = void 0;
    var TNS;
    (function (TNS) {
        TNS[TNS["MARKED"] = 0] = "MARKED";
        TNS[TNS["REUSED"] = 1] = "REUSED";
        TNS[TNS["ADDED"] = 2] = "ADDED";
    })(TNS = exports.TNS || (exports.TNS = {}));
    /**
     * A convenience method for fetching an attribute from a node. if not found the default value in `defval` is returned.
     *
     * @param node
     * @param attr
     * @param defvalue
     */
    function getAttr(cvt, node, attr, defvalue, currtn) {
        var elem = node;
        var value = elem.getAttribute(attr);
        if (!value)
            return defvalue;
        if (cvt)
            value = cvt.expandString(value, currtn);
        // convert
        if (typeof defvalue == 'string')
            return value;
        if (typeof defvalue == 'number')
            return Number.parseFloat(value);
        if (typeof defvalue == 'boolean')
            return (value.trim().toLowerCase() == 'true');
        return value;
    }
    exports.getAttr = getAttr;
    /**
     * Reads an attribute and returns an object encoded as a string with keys and value encoded as ' delimited strings.
     *
     * E.g:
     * ```html
     *     <ws-asset-thumbnail asset-id="{'type':'image','file':'code.PNG'}"><ws-asset-thumbnail>
     * ```
     * will return {type:"image",file:"code.PNG"}
     *
     * @param cvt
     * @param node
     * @param attr
     * @param defvalue
     * @returns
     */
    function getObjectAttr(cvt, node, attr, defvalue) {
        var str = getAttr(cvt, node, attr);
        if (!str || str.trim().length == 0)
            return defvalue;
        var obj = JSON.parse(str.replace(/'/g, '"'));
        return obj;
    }
    exports.getObjectAttr = getObjectAttr;
    /**
     * A utility fnction that can be use dto fetch both the Converter and the TargetNode of a CoElement into local constants.
     *
     * Usage:
     * ```typescript
     * const {cvt,tn} = ctn(this);
     * ```
     * @param component
     * @returns
     */
    function ctn(component) {
        return { cvt: component.getCvt(), tn: component.getTN() };
    }
    exports.ctn = ctn;
    function isTargetNode(pot) {
        return pot && typeof pot == 'object' && 'sourceChildNodes' in pot;
    }
    exports.isTargetNode = isTargetNode;
});
define("coml/Coml", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/CoElement", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCoElement = void 0;
    function isCoElement(pot) {
        return pot && typeof pot == 'object' && 'onRender' in pot;
    }
    exports.isCoElement = isCoElement;
});
define("coml/Dependency", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/Attachment", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/impl/AttachmentImpl", ["require", "exports", "coml/Implementations", "coml/Asset", "coml/Attachable", "coml/impl/TargetNodeImpl"], function (require, exports, Implementations_1, Asset_1, Attachable_1, TargetNodeImpl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttachmentImpl = void 0;
    /**
     * Attaches a CoElement as a child of the window.document - i.e. the browser-visible document.
     * The default implementation
     *
     * Manages the dependencies such as styles of Coml documents as they attach/detach to the main window.
     */
    var AttachmentImpl = /** @class */ (function () {
        function AttachmentImpl() {
        }
        /**
         * Returns the Patch implementation that will attach the top component to the outside html.
         *
         * @param tnode
         * @param element
         * @returns
         */
        AttachmentImpl.prototype.createPatch = function (tnode, element) {
            return new PatchExternalElement(tnode, element);
        };
        AttachmentImpl.prototype.makeCoElement = function (element, toInsert) {
            var asset = Implementations_1.Implementations.getAssetFactory()
                .get(toInsert);
            if (!asset)
                throw new Error("Can't find an asset for ".concat((0, Asset_1.stringifyAssetID)(toInsert)));
            if ((0, Asset_1.isCoElementAsset)(asset)) {
                // create a ChildNode that will reattach at the sole position in the attachment element:
                var that_1 = this;
                var tn = new (/** @class */ (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_1.prototype.getPatch = function () {
                        return that_1.createPatch(this.tnode, element);
                    };
                    return class_1;
                }(TargetNodeImpl_1.TargetNodeImpl)))(null);
                return (asset
                    .asCoElement(tn));
            }
            else {
                throw new Error("Asset ".concat((0, Asset_1.stringifyAssetID)(toInsert), " is not a CoElementAsset"));
            }
        };
        AttachmentImpl.prototype.attach = function (element, toInsert) {
            var _this = this;
            this.makeCoElement(element, toInsert)
                .then(function (coElement) {
                _this.handleAttach(coElement);
                //this.renderFromTop(cvt, element);
                coElement.getCvt().invalidate(coElement.getTN());
            });
        };
        AttachmentImpl.prototype.handleAttach = function (coElement) {
            this.coElement = coElement;
            var cvt = coElement.getCvt();
            if ((0, Attachable_1.isAttachable)(cvt)) {
                cvt.setAttachment(this);
            }
        };
        AttachmentImpl.prototype.detach = function () {
            if (this.coElement) {
                var cvt = this.coElement.getCvt();
                if ((0, Attachable_1.isAttachable)(cvt)) {
                    cvt.setAttachment(null);
                }
            }
        };
        /**
         * Add a new dependency
         *
         * @param dep
         * @returns
         */
        AttachmentImpl.prototype.addDependency = function (dep) {
            if (!this.dependencies)
                this.dependencies = new Map();
            var already = this.dependencies.get(dep.getId());
            if (already) {
                already.updateRefCount(1);
                return Promise.resolve();
            }
            else {
                this.dependencies.set(dep.getId(), dep);
                return dep.attach();
            }
        };
        AttachmentImpl.prototype.removeDependency = function (dep) {
            var already = this.dependencies.get(dep.getId());
            if (already) {
                if (already.getRefCount() > 1) {
                    already.updateRefCount(-1);
                }
                else {
                    this.dependencies.delete(dep.getId());
                    return dep.detach();
                }
            }
        };
        return AttachmentImpl;
    }());
    exports.AttachmentImpl = AttachmentImpl;
    /**
     * Remembers and restores the Attachment of the COML document in the external element
     */
    var PatchExternalElement = /** @class */ (function () {
        function PatchExternalElement(tnode, attachedToElement) {
            this.index = -1;
            this.tnode = tnode;
            this.attachedToElement = attachedToElement;
            if (this.tnode) {
                this.index = Array.prototype.indexOf.call(attachedToElement.childNodes, this.tnode);
            }
        }
        PatchExternalElement.prototype.restorePosition = function (elem) {
            if (this.tnode && this.index >= 0)
                this.attachedToElement.removeChild(this.tnode);
            else {
                this.attachedToElement.innerHTML = '';
            }
            this.attachedToElement.appendChild(elem);
        };
        return PatchExternalElement;
    }());
});
define("coml/Attachable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAttachable = void 0;
    function isAttachable(obj) {
        return typeof obj == 'object' && 'setAttachment' in obj;
    }
    exports.isAttachable = isAttachable;
});
define("coml/impl/Style", ["require", "exports", "coml/Asset", "coml/Implementations"], function (require, exports, Asset_2, Implementations_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Style = void 0;
    /**
     * A Style is a Dependency that handles <style> and <link rel="stylesheet"> elements
     * in a document.
     *
     * When any COML document attahes / detaches to the main SPA pages, its Style objects
     * manage the reference counted style addition and removal
     */
    var Style = /** @class */ (function () {
        /**
         * Create a Style object.
         *
         * @param srcDoc : The document from whose <head> the styles are loaded.
         * @param ownerID : A id of the owner (the asset that contains this style)
         */
        function Style(srcDoc, ownerID) {
            this.cssids = [];
            this.idsBuilt = false;
            this.srcDoc = srcDoc;
            this.ownerID = ownerID;
            this.targetElement = document.querySelector('head');
        }
        Style.prototype.generateId = function (index) {
            var name = this.ownerID.name.toLowerCase().trim();
            if (this.ownerID.type) {
                name += 'T';
                name += this.ownerID.type.toLowerCase().trim();
            }
            return "".concat(name.replace(/[^a-zA-Z0-9]/g, "_"), "-").concat(index);
        };
        Style.prototype.getStyles = function () {
            var all = [];
            var found = this.srcDoc.head.children;
            for (var i = 0; i < found.length; i++) {
                var e = found[i];
                var tag = e.tagName.toLowerCase();
                if (tag == 'style' || (tag == 'link' && (!e.getAttribute('rel') || e.getAttribute('rel') == 'stylesheet')))
                    all.push(e);
            }
            return all;
        };
        Style.prototype.buildIDs = function (forId) {
            this.idsBuilt = true;
            var styles = this.getStyles();
            for (var i = 0; i < styles.length; i++) {
                var style = styles[i];
                var id = style.getAttribute('id');
                if (!id) {
                    id = this.generateId(i);
                }
                this.cssids.push(id);
                if (forId)
                    forId(style, id);
            }
        };
        /**
         * Inserts the <style> element in `instyle` into the targetElement
         *
         * @param instyle
         * @param dontWaitForLinkLoad
         * @returns
         */
        Style.prototype.loadInlineStyle = function (instyle, id, clone, dontWaitForLinkLoad) {
            var _this = this;
            if (clone === void 0) { clone = true; }
            if (dontWaitForLinkLoad === void 0) { dontWaitForLinkLoad = false; }
            return new Promise(function (resolve, reject) {
                var style = (clone) ? instyle.cloneNode(true) : instyle;
                style.setAttribute('id', id);
                style.setAttribute('data-refcount', '1');
                if (!dontWaitForLinkLoad) {
                    style.onload = function () {
                        resolve();
                        //console.log('style has loaded - id='+id); 
                    };
                }
                _this.targetElement.appendChild(style);
                if (dontWaitForLinkLoad)
                    resolve();
            });
        };
        /**
         * Loads a css link by using GetPublicFile to load  the link, attached it to the <styles> elements of the SPA
         * and returns the promise that on reolution will indicate that the css has loaded.
         *
         * @param link
         * @param id
         * @returns
         */
        Style.prototype.loadCSSLink = function (elem, id) {
            var _this = this;
            var href = elem.getAttribute('href');
            if (!href) {
                console.warn("Style - no 'href' in <link> element");
                return;
            }
            var asset = Implementations_2.Implementations
                .getAssetFactory()
                .get(href);
            if (!(0, Asset_2.isTextAsset)(asset)) {
                console.warn("Style - 'href' ".concat(href, " is not a text asset"));
                return;
            }
            return (asset.getText()
                .then(function (csstext) {
                var css = document.createElement('style');
                css.setAttribute('type', 'text/css');
                css.appendChild(document.createTextNode(csstext));
                return _this.loadInlineStyle(css, id, false);
            }));
        };
        Style.prototype.loadStyle = function (elem, id) {
            if (elem.tagName.toLowerCase() == 'style')
                return this.loadInlineStyle(elem, id);
            else
                return this.loadCSSLink(elem, id);
        };
        /**
         * Copies all <style> and <link type="stylesheet"> elements from the src DOM to the target element.
         * Returns a promise that resolves when all styles are loaded.
         */
        Style.prototype.copyStylesToTarget = function () {
            var _this = this;
            var all = [];
            this.buildIDs(function (style, id) {
                var prom = _this.loadStyle(style, id);
                if (prom)
                    all.push(prom);
            });
            return Promise.all(all);
        };
        Style.prototype.checkIds = function () {
            if (!this.idsBuilt)
                this.buildIDs();
        };
        /////////////////////////////////////////////////////////////////////////
        // Dependency
        /////////////////////////////////////////////////////////////////////////
        Style.prototype.getId = function () {
            this.checkIds();
            if (this.cssids.length > 0)
                return this.cssids[0];
            return this.generateId(0);
        };
        Style.prototype.getRefCount = function () {
            this.checkIds();
            if (this.cssids.length > 0) {
                var st = document.querySelector("style#".concat(this.cssids[0]));
                if (st)
                    return Number.parseInt(st.getAttribute('data-refcount'));
            }
        };
        Style.prototype.updateRefCount = function (increment) {
            this.checkIds();
            this.cssids.forEach(function (id) {
                var st = document.querySelector("style#".concat(id));
                if (st) {
                    var cnt = Number.parseInt(st.getAttribute('data-refcount'));
                    st.setAttribute('data-refcount', (cnt + increment).toFixed(0));
                }
            });
        };
        Style.prototype.attach = function () {
            return this.copyStylesToTarget();
        };
        Style.prototype.detach = function () {
            this.checkIds();
            this.cssids.forEach(function (id) {
                var st = document.querySelector("style#".concat(id));
                if (st) {
                    st.remove();
                }
            });
        };
        return Style;
    }());
    exports.Style = Style;
});
define("coml/Templatizable", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isTemplatizable = void 0;
    function isTemplatizable(obj) {
        return typeof obj == 'object' && 'templatize' in obj;
    }
    exports.isTemplatizable = isTemplatizable;
});
define("coml/impl/AssetCoElementFactory", ["require", "exports", "coml/Asset", "coml/Attachable", "coml/Implementations", "coml/Templatizable", "coml/TargetNode"], function (require, exports, Asset_3, Attachable_2, Implementations_3, Templatizable_1, TargetNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AssetCoElementFactory = void 0;
    /**
     * A CoElementFactory that uses a COML page to build a CoElement
     */
    var AssetCoElementFactory = /** @class */ (function () {
        function AssetCoElementFactory(assetId, tag) {
            this.assetId = assetId;
            this.tag = tag;
        }
        AssetCoElementFactory.prototype.makeComponent = function (tn, cvt) {
            var asset = Implementations_3.Implementations.getAssetFactory().get(this.assetId);
            if (!(0, Asset_3.isCoElementAsset)(asset))
                throw new Error("import ".concat(this.assetId, " is not a CoElementAsset"));
            return (asset.asCoElement(undefined, undefined, function (attrib) {
                return (0, TargetNode_1.getAttr)(cvt, tn.snode, attrib);
            })
                .then(function (co) {
                var cvtChild = co.getCvt();
                if ((0, Attachable_2.isAttachable)(cvt) && (0, Attachable_2.isAttachable)(cvtChild)) {
                    cvt.addChild(cvtChild);
                }
                if ((0, Templatizable_1.isTemplatizable)(co))
                    co.templatize(cvt, tn.snode);
                return co;
            }));
        };
        AssetCoElementFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory(this.tag, this);
        };
        return AssetCoElementFactory;
    }());
    exports.AssetCoElementFactory = AssetCoElementFactory;
});
define("coml/html/EventHandlers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventHandlers = void 0;
    /**
     * Installs DOM event handlers on a target node from the attributes of a source node.
     */
    var EventHandlers = /** @class */ (function () {
        function EventHandlers(tnode, tn) {
            this.tnode = tnode;
            this.tn = tn;
        }
        /**
         * if 'attr' is an attribute name that follows the naming convention of an event handler, returns the event name, else nothing
         *
         * @param attr
         *
        */
        EventHandlers.isEventAttr = function (attr) {
            if (attr.startsWith('on'))
                return attr.substring(2);
            if (attr.startsWith('co-on'))
                return attr.substring(5);
        };
        /**
         * Returns an event handler as installed on an elements 'on<event>' attribute.
         *
         * @param script The value of the attribute (script text, e.g. 'this.onclick(event)')
         * @param cvt The converter to use for string expansion, and whose This will be bound to the handler.
         * @returns A functaion
         */
        EventHandlers.prototype.makeEventHandler = function (script, cvt) {
            var scriptbody = cvt.expandString(script, this.tn);
            if (scriptbody)
                return (new Function('event', scriptbody)).bind(cvt.getThis());
        };
        /**
         * Installs all event handlers declared on snode onto tnode
         *
         * @param snode
         * @param cvt
         */
        EventHandlers.prototype.addEventHandlersFromAttrsOf = function (snode, cvt) {
            /* if (snode.tagName.toLowerCase()=='ws-palette-color')
                 console.log(`FOUND 1`);
     
             if (snode.getAttribute('id')=='xyz')
                 console.log("FOUND"); */
            var attrs = snode.attributes;
            for (var i = 0; i < attrs.length; i++) {
                var evname = void 0;
                if (attrs[i].name != 'class' && attrs[i].name != 'style' && (evname = EventHandlers.isEventAttr(attrs[i].name))) {
                    var handler = this.makeEventHandler(attrs[i].value, cvt);
                    if (handler)
                        this.tnode.addEventListener(evname, handler);
                }
            }
        };
        return EventHandlers;
    }());
    exports.EventHandlers = EventHandlers;
});
define("coml/element/BaseCoElement", ["require", "exports", "coml/Implementations", "coml/TargetNode"], function (require, exports, Implementations_4, TargetNode_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseCoElement = void 0;
    /**
     * Utililty class that acts as a base for writing your own CoElements.
     */
    var BaseCoElement = /** @class */ (function () {
        function BaseCoElement(cvt, tn) {
            this.tn = tn;
            this.cvt = cvt;
        }
        BaseCoElement.prototype.getCvt = function () {
            return this.cvt;
        };
        BaseCoElement.prototype.getTN = function () {
            return this.tn;
        };
        /**
         * Returns the parameter block as set by any parent Component for us
         */
        BaseCoElement.prototype.params = function () {
            // find the first parent that has
            var found;
            var me = this.getTN().snode.tagName.toLowerCase();
            this.getCvt().findParentAndIteration(this.getTN(), function (tn, iteration) {
                found = tn.childParams(iteration, me);
                return found;
            });
            return found;
        };
        /**
         * Finds the current element's 0 based iteration in a parent with the tag 'parentTag'.
         *
         * @param parentTag
         * @returns iteration number;
         */
        BaseCoElement.prototype.iter = function (parentTag) {
            var _a = this.getCvt().findParentAndIteration(this.getTN(), function (tn) {
                return tn.snode.tagName.toLowerCase() == parentTag;
            }), parent = _a.parent, iteration = _a.iteration;
            return iteration;
        };
        BaseCoElement.prototype.attr = function (attr, defvalue) {
            if (!this.getTN().snode.hasAttribute(attr)) { // if it doesnt exist on our element, delegate to the owning this
                return this.getCvt().getThis().attr(attr, defvalue);
            }
            return (0, TargetNode_2.getAttr)(this.getCvt(), this.getTN().snode, attr, defvalue, this.tn);
        };
        /**
         * Returns the text content of this ELement, after evaluating any ${} expressions.
         */
        BaseCoElement.prototype.content = function () {
            return this.getCvt().expandString(this.getTN().snode.textContent, this.getTN());
        };
        /**
         * Given a source tagname, returns the first matching parent CoElement.
         *
         * @param parentTag
         * @returns
         */
        BaseCoElement.prototype.parent = function (parentTag) {
            var found = this.getCvt().findParent(this.getTN(), function (tn) {
                return tn.snode.tagName.toLowerCase() == parentTag;
            });
            if (found)
                return found.component;
        };
        BaseCoElement.prototype.onRender = function (rm) {
        };
        /**
         * Dispatch a DOM synthetic event on the root node of this object.
         * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
         *
         * @param eventname
         * @param detail
         */
        BaseCoElement.prototype.dispatchEvent = function (eventname, detail, options) {
            return this.getTN().dispatchEvent(eventname, detail, options);
        };
        BaseCoElement.prototype.invalidate = function (node, forget) {
            if (!node) // means us
                node = this.getTN();
            this.cvt.invalidate(node, forget);
        };
        BaseCoElement.prototype.get = function (node, getfunc) {
            if (!node) { // means us
                if (getfunc)
                    getfunc(this);
                return this;
            }
            return this.cvt.get(node, getfunc);
        };
        BaseCoElement.prototype.$ = function (node, changeid, changer) {
            if (!node)
                node = this.getTN();
            return this.cvt.$(node, changeid, changer);
        };
        /**
         * Attach an asset's control to the target node.
         *
         * @param  parent The target dom node or query selector whose child the new control will become.
         * @param  toAttach The control or asset to attach.
         * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
         *
         * @return A promise that resolves with the control.
         */
        BaseCoElement.prototype.attach = function (parent, toAttach, parameters) {
            return this.cvt.attach(parent, toAttach, parameters);
        };
        /**
        * Detaches a previously attached() control.
        *
        * @param toDetach The control that was attached, or the target node or query selector of the parent from which to attach all previously attached controls
        */
        BaseCoElement.prototype.detach = function (toDetach) {
            return this.cvt.detach(toDetach);
        };
        BaseCoElement.prototype.ajax = function (callName, jsonToSend, cache, responseDataType) {
            return Implementations_4.Implementations.getAjax().ajax(callName, jsonToSend, cache, responseDataType);
        };
        BaseCoElement.prototype.assets = function () {
            return Implementations_4.Implementations.getAssetFactory();
        };
        return BaseCoElement;
    }());
    exports.BaseCoElement = BaseCoElement;
});
define("coml/html/HtmlElement", ["require", "exports", "coml/html/EventHandlers", "coml/element/BaseCoElement"], function (require, exports, EventHandlers_1, BaseCoElement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HtmlElementFactory = exports.HtmlElement = void 0;
    /**
     * elements like <div><p>,<h1>,<div><span> etc that can be rendered as themselves into html.
     *
     */
    var HtmlElement = /** @class */ (function (_super) {
        __extends(HtmlElement, _super);
        function HtmlElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        HtmlElement.prototype.getTagName = function (elem) {
            return elem.tagName.toLowerCase();
        };
        HtmlElement.prototype.start = function (rm, cvt, elem, tn) {
            var e_1, _a;
            rm.openStart(this.getTagName(elem), this);
            if (elem.classList && elem.classList.length) {
                for (var i = 0; i < elem.classList.length; i++) {
                    var str_1 = cvt.expandString(elem.classList[i], tn);
                    if (!str_1 || str_1.length == 0) {
                        console.warn("class [".concat(elem.classList[i], "] expanded to empty string"));
                    }
                    else {
                        rm.class(str_1);
                    }
                }
            }
            // set inline styles
            var str = elem.getAttribute('style');
            if (str && str.length) {
                var estr = cvt.expandString(str, tn);
                var pairs = estr.slice(0, estr.length - 1).split(';').map(function (x) { return x.split(':'); }); //// gives [ ['color', 'blue'], ['display', 'flex'] ]
                try {
                    for (var pairs_1 = __values(pairs), pairs_1_1 = pairs_1.next(); !pairs_1_1.done; pairs_1_1 = pairs_1.next()) {
                        var pair = pairs_1_1.value;
                        if (pair && pair.length > 1 && pair[0] && pair[1] && pair[0].trim().length) {
                            rm.style(pair[0].trim(), pair[1]);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (pairs_1_1 && !pairs_1_1.done && (_a = pairs_1.return)) _a.call(pairs_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            var attrs = elem.attributes;
            for (var i = 0; i < attrs.length; i++) {
                if (attrs[i].name != 'class' && attrs[i].name != 'style' && !EventHandlers_1.EventHandlers.isEventAttr(attrs[i].name)) {
                    rm.attr(attrs[i].name, cvt.expandString(attrs[i].value, tn));
                }
            }
            //cvt.encodeWSE(rm,tn);
            rm.openEnd();
        };
        HtmlElement.prototype.children = function (rm, cvt, tn) {
            cvt.renderChildren(rm, tn);
        };
        HtmlElement.prototype.end = function (rm, cvt, elem) {
            rm.close(this.getTagName(elem));
        };
        HtmlElement.prototype.onRender = function (rm) {
            var elem = this.tn.snode;
            this.start(rm, this.cvt, elem, this.tn);
            this.children(rm, this.cvt, this.tn);
            this.end(rm, this.cvt, elem);
        };
        return HtmlElement;
    }(BaseCoElement_1.BaseCoElement));
    exports.HtmlElement = HtmlElement;
    var HtmlElementFactory = /** @class */ (function () {
        function HtmlElementFactory() {
        }
        HtmlElementFactory.prototype.registerFactory = function (cvt) {
        };
        HtmlElementFactory.prototype.makeComponent = function (tn, cvt) {
            return new HtmlElement(cvt, tn);
        };
        return HtmlElementFactory;
    }());
    exports.HtmlElementFactory = HtmlElementFactory;
});
define("coml/html/BypassElement", ["require", "exports", "coml/html/HtmlElement"], function (require, exports, HtmlElement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BypassElementFactory = void 0;
    /**
    *   Bypasses the current node entirely - but its children are rendered to html
    */
    var BypassElement = /** @class */ (function (_super) {
        __extends(BypassElement, _super);
        function BypassElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        BypassElement.prototype.start = function (rm, cvt, elem) {
        };
        BypassElement.prototype.end = function (rm, cvt, elem) {
        };
        return BypassElement;
    }(HtmlElement_1.HtmlElement));
    /**
    * bypasses the current node entirely - its children are rendered to html
    */
    var BypassElementFactory = /** @class */ (function (_super) {
        __extends(BypassElementFactory, _super);
        function BypassElementFactory() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BypassElementFactory.prototype.makeComponent = function (tn, cvt) {
            return new BypassElement(cvt, tn);
        };
        return BypassElementFactory;
    }(HtmlElement_1.HtmlElementFactory));
    exports.BypassElementFactory = BypassElementFactory;
});
define("coml/html/ScriptElement", ["require", "exports", "coml/element/BaseCoElement"], function (require, exports, BaseCoElement_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScriptElementFactory = exports.ScriptElement = void 0;
    /**
     * executes any <script> tags in the context of the ConverterImpl's 'This' object.
     */
    var ScriptElement = /** @class */ (function (_super) {
        __extends(ScriptElement, _super);
        function ScriptElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        ScriptElement.prototype.onRender = function (rm) {
            var script;
            for (var i = 0; i < this.tn.snode.childNodes.length; i++) {
                var cn = this.tn.snode.childNodes[i];
                if (cn.nodeType == Node.TEXT_NODE) {
                    //console.log(cn.nodeValue);
                    if (!script)
                        script = cn.nodeValue;
                    else
                        script += ('\n' + cn.nodeValue);
                }
            }
            if (script) {
                this.cvt.executeScript(script);
            }
        };
        return ScriptElement;
    }(BaseCoElement_2.BaseCoElement));
    exports.ScriptElement = ScriptElement;
    /**
     * executes any <script> tags in the context of the ConverterImpl's 'This' object.
     */
    var ScriptElementFactory = /** @class */ (function () {
        function ScriptElementFactory() {
        }
        ScriptElementFactory.prototype.registerFactory = function (cvt) {
        };
        ScriptElementFactory.prototype.makeComponent = function (tn, cvt) {
            return new ScriptElement(cvt, tn);
        };
        return ScriptElementFactory;
    }());
    exports.ScriptElementFactory = ScriptElementFactory;
});
define("coml/html/DoNotRenderElement", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DoNotRenderElementFactory = void 0;
    /**
     * Does not render the node or its children. e.g. <head>
     */
    var DoNotRenderElement = /** @class */ (function () {
        function DoNotRenderElement() {
        }
        DoNotRenderElement.prototype.params = function () {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.iter = function (parentTag) {
            return 0;
        };
        DoNotRenderElement.prototype.onPostRender = function (node) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.onPreRender = function () {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.cleanup = function () {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.attr = function (attr, defvalue) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.content = function () {
            return '';
        };
        DoNotRenderElement.prototype.invalidate = function (node) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.get = function (node) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.$ = function (node, changeid, changer) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.attach = function (parent, toAttach, parameters) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.detach = function (toDetach) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.ajax = function (callName, jsonToSend, cache, responseDataType) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.assets = function () {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.dispatchEvent = function (eventname, detail, options) {
            throw new Error("Method not implemented.");
        };
        DoNotRenderElement.prototype.getCvt = function () {
            return;
        };
        DoNotRenderElement.prototype.getTN = function () {
            return;
        };
        DoNotRenderElement.prototype.onRender = function (rm) {
        };
        return DoNotRenderElement;
    }());
    /**
     * Does not render the node or its children. e.g. <head>
     */
    var DoNotRenderElementFactory = /** @class */ (function () {
        function DoNotRenderElementFactory() {
        }
        DoNotRenderElementFactory.prototype.makeComponent = function (tn, cvt) {
            return new DoNotRenderElement();
        };
        DoNotRenderElementFactory.prototype.registerFactory = function (cvt) {
        };
        return DoNotRenderElementFactory;
    }());
    exports.DoNotRenderElementFactory = DoNotRenderElementFactory;
});
define("coml/element/ErrorCoElement", ["require", "exports", "coml/element/BaseCoElement"], function (require, exports, BaseCoElement_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ErrorCoElement = void 0;
    var ErrorCoElement = /** @class */ (function (_super) {
        __extends(ErrorCoElement, _super);
        function ErrorCoElement(cvt, tn, msg) {
            var _this = _super.call(this, cvt, tn) || this;
            _this.msg = msg;
            return _this;
        }
        ErrorCoElement.prototype.getSurname = function () {
            var name = this.getTN().snode.tagName.toLowerCase();
            /*
            let dash=name.indexOf('-');
            if (dash>0 && dash<name.length-1) {
                return name.substring(dash+1);
            }*/
            return name;
        };
        ErrorCoElement.prototype.onRender = function (rm) {
            rm.openStart('div', this)
                .class('u-coml-error')
                .class('u-' + this.getSurname())
                .openEnd()
                .text(this.msg);
            this.getCvt().renderChildren(rm, this.getTN());
            rm.close('div');
        };
        return ErrorCoElement;
    }(BaseCoElement_3.BaseCoElement));
    exports.ErrorCoElement = ErrorCoElement;
});
define("coml/impl/Debug", ["require", "exports", "coml/TargetNode"], function (require, exports, TargetNode_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toStr = exports.pad = void 0;
    /**
     * returns 'cht' repeated cnt times.
     *
     * @param cnt
     * @param chr
     */
    function pad(cnt, chr) {
        if (chr === void 0) { chr = '-'; }
        var s = '';
        while (cnt > 0) {
            s += chr;
            cnt--;
        }
        return s;
    }
    exports.pad = pad;
    /**
         * For debugging, display an identifiable string for a node.
         * @param node
         * @returns
         */
    function toStr(node) {
        if (!node)
            return 'undefined';
        if (typeof node == 'string')
            return node;
        if ((0, TargetNode_3.isTargetNode)(node))
            node = node.snode;
        if (node instanceof HTMLElement) {
            var id = node.id;
            var tag = node.tagName.toLowerCase();
            var classes = '';
            if (node.classList && node.classList.length) {
                for (var i = 0; i < node.classList.length; i++) {
                    classes += node.classList[i];
                    classes += '.';
                }
            }
            if (classes.length > 0) {
                return "".concat(tag).concat((id) ? '#' + id : '', ".") + classes;
            }
            else {
                return "".concat(tag).concat((id) ? '#' + id : '');
            }
        }
        else {
            var type = 'node';
            switch (node.nodeType) {
                case Node.ATTRIBUTE_NODE:
                    type = 'ATTRIBUTE_NODE';
                    break;
                /** node is a CDATASection node. */
                case Node.CDATA_SECTION_NODE:
                    type = 'CDATA_SECTION_NODE';
                    break;
                /** node is a Comment node. */
                case Node.COMMENT_NODE:
                    type = 'COMMENT_NODE';
                    break;
                /** node is a DocumentFragment node. */
                case Node.DOCUMENT_FRAGMENT_NODE:
                    type = 'DOCUMENT_FRAGMENT_NODE';
                    break;
                /** node is a document. */
                case Node.DOCUMENT_NODE:
                    type = 'DOCUMENT_NODE ' + node.documentURI;
                    break;
                /** Set when other is a descendant of node. */
                case Node.DOCUMENT_POSITION_CONTAINED_BY:
                    type = 'DOCUMENT_POSITION_CONTAINED_BY';
                    break;
                /** Set when other is an ancestor of node. */
                case Node.DOCUMENT_POSITION_CONTAINS:
                    type = 'DOCUMENT_POSITION_CONTAINS';
                    break;
                /** Set when node and other are not in the same tree. */
                case Node.DOCUMENT_POSITION_DISCONNECTED:
                    type = 'DOCUMENT_POSITION_DISCONNECTED';
                    break;
                /** Set when other is following node. */
                case Node.DOCUMENT_POSITION_FOLLOWING:
                    type = 'DOCUMENT_POSITION_FOLLOWING';
                    break;
                case Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:
                    type = 'DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC';
                    break;
                /** Set when other is preceding node. */
                case Node.DOCUMENT_POSITION_PRECEDING:
                    type = 'DOCUMENT_POSITION_PRECEDING';
                    break;
                /** node is a doctype. */
                case Node.DOCUMENT_TYPE_NODE:
                    type = 'DOCUMENT_TYPE_NODE';
                    break;
                /** node is an element. */
                case Node.ELEMENT_NODE:
                    type = 'ELEMENT_NODE';
                    break;
                case Node.ENTITY_NODE:
                    type = 'ENTITY_NODE';
                    break;
                case Node.ENTITY_REFERENCE_NODE:
                    type = 'ENTITY_REFERENCE_NODE';
                    break;
                case Node.NOTATION_NODE:
                    type = 'NOTATION_NODE';
                    break;
                /** node is a ProcessingInstruction node. */
                case Node.PROCESSING_INSTRUCTION_NODE:
                    type = 'PROCESSING_INSTRUCTION_NODE';
                    break;
                /** node is a Text node. */
                case Node.TEXT_NODE:
                    type = 'TEXT_NODE';
                    break;
            }
            return type;
        }
    }
    exports.toStr = toStr;
});
define("coml/impl/ConverterImpl", ["require", "exports", "coml/Asset", "coml/CoElement", "coml/TargetNode", "coml/impl/TargetNodeImpl", "coml/Attachable", "coml/impl/Style", "coml/impl/AssetCoElementFactory", "coml/Implementations", "coml/html/HtmlElement", "coml/html/BypassElement", "coml/html/ScriptElement", "coml/html/DoNotRenderElement", "coml/element/ErrorCoElement", "coml/impl/Debug", "coml/html/EventHandlers"], function (require, exports, Asset_4, CoElement_1, TargetNode_4, TargetNodeImpl_2, Attachable_3, Style_1, AssetCoElementFactory_1, Implementations_5, HtmlElement_2, BypassElement_1, ScriptElement_1, DoNotRenderElement_1, ErrorCoElement_1, Debug_1, EventHandlers_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConverterImpl = void 0;
    /**
     * A COML to Html converter - reads the DOM tree of a given Html file with COML markup and renders all nodes in the tree to
     * html by calling factories of MarkupComponents. Normal html nodes in the original html dom tree are preserved.
     *
     * ### Principles:
     * 1. There is a source dom (sdom) which is converted to the target dom (tdom).
     * 2. Each node in the sdom is converted to 0 or many nodes in the tdom.
     * 3. Objects that implement the CoElement interface handle the conversion. For each sdom node, they generate 0,1 or many tdom nodes.
     * 4. There can be many instances of a CoElement linked to any single sdom node.
     * 5. The conversion can be asyncronous, because A CoElement may need information to render its tdom based on an async. call - typically a jsoncall.
     * 6. MarkupComponents support 'mutation' of the tdom element. This means at runtime an event such as a user click may change dynamically the attributes of
     *    a sdom node. This will cause the CoElement to regenerate the subnodes of the tdom only for that sdom node.
     * 7. A CoElement may render its content using any htmlcontrol.
     *
     * ### Implementation: (Objective is to maintain state between rerenders, for example controls created during one render are availabe at the next)
     *
     * 1. During rendering, a tree is created from the `root` object for each coml tag encountered. Each CoElement's
     *    `onRender()` function adds its own tags, then calls the `renderChildren()` to add further child nodes.
     *    If no matching CoElement is found for a tag, the sdom node is copied verbatim to the tdom. Each node in this tree is a 'TargetNode'
     * 2. Each TargetNode is a mapping of 1 snode via a CoElement to many tnodes. Once the tree has been created,
     *    subsequent renders call the same CoElement instance. If a previously rendered
     *    TargetNode is not visited during this render, then the TargetNode is removed from the parent.
     * 4. Looping. If a parent CoElement renders its children multiple time, it uses the `renderChildren()`'s `iteration` parameter
     *    to pass in the iteration count. The TargetNode then maintains the children generated per iteration.
     */
    var ConverterImpl = /** @class */ (function () {
        /**
         * Constructor. If two ConverterImpls share state (This and imprts), then pass the original . This is needed when
         * two seperate render chains are run from the same HtmlPage, (for example the WSToolkit element)
         */
        function ConverterImpl(copyStateFrom) {
            this.instanceFactories = new Map(); // specific to this instance - loaded via imports
            this.matchingFactories = [];
            this.DEFAULT_FACTORY = new HtmlElement_2.HtmlElementFactory();
            this.ready = false;
            this.renderComments = true; // if true, comments like <!-- some comment --> in the source dom will be rendered as <ws-comment style="display:none;"> some comment </ws-comment>
            // listeners
            this.onAfterRenderCallbacks = [];
            this.onThisCreatedCallbacks = [];
            this.loadElementPromises = [];
            this.invalidated = new Map();
            this.depth = 0;
            this.children = [];
            if (!copyStateFrom) {
                this.initialize(); // set up factories
                //this.This=new BaseThis(this);
            }
            else {
                this.This = copyStateFrom.getThis();
                this.instanceFactories = copyStateFrom.instanceFactories; // so the parents imports are avalable to us
                this.matchingFactories = copyStateFrom.matchingFactories;
            }
        }
        ConverterImpl.prototype.initialize = function () {
            if (!ConverterImpl.sharedElemFactories) {
                ConverterImpl.sharedElemFactories = new Map();
                //ConverterImpl.sharedElemFactories.set('document',new DocumentElementFactory()); // handled by BaseThis
                ConverterImpl.sharedElemFactories.set('head', new DoNotRenderElement_1.DoNotRenderElementFactory());
                ConverterImpl.sharedElemFactories.set('html', new BypassElement_1.BypassElementFactory());
                ConverterImpl.sharedElemFactories.set('body', new BypassElement_1.BypassElementFactory());
                ConverterImpl.sharedElemFactories.set('script', new ScriptElement_1.ScriptElementFactory());
            }
        };
        /**
         * Sets the functon that will be used to expand attributes
         *
         * @param fnGetAttr
         */
        ConverterImpl.prototype.setGetAttrFn = function (fnGetAttr) {
            this.fnGetAttr = fnGetAttr;
        };
        /**
         * Instatiate this from the `<meta name="thisclass" content="path/To/Class">` meta.
         * If not found, just use an instance of BaseThis.
         *
         * @param doc
         */
        ConverterImpl.prototype.instantiateThis = function (doc) {
            var _this = this;
            var meta = doc.querySelector('meta[name="thisclass"]');
            if (meta && meta.content && meta.content.length) {
                var thisClass = meta.content;
                return (this.newThis(thisClass)
                    .then(function (instance) {
                    _this.This = instance;
                    _this.onThisCreated();
                }));
            }
            else {
                this.This = Implementations_5.Implementations.createThis(this, this.fnGetAttr);
                this.onThisCreated();
                return Promise.resolve();
            }
        };
        ConverterImpl.prototype.newThis = function (path) {
            var _this = this;
            var res, rej;
            var promise = new Promise(function (resolve, reject) {
                res = resolve;
                rej = reject;
            });
            require([path], function (module) {
                var instance = new module.default(_this, _this.This, _this.fnGetAttr);
                res(instance);
            });
            return promise;
        };
        /**
         * Calls any registered callbacks on This creation
         *
         * @param ref
         */
        ConverterImpl.prototype.onThisCreated = function () {
            var e_2, _a;
            if (this.onThisCreatedCallbacks.length > 0) {
                try {
                    for (var _b = __values(this.onThisCreatedCallbacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var cb = _c.value;
                        try {
                            cb(this.This);
                        }
                        catch (x) {
                            console.error(x);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        };
        ConverterImpl.prototype.getAssetId = function () {
            return this.assetId;
        };
        /**
         * Add a listener to be called when the topcontrol finishes rendering.
         *
         * @param cb
         */
        ConverterImpl.prototype.addOnThisCreatedListener = function (cb) {
            this.onThisCreatedCallbacks.push(cb);
        };
        /**
         * Start observing the source document - any changes to attrinutes causes will trigger a redraw of the
         * node that changed.
         */
        ConverterImpl.prototype.startObserving = function () {
            var _this = this;
            this.observer = new MutationObserver(function (mutations) {
                if (ConverterImpl.blockMutation)
                    return;
                var changed;
                mutations.forEach(function (mutation) {
                    if (mutation.type === "attributes") {
                        /*
                        console.log(`MUTATED: ${mutation.attributeName} on target=${toStr(mutation.target)} from ${mutation.oldValue} to ${(mutation.target as HTMLElement).getAttribute(mutation.attributeName)}`);
                        let tn=this.find(this.root,(tn)=>(tn.snode==mutation.target || tn.replaced==mutation.target));
                        if (tn) {
                            if (!changed)
                                changed=new Set();
                            changed.add(tn);
                        } else {
                            console.log(`MUTATED: ${mutation.attributeName} could not find target from root=${toStr(this.root.snode)}`);
                        } */
                        console.error("MUTATED: ".concat(mutation.attributeName, " on target=").concat((0, Debug_1.toStr)(mutation.target), " from ").concat(mutation.oldValue, " to ").concat(mutation.target.getAttribute(mutation.attributeName)));
                        console.error('DO NOT CHANGE SOURCE NODES (SNODES) - USE this.$(selector,(elem)=>{elem.setAttribute("key","value")}) INSTEAD.');
                    }
                });
                if (changed) {
                    changed.forEach(function (tn) {
                        _this.rebuildInt(tn);
                    });
                }
            });
            this.observer.observe(this.getDocument(), { attributes: true, subtree: true });
        };
        /**
        * Perform unwatched changes on an snode via changes(). Won't trigger a rebuild.
        *
        * @param snode
        * @param changes
        *
       unwatchedSnodeChange(snode:Node,changes:()=>any) {
           try { // block mutation till after the
               ConverterImpl.blockMutation=true;
               changes();
           } finally {
               Promise
               .resolve()
               .then(()=>{
                   ConverterImpl.blockMutation=false;
               })
           }
       } */
        ConverterImpl.prototype.getRoot = function () {
            return this.root;
        };
        /**
         * Replace the root, e.g. during templatization.
         * @param root
         */
        ConverterImpl.prototype.replaceRoot = function (root) {
            this.root = root;
        };
        ConverterImpl.prototype.getDocument = function () {
            return this.doc;
        };
        /**
         * imports a document by importing its styles and the executing its <script> block from the head.
         *
         *
         */
        ConverterImpl.prototype.importDocumentInt = function (doc) {
            return (this.importMarkupComponents(doc));
        };
        /**
         * Imports scripts and styles, and sets the document as the root node.
         *
         * @param doc
         * @param assetId If the document was loaded from an asset, the assetId. This is stored in the This object. Also, we start monitoring scope changes for this asset (which represents the top level page), so that styles are removed when not in scope
         */
        ConverterImpl.prototype.setDocument = function (doc, assetId, root) {
            var _this = this;
            this.root = (root) ? root : new TargetNodeImpl_2.TargetNodeImpl(doc.body);
            if (!this.root.snode)
                this.root.snode = doc.body;
            doc.body.setAttribute('data-asset-id', (0, Asset_4.stringifyAssetID)(assetId));
            //if (attachmentNode)
            //    this.root.attachmentNode=attachmentNode;
            this.doc = doc; // so This construction use of $ will have doc available
            return (this.instantiateThis(doc)
                .then(function () {
                return _this.importDocumentInt(doc);
            })
                .then(function () {
                _this.doc = doc;
                _this.getThis().document = _this.doc;
                _this.assetId = assetId;
                _this.startObserving();
                return _this;
            }));
        };
        /**
         * Call so any template's installed onAfterRender callbacks are called.
         *
         * @param ref
         */
        ConverterImpl.prototype.onAfterRender = function () {
            var e_3, _a;
            if (this.onAfterRenderCallbacks.length > 0) {
                try {
                    for (var _b = __values(this.onAfterRenderCallbacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var cb = _c.value;
                        try {
                            cb();
                        }
                        catch (x) {
                            console.error(x);
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        };
        /**
         * Add a listener to be called when the topcontrol finishes rendering.
         *
         * @param cb
         */
        ConverterImpl.prototype.addOnAfterRenderListener = function (cb) {
            this.onAfterRenderCallbacks.push(cb);
        };
        /**
         * Copies all attributes from node to the Render (using rm.attr()) except for any specified in the doNotCopy list.
         *
         * @param rm
         * @param node
         * @param doNotCopy
         */
        ConverterImpl.prototype.copyAttrExcept = function (rm, node, doNotCopy, currtn) {
            var e_4, _a, e_5, _b;
            var elem = node;
            var attrs = elem.attributes;
            var ignoreset;
            if (doNotCopy && doNotCopy.length) {
                ignoreset = new Set();
                try {
                    for (var doNotCopy_1 = __values(doNotCopy), doNotCopy_1_1 = doNotCopy_1.next(); !doNotCopy_1_1.done; doNotCopy_1_1 = doNotCopy_1.next()) {
                        var ig = doNotCopy_1_1.value;
                        ignoreset.add(ig.toLowerCase());
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (doNotCopy_1_1 && !doNotCopy_1_1.done && (_a = doNotCopy_1.return)) _a.call(doNotCopy_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            for (var i = 0; i < attrs.length; i++) {
                if (attrs[i].name != 'class' && attrs[i].name != 'style' && !EventHandlers_2.EventHandlers.isEventAttr(attrs[i].name)) {
                    if (ignoreset && ignoreset.has(attrs[i].name.toLowerCase()))
                        continue;
                    rm.attr(attrs[i].name, this.expandString(attrs[i].value, currtn));
                }
            }
            // copy class and attributes
            if (elem.classList && elem.classList.length) {
                for (var i = 0; i < elem.classList.length; i++) {
                    var str_2 = this.expandString(elem.classList[i], currtn);
                    if (!str_2 || str_2.length == 0) {
                        console.warn("class [".concat(elem.classList[i], "] expanded to empty string"));
                    }
                    else {
                        rm.class(str_2);
                    }
                }
            }
            // set inline styles
            var str = elem.getAttribute('style');
            if (str && str.length) {
                var pairs = str.slice(0, str.length - 1).split(';').map(function (x) { return x.split(':'); }); //// gives [ ['color', 'blue'], ['display', 'flex'] ]
                try {
                    for (var pairs_2 = __values(pairs), pairs_2_1 = pairs_2.next(); !pairs_2_1.done; pairs_2_1 = pairs_2.next()) {
                        var pair = pairs_2_1.value;
                        if (pair && pair.length > 1 && pair[0] && pair[1] && pair[0].trim().length) {
                            rm.style(pair[0].trim(), this.expandString(pair[1], currtn));
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (pairs_2_1 && !pairs_2_1.done && (_b = pairs_2.return)) _b.call(pairs_2);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        };
        /**
         *  Copy's the snode's attributes and classes and styles to the tnode
         *
         *
         * @param tnode The tnode to copy to.
         * @param snode The node to copy from.
         * @param doNotCopy A list of attribute NOT to copy
         * @param attr2set Additional attributes to set (array of key/value pairs)
         */
        ConverterImpl.prototype.copyAttrExceptToTNode = function (tnode, snode, doNotCopy, attr2set, currtn) {
            var e_6, _a, e_7, _b;
            var elem = snode;
            var telem = tnode;
            var attrs = elem.attributes;
            var ignoreset;
            if (doNotCopy && doNotCopy.length) {
                ignoreset = new Set();
                try {
                    for (var doNotCopy_2 = __values(doNotCopy), doNotCopy_2_1 = doNotCopy_2.next(); !doNotCopy_2_1.done; doNotCopy_2_1 = doNotCopy_2.next()) {
                        var ig = doNotCopy_2_1.value;
                        ignoreset.add(ig.toLowerCase());
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (doNotCopy_2_1 && !doNotCopy_2_1.done && (_a = doNotCopy_2.return)) _a.call(doNotCopy_2);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            //let tnodeJQ=$(tnode);
            for (var i = 0; i < attrs.length; i++) {
                if (attrs[i].name != 'class' && // class handled seperately via classlist below
                    attrs[i].name != 'style' && // styles handled seperately
                    attrs[i].name != 'remove' &&
                    !EventHandlers_2.EventHandlers.isEventAttr(attrs[i].name)
                    && attrs[i].name != 'id') { // as its a control, we cant overwrite the ui5 id with the source's
                    if (ignoreset && ignoreset.has(attrs[i].name.toLowerCase()))
                        continue;
                    telem.setAttribute(attrs[i].name, this.expandString(attrs[i].value, currtn));
                }
            }
            // if any attributes to set, copies these too:
            if (attr2set) {
                try {
                    for (var attr2set_1 = __values(attr2set), attr2set_1_1 = attr2set_1.next(); !attr2set_1_1.done; attr2set_1_1 = attr2set_1.next()) {
                        var kv = attr2set_1_1.value;
                        telem.setAttribute(kv[0], kv[1]);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (attr2set_1_1 && !attr2set_1_1.done && (_b = attr2set_1.return)) _b.call(attr2set_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
            // copy class and attributes
            if (!(ignoreset && ignoreset.has('class'))) {
                if (elem.classList && elem.classList.length) {
                    for (var i = 0; i < elem.classList.length; i++) {
                        telem.classList.add(this.expandString(elem.classList[i], currtn));
                    }
                }
            }
            // set inline styles
            var str = elem.getAttribute('style');
            if (str && str.length) {
                var stylestr = (telem.getAttribute('style')) ? telem.getAttribute('style') : '';
                /* why parse to pairs?
                let pairs:string[][]=str.slice(0, str.length - 1).split(';').map(x => x.split(':')); //// gives [ ['color', 'blue'], ['display', 'flex'] ]
                for(let pair of pairs) {
                    if (pair && pair.length>1 && pair[0] && pair[1] && pair[0].trim().length)  {
                        stylestr+=`${pair[0].trim()}:${this.expandString(pair[1])};`;
                    }
                }*/
                stylestr += this.expandString(str, currtn);
                if (stylestr.length > 0) {
                    telem.setAttribute('style', stylestr);
                }
            }
            // remove
            for (var i = 0; i < attrs.length; i++) {
                if (attrs[i].name == 'remove') {
                    telem.removeAttribute(attrs[i].value);
                }
            }
        };
        /**
         * Returns the this object that is visible to scripts and string templates in the html page
         */
        ConverterImpl.prototype.getThis = function () {
            return this.This;
        };
        /**
         * imports any ws-element import statements in the head of the template, then sets the ready flag.
         * Returns a promise that resolves when all imports are done and the ready flag is set.
         *
         * @param doc
         *
         */
        ConverterImpl.prototype.importMarkupComponents = function (doc) {
            var _this = this;
            var head = doc.getElementsByTagName('head');
            this.loadElementPromises = [];
            if (head && head.length > 0) {
                var scripts = head[0].getElementsByTagName('script');
                for (var i = 0; i < scripts.length; i++) {
                    var tn = new TargetNodeImpl_2.TargetNodeImpl(scripts[i]);
                    var e = this.makeCoElement(tn); // will use the script factory
                    if ((0, CoElement_1.isCoElement)(e)) {
                        e.onRender(null); // this will push to this.loadElementPromises
                    }
                }
            }
            return (Promise.all(this.loadElementPromises)
                .then(function () {
                _this.setReady(true);
            }));
        };
        ConverterImpl.prototype.setReady = function (ready) {
            this.ready = ready;
        };
        /**
         * Loads a js script using AMD and creates a CoElement out of the loaded module (Module.default)
         * This is then istalled on this instance's element factories.
         * This function also pushes the promise onto this.loadElementPromises, which can be used
         * to wait for all ws-elements to load before rendering the template.
         *
         * @param js
         * @returns
         */
        ConverterImpl.prototype.loadMarkupFactory = function (js) {
            // normal page:
            var promise = new Promise(function (resolve, reject) {
                require([js], function (Module) {
                    //console.log("here!");
                    try {
                        var factory = void 0;
                        if (typeof Module.default === 'function') {
                            factory = new Module.default(); // is an AMD module (compiled ts class)
                        }
                        else {
                            throw "".concat(js, " is not a Module");
                        }
                        resolve(factory);
                    }
                    catch (err) {
                        if (reject)
                            reject(err);
                        else
                            throw err;
                    }
                }, function (error) {
                    if (reject)
                        reject(error);
                    else
                        throw new Error(error);
                });
            });
            this.loadElementPromises.push(promise);
            return promise;
        };
        /**
         * execute the javascript in 'script' after setting its 'this' to point to the This object.
         *
         * @param script
         */
        ConverterImpl.prototype.executeScript = function (script) {
            var f = (new Function(script)).bind(this.This);
            return f();
        };
        ConverterImpl.prototype.expandString = function (str, __currtn) {
            //let x=str;
            if (str && str.indexOf('${') >= 0) {
                // expand
                this.This.__currtn = __currtn;
                var f = (new Function("try {\n return `" + str + "`;\n}\n catch(e) {\nreturn '';\n}\n")).bind(this.This);
                str = f();
                delete this.This.__currtn;
            }
            //console.log('INPUT:'+x);
            //console.log(' CVTD:'+str);
            return str;
        };
        ConverterImpl.prototype.makeCoElementForTag = function (tag, tn) {
            // use instance factories first
            for (var i = 0; i < this.matchingFactories.length; i++) {
                if (this.matchingFactories[i].match(tag)) {
                    return this.matchingFactories[i].factory.makeComponent(tn, this);
                }
            }
            var f = this.instanceFactories.get(tag);
            if (f) {
                if (f.makeComponent)
                    return f.makeComponent(tn, this);
                else
                    return new ErrorCoElement_1.ErrorCoElement(this, tn, "".concat(tag, " - no makeComponent()"));
            }
            // use static factories next
            f = ConverterImpl.sharedElemFactories.get(tag);
            if (f)
                return f.makeComponent(tn, this);
            // fallback to the default html handler
            return this.DEFAULT_FACTORY.makeComponent(tn, this);
        };
        ConverterImpl.prototype.makeCoElement = function (tn) {
            var snode = (tn.replaced) ? tn.replaced : tn.snode;
            switch (snode.nodeType) {
                //case Node.DOCUMENT_NODE: // now handled by BaseThis
                //    return this.makeCoElementForTag('document',tn);
                case Node.ELEMENT_NODE: {
                    // use static factories first
                    var tag = snode.tagName.toLowerCase();
                    return this.makeCoElementForTag(tag, tn);
                }
                default:
                    console.warn("Do not know how to handle ".concat(tn.snode.nodeType));
            }
        };
        /**
         * Register a factory which will be called when this converter is called to convert
         * a node with tagName 'tag'.
         *
         * @param tag
         * @param factory
         */
        ConverterImpl.prototype.registerFactory = function (tag, factory) {
            if (typeof tag == 'string')
                this.instanceFactories.set(tag, factory);
            else
                this.matchingFactories.push({ match: tag, factory: factory });
        };
        ConverterImpl.prototype.isAsset = function (pass) {
            return typeof pass == 'object' && ('name' in pass);
        };
        /**
         * Import a COML factory.
         *
         * @param importee The fully qualified path to a COML CoELementFactory (e.g. `coml/element/CoFields`) or the assetId of a COML page.
         */
        ConverterImpl.prototype.import = function (importee, tagForAsset) {
            var _this = this;
            if (this.isAsset(importee)) {
                if (!tagForAsset)
                    throw new Error("import(".concat(importee, ") -- no tag specified"));
                var factory = new AssetCoElementFactory_1.AssetCoElementFactory(importee, tagForAsset);
                factory.registerFactory(this);
                return Promise.resolve();
            }
            else {
                return (this.loadMarkupFactory(importee)
                    .then(function (factory) {
                    factory.registerFactory(_this);
                }));
            }
        };
        /**
         * Finds the parent of 'tn' for which 'matcher' returns true.
         *
         * @param tn
         * @param matcher
         * @returns The parent found or undefined if non.
         */
        ConverterImpl.prototype.findParent = function (tn, matcher) {
            while (tn.parent) {
                if (matcher(tn.parent))
                    return tn.parent;
                tn = tn.parent;
            }
        };
        /**
         * Finds the parent of 'tn' for which 'matcher' returns true. Similar to
         * findParent, except the iteration that resulted in the child 'tn' is also returned.
         *
         * @param tn
         * @param matcher
         * @returns Either {parent:The parent found,iteration:The iteration of the branch that resulted in the child } or undefined if no parent
         */
        ConverterImpl.prototype.findParentAndIteration = function (tn, matcher) {
            while (tn.parent) {
                var iteration = tn.parent.getIterationOfChild(tn);
                if (matcher(tn.parent, iteration)) {
                    return {
                        parent: tn.parent,
                        iteration: iteration
                    };
                }
                tn = tn.parent;
            }
        };
        /**
         * Finds the first child of 'tn' for which 'matcher' returns true.
         *
         * @param tn The root to find children of
         * @param matcher Matching function
         * @returns The parent found or undefined if non.
         */
        ConverterImpl.prototype.findChild = function (tn, matcher) {
            return this.find(tn, matcher);
        };
        ConverterImpl.prototype.log2depth = function (depth, msg) {
            var m = '||';
            for (var i = 0; i < depth; i++) {
                m += '--';
            }
            m += msg;
            console.log(m);
        };
        ConverterImpl.prototype.find = function (tn, matcher, depth) {
            if (typeof depth == 'undefined')
                depth = 0;
            //this.log2depth(depth,'tn='+toStr(tn.snode));
            if (matcher(tn)) {
                //this.log2depth(depth,'FOUND');
                return tn;
            }
            for (var i = 0; i < tn.children.length; i++) {
                for (var j = 0; j < tn.children[i].length; j++) {
                    var f = this.find(tn.children[i][j], matcher, depth + 1);
                    if (f)
                        return f;
                }
            }
        };
        /**
         * Given a tdoc node, checks if it has a 'data-coid' tag and if so, finds the TargetNode that matches it
         *
         * @param node A tnode
         * @returns The found TargetNode
         */
        ConverterImpl.prototype.findTargetNodeByTNode = function (node) {
            if (node instanceof Element) {
                var wsid_1 = node.getAttribute('data-coid');
                if (wsid_1)
                    return (this.findChild(this.root, function (tn) { return tn.getId() == wsid_1; }));
            }
        };
        /**
         * Returns the snode given a selector in either the source or target dom.
         *
         * This source document is first searched, then its imported.
         *
         * If not found and the 'couldBeTdocSelector' is true, will then search the target document .If found, its wsid is used to find
         * the snode.
         *
         * @param selector The sdom or tdom selector.
         * @param couldBeTdocSelector
         * @returns The found snode
         */
        ConverterImpl.prototype.getSnodeFromSorTselector = function (selector, couldBeTdocSelector) {
            var snode = this.doc.querySelector(selector);
            if (snode)
                return snode;
            if (this.importedDocs) {
                this.importedDocs.forEach(function (doc) {
                    if (!snode) {
                        snode = doc.querySelector(selector);
                    }
                });
            }
            if (snode)
                return snode;
            if (couldBeTdocSelector) {
                var tnode = document.querySelector(selector);
                if (tnode) {
                    var tn = this.findTargetNodeByTNode(tnode);
                    if (tn)
                        return tn.snode;
                }
            }
        };
        /**
         * Returns the target node.
         *
         * @param node An snode,tnode or selector on either source document or target document.
         * @returns The first found TargetNode
         */
        ConverterImpl.prototype.asTargetNode = function (node) {
            if (typeof node == 'string') {
                // its a query selector
                var n_1 = this.getSnodeFromSorTselector(node); // try directly on the source doc
                if (!n_1) {
                    // could it be a querySelector on the target document?
                    var e = document.querySelector(node);
                    if (e) {
                        var tn = this.findTargetNodeByTNode(e);
                        if (tn) // it was a tnode
                            return { tn: tn, snode: tn.snode };
                    }
                }
                else {
                    // found the snode, find its TargetNode
                    var tn = this.find(this.root, function (tn) { return tn.matchSnode(function (snode2match) { return snode2match == n_1; }); });
                    return { tn: tn, snode: n_1 };
                }
            }
            else if ((0, TargetNode_4.isTargetNode)(node)) {
                // its a TargetNode
                return { tn: node, snode: node.snode };
            }
            else {
                // its a Node
                var n = this.findTargetNodeByTNode(node);
                if (n) // it was a tnode
                    return { tn: n, snode: n.snode };
            }
            return { tn: null, snode: null };
        };
        /**
         * Finds an snode given an snode,tnode,TargetNode or sdoc / tdoc selector.
         *
         * @param node
         * @returns The found source document node.
         */
        ConverterImpl.prototype.snodeFromAny = function (node) {
            var snode;
            if (typeof node == 'string')
                snode = this.getSnodeFromSorTselector(node, true);
            else if (node instanceof Node) {
                snode = node;
                var tn = this.findTargetNodeByTNode(snode);
                if (tn)
                    snode = tn.snode;
            }
            else {
                snode = node.snode;
            }
            return snode;
        };
        /**
         * Returns the generated target node (tnode) for the given parameter. Optionally lets the caller specify a 'state changer'
         * callback that will be called to effect changes of state to the tnode. The state changer is stored so that
         * the changes are recreated on every repaint of the tnode.
         *
         * @param node an snode, TargetNode or source or target document selector.
         * @param changeid (Optional but required if changer is specified) a unique id of the change (If the change is readded with the same id, it will replace the earlier change)
         * @param changer (Optional) The callback to effect changes, that will be called when the tnode is available. If currently available, the callback will be called immediately. The callback will also be called on any subsequent repaint of the tnode.
         */
        ConverterImpl.prototype.$ = function (node, changeid, changer) {
            if (!changer && !changeid) {
                var _a = this.asTargetNode(node), tn = _a.tn, snode = _a.snode;
                if (tn && tn.tnode instanceof Element)
                    return tn.tnode;
            }
            else {
                if (changeid.length == 0)
                    changeid = undefined;
                // we need the snode, so we can attach/remove the change to it (TN may not exist)
                var snode_1 = this.snodeFromAny(node);
                if (snode_1) {
                    if (changeid) // persist or delete
                        this.stateChanger(changeid, snode_1, changer); // add, or delete if changer is null or changeid is empty (single shot)
                    if (changer) {
                        // run now
                        var tn = this.find(this.root, function (tn) { return tn.matchSnode(function (snode2match) { return snode2match == snode_1; }); });
                        if (tn && tn.tnode)
                            changer(tn.tnode);
                        else if (!changeid) {
                            // persist once
                            var onceid = '@ONCE' + Math.floor(Math.random() * 1000000000);
                            this.stateChanger(onceid, snode_1, changer); // add with an id that will cause it to be removed on first call
                        }
                    }
                }
            }
        };
        /**
         * Adds a state change function, which can make changes to the attributes etc of a tnode that are different from those
         * copied from the snode. The changer callback is called on every render of the tnode so that state changes affected
         * once are not lost due to regeneration.
         *
         * @param id A unique id of the state change.
         * @param snode The snode to add/remove the changer for
         * @param changer The changer callback to add or undefined to remove existing changers. This will be called with the tnode ELement and can make any changes to it.
         */
        ConverterImpl.prototype.stateChanger = function (id, snode, changer) {
            if (changer) {
                var statechangers = this.getStateChangers(snode, true);
                statechangers[id] = changer;
            }
            else {
                // deleting             
                var statechangers = this.getStateChangers(snode);
                if (statechangers) {
                    delete statechangers[id];
                    if (Object.keys(statechangers).length == 0)
                        this.removeStateChangers(snode);
                }
            }
        };
        /**
         * Given a selector or element in either the source or target document, finds the associated CoElement.
         *
         * @param selectorOrNode an snode,tnode, TargetNode or source or target document selector.
         * @returns The CoElement associated with the
         */
        ConverterImpl.prototype.get = function (selectorOrNode, getfunc) {
            var _a = this.asTargetNode(selectorOrNode), tn = _a.tn, snode = _a.snode;
            if (tn) {
                if (getfunc) {
                    if (tn.component) {
                        getfunc(tn.component);
                    }
                    else if (snode) {
                        // add as a pending get
                        this.setGets(snode, getfunc);
                    }
                }
                return tn.component;
            }
            else if (getfunc && snode) {
                // add as a pending get
                this.setGets(snode, getfunc);
            }
        };
        /**
         * Adds an event handler to the given node.
         *
         * @param node      The node or its selector
         * @param eventname The event name, e.g. 'click' or 'mycustomevent'
         * @param handler  The callback.
         */
        //public addEventListener(node:Node|string|TargetNode,eventname:string,handler:(event:Event)=>any) {
        //    this.asTargetNode(node).addEventListener(eventname,handler);
        //}
        /**
         * Removes an eventhandler added via addEventListener.
         *
         * @param eventname
         * @param handler
         * @returns
         */
        //public removeEventListener(node:Node|string|TargetNode,eventname:string,handler:(event:Event)=>any) {
        //    this.asTargetNode(node).removeEventListener(eventname,handler);
        //}
        /**
         * Rebuild the given node as if from new. This is a more expensive operation than an invalidate
         * as the node's component and children are rebuilt.
         *
         * @param snode The snode, its sdom query selector, or the target node to rebuild. If not specified, defaults to teh root TargetNode
         *
        public  rebuild(snode?:Node|string|TargetNode) {
            let tn:TargetNode=(snode) ? this.asTargetNode(snode):this.root;
            if (!tn) {
                throw new Error(`rebuild() - cant find ${toStr(snode)}`);
            }
            this.rebuildInt(tn);
        }*/
        ConverterImpl.prototype.rebuildIntCo = function (tn, co, patch) {
            tn.component = co;
            if (co.getTN() != tn && tn.parent) {
                tn.parent.replaceChild(tn, co.getTN());
                tn = co.getTN();
            }
            this.invalidateInt(tn, patch);
        };
        ConverterImpl.prototype.rebuildInt = function (tn) {
            var _this = this;
            var patch = tn.getPatch(); // get the patch BEFORE we reset - otherwise position info may be lost
            tn.reset(); // resets the tn to prestine
            var co = this.makeCoElement(tn);
            if ((0, CoElement_1.isCoElement)(co)) {
                this.rebuildIntCo(tn, co, patch);
            }
            else {
                co.
                    then(function (co) {
                    _this.rebuildIntCo(tn, co, patch);
                });
            }
        };
        ConverterImpl.prototype.invalidate = function (toinvalidate, forget) {
            var _a = (toinvalidate) ? this.asTargetNode(toinvalidate) : { tn: this.root, snode: this.root.snode }, tn = _a.tn, snode = _a.snode;
            if (!tn) {
                throw new Error("invalidate() - cant find ".concat((0, Debug_1.toStr)(toinvalidate)));
            }
            this.invalidateInt(tn, undefined, forget);
        };
        ConverterImpl.prototype.isNonElementGenerating = function (tn) {
            // hack
            if (tn.snode.nodeType == Node.ELEMENT_NODE) {
                var tag = tn.snode.tagName.toLowerCase();
                if (tag == 'html' || tag == 'body')
                    return true;
            }
        };
        ConverterImpl.prototype.invalidateInt = function (tn, patch, forget) {
            var _this = this;
            if (forget && tn.component && tn.component.forget) {
                tn.component.forget();
                return; // do NOT call render() below - as the forget() should have called it, or will call it when it rebuilds state
            }
            if (this.invalidated.has(tn))
                return;
            try {
                this.invalidated.set(tn, forget);
                Promise.resolve()
                    .then(function () {
                    var forget = _this.invalidated.get(tn);
                    _this.invalidated.delete(tn);
                    //console.log(`-------repainting from ${toStr(tn)}------`);
                    //if ('ws-page-container.u-app-viewer-container.'==toStr(tn))
                    //    console.log('--------here---------');
                    // note we cannot render if
                    // 1. there is no Patch available (Cant patch back to the parent)
                    // 2. the coelement does not generate its own element (its children will write to a parent element that does not exist)
                    var origTN = tn;
                    if (!patch)
                        patch = tn.getPatch();
                    while (tn.parent && (!patch || _this.isNonElementGenerating(tn))) {
                        tn = tn.parent;
                        patch = tn.getPatch();
                    }
                    if (patch) {
                        //console.log(`     (actual= ${toStr(tn)})`)
                        var rm = Implementations_5.Implementations.createRender(patch);
                        _this.renderNode(rm, tn);
                    }
                    else {
                        console.warn("invalidateInt() - unable to repaint ".concat((0, Debug_1.toStr)(origTN), " because neither it nor an ancestor has a position."));
                    }
                })
                    .catch(function () {
                    _this.invalidated.delete(tn);
                });
            }
            catch (x) {
                this.invalidated.delete(tn);
            }
        };
        ConverterImpl.prototype.deserialize = function (val) {
            if (typeof val == 'string') {
                if (val.indexOf('{') >= 0) {
                    try {
                        return JSON.parse(val.replace(/'/g, '"'));
                    }
                    catch (e) {
                        return val;
                    }
                }
            }
            return val;
        };
        /**
         * Finds the source TargetNode that generated the target id or node 'idnode'
         *
         * @param nodeIdOrSelector The target node, or its 'data-coid' attribute id, or a selector.
         * @returns The found source target node or null if non found. To fetch the node, use `tn.snode`
         *
        public getSourceNode(nodeIdOrSelector:Node|string) : TargetNode {
            let id:string;
            if (nodeIdOrSelector && (typeof nodeIdOrSelector!='string')) {
                id=(nodeIdOrSelector as Element).getAttribute('data-coid');
            } else {
                // is it an id (number) ?
                let isnum = /^\d+$/.test(id);
                if (isnum) {
                    id=nodeIdOrSelector as string;
                }
                else { // its a selector
                    return this.getSourceNode(this.$(nodeIdOrSelector));
                }
            }
            return(this.findChild(this.root,(tn)=>tn.getId()==id))
        } */
        ConverterImpl.prototype.attachControl = function (parent, control) {
            var _a = this.asTargetNode(parent), tn = _a.tn, snode = _a.snode;
            if (!tn) {
                console.warn("Unable to attach control to node ".concat((0, Debug_1.toStr)(parent)));
                return;
            }
            else {
                var cvt = control.getCvt();
                if ((0, Attachable_3.isAttachable)(cvt)) {
                    this.addChild(cvt);
                }
                tn.attachControl(control);
                this.invalidateInt(tn);
            }
        };
        /**
         * Attach an asset's control to the target node.
         *
         * @param  parent The target dom node or query selector whose child the new control will become.
         * @param  toAttach The control or asset to attach.
         * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
         *
         * @return A promise when the control is loaded (if it was an asset) attached.
         */
        ConverterImpl.prototype.attach = function (parent, toAttach, parameters) {
            var _this = this;
            if ((0, CoElement_1.isCoElement)(toAttach)) {
                // its a control
                this.attachControl(parent, toAttach);
                return Promise.resolve(toAttach);
            }
            var asset = Implementations_5.Implementations.getAssetFactory()
                .get(toAttach);
            if (!(0, Asset_4.isCoElementAsset)(asset))
                throw new Error("attach: ".concat((0, Asset_4.stringifyAssetID)(toAttach), " is not a CoElementAsset"));
            return (asset
                .asCoElement(undefined, function (cvt) {
                cvt.addOnThisCreatedListener(function (This) {
                    This.parameters = parameters;
                });
            })
                .then(function (coElement) {
                _this.attachControl(parent, coElement);
                return coElement;
            }));
        };
        /**
         * Returns the TargetNode and control that was attached at toCheck
         *
         * @param toCheck
         * @returns
         */
        ConverterImpl.prototype.findAttached = function (toCheck) {
            var parent;
            var control;
            if ((0, CoElement_1.isCoElement)(toCheck)) {
                parent = this.find(this.root, function (tn) { return tn.isAttached(control = toCheck); });
            }
            else {
                var snode_2 = this.doc.querySelector(toCheck);
                if (snode_2) {
                    parent = this.find(this.root, function (tn) { return tn.matchSnode(function (snode2match) { return snode2match == snode_2; }); });
                }
            }
            return { targetnode: parent, control: control };
        };
        /**
         * Detaches a previously attached() control.
         *
         * @param toDetach The control that was attached, or the target node or query selector of the parent from which to attach all previously attached controls
         */
        ConverterImpl.prototype.detach = function (toDetach) {
            var _this = this;
            var _a = this.findAttached(toDetach), parent = _a.targetnode, control = _a.control;
            if (parent) {
                // find the attached
                if (control) {
                    parent.removeAttachedControl(control);
                    var cvt = control.getCvt();
                    if ((0, Attachable_3.isAttachable)(cvt)) {
                        this.removeChild(cvt);
                    }
                }
                else {
                    parent.removeAllAttachedControls(function (control) {
                        var cvt = control.getCvt();
                        if ((0, Attachable_3.isAttachable)(cvt)) {
                            _this.removeChild(cvt);
                        }
                    });
                }
                return Promise.resolve(this.invalidateInt(parent));
            }
        };
        /**
         * Adds the id of the source targetnode to the rendered object. Should be called
         * prior to rm.openEnd().
         *      * <p>
         * @param rm
         * @param tn
         * @returns
         */
        ConverterImpl.prototype.encodeWSE = function (rm, tn) {
            //rm.attr('data-coid',tn.getId());
            return rm;
        };
        /**
         * Render the children of node.
         *
         * @param rm
         * @param parenttn The parent treenode whose snode's children are to be rendered
         * @param iteration the repeat iteration (0 for first and incrementing for each successive repeat)
         */
        ConverterImpl.prototype.renderChildren = function (rm, parenttn, iteration) {
            if (iteration === void 0) { iteration = 0; }
            // render any attached (temp) components only on the first iteration:
            if (iteration == 0)
                parenttn.renderAttached(rm, this);
            var childNodes = parenttn.sourceChildNodes();
            for (var i = 0; i < childNodes.length; i++) {
                var cn = childNodes[i];
                if (cn.nodeType == Node.ELEMENT_NODE) {
                    var cindex = parenttn.findChildForNode(cn, iteration);
                    var ctn = void 0;
                    if (cindex == -1) {
                        // create a new one
                        ctn = parenttn.makeTargetNode(cn, this); // new TargetNode(cn,undefined,parenttn);
                        parenttn.addChild(ctn, iteration);
                    }
                    else {
                        ctn = parenttn.children[iteration][cindex];
                        ctn.marked = TargetNode_4.TNS.REUSED;
                    }
                    // parent heriarchy must be complete so during render a wselemnt can traverse to top - e.g. to add controls.
                    ctn.getOwner(this).renderNode(rm, ctn);
                }
                else if (cn.nodeType == Node.TEXT_NODE) {
                    rm.text(this.expandString(cn.nodeValue, parenttn));
                }
                else if (this.renderComments && cn.nodeType == Node.COMMENT_NODE) {
                    var content = cn.textContent;
                    //console.log(content);
                    if (content) {
                        rm.unsafeHtml("<!--".concat(content, "-->"));
                    }
                }
            }
        };
        /**
         * Adds a listener that will be called just before any element whose tag matches any entry in 'tags' renders the source tree.
         *
         * @param tags
         * @param listener
         */
        ConverterImpl.prototype.addOnElementRenderListener = function (tags, listener) {
            var e_8, _a;
            if (!this.elemenRenderListeners)
                this.elemenRenderListeners = new Map();
            try {
                for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                    var tag = tags_1_1.value;
                    var ners = this.elemenRenderListeners.get(tag);
                    if (!ners) {
                        ners = [];
                        this.elemenRenderListeners.set(tag, ners);
                    }
                    ners.push(listener);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        /**
         * Removes a previously added listener from the tags against which it was added.
         *
         * @param tags ws-element to triggerthe listener or '' for all
         * @param listener
         * @returns
         */
        ConverterImpl.prototype.removeOnElementRenderListener = function (tags, listener) {
            var e_9, _a;
            if (!this.elemenRenderListeners)
                return;
            try {
                for (var tags_2 = __values(tags), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
                    var tag = tags_2_1.value;
                    var ners = this.elemenRenderListeners.get(tag);
                    if (ners && ners.length > 0) {
                        var n = ners.indexOf(listener);
                        if (n != -1) {
                            ners.splice(n, 1);
                        }
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (tags_2_1 && !tags_2_1.done && (_a = tags_2.return)) _a.call(tags_2);
                }
                finally { if (e_9) throw e_9.error; }
            }
        };
        ConverterImpl.prototype.combine = function (a, b) {
            if (!a)
                return b;
            if (!b)
                return a;
            return a.concat(b);
        };
        ConverterImpl.prototype.triggerListeners = function (node, e) {
            var e_10, _a;
            if (!this.elemenRenderListeners || !this.elemenRenderListeners.size) {
                return;
            }
            if (node instanceof HTMLElement) {
                var tag = node.localName;
                var listeners0 = this.elemenRenderListeners.get(tag);
                var listeners1 = this.elemenRenderListeners.get('');
                var listeners = this.combine(listeners0, listeners1);
                if (listeners && listeners.length) {
                    try {
                        for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                            var listener = listeners_1_1.value;
                            listener(tag, e);
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                }
            }
        };
        ConverterImpl.prototype.dots = function (count) {
            var s = '';
            while (count-- > 0)
                s += '-';
            return s;
        };
        ConverterImpl.prototype.preRenderLog = function (tn) {
            console.log("D[".concat(this.assetId.name, "]").concat(this.dots(this.depth), "->S[").concat((0, Debug_1.toStr)(tn.snode), "] T[").concat((0, Debug_1.toStr)(tn.tnode), "]"));
        };
        ConverterImpl.prototype.postRenderLog = function (tn) {
            console.log("D[".concat(this.assetId.name, "]").concat(this.dots(this.depth), "-<S[").concat((0, Debug_1.toStr)(tn.snode), "] T[").concat((0, Debug_1.toStr)(tn.tnode), "]"));
        };
        ConverterImpl.prototype.renderNode = function (rm, tn) {
            /*if (tn==this.getRoot()) {
                console.log(`rendering root  ${toStr(tn.snode)} allcomp=${this.allCompleted.length}`);
                this.allCompleted=[];
            }*/
            tn.initMark();
            if (tn.component) {
                this.triggerListeners(tn.snode, tn.component);
                try {
                    //this.preRenderLog(tn);
                    this.depth++;
                    //if (toStr(tn)=='head')
                    //    debugger;
                    tn.render(rm);
                }
                catch (x) {
                    console.error("An exception occurred during rendering of ".concat((0, Debug_1.toStr)(tn)));
                    console.error(x);
                }
                finally {
                    this.depth--;
                    //this.postRenderLog(tn);
                }
                if (this.allCompleted && typeof tn.component.completed == 'function') {
                    this.allCompleted.push(tn.component.completed());
                }
            }
            tn.retireUnused();
        };
        ConverterImpl.prototype.addStylesToAttachment = function (attachment) {
            if (this.getDocument()) {
                attachment.addDependency(new Style_1.Style(this.getDocument(), this.assetId));
            }
        };
        ConverterImpl.prototype.removeStylesFromAttachment = function (attachment) {
            if (this.getDocument()) {
                attachment.removeDependency(new Style_1.Style(this.getDocument(), this.assetId));
            }
        };
        /**
         * Set the attachment on this converter - when it is attached to a node on the window.document
         *
         * @param attachment
         */
        ConverterImpl.prototype.setAttachment = function (attachment) {
            var _this = this;
            if (this.attachment) {
                this.removeStylesFromAttachment(this.attachment);
            }
            this.attachment = attachment;
            if (this.attachment)
                this.addStylesToAttachment(this.attachment);
            this.children.forEach(function (child) {
                child.setAttachment(_this.attachment);
            });
        };
        ConverterImpl.prototype.addChild = function (child) {
            this.children.push(child);
            child.setParent(this);
            child.setAttachment(this.attachment);
        };
        ConverterImpl.prototype.removeChild = function (child) {
            var index = this.children.indexOf(child);
            if (index >= 0) {
                child.setAttachment(null);
                this.children.splice(index, 1);
                child.setParent(null);
            }
        };
        ConverterImpl.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        ConverterImpl.prototype.getParent = function (parent) {
            return this.parent;
        };
        /**
         * Remove a state changer for this snode.
         *
         */
        ConverterImpl.prototype.removeStateChangers = function (snode) {
            if (this.changersBySnode) {
                this.changersBySnode.delete(snode);
                if (this.changersBySnode.size == 0)
                    this.changersBySnode = null;
            }
        };
        /**
         * Get StateChangers for this snode. if 'createIfNotExist' is true, then create if it doesnt exist
         *
         * @param snode
         * @param createIfNotExists
         */
        ConverterImpl.prototype.getStateChangers = function (snode, createIfNotExists) {
            if (!this.changersBySnode && createIfNotExists)
                this.changersBySnode = new Map();
            if (this.changersBySnode) {
                var sc = this.changersBySnode.get(snode);
                if (sc)
                    return sc;
                if (createIfNotExists) {
                    sc = {};
                    this.changersBySnode.set(snode, sc);
                    return sc;
                }
            }
        };
        /**
         * Set a Gets function on the snode. If no Get then all Gets are removed from the given snode.
         *
         * @param snode
         * @param get
         */
        ConverterImpl.prototype.setGets = function (snode, get) {
            if (get) {
                if (!this.gets) {
                    this.gets = new Map();
                }
                var arr = this.gets.get(snode);
                if (!arr) {
                    arr = [];
                    this.gets.set(snode, arr);
                }
                arr.push(get);
            }
            else {
                // delete
                if (this.gets) {
                    this.gets.delete(snode);
                }
            }
        };
        /**
         * Returns all currently set Get functions on this snode.
         *
         * @param snode
         */
        ConverterImpl.prototype.getGets = function (snode) {
            if (this.gets) {
                return this.gets.get(snode);
            }
        };
        return ConverterImpl;
    }());
    exports.ConverterImpl = ConverterImpl;
});
define("coml/impl/SingleTree", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleTree = void 0;
    /**
     * A tree structore of nodes whose virtial depth of nodes can be increased via the shiftDownBy() function.
     */
    var SingleTree = /** @class */ (function () {
        function SingleTree(r, parent) {
            if (parent)
                this.parent = parent;
            if (r) {
                this.n = r;
                for (var i = 0; i < r.childNodes.length; i++) {
                    if (!this.children)
                        this.children = [];
                    this.children.push(new SingleTree(r.childNodes[i], this));
                }
            }
        }
        /**
         * Increases the tree's depth down by 'count' by adding 'count' empty nodes between this node and its children.
         *
         * @param count
         */
        SingleTree.prototype.shiftDownBy = function (count) {
            var empty = new SingleTree(undefined, this);
            empty.children = this.children;
            this.children = [empty];
            empty.updateChildrensParents();
            count--;
            if (count > 0) {
                empty.shiftDownBy(count);
            }
        };
        SingleTree.prototype.updateChildrensParents = function () {
            var _this = this;
            if (this.children) {
                this.children.forEach(function (child) {
                    child.parent = _this;
                });
            }
        };
        /**
         * Finds the MergedNode that matches overlap.
         *
         * @param n
         * @returns
         */
        SingleTree.prototype.find = function (n) {
            if (n == this.n)
                return this;
            if (this.children) {
                for (var i = 0; i < this.children.length; i++) {
                    var f = this.children[i].find(n);
                    if (f)
                        return f;
                }
            }
        };
        SingleTree.prototype.plumb = function (depth) {
            if (!this.children || this.children.length == 0)
                return { deep: depth, node: this };
            var all = [];
            for (var i = 0; i < this.children.length; i++)
                all.push(this.children[i].plumb(depth + 1));
            if (all.length > 1) {
                all.sort(function (a, b) {
                    return b.deep - a.deep;
                });
            }
            return all[0];
        };
        SingleTree.prototype.deepest = function () {
            return this.plumb(0).node;
        };
        return SingleTree;
    }());
    exports.SingleTree = SingleTree;
});
define("coml/impl/MergedTree", ["require", "exports", "coml/impl/Debug"], function (require, exports, Debug_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergedTree = void 0;
    /**
     * A Tree that stores the result of a TreeMerge. Each object is a node in this tree
     * with the Html node of either the 0th (n0) or first (n1) stored, and children after mege stored in 'children'
     *
     */
    var MergedTree = /** @class */ (function () {
        function MergedTree(s0, s1) {
            this.n0 = s0.n;
            this.n1 = s1.n;
        }
        /**
         * Add a parent to ths node from the merging of c0,c1 and return it
         *
         * @param c0
         * @param c1
         */
        MergedTree.prototype.mergeParent = function (c0, c1) {
            var p = new MergedTree(c0, c1);
            p.children = [this];
            this.parent = p;
            return this.parent;
        };
        /**
         * Add any children of 'other' as children of this node only if those children are different
         * from this's existing children
         *
         * @param other
         */
        MergedTree.prototype.takeoverChildren = function (other) {
            if (other.children) {
                var toadd = [];
                for (var i = 0; i < other.children.length; i++) {
                    if (!this.findChild(other.children[i].n0, other.children[i].n1))
                        toadd.push(other.children[i]);
                }
                if (toadd.length) {
                    if (!this.children)
                        this.children = [];
                    for (var i = 0; i < toadd.length; i++) {
                        this.children.push(toadd[i]);
                        toadd[i].parent = this;
                    }
                }
            }
        };
        /**
         * find an immediate child containing both n1,n0
         *
         * @param n0
         * @param n1
         * @returns
         */
        MergedTree.prototype.findChild = function (n0, n1) {
            if (!this.children)
                return;
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].find(n0, n1, true))
                    return this.children[i];
            }
        };
        /**
         * Find immediate child that contains n as n0
         *
         * @param n
         * @returns
         */
        MergedTree.prototype.findChild0 = function (n, recurse) {
            if (!this.children)
                return;
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].n0 == n)
                    return this.children[i];
                else if (recurse) {
                    var f = this.children[i].findChild0(n, true);
                    if (f)
                        return f;
                }
            }
        };
        /**
         * Find immediate child that contains n as n0
         *
         * @param n
         * @returns
         */
        MergedTree.prototype.findChild1 = function (n, recurse) {
            if (!this.children)
                return;
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].n1 == n)
                    return this.children[i];
                else if (recurse) {
                    var f = this.children[i].findChild1(n, true);
                    if (f)
                        return f;
                }
            }
        };
        /**
         * Finds the MergedTree node down the tree that matches n0,n1.
         *
         * @param n
         * @returns
         */
        MergedTree.prototype.find = function (n0, n1, noChildren) {
            if (n0 == this.n0 && n1 == this.n1)
                return this;
            if (this.children && !noChildren) {
                for (var i = 0; i < this.children.length; i++) {
                    var f = this.children[i].find(n0, n1);
                    if (f)
                        return f;
                }
            }
        };
        /**
         * For debugging - prints the merged tree to the console.
         *
         * @param depth
         */
        MergedTree.prototype.print = function (depth) {
            if (depth === void 0) { depth = 0; }
            console.log("".concat((0, Debug_2.pad)(depth), " n0=").concat((0, Debug_2.toStr)(this.n0), " ++ n1=").concat((0, Debug_2.toStr)(this.n1)));
            if (this.children) {
                this.children.forEach(function (c) {
                    c.print(depth + 1);
                });
            }
        };
        return MergedTree;
    }());
    exports.MergedTree = MergedTree;
});
define("coml/impl/MergedTargetNode", ["require", "exports", "coml/CoElement", "coml/html/EventHandlers", "coml/impl/TargetNodeImpl"], function (require, exports, CoElement_2, EventHandlers_3, TargetNodeImpl_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergedTargetNode = void 0;
    /**
     * A target node that represents a merged node .
     * n0 represents one tree (the caller) and n1 represents the callee tree (the template)
     *
     *
     */
    var MergedTargetNode = /** @class */ (function (_super) {
        __extends(MergedTargetNode, _super);
        function MergedTargetNode(mnode, cvt0, cvt1) {
            var _this = _super.call(this, mnode.shadow ? mnode.n1 : mnode.n0 || mnode.n1, undefined, undefined) || this;
            _this.cvt0 = cvt0;
            _this.cvt1 = cvt1;
            _this.mnode = mnode;
            return _this;
        }
        MergedTargetNode.prototype.matchSnode = function (matcher) {
            if (_super.prototype.matchSnode.call(this, matcher))
                return true;
            return (this.mnode.n0 && matcher(this.mnode.n0)) || (this.mnode.n1 && matcher(this.mnode.n1));
        };
        MergedTargetNode.prototype.runStateChanges = function () {
            _super.prototype.runStateChanges.call(this);
            if (!this.mnode.shadow && this.mnode.n0 && this.mnode.n1 && this.tnode) {
                // Run state changers set by cvt1 on n1
                this.runStateChangeFor(this.cvt1, this.mnode.n1);
                // ensure n1's classes and attributes NOT set by n0 are copied to the tnode.
                // The classes from n0 will already have been copied during the normal expansion
                this.cvt1.copyAttrExceptToTNode(this.tnode, this.mnode.n1, this.getAttribsThatAreNotClassStyleOrEvent(this.mnode.n0));
            }
        };
        MergedTargetNode.prototype.getAttribsThatAreNotClassStyleOrEvent = function (elem) {
            var attrs = elem.attributes;
            var filtered = [];
            for (var i = 0; i < attrs.length; i++) {
                if (attrs[i].name != 'class' && // 
                    attrs[i].name != 'style' && // 
                    attrs[i].name != 'remove' &&
                    !EventHandlers_3.EventHandlers.isEventAttr(attrs[i].name)) { // 
                    filtered.push(attrs[i].name);
                }
            }
            return filtered;
        };
        /**
         * Override so we can attach event handlers from n1 (the template)
         *
         * Apply all attribute based event handlers (either 'onXXX' or 'co-onXXX') in snode to the
         * tnode as 'addEventListener('xxxx').
         */
        MergedTargetNode.prototype.attachEventHandlersFromAttributes = function () {
            _super.prototype.attachEventHandlersFromAttributes.call(this);
            if (this.tnode && this.mnode.n1) {
                var eh = new EventHandlers_3.EventHandlers(this.tnode, this);
                eh.addEventHandlersFromAttrsOf(this.mnode.n1, this.cvt1);
            }
        };
        /**
             * Given a child snode (as returned by sourceChildNodes()), create its TargetNode
             * with component
             *
             * The implementation will:
             *      1. use its owning Converter to create the CoElement for the new child.
             *      2. Create a new instance of a TargetNode as the child
             *      3. Add this CoElement to the child's 'component'
             *
             * @param snode
             * @returns
             */
        MergedTargetNode.prototype.makeTargetNode = function (snode, cvt) {
            var mchildren = this.getMergedChildren();
            var ctn;
            for (var i = 0; i < mchildren.length; i++) {
                var m = mchildren[i];
                if (m instanceof Node) {
                    if (m == snode) {
                        /*
                        if (snode.nodeType==Node.ELEMENT_NODE) {
                            let e:Element=snode as Element;
                            if (e.id=='p0') {
                               // debugger;
                               console.log('find p0');
                            }
                        }*/
                        ctn = new TargetNodeImpl_3.TargetNodeImpl(snode);
                        break;
                    }
                }
                else {
                    if (snode == m.n0 || snode == m.n1) {
                        ctn = new MergedTargetNode(m, this.cvt0, this.cvt1);
                        break;
                    }
                }
            }
            ctn.parent = this; // so if the constructor of the CoElement tries to access parent, it will work
            var co = ctn.getOwner(cvt).makeCoElement(ctn);
            if ((0, CoElement_2.isCoElement)(co)) {
                ctn.component = co;
            }
            else {
                co
                    .then(function (co) {
                    if (co.getTN() != ctn && ctn.parent) {
                        ctn.parent.replaceChild(ctn, co.getTN());
                        var octn = ctn;
                        ctn = co.getTN();
                        ctn.replaced = octn.snode;
                    }
                    co.getCvt().invalidate(ctn);
                });
            }
            return ctn;
        };
        /**
         * Return the Converter that 'owns' this TargetNode. This converter will be used
         * to render this TargetNode, and hence its 'This' will be use during rendering of the TargetNode.
         *
         * @param defaultOwner The default owner.
         * @returns The Converter to use to render this TargetNode
         */
        MergedTargetNode.prototype.getOwner = function (defaultOwner) {
            if (this.mnode.n0 && !this.mnode.shadow)
                return this.cvt0;
            return this.cvt1;
        };
        MergedTargetNode.prototype.makeMergedChildren = function () {
            var childs = [];
            if (this.mnode.n0 && !this.mnode.n1) {
                // only n0;
                for (var i = 0; i < this.mnode.n0.childNodes.length; i++) {
                    var cn = this.mnode.n0.childNodes[i];
                    var mn = this.mnode.findChild0(cn);
                    if (!mn && this.usedFurtherDown0(cn))
                        continue; // skip as this raw cn is used further down - because of tree stretching
                    childs.push(mn || cn);
                }
            }
            else if (this.mnode.n1 && !this.mnode.n0) {
                // only n0;
                for (var i = 0; i < this.mnode.n1.childNodes.length; i++) {
                    var cn = this.mnode.n1.childNodes[i];
                    var mn = this.mnode.findChild1(cn);
                    if (!mn && this.usedFurtherDown1(cn))
                        continue; // skip as this raw cn is used further down - because of tree stretching
                    childs.push(mn || cn);
                }
            }
            else {
                // both n0 and n1. use position to order
                var order_1 = new Map();
                for (var i = 0; i < this.mnode.n0.childNodes.length; i++) {
                    var cn = this.mnode.n0.childNodes[i];
                    var mn = this.mnode.findChild0(cn);
                    if (!mn && this.usedFurtherDown0(cn))
                        continue; // skip as this raw cn is used further down - because of tree stretching
                    var either = mn || cn;
                    childs.push(either);
                    order_1.set(either, i);
                }
                for (var i = 0; i < this.mnode.n1.childNodes.length; i++) {
                    var cn = this.mnode.n1.childNodes[i];
                    if (cn.nodeType == Node.TEXT_NODE)
                        continue;
                    var mn = this.mnode.findChild1(cn);
                    if (mn && mn.n0)
                        continue; // already counted above
                    if (!mn && this.usedFurtherDown1(cn))
                        continue; // skip as this raw cn is used further down - because of tree stretching
                    var either = mn || cn;
                    childs.push(either);
                    order_1.set(either, i + 0.2);
                }
                childs.sort(function (a, b) {
                    var ao = order_1.get(a);
                    var bo = order_1.get(b);
                    //return bo-ao;
                    return ao - bo;
                });
            }
            return childs;
        };
        /**
         * returns true if mnodes 0 children has a child equal to cn. Note we skip direct children of mnode
         * @param cn
         */
        MergedTargetNode.prototype.usedFurtherDown0 = function (cn) {
            if (!this.mnode.children)
                return;
            for (var i = 0; i < this.mnode.children.length; i++) {
                var f = this.mnode.children[i].findChild0(cn, true);
                if (f)
                    return true;
            }
        };
        MergedTargetNode.prototype.usedFurtherDown1 = function (cn) {
            if (!this.mnode.children)
                return;
            for (var i = 0; i < this.mnode.children.length; i++) {
                var f = this.mnode.children[i].findChild1(cn, true);
                if (f)
                    return true;
            }
        };
        MergedTargetNode.prototype.getMergedChildren = function () {
            if (!this.mchildren)
                this.mchildren = this.makeMergedChildren();
            return this.mchildren;
        };
        /**
         * Returns the html child Nodes of this TargetNode which should be used for creating
         * child TargetNodes.
         *
         * Our children are children of n0 intersected with children of n1. The intersecting members
         * are those that have both n0 and n1.
         *
         * @returns
         */
        MergedTargetNode.prototype.sourceChildNodes = function () {
            var children = [];
            var mchildren = this.getMergedChildren();
            for (var i = 0; i < mchildren.length; i++) {
                var mn = mchildren[i];
                if (mn instanceof Node) {
                    children.push(mn);
                }
                else if (!mn.shadow) {
                    /* deleted - cant change cached snodes. DO the mrge using statechangers
                    if (mn.n0 && mn.n1) {
                        let mnode=mn;
                        this.cvt0.unwatchedSnodeChange(mn.n0,()=>{
                            this.addClassesFrom(mnode.n0,mnode.n1 as Element);
                        });
                    } */
                    children.push(mn.n0 || mn.n1);
                }
                else {
                    children.push(mn.n1);
                }
            }
            return children;
        };
        return MergedTargetNode;
    }(TargetNodeImpl_3.TargetNodeImpl));
    exports.MergedTargetNode = MergedTargetNode;
});
define("coml/impl/TreeMerge", ["require", "exports", "coml/Asset", "coml/Implementations", "coml/impl/MergedTree", "coml/impl/SingleTree"], function (require, exports, Asset_5, Implementations_6, MergedTree_1, SingleTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tests = exports.TreeMerge = void 0;
    /**
     * Merges two DOM trees from a single staring node in each (root1 and root2). the merge is
     * performed based on nodes that overlap between r1 and r2.
     *
     * The rules:
     *
     * 1. if two nodes overlap, then the node from r1 replaces the one from r2.
     *    The children of r2 are then merged with the children of r1 (become also children of r1)
     * 2. the root nodes, r1 and r2, are deemed to overlap.
     * 3. All other overlaps are supplied in a map 'overlaps' - which contain the nodes of r2 that overlap with r1. (key is r1 node, value is r2 node)
     * 4. We define a depth for each node as: "the level below the root". For example, the depth of a root node is 0. Nodes 1 level deep are 1 etc.
     * 5. The merge works between the starting overlapped nodes r1 and r2, and the ending overlaps given in 'overlaps'. So we have
     *    two sets of nodes of the same size: e1 (end nodes 1) which are descendents of r1, and e2 (of r2).
     * 6. The maxdepth(rX) is defined as the maximum depth of any node of eX.
     * 7. The merge works by creating a virtual depth for each node in each tree. The virtual depth is the depth of nodes from the
     *     other tree to which this node will be mapped to during merge.
     * 8. If maxdepth(r1) == maxdepth(r2), then the virtual depth for all nodes of r1 and r2 are the same as their real depths.
     * 9  Otherwise, the tree with the lesser maxdepth is adjusted by 'bottom aligning' all its nodes other than the root, to the
     *    other tree. The root node is kept at the same level (0), for all children, adjust their virtualdepth downwards introducing
     *    empty layers. Example:
     ```text
    -- Bottom alignig example:
     For the folowing trees, overlap is [Xb1=>Yd2], [Xc1=>Ye2]
    REAL DEPTH:
     0   Xa0                 Ya0
     1  Xb1 Xc1             Yb1 Yc1
     2                   Yd2 Ye2
    
       As X is shorter, so its level 2 is bottom aligned:
    VIRTUAL DEPTH
     0   Xa0
     1   [empty]
     2  Xb1[=Yd2] Xc1[=Ye2]
     ```
     * 10. The merge begins from each member of e1 and traverses up the tree:
           A1. Equalize tree depths at overlaps, e.g. insert empty nodes at the top of the smaller tree. If the difference in real depth of all members of e1 and their overlapping e2, is not the same, then the tree merge
               fails with an 'inconsistent merge depth' error.
           A. Set currnode = e1. overlapnode= overlap(e1), (Depth of both is the same because of A1)
           B. Generate c1 = MergeNode(currnode,overlapnode,mode). (mode = 'keep children of currnode','keep children of both')
           C. Set currnode =  parent of currnode, overlappnode = parent of overlappnode.
           D. Repeat from c until currnode = r1. and overlappnode=r2
        At this point the merge root has all the leafs originating from the overlaps, but lacks other leafs of r1,r2
    
     *
     * 11. Find all leafs of r1 that are NOT descendents of overlaps. For each find its nearest ancestor that is already
     *    in the merge root from (10). Join the merge root's tree at that point.
     *
     * 12. Repeat for r2.
     *
     *
     */
    var TreeMerge = /** @class */ (function () {
        function TreeMerge(r0, r0isShadow, r1, overlaps) {
            this.r0 = r0;
            this.r0isShadow = r0isShadow;
            this.r1 = r1;
            this.overlaps = overlaps;
        }
        /**
         * Returns the depth of e to its ancestor r.
         *
         * @param r
         * @param e
         * @returns
         */
        TreeMerge.prototype.depth = function (r, e) {
            var cdepth = 0;
            while (e && e != r) {
                cdepth++;
                e = e.parentNode;
            }
            return cdepth;
        };
        TreeMerge.prototype.merge = function () {
            var _this = this;
            var t0 = new SingleTree_1.SingleTree(this.r0);
            var t1 = new SingleTree_1.SingleTree(this.r1);
            if (!this.overlaps || this.overlaps.length == 0) {
                // create a default overlap by taking the deepest member of each tree:
                this.overlaps = [{
                        n0: t0.deepest().n,
                        n1: t1.deepest().n
                    }];
            }
            // 10 A1. equalize depth by adding extra empty nodes if needed:
            var first = true;
            var ldepth0;
            var ldepth1;
            this.overlaps.forEach(function (ov) {
                var depth0 = _this.depth(_this.r0, ov.n0);
                var depth1 = _this.depth(_this.r1, ov.n1);
                if (first) {
                    if (depth0 < depth1) {
                        t0.shiftDownBy(depth1 - depth0);
                    }
                    else if (depth1 < depth0) {
                        t1.shiftDownBy(depth0 - depth1);
                    }
                    ldepth0 = depth0;
                    ldepth1 = depth1;
                    first = false;
                }
                else if (ldepth0 - ldepth1 != depth0 - depth1) {
                    throw new Error("Inconsistent merge depth, last=".concat(ldepth0 - ldepth1, " now=").concat(depth0 - depth1));
                }
            });
            return this.mergeUp(t0, t1);
        };
        /**
         * Merges equalized depth trees t0,t1 into a MergedNode
         *
         * @param t0
         * @param t1
         * @returns
         */
        TreeMerge.prototype.mergeUp = function (t0, t1) {
            var mergeRoot;
            var counter = 0;
            this.overlaps.forEach(function (ov) {
                /*
                    Step 10:
                    A. Set currnode = e1. overlapnode= overlap(e1), (Depth of both is the same because of A1)
                    B. Generate c1 = MergeNode(currnode,overlapnode,mode). (mode = 'keep children of currnode','keep children of both')
                    C. Set currnode =  parent of currnode, overlappnode = parent of overlappnode.
                    D. Repeat from c until currnode = r1. and overlappnode=r2
                */
                var currnode0 = t0.find(ov.n0);
                var currnode1 = t1.find(ov.n1);
                var merged = new MergedTree_1.MergedTree(currnode0, currnode1);
                while (currnode0 != t0 && currnode1 != t1) {
                    currnode0 = currnode0.parent;
                    currnode1 = currnode1.parent;
                    merged = merged.mergeParent(currnode0, currnode1);
                    if (mergeRoot) {
                        var existing = mergeRoot.find(merged.n0, merged.n1);
                        if (existing) {
                            existing.takeoverChildren(merged);
                            break; // joined to the existing root's heirarchy so done for this run.
                        }
                    }
                }
                if (!mergeRoot) // first run
                    mergeRoot = merged;
                else if (counter > 0 && (currnode0 == t0 && currnode1 == t1)) {
                    console.error("MERGE- Finished overlap merge #".concat(counter, " without joining to the existing root."));
                }
                counter++;
            });
            /* 11. Find all leafs of r0 that are NOT descendents of overlaps. For each find its nearest ancestor that is already
                in the merge root from (10). Join the merge root's tree at that point. */
            /* NO NEED< as this can be done 'on the fly' during child TargetNode generation
            let ovset:Set<Node>=new Set();
            this.overlaps.forEach((ov)=>{
                ovset.add(ov.n0);
            })
            let leafs:Node[]=t0.leafsExceptIn(ovset);
        
            leafs.forEach((leaf)=>{
                let currnode:Node=leaf;
        
                while(currnode!=t0.n) {
                    currnode=currnode.parentNode;
        
                    let existing=mergeRoot.find0(currnode);
                    if (existing) {
                        existing.takeoverChildren(merged);
                        break; // joined to the existing root's heirarchy so done for this run.
                    }
                    
                }
            }) */
            if (this.r0isShadow)
                mergeRoot.shadow = true;
            return mergeRoot;
        };
        return TreeMerge;
    }());
    exports.TreeMerge = TreeMerge;
    var Tests = /** @class */ (function () {
        function Tests() {
        }
        Tests.prototype.test1 = function () {
            var assA = Implementations_6.Implementations.getAssetFactory().get({ name: 'A.html', type: Asset_5.AssetType.page });
            var assB = Implementations_6.Implementations.getAssetFactory().get({ name: 'B.html', type: Asset_5.AssetType.page });
            var all = [];
            all.push(assA.getDocument());
            all.push(assB.getDocument());
            Promise.all(all)
                .then(function (docs) {
                var r0 = docs[0].querySelector('#roota');
                var r1 = docs[1].querySelector('#rootb');
                var overlaps = [
                // {n0:docs[0].querySelector('#a1'),n1:docs[1].querySelector('#b1')},
                // {n0:docs[0].querySelector('#a2'),n1:docs[1].querySelector('#b2')}
                ];
                var tm = new TreeMerge(r0, false, r1, overlaps);
                var t = tm.merge();
                console.log(t);
            });
        };
        return Tests;
    }());
    exports.Tests = Tests;
});
define("coml/impl/BeforeMergeTargetNode", ["require", "exports", "coml/CoElement", "coml/impl/MergedTargetNode", "coml/impl/TargetNodeImpl", "coml/impl/TreeMerge", "coml/html/EventHandlers"], function (require, exports, CoElement_3, MergedTargetNode_1, TargetNodeImpl_4, TreeMerge_1, EventHandlers_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BeforeMergeTargetNode = void 0;
    /**
     * A target node from the start of the template document's tree, as inserted into the caller's TargetTree
     *
     * Keeps on delivering the template doc's nodes until the 'insertion-root' node
     * is reached, whereupon switches to the MergedTargetNode
     */
    var BeforeMergeTargetNode = /** @class */ (function (_super) {
        __extends(BeforeMergeTargetNode, _super);
        /**
         *
         * @param snode The snode to use before the merge point (from the template or callee)
         * @param parent
         * @param cvt0 The caller's cvt
         * @param cvt1 The callee's cvt
         * @param replaced The caller's replaced snode.
         */
        function BeforeMergeTargetNode(snode, parent, cvt0, cvt1, replaced) {
            var _this = _super.call(this, snode, undefined, parent) || this;
            _this.cvt0 = cvt0;
            _this.cvt1 = cvt1;
            _this.replacedNode = replaced;
            if (_this.replaceChild) {
                //this.copyEventHandlersFrom
            }
            return _this;
        }
        /**
         * Returns the converters - if zero, then cvt0 (Caller), else cvt1 (callee)
         *
         * @param zero
         * @returns
         */
        BeforeMergeTargetNode.prototype.getCvt = function (zero) {
            var c = this;
            if (zero) {
                while (!c.cvt0)
                    c = c.parent;
                return c.cvt0;
            }
            else {
                while (!c.cvt1)
                    c = c.parent;
                return c.cvt1;
            }
        };
        /**
         * Returns the node in caller that was replaced by the template. EG, in the following, it will be the <co-foo> ELement
         * ```
         * this.import({name:'foo.html'},'co-foo');
         *
         * <body>
         *    <co-foo>
         *        <div>Bar</div>
         *    </co-foo>
         * </body>
         *
         * ```
         *
         *
         * @returns
         */
        BeforeMergeTargetNode.prototype.getReplacedNode = function () {
            var c = this;
            while (!c.replacedNode)
                c = c.parent;
            return c.replacedNode;
        };
        /**
         * Given a child snode (as returned by sourceChildNodes()), create its TargetNode
         * with component
         *
         * The implementation will:
         *      1. use its owning Converter to create the CoElement for the new child.
         *      2. Create a new instance of a TargetNode as the child
         *      3. Add this CoElement to the child's 'component'
         *
         * @param snode
         * @returns
         */
        BeforeMergeTargetNode.prototype.makeTargetNode = function (snode, cvt) {
            var ctn;
            if (snode.nodeType == Node.ELEMENT_NODE) {
                var e = snode;
                var iroot = e.getAttribute('insertion-root');
                if (iroot) {
                    var overlaps = this.makeOverlaps();
                    var _a = this.getCallerRoot(), callerRoot = _a.callerRoot, shadow = _a.shadow; // (this.getReplacedNode() as Element).firstElementChild;
                    var treem = new TreeMerge_1.TreeMerge(callerRoot, shadow, e, overlaps);
                    var mt = treem.merge();
                    //console.log('======================================');
                    //mt.print();
                    ctn = new MergedTargetNode_1.MergedTargetNode(mt, this.getCvt(true), this.getCvt(false));
                }
            }
            if (!ctn)
                ctn = new BeforeMergeTargetNode(snode, this);
            ctn.parent = this; // so if the constructor of the CoElement tries to access parent, it will work
            var co = ctn.getOwner(cvt).makeCoElement(ctn);
            if ((0, CoElement_3.isCoElement)(co)) {
                ctn.component = co;
            }
            else {
                co
                    .then(function (co) {
                    if (co.getTN() != ctn && ctn.parent) {
                        ctn.parent.replaceChild(ctn, co.getTN());
                        var octn = ctn;
                        ctn = co.getTN();
                        ctn.replaced = octn.snode;
                    }
                    co.getCvt().invalidate(ctn);
                });
            }
            return ctn;
        };
        /**
         * Returns the node from the Caller that should be mapped to the temlplate's insertion-root node during merge.
         * 'shadow' is true if there is no declared root attribute within the replaced node. In this case
         * the calleer root is the replaced element itself.
         */
        BeforeMergeTargetNode.prototype.getCallerRoot = function () {
            var ret = {
                callerRoot: null,
                shadow: false
            };
            var top = this.getReplacedNode();
            var root = top.querySelector('[root]');
            ret.callerRoot = root || top;
            ret.shadow = !root;
            return ret;
        };
        BeforeMergeTargetNode.prototype.makeOverlaps = function () {
            var overlaps = [];
            var holes = this.getCvt(false).getDocument().querySelectorAll('[hole]');
            if (holes.length == 0)
                return null;
            var plugs;
            var _loop_1 = function (i) {
                var hole = holes[i];
                var holeid = hole.getAttribute('hole');
                if (holeid) {
                    if (!plugs) {
                        plugs = this_1.makePlugsMap();
                        if (!plugs)
                            return { value: null };
                    }
                    var plug = plugs.get(holeid);
                    if (plug) {
                        plug.forEach(function (pl) {
                            overlaps.push({ n0: pl, n1: hole });
                        });
                    }
                }
            };
            var this_1 = this;
            for (var i = 0; i < holes.length; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return overlaps;
        };
        BeforeMergeTargetNode.prototype.makePlugsMap = function () {
            var sid = this.getCallerRoot().callerRoot.getAttribute('sid');
            return this.makePlugsFromNode(this.getCallerRoot().callerRoot, sid, null, true);
        };
        BeforeMergeTargetNode.prototype.makePlugsFromNode = function (node, sid, map, ignorenode) {
            if (node.nodeType == Node.ELEMENT_NODE) {
                if (!ignorenode) {
                    var plughole = node.getAttribute('plughole');
                    if (plughole) {
                        if (sid) {
                            if (plughole.startsWith(sid + '.')) {
                                plughole = plughole.substring(sid.length + 1);
                            }
                            else {
                                // doesnt match ours - abort
                                plughole = null;
                            }
                        }
                        else if (plughole.indexOf('.') >= 0) {
                            // no sid in the callerRoot, but the plughule has a . so no match
                            plughole = null;
                        }
                        if (plughole) {
                            if (!map)
                                map = new Map();
                            var all = map.get(plughole);
                            if (!all)
                                map.set(plughole, all = []);
                            all.push(node);
                        }
                    }
                }
                // handle children
                for (var i = 0; i < node.childNodes.length; i++) {
                    map = this.makePlugsFromNode(node.childNodes[i], sid, map);
                }
            }
            return map;
        };
        /**
         * Apply all attribute based event handlers (either 'onXXX' or 'co-onXXX') in snode to the
         * tnode as 'addEventListener('xxxx').
         *
         * Override so that if we are the top level and have 'replaced', we can install the replaced elements
         * event handlers using cvt0, then add any
         */
        BeforeMergeTargetNode.prototype.attachEventHandlersFromAttributes = function () {
            if (!this.replacedNode) {
                _super.prototype.attachEventHandlersFromAttributes.call(this);
                return;
            }
            // merge the event handlers. first apply the ones from replaced. then from 2 
            if (this.tnode && this.snode && this.component) {
                var eh = new EventHandlers_4.EventHandlers(this.tnode, this);
                eh.addEventHandlersFromAttrsOf(this.snode, this.component.getCvt());
                eh.addEventHandlersFromAttrsOf(this.replacedNode, this.cvt0);
            }
        };
        /**
         * Override so we can cover the replacedNode.
         *
         * @param matcher
         * @returns
         */
        BeforeMergeTargetNode.prototype.matchSnode = function (matcher) {
            return _super.prototype.matchSnode.call(this, matcher) || (this.replacedNode && this.replacedNode != this.replaced && matcher(this.replacedNode));
        };
        BeforeMergeTargetNode.prototype.runGetsForAllCvts = function (snode) {
            if (this.cvt0)
                this.runGetsForCvt(this.cvt0, snode);
            if (this.cvt1)
                this.runGetsForCvt(this.cvt1, snode);
        };
        return BeforeMergeTargetNode;
    }(TargetNodeImpl_4.TargetNodeImpl));
    exports.BeforeMergeTargetNode = BeforeMergeTargetNode;
});
define("coml/impl/BaseThis", ["require", "exports", "coml/TargetNode", "coml/Implementations", "coml/impl/BeforeMergeTargetNode"], function (require, exports, TargetNode_5, Implementations_7, BeforeMergeTargetNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The base implementation of the This interface.
     * By default this class is used to implement `this` for a coml page.
     *
     * You can override this by subclassing this class, adding page functionality to it, and
     * setting it inside a page by use of the <meta name="thisclass" content="path/ToYourClass"> tag in the
     * <head> of the coml html page.
     */
    var BaseThis = /** @class */ (function () {
        function BaseThis(cvt, stateFrom, fnGetAttr) {
            this.fnGetAttr = fnGetAttr;
            this.cvt = cvt;
            this.cvt.getRoot().component = this; // so the top 'document' element is rendered by us
            this.document = cvt.getDocument();
            if (stateFrom) {
                // copy state already initialized in the original object
            }
        }
        BaseThis.prototype.castToType = function (value, type) {
            // convert
            if (typeof type == 'number')
                return Number.parseFloat(value);
            if (typeof type == 'boolean')
                return (value.trim().toLowerCase() == 'true');
            return value;
        };
        BaseThis.prototype.getAttrInt = function (attr, defvalue) {
            if (this.fnGetAttr) {
                var value = this.fnGetAttr(attr);
                if (!value)
                    return defvalue;
                return this.castToType(value, defvalue);
            }
            return (0, TargetNode_5.getAttr)(this.cvt, this.getTN().snode, attr, defvalue, this.getTN());
        };
        /**
         * Finds this element's 0 based iteration in its parent with the tag 'parentTag'
         * The last passed currtn to expandString will be used.
         *
         * @param parentTag
         * @returns iteration number;
         */
        BaseThis.prototype.iter = function (parentTag) {
            var currtn = this.__currtn; // see ConverterImpl.expandString();
            if (!currtn)
                currtn = this.getTN();
            var pi = this.getCvt().findParentAndIteration(currtn, function (tn) {
                return tn.snode.tagName.toLowerCase() == parentTag;
            });
            return (pi ? pi.iteration : 0);
        };
        BaseThis.prototype.attr = function (attr, defvalue) {
            if (this['parameters'] && attr in this['parameters']) {
                var rawv = this['parameters'][attr];
                if (typeof rawv != 'undefined') {
                    if (typeof rawv == typeof defvalue)
                        return rawv;
                    return this.castToType('' + rawv, defvalue);
                }
            }
            return this.getAttrInt(attr, defvalue);
        };
        /**
         * Returns the text content of this ELement, after evaluating any ${} expressions.
         */
        BaseThis.prototype.content = function () {
            return this.getCvt().expandString(this.getTN().snode.textContent, this.getTN());
        };
        /**
         * Returns the parameter block as set by any parent Component for us
         */
        BaseThis.prototype.params = function () {
            return this.parameters;
        };
        BaseThis.prototype.getId = function () {
            if (!this.uid) {
                this.uid = 'this' + Math.floor(Math.random() * 1000000000);
            }
            return this.uid;
        };
        BaseThis.prototype.assetId = function () {
            return this.cvt.getAssetId();
        };
        /**
         * Import a COML factory.
         *
         * @param importee The fully qualified path to a COML CoElementFactory (e.g. `coml/element/CoFields`) or the assetId of a COML page.
         * @param tagForAsset optional, required only if importee is an assetId. The tag to use for this asset's CoElement
         */
        BaseThis.prototype.import = function (importee, tagForAsset) {
            return this.cvt.import(importee, tagForAsset);
        };
        BaseThis.prototype.onAfterRender = function (cb) {
            this.cvt.addOnAfterRenderListener(cb);
        };
        BaseThis.prototype.getSourceDocument = function () {
            return this.cvt.getDocument();
        };
        BaseThis.prototype.invalidate = function (node, forget) {
            if (!node)
                node = this.getTN();
            this.cvt.invalidate(node, forget);
        };
        BaseThis.prototype.get = function (node, getfunc) {
            return this.cvt.get(node, getfunc);
        };
        /**
            * Returns the generated target node (tnode) for the given parameter. Optionally lets the caller specify a 'state changer'
            * callback that will be called to effect changes of state to the tnode. The state changer is stored so that
            * the changes are recreated on every repaint of the tnode.
            *
            * @param node an snode, TargetNode or source document selector.
            * @param changeid (Optional but required if changer is specified) a unique id of the change (If the change is readded with the same id, it will replace the earlier change)
            * @param changer (Optional) The callback to effect changes, that will be called when the tnode is available. If currently available, the callback will be called immediately. The callback will also be called on any subsequent repaint of the tnode.
            */
        BaseThis.prototype.$ = function (node, changeid, changer) {
            if (!node)
                node = this.getTN();
            return this.cvt.$(node, changeid, changer);
        };
        /**
         * Attach an asset's control to the target node.
         *
         * @param  parent The target dom node or query selector whose child the new control will become.
         * @param  toAttach The control or asset to attach.
         * @param  parameters (Optional), if 'toAttach' was an asset, then optional parameters to pass to te asset. This object is available to the asset as 'this.parameters'
         *
         * @return A promise that resolves with the control.
         */
        BaseThis.prototype.attach = function (parent, toAttach, parameters) {
            return this.cvt.attach(parent, toAttach, parameters);
        };
        /**
        * Detaches a previously attached() control.
        *
        * @param toDetach The control that was attached, or the target node or query selector of the parent from which to attach all previously attached controls
        */
        BaseThis.prototype.detach = function (toDetach) {
            return this.cvt.detach(toDetach);
        };
        BaseThis.prototype.ajax = function (callName, jsonToSend, cache, responseDataType) {
            return Implementations_7.Implementations.getAjax().ajax(callName, jsonToSend, cache, responseDataType);
        };
        BaseThis.prototype.assets = function () {
            return Implementations_7.Implementations.getAssetFactory();
        };
        /**
         * Dispatch a DOM synthetic event on the root node of this object.
         * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
         *
         * @param eventname
         * @param detail
         */
        BaseThis.prototype.dispatchEvent = function (eventname, detail, options) {
            return this.getTN().dispatchEvent(eventname, detail, options);
        };
        /************************
         * implement CoElement
         ************************/
        /**
         * Return this component's converter.
         */
        BaseThis.prototype.getCvt = function () {
            return this.cvt;
        };
        /**
         * Return this converter's TargetNode
         */
        BaseThis.prototype.getTN = function () {
            var n = this.getCvt().getRoot();
            if (!n.component) {
                n.component = this;
            }
            return n;
        };
        BaseThis.prototype.templatize = function (caller, replaced) {
            var templateTN = new BeforeMergeTargetNode_1.BeforeMergeTargetNode(this.getCvt().getDocument().body, undefined, caller, this.getCvt(), replaced);
            this.getCvt().replaceRoot(templateTN);
        };
        /**
         * Override if you need to be called on onAfterRendering(). ref is this control's domref
         *
         * @param ref
         */
        BaseThis.prototype.onPostRender = function (node) {
            var _this = this;
            if (this.getCvt()) {
                Promise.resolve()
                    .then(function () {
                    _this.getCvt().onAfterRender();
                });
            }
        };
        /**
         * Override if you need to be called on before rendering starts.
         * @param ref
         */
        BaseThis.prototype.onPreRender = function () {
        };
        BaseThis.prototype.onRender = function (rm) {
            var _a = (0, TargetNode_5.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            var elem = tn.snode;
            var elem2 = (tn instanceof BeforeMergeTargetNode_1.BeforeMergeTargetNode) ? tn.getReplacedNode() : null;
            rm.openStart('div', this)
                .class('u-document');
            cvt.copyAttrExcept(rm, elem, [], tn);
            if (elem2)
                cvt.copyAttrExcept(rm, elem2, [], tn);
            rm.openEnd();
            cvt.renderChildren(rm, tn);
            rm.close('div');
        };
        return BaseThis;
    }());
    exports.default = BaseThis;
});
define("coml/Implementations", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Implementations = void 0;
    /**
     * A singleton from which all implementations of interfaces can be fetched.
     *
     */
    var Implementations = /** @class */ (function () {
        function Implementations() {
            Implementations.imp = this;
        }
        /**
         * Return the current Ajax implementaion.
         *
         * @returns
         */
        Implementations.getAjax = function () {
            return Implementations.imp.getAjaxImpl();
        };
        /**
         * Return the current AssetFactory implementaion.
         *
         * @returns
         */
        Implementations.getAssetFactory = function () {
            return Implementations.imp.getAssetFactoryImpl();
        };
        /**
         * Create a new instance of a ComlConverter.
         *
         * @returns
         */
        Implementations.createConverter = function (copyStateFrom) {
            return Implementations.imp.createConverterImpl(copyStateFrom);
        };
        /**
         * Create a new instance of a Render.
         *
         * @returns
         */
        Implementations.createRender = function (pos) {
            return Implementations.imp.createRenderImpl(pos);
        };
        /**
        * Create a new instance of an ATtachment.
        *
        * @returns
        */
        Implementations.createAttachment = function () {
            return Implementations.imp.createAttachmentImpl();
        };
        /**
         * Create a new instance of a This object for the given Converter.
         *
         * @param cvt
         * @returns
         */
        Implementations.createThis = function (cvt, fnGetAttr) {
            return Implementations.imp.createThisImpl(cvt, fnGetAttr);
        };
        return Implementations;
    }());
    exports.Implementations = Implementations;
});
define("coml/impl/TargetNodeImpl", ["require", "exports", "coml/CoElement", "coml/Repaint", "coml/TargetNode", "coml/impl/Debug", "coml/html/EventHandlers"], function (require, exports, CoElement_4, Repaint_1, TargetNode_6, Debug_3, EventHandlers_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TargetNodeImpl = void 0;
    /**
     * TargetNode stores the state of the conversion between a Source node (snode) in the COML html file
     * and the rendered final Node (target node or tnode).
     *
     *
     */
    var TargetNodeImpl = /** @class */ (function () {
        function TargetNodeImpl(snode, wselement, parent) {
            this.children = [];
            this.snode = snode;
            this.component = wselement;
            this.parent = parent;
        }
        /**
         * Given a child snode (as returned by sourceChildNodes()), create its TargetNode
         * with component
         *
         * The implementation will:
         *      1. use its owning Converter to create the CoElement for the new child.
         *      2. Create a new instance of a TargetNode as the child
         *      3. Add this CoElement to the child's 'component'
         *
         * @param snode
         * @returns
         */
        TargetNodeImpl.prototype.makeTargetNode = function (snode, cvt) {
            var ctn = new TargetNodeImpl(snode);
            ctn.parent = this; // so if the constructor of the CoElement tries to access parent, it will work
            var co = ctn.getOwner(cvt).makeCoElement(ctn);
            if ((0, CoElement_4.isCoElement)(co)) {
                ctn.component = co;
            }
            else {
                co
                    .then(function (co) {
                    if (co.getTN() != ctn && ctn.parent) {
                        ctn.parent.replaceChild(ctn, co.getTN());
                        var octn = ctn;
                        ctn = co.getTN();
                        ctn.replaced = octn.snode;
                    }
                    co.getCvt().invalidate(ctn);
                });
            }
            return ctn;
        };
        /**
         * Return the Converter that 'owns' this TargetNode. This converter will be used
         * to render this TargetNode, and hence its 'This' will be use during rendering of the TargetNode.
         *
         * @param defaultOwner The default owner.
         * @returns
         */
        TargetNodeImpl.prototype.getOwner = function (defaultOwner) {
            return defaultOwner;
        };
        TargetNodeImpl.prototype.getId = function () {
            if (!this.id) {
                this.id = '' + Math.floor(Math.random() * 1000000000);
            }
            return this.id;
        };
        /**
         * Returns the html child Nodes of this TargetNode which should be used for creating
         * child TargetNodes.
         *
         * During templating, the actual nodes returned may be different from the true children of this.snode
         *
         * @returns
         */
        TargetNodeImpl.prototype.sourceChildNodes = function () {
            //if (this.sourceChildNodesSupplyer)
            //   return this.sourceChildNodesSupplyer(this);
            return this.snode.childNodes;
        };
        /**
         * returns all target nodes generated by this source node.
         *
         * @returns
         */
        TargetNodeImpl.prototype.getGeneratedNodes = function () {
            if (!this.id)
                return;
            var al = document.querySelectorAll("[data-coid=\"".concat(this.id, "\"]"));
            if (al) {
                var ns_1;
                al.forEach(function (el) {
                    if (!ns_1)
                        ns_1 = [];
                    ns_1.push(el);
                });
                return ns_1;
            }
        };
        /**
         * Adds a  child target node as a child to this target node, for the iteration.
         *
         * @param tn
         * @param iteration
         */
        TargetNodeImpl.prototype.addChild = function (tn, iteration) {
            tn.parent = this;
            if (this.children.length < iteration + 1) {
                for (var i = this.children.length; i < iteration + 1; i++) {
                    this.children.push([]);
                }
            }
            this.children[iteration].push(tn);
            tn.marked = TargetNode_6.TNS.ADDED;
        };
        /**
         * Replace the child 'tn' with the replacement 'rtn'
         *
         * @param tn
         * @param rtn
         */
        TargetNodeImpl.prototype.replaceChild = function (tn, rtn) {
            tn.parent = this;
            for (var i = 0; i < this.children.length; i++) {
                var c = this.children[i];
                for (var j = 0; j < c.length; j++) {
                    if (c[j] == tn) {
                        c[j] = rtn;
                        rtn.parent = this;
                    }
                }
            }
        };
        /**
         * Remove this target node from the render tree, and all its children.
         */
        TargetNodeImpl.prototype.remove = function (dontNullParent) {
            this.removeAllChildren();
            if (!dontNullParent)
                this.parent = undefined;
            if (this.component && this.component.cleanup)
                this.component.cleanup();
            this.component = undefined;
            //this.sourceChildNodesSupplyer=undefined;
            //this.targetNodeMaker=undefined;
            if (this.replaced)
                this.snode = this.replaced;
        };
        /**
         * Remove all children from this target node.
         */
        TargetNodeImpl.prototype.removeAllChildren = function () {
            var e_11, _a, e_12, _b;
            try {
                for (var _c = __values(this.children), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var it = _d.value;
                    try {
                        for (var it_1 = (e_12 = void 0, __values(it)), it_1_1 = it_1.next(); !it_1_1.done; it_1_1 = it_1.next()) {
                            var t = it_1_1.value;
                            t.remove();
                        }
                    }
                    catch (e_12_1) { e_12 = { error: e_12_1 }; }
                    finally {
                        try {
                            if (it_1_1 && !it_1_1.done && (_b = it_1.return)) _b.call(it_1);
                        }
                        finally { if (e_12) throw e_12.error; }
                    }
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_11) throw e_11.error; }
            }
            this.children = [];
        };
        /**
         * remove any unused children, calling the attached wselement's 'cleanup' if supplied.
         *
         * @param parenttn
         */
        TargetNodeImpl.prototype.retireUnused = function () {
            for (var i = this.children.length - 1; i >= 0; i--) {
                var c = this.children[i];
                for (var j = c.length - 1; j >= 0; j--) {
                    if (c[j].marked == TargetNode_6.TNS.MARKED) {
                        // marked for removal
                        c[j].remove();
                        c.splice(j, 1);
                    }
                }
                if (c.length == 0) {
                    this.children.splice(i, 1);
                }
            }
        };
        /**
         * Returns the index in children of the child whose node matches 'cn'
         * and was generated in iteration number 'iteration' previously.
         *
         * @param cn
         * @param iteration
         * @returns the index in children or -1 if not found.
         */
        TargetNodeImpl.prototype.findChildForNode = function (cn, iteration) {
            if (this.children && this.children[iteration]) {
                for (var i = 0; i < this.children[iteration].length; i++) {
                    if (this.children[iteration][i].snode === cn || this.children[iteration][i].replaced == cn) {
                        return i;
                    }
                }
            }
            return -1;
        };
        /**
         * Returns the iteration to which the direct child `child` belongs.
         *
         * @param child A direct child of this TargetNode
         * @returns The iteration, or -1 if not found.
         */
        TargetNodeImpl.prototype.getIterationOfChild = function (child) {
            if (this.children) {
                for (var iteration = 0; iteration < this.children.length; iteration++) {
                    if (this.children[iteration]) {
                        for (var i = 0; i < this.children[iteration].length; i++) {
                            if (this.children[iteration][i] === child) {
                                return iteration;
                            }
                        }
                    }
                }
            }
            return -1;
        };
        TargetNodeImpl.prototype.initMark = function () {
            var e_13, _a, e_14, _b;
            try {
                for (var _c = __values(this.children), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var it = _d.value;
                    try {
                        for (var it_2 = (e_14 = void 0, __values(it)), it_2_1 = it_2.next(); !it_2_1.done; it_2_1 = it_2.next()) {
                            var t = it_2_1.value;
                            t.marked = TargetNode_6.TNS.MARKED;
                        }
                    }
                    catch (e_14_1) { e_14 = { error: e_14_1 }; }
                    finally {
                        try {
                            if (it_2_1 && !it_2_1.done && (_b = it_2.return)) _b.call(it_2);
                        }
                        finally { if (e_14) throw e_14.error; }
                    }
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_13) throw e_13.error; }
            }
        };
        /*
        public getControl() : CoElement {
            return this.control;
        }*/
        /**
         * Add an 'attached' control (such as added by this.attach()) to this node.
         *
         */
        TargetNodeImpl.prototype.attachControl = function (control) {
            if (!this.attached)
                this.attached = [];
            this.attached.push(control);
            //this.addControlToParent(control);
        };
        TargetNodeImpl.prototype.removeAttachedControl = function (control) {
            if (!this.attached)
                return;
            var found = -1;
            this.attached.forEach(function (c, index) {
                if (c == control)
                    found = index;
            });
            if (found != -1) {
                //this.removeControlFromParent(control);
                this.attached.splice(found, 1);
                if (this.attached.length == 0)
                    this.attached = null;
            }
        };
        TargetNodeImpl.prototype.removeAllAttachedControls = function (cb) {
            if (!this.attached)
                return;
            if (cb) {
                this.attached.forEach(function (control) {
                    cb(control);
                });
            }
            this.attached = null;
        };
        TargetNodeImpl.prototype.isAttached = function (control) {
            if (!this.attached)
                return false;
            var found = false;
            this.attached.forEach(function (attached) {
                if (attached == control)
                    found = true;
            });
            return found;
        };
        TargetNodeImpl.prototype.renderAttached = function (rm, cvt) {
            if (!this.attached)
                return;
            this.attached.forEach(function (control) {
                //rm.renderControl(control);
                control.getCvt().renderNode(rm, control.getTN());
            });
        };
        /**
         * Renders this target node.
         * This should only be called by a Converter.
         *
         * @param rm
         */
        TargetNodeImpl.prototype.render = function (rm) {
            var _this = this;
            var listenerArray;
            if (this.listeners && (listenerArray = this.listeners['onPreRender'])) {
                listenerArray.forEach(function (l) {
                    l();
                });
            }
            if (this.component.onPreRender) {
                this.component.onPreRender();
            }
            /*
            this.matchSnode((snode)=>{
                if (snode instanceof Element) {
                    if (snode.tagName.toLowerCase().indexOf('creature')>=0) {
                        console.log('CREATURE FOUND');
                    }
                }
                return false;
            }); */
            this.component.onRender(rm); // this will change this.tnode
            this.attachEventHandlersFromAttributes();
            if (this.component.onPostRender)
                this.component.onPostRender(this.tnode);
            this.dispatchEvent('postrender');
            // execute state
            this.runStateChanges();
            // run any pending gets() that didnt resolve because the TargetNode hadnt been created then
            this.runPendingGets();
            if (this.listeners && (listenerArray = this.listeners['onPostRender'])) {
                listenerArray.forEach(function (l) {
                    l(_this.tnode);
                });
            }
        };
        /**
         * Apply all attribute based event handlers (either 'onXXX' or 'co-onXXX') in snode to the
         * tnode as 'addEventListener('xxxx').
         */
        TargetNodeImpl.prototype.attachEventHandlersFromAttributes = function () {
            if (this.tnode && this.snode && this.component) {
                var eh = new EventHandlers_5.EventHandlers(this.tnode, this);
                eh.addEventHandlersFromAttrsOf(this.snode, this.component.getCvt());
            }
        };
        /**
         * Dispatch a DOM synthetic event on the root node of this object.
         * See https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
         *
         * @param eventname The event to send , e.g. 'myevent'
         * @param detail An arbotrary payload. If not supplied, {sender:this.coelement} will be used.
         *
         * @returns The custom event.
         */
        TargetNodeImpl.prototype.dispatchEvent = function (eventname, detail, options) {
            if (!detail)
                detail = { sender: this.component };
            else if (!detail.sender) {
                detail.sender = this.component;
            }
            // custom event, see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
            var event = new CustomEvent(eventname, (options) ? Object.assign(options, { detail: detail }) : { bubbles: true, detail: detail });
            if (this.tnode) {
                this.tnode.dispatchEvent(event);
            }
            else {
                // No tnode - usually because the CoElement does not render a div (e.g. see WSCarousel).
                // In this case we see if the 'on<eventname>' attribute exists on the snode, create a handler bound to our This and call that.
                if (this.snode instanceof Element && this.component && this.component.getCvt()) {
                    var script = this.snode.getAttribute('on' + eventname);
                    if (script) {
                        var eh = new EventHandlers_5.EventHandlers(this.tnode, this);
                        var handler = eh.makeEventHandler(script, this.component.getCvt());
                        if (handler)
                            handler(event);
                    }
                }
            }
            return event;
        };
        TargetNodeImpl.prototype.runStateChangeFor = function (cvt, snode) {
            var e_15, _a;
            if ((this.tnode instanceof Element)) {
                var statechangers = cvt.getStateChangers(snode);
                var tbremoved = void 0;
                for (var stateid in statechangers) {
                    statechangers[stateid](this.tnode);
                    if (stateid.startsWith('@ONCE')) {
                        if (!tbremoved)
                            tbremoved = [];
                        tbremoved.push(stateid);
                    }
                }
                if (tbremoved) {
                    try {
                        for (var tbremoved_1 = __values(tbremoved), tbremoved_1_1 = tbremoved_1.next(); !tbremoved_1_1.done; tbremoved_1_1 = tbremoved_1.next()) {
                            var stateid = tbremoved_1_1.value;
                            cvt.stateChanger(stateid, snode);
                        }
                    }
                    catch (e_15_1) { e_15 = { error: e_15_1 }; }
                    finally {
                        try {
                            if (tbremoved_1_1 && !tbremoved_1_1.done && (_a = tbremoved_1.return)) _a.call(tbremoved_1);
                        }
                        finally { if (e_15) throw e_15.error; }
                    }
                }
            }
        };
        TargetNodeImpl.prototype.runStateChanges = function () {
            this.runStateChangeFor(this.component.getCvt(), this.snode);
        };
        TargetNodeImpl.prototype.runGetsForCvt = function (cvt, snode) {
            var e_16, _a;
            var gets = cvt.getGets(snode);
            if (gets) { // delete all
                cvt.setGets(snode);
                try {
                    for (var gets_1 = __values(gets), gets_1_1 = gets_1.next(); !gets_1_1.done; gets_1_1 = gets_1.next()) {
                        var get = gets_1_1.value;
                        get(this.component);
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (gets_1_1 && !gets_1_1.done && (_a = gets_1.return)) _a.call(gets_1);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
            }
        };
        TargetNodeImpl.prototype.runGetsForAllCvts = function (snode) {
            this.runGetsForCvt(this.component.getCvt(), snode);
        };
        /**
         * Run any pending gets - `this.gets('co-something',(co)=>{})` calls that are still pending
         */
        TargetNodeImpl.prototype.runPendingGets = function () {
            var e_17, _a;
            if (this.component) {
                var all_2 = [];
                this.matchSnode(function (snode) {
                    all_2.push(snode);
                    return false;
                });
                try {
                    for (var all_1 = __values(all_2), all_1_1 = all_1.next(); !all_1_1.done; all_1_1 = all_1.next()) {
                        var snode = all_1_1.value;
                        this.runGetsForAllCvts(snode);
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (all_1_1 && !all_1_1.done && (_a = all_1.return)) _a.call(all_1);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
            }
        };
        /**
         * Returns a Patch object that is used during invalidation to attach
         * the regenerated node back to its parent.
         */
        TargetNodeImpl.prototype.getPatch = function () {
            var parentTnode;
            if (this.tnode && this.tnode.parentNode)
                parentTnode = this.tnode.parentNode;
            if (!parentTnode && (this.parent && this.parent.tnode))
                parentTnode = this.parent.tnode;
            /*
            if (!parentTnode && (this.attachmentNode && this.attachmentNode.tnode))
                parentTnode=this.attachmentNode.tnode;
            */
            if (parentTnode) {
                return new Repaint_1.Repaint(parentTnode, this.tnode);
            }
        };
        /**
         * Empty this node, as if it had just been added to its parent, prior to a full regeneration
         */
        TargetNodeImpl.prototype.reset = function () {
            this.remove(true);
        };
        /**
         * Adds a style class to the target node.
         *
         * @param clazz
         */
        TargetNodeImpl.prototype.addStyleClass = function (clazz) {
            if (this.tnode)
                this.tnode.classList.add(clazz);
        };
        /**
         * Removes a style from the tnode.
         *
         * @param clazz
         */
        TargetNodeImpl.prototype.removeStyleClass = function (clazz) {
            if (this.tnode)
                this.tnode.classList.remove(clazz);
        };
        TargetNodeImpl.prototype.findCustomData = function (key) {
            if (!this.customData)
                return;
            return this.customData[key];
        };
        TargetNodeImpl.prototype.setCustomData = function (key, value) {
            if (!this.customData)
                this.customData = {};
            this.customData[key] = value;
        };
        /**
         * Retrieves, modifies or removes custom data attached to a CoElement.
         *
         * Usages:
         * <h4>Setting the value for a single key</h4>
         * <pre>
         *    data("myKey", myData)
         * </pre>
         * Attaches <code>myData</code> (which can be any JS data type, e.g. a number, a string, an object, or a function)
         * to this element, under the given key "myKey". If the key already exists,the value will be updated.
         *
         *
         * <h4>Setting a value for a single key (rendered to the DOM)</h4>
         * <pre>
         *    data("myKey", myData, writeToDom)
         * </pre>
         * Attaches <code>myData</code> to this element, under the given key "myKey" . If the key already exists,the value will be updated.
         * While <code>oValue</code> can be any JS data type to be attached, it must be a string to be also
         * written to DOM. The key must also be a valid HTML attribute name (it must conform to <code>sap.ui.core.ID</code>
         * and may contain no colon) and may not start with "sap-ui". When written to HTML, the key is prefixed with "data-".
         *
         *
         * <h4>Getting the value for a single key</h4>
         * <pre>
         *    data("myKey")
         * </pre>
         * Retrieves whatever data has been attached to this element (using the key "myKey") before.
         *
         *
         * <h4>Removing the value for a single key</h4>
         * <pre>
         *    data("myKey", null)
         * </pre>
         * Removes whatever data has been attached to this element (using the key "myKey") before.
         *
         *
         * <h4>Removing all custom data for all keys</h4>
         * <pre>
         *    data(null)
         * </pre>
         *
         *
         * <h4>Getting all custom data values as a plain object</h4>
         * <pre>
         *    data()
         * </pre>
         * Returns all data, as a map-like object, property names are keys, property values are values.
         *
         *
         * <h4>Setting multiple key/value pairs in a single call</h4>
         * <pre>
         *    data({"myKey1": myData, "myKey2": null})
         * </pre>
         * Attaches <code>myData</code> (using the key "myKey1" and removes any data that had been
         * attached for key "myKey2".
         *
         *
         * @param {string|Object<string,any>|null} [vKeyOrData]
         *     Single key to set or remove, or an object with key/value pairs or <code>null</code> to remove
         *     all custom data
         * @param {string|any} [vValue]
         *     Value to set or <code>null</code> to remove the corresponding custom data
         * @returns {Object<string,any>|any|null}
         *     A map with all custom data, a custom data value for a single specified key or <code>null</code>
         *     when no custom data exists for such a key or this element when custom data was to be removed.
         * @throws {TypeError}
         *     When the type of the given parameters doesn't match any of the documented usages
         *
         */
        TargetNodeImpl.prototype.data = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            var argLength = arguments.length;
            if (argLength == 0) { // return ALL data as a map
                var aData = this.customData, result = {};
                if (aData) {
                    for (var i = 0; i < aData.length; i++) {
                        result[aData[i].getKey()] = aData[i].getValue();
                    }
                }
                return result;
            }
            else if (argLength == 1) {
                var arg0 = arguments[0];
                if (arg0 === null) { // delete ALL data
                    delete this.customData; // delete whole map
                    return this;
                }
                else if (typeof arg0 == "string") { // return requested data element
                    return this.findCustomData(arg0);
                }
                else if (typeof arg0 == "object") { // should be a map - set multiple data elements
                    for (var key in arg0) { // TODO: improve performance and avoid executing setData multiple times
                        this.setCustomData(key, arg0[key]);
                    }
                    return this;
                }
                else {
                    // error, illegal argument
                    throw new TypeError("When data() is called with one argument, this argument must be a string, an object or null, but is " + (typeof arg0) + ":" + arg0 + " (on UI Element with ID '" + this.getId() + "')");
                }
            }
            else if (argLength == 2) { // set or remove one data element
                this.setCustomData(arguments[0], arguments[1]);
                return this;
            }
            else {
                // error, illegal arguments
                throw new TypeError("data() may only be called with 0-2 arguments (on CoElement with tag '" + this.snode.tagName.toLowerCase() + "')");
            }
        };
        ;
        /**
         * Add a listener for the given function.
         *
         * @param name The function to listen to
         * @param listener The callback to call
         */
        TargetNodeImpl.prototype.addListener = function (name, listener) {
            if (!this.listeners)
                this.listeners = {};
            var arr = this.listeners[name];
            if (!arr) {
                arr = [];
                this.listeners[name] = arr;
            }
            arr.push(listener);
        };
        /**
         * Removes a previously added listener for the given function.
         *
         * @param name
         * @param listener
         * @returns
         */
        TargetNodeImpl.prototype.removeListener = function (name, listener) {
            if (!this.listeners)
                return;
            var arr = this.listeners[name];
            if (!arr)
                return;
            var index = arr.indexOf(listener);
            if (index >= 0) {
                arr.splice(index, 1);
                if (arr.length == 0)
                    delete this.listeners[name];
            }
        };
        /**
         * For debugging - prints the target tree snodes to the console.
         *
         * @param depth
         */
        TargetNodeImpl.prototype.print = function (depth) {
            if (depth === void 0) { depth = 0; }
            if (this.snode && this.snode.nodeType != Node.TEXT_NODE) {
                console.log("".concat((0, Debug_3.pad)(depth), " snode=").concat((0, Debug_3.toStr)(this.snode), " ++ tnode=").concat((0, Debug_3.toStr)(this.tnode), " (").concat(this.constructor.name, ")#").concat(this.getId()));
                if (this.replaced)
                    console.log("".concat((0, Debug_3.pad)(depth, ' '), " replaced=").concat((0, Debug_3.toStr)(this.replaced)));
            }
            for (var i = 0; i < this.children.length; i++) {
                var c = this.children[i];
                for (var j = 0; j < c.length; j++) {
                    c[j].print(depth + 1);
                }
            }
        };
        /**
         * Calls the matcher function against all snodes this TargetNode implementation is handling.
         * This provides an extensible way for traversing each TargetNodes's snode(s), for example, to find
         * TargetNodes by snodes.
         *
         * @param matcher
         * @returns The first true from matcher.
         */
        TargetNodeImpl.prototype.matchSnode = function (matcher) {
            return matcher(this.snode) || (this.replaced && matcher(this.replaced));
        };
        /**
         * Gets or sets parameters for children by their iteration and tag name.
         *
         * @param iteration
         * @param tagname
         * @param parameters If specified, sets the parameters, else returns them
         */
        TargetNodeImpl.prototype.childParams = function (iteration, tagname, parameters) {
            if (parameters) {
                // insert
                if (!this.childp)
                    this.childp = {};
                if (!this.childp[iteration])
                    this.childp[iteration] = {};
                this.childp[iteration][tagname] = parameters;
            }
            else if (this.childp && this.childp[iteration]) {
                return this.childp[iteration][tagname];
            }
        };
        return TargetNodeImpl;
    }());
    exports.TargetNodeImpl = TargetNodeImpl;
});
define("coml/Asset", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCoElementAsset = exports.isTextAsset = exports.isDocumentAsset = exports.areAssetIdsEqual = exports.restoreAssetID = exports.stringifyAssetID = exports.isAssetId = exports.AssetType = void 0;
    /**
     * The types of all Assets.
     */
    var AssetType;
    (function (AssetType) {
        AssetType["image"] = "image";
        AssetType["page"] = "page";
        AssetType["frame"] = "frame";
        AssetType["look"] = "look";
        AssetType["looksub"] = "looksub";
        AssetType["form"] = "form";
        AssetType["indexpage"] = "indexpage";
        AssetType["palette"] = "palette";
        AssetType["other"] = "other";
    })(AssetType = exports.AssetType || (exports.AssetType = {}));
    function isAssetId(obj) {
        return obj && typeof obj == 'object' && 'type' in obj && 'name' in obj;
    }
    exports.isAssetId = isAssetId;
    /**
     * Convert an assetid to a string suitable for setting on an Element attribute.
     *
     * @param id
     * @returns
     */
    function stringifyAssetID(id) {
        if (!id)
            return '';
        if (typeof id == 'string')
            return id;
        return JSON.stringify(id).replace(/"/g, "'");
    }
    exports.stringifyAssetID = stringifyAssetID;
    /**
     * Recover an AssetID from a string returned by stringifyAssetID.
     *
     * This function is safe to call wherever an AssetID|string is specified, as it takes account of both to return an AssetID.
     *
     * @param stringifiedID a stringigified assetID, or an actual asetId or null.
     * @returns null if null supplied, else the restored AssetID
     */
    function restoreAssetID(stringifiedIDorName, typeIfNameOnly) {
        if (typeIfNameOnly === void 0) { typeIfNameOnly = AssetType.page; }
        if (!stringifiedIDorName)
            return;
        if (typeof stringifiedIDorName == 'string') {
            if (stringifiedIDorName.indexOf('{') < 0)
                stringifiedIDorName = "{'type':'".concat(typeIfNameOnly, "','name':'").concat(stringifiedIDorName, "'}");
            return JSON.parse(stringifiedIDorName.replace(/'/g, '"'));
        }
        return stringifiedIDorName;
    }
    exports.restoreAssetID = restoreAssetID;
    /**
     * Compares two assets ids for equality. The ids can be an AssetId, a stringified AssetId, or just an asset name, for example 'mypage.html'.
     * Each asset is converted to an AssetId object before comparison.
     *
     * @param id1
     * @param id2
     * @param typeIfNameOnly If an id comprises a name only, use this type to create the AssetId for comparison.
     */
    function areAssetIdsEqual(id1, id2, typeIfNameOnly) {
        if (typeIfNameOnly === void 0) { typeIfNameOnly = AssetType.page; }
        if (!id1 || !id2)
            return false;
        var sid1 = (typeof id1 == 'string') ? restoreAssetID(id1, typeIfNameOnly) : id1;
        var sid2 = (typeof id2 == 'string') ? restoreAssetID(id2, typeIfNameOnly) : id2;
        return sid1.type === sid2.type && sid1.name === sid2.name;
    }
    exports.areAssetIdsEqual = areAssetIdsEqual;
    function isDocumentAsset(obj) {
        return typeof obj == 'object' && 'getDocument' in obj;
    }
    exports.isDocumentAsset = isDocumentAsset;
    function isTextAsset(obj) {
        return typeof obj == 'object' && 'getText' in obj;
    }
    exports.isTextAsset = isTextAsset;
    function isCoElementAsset(obj) {
        return typeof obj == 'object' && 'asCoElement' in obj;
    }
    exports.isCoElementAsset = isCoElementAsset;
});
define("coml/Ajax", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("coml/bridge/ui5/UI5ControlClass", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendUI5 = void 0;
    var DomRenderer = {
        apiVersion: 2,
        render: function (oRM, oControl) {
            if (oControl.options.onRender) {
                oControl.options.onRender(oRM, oControl);
            }
        }
    };
    /**
     * A Raw JavaScript object that can be used to call the ui5 control's 'extend' function.
     * This will create a class in the global area.
     * You can then subclass this class to provide your render functionality via the init options.
     */
    var UI5Control = {
        initOptions: function () {
            this.options = {
                onRender: undefined,
                onPostRender: undefined
            };
        },
        setControlOptions: function (options) {
            if (!this.options) {
                this.initOptions();
            }
            Object.assign(this.options, options);
        },
        setKeyValue: function (key, value) {
            if (!this.options) {
                this.initOptions();
            }
            this.options[key] = value;
        },
        getKeyValue: function (key) {
            if (this.options && this.options[key])
                return this.options[key];
        },
        removeKey: function (key) {
            if (this.options && this.options[key])
                delete this.options[key];
        },
        onAfterRendering: function (evt) {
            if (evt) {
                var ref = evt.srcControl.getDomRef();
                if (ref) {
                    if (evt.srcControl.options.onPostRender) {
                        evt.srcControl.options.onPostRender(ref);
                    }
                }
                else {
                    //console.log('onAfterRendering ref is null')
                }
            }
        },
        onBeforeRendering: function (evt) {
            if (evt.srcControl.options.onPreRender) {
                evt.srcControl.options.onPreRender();
            }
        },
        init: function () {
            this.initOptions();
        },
        exit: function () {
        },
        renderer: DomRenderer
    };
    /**
     * Creates a simple UI5Control class that you can instantiate.
     *
     * Sample use:
     * ```typescript
            let MyClass=extendUI5('foo.Bar');
            let mycontrol:sap.ui.core.Control=new (class extends MyClass {
    
                constructor() {
                    super();
    
                    this.setControlOptions({
                        onPreRender:()=>{},
                        onRender: (rm:sap.ui.core.RenderManager)=> {
                            rm
                            .openStart('div',this as any)
                            .class('u-ui5-class')
                            .openEnd();
    
                            rm.close('div');
                        },
                        onPostRender:(ref:any)=>{},
                    });
                }
            })() as sap.ui.core.Control;
     *
     *
     * ```
     *
     * @param classname The class to create, eg, 'coml.MyClass'
     * @returns A class object that you can instantiate using new.
     */
    function extendUI5(classname) {
        return sap.ui.core.Control.extend(classname, Object.assign({}, UI5Control));
    }
    exports.extendUI5 = extendUI5;
});
define("coml/bridge/ui5/UI5Attachment", ["require", "exports", "coml/impl/AttachmentImpl", "coml/Implementations", "coml/bridge/ui5/UI5ControlClass"], function (require, exports, AttachmentImpl_1, Implementations_8, UI5ControlClass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UI5Attachment = void 0;
    /**
     * An Attachment implementation for UI5.
     *
     * @see https://openui5.org/
     *
     * UI5 controls require a top level ui5 parent control of which they are the children.
     *
     * This attachment implementation builds a custom singleton control (the bridge), attaches it to the attachment element
     * in the tdom. This control then renders the COML in its 'onRender()' method, which eventually renders the
     * COML created UI5 controls, so UI5 sees the expected parent / child control rendering behaviour
     *
     * Strategy: Attach the bridge control to the attachment point using the UI5 placeAt.
     * Load the coElement asset and when loaded, render it inside the bridge's onRender(). At this point
     * the bridge doesnt have a dom reference, so just store the rendered element. When the bridge's onPostRender()
     * is called, append this element to the bridge's dom element.
     *
     */
    var UI5Attachment = /** @class */ (function (_super) {
        __extends(UI5Attachment, _super);
        function UI5Attachment() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.count = 0;
            return _this;
        }
        UI5Attachment.getBridge = function () {
            return UI5Attachment.bridge;
        };
        UI5Attachment.prototype.createPatch = function (tnode, element) {
            var that = this;
            return new (/** @class */ (function () {
                function class_2() {
                }
                class_2.prototype.restorePosition = function (elem) {
                    if (!that.rendered) {
                        // ui5 rerenderig 
                        // do nothing except save the rendered node as the UI5 element will attach rendered to the parent bridge
                        that.rendered = elem;
                    }
                    else {
                        // ui5 is not rerending (onPreRender was not called)
                        // so just patch the newly created elem back to the bridge's dom ref
                        var top_1 = UI5Attachment.getBridge();
                        if (top_1) {
                            var parent_1 = top_1.getDomRef();
                            if (parent_1.children.length) {
                                parent_1.innerHTML = "";
                            }
                            parent_1.appendChild(elem);
                        }
                        else {
                            console.error("UI5Attachment - Cannot patch back rerendered element to the bridge");
                        }
                    }
                };
                return class_2;
            }()))();
        };
        UI5Attachment.prototype.onPreRender = function () {
            this.rendered = null;
        };
        UI5Attachment.prototype.onRender = function (rm) {
            console.warn("--------------bridge render #".concat(this.count++, "---------"));
            rm.openStart('div', UI5Attachment.getBridge())
                .class('u-coml-ui5bridge')
                .openEnd();
            if (this.coElement) {
                var r = Implementations_8.Implementations.createRender(this.coElement.getTN().getPatch());
                this.coElement.getCvt().renderNode(r, this.coElement.getTN());
            }
            rm.close('div');
        };
        UI5Attachment.prototype.onPostRender = function (ref) {
            if (this.rendered)
                ref.appendChild(this.rendered);
        };
        UI5Attachment.makeBridgeControl = function (attachment, element, toInsert) {
            var ControlClass = (0, UI5ControlClass_1.extendUI5)("coml.UI5Bridge"); //(sap.ui.core.Control as any).extend("coml.UI5Bridge",Object.assign({},UI5Control));
            UI5Attachment.bridge = new (/** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    var _this = _super.call(this) || this;
                    // delegate UI5 rendering back to the attachment
                    _this.setControlOptions({
                        onPreRender: function () { return attachment.onPreRender(); },
                        onRender: function (rm) { return attachment.onRender(rm); },
                        onPostRender: function (ref) { return attachment.onPostRender(ref); },
                    });
                    return _this;
                }
                return class_3;
            }(ControlClass)))();
            return UI5Attachment.bridge;
        };
        UI5Attachment.prototype.attach = function (element, toInsert) {
            var _this = this;
            var top = UI5Attachment.getBridge();
            if (!top) {
                // deosnt yet exist - create our signeleton at placeAt the element
                top = UI5Attachment.makeBridgeControl(this, element, toInsert);
                top.placeAt(element);
            }
            this.makeCoElement(element, toInsert)
                .then(function (value) {
                _this.handleAttach(value);
                _this.coElement = value;
                top.invalidate();
            });
        };
        return UI5Attachment;
    }(AttachmentImpl_1.AttachmentImpl));
    exports.UI5Attachment = UI5Attachment;
});
define("coml/impl/RenderImpl", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderImpl = void 0;
    var RenderImpl = /** @class */ (function () {
        function RenderImpl(patch, getId) {
            this.pn = []; // the node to which we are adding
            this.getId = getId;
            this.tdoc = document;
            this.patch = patch;
        }
        RenderImpl.prototype.e = function () {
            return this.pn[this.pn.length - 1];
        };
        RenderImpl.prototype.attr = function (sName, vValue) {
            this.e().setAttribute(sName, vValue);
            return this;
        };
        RenderImpl.prototype.class = function (sClass) {
            this.e().classList.add(sClass);
            return this;
        };
        RenderImpl.prototype.close = function (sTagName) {
            if (this.pn.length == 0) {
                console.error("RM - mismatched close tag ".concat(sTagName));
                return;
            }
            var laste = this.pn.pop();
            this.insertRendered(laste);
            return this;
        };
        /**
         * Copy attributes and classes with ${} expansion into the last opened HTML element.
         *
         *
         * @param component The component
         * @param doNotCopy (Optional) an array of attributes to NOT copy.
         * @param copyFrom  (Optional) the element to copy from. If not specified, defaults to this component's source node
         */
        RenderImpl.prototype.copyAttrExcept = function (component, doNotCopy, copyFrom) {
            component.getCvt().copyAttrExcept(this, (copyFrom) ? copyFrom : component.getTN().snode, doNotCopy, component.getTN());
            return this;
        };
        RenderImpl.prototype.renderChildren = function (component, iteration, parametersPerChild) {
            if (parametersPerChild) {
                for (var tagname in parametersPerChild) {
                    component.getTN().childParams(iteration, tagname, parametersPerChild[tagname]);
                }
            }
            component.getCvt().renderChildren(this, component.getTN(), iteration);
            return this;
        };
        /**
         * Insert a prerendered dom node into the current rendering position.
         *
         * @param elem
         * @returns
         */
        RenderImpl.prototype.insertRendered = function (elem) {
            if (this.pn.length >= 1) { // atleast one item remains on the stack, make elem child of that
                //console.log(` ${this.pn.length} RM adding child ${this.toStr(elem)} to ${this.toStr(this.e())}`);
                this.e().appendChild(elem);
            }
            else { // we just build the last object, so use the patch to restore it
                //console.log(` ${this.pn.length} RM restoring child ${this.toStr(this.e())}`);
                this.patch.restorePosition(elem);
            }
            return this;
        };
        RenderImpl.prototype.destroy = function () {
        };
        RenderImpl.prototype.openEnd = function () {
            return this;
        };
        /**
         * Creates an HTML element from the given tag name and parent namespace
         */
        RenderImpl.prototype.createElement = function (sTagName, oParent) {
            if (sTagName == "svg") {
                return this.tdoc.createElementNS("http://www.w3.org/2000/svg", "svg");
            }
            var sNamespaceURI = oParent && oParent.namespaceURI;
            if (!sNamespaceURI || sNamespaceURI == "http://www.w3.org/1999/xhtml" || oParent.localName == "foreignObject") {
                return this.tdoc.createElement(sTagName);
            }
            return this.tdoc.createElementNS(sNamespaceURI, sTagName);
        };
        ;
        RenderImpl.prototype.openStart = function (sTagName, comp, noCoId) {
            var e = this.createElement(sTagName, (this.pn.length > 0) ? this.e() : undefined);
            if (comp) {
                comp.getTN().tnode = e;
                if (!noCoId) {
                    e.setAttribute('data-coid', comp.getTN().getId());
                }
            }
            this.pn.push(e);
            return this;
        };
        RenderImpl.prototype.style = function (sName, sValue) {
            this.e().style.cssText += "".concat(sName, ":").concat(sValue, ";");
            return this;
        };
        RenderImpl.prototype.text = function (sText) {
            var textNode = document.createTextNode(sText);
            //this.e().appendChild(textNode);
            this.insertRendered(textNode);
            return this;
        };
        RenderImpl.prototype.unsafeHtml = function (sHtml) {
            //this.e().innerHTML=sHtml;
            return this;
        };
        return RenderImpl;
    }());
    exports.RenderImpl = RenderImpl;
});
define("coml/impl/DefaultImplementations", ["require", "exports", "coml/Implementations", "coml/impl/ConverterImpl", "coml/impl/RenderImpl", "coml/impl/AttachmentImpl", "coml/impl/BaseThis"], function (require, exports, Implementations_9, ConverterImpl_1, RenderImpl_1, AttachmentImpl_2, BaseThis_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultImplementations = void 0;
    /**
     * Default implementations of all interfaces.
     *
     */
    var DefaultImplementations = /** @class */ (function (_super) {
        __extends(DefaultImplementations, _super);
        function DefaultImplementations(ajax, assetFactory) {
            var _this = _super.call(this) || this;
            _this.ajax = ajax;
            _this.assetFactory = assetFactory;
            return _this;
        }
        DefaultImplementations.prototype.getAjaxImpl = function () {
            return this.ajax;
        };
        DefaultImplementations.prototype.getAssetFactoryImpl = function () {
            return this.assetFactory;
        };
        DefaultImplementations.prototype.createConverterImpl = function (copyStateFrom) {
            return new ConverterImpl_1.ConverterImpl(copyStateFrom);
        };
        DefaultImplementations.prototype.createRenderImpl = function (pos) {
            return new RenderImpl_1.RenderImpl(pos, function (c) {
                return '_id' + Math.floor(Math.random() * 10000000);
            });
        };
        DefaultImplementations.prototype.createAttachmentImpl = function () {
            return new AttachmentImpl_2.AttachmentImpl();
        };
        DefaultImplementations.prototype.createThisImpl = function (cvt, fnGetAttr) {
            return new BaseThis_1.default(cvt, undefined, fnGetAttr);
        };
        return DefaultImplementations;
    }(Implementations_9.Implementations));
    exports.DefaultImplementations = DefaultImplementations;
});
define("coml/impl/JQueryAjax", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JQueryAjax = void 0;
    /**
     * A function that returns the base folder of an assetId to fetch pages from.
     *
    type GetAssetBase = (assetId:AssetID)=>string;
    */
    /**
     * An implementation of the Ajax interface using jQuery.
     *
     * For this to work, the main html page of your SPA must include jQuery.
     *
     * For example:
     *
       <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
     *
     */
    var JQueryAjax = /** @class */ (function () {
        function JQueryAjax() {
        }
        /**
         * returns the base path of the URL of the current window
         *
         * see https://stackoverflow.com/questions/406192/get-current-url-with-jquery
         */
        JQueryAjax.prototype.getBasePath = function () {
            // (window.location.pathname is something like : '/WRA_V2/public/samples/sql.html'
            // will return '/WRA_V2/'
            var location = window.location;
            if (window._parentLocation) { // if we are part of an iframe, use the _parentLocation set on us by our parent
                location = window._parentLocation;
            }
            if (location && location.pathname) {
                var p = location.pathname;
                if (typeof p === 'string' && p.length > 0) {
                    p = p.substring(1);
                    var dot = p.indexOf('/');
                    if (dot > 0)
                        return '/' + p.substring(0, dot + 1);
                }
            }
            return '/';
        };
        JQueryAjax.prototype.onNotLoggedInError = function () {
        };
        JQueryAjax.prototype.ajaxAsPromise = function (getorpost, headers, url, contentType, cache, responseDataType, postdata) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                jQuery.ajax({
                    async: true,
                    cache: false,
                    type: getorpost,
                    dataType: (!responseDataType) ? 'json' : responseDataType,
                    contentType: contentType,
                    headers: headers,
                    data: postdata,
                    /* url: thiss.getBasePath()+'jsoncall/' + callName,*/
                    url: url,
                    success: function (result, status, jqXHR) {
                        try {
                            // WRA will serialize an exception and send it to us.
                            // if the responseDataType was 'json' then jquery's already parsed the result, so we can check the javascript object
                            // if not (for example the responseDataType was string), we must parse it sourselves efficiently
                            var err = result;
                            if (responseDataType != 'json' && typeof result == 'string') {
                                if (result.startsWith('{"EXCEPTION')) {
                                    try {
                                        err = JSON.parse(result);
                                    }
                                    catch (x) {
                                    }
                                }
                            }
                            if (err.ERROR || err.EXCEPTION) {
                                if (err.xid) {
                                    // this is a JSONException, so pass it as a whole
                                    reject(err);
                                }
                                else {
                                    reject((err.ERROR) ? err.ERROR : err.EXCEPTION);
                                }
                            }
                            else {
                                //console.log({stringifiedJson:stringifiedJson,length:jqXHR.responseText.length });
                                if (result && result.invalidSessionKey) {
                                    console.error("SESSION ERROR:" + result.invalidSessionKey);
                                    _this.onNotLoggedInError();
                                    reject(result.invalidSessionKey);
                                }
                                else {
                                    if (postdata && cache && jqXHR.responseText.length < cache.getValueSizeLimit()) {
                                        // store in the cache
                                        cache.write(postdata, result);
                                    }
                                    resolve(result);
                                }
                            }
                        }
                        finally {
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        var serr = "[".concat((textStatus) ? textStatus : '', "]:").concat((errorThrown && errorThrown.message) ? errorThrown.message : '');
                        //(textStatus && (typeof textStatus==='string')) ? textStatus:(errorThrown && (typeof errorThrown==='string')) ? errorThrown:'An error occurred';
                        reject(serr); //,errorThrown);
                    }
                });
            });
        };
        JQueryAjax.prototype.ajaxToServer = function (baseUrl, callName, stringifiedJson, cache, responseDataType) {
            // create an id
            //let ajax_time = window.performance.now();
            try {
                return this.ajaxAsPromise('POST', { 'call': callName }, baseUrl, 'application/json', cache, responseDataType, stringifiedJson);
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Send an ajax request, returns a promise that resolves to the result.
         * ```
         * // typical usage:
         * ajax("GetSomething",{someParameter,"SomeValue",...})
         * .then((result:SomeType)=>{
         * })
         * .catch((error:string|JSONException)=>{
         * })
         * ```
         *
         * @param {string} callName
         * @param {*} jsonToSend
         * @param {AjaxCache} cache If supplied, use this cache
         *
         * @returns {Promise<any>}
         **/
        JQueryAjax.prototype.ajax = function (callName, jsonToSend, cache, responseDataType) {
            var baseUrl = this.getBasePath() + 'jsoncall/' + callName;
            var stringifiedJson = JSON.stringify(jsonToSend);
            console.warn(stringifiedJson);
            if (cache) {
                // check if the cache has a result, and if so, use it:
                var cachedResult = cache.read(stringifiedJson);
                if (cachedResult) {
                    //console.warn('CACHE HIT on ['+stringifiedJson+']');
                    return Promise.resolve(cachedResult);
                }
            }
            return (this.ajaxToServer(baseUrl, callName, stringifiedJson, cache, responseDataType)
                .then(function (result) {
                return result;
            }));
        };
        JQueryAjax.prototype.assetsFolder = function (assetId) {
            return this.getBasePath() + 'html/';
        };
        /**
         * Given an AssetID, return its content in the specified responseDataType.
         *
         */
        JQueryAjax.prototype.getAsset = function (assetId, cache, responseDataType) {
            var url = this.assetsFolder(assetId) + "".concat(assetId.type, "/").concat(assetId.name);
            return this.ajaxAsPromise('GET', undefined, url, 'application/json', cache, responseDataType);
        };
        return JQueryAjax;
    }());
    exports.JQueryAjax = JQueryAjax;
});
define("coml/impl/DocumentCoElementAsset", ["require", "exports", "coml/Implementations"], function (require, exports, Implementations_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentCoElementAsset = void 0;
    /**
     * An asset that represents a .html file that can be parsed into a Document object.
     *
     * The type is simply used as the subfolder in the `/public/pages' folder. It defaults to 'page'
     * The name is the file in the folder.
     */
    var DocumentCoElementAsset = /** @class */ (function () {
        function DocumentCoElementAsset(assetId) {
            this.assetId = assetId;
        }
        DocumentCoElementAsset.prototype.getId = function () {
            return this.assetId;
        };
        DocumentCoElementAsset.prototype.getType = function () {
            return this.getId().type;
        };
        DocumentCoElementAsset.prototype.getName = function () {
            return this.getId().name;
        };
        /**
         * Return this asset wrapped as a component element.
         * This component can then be inserted into the current document.
         * The CoElement has its own This and ComlConverter.
         */
        DocumentCoElementAsset.prototype.asCoElement = function (root, cb, fnGetAttr) {
            var _this = this;
            var component;
            return (this.getDocument()
                .then(function (doc) {
                var cvt = Implementations_10.Implementations.createConverter();
                if (cb) {
                    cb(cvt);
                }
                cvt.setGetAttrFn(fnGetAttr);
                return cvt.setDocument(doc, _this.getId(), root); // this will cause the this script to be called as imports are loaded
            })
                .then(function (cvt) {
                if (!component) {
                    //component=cvt.makeCoElement(cvt.getRoot());
                    component = cvt.getThis();
                }
                return component;
            }));
        };
        return DocumentCoElementAsset;
    }());
    exports.DocumentCoElementAsset = DocumentCoElementAsset;
});
define("coml/impl/DocumentAssetImpl", ["require", "exports", "coml/Implementations", "coml/impl/DocumentCoElementAsset"], function (require, exports, Implementations_11, DocumentCoElementAsset_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentAssetImpl = void 0;
    /**
     * An asset that represents a .html file that can be parsed into a Document object.
     *
     * The type is simply used as the subfolder in the `/public/pages' folder. It defaults to 'page'
     * The name is the file in the folder.
     */
    var DocumentAssetImpl = /** @class */ (function (_super) {
        __extends(DocumentAssetImpl, _super);
        function DocumentAssetImpl(assetId) {
            return _super.call(this, assetId) || this;
        }
        /**
         * Returns the raw text of this html asset.
         *
         * @returns
         */
        DocumentAssetImpl.prototype.getText = function () {
            return Implementations_11.Implementations.getAjax().getAsset(this.assetId, undefined, 'text');
        };
        /**
         * returns the DOM document of this asset.
         */
        DocumentAssetImpl.prototype.getDocument = function () {
            return (this.getText()
                .then(function (text) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(text, 'text/html');
                return doc;
            }));
        };
        return DocumentAssetImpl;
    }(DocumentCoElementAsset_1.DocumentCoElementAsset));
    exports.DocumentAssetImpl = DocumentAssetImpl;
});
define("coml/impl/SimpleAssetFactory", ["require", "exports", "coml/Asset", "coml/impl/DocumentAssetImpl"], function (require, exports, Asset_6, DocumentAssetImpl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleAssetFactory = void 0;
    /**
     * An asset factory implementation that simply fetches an asset as an html file using the
     * GetPublicFile json call implemented in the SampleServer.
     */
    var SimpleAssetFactory = /** @class */ (function () {
        function SimpleAssetFactory() {
        }
        SimpleAssetFactory.prototype.isFor = function (id) {
            return true;
        };
        SimpleAssetFactory.prototype.list = function (types, project) {
            return null;
        };
        SimpleAssetFactory.prototype.get = function (assetId) {
            return new DocumentAssetImpl_1.DocumentAssetImpl((0, Asset_6.restoreAssetID)(assetId));
        };
        return SimpleAssetFactory;
    }());
    exports.SimpleAssetFactory = SimpleAssetFactory;
});
define("coml/ComlStartup", ["require", "exports", "coml/bridge/ui5/UI5Attachment", "coml/impl/AttachmentImpl", "coml/impl/DefaultImplementations", "coml/impl/JQueryAjax", "coml/impl/SimpleAssetFactory", "coml/Implementations"], function (require, exports, UI5Attachment_1, AttachmentImpl_3, DefaultImplementations_1, JQueryAjax_1, SimpleAssetFactory_1, Implementations_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The default COML entrypoint.
     *
     * Install your attachment, asset factory and attach COML to an element of your SPA's start html file.
     */
    var ComlStartup = /** @class */ (function () {
        function ComlStartup(dontUseUI5) {
            this.dontUseUI5 = dontUseUI5;
            this.configureImplementations();
        }
        ComlStartup.prototype.configureImplementations = function () {
            /* set up the implemntations of ajax, assets, Converter and Render */
            var that = this;
            new (/** @class */ (function (_super) {
                __extends(class_4, _super);
                function class_4() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_4.prototype.createAttachmentImpl = function () {
                    if (!that.dontUseUI5)
                        return new UI5Attachment_1.UI5Attachment();
                    return new AttachmentImpl_3.AttachmentImpl();
                };
                return class_4;
            }(DefaultImplementations_1.DefaultImplementations)))(new JQueryAjax_1.JQueryAjax(), new SimpleAssetFactory_1.SimpleAssetFactory());
        };
        ComlStartup.prototype.attachTo = function (id, page) {
            var inserter = Implementations_12.Implementations.createAttachment();
            var element = document.querySelector("#".concat(id));
            element.innerHTML = '';
            inserter.attach(element, page);
        };
        return ComlStartup;
    }());
    exports.default = ComlStartup;
});
define("coml/bridge/chartjs/CoChartjs", ["require", "exports", "coml/element/BaseCoElement", "coml/TargetNode"], function (require, exports, BaseCoElement_4, TargetNode_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     *
     */
    var ChartjsElement = /** @class */ (function (_super) {
        __extends(ChartjsElement, _super);
        function ChartjsElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        ChartjsElement.prototype.onRender = function (rm) {
            var _a = (0, TargetNode_7.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            rm.openStart('div', this);
            rm.class('u-chartjs');
            cvt.copyAttrExcept(rm, tn.snode);
            rm.openEnd();
            rm
                .openStart('canvas')
                .class('u-chartjs-canvas')
                .openEnd()
                .close('canvas');
            rm.close('div');
        };
        ChartjsElement.prototype.getScriptText = function (scriptElem) {
            var script;
            for (var i = 0; i < scriptElem.childNodes.length; i++) {
                var cn = scriptElem.childNodes[i];
                if (cn.nodeType == Node.TEXT_NODE) {
                    //console.log(cn.nodeValue);
                    if (!script)
                        script = cn.nodeValue;
                    else
                        script += ('\n' + cn.nodeValue);
                }
            }
            return script;
        };
        /**
         * Fetch settings from any <scrip> block of our snode.
         *
         * @returns the Settings object needed to initialize the UI5 Control that we will host
         */
        ChartjsElement.prototype.getSettings = function () {
            var _a = (0, TargetNode_7.ctn)(this), tn = _a.tn, cvt = _a.cvt;
            var script;
            for (var i = 0; i < tn.snode.children.length; i++) {
                if (tn.snode.children[i].tagName.toLowerCase() == 'script') {
                    script = this.getScriptText(tn.snode.children[i]);
                }
            }
            var settings = {};
            if (script) {
                cvt.getThis().settings = function (incoming) {
                    settings = incoming;
                };
                cvt.executeScript(script);
            }
            return settings;
        };
        /**
         * Override if you need to be called on onAfterRendering(). ref is this control's domref
         *
         * @param ref
         */
        ChartjsElement.prototype.onPostRender = function (ref) {
            var elem = ref;
            if (elem) {
                var canvas = elem.querySelector('canvas');
                var settings = this.getSettings();
                this.chart = new Chart(canvas, settings);
            }
        };
        ChartjsElement.prototype.getChartjs = function () {
            return this.chart;
        };
        return ChartjsElement;
    }(BaseCoElement_4.BaseCoElement));
    /**
     * The factory class is registered when imported via a script in the <head>
     *
     * ```
     * <head>
        <script>
            this.import('coml/bridge/chartjs/CoChartjs');
        </script>
      </head>
     * ```
     *
     */
    var CoChartjsFactory = /** @class */ (function () {
        function CoChartjsFactory() {
        }
        CoChartjsFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('co-chartjs', this);
        };
        CoChartjsFactory.prototype.makeComponent = function (tn, cvt) {
            return new ChartjsElement(cvt, tn);
        };
        return CoChartjsFactory;
    }());
    exports.default = CoChartjsFactory;
});
define("coml/bridge/ui5/UI5CoElement", ["require", "exports", "coml/element/BaseCoElement", "coml/TargetNode", "coml/bridge/ui5/UI5Attachment", "coml/bridge/ui5/UI5ControlClass"], function (require, exports, BaseCoElement_5, TargetNode_8, UI5Attachment_2, UI5ControlClass_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UI5CoElement = void 0;
    var UI5CoElement = /** @class */ (function (_super) {
        __extends(UI5CoElement, _super);
        //protected settings={};
        function UI5CoElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        UI5CoElement.prototype.getControl = function () {
            return this.control;
        };
        UI5CoElement.prototype.getScriptText = function (scriptElem) {
            var script;
            for (var i = 0; i < scriptElem.childNodes.length; i++) {
                var cn = scriptElem.childNodes[i];
                if (cn.nodeType == Node.TEXT_NODE) {
                    //console.log(cn.nodeValue);
                    if (!script)
                        script = cn.nodeValue;
                    else
                        script += ('\n' + cn.nodeValue);
                }
            }
            return script;
        };
        /**
         * Fetch settings from any <scrip> block of our snode.
         *
         * @returns the Settings object needed to initialize the UI5 Control that we will host
         */
        UI5CoElement.prototype.getSettings = function () {
            var _a = (0, TargetNode_8.ctn)(this), tn = _a.tn, cvt = _a.cvt;
            var script;
            for (var i = 0; i < tn.snode.children.length; i++) {
                if (tn.snode.children[i].tagName.toLowerCase() == 'script') {
                    script = this.getScriptText(tn.snode.children[i]);
                }
            }
            var settings = {};
            if (script) {
                cvt.getThis().settings = function (incoming) {
                    settings = incoming;
                };
                cvt.executeScript(script);
            }
            return settings;
        };
        UI5CoElement.prototype.renderUI5Control = function (rm, control, onControlDomRefAvailable, dontCopyAttrToCtrl) {
            var oCore = sap.ui.getCore();
            var oRenderManager = oCore.createRenderManager();
            oRenderManager.renderControl(control);
            var dummy = document.createElement('div');
            if (!control.getDomRef()) { // first time, only the RM has the dom ref, so flush to a dummy
                try {
                    oRenderManager.flush(dummy, false, true);
                }
                catch (x) {
                    // this exception happens on sap.m.MultiComboBox. The Tokenizer tries to install a listener but the element is ref is null.
                    // ignoring the error seems to work
                    console.error(x);
                }
                if (dummy.children.length > 0) {
                    var rendered = dummy.children[0];
                    rendered.remove();
                    onControlDomRefAvailable(rendered);
                    if (!dontCopyAttrToCtrl)
                        this.getCvt().copyAttrExceptToTNode(rendered, this.getTN().snode, ['id', 'class']);
                    rm.insertRendered(rendered);
                }
            }
            else {
                oRenderManager.flush(dummy, false, true); // doesnt do anything 
                onControlDomRefAvailable(control.getDomRef());
                rm.insertRendered(control.getDomRef());
            }
            oRenderManager.destroy();
        };
        UI5CoElement.wrapperClass = function () {
            if (!UI5CoElement.WrapperClass)
                UI5CoElement.WrapperClass = (0, UI5ControlClass_2.extendUI5)("coml.UI5WRapper"); //(sap.ui.core.Control as any).extend("coml.UI5WRapper",Object.assign(UI5Control));
            return UI5CoElement.WrapperClass;
        };
        /**
         * WRap the actual control by one that stops the invalidation() of controls to propagate to the top level bridge,
         * which causes a repaint of the entire COML app. We set display:contents on our element so that the wrapping has no affect as
         * far as html layouting is concerned.
         *
         * @param towrap
         * @returns
         */
        UI5CoElement.prototype.wrapControl = function (towrap) {
            var WrapperClass = UI5CoElement.wrapperClass();
            var wrapper = new (/** @class */ (function (_super) {
                __extends(class_5, _super);
                function class_5() {
                    var _this = _super.call(this) || this;
                    _this.renderCount = 0;
                    // delegate UI5 rendering back to the attachment
                    _this.setControlOptions({
                        onPreRender: function () { },
                        onRender: function (rm) {
                            rm
                                .openStart('div', _this)
                                .class('u-ui5-wrap')
                                .style('display', 'contents')
                                .openEnd();
                            /*
                            let ref=(this as any as sap.ui.core.Control).getDomRef();
                            console.log(`REF[${this.getId()}]==`+ref); */
                            if (_this.renderCount) {
                                //console.log(`renderCount=${this.renderCount} - renderiing wrapped`);
                                rm.renderControl(towrap);
                            }
                            else {
                                Promise.resolve()
                                    .then(function () {
                                    //console.log(`renderCount=${this.renderCount} - invalidating`);
                                    _super.prototype.invalidate.call(_this);
                                });
                            }
                            rm.close('div');
                        },
                        onPostRender: function (ref) {
                            _this.renderCount++;
                            //console.log(`renderCount=${this.renderCount} - onPostRender`);
                        },
                    });
                    return _this;
                }
                class_5.prototype.invalidate = function () {
                    // deliberate do nothing - this stops the first time invalidation all the way to the bridger, which causes COML apps to lose state
                    //super.invalidate();
                };
                return class_5;
            }(WrapperClass)))();
            towrap.setParent(wrapper, 'children', true);
            return wrapper;
        };
        UI5CoElement.prototype.wrap = function (towrap) {
            if (!this.controlOrItsWrapper) {
                if (this.attr('wrap', true)) {
                    this.controlOrItsWrapper = this.wrapControl(towrap);
                }
                else {
                    this.controlOrItsWrapper = towrap;
                }
            }
            return this.controlOrItsWrapper;
        };
        UI5CoElement.prototype.onRender = function (rm) {
            var _this = this;
            var controlToRender;
            if (!this.control) {
                this.control = this.createControl();
                if (this.control) {
                    controlToRender = this.wrap(this.control);
                    var elem = this.getTN().snode;
                    if (elem.classList && elem.classList.length) {
                        for (var i = 0; i < elem.classList.length; i++) {
                            this.control.addStyleClass(this.getCvt().expandString(elem.classList[i], this.getTN()));
                        }
                    }
                    //this.control.placeAt(this.getTN().tnode);
                    var bridge = UI5Attachment_2.UI5Attachment.getBridge();
                    controlToRender.setParent(bridge, 'children', true);
                }
            }
            else {
                controlToRender = this.wrap(this.control);
            }
            if (controlToRender) {
                //console.log(`<-- end len=${pe.children.length}`);
                this.renderUI5Control(rm, controlToRender, function (ui5elem) {
                    _this.getTN().tnode = ui5elem;
                    ui5elem.setAttribute('data-coid', _this.getTN().getId());
                });
            }
        };
        /**
         * Create the UI5 control.
         * Override if you want to return your own control.
         *
         * @returns
         */
        UI5CoElement.prototype.createControl = function () {
            var ui5class = this.attr('ui5class');
            var path = ui5class.split('.');
            var obj = globalThis;
            for (var i = 0; i < path.length; i++) {
                obj = obj[path[i]];
                if (!obj) {
                    console.warn("ui5control - cant find object ".concat(path[i], " in ui5class=[").concat(ui5class, "] position ").concat(i));
                    return;
                }
            }
            return new obj(undefined, this.getSettings());
        };
        UI5CoElement.prototype.cleanup = function () {
            if (this.control)
                this.control.destroy(true);
        };
        return UI5CoElement;
    }(BaseCoElement_5.BaseCoElement));
    exports.UI5CoElement = UI5CoElement;
    var UI5CoElementFactory = /** @class */ (function () {
        function UI5CoElementFactory() {
        }
        UI5CoElementFactory.prototype.makeComponent = function (tn, cvt) {
            switch (tn.snode.tagName.toLowerCase()) {
                case 'ui5': return new UI5CoElement(cvt, tn);
            }
        };
        UI5CoElementFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('ui5', this);
        };
        return UI5CoElementFactory;
    }());
    exports.default = UI5CoElementFactory;
});
define("coml/element/CoInsert", ["require", "exports", "coml/Asset", "coml/Implementations", "coml/TargetNode", "coml/element/BaseCoElement"], function (require, exports, Asset_7, Implementations_13, TargetNode_9, BaseCoElement_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoInsertElement = void 0;
    /**
     * <co-insert src="asset">
     *
     *  Will insert a DocumentAsset into the sdom and rebuild it.
     *  This is for importing resources , the current converter will treat the imported document as if it was part
     *  of the sdom, the document of the imported item replacing the snode at this point.
     *
     *  Note the object therefore shares the 'this' of the component to which it is being inserted.
     *  (This is different from an import or an attach)
     */
    var CoInsertElement = /** @class */ (function (_super) {
        __extends(CoInsertElement, _super);
        function CoInsertElement(cvt, tn) {
            var _this = _super.call(this, cvt, tn) || this;
            _this.src = (0, TargetNode_9.getAttr)(cvt, tn.snode, 'src', undefined, tn);
            if (_this.src) {
                var assetId = (0, Asset_7.restoreAssetID)(_this.src);
                var asset = Implementations_13.Implementations.getAssetFactory()
                    .get(assetId);
                if (!asset) {
                    _this.error = "co-insert: can't find an asset with id =".concat(_this.src);
                    return _this;
                }
                if (!(0, Asset_7.isDocumentAsset)(asset)) {
                    _this.error = "co-insert: asset with id =".concat(_this.src, " is not a DocumentAsset");
                    return _this;
                }
                asset.getDocument()
                    .then(function (doc) {
                    var replaced = _this.tn.snode;
                    if (_this.tn.snode instanceof HTMLElement) {
                        replaced = _this.tn.snode; // before we replace, store original so find during mutation finds it.
                    }
                    _this.tn.snode = doc.body;
                    _this.tn.component = _this.cvt.makeCoElement(_this.tn);
                    _this.tn.replaced = replaced;
                    //this.cvt.rebuild(this.tn);
                    _this.cvt.invalidate(_this.tn);
                })
                    .catch(function (error) {
                    _this.error = "co-insert: asset with id =".concat(_this.src, " error=").concat(error);
                    _this.cvt.invalidate(_this.tn);
                });
            }
            return _this;
        }
        CoInsertElement.prototype.onRender = function (rm) {
            if (this.error) {
                rm.openStart('div', this)
                    .class('u-coml-error')
                    .openEnd()
                    .text(this.error);
                rm.close('div');
            }
            else {
                rm.openStart('div', this)
                    .class('u-co-insert')
                    .openEnd()
                    .close('div');
            }
        };
        return CoInsertElement;
    }(BaseCoElement_6.BaseCoElement));
    exports.CoInsertElement = CoInsertElement;
    ;
    var InsertFactory = /** @class */ (function () {
        function InsertFactory() {
        }
        InsertFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('co-insert', this);
        };
        InsertFactory.prototype.makeComponent = function (tn, cvt) {
            return new CoInsertElement(cvt, tn);
        };
        return InsertFactory;
    }());
    exports.default = InsertFactory;
});
define("coml/element/For", ["require", "exports", "coml/element/BaseCoElement", "coml/TargetNode"], function (require, exports, BaseCoElement_7, TargetNode_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    var ForElement = /** @class */ (function (_super) {
        __extends(ForElement, _super);
        function ForElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        ForElement.prototype.onRender = function (rm) {
            var _a = (0, TargetNode_10.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            rm.openStart('div', this)
                .class('co-for');
            cvt.copyAttrExcept(rm, tn.snode);
            cvt.encodeWSE(rm, tn);
            rm.openEnd();
            this.countername = (0, TargetNode_10.getAttr)(cvt, tn.snode, 'countername', '_ws_loop_count', tn);
            var inthis = (0, TargetNode_10.getAttr)(cvt, tn.snode, 'inthis');
            if (inthis)
                this.list = cvt.getThis()[inthis];
            if (!this.list) {
                this.repeat = (0, TargetNode_10.getAttr)(cvt, tn.snode, 'ws-count', 0, tn) || (0, TargetNode_10.getAttr)(cvt, tn.snode, 'count', 0, tn);
                this.ins = (0, TargetNode_10.getAttr)(cvt, tn.snode, 'in');
                if (this.ins) {
                    this.ins = this.ins.split(',');
                    this.repeat = this.ins.length;
                }
                else {
                    this.ins = [];
                    for (var i = 0; i < this.repeat; i++) {
                        this.ins.push(i);
                    }
                }
            }
            else {
                this.ins = this.list;
                this.repeat = this.list.length;
            }
            this.counter = 0;
            for (var i = 0; i < this.repeat; i++) { // execute the loop. save the counter 
                var x = (this.ins.length) ? this.ins[i % this.ins.length] : i;
                cvt.getThis()[this.countername] = x;
                this.counter = x;
                cvt.renderChildren(rm, tn, i);
            }
            rm.close('div');
        };
        return ForElement;
    }(BaseCoElement_7.BaseCoElement));
    var WSLoopFactory = /** @class */ (function () {
        function WSLoopFactory() {
        }
        WSLoopFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('for', this);
        };
        WSLoopFactory.prototype.makeComponent = function (tn, cvt) {
            switch (tn.snode.tagName.toLowerCase()) {
                case 'for': return new ForElement(cvt, tn);
            }
        };
        return WSLoopFactory;
    }());
    exports.default = WSLoopFactory;
});
define("coml/element/Pages", ["require", "exports", "coml/Asset", "coml/TargetNode", "coml/element/BaseCoElement", "coml/Implementations", "coml/impl/DocumentAssetImpl"], function (require, exports, Asset_8, TargetNode_11, BaseCoElement_8, Implementations_14, DocumentAssetImpl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A component which contains other coml pages. Any page can be shown by calling the show() method.
     */
    var Pages = /** @class */ (function (_super) {
        __extends(Pages, _super);
        function Pages(cvt, tn) {
            var _this = _super.call(this, cvt, tn) || this;
            _this.cache = new Map();
            _this.name = (0, TargetNode_11.getAttr)(cvt, tn.snode, 'name', undefined, tn);
            _this.local = (0, TargetNode_11.getAttr)(cvt, tn.snode, 'local', false, tn);
            return _this;
            //this.registerServiceEvents();
        }
        /**
         * Shows direct html content inside this page.
         *
         * @param html
         * @param animation
         */
        Pages.prototype.showHtml = function (html, animation, params) {
            var anonAsset = new /** @class */ (function (_super) {
                __extends(class_6, _super);
                function class_6() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_6.prototype.getText = function () {
                    return Promise.resolve(html);
                };
                return class_6;
            }(DocumentAssetImpl_2.DocumentAssetImpl))({ name: '__anon', type: Asset_8.AssetType.page });
            this.showAsset(anonAsset, animation, true, params);
        };
        Pages.prototype.showAsset = function (asset, animation, dontReuse, params) {
            var _this = this;
            if ((0, Asset_8.isCoElementAsset)(asset)) {
                var asControl = void 0;
                if (!dontReuse) {
                    var control = this.fromCache(asset.getId());
                    if (control) {
                        asControl = Promise.resolve(control);
                    }
                }
                if (!asControl)
                    asControl = asset.asCoElement(undefined, function (cvt) {
                        if (params) {
                            cvt.addOnThisCreatedListener(function (t) {
                                t.parameters = params;
                            });
                        }
                    });
                asControl
                    .then(function (control) {
                    control.getTN().data("__asset_id", asset.getId()); // note: serializing the assetid causes a problem , ui5 tries to bind it (I think '{' throws it)})
                    //console.log(`---id1=${control.data("__asset_id")}`);
                    //if (callback) {
                    //    callback(control, ((control as any).getThis) ? (control as any).getThis() : undefined);
                    //}
                    _this.toCache(asset.getId(), control);
                    _this.setChildControl(control, animation);
                    //console.log(`---id2=${control.data("__asset_id")}`);
                    _this.getCvt().getThis().dispatchEvent('pagechanged', { asset: asset });
                });
            }
        };
        Pages.prototype.show = function (pageid, animation, dontReuse, params) {
            var assetid;
            if (typeof pageid == 'string' && pageid.indexOf('{') < 0) {
                // its not a stringified id
                assetid = { type: Asset_8.AssetType.page, name: pageid };
            }
            else {
                assetid = pageid;
            }
            var asset = Implementations_14.Implementations.getAssetFactory().get(assetid);
            if (!asset && typeof pageid == 'string') {
                // try converting to an asset id
                asset = Implementations_14.Implementations.getAssetFactory().get({ type: Asset_8.AssetType.indexpage, name: pageid });
            }
            if (asset)
                this.showAsset(asset, animation, dontReuse, params);
        };
        /**
         * Sets a new child control, or removes current child it if `control` is null.
         */
        Pages.prototype.setChildControl = function (control, animation) {
            var _this = this;
            var _a = (0, TargetNode_11.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            var lastControl;
            //let changed=(this.child!=control);
            if (this.child) {
                lastControl = this.child;
                cvt.detach(this.child);
            }
            this.child = control;
            if (this.child) {
                cvt.attach(tn.tnode, this.child)
                    .then(function () {
                    _this.animate(_this.child, animation);
                    //cvt.invalidate(tn);
                });
            }
            else {
                cvt.invalidate(tn);
            }
        };
        Pages.prototype.animateOld = function (control, animation) {
            if (animation) { // animation
                var lastEventDelegate = control.getTN().data('__animator');
                if (lastEventDelegate) {
                    control.getTN().removeListener('onPostRender', lastEventDelegate);
                }
                control.getTN().addListener('onPostRender', lastEventDelegate = function (domRef) {
                    domRef.classList.add('co-animation-' + animation);
                    setTimeout(function () {
                        domRef.classList.remove('co-animation-' + animation);
                    }, 500);
                });
                control.getTN().data('__animator', lastEventDelegate); // so we can remove the function again
            }
        };
        Pages.prototype.animate = function (control, animation) {
            if (animation) { // animation
                var num = Pages.anum++;
                control.$(null, '__animator', function (elem) {
                    //let aid=(control.getTN().snode as Element).getAttribute('data-asset-id');
                    //console.log('-----ANIM['+aid+']----['+num+']='+animation);
                    elem.classList.add('co-animation-' + animation);
                    setTimeout(function () {
                        control.$(null, '__animator'); // remove 
                        elem.classList.remove('co-animation-' + animation);
                    }, 500);
                });
            }
            else {
                control.$(null, '__animator');
            }
        };
        Pages.prototype.toCache = function (assetId, control) {
            var key = (0, Asset_8.stringifyAssetID)(assetId);
            this.cache.set(key, control);
        };
        Pages.prototype.fromCache = function (assetId) {
            var key = (0, Asset_8.stringifyAssetID)(assetId);
            return this.cache.get(key);
        };
        Pages.prototype.onRender = function (rm) {
            rm.openStart('div', this);
            rm.class('u-ws-page-container');
            if (!this.child)
                rm.class('u-ws-nochild');
            rm.copyAttrExcept(this, ['id']);
            this.cvt.encodeWSE(rm, this.tn);
            rm.openEnd();
            this.getCvt().renderChildren(rm, this.getTN());
            rm.close('div');
        };
        Pages.anum = 0;
        return Pages;
    }(BaseCoElement_8.BaseCoElement));
    var PagesFactory = /** @class */ (function () {
        function PagesFactory() {
        }
        PagesFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('pages', this);
        };
        PagesFactory.prototype.makeComponent = function (tn, cvt) {
            return new Pages(cvt, tn);
        };
        return PagesFactory;
    }());
    exports.default = PagesFactory;
});
define("coml/html/DocumentElement", ["require", "exports", "coml/html/HtmlElement"], function (require, exports, HtmlElement_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentElementFactory = void 0;
    /**
    *   DocumentElement handles a document node. It is rendered as a <div>
    
        @deprecated - not used. The document node is now handled by the This object.
    */
    var DocumentElement = /** @class */ (function (_super) {
        __extends(DocumentElement, _super);
        function DocumentElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        DocumentElement.prototype.start = function (rm, cvt, elem) {
            rm.openStart('div', this)
                .class('u-document');
            if ((elem instanceof Document) && elem.body) {
                cvt.copyAttrExcept(rm, elem.body, ['id'], this.tn);
            }
            rm.openEnd();
        };
        DocumentElement.prototype.end = function (rm, cvt, elem) {
            rm.close('div');
        };
        DocumentElement.prototype.onPostRender = function (ref) {
            var _this = this;
            if (this.cvt) {
                Promise.resolve()
                    .then(function () {
                    _this.cvt.onAfterRender();
                });
            }
        };
        return DocumentElement;
    }(HtmlElement_3.HtmlElement));
    /**
    *
    */
    var DocumentElementFactory = /** @class */ (function (_super) {
        __extends(DocumentElementFactory, _super);
        function DocumentElementFactory() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DocumentElementFactory.prototype.makeComponent = function (tn, cvt) {
            return new DocumentElement(cvt, tn);
        };
        return DocumentElementFactory;
    }(HtmlElement_3.HtmlElementFactory));
    exports.DocumentElementFactory = DocumentElementFactory;
});
define("demo/FromCodeAssetFactory", ["require", "exports", "coml/Asset", "coml/impl/SimpleAssetFactory"], function (require, exports, Asset_9, SimpleAssetFactory_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isFromCodeAssetFactory = exports.FromCodeAssetFactory = void 0;
    /**
     * Asset factory that returns code from a CoCode element
     */
    var FromCodeAssetFactory = /** @class */ (function (_super) {
        __extends(FromCodeAssetFactory, _super);
        function FromCodeAssetFactory() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.added = new Map();
            return _this;
        }
        FromCodeAssetFactory.prototype.toKey = function (assetId) {
            var aid0 = (0, Asset_9.restoreAssetID)(assetId); // not in any particular key order
            var aid = {
                name: aid0.name,
                type: aid0.type
            };
            // as assetIds are element ids, they cant have '.' (querySelector will treat it as a class) - so use _ as a substitute
            aid.name = aid.name.replace('_', '.');
            var sid = (0, Asset_9.stringifyAssetID)(aid);
            return sid;
        };
        FromCodeAssetFactory.prototype.addAsset = function (assetId, getfn) {
            //console.log(`--ADDING(${sid})`);
            this.added.set(this.toKey(assetId), getfn);
        };
        FromCodeAssetFactory.prototype.get = function (assetId) {
            var fn = this.added.get(this.toKey(assetId));
            //console.log(`--    LU(${sid})==>${(fn)?'FOUND':'BYPASS'} `);
            if (fn)
                return fn((0, Asset_9.restoreAssetID)(assetId));
            return _super.prototype.get.call(this, assetId);
        };
        return FromCodeAssetFactory;
    }(SimpleAssetFactory_2.SimpleAssetFactory));
    exports.FromCodeAssetFactory = FromCodeAssetFactory;
    function isFromCodeAssetFactory(obj) {
        return obj && typeof obj == 'object' && 'addAsset' in obj;
    }
    exports.isFromCodeAssetFactory = isFromCodeAssetFactory;
});
define("demo/DemoConverterImpl", ["require", "exports", "coml/impl/ConverterImpl"], function (require, exports, ConverterImpl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DemoConverterImpl = void 0;
    /**
     * A Converter for the demo. Checks for CoElementFactries in the globalThis so that elements written in the demo Apps can be loaded.
     */
    var DemoConverterImpl = /** @class */ (function (_super) {
        __extends(DemoConverterImpl, _super);
        function DemoConverterImpl() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Loads a js script using AMD and creates a CoElement out of the loaded module (Module.default)
         * This is then installed on this instance's element factories.
         * This function also pushes the promise onto this.loadElementPromises, which can be used
         * to wait for all ws-elements to load before rendering the template.
         *
         * @param js
         * @returns
         */
        DemoConverterImpl.prototype.loadMarkupFactory = function (js) {
            if (globalThis[js] && typeof globalThis[js] == 'function') {
                return Promise.resolve(new globalThis[js]);
            }
            return _super.prototype.loadMarkupFactory.call(this, js);
        };
        return DemoConverterImpl;
    }(ConverterImpl_2.ConverterImpl));
    exports.DemoConverterImpl = DemoConverterImpl;
});
define("demo/DemoApp", ["require", "exports", "coml/bridge/ui5/UI5Attachment", "demo/FromCodeAssetFactory", "coml/impl/AttachmentImpl", "coml/impl/DefaultImplementations", "coml/impl/JQueryAjax", "coml/Implementations", "coml/ComlStartup", "coml/element/BaseCoElement", "demo/DemoConverterImpl"], function (require, exports, UI5Attachment_3, FromCodeAssetFactory_1, AttachmentImpl_4, DefaultImplementations_2, JQueryAjax_2, Implementations_15, ComlStartup_1, BaseCoElement_9, DemoConverterImpl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The starting point for the demo app.
     *
     * We install our special FromCodeAssetFactory so that the CoCode elements can deliver user code on the fly to
     * display in <pages>. Also, we add the 'expose' function.
     */
    var DemoApp = /** @class */ (function (_super) {
        __extends(DemoApp, _super);
        function DemoApp(dontUseUI5) {
            return _super.call(this, dontUseUI5) || this;
        }
        /**
         * Override so we can add our special asset factory, which will serve up modified code assets straight from
         * the <co-code></co-code> elements.
         */
        DemoApp.prototype.configureImplementations = function () {
            /* set up the implemntations of ajax, assets, Converter and Render */
            var that = this;
            new (/** @class */ (function (_super) {
                __extends(class_7, _super);
                function class_7() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_7.prototype.createAttachmentImpl = function () {
                    if (!that.dontUseUI5)
                        return new UI5Attachment_3.UI5Attachment();
                    return new AttachmentImpl_4.AttachmentImpl();
                };
                class_7.prototype.createConverterImpl = function (copyStateFrom) {
                    return new DemoConverterImpl_1.DemoConverterImpl(copyStateFrom);
                };
                return class_7;
            }(DefaultImplementations_2.DefaultImplementations)))(new (/** @class */ (function (_super) {
                __extends(class_8, _super);
                function class_8() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_8.prototype.assetsFolder = function (assetId) {
                    return this.getBasePath() + 'demo/html/';
                };
                return class_8;
            }(JQueryAjax_2.JQueryAjax)))(), new FromCodeAssetFactory_1.FromCodeAssetFactory());
            this.addComlObjectsToGlobalScope();
        };
        DemoApp.prototype.addComlObjectsToGlobalScope = function () {
            globalThis.BaseCoElement = BaseCoElement_9.BaseCoElement;
            globalThis.expose = function () {
                var e_18, _a;
                var classes = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    classes[_i] = arguments[_i];
                }
                try {
                    for (var classes_1 = __values(classes), classes_1_1 = classes_1.next(); !classes_1_1.done; classes_1_1 = classes_1.next()) {
                        var clazz = classes_1_1.value;
                        if (clazz.name)
                            globalThis[clazz.name] = clazz;
                        else {
                            console.log('Unable to hoist class');
                            console.log(clazz);
                        }
                    }
                }
                catch (e_18_1) { e_18 = { error: e_18_1 }; }
                finally {
                    try {
                        if (classes_1_1 && !classes_1_1.done && (_a = classes_1.return)) _a.call(classes_1);
                    }
                    finally { if (e_18) throw e_18.error; }
                }
            };
        };
        DemoApp.prototype.attachTo = function (id, page) {
            var inserter = Implementations_15.Implementations.createAttachment();
            var element = document.querySelector("#".concat(id));
            element.innerHTML = '';
            inserter.attach(element, page);
        };
        return DemoApp;
    }(ComlStartup_1.default));
    exports.default = DemoApp;
});
define("demo/MyPage", ["require", "exports", "coml/impl/BaseThis", "coml/impl/RenderImpl"], function (require, exports, BaseThis_2, RenderImpl_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Demonstrates how to use a Typescript object as the 'this' of an html page.
     *
    ```html
    <html>
    <head>
        <meta name="thisclass" content="demo/MyPage">
      
    </head>
    
    <body class="demo-base">
        <h2>How to use a Typescript class instead of an inline script</h2>
    </body>
    
    </html>
    ```
     */
    var MyPage = /** @class */ (function (_super) {
        __extends(MyPage, _super);
        function MyPage(cvt, stateFrom) {
            var _this = _super.call(this, cvt, stateFrom) || this;
            _this.address = 'wa';
            console.log("Constructed");
            var rm = new RenderImpl_2.RenderImpl(null, null);
            console.log(rm);
            return _this;
        }
        MyPage.prototype.showClick = function (ev) {
            console.log('Here 2=' + this.name);
        };
        return MyPage;
    }(BaseThis_2.default));
    exports.default = MyPage;
});
define("demo/element/CoCode", ["require", "exports", "coml/Asset", "coml/element/BaseCoElement", "coml/impl/DocumentAssetImpl", "coml/Implementations", "coml/TargetNode", "demo/FromCodeAssetFactory"], function (require, exports, Asset_10, BaseCoElement_10, DocumentAssetImpl_3, Implementations_16, TargetNode_12, FromCodeAssetFactory_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Displays code using codemirror
     *
     * Put these script tags in your html before using:
     *
     * ```html
     *     <!--codemirror and friends-->
        <script src='https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js'></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
    
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/css/css.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/htmlmixed/htmlmixed.js"></script>
    
        <!-- js beautify for code mirror -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-css.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-html.js"></script>
    
     * ```
    
        Then example usage :
    
    ```html
        <code  src="tabs.html" mode="htmlmixed" lineNumbers="true" tabSize="2"></code>
    ```
     *
     */
    var CodeElement = /** @class */ (function (_super) {
        __extends(CodeElement, _super);
        function CodeElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        CodeElement.prototype.setCodeText = function (code, mode) {
            var fn = 'html_beautify';
            if (mode == 'javascript')
                fn = 'js_beautify';
            if (this.codeMirror && window.html_beautify) {
                code = window[fn](code, {
                    "indent_size": "2",
                    "indent_char": " ",
                    "max_preserve_newlines": "5",
                    "preserve_newlines": true,
                    "keep_array_indentation": false,
                    "break_chained_methods": false,
                    "indent_scripts": "normal",
                    "brace_style": "collapse",
                    "space_before_conditional": true,
                    "unescape_strings": false,
                    "jslint_happy": false,
                    "end_with_newline": false,
                    "wrap_line_length": "0",
                    "indent_inner_html": false,
                    "comma_first": false,
                    "e4x": false,
                    "indent_empty_lines": false
                });
            }
            if (this.codeMirror) {
                var lines = code.split(/\r\n|\r|\n/).length;
                if (lines < 10)
                    code = code + "\n\n\n\n\n\n\n\n";
                this.codeMirror.setValue(code);
            }
        };
        CodeElement.prototype.onRender = function (rm) {
            rm.openStart('div', this)
                .class('u-co-code')
                .copyAttrExcept(this)
                .openEnd()
                .openStart('textarea')
                .class('u-codecontrol')
                .copyAttrExcept(this)
                .openEnd()
                .close('textarea')
                .close('div');
        };
        CodeElement.prototype.getContent = function () {
            var text = this.getTN().snode.innerHTML;
            if (text)
                text = text.trim();
            if (text.length > 0)
                return text.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
        };
        CodeElement.prototype.getCode = function () {
            var src = this.attr('src');
            if (src) {
                var assetId = (0, Asset_10.restoreAssetID)(src);
                var asset = Implementations_16.Implementations.getAssetFactory()
                    .get(assetId);
                if (!asset) {
                    console.error("co-code: can't find an asset with id =".concat(src));
                    return;
                }
                if ((0, Asset_10.isTextAsset)(asset)) {
                    return asset.getText();
                }
            }
            return Promise.resolve(this.getContent());
        };
        CodeElement.prototype.getCodeSettings = function () {
            var _a = (0, TargetNode_12.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            return {
                lineWrapping: this.attr('lineWrapping', false),
                lineNumbers: this.attr('lineNumbers', true),
                //foldGutter:this.attr('foldGutter',false),
                tabSize: this.attr('tabSize', 2),
                theme: this.attr('theme', 'default'),
                mode: this.attr('mode', 'htmlmixed'),
                //gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            };
        };
        /**
         * Override if you need to be called on onAfterRendering(). ref is this control's domref
         *
         * @param ref
         */
        CodeElement.prototype.onPostRender = function (ref) {
            var _this = this;
            var elem = ref;
            if (elem)
                elem = elem.querySelector('textarea');
            if (elem) {
                var settings_1 = this.getCodeSettings();
                this.codeMirror = CodeMirror.fromTextArea(elem, settings_1);
                var code = this.getCode();
                if (code) {
                    code.then(function (text) {
                        if (text) {
                            _this.setCodeText(text, settings_1.mode);
                        }
                    });
                }
            }
            this.registerContentAsAsset();
        };
        CodeElement.prototype.getAssetId = function () {
            return /*this.getAttr('src')||*/ this.attr('id');
        };
        /**
         * Register a callback with our demo asset factory so that when a document is
         * retrived for execution, we return the (possibly user modified) contents from
         * code mirror.
         */
        CodeElement.prototype.registerContentAsAsset = function () {
            var assf = Implementations_16.Implementations.getAssetFactory();
            if ((0, FromCodeAssetFactory_2.isFromCodeAssetFactory)(assf)) {
                var id = this.getAssetId();
                if (id) {
                    var that_2 = this;
                    assf.addAsset(id, function (assetId) {
                        return new /** @class */ (function (_super) {
                            __extends(class_9, _super);
                            function class_9() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            class_9.prototype.getText = function () {
                                return Promise.resolve(that_2.codeMirror.getValue());
                            };
                            return class_9;
                        }(DocumentAssetImpl_3.DocumentAssetImpl))((0, Asset_10.restoreAssetID)(assetId));
                    });
                }
            }
        };
        CodeElement.prototype.getCodeMirror = function () {
            return this.codeMirror;
        };
        return CodeElement;
    }(BaseCoElement_10.BaseCoElement));
    /**
     * The factory class is registered into the UI5Converter, example when imported via a script in the <head>
     *
     * ```
     * <head>
        <script>
            this.import('demo/element/CoCode');
        </script>
      </head>
     * ```
     *
     */
    var CoCodeFactory = /** @class */ (function () {
        function CoCodeFactory() {
        }
        CoCodeFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('co-code', this);
        };
        CoCodeFactory.prototype.makeComponent = function (tn, cvt) {
            return new CodeElement(cvt, tn);
        };
        return CoCodeFactory;
    }());
    exports.default = CoCodeFactory;
});
define("demo/element/CoError", ["require", "exports", "coml/element/BaseCoElement", "coml/TargetNode"], function (require, exports, BaseCoElement_11, TargetNode_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Displays an error/success message
     *
     */
    var ErrorElement = /** @class */ (function (_super) {
        __extends(ErrorElement, _super);
        function ErrorElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        ErrorElement.prototype.errorAsText = function (error) {
            if (typeof error == 'string')
                return error;
            if (typeof error.message == 'string')
                return error.message;
        };
        /**
         * Adds an message to the code.
         *
         * @param message The string or thrown error to show.
         * @param errtype If the error happened at compile or run time.
         */
        ErrorElement.prototype.setMessage = function (message, errtype) {
            var _a = (0, TargetNode_13.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            var ctag = tn.tnode;
            if (!message) {
                // remove
                var etag = ctag.querySelector('div.u-code-error');
                if (etag) {
                    etag.remove();
                }
            }
            else {
                var etag_1 = ctag.querySelector('div.u-code-error');
                if (!etag_1) {
                    etag_1 = document.createElement('div');
                    etag_1.className = '';
                    ctag.appendChild(etag_1);
                }
                etag_1.classList.add('u-code-error');
                etag_1.classList.add(errtype);
                etag_1.textContent = this.errorAsText(message);
                window.setTimeout(function () {
                    etag_1.classList.add('u-fade');
                }, 2000);
            }
        };
        ErrorElement.prototype.onRender = function (rm) {
            rm.openStart('div', this)
                .class('u-co-error')
                .copyAttrExcept(this)
                .openEnd()
                .close('div');
        };
        return ErrorElement;
    }(BaseCoElement_11.BaseCoElement));
    /**
     * The factory class is registered into the UI5Converter, example when imported via a script in the <head>
     *
     * ```
     * <head>
        <script>
            this.import('demo/element/CoError');
        </script>
      </head>
     * ```
     *
     */
    var CoErrorFactory = /** @class */ (function () {
        function CoErrorFactory() {
        }
        CoErrorFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('co-error', this);
        };
        CoErrorFactory.prototype.makeComponent = function (tn, cvt) {
            return new ErrorElement(cvt, tn);
        };
        return CoErrorFactory;
    }());
    exports.default = CoErrorFactory;
});
define("demo/element/CoMarkdown", ["require", "exports", "coml/Asset", "coml/element/BaseCoElement", "coml/Implementations", "coml/TargetNode"], function (require, exports, Asset_11, BaseCoElement_12, Implementations_17, TargetNode_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     *
     */
    var MarkdownElement = /** @class */ (function (_super) {
        __extends(MarkdownElement, _super);
        function MarkdownElement(cvt, tn) {
            return _super.call(this, cvt, tn) || this;
        }
        MarkdownElement.prototype.onRender = function (rm) {
            rm.openStart('div', this)
                .class('u-markdown')
                .copyAttrExcept(this)
                .openEnd()
                .close('div');
        };
        MarkdownElement.prototype.getContent = function () {
            var text;
            if (this.getTN().snode.childNodes) {
                var cn = this.getTN().snode.childNodes;
                text = '';
                for (var i = 0; i < cn.length; i++) {
                    if (cn[i].nodeType == Node.TEXT_NODE)
                        text += cn[i].nodeValue;
                }
                return text;
            }
            if (text)
                text = text.trim();
            if (text.length > 0)
                return text;
        };
        MarkdownElement.prototype.getMarkdown = function () {
            var _a = (0, TargetNode_14.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            var src = (0, TargetNode_14.getAttr)(cvt, tn.snode, 'src');
            if (src) {
                var assetId = (0, Asset_11.restoreAssetID)(src);
                var asset = Implementations_17.Implementations.getAssetFactory()
                    .get(assetId);
                if (!asset) {
                    console.error("co-code: can't find an asset with id =".concat(src));
                    return;
                }
                if ((0, Asset_11.isTextAsset)(asset)) {
                    return asset.getText();
                }
            }
            return Promise.resolve(this.getContent());
        };
        MarkdownElement.prototype.getSettings = function () {
            var _a = (0, TargetNode_14.ctn)(this), cvt = _a.cvt, tn = _a.tn;
            return {};
        };
        /**
         * Override if you need to be called on onAfterRendering(). ref is this control's domref
         *
         * @param ref
         */
        MarkdownElement.prototype.onPostRender = function (ref) {
            var _this = this;
            var elem = ref;
            if (elem) {
                if (!this.converter)
                    this.converter = new showdown.Converter({});
                var code = this.getMarkdown();
                if (code) {
                    code.then(function (text) {
                        if (text) {
                            var html = _this.converter.makeHtml(text);
                            elem.innerHTML = html;
                        }
                    });
                }
            }
        };
        MarkdownElement.prototype.getShowdown = function () {
            return this.converter;
        };
        return MarkdownElement;
    }(BaseCoElement_12.BaseCoElement));
    /**
     * The factory class is registered into the UI5Converter, example when imported via a script in the <head>
     *
     * ```
     * <head>
        <script>
            this.import('demo/element/CoMarkdown');
        </script>
      </head>
     * ```
     *
     */
    var CoCodeFactory = /** @class */ (function () {
        function CoCodeFactory() {
        }
        CoCodeFactory.prototype.registerFactory = function (cvt) {
            cvt.registerFactory('co-markdown', this);
        };
        CoCodeFactory.prototype.makeComponent = function (tn, cvt) {
            return new MarkdownElement(cvt, tn);
        };
        return CoCodeFactory;
    }());
    exports.default = CoCodeFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21sL1RoaXMudHMiLCIuLi8uLi9zcmMvY29tbC9Db0VsZW1lbnRGYWN0b3J5LnRzIiwiLi4vLi4vc3JjL2NvbWwvR2V0LnRzIiwiLi4vLi4vc3JjL2NvbWwvUmVuZGVyLnRzIiwiLi4vLi4vc3JjL2NvbWwvU3RhdGVDaGFuZ2VyLnRzIiwiLi4vLi4vc3JjL2NvbWwvQ29udmVydGVyLnRzIiwiLi4vLi4vc3JjL2NvbWwvUGF0Y2gudHMiLCIuLi8uLi9zcmMvY29tbC9SZXBhaW50LnRzIiwiLi4vLi4vc3JjL2NvbWwvVGFyZ2V0Tm9kZS50cyIsIi4uLy4uL3NyYy9jb21sL0NvbWwudHMiLCIuLi8uLi9zcmMvY29tbC9Db0VsZW1lbnQudHMiLCIuLi8uLi9zcmMvY29tbC9EZXBlbmRlbmN5LnRzIiwiLi4vLi4vc3JjL2NvbWwvQXR0YWNobWVudC50cyIsIi4uLy4uL3NyYy9jb21sL2ltcGwvQXR0YWNobWVudEltcGwudHMiLCIuLi8uLi9zcmMvY29tbC9BdHRhY2hhYmxlLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9TdHlsZS50cyIsIi4uLy4uL3NyYy9jb21sL1RlbXBsYXRpemFibGUudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0Fzc2V0Q29FbGVtZW50RmFjdG9yeS50cyIsIi4uLy4uL3NyYy9jb21sL2h0bWwvRXZlbnRIYW5kbGVycy50cyIsIi4uLy4uL3NyYy9jb21sL2VsZW1lbnQvQmFzZUNvRWxlbWVudC50cyIsIi4uLy4uL3NyYy9jb21sL2h0bWwvSHRtbEVsZW1lbnQudHMiLCIuLi8uLi9zcmMvY29tbC9odG1sL0J5cGFzc0VsZW1lbnQudHMiLCIuLi8uLi9zcmMvY29tbC9odG1sL1NjcmlwdEVsZW1lbnQudHMiLCIuLi8uLi9zcmMvY29tbC9odG1sL0RvTm90UmVuZGVyRWxlbWVudC50cyIsIi4uLy4uL3NyYy9jb21sL2VsZW1lbnQvRXJyb3JDb0VsZW1lbnQudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0RlYnVnLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9Db252ZXJ0ZXJJbXBsLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9TaW5nbGVUcmVlLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9NZXJnZWRUcmVlLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9NZXJnZWRUYXJnZXROb2RlLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9UcmVlTWVyZ2UudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0JlZm9yZU1lcmdlVGFyZ2V0Tm9kZS50cyIsIi4uLy4uL3NyYy9jb21sL2ltcGwvQmFzZVRoaXMudHMiLCIuLi8uLi9zcmMvY29tbC9JbXBsZW1lbnRhdGlvbnMudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL1RhcmdldE5vZGVJbXBsLnRzIiwiLi4vLi4vc3JjL2NvbWwvQXNzZXQudHMiLCIuLi8uLi9zcmMvY29tbC9BamF4LnRzIiwiLi4vLi4vc3JjL2NvbWwvYnJpZGdlL3VpNS9VSTVDb250cm9sQ2xhc3MudHMiLCIuLi8uLi9zcmMvY29tbC9icmlkZ2UvdWk1L1VJNUF0dGFjaG1lbnQudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL1JlbmRlckltcGwudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0RlZmF1bHRJbXBsZW1lbnRhdGlvbnMudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0pRdWVyeUFqYXgudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0RvY3VtZW50Q29FbGVtZW50QXNzZXQudHMiLCIuLi8uLi9zcmMvY29tbC9pbXBsL0RvY3VtZW50QXNzZXRJbXBsLnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9TaW1wbGVBc3NldEZhY3RvcnkudHMiLCIuLi8uLi9zcmMvY29tbC9Db21sU3RhcnR1cC50cyIsIi4uLy4uL3NyYy9jb21sL2JyaWRnZS9jaGFydGpzL0NvQ2hhcnRqcy50cyIsIi4uLy4uL3NyYy9jb21sL2JyaWRnZS91aTUvVUk1Q29FbGVtZW50LnRzIiwiLi4vLi4vc3JjL2NvbWwvZWxlbWVudC9Db0luc2VydC50cyIsIi4uLy4uL3NyYy9jb21sL2VsZW1lbnQvRm9yLnRzIiwiLi4vLi4vc3JjL2NvbWwvZWxlbWVudC9QYWdlcy50cyIsIi4uLy4uL3NyYy9jb21sL2h0bWwvRG9jdW1lbnRFbGVtZW50LnRzIiwiLi4vLi4vc3JjL2NvbWwvaW1wbC9TdGF0ZUNoYW5nZXMudHMiLCIuLi8uLi9zcmMvZGVtby9Gcm9tQ29kZUFzc2V0RmFjdG9yeS50cyIsIi4uLy4uL3NyYy9kZW1vL0RlbW9Db252ZXJ0ZXJJbXBsLnRzIiwiLi4vLi4vc3JjL2RlbW8vRGVtb0FwcC50cyIsIi4uLy4uL3NyYy9kZW1vL015UGFnZS50cyIsIi4uLy4uL3NyYy9kZW1vL2VsZW1lbnQvQ29Db2RlLnRzIiwiLi4vLi4vc3JjL2RlbW8vZWxlbWVudC9Db0Vycm9yLnRzIiwiLi4vLi4vc3JjL2RlbW8vZWxlbWVudC9Db01hcmtkb3duLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SU9FQTs7Ozs7Ozs7T0FRRztJQUNIO1FBVUksaUJBQVksZUFBb0IsRUFBQyxLQUFVO1lBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUMsZUFBZSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRVMsNkJBQVcsR0FBckI7WUFDSSw0QkFBNEI7WUFDNUIsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDaEcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUM7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QUFTLENBQUM7UUFDdkIsQ0FBQztRQUVGLHNCQUFDO0lBQUQsQ0FBQyxBQWpHRCxDQUE4Qiw4QkFBYSxHQWlHMUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNEO1FBQUE7UUFTRixDQUFDO1FBUkcsdUNBQWUsR0FBZixVQUFnQixHQUFvQjtZQUNoQyxHQUFHLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQscUNBQWEsR0FBYixVQUFjLEVBQWMsRUFBRSxHQUFvQjtZQUM5QyxPQUFPLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUwsb0JBQUM7SUFBRCxDQUFDLEFBVEMsSUFTRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0SUQgfSBmcm9tIFwiLi9Bc3NldFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlIH0gZnJvbSBcIi4vVGFyZ2V0Tm9kZVwiO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIGV2YWx1YXRlIHRoZSBhdHRyaWJ1dGVzIHRoYXQgYXJlIGluIHRoZSBzb3VyY2UgZWxlbWVudC5cbiAqL1xuZXhwb3J0IHR5cGUgR2V0QXR0clQgPSAoYXR0cjpzdHJpbmcpPT5zdHJpbmc7XG5cbi8qKlxuICogVGhlICd0aGlzJyBvYmplY3QgdGhhdCBpcyBhdmFpbGFibGUgaW5zaWRlIHRoZSBjb21sIHNjcmlwdHMgYXMgJ3RoaXMnXG4gKiBJdCByZXByZXNlbnRzIGEgQ29FbGVtZW50IHRoYXQgcmVuZGVycyBjb250ZW50IGZyb20gYW4gSHRtbCBBc3NldC5cbiAqL1xuIGV4cG9ydCBpbnRlcmZhY2UgVGhpcyBleHRlbmRzIENvRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBQYXJhbWV0ZXJzIGNhbiBpbmNsdWRlIGFueSBvYmplY3RzLiBUaGV5IGFyZSB1c2VkIHRvIHN1cHBseSBwYXJhbWV0ZXJzIHRvIGEgQ29FbGVtZW50IHRlbXBsYXRlLlxuICAgICAqIFVzZSBnZXRBdHRyKCkgdG8gYWNjZXNzIHBhcmFtZXRlcnMuXG4gICAgICogXG4gICAgICogYHRoaXMuZ2V0QXR0cigneHl6JylgIHdpbGwgZmlyc3QgcmVhZCB0aGlzLnBhcmFtZXRlcnNbeHl6XSBiZWZvcmUgcmVhZGluZyA8d3MtZWxlbWVudCB4eXo9XCJzb212ZXZhbHVlXCI+LlxuICAgICAqL1xuXHRwYXJhbWV0ZXJzOmFueTtcblxuXG4gICAgZ2V0SWQoKSA6IHN0cmluZztcblxuXG4gICAgLyoqXG4gICAgICogVGhlIHNvdXJjZSBkb2N1bWVudC5cbiAgICAgKi9cbiAgICBkb2N1bWVudDpEb2N1bWVudDtcbiAgICBcblxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0IGEgQ09NTCBmYWN0b3J5LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbXBvcnRlZSBUaGUgZnVsbHkgcXVhbGlmaWVkIHBhdGggdG8gYSBDT01MIENvRWxlbWVudEZhY3RvcnkgKGUuZy4gYGNvbWwvZWxlbWVudC9Db0ZpZWxkc2ApIG9yIHRoZSBhc3NldElkIG9mIGEgQ09NTCBwYWdlLlxuICAgICAqIEBwYXJhbSB0YWdGb3JBc3NldCBvcHRpb25hbCwgcmVxdWlyZWQgb25seSBpZiBpbXBvcnRlZSBpcyBhbiBhc3NldElkLiBUaGUgdGFnIHRvIHVzZSBmb3IgdGhpcyBhc3NldCdzIENvRWxlbWVudFxuICAgICAqL1xuICAgIGltcG9ydChpbXBvcnRlZTpzdHJpbmd8QXNzZXRJRCx0YWdGb3JBc3NldD86c3RyaW5nKSA6IFByb21pc2U8YW55PjtcblxuICAgIC8qKlxuICAgICAqIEluc3RhbGxzIGEgY2FsbGJhY2sgdGhhdCBpcyBjYWxsZWQgYWZ0ZXIgcmVuZGVyaW5nIGlzIGNvbXBsZXRlLlxuICAgICAqIEBwYXJhbSBjYiBcbiAgICAgKi9cbiAgICBvbkFmdGVyUmVuZGVyKGNiOigpPT52b2lkKSA6IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzb3VyY2UgZG9jdW1lbnRcbiAgICAgKi9cbiAgICBnZXRTb3VyY2VEb2N1bWVudCgpOkRvY3VtZW50O1xuXG5cbn0iLCJpbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUgfSBmcm9tIFwiLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi9UaGlzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgbWFrZUNvbXBvbmVudCh0bjpUYXJnZXROb2RlLGN2dDpDb252ZXJ0ZXI8VGhpcz4pIDogQ29FbGVtZW50IHwgUHJvbWlzZTxDb0VsZW1lbnQ+O1xuICAgIHJlZ2lzdGVyRmFjdG9yeShjdnQ6Q29udmVydGVyPFRoaXM+KTtcbn0iLCJpbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi9Db0VsZW1lbnRcIjtcblxuLyoqXG4gKiBBIEdldCBpcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHBhc3NlZCBhcyBhIHBhcmVtZXRlciB0byB0aGlzLmdldCgpLlxuICogSXQgaXMgY2FsbGVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBhdmFpbGFibGUgb25jZS5cbiAqL1xuZXhwb3J0IHR5cGUgR2V0PFQgZXh0ZW5kcyBDb0VsZW1lbnQ9Q29FbGVtZW50PiA9IChjb21wb25lbnQ6VCk9PmFueTtcblxuXG5cbiIsImltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuL0NvRWxlbWVudFwiO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVuZGVyIGEgY29tcG9uZW50LiBTdXBwbGllcyBtZXRob2RzIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gcmVuZGVyIHRhcmdldCBub2Rlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXIge1xuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gYXR0cmlidXRlIG5hbWUtdmFsdWUgcGFpciB0byB0aGUgbGFzdCBvcGVuIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgb25seSB2YWxpZCB3aGVuIGNhbGxlZCBiZXR3ZWVuIGBvcGVuU3RhcnQvdm9pZFN0YXJ0YCBhbmQgYG9wZW5FbmQvdm9pZEVuZGAuIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAqIG11c3Qgbm90IGJlIGVxdWFsIHRvIGBzdHlsZWAgb3IgYGNsYXNzYC4gU3R5bGVzIGFuZCBjbGFzc2VzIG11c3QgYmUgc2V0IHZpYSBkZWRpY2F0ZWQgYGNsYXNzYCBvciBgc3R5bGVgXG4gICAgICogbWV0aG9kcy4gVG8gdXBkYXRlIHRoZSBET00gY29ycmVjdGx5LCBhbGwgYXR0cmlidXRlIG5hbWVzIGhhdmUgdG8gYmUgdXNlZCBpbiB0aGVpciBjYW5vbmljYWwgZm9ybS4gRm9yXG4gICAgICogSFRNTCBlbGVtZW50cywge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUTUwvQXR0cmlidXRlcyBhdHRyaWJ1dGUgbmFtZXN9IG11c3RcbiAgICAgKiBhbGwgYmUgc2V0IGluIGxvd2VyY2FzZS4gRm9yIGZvcmVpZ24gZWxlbWVudHMsIHN1Y2ggYXMgU1ZHLCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvU1ZHL0F0dHJpYnV0ZVxuICAgICAqIGF0dHJpYnV0ZSBuYW1lc30gY2FuIGJlIHNldCBpbiB1cHBlciBjYW1lbCBjYXNlIChlLmcuIHZpZXdCb3gpLlxuICAgICAqL1xuICAgIGF0dHIoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBOYW1lIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgICovXG4gICAgICAgIHNOYW1lOiBzdHJpbmcsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWYWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICAgICAqL1xuICAgICAgICB2VmFsdWU6IGFueVxuICAgICk6IHRoaXM7XG4gICAgLyoqXG4gICAgICogQFNJTkNFIDEuMC4wXG4gICAgICpcbiAgICAgKiBBZGRzIGEgY2xhc3MgbmFtZSB0byB0aGUgY2xhc3MgY29sbGVjdGlvbiBvZiB0aGUgbGFzdCBvcGVuIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgb25seSB2YWxpZCB3aGVuIGNhbGxlZCBiZXR3ZWVuIGBvcGVuU3RhcnQvdm9pZFN0YXJ0YCBhbmQgYG9wZW5FbmQvdm9pZEVuZGAuIENsYXNzIG5hbWUgbXVzdCBub3RcbiAgICAgKiBjb250YWluIGFueSB3aGl0ZXNwYWNlLlxuICAgICAqL1xuICAgIGNsYXNzKFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xhc3MgbmFtZSB0byBiZSB3cml0dGVuXG4gICAgICAgICAqL1xuICAgICAgICBzQ2xhc3M6IHN0cmluZ1xuICAgICk6IHRoaXM7XG5cblxuICAgIC8qKlxuICAgICAqIEBTSU5DRSAxLjAuMFxuICAgICAqXG4gICAgICogQ2xvc2VzIGFuIG9wZW4gdGFnIHN0YXJ0ZWQgd2l0aCBgb3BlblN0YXJ0YCBhbmQgZW5kZWQgd2l0aCBgb3BlbkVuZGAuXG4gICAgICpcbiAgICAgKiBUaGlzIGluZGljYXRlcyB0aGF0IHRoZXJlIGFyZSBubyBtb3JlIGNoaWxkcmVuIHRvIGFwcGVuZCB0byB0aGUgb3BlbiB0YWcuXG4gICAgICovXG4gICAgY2xvc2UoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUYWcgbmFtZSBvZiB0aGUgSFRNTCBlbGVtZW50XG4gICAgICAgICAqL1xuICAgICAgICBzVGFnTmFtZTogc3RyaW5nXG4gICAgKTogdGhpcztcblxuXG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgYSBwcmVyZW5kZXJlZCBkb20gbm9kZSBpbnRvIHRoZSBjdXJyZW50IHJlbmRlcmluZyBwb3NpdGlvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZWxlbSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBpbnNlcnRSZW5kZXJlZChlbGVtOkVsZW1lbnQpIDogdGhpc1xuXG4gICAgLyoqXG4gICAgICogQ2xlYW5zIHVwIHRoZSByZXNvdXJjZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBBZnRlciB0aGUgaW5zdGFuY2UgaGFzIGJlZW4gZGVzdHJveWVkLCBpdCBtdXN0IG5vdCBiZSB1c2VkIGFueW1vcmUuIEFwcGxpY2F0aW9ucyBzaG91bGQgY2FsbCB0aGlzIGZ1bmN0aW9uXG4gICAgICogaWYgdGhleSBkb24ndCBuZWVkIHRoZSBpbnN0YW5jZSBhbnkgbG9uZ2VyLlxuICAgICAqL1xuICAgIGRlc3Ryb3koKTogdm9pZDtcblxuICAgIC8qKlxuICAgICAqIEBTSU5DRSAxLjAuMFxuICAgICAqXG4gICAgICogRW5kcyBhbiBvcGVuIHRhZyBzdGFydGVkIHdpdGggYG9wZW5TdGFydGAuXG4gICAgICpcbiAgICAgKiBUaGlzIGluZGljYXRlcyB0aGF0IHRoZXJlIGFyZSBubyBtb3JlIGF0dHJpYnV0ZXMgdG8gc2V0IHRvIHRoZSBvcGVuIHRhZy5cbiAgICAgKi9cbiAgICBvcGVuRW5kKCk6IHRoaXM7XG4gICAgLyoqXG4gICAgICogQFNJTkNFIDEuMC4wXG4gICAgICpcbiAgICAgKiBPcGVucyB0aGUgc3RhcnQgdGFnIG9mIGFuIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIFRoaXMgbXVzdCBiZSBmb2xsb3dlZCBieSBgb3BlbkVuZGAgYW5kIGNvbmNsdWRlZCB3aXRoIGBjbG9zZWAuIFRvIGFsbG93IGEgbW9yZSBlZmZpY2llbnQgRE9NIHVwZGF0ZSxcbiAgICAgKiBhbGwgdGFnIG5hbWVzIGhhdmUgdG8gYmUgdXNlZCBpbiB0aGVpciBjYW5vbmljYWwgZm9ybS4gRm9yIEhUTUwgZWxlbWVudHMsIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0VsZW1lbnRcbiAgICAgKiB0YWcgbmFtZXN9IG11c3QgYWxsIGJlIHNldCBpbiBsb3dlcmNhc2UuIEZvciBmb3JlaWduIGVsZW1lbnRzLCBzdWNoIGFzIFNWRywge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL1NWRy9FbGVtZW50XG4gICAgICogdGFnIG5hbWVzfSBjYW4gYmUgc2V0IGluIHVwcGVyIGNhbWVsIGNhc2UgKGUuZy4gbGluZWFyR3JhZGllbnQpLlxuICAgICAqL1xuICAgIG9wZW5TdGFydChcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRhZyBuYW1lIG9mIHRoZSBIVE1MIGVsZW1lbnRcbiAgICAgICAgICovXG4gICAgICAgIHNUYWdOYW1lOiBzdHJpbmcsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb250cm9sIGluc3RhbmNlIHRvIGlkZW50aWZ5IHRoZSBlbGVtZW50XG4gICAgICAgICAqL1xuICAgICAgICB2Q29udHJvbD86IENvRWxlbWVudCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdHJ1ZSwgZG8gbm90IGFkZCB0aGUgJ2RhdGEtY29pZCcgaWQuXG4gICAgICAgICAqL1xuICAgICAgICBub0NvSWQ/OmJvb2xlYW5cbiAgICApOiB0aGlzO1xuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyB0aGUgY2hpbGRyZW4gc25vZGVzIChpLmUuIGFueSBlbGVtZW50cyBlbWJlZGRlZCB3aXRoaW4pIHRoZSBjYWxsaW5nIGNvbXBvbmVudC5cbiAgICAgKiBJZiBjYWxsZWQgbXVsdGlsZSB0aW1lcyBieSBhIENPbXBvbmVudCwgZm9yIGV4YW1wbGUgdG8gY3JlYXRlIG11bHRpcGxlIGl0ZXJhdGlvbnMsXG4gICAgICogdGhlbiB0aGUgJ2l0ZXJhdGlvbicgcGFyYW1ldGVyIG11c3QgYmUgaW5jcmVhc2VkIGZyb20gcHJldmlvdXMgKHN0YXJ0aW5nIGZyb20gMCkgb24gZWFjaCBzdWNjZXNzaXZlIGNhbGwuXG4gICAgICogXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCBUaGUgY29tcG9uZW50IHdob3NlIGNoaWxkcmVuIGFyZSB0byBiZSByZW5kZXJlZC5cbiAgICAgKiBAcGFyYW0gaXRlcmF0aW9uIFRoZSBpdGVyYXRpb24gLSBpZiBub3Qgc3BlY2lmaWVkIHRvIDBcbiAgICAgKiBAcGFyYW0gcGFyYW1ldGVyc1BlckNoaWxkIFRoZSBwYXJhbWV0ZXJzIHRvIHN0b3JlIHBlciBjaGlsZCB0YWcuIFRoZSBjaGlsZCBjYW4gcmV0cmlldmUgdGhpcyB1c2luZyBpdHMgYHRoaXMucGFyYW1zKClgIGNhbGwuIFxuICAgICAqL1xuICAgIHJlbmRlckNoaWxkcmVuKGNvbXBvbmVudDpDb0VsZW1lbnQsIGl0ZXJhdGlvbj86bnVtYmVyLHBhcmFtZXRlcnNQZXJDaGlsZD86e1t0YWduYW1lOnN0cmluZ106YW55fSkgOiB0aGlzO1xuXG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGF0dHJpYnV0ZXMgYW5kIGNsYXNzZXMgd2l0aCAke30gZXhwYW5zaW9uIGludG8gdGhlIGxhc3Qgb3BlbmVkIEhUTUwgZWxlbWVudC5cbiAgICAgKiBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY29tcG9uZW50IFRoZSBjb21wb25lbnQgXG4gICAgICogQHBhcmFtIGRvTm90Q29weSAoT3B0aW9uYWwpIGFuIGFycmF5IG9mIGF0dHJpYnV0ZXMgdG8gTk9UIGNvcHkuXG4gICAgICogQHBhcmFtIGNvcHlGcm9tICAoT3B0aW9uYWwpIHRoZSBlbGVtZW50IHRvIGNvcHkgZnJvbS4gSWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGhpcyBjb21wb25lbnQncyBzb3VyY2Ugbm9kZVxuICAgICAqL1xuICAgIGNvcHlBdHRyRXhjZXB0KGNvbXBvbmVudDpDb0VsZW1lbnQsZG9Ob3RDb3B5Pzogc3RyaW5nW10sY29weUZyb20/OiBOb2RlKSA6IHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBAU0lOQ0UgMS4wLjBcbiAgICAgKlxuICAgICAqIEFkZHMgYSBzdHlsZSBuYW1lLXZhbHVlIHBhaXIgdG8gdGhlIHN0eWxlIGNvbGxlY3Rpb24gb2YgdGhlIGxhc3Qgb3BlbiBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIG9ubHkgdmFsaWQgd2hlbiBjYWxsZWQgYmV0d2VlbiBgb3BlblN0YXJ0L3ZvaWRTdGFydGAgYW5kIGBvcGVuRW5kL3ZvaWRFbmRgLlxuICAgICAqL1xuICAgIHN0eWxlKFxuICAgICAgICAvKipcbiAgICAgICAgICogTmFtZSBvZiB0aGUgc3R5bGUgcHJvcGVydHlcbiAgICAgICAgICovXG4gICAgICAgIHNOYW1lOiBzdHJpbmcsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBWYWx1ZSBvZiB0aGUgc3R5bGUgcHJvcGVydHlcbiAgICAgICAgICovXG4gICAgICAgIHNWYWx1ZTogc3RyaW5nXG4gICAgKTogdGhpcztcbiAgICAvKipcbiAgICAgKiBAU0lOQ0UgMS4wLjBcbiAgICAgKlxuICAgICAqIFNldHMgdGhlIHRleHQgY29udGVudCB3aXRoIHRoZSBnaXZlbiB0ZXh0LlxuICAgICAqL1xuICAgIHRleHQoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdGV4dCB0byBiZSB3cml0dGVuXG4gICAgICAgICAqL1xuICAgICAgICBzVGV4dDogc3RyaW5nXG4gICAgKTogdGhpcztcblxuICAgIC8qKlxuICAgICAqIEBTSU5DRSAxLjAuMFxuICAgICAqXG4gICAgICogU2V0cyB0aGUgZ2l2ZW4gSFRNTCBtYXJrdXAgd2l0aG91dCBhbnkgZW5jb2Rpbmcgb3Igc2FuaXRpemluZy5cbiAgICAgKlxuICAgICAqIFRoaXMgbXVzdCBub3QgYmUgdXNlZCBmb3IgcGxhaW4gdGV4dHM7IHVzZSB0aGUgYHRleHRgIG1ldGhvZCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIHVuc2FmZUh0bWwoXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZWxsLWZvcm1lZCwgdmFsaWQgSFRNTCBtYXJrdXBcbiAgICAgICAgICovXG4gICAgICAgIHNIdG1sOiBzdHJpbmdcbiAgICApOiB0aGlzO1xuXG5cbn0iLCJcbi8qKlxuICogQSBzdGF0ZSBjaGFuZ2VyIGlzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgY2FsbGVkIGR1cmluZyB0bm9kZSBnZW5lcmF0aW9uIHRvIGFwcGx5IChhbmQgcmVhcHBseSlcbiAqIHN0YXRlIGNoYW5nZXMgKGF0dHJpYnV0ZSBjaGFuZ2VzLCBldmVudCBsaXN0ZW5lcnMsIGV0YykuXG4gKi9cbmV4cG9ydCB0eXBlIFN0YXRlQ2hhbmdlciA9ICh0bm9kZTpFbGVtZW50KT0+YW55O1xuXG5cbi8qKlxuICogQSBzZXQgb2Ygc3RhdGUgY2hhbmdlcnMgc3RvcmVkIGJ5IGxvZ2ljYWwgY2hhbmdlIGlkLiBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGF0ZUNoYW5nZXJzIHtcbiAgICBbY2hhbmdlaWQ6c3RyaW5nXTpTdGF0ZUNoYW5nZXI7XG59XG4iLCJcblxuaW1wb3J0IHsgQXNzZXRJRCB9IGZyb20gXCIuL0Fzc2V0XCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBHZXQgfSBmcm9tIFwiLi9HZXRcIjtcbmltcG9ydCB7IFJlbmRlciB9ZnJvbSBcIi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBTdGF0ZUNoYW5nZXIsIFN0YXRlQ2hhbmdlcnMgfSBmcm9tIFwiLi9TdGF0ZUNoYW5nZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUgfSBmcm9tIFwiLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBHZXRBdHRyVCwgVGhpcyB9IGZyb20gXCIuL1RoaXNcIjtcblxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIG9iamVjdCB0aGF0IGNvbnZlcnRzIENPTUwgdG8gSHRtbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb252ZXJ0ZXI8VCBleHRlbmRzIFRoaXM+IHtcblx0XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZnVuY3RvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBleHBhbmQgYXR0cmlidXRlc1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBmbkdldEF0dHIgXG4gICAgICovXG4gICAgc2V0R2V0QXR0ckZuKGZuR2V0QXR0cjogR2V0QXR0clQpO1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgc291cmNlIENPTUwgZG9jdW1lbnQgdGhhdCB0aGlzIGNvbnZlcnRlciB3aWxsIHRyYW5zbGF0ZSB0byBodG1sLlxuICAgICAqIEltcG9ydHMgc2NyaXB0cyBhbmQgc3R5bGVzLCBhbmQgc2V0cyB0aGUgZG9jdW1lbnQgYXMgdGhlIHJvb3Qgbm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZG9jIFRoZSBkb2N1bWVudCB0byBsb2FkLlxuICAgICAqIEBwYXJhbSBhc3NldElkIElmIHRoZSBkb2N1bWVudCB3YXMgbG9hZGVkIGZyb20gYW4gYXNzZXQsIHRoZSBhc3NldElkLiBXZSBzdGFydCBtb25pdG9yaW5nIHNjb3BlIGNoYW5nZXMgZm9yIHRoaXMgYXNzZXQgKHdoaWNoIHJlcHJlc2VudHMgdGhlIHRvcCBsZXZlbCBwYWdlKSwgc28gdGhhdCBzdHlsZXMgYXJlIHJlbW92ZWQgd2hlbiBub3QgaW4gc2NvcGUuXG4gICAgICogXG4gICAgICogQHJldHVybiBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoaXMgY29udmVydGVyIGhhcyBsb2FkZWQgaXRzIHN0eWxlcyB0byB0aGUgY3VycmVudCBTUEEuXG4gICAgICovXG4gICAgc2V0RG9jdW1lbnQoZG9jOkRvY3VtZW50LGFzc2V0SWQ6QXNzZXRJRCxyb290PzpUYXJnZXROb2RlKSA6IFByb21pc2U8Q29udmVydGVyPFRoaXM+PjtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHNvdXJjZSBkb2N1bWVudCBcbiAgICAgKi9cbiAgICBnZXREb2N1bWVudCgpIDogRG9jdW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHJvb3QgdGFyZ2V0IG5vZGVcbiAgICAgKi9cbiAgICBnZXRSb290KCkgOiBUYXJnZXROb2RlO1xuXG4gICAgLyoqXG4gICAgICogUmVwbGFjZSB0aGUgcm9vdCwgZS5nLiBkdXJpbmcgdGVtcGxhdGl6YXRpb24uXG4gICAgICogQHBhcmFtIHJvb3QgXG4gICAgICovXG4gICAgcmVwbGFjZVJvb3Qocm9vdDpUYXJnZXROb2RlKTtcbiAgICBcblxuICAgIC8qKlxuICAgICAqIENhbGwgc28gYW55IHRlbXBsYXRlJ3MgaW5zdGFsbGVkIG9uQWZ0ZXJSZW5kZXIgY2FsbGJhY2tzIGFyZSBjYWxsZWQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJlZiBcbiAgICAgKi9cbiAgICBvbkFmdGVyUmVuZGVyKCk7XG5cblxuICAgIC8qKlxuICAgICAqIENvcGllcyBhbGwgYXR0cmlidXRlcyBmcm9tIG5vZGUgdG8gdGhlIFJlbmRlck1hbmFnZXIgKHVzaW5nIGBybS5hdHRyKClgKSBleGNlcHQgZm9yIGFueSBzcGVjaWZpZWQgaW4gdGhlIGRvTm90Q29weSBsaXN0LlxuICAgICAqIFRoaXMgc2hvdWxkIGJlIHVzZWQgd2hpbGUgY3JlYXRpbmcgdGhlIG91dGVybW9zdCBlbGVtZW50IGluIHRoZSB0YXJnZXQgRE9NLlxuICAgICAqIFxuICAgICAqIEF0dHJpYnV0ZXMgY29udGFpbmluZyBgJHt9YCB0ZW1wbGF0ZXMgYXJlIGZpcnN0IGV4cGFuZGVkIHRoZW4gY29waWVkLlxuICAgICAqIFxuICAgICAqIFxuICAgICAqIEV4YW1wbGUgdXNhZ2U6XG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICBvblJlbmRlcihybTogUmVuZGVyLGN2dDpDb21sQ29udmVydGVyLHRuOlRyZWVOb2RlKSB7XG4gICAgICAgIHJtLm9wZW5TdGFydCgnZGl2JylcbiAgICAgICAgcm0uY2xhc3MoJ3Utd3NjaGlsZCcpO1xuICAgICAgICBjdnQuY29weUF0dHJFeGNlcHQocm0sdG4uc25vZGUpO1xuICAgICAgICBybS5vcGVuRW5kKCk7XG5cbiAgICAgICAgLy8gcmVuZGVyQ2hpbGRyZW4gZXRjXG5cbiAgICAgICAgcm0uY2xvc2UoJ2RpdicpOyAgICBcbiAgICAgfSAgIFxuICAgICAqIGBgYFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBybSBcbiAgICAgKiBAcGFyYW0gbm9kZSBcbiAgICAgKiBAcGFyYW0gZG9Ob3RDb3B5IFxuICAgICAqL1xuICAgIGNvcHlBdHRyRXhjZXB0KHJtOiBSZW5kZXIsIG5vZGU6IE5vZGUsIGRvTm90Q29weT86IHN0cmluZ1tdLGN1cnJ0bj86VGFyZ2V0Tm9kZSk7XG5cbiAgICAvKipcbiAgICAgKiAgQ29weSdzIHRoZSBzbm9kZSdzIGF0dHJpYnV0ZXMgYW5kIGNsYXNzZXMgYW5kIHN0eWxlcyB0byB0aGUgdG5vZGUgXG4gICAgICogXG4gICAgICogXG4gICAgICogQHBhcmFtIHRub2RlIFRoZSB0bm9kZSB0byBjb3B5IHRvLlxuICAgICAqIEBwYXJhbSBzbm9kZSBUaGUgbm9kZSB0byBjb3B5IGZyb20uXG4gICAgICogQHBhcmFtIGRvTm90Q29weSBBIGxpc3Qgb2YgYXR0cmlidXRlIE5PVCB0byBjb3B5XG4gICAgICogQHBhcmFtIGF0dHIyc2V0IEFkZGl0aW9uYWwgYXR0cmlidXRlcyB0byBzZXQgKGFycmF5IG9mIGtleS92YWx1ZSBwYWlycylcbiAgICAgKi9cbiAgICBjb3B5QXR0ckV4Y2VwdFRvVE5vZGUodG5vZGU6Tm9kZSwgc25vZGU6IE5vZGUsIGRvTm90Q29weT86IHN0cmluZ1tdLGF0dHIyc2V0PzpzdHJpbmdbXVtdLGN1cnJ0bj86VGFyZ2V0Tm9kZSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB0aGlzIG9iamVjdCB0aGF0IGlzIHZpc2libGUgdG8gc2NyaXB0cyBhbmQgc3RyaW5nIHRlbXBsYXRlcyBpbiB0aGUgaHRtbCBwYWdlXG4gICAgICovXG4gICAgZ2V0VGhpcygpOiBUO1xuXG4gICBcblxuICAgIC8qKlxuICAgICogRmluZHMgdGhlIHBhcmVudCBvZiAndG4nIGZvdyB3aGljaCAnbWF0Y2hlcicgcmV0dXJucyB0cnVlLlxuICAgICogXG4gICAgKiBAcGFyYW0gdG4gVGhlIHRhcmdldCBub2RlIHRvIGZpbmQgcGFyZW50IG9mXG4gICAgKiBAcGFyYW0gbWF0Y2hlciBNYXRjaGluZyBmdW5jdGlvblxuICAgICogQHJldHVybnMgVGhlIHBhcmVudCBmb3VuZCBvciB1bmRlZmluZWQgaWYgbm9uLlxuICAgICovXG4gICAgZmluZFBhcmVudCh0bjogVGFyZ2V0Tm9kZSwgbWF0Y2hlcjogKHRuOiBUYXJnZXROb2RlKSA9PiBib29sZWFuKTogVGFyZ2V0Tm9kZTtcblxuICAgIC8qKlxuICAgICAqIEZpbmRzIHRoZSBwYXJlbnQgb2YgJ3RuJyBmb3Igd2hpY2ggJ21hdGNoZXInIHJldHVybnMgdHJ1ZS4gU2ltaWxhciB0b1xuICAgICAqIGZpbmRQYXJlbnQsIGV4Y2VwdCB0aGUgaXRlcmF0aW9uIHRoYXQgcmVzdWx0ZWQgaW4gdGhlIGNoaWxkICd0bicgaXMgYWxzbyByZXR1cm5lZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG4gXG4gICAgICogQHBhcmFtIG1hdGNoZXIgXG4gICAgICogQHJldHVybnMgRWl0aGVyIHtwYXJlbnQ6VGhlIHBhcmVudCBmb3VuZCxpdGVyYXRpb246VGhlIGl0ZXJhdGlvbiBvZiB0aGUgYnJhbmNoIHRoYXQgcmVzdWx0ZWQgaW4gdGhlIGNoaWxkIH0gb3IgdW5kZWZpbmVkIGlmIG5vIHBhcmVudFxuICAgICAqL1xuICAgIGZpbmRQYXJlbnRBbmRJdGVyYXRpb24odG46IFRhcmdldE5vZGUsIG1hdGNoZXI6IChwYXJlbnR0bjogVGFyZ2V0Tm9kZSxpdGVyYXRpb24/Om51bWJlcikgPT4gYm9vbGVhbik6IHsgcGFyZW50OiBUYXJnZXROb2RlLCBpdGVyYXRpb246IG51bWJlciB9XG5cblxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIGZpcnN0IGNoaWxkIG9mICd0bicgZm9yIHdoaWNoICdtYXRjaGVyJyByZXR1cm5zIHRydWUuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRuIFRoZSB0YXJnZXQgbm9kZSB0byBmaW5kIGNoaWxkcmVuIG9mXG4gICAgICogQHBhcmFtIG1hdGNoZXIgTWF0Y2hpbmcgZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJucyBUaGUgcGFyZW50IGZvdW5kIG9yIHVuZGVmaW5lZCBpZiBub24uXG4gICAgICovXG4gICAgZmluZENoaWxkKHRuOiBUYXJnZXROb2RlLCBtYXRjaGVyOiAodG46IFRhcmdldE5vZGUpID0+IGJvb2xlYW4pOiBUYXJnZXROb2RlXG5cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgZmFjdG9yeSB3aGljaCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoaXMgY29udmVydGVyIGlzIGNhbGxlZCB0byBjb252ZXJ0IFxuICAgICAqIGEgbm9kZSB3aXRoIHRhZ05hbWUgJ3RhZycuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRhZyBUaGUgdGFnIHN0cmluZyB0byBtYXRjaCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGZvciBhIG1hdGNoaW5nIHRhZ1xuICAgICAqIEBwYXJhbSBmYWN0b3J5IFRoZSBmYWN0b3J5IHRvIHVzZSBmb3IgdGhlIG1hdGNoaW5nIHRhZ1xuICAgICAqL1xuICAgIHJlZ2lzdGVyRmFjdG9yeSh0YWc6IHN0cmluZ3woKHRhZzpzdHJpbmcpPT5ib29sZWFuKSwgZmFjdG9yeTogQ29FbGVtZW50RmFjdG9yeSk7XG5cblxuXG5cbiAgICAvKipcbiAgICAqIEFkZHMgYSBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgY2FsbGVkIGp1c3QgYmVmb3JlIGFueSBlbGVtZW50IHdob3NlIHRhZyBtYXRjaGVzIGFueSBlbnRyeSBpbiAndGFncycgcmVuZGVycyB0aGUgc291cmNlIHRyZWUuXG4gICAgKiBcbiAgICAqIEBwYXJhbSB0YWdzIFxuICAgICogQHBhcmFtIGxpc3RlbmVyIFxuICAgICovXG4gICAgYWRkT25FbGVtZW50UmVuZGVyTGlzdGVuZXIodGFnczogc3RyaW5nW10sIGxpc3RlbmVyOiAodGFnOiBzdHJpbmcsIGU6IENvRWxlbWVudCkgPT4gdm9pZCk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSBhZGRlZCBsaXN0ZW5lciBmcm9tIHRoZSB0YWdzIGFnYWluc3Qgd2hpY2ggaXQgd2FzIGFkZGVkLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0YWdzIFxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICByZW1vdmVPbkVsZW1lbnRSZW5kZXJMaXN0ZW5lcih0YWdzOiBzdHJpbmdbXSwgbGlzdGVuZXI6ICh0YWc6IHN0cmluZywgZTogQ29FbGVtZW50KSA9PiB2b2lkKTtcblxuXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGhlIGNoaWxkcmVuIG9mIG5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJtIFxuICAgICAqIEBwYXJhbSBwYXJlbnR0biBUaGUgcGFyZW50IHRyZWVub2RlIHdob3NlIHNub2RlJ3MgY2hpbGRyZW4gYXJlIHRvIGJlIHJlbmRlcmVkIFxuICAgICAqIEBwYXJhbSBpdGVyYXRpb24gdGhlIHJlcGVhdCBpdGVyYXRpb24gKDAgZm9yIGZpcnN0IGFuZCBpbmNyZW1lbnRpbmcgZm9yIGVhY2ggc3VjY2Vzc2l2ZSByZXBlYXQpXG4gICAgICovXG4gICAgcmVuZGVyQ2hpbGRyZW4ocm06IFJlbmRlciwgcGFyZW50dG46IFRhcmdldE5vZGUsIGl0ZXJhdGlvbj86IG51bWJlcik7XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGhlIGRvbSBub2RlIHRvIHVpNSB1c2luZyBhIFJlbmRlck1hbmFnZXIuIFRha2VzIGFuIG9wdGlvbmFsIGVsZW1lbnRTVGFjayB3aGljaCB3aWxsIGJlXG4gICAgICogdXNlZCBmb3IgYW55IHZpc2l0UGFyZW50RWxlbWVudHMoKSBjYWxscywgdGhpcyBpcyB1c2VmdWwgdG8gcHVzaCB0aGUgb3JpZ2luYWwgcGFyZW50cyBkdXJpbmcgYW5cbiAgICAgKiBhc3luYyByZW5kZXIuXG4gICAgICogPHA+XG4gICAgICogQHBhcmFtIG5vZGUgXG4gICAgICovXG4gICAgcmVuZGVyTm9kZShybTogUmVuZGVyLCB0bjogVGFyZ2V0Tm9kZSk7XG5cblxuICAgIC8qKlxuICAgICAqIGV4ZWN1dGUgdGhlIGphdmFzY3JpcHQgaW4gJ3NjcmlwdCcgYWZ0ZXIgc2V0dGluZyBpdHMgJ3RoaXMnIHRvIHBvaW50IHRvIHRoZSBUaGlzIG9iamVjdC5cbiAgICAgKiBSZXR1cm5zIGFueSB2YWx1ZSBpZiB0aGVyZSBpcyBhICdyZXR1cm4oKScgc3RhdGVtZW50IC0gZWxzZSB1bmRlZmluZWQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHNjcmlwdCBcbiAgICAgKi9cbiAgICBleGVjdXRlU2NyaXB0KHNjcmlwdDogc3RyaW5nKTogYW55O1xuXG4gICAgLyoqXG4gICAgICogZXhwYW5kIGFueSAke30gc3RyaW5nIGV4cGFuc2lvbnMgaW4gJ3N0cidcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqL1xuICAgIGV4cGFuZFN0cmluZyhzdHI6IHN0cmluZyxfX2N1cnJ0bjpUYXJnZXROb2RlKTogc3RyaW5nO1xuXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAZGVwcmVjYXRlZCBkb2VzIG5vdGhpbmcuICdkYXRhLWNvaWQnIGlzIGdlbmVyYXRlZCBieSBSZW5kZXIub3BlblN0YXJ0KCkgbm93LlxuICAgICAqIFxuICAgICogXG4gICAgKiA8cD5cbiAgICAqIEBwYXJhbSBybSBcbiAgICAqIEBwYXJhbSB0biBcbiAgICAqIEByZXR1cm5zIFxuICAgICovXG4gICAgZW5jb2RlV1NFKHJtOiBSZW5kZXIsIHRuOiBUYXJnZXROb2RlKTogUmVuZGVyO1xuXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBUaGlzIG9iamVjdCBpcyBjcmVhdGVkLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBvbkNyZWF0ZSBcbiAgICAgKiBcbiAgICAgKi9cbiAgICBhZGRPblRoaXNDcmVhdGVkTGlzdGVuZXIob25DcmVhdGU6IChUaGlzOiBUaGlzKSA9PiB2b2lkKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIEFzc2V0SUQgb2YgdGhlIGFzc2V0IHRoYXQgd2FzIHVzZWQgdG8gYnVpbGQgdGhlIHNkb20gZG9jdW1lbnQgaW4gdGhpcyBDb252ZXJ0ZXIuXG4gICAgICovXG5cdGdldEFzc2V0SWQoKTogQXNzZXRJRDtcblxuXG4gICAgXG5cbiAgICAvKipcbiAgICAgKiBJbXBvcnQgYSBDT01MIGZhY3RvcnkuXG4gICAgICogXG4gICAgICogQHBhcmFtIGltcG9ydGVlIFRoZSBmdWxseSBxdWFsaWZpZWQgcGF0aCB0byBhIENPTUwgQ29FbGVtZW50RmFjdG9yeSAoZS5nLiBgY29tbC9lbGVtZW50L0NvRmllbGRzYCkgb3IgdGhlIGFzc2V0SWQgb2YgYSBDT01MIHBhZ2UuXG4gICAgICogQHBhcmFtIHRhZ0ZvckFzc2V0IG9wdGlvbmFsLCByZXF1aXJlZCBvbmx5IGlmIGltcG9ydGVlIGlzIGFuIGFzc2V0SWQuIFRoZSB0YWcgdG8gdXNlIGZvciB0aGlzIGFzc2V0J3MgQ29FbGVtZW50XG4gICAgICovXG4gICAgaW1wb3J0KGltcG9ydGVlOnN0cmluZ3xBc3NldElELHRhZ0ZvckFzc2V0PzpzdHJpbmcpIDogUHJvbWlzZTxhbnk+O1xuXG5cblx0LyoqXG5cdCAqIEFkZCBhIGxpc3RlbmVyIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFRoaXMgb2JqZWN0IGhhcyBmaW5pZGhlZCByZW5kZXJpbmcuXG5cdCAqL1xuXHRhZGRPbkFmdGVyUmVuZGVyTGlzdGVuZXIoY2I6ICgpID0+IHZvaWQpOiB1bmtub3duO1xuXG5cbiAgICAvKipcbiAgICAgKiBNYXJrcyBhIG5vZGUgZm9yIHJlcGFpbnRpbmdcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbm9kZSBBIG5vZGUgaW4gdGhlIHNkb20sdGRvbiBvciB0aGVpciBxdWVyeVNlbGVjdG9yIG9yIHRoZSBUYXJnZXROb2RlIHRvIGludmFsaWRhdGVcbiAgICAgKiBAcGFyYW0gZm9yZ2V0IElmIHNldCwgdGhlIENPbXBvbmVudCBzaG91bGQgZGlzY2FyZCBhbnkgY2FjaGVkIHN0YXRlLlxuICAgICAqIFxuICAgICAqL1xuXHRpbnZhbGlkYXRlKG5vZGU6IHN0cmluZyB8IE5vZGUgfCBUYXJnZXROb2RlLGZvcmdldD86Ym9vbGVhbik7XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHNlbGVjdG9yIG9yIGVsZW1lbnQgaW4gZWl0aGVyIHRoZSBzb3VyY2Ugb3IgdGFyZ2V0IGRvY3VtZW50LCBmaW5kcyB0aGUgYXNzb2NpYXRlZCBDb0VsZW1lbnQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHNlbGVjdG9yT3JOb2RlIGFuIHNub2RlLHRub2RlLCBUYXJnZXROb2RlIG9yIHNvdXJjZSBvciB0YXJnZXQgZG9jdW1lbnQgc2VsZWN0b3IuXG4gICAgICogQHJldHVybnMgVGhlIENvRWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIFxuICAgICAqL1xuXHRnZXQoc2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IE5vZGUgfCBUYXJnZXROb2RlLGdldGZ1bmM/OkdldCk6IENvRWxlbWVudDxUPjtcblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZ2VuZXJhdGVkIHRhcmdldCBub2RlICh0bm9kZSkgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIuIE9wdGlvbmFsbHkgbGV0cyB0aGUgY2FsbGVyIHNwZWNpZnkgYSAnc3RhdGUgY2hhbmdlcidcbiAgICAgKiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHRvIGVmZmVjdCBjaGFuZ2VzIG9mIHN0YXRlIHRvIHRoZSB0bm9kZS4gVGhlIHN0YXRlIGNoYW5nZXIgaXMgc3RvcmVkIHNvIHRoYXRcbiAgICAgKiB0aGUgY2hhbmdlcyBhcmUgcmVjcmVhdGVkIG9uIGV2ZXJ5IHJlcGFpbnQgb2YgdGhlIHRoZSB0bm9kZS5cbiAgICAgKiAgXG4gICAgICogQHBhcmFtIG5vZGUgYW4gc25vZGUsIFRhcmdldE5vZGUgb3Igc291cmNlIGRvY3VtZW50IHNlbGVjdG9yLlxuICAgICAqIEBwYXJhbSBjaGFuZ2VpZCAoT3B0aW9uYWwgYnV0IHJlcXVpcmVkIGlmIGNoYW5nZXIgaXMgc3BlY2lmaWVkKSBhIHVuaXF1ZSBpZCBvZiB0aGUgY2hhbmdlIChJZiB0aGUgY2hhbmdlIGlzIHJlYWRkZWQgd2l0aCB0aGUgc2FtZSBpZCwgaXQgd2lsbCByZXBsYWNlIHRoZSBlYXJsaWVyIGNoYW5nZSlcbiAgICAgKiBAcGFyYW0gY2hhbmdlciAoT3B0aW9uYWwpIFRoZSBjYWxsYmFjayB0byBlZmZlY3QgY2hhbmdlcywgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB0bm9kZSBpcyBhdmFpbGFibGUuIElmIGN1cnJlbnRseSBhdmFpbGFibGUsIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseS4gVGhlIGNhbGxiYWNrIHdpbGwgYWxzbyBiZSBjYWxsZWQgb24gYW55IHN1YnNlcXVlbnQgcmVwYWludCBvZiB0aGUgdG5vZGUuXG4gICAgICovXG4gICAgICQobm9kZTpOb2RlfHN0cmluZ3xUYXJnZXROb2RlLGNoYW5nZWlkPzpzdHJpbmcsY2hhbmdlcj86KEVsZW1lbnQpPT5hbnkpIDogRWxlbWVudDtcblxuICAgLyoqXG5cdCAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgZ2l2ZW4gbm9kZS5cblx0ICogXG5cdCAqIEBwYXJhbSBub2RlICAgICAgVGhlIG5vZGUgb3IgaXRzIHNlbGVjdG9yXG5cdCAqIEBwYXJhbSBldmVudG5hbWUgVGhlIGV2ZW50IG5hbWUsIGUuZy4gJ2NsaWNrJyBvciAnbXljdXN0b21ldmVudCdcblx0ICogQHBhcmFtIGhhbmRsZXIgIFRoZSBjYWxsYmFjay5cblx0ICovXG5cdC8vYWRkRXZlbnRMaXN0ZW5lcihub2RlOk5vZGV8c3RyaW5nfFRhcmdldE5vZGUsZXZlbnRuYW1lOnN0cmluZyxoYW5kbGVyOihldmVudDpFdmVudCk9PmFueSk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFuIGV2ZW50aGFuZGxlciBhZGRlZCB2aWEgYWRkRXZlbnRMaXN0ZW5lci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZXZlbnRuYW1lIFxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuXHQvL3JlbW92ZUV2ZW50TGlzdGVuZXIobm9kZTpOb2RlfHN0cmluZ3xUYXJnZXROb2RlLGV2ZW50bmFtZTpzdHJpbmcsaGFuZGxlcjooZXZlbnQ6RXZlbnQpPT5hbnkpO1xuXG5cbiAgICAvKipcbiAgICAgKiBSZWJ1aWxkcyB0aGUgVGFyZ2V0Tm9kZSB0cmVlIGZyb20gdGhlIHN1cHBsaWVkIHNkb20uIEFsbCBjaGlsZHJlbiBhcmUgYWxzbyByZWJ1aWx0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBub2RlIFxuICAgICAqL1xuXHQvL3JlYnVpbGQobm9kZTogc3RyaW5nIHwgTm9kZSB8IFRhcmdldE5vZGUpO1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIHNvdXJjZSBUYXJnZXROb2RlIHRoYXQgZ2VuZXJhdGVkIHRoZSB0YXJnZXQgaWQgb3Igbm9kZSAnaWRub2RlJ1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBub2RlIFRoZSB0YXJnZXQgbm9kZSwgb3IgaXRzICdkYXRhLWNvaWQnIGF0dHJpYnV0ZSBpZCwgb3IgYSBzZWxlY3Rvci5cbiAgICAgKiBAcmV0dXJucyBUaGUgZm91bmQgc291cmNlIHRhcmdldCBub2RlIG9yIG51bGwgaWYgbm9uIGZvdW5kLiBUbyBmZXRjaCB0aGUgbm9kZSwgdXNlIGB0bi5zbm9kZWBcbiAgICAgKi9cblx0Ly9nZXRTb3VyY2VOb2RlKG5vZGU6IHN0cmluZyB8IE5vZGUpOiBUYXJnZXROb2RlO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGFzc2V0J3MgY29udHJvbCB0byB0aGUgdGFyZ2V0IG5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtICBwYXJlbnQgVGhlIHRhcmdldCBkb20gbm9kZSBvciBxdWVyeSBzZWxlY3RvciB3aG9zZSBjaGlsZCB0aGUgbmV3IGNvbnRyb2wgd2lsbCBiZWNvbWUuXG4gICAgICogQHBhcmFtICB0b0F0dGFjaCBUaGUgY29udHJvbCBvciBhc3NldCB0byBhdHRhY2guXG4gICAgICogQHBhcmFtICBwYXJhbWV0ZXJzIChPcHRpb25hbCksIGlmICd0b0F0dGFjaCcgd2FzIGFuIGFzc2V0LCB0aGVuIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gcGFzcyB0byB0ZSBhc3NldC4gVGhpcyBvYmplY3QgaXMgYXZhaWxhYmxlIHRvIHRoZSBhc3NldCBhcyAndGhpcy5wYXJhbWV0ZXJzJ1xuICAgICAqIFxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHdoZW4gdGhlIGNvbnRyb2wgaXMgbG9hZGVkIChpZiBpdCB3YXMgYW4gYXNzZXQpIGF0dGFjaGVkLlxuICAgICAqL1xuICAgIGF0dGFjaChwYXJlbnQ6Tm9kZXxzdHJpbmcsdG9BdHRhY2g6QXNzZXRJRHxzdHJpbmd8Q29FbGVtZW50LHBhcmFtZXRlcnM/Ontba2V5OnN0cmluZ106YW55fSkgOiBQcm9taXNlPENvRWxlbWVudD47XG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2hlcyBhIHByZXZpb3VzbHkgYXR0YWNoZWQoKSBjb250cm9sLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0b0RldGFjaCBUaGUgY29udHJvbCB0aGF0IHdhcyBhdHRhY2hlZCwgb3IgdGhlIHRhcmdldCBub2RlIG9yIHF1ZXJ5IHNlbGVjdG9yIG9mIHRoZSBwYXJlbnQgZnJvbSB3aGljaCB0byBhdHRhY2ggYWxsIHByZXZpb3VzbHkgYXR0YWNoZWQgY29udHJvbHNcbiAgICAgKi9cbiAgICBkZXRhY2godG9EZXRhY2g6c3RyaW5nfENvRWxlbWVudCkgOiBQcm9taXNlPGFueT47XG5cbiAgICBtYWtlQ29FbGVtZW50KHRuOlRhcmdldE5vZGUpOiBDb0VsZW1lbnQgfCBQcm9taXNlPENvRWxlbWVudD4gXG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHVud2F0Y2hlZCBjaGFuZ2VzIG9uIGFuIHNub2RlIHZpYSBjaGFuZ2VzKCkuIFdvbid0IHRyaWdnZXIgYSByZWJ1aWxkLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzbm9kZSBcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyBcbiAgICAgKlxuICAgIHVud2F0Y2hlZFNub2RlQ2hhbmdlKHNub2RlOk5vZGUsY2hhbmdlczooKT0+YW55KTtcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgc3RhdGUgY2hhbmdlciBmb3IgdGhpcyBzbm9kZS5cbiAgICAgKiBcbiAgICAgKlxuICAgIHJlbW92ZVN0YXRlQ2hhbmdlcnMoc25vZGU6IE5vZGUpOiB2b2lkOyAqL1xuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgU3RhdGVDaGFuZ2VycyBmb3IgdGhpcyBzbm9kZS4gaWYgJ2NyZWF0ZUlmTm90RXhpc3QnIGlzIHRydWUsIHRoZW4gY3JlYXRlIGlmIGl0IGRvZXNudCBleGlzdFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzbm9kZSBcbiAgICAgKiBAcGFyYW0gY3JlYXRlSWZOb3RFeGlzdHMgXG4gICAgICoqL1xuICAgIGdldFN0YXRlQ2hhbmdlcnMoc25vZGU6IE5vZGUsIGNyZWF0ZUlmTm90RXhpc3RzPzogYm9vbGVhbik6IFN0YXRlQ2hhbmdlcnM7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgc3RhdGUgY2hhbmdlIGZ1bmN0aW9uLCB3aGljaCBjYW4gbWFrZSBjaGFuZ2VzIHRvIHRoZSBhdHRyaWJ1dGVzIGV0YyBvZiBhIHRub2RlIHRoYXQgYXJlIGRpZmZlcmVudCBmcm9tIHRob3NlXG4gICAgICogY29waWVkIGZyb20gdGhlIHNub2RlLiBUaGUgY2hhbmdlciBjYWxsYmFjayBpcyBjYWxsZWQgb24gZXZlcnkgcmVuZGVyIG9mIHRoZSB0bm9kZSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgYWZmZWN0ZWRcbiAgICAgKiBvbmNlIGFyZSBub3QgbG9zdCBkdWUgdG8gcmVnZW5lcmF0aW9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCBBIHVuaXF1ZSBpZCBvZiB0aGUgc3RhdGUgY2hhbmdlLlxuICAgICAqIEBwYXJhbSBzbm9kZSBUaGUgc25vZGUgdG8gYWRkL3JlbW92ZSB0aGUgY2hhbmdlciBmb3JcbiAgICAgKiBAcGFyYW0gY2hhbmdlciBUaGUgY2hhbmdlciBjYWxsYmFjayB0byBhZGQgb3IgdW5kZWZpbmVkIHRvIHJlbW92ZSBleGlzdGluZyBjaGFuZ2Vycy4gVGhpcyB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSB0bm9kZSBFTGVtZW50IGFuZCBjYW4gbWFrZSBhbnkgY2hhbmdlcyB0byBpdC5cbiAgICAgKi9cbiAgICBzdGF0ZUNoYW5nZXIoaWQ6c3RyaW5nLHNub2RlOk5vZGUsY2hhbmdlcj86U3RhdGVDaGFuZ2VyKTtcblxuICAgIC8qKlxuICAgICAqIFNldCBhIEdldHMgZnVuY3Rpb24gb24gdGhlIHNub2RlLiBJZiBubyBHZXQgdGhlbiBhbGwgR2V0cyBhcmUgcmVtb3Zlcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc25vZGUgXG4gICAgICogQHBhcmFtIGdldCBcbiAgICAgKi9cbiAgICBzZXRHZXRzKHNub2RlOiBOb2RlLGdldD86R2V0KTogdm9pZDtcblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgY3VycmVudGx5IHNldCBHZXQgZnVuY3Rpb25zIG9uIHRoaXMgc25vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIHNub2RlIFxuICAgICAqL1xuICAgIGdldEdldHM8VCBleHRlbmRzIENvRWxlbWVudD1Db0VsZW1lbnQ+KHNub2RlOiBOb2RlKTogR2V0PFQ+W107XG5cblxufVxuXG4iLCJcbi8qKlxuICogQSBwYXRjaCBpcyByZXNwb25zaWJlIGZvciAncGF0Y2hpbmcnIGEgdG5vZGUgYmFjayB0byBpdHMgb3JpZ2luYWwgcG9zaXRpb25cbiAqIGluIGl0cyB0YXJnZXQgZG9tJ3MgcGFyZW50IGVsZW1lbnQuIEl0IGlzIHVzZWQgZHVyaW5nIHRoZSByZXBhaW50IG9mIGFuIGludGVyaW0gbm9kZVxuICogdG8gcGF0Y2ggdGhlIHJlYnVpbHQgdG5vZGUgYmFjayB0byBpdHMgb3JpZ2luYWwgcG9zaXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXRjaCB7XG5cbiAgICAvKipcbiAgICAgKiBSZXN0b3JlIHRoZSBuZXdseSBnZW5lcmF0ZWQgJ2VsZW0nIHRvIGl0cyBvcmlnaW5hbCBsb2NhdGlvbiBpbiBpdHMgcGFyZW50LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBlbGVtIFxuICAgICAqL1xuICAgIHJlc3RvcmVQb3NpdGlvbihlbGVtOk5vZGUpO1xufVxuXG4iLCJpbXBvcnQgeyBQYXRjaCBhcyBQYXRjaCB9IGZyb20gXCIuL1BhdGNoXCI7XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgUGF0Y2guXG4gKiBcbiAqIEEgUmVwYWludCBwYXRjaCBpcyBhbiBvcGVyYXRpb24gdGhhdCByZW1lbWJlcnMgdGhlIHBvc2l0aW9uIG9mIGEgZG9jdW1lbnQgbm9kZSBpbiBpdHMgb3JpZ2luYWwgcGFyZW50XG4gKiBhbmQgcmVhdHRhY2hlcyBpdCBhZnRlciB0aGUgbm9kZSBpcyByZWdlbmVyYXRlZC5cbiAqIFxuICogSWYgdGhlIG5vZGUgZG9lcyBub3QgY3VycmVudGx5IGhhdmUgYSBwYXJlbnQgKGZvciBleGFtcGxlIG9uIGZpcnN0IGdlbmVyYXRpb24pLCB0aGVuIHRoZSBzdXBwbGllZFxuICogcGFyZW50IGluIHRoZSBjb25zdHJ1Y3RvciBpcyB1c2VkLlxuICovXG5leHBvcnQgY2xhc3MgUmVwYWludCBpbXBsZW1lbnRzIFBhdGNoIHtcbiAgICAvLyBpZFxuICAgIHByb3RlY3RlZCBwb3RlbnRpYWxQYXJlbnQ6Tm9kZTsgLy8gY3VycmVudCBvciBmdXR1cmUgcGFyZW50XG5cbiAgICAvLyBzdGF0ZVxuICAgIHByb3RlY3RlZCBpbmRleDpudW1iZXI7XG4gICAgcHJvdGVjdGVkIHBhcmVudE5vZGU6Tm9kZTtcbiAgICBwcm90ZWN0ZWQgdG5vZGU6Tm9kZTtcblxuXG4gICAgY29uc3RydWN0b3IocG90ZW50aWFsUGFyZW50Ok5vZGUsdG5vZGU6Tm9kZSkge1xuICAgICAgICB0aGlzLnBvdGVudGlhbFBhcmVudD1wb3RlbnRpYWxQYXJlbnQ7XG4gICAgICAgIHRoaXMudG5vZGU9dG5vZGU7XG4gICAgICAgIHRoaXMuc2F2ZVBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlbW92ZUNoaWxkKCkge1xuICAgICAgICAvLyBkZXRhY2ggdG5vZGUgZnJvbSBwYXJlbnQuXG4gICAgICAgIGlmICh0aGlzLmluZGV4Pj0wICYmIHRoaXMudG5vZGUgJiYgdGhpcy5wb3RlbnRpYWxQYXJlbnQgJiYgdGhpcy5wb3RlbnRpYWxQYXJlbnQuY29udGFpbnModGhpcy50bm9kZSkpXG4gICAgICAgICAgICB0aGlzLnBvdGVudGlhbFBhcmVudC5yZW1vdmVDaGlsZCh0aGlzLnRub2RlKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyByZXN0b3JlUG9zaXRpb24oZWxlbTogTm9kZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKCk7XG4gICAgICAgIHRoaXMucmVhdHRhY2hUTm9kZUZyb21Qb3NpdGlvbihlbGVtKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc2F2ZVBvc2l0aW9uKCkgIHtcblxuICAgICAgICBpZiAodGhpcy50bm9kZSAmJiB0aGlzLnRub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMucG90ZW50aWFsUGFyZW50PXRoaXMudG5vZGUucGFyZW50Tm9kZTsgLy8gbm90ZTogb3ZlcndyaXRlcyB0aGUgb3JpZ2luYWwgcG90ZW50aWFsIHBhcmVudFxuICAgICAgICAgICAgdGhpcy5pbmRleD1BcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRoaXMucG90ZW50aWFsUGFyZW50LmNoaWxkTm9kZXMsIHRoaXMudG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlYXR0YWNoVE5vZGVGcm9tUG9zaXRpb24odG5vZGU6Tm9kZSkge1xuICAgICAgICAvLyBhdHRhY2ggdG5vZGVcbiAgICAgICAgbGV0IGU9dG5vZGUgYXMgRWxlbWVudDtcbiAgICAgICAgLy9pZiAoZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkhPSdkaXYnKVxuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnSGVyZScpO1xuICAgICAgICBpZiAodG5vZGUgJiYgdGhpcy5wb3RlbnRpYWxQYXJlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmluZGV4PDB8fHRoaXMuaW5kZXg+PXRoaXMucG90ZW50aWFsUGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3RlbnRpYWxQYXJlbnQuYXBwZW5kQ2hpbGQodG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvdGVudGlhbFBhcmVudC5pbnNlcnRCZWZvcmUodG5vZGUsdGhpcy5wb3RlbnRpYWxQYXJlbnQuY2hpbGROb2Rlc1t0aGlzLmluZGV4XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxufSIsImltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi9SZW5kZXJcIjtcbmltcG9ydCB7IFJlcGFpbnQgfSBmcm9tIFwiLi9SZXBhaW50XCI7XG5pbXBvcnQgeyBQYXRjaCB9IGZyb20gXCIuL1BhdGNoXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4vVGhpc1wiO1xuXG5leHBvcnQgZW51bSBUTlMge1xuICAgIE1BUktFRD0wLFxuICAgIFJFVVNFRD0xLFxuICAgIEFEREVEPTJcbn1cblxuXG4vKipcbiAqIFRhcmdldE5vZGUgc3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgY29udmVyc2lvbiBiZXR3ZWVuIGEgU291cmNlIG5vZGUgKHNub2RlKSBpbiB0aGUgQ09NTCBodG1sIGZpbGVcbiAqIGFuZCB0aGUgcmVuZGVyZWQgZmluYWwgTm9kZSAodGFyZ2V0IG5vZGUgb3IgdG5vZGUpLlxuICogXG4gKiBcbiAqL1xuIGV4cG9ydCBpbnRlcmZhY2UgVGFyZ2V0Tm9kZSB7XG4gICAgLyoqXG4gICAgICogVGhlIHNvdXJjZSBub2RlIHRoYXQgdGhpcyB0YXJnZXQgbm9kZSByZXByZXNlbnRzXG4gICAgICovXG4gICAgIHNub2RlOk5vZGU7XG4gICAgLyoqXG4gICAgICogVGhlIHRhcmdldCBub2RlIHRoYXQgaXMgZ2VuZXJhdGVkIGJ5IHRoZSBDb0VsZW1lbnQncyBvblJlbmRlcigpXG4gICAgICovXG4gICAgIHRub2RlOk5vZGU7ICBcbiAgICAgcmVwbGFjZWQ6Tm9kZTsgLy8gb25seSB1c2VkIGJ5IFdTSW5zZXJ0XG4gICAgIGNvbXBvbmVudDpDb0VsZW1lbnQ7XG4gICAgIHBhcmVudD86VGFyZ2V0Tm9kZTtcbiAgICAgY2hpbGRyZW46VGFyZ2V0Tm9kZVsvKiBpdGVyYXRpb24gKi9dWy8qIGluZGV4ICovXTsgXG4gICAgIG1hcmtlZDpUTlM7XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIGNoaWxkIHNub2RlIChhcyByZXR1cm5lZCBieSBzb3VyY2VDaGlsZE5vZGVzKCkpLCBjcmVhdGUgaXRzIFRhcmdldE5vZGUuXG4gICAgICogXG4gICAgICogVGhlIGltcGxlbWVudGF0aW9uIHdpbGw6XG4gICAgICogICAgICAxLiB1c2UgaXRzIG93bmluZyBDb252ZXJ0ZXIgdG8gY3JlYXRlIHRoZSBDb0VsZW1lbnQgZm9yIHRoZSBuZXcgY2hpbGQuXG4gICAgICogICAgICAyLiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBUYXJnZXROb2RlIGFzIHRoZSBjaGlsZFxuICAgICAqICAgICAgMy4gQWRkIGEgQ29FbGVtZW50IHRoZSBjaGlsZCdzICdjb21wb25lbnQnXG4gICAgICogXG4gICAgICogXG4gICAgICogQHBhcmFtIHNub2RlIFRoZSBzb3VyY2Ugbm9kZSBmb3Igd2hpY2ggdG8gY3JlYXRlIGEgVGFyZ2V0Tm9kZVxuICAgICAqIEBwYXJhbSBjdnQgVGhlIENPbnZlcnRlciB0byB1c2UgdG8gY3JlYXRlIHRoaXMgbm9kZSdzIENvRUxlbWVudCBcbiAgICAgKiBAcmV0dXJucyBUaGUgbmV3IFRhcmdldE5vZGVcbiAgICAgKi9cbiAgICBtYWtlVGFyZ2V0Tm9kZShzbm9kZTpOb2RlLGN2dDpDb252ZXJ0ZXI8VGhpcz4pOiBUYXJnZXROb2RlO1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIENvbnZlcnRlciB0aGF0ICdvd25zJyB0aGlzIFRhcmdldE5vZGUuIFRoaXMgY29udmVydGVyIHdpbGwgYmUgdXNlZFxuICAgICAqIHRvIHJlbmRlciB0aGlzIFRhcmdldE5vZGUsIGFuZCBoZW5jZSBpdHMgJ1RoaXMnIHdpbGwgYmUgdXNlIGR1cmluZyByZW5kZXJpbmcgb2YgdGhlIFRhcmdldE5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGRlZmF1bHRPd25lciBUaGUgZGVmYXVsdCBvd25lci5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBnZXRPd25lcihkZWZhdWx0T3duZXI6Q29udmVydGVyPFRoaXM+KSA6IENvbnZlcnRlcjxUaGlzPlxuXG5cbiAgICBnZXRJZCgpOiBhbnk7XG5cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaHRtbCBjaGlsZCBOb2RlcyBvZiB0aGlzIFRhcmdldE5vZGUgd2hpY2ggc2hvdWxkIGJlIHVzZWQgZm9yIGNyZWF0aW5nIFxuICAgICAqIGNoaWxkIFRhcmdldE5vZGVzLlxuICAgICAqIFxuICAgICAqIER1cmluZyB0ZW1wbGF0aW5nLCB0aGUgYWN0dWFsIG5vZGVzIHJldHVybmVkIG1heSBiZSBkaWZmZXJlbnQgZnJvbSB0aGUgdHJ1ZSBjaGlsZHJlbiBvZiB0aGlzLnNub2RlXG4gICAgICogXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgc291cmNlQ2hpbGROb2RlcygpIDogTm9kZUxpc3RPZjxDaGlsZE5vZGU+IHwgTm9kZVtdO1xuXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGFsbCB0YXJnZXQgbm9kZXMgZ2VuZXJhdGVkIGJ5IHRoaXMgc291cmNlIG5vZGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgZ2V0R2VuZXJhdGVkTm9kZXMoKTogTm9kZVtdO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhICBjaGlsZCB0YXJnZXQgbm9kZSBhcyBhIGNoaWxkIHRvIHRoaXMgdGFyZ2V0IG5vZGUsIGZvciB0aGUgaXRlcmF0aW9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0biBcbiAgICAgKiBAcGFyYW0gaXRlcmF0aW9uIFxuICAgICAqL1xuICAgIGFkZENoaWxkKHRuOlRhcmdldE5vZGUsaXRlcmF0aW9uOm51bWJlcik7XG5cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlIHRoZSBjaGlsZCAndG4nIHdpdGggdGhlIHJlcGxhY2VtZW50ICdydG4nXG4gICAgICogXG4gICAgICogQHBhcmFtIHRuIFxuICAgICAqIEBwYXJhbSBydG4gXG4gICAgICovXG4gICAgcmVwbGFjZUNoaWxkKHRuOiBUYXJnZXROb2RlLCBydG46IFRhcmdldE5vZGUpO1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIHRoaXMgdGFyZ2V0IG5vZGUuXG4gICAgICovXG4gICAgcmVtb3ZlQWxsQ2hpbGRyZW4oKTtcblxuXG4gICAgXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGFueSB1bnVzZWQgY2hpbGRyZW4sIGNhbGxpbmcgdGhlIGF0dGFjaGVkIHdzZWxlbWVudCdzICdjbGVhbnVwJyBpZiBzdXBwbGllZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcGFyZW50dG4gXG4gICAgICovXG4gICAgcmV0aXJlVW51c2VkKCk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBpbiBjaGlsZHJlbiBvZiB0aGUgY2hpbGQgd2hvc2Ugbm9kZSBtYXRjaGVzICdjbidcbiAgICAgKiBhbmQgd2FzIGdlbmVyYXRlZCBpbiBpdGVyYXRpb24gbnVtYmVyICdpdGVyYXRpb24nIHByZXZpb3VzbHkuXG4gICAgICogXG4gICAgICogQHBhcmFtIGNuIFxuICAgICAqIEBwYXJhbSBpdGVyYXRpb24gXG4gICAgICogQHJldHVybnMgdGhlIGluZGV4IGluIGNoaWxkcmVuIG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBmaW5kQ2hpbGRGb3JOb2RlKGNuOiBOb2RlLGl0ZXJhdGlvbjpudW1iZXIpIDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaXRlcmF0aW9uIHRvIHdoaWNoIHRoZSBkaXJlY3QgY2hpbGQgYGNoaWxkYCBiZWxvbmdzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjaGlsZCBBIGRpcmVjdCBjaGlsZCBvZiB0aGlzIFRhcmdldE5vZGVcbiAgICAgKiBAcmV0dXJucyBUaGUgaXRlcmF0aW9uLCBvciAtMSBpZiBub3QgZm91bmQuXG4gICAgICovXG4gICAgZ2V0SXRlcmF0aW9uT2ZDaGlsZChjaGlsZDpUYXJnZXROb2RlKSA6IG51bWJlcjtcblxuICAgIFxuXG4gICAgaW5pdE1hcmsoKTtcblxuICAgIFxuXG4gICAgLyoqXG4gICAgICogQWRkIGFuICdhdHRhY2hlZCcgY29udHJvbCAoc3VjaCBhcyBhZGRlZCBieSB0aGlzLmF0dGFjaCgpKSB0byB0aGlzIG5vZGUuXG4gICAgICogXG4gICAgICovXG4gICAgYXR0YWNoQ29udHJvbChjb250cm9sOiBDb0VsZW1lbnQpO1xuXG4gICAgcmVtb3ZlQXR0YWNoZWRDb250cm9sKGNvbnRyb2w6Q29FbGVtZW50KTtcblxuICAgIHJlbW92ZUFsbEF0dGFjaGVkQ29udHJvbHMoY2I/Oihjb21wOkNvRWxlbWVudCk9PmFueSk7XG5cbiAgICBpc0F0dGFjaGVkKGNvbnRyb2w6IENvRWxlbWVudCk6IGJvb2xlYW47XG5cblxuICAgIHJlbmRlckF0dGFjaGVkKHJtOlJlbmRlcixjdnQ6Q29udmVydGVyPFRoaXM+KTtcblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgdGhpcyB0YXJnZXQgbm9kZS5cbiAgICAgKiBUaGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSBhIENvbnZlcnRlci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcm0gXG4gICAgICovXG4gICAgcmVuZGVyKHJtOlJlbmRlcik7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgUGF0Y2ggb2JqZWN0IHRoYXQgaXMgdXNlZCBkdXJpbmcgaW52YWxpZGF0aW9uIHRvIGF0dGFjaFxuICAgICAqIHRoZSByZWdlbmVyYXRlZCBub2RlIGJhY2sgdG8gaXRzIHBhcmVudC5cbiAgICAgKi9cbiAgICBnZXRQYXRjaCgpIDogUGF0Y2g7XG4gICAgXG4gICAgLyoqXG4gICAgICogRW1wdHkgdGhpcyBub2RlLCBhcyBpZiBpdCBoYWQganVzdCBiZWVuIGFkZGVkIHRvIGl0cyBwYXJlbnQsIHByaW9yIHRvIGEgZnVsbCByZWdlbmVyYXRpb25cbiAgICAgKi9cbiAgICByZXNldCgpO1xuXG4gICAgcmVtb3ZlKCk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgc3R5bGUgY2xhc3MgdG8gdGhlIHRhcmdldCBub2RlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjbGF6eiBcbiAgICAgKi9cbiAgICBhZGRTdHlsZUNsYXNzKGNsYXp6OnN0cmluZyk7XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgc3R5bGUgZnJvbSB0aGUgdG5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGNsYXp6IFxuICAgICAqL1xuICAgIHJlbW92ZVN0eWxlQ2xhc3MoY2xheno6c3RyaW5nKTtcblxuICAgIC8qKlxuXHQgKiBSZXRyaWV2ZXMsIG1vZGlmaWVzIG9yIHJlbW92ZXMgY3VzdG9tIGRhdGEgYXR0YWNoZWQgdG8gYSBDb0VsZW1lbnQuXG5cdCAqXG5cdCAqIFVzYWdlczpcblx0ICogPGg0PlNldHRpbmcgdGhlIHZhbHVlIGZvciBhIHNpbmdsZSBrZXk8L2g0PlxuXHQgKiA8cHJlPlxuXHQgKiAgICBkYXRhKFwibXlLZXlcIiwgbXlEYXRhKVxuXHQgKiA8L3ByZT5cblx0ICogQXR0YWNoZXMgPGNvZGU+bXlEYXRhPC9jb2RlPiAod2hpY2ggY2FuIGJlIGFueSBKUyBkYXRhIHR5cGUsIGUuZy4gYSBudW1iZXIsIGEgc3RyaW5nLCBhbiBvYmplY3QsIG9yIGEgZnVuY3Rpb24pXG5cdCAqIHRvIHRoaXMgZWxlbWVudCwgdW5kZXIgdGhlIGdpdmVuIGtleSBcIm15S2V5XCIuIElmIHRoZSBrZXkgYWxyZWFkeSBleGlzdHMsdGhlIHZhbHVlIHdpbGwgYmUgdXBkYXRlZC5cblx0ICpcblx0ICpcblx0ICogPGg0PlNldHRpbmcgYSB2YWx1ZSBmb3IgYSBzaW5nbGUga2V5IChyZW5kZXJlZCB0byB0aGUgRE9NKTwvaDQ+XG5cdCAqIDxwcmU+XG5cdCAqICAgIGRhdGEoXCJteUtleVwiLCBteURhdGEsIHdyaXRlVG9Eb20pXG5cdCAqIDwvcHJlPlxuXHQgKiBBdHRhY2hlcyA8Y29kZT5teURhdGE8L2NvZGU+IHRvIHRoaXMgZWxlbWVudCwgdW5kZXIgdGhlIGdpdmVuIGtleSBcIm15S2V5XCIgLiBJZiB0aGUga2V5IGFscmVhZHkgZXhpc3RzLHRoZSB2YWx1ZSB3aWxsIGJlIHVwZGF0ZWQuXG5cdCAqIFdoaWxlIDxjb2RlPm9WYWx1ZTwvY29kZT4gY2FuIGJlIGFueSBKUyBkYXRhIHR5cGUgdG8gYmUgYXR0YWNoZWQsIGl0IG11c3QgYmUgYSBzdHJpbmcgdG8gYmUgYWxzb1xuXHQgKiB3cml0dGVuIHRvIERPTS4gVGhlIGtleSBtdXN0IGFsc28gYmUgYSB2YWxpZCBIVE1MIGF0dHJpYnV0ZSBuYW1lIChpdCBtdXN0IGNvbmZvcm0gdG8gPGNvZGU+c2FwLnVpLmNvcmUuSUQ8L2NvZGU+XG5cdCAqIGFuZCBtYXkgY29udGFpbiBubyBjb2xvbikgYW5kIG1heSBub3Qgc3RhcnQgd2l0aCBcInNhcC11aVwiLiBXaGVuIHdyaXR0ZW4gdG8gSFRNTCwgdGhlIGtleSBpcyBwcmVmaXhlZCB3aXRoIFwiZGF0YS1cIi5cblx0ICpcblx0ICpcblx0ICogPGg0PkdldHRpbmcgdGhlIHZhbHVlIGZvciBhIHNpbmdsZSBrZXk8L2g0PlxuXHQgKiA8cHJlPlxuXHQgKiAgICBkYXRhKFwibXlLZXlcIilcblx0ICogPC9wcmU+XG5cdCAqIFJldHJpZXZlcyB3aGF0ZXZlciBkYXRhIGhhcyBiZWVuIGF0dGFjaGVkIHRvIHRoaXMgZWxlbWVudCAodXNpbmcgdGhlIGtleSBcIm15S2V5XCIpIGJlZm9yZS5cblx0ICpcblx0ICpcblx0ICogPGg0PlJlbW92aW5nIHRoZSB2YWx1ZSBmb3IgYSBzaW5nbGUga2V5PC9oND5cblx0ICogPHByZT5cblx0ICogICAgZGF0YShcIm15S2V5XCIsIG51bGwpXG5cdCAqIDwvcHJlPlxuXHQgKiBSZW1vdmVzIHdoYXRldmVyIGRhdGEgaGFzIGJlZW4gYXR0YWNoZWQgdG8gdGhpcyBlbGVtZW50ICh1c2luZyB0aGUga2V5IFwibXlLZXlcIikgYmVmb3JlLlxuXHQgKlxuXHQgKlxuXHQgKiA8aDQ+UmVtb3ZpbmcgYWxsIGN1c3RvbSBkYXRhIGZvciBhbGwga2V5czwvaDQ+XG5cdCAqIDxwcmU+XG5cdCAqICAgIGRhdGEobnVsbClcblx0ICogPC9wcmU+XG5cdCAqXG5cdCAqXG5cdCAqIDxoND5HZXR0aW5nIGFsbCBjdXN0b20gZGF0YSB2YWx1ZXMgYXMgYSBwbGFpbiBvYmplY3Q8L2g0PlxuXHQgKiA8cHJlPlxuXHQgKiAgICBkYXRhKClcblx0ICogPC9wcmU+XG5cdCAqIFJldHVybnMgYWxsIGRhdGEsIGFzIGEgbWFwLWxpa2Ugb2JqZWN0LCBwcm9wZXJ0eSBuYW1lcyBhcmUga2V5cywgcHJvcGVydHkgdmFsdWVzIGFyZSB2YWx1ZXMuXG5cdCAqXG5cdCAqXG5cdCAqIDxoND5TZXR0aW5nIG11bHRpcGxlIGtleS92YWx1ZSBwYWlycyBpbiBhIHNpbmdsZSBjYWxsPC9oND5cblx0ICogPHByZT5cblx0ICogICAgZGF0YSh7XCJteUtleTFcIjogbXlEYXRhLCBcIm15S2V5MlwiOiBudWxsfSlcblx0ICogPC9wcmU+XG5cdCAqIEF0dGFjaGVzIDxjb2RlPm15RGF0YTwvY29kZT4gKHVzaW5nIHRoZSBrZXkgXCJteUtleTFcIiBhbmQgcmVtb3ZlcyBhbnkgZGF0YSB0aGF0IGhhZCBiZWVuXG5cdCAqIGF0dGFjaGVkIGZvciBrZXkgXCJteUtleTJcIi5cblx0ICpcbiAgICAgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3Q8c3RyaW5nLGFueT58bnVsbH0gW3ZLZXlPckRhdGFdXG5cdCAqICAgICBTaW5nbGUga2V5IHRvIHNldCBvciByZW1vdmUsIG9yIGFuIG9iamVjdCB3aXRoIGtleS92YWx1ZSBwYWlycyBvciA8Y29kZT5udWxsPC9jb2RlPiB0byByZW1vdmVcblx0ICogICAgIGFsbCBjdXN0b20gZGF0YVxuXHQgKiBAcGFyYW0ge3N0cmluZ3xhbnl9IFt2VmFsdWVdXG5cdCAqICAgICBWYWx1ZSB0byBzZXQgb3IgPGNvZGU+bnVsbDwvY29kZT4gdG8gcmVtb3ZlIHRoZSBjb3JyZXNwb25kaW5nIGN1c3RvbSBkYXRhXG5cdCAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLGFueT58YW55fG51bGx9XG5cdCAqICAgICBBIG1hcCB3aXRoIGFsbCBjdXN0b20gZGF0YSwgYSBjdXN0b20gZGF0YSB2YWx1ZSBmb3IgYSBzaW5nbGUgc3BlY2lmaWVkIGtleSBvciA8Y29kZT5udWxsPC9jb2RlPlxuXHQgKiAgICAgd2hlbiBubyBjdXN0b20gZGF0YSBleGlzdHMgZm9yIHN1Y2ggYSBrZXkgb3IgdGhpcyBlbGVtZW50IHdoZW4gY3VzdG9tIGRhdGEgd2FzIHRvIGJlIHJlbW92ZWQuXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn1cblx0ICogICAgIFdoZW4gdGhlIHR5cGUgb2YgdGhlIGdpdmVuIHBhcmFtZXRlcnMgZG9lc24ndCBtYXRjaCBhbnkgb2YgdGhlIGRvY3VtZW50ZWQgdXNhZ2VzXG5cdCAqIFxuXHQgKi9cblx0ZGF0YSguLi5fYXJncykgOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGZ1bmN0aW9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuYW1lIFRoZSBmdW5jdGlvbiB0byBsaXN0ZW4gdG9cbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGNhbGxiYWNrIHRvIGNhbGxcbiAgICAgKi9cbiAgICBhZGRMaXN0ZW5lcihuYW1lOidvblByZVJlbmRlcid8J29uUG9zdFJlbmRlcicsbGlzdGVuZXI6KHJlZj86YW55KT0+YW55KTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBwcmV2aW91c2x5IGFkZGVkIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZnVuY3Rpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIG5hbWUgXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHJlbW92ZUxpc3RlbmVyKG5hbWU6J29uUHJlUmVuZGVyJ3wnb25Qb3N0UmVuZGVyJyxsaXN0ZW5lcjoocmVmPzphbnkpPT5hbnkpO1xuXG5cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgRE9NIHN5bnRoZXRpYyBldmVudCBvbiB0aGUgcm9vdCBub2RlIG9mIHRoaXMgb2JqZWN0LlxuICAgICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvQ3JlYXRpbmdfYW5kX3RyaWdnZXJpbmdfZXZlbnRzXG4gICAgICogXG4gICAgICogQHBhcmFtIGV2ZW50bmFtZSBUaGUgZXZlbnQgdG8gc2VuZCAsIGUuZy4gJ215ZXZlbnQnIFxuICAgICAqIEBwYXJhbSBkZXRhaWwgQW4gYXJib3RyYXJ5IHBheWxvYWQuIElmIG5vdCBzdXBwbGllZCwge3NlbmRlcjp0aGlzLmNvZWxlbWVudH0gd2lsbCBiZSB1c2VkLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFRoZSBjdXN0b20gZXZlbnQuIFxuICAgICAqL1xuICAgICBkaXNwYXRjaEV2ZW50KGV2ZW50bmFtZTpzdHJpbmcsZGV0YWlsPzp7W2tleTpzdHJpbmddOmFueX0sb3B0aW9ucz86RXZlbnRJbml0KSA6IEV2ZW50O1xuICAgIFxuXG4gICAgLyoqXG4gICAgICogR2V0cyBvciBzZXRzIHBhcmFtZXRlcnMgZm9yIGNoaWxkcmVuIGJ5IHRoZWlyIGl0ZXJhdGlvbiBhbmQgdGFnIG5hbWUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGl0ZXJhdGlvbiBcbiAgICAgKiBAcGFyYW0gdGFnbmFtZSBcbiAgICAgKiBAcGFyYW0gcGFyYW1ldGVycyBJZiBzcGVjaWZpZWQsIHNldHMgdGhlIHBhcmFtZXRlcnMsIGVsc2UgcmV0dXJucyB0aGVtXG4gICAgICovXG4gICAgY2hpbGRQYXJhbXMoaXRlcmF0aW9uOm51bWJlcix0YWduYW1lOnN0cmluZyxwYXJhbWV0ZXJzPzphbnkpIDogYW55O1xuXG4gICAgLyoqXG4gICAgICogTWF0Y2hlcyBhbGwgc291cmNlIG5vZGVzIGluIHRoaXMgaW1wbC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbWF0Y2hlciBcbiAgICAgKi9cbiAgICBtYXRjaFNub2RlKG1hdGNoZXI6KHNub2RlOk5vZGUpPT5ib29sZWFuKSA6IGJvb2xlYW5cbn1cblxuXG5cbi8qKlxuICogQSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGZldGNoaW5nIGFuIGF0dHJpYnV0ZSBmcm9tIGEgbm9kZS4gaWYgbm90IGZvdW5kIHRoZSBkZWZhdWx0IHZhbHVlIGluIGBkZWZ2YWxgIGlzIHJldHVybmVkLlxuICogXG4gKiBAcGFyYW0gbm9kZSBcbiAqIEBwYXJhbSBhdHRyIFxuICogQHBhcmFtIGRlZnZhbHVlIFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXR0cjxUIGV4dGVuZHMgKG51bWJlcnxzdHJpbmd8Ym9vbGVhbik9c3RyaW5nPihjdnQ6Q29udmVydGVyPFRoaXM+LG5vZGU6Tm9kZSxhdHRyOnN0cmluZyxkZWZ2YWx1ZT86VCxjdXJydG4/OlRhcmdldE5vZGUpIDogVCB7XG4gICAgbGV0IGVsZW06RWxlbWVudCA9IChub2RlIGFzIGFueSBhcyBFbGVtZW50KTtcbiAgICBsZXQgdmFsdWU9ZWxlbS5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIGRlZnZhbHVlO1xuXG4gICAgaWYgKGN2dClcbiAgICAgICAgdmFsdWU9Y3Z0LmV4cGFuZFN0cmluZyh2YWx1ZSxjdXJydG4pO1xuXG4gICAgLy8gY29udmVydFxuICAgIGlmICh0eXBlb2YgZGVmdmFsdWU9PSdzdHJpbmcnKVxuICAgICAgICByZXR1cm4gKHZhbHVlIGFzIGFueSk7XG4gICAgaWYgKHR5cGVvZiBkZWZ2YWx1ZT09J251bWJlcicpXG4gICAgICAgIHJldHVybiBOdW1iZXIucGFyc2VGbG9hdCh2YWx1ZSkgYXMgYW55O1xuICAgIGlmICh0eXBlb2YgZGVmdmFsdWU9PSdib29sZWFuJylcbiAgICAgICAgcmV0dXJuICh2YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKT09J3RydWUnKSBhcyBhbnk7XG5cbiAgICByZXR1cm4gdmFsdWUgYXMgYW55O1xufVxuXG5cbi8qKlxuICogUmVhZHMgYW4gYXR0cmlidXRlIGFuZCByZXR1cm5zIGFuIG9iamVjdCBlbmNvZGVkIGFzIGEgc3RyaW5nIHdpdGgga2V5cyBhbmQgdmFsdWUgZW5jb2RlZCBhcyAnIGRlbGltaXRlZCBzdHJpbmdzLlxuICogXG4gKiBFLmc6XG4gKiBgYGBodG1sXG4gKiAgICAgPHdzLWFzc2V0LXRodW1ibmFpbCBhc3NldC1pZD1cInsndHlwZSc6J2ltYWdlJywnZmlsZSc6J2NvZGUuUE5HJ31cIj48d3MtYXNzZXQtdGh1bWJuYWlsPlxuICogYGBgXG4gKiB3aWxsIHJldHVybiB7dHlwZTpcImltYWdlXCIsZmlsZTpcImNvZGUuUE5HXCJ9XG4gKiBcbiAqIEBwYXJhbSBjdnQgXG4gKiBAcGFyYW0gbm9kZSBcbiAqIEBwYXJhbSBhdHRyIFxuICogQHBhcmFtIGRlZnZhbHVlIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPYmplY3RBdHRyPFQgZXh0ZW5kcyB7W2tleTpzdHJpbmddOmFueX0+KGN2dDpDb252ZXJ0ZXI8VGhpcz4sbm9kZTpOb2RlLGF0dHI6c3RyaW5nICxkZWZ2YWx1ZT86VCkgOiBUIHtcbiAgICBsZXQgc3RyPWdldEF0dHIoY3Z0LG5vZGUsYXR0cik7XG4gICAgaWYgKCFzdHIgfHwgc3RyLnRyaW0oKS5sZW5ndGg9PTApXG4gICAgICAgIHJldHVybiBkZWZ2YWx1ZTtcbiAgICBsZXQgb2JqPUpTT04ucGFyc2Uoc3RyLnJlcGxhY2UoLycvZywnXCInKSk7XG4gICAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBBIHV0aWxpdHkgZm5jdGlvbiB0aGF0IGNhbiBiZSB1c2UgZHRvIGZldGNoIGJvdGggdGhlIENvbnZlcnRlciBhbmQgdGhlIFRhcmdldE5vZGUgb2YgYSBDb0VsZW1lbnQgaW50byBsb2NhbCBjb25zdGFudHMuXG4gKiBcbiAqIFVzYWdlOlxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3Qge2N2dCx0bn0gPSBjdG4odGhpcyk7XG4gKiBgYGBcbiAqIEBwYXJhbSBjb21wb25lbnQgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN0bjxUIGV4dGVuZHMgVGhpcz4oY29tcG9uZW50OkNvRWxlbWVudCkgOiB7Y3Z0OkNvbnZlcnRlcjxUPix0bjpUYXJnZXROb2RlfSB7XG4gICAgcmV0dXJuIHtjdnQ6KGNvbXBvbmVudC5nZXRDdnQoKSBhcyBDb252ZXJ0ZXI8VD4pLHRuOmNvbXBvbmVudC5nZXRUTigpfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RhcmdldE5vZGUocG90OmFueSkgOiBwb3QgaXMgVGFyZ2V0Tm9kZSB7XG4gICAgcmV0dXJuIHBvdCAmJiB0eXBlb2YgcG90ID09ICdvYmplY3QnICYmICdzb3VyY2VDaGlsZE5vZGVzJyBpbiBwb3Q7XG59XG4iLCJpbXBvcnQgeyBBc3NldEZhY3RvcnksIEFzc2V0SUQgfSBmcm9tIFwiLi9Bc3NldFwiO1xuaW1wb3J0IHsgQWpheENhY2hlIH0gZnJvbSBcIi4vQWpheFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlIH0gZnJvbSBcIi4vVGFyZ2V0Tm9kZVwiO1xuaW1wb3J0IHsgR2V0IH0gZnJvbSBcIi4vR2V0XCI7XG5cbi8qKlxuICogVGhlIENvbWwgQVBJIHVzZWQgZm9yIHdyaXRpbmcgQ09NTCBjb21wb25lbnRzLCBUZW1wbGF0ZXMgYW5kIGFwcHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbCB7XG5cbiAgICAvKipcbiAgICAgKiBJbnZhbGlkYXRlIGEgY29tcG9uZW50LCBjYXVzaW5nIGl0IHRvIGJlIHJlcGFpbnRlZC4gVGhlIHJlcGFpbnQgaXMgYXN5bmNyb25vdXMgYW5kIGRvZXMgbm90IGhhcHBlbiBkdXJpbmcgdGhlIGludmFsaWRhdGUgaW52b2NhdGlvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JPck5vZGUgVGhlIHNvdXJjZSBvciB0YXJnZXQgbm9kZSAoZWxlbWVudCkgLCBxdWVyeVNlbGVjdG9yIG9yIFRhcmdldE5vZGUgdG8gaW52YWxpZGF0ZVxuXHQgKiBAcGFyYW0gZm9yZ2V0IElmIHRydWUsIHRoZSBDb0VsZW1lbnQgaXMgYXNrZWQgdG8gYGZvcmdldCgpYCBzdGF0ZS5cbiAgICAgKi9cbiAgICBpbnZhbGlkYXRlKHNlbGVjdG9yT3JOb2RlOiBOb2RlIHwgc3RyaW5nIHwgVGFyZ2V0Tm9kZSxmb3JnZXQ/OmJvb2xlYW4pO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgQ29tcG9uZW50IGlmIHRoZSBjb21wb25lbnQgaGFzIGN1cnJlbnRseSBiZWVuIGluc3RhbnRpYXRlZCBmb3IgdGhpcyBzZWxlY3RvciBvciBub2RlXG5cdCAqIFxuXHQgKiBpZiBhIGdldGZ1bmMgaXMgcHJvdmlkZWQsIHRoaXMgaXMgY2FsbGVkIGV4YWN0bHkgb25jZSAtIGVpdGhlciBpbW1lZGlhdGVseSBpZiB0aGUgY29lbGVtZW50IGlzIGF2YWlsYWJsZVxuXHQgKiBvciBsYXRlciB3aGVuIGl0IGlzIGluc3RhbnRpYXRlZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JPck5vZGUgXG5cdCAqIEBwYXJhbSBnZXRmdW5jIGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgbm93IG9yIGxhdGVyIGV4YWN0bHkgb25jZSB3aXRoIHRoZSBDb0VsZW1lbnQgb2YgdGhpcyBub2RlIHN1cHBsaWVkLlxuICAgICAqL1xuXHRnZXQ8VCBleHRlbmRzIENvRWxlbWVudD4oc2VsZWN0b3JPck5vZGU6IE5vZGUgfCBzdHJpbmcsZ2V0ZnVuYz86R2V0PFQ+KTogVDtcblxuXHQvKipcblx0XHQqIFJldHVybnMgdGhlIGdlbmVyYXRlZCB0YXJnZXQgbm9kZSAodG5vZGUpIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyLiBPcHRpb25hbGx5IGxldHMgdGhlIGNhbGxlciBzcGVjaWZ5IGEgJ3N0YXRlIGNoYW5nZXInXG5cdFx0KiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHRvIGVmZmVjdCBjaGFuZ2VzIG9mIHN0YXRlIHRvIHRoZSB0bm9kZS4gVGhlIHN0YXRlIGNoYW5nZXIgaXMgc3RvcmVkIHNvIHRoYXRcblx0XHQqIHRoZSBjaGFuZ2VzIGFyZSByZWNyZWF0ZWQgb24gZXZlcnkgcmVwYWludCBvZiB0aGUgdG5vZGUuXG5cdFx0KiAgXG5cdFx0KiBAcGFyYW0gc2VsZWN0b3JPck5vZGUgYW4gc25vZGUsIFRhcmdldE5vZGUgb3Igc291cmNlIGRvY3VtZW50IHNlbGVjdG9yLlxuXHRcdCogQHBhcmFtIGNoYW5nZWlkIChPcHRpb25hbCBidXQgcmVxdWlyZWQgaWYgY2hhbmdlciBpcyBzcGVjaWZpZWQpIGEgdW5pcXVlIGlkIG9mIHRoZSBjaGFuZ2UgKElmIHRoZSBjaGFuZ2UgaXMgcmVhZGRlZCB3aXRoIHRoZSBzYW1lIGlkLCBpdCB3aWxsIHJlcGxhY2UgdGhlIGVhcmxpZXIgY2hhbmdlKVxuXHRcdCogQHBhcmFtIGNoYW5nZXIgKE9wdGlvbmFsKSBUaGUgY2FsbGJhY2sgdG8gZWZmZWN0IGNoYW5nZXMsIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgdG5vZGUgaXMgYXZhaWxhYmxlLiBJZiBjdXJyZW50bHkgYXZhaWxhYmxlLCB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkuIFRoZSBjYWxsYmFjayB3aWxsIGFsc28gYmUgY2FsbGVkIG9uIGFueSBzdWJzZXF1ZW50IHJlcGFpbnQgb2YgdGhlIHRub2RlLlxuXHRcdCovXG5cdCQoc2VsZWN0b3JPck5vZGU6IE5vZGUgfCBzdHJpbmcgfCBUYXJnZXROb2RlLCBjaGFuZ2VpZD86IHN0cmluZywgY2hhbmdlcj86IChFbGVtZW50KSA9PiBhbnkpOiBFbGVtZW50O1xuXG5cdC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzb3VyY2Ugbm9kZSwgYWZ0ZXIgZXZhbHVhdGluZyBhbnkgJHt9IGV4cHJlc3Npb25zLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhdHRyIFRoZSBhdHRyaWJ1dGUgZnJvbSB0aGUgQ29tcG9uZW50IHRvIHJldHVyblxuICAgICAqIEBwYXJhbSBkZWZ2YWx1ZSAoT3B0aW9uYWwpIFRoZSBkZWZhdWx0IHZhbHVlIHRvIHVzZSBpZiB0aGUgYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LlxuICAgICAqL1xuICAgIGF0dHI8VCBleHRlbmRzIChudW1iZXJ8c3RyaW5nfGJvb2xlYW4pPXN0cmluZz4oYXR0cjpzdHJpbmcsZGVmdmFsdWU/OlQpIDogVDtcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdGV4dCBjb250ZW50IG9mIHRoaXMgRWxlbWVudCwgYWZ0ZXIgZXZhbHVhdGluZyBhbnkgJHt9IGV4cHJlc3Npb25zLlxuXHQgKi9cblx0Y29udGVudCgpIDogc3RyaW5nO1xuXG5cblx0LyoqXG4gICAgICogRmluZHMgdGhlIGN1cnJlbnQgZWxlbWVudCdzIDAgYmFzZWQgaXRlcmF0aW9uIGluIGEgcGFyZW50IHdpdGggdGhlIHRhZyAncGFyZW50VGFnJy5cblx0ICogVGhlIGl0ZXJhdGlvbiBpcyBmb3VuZCBmcm9tIHRoZSBwb2ludCBhdCB3aGljaCB0aGlzIGZ1bmN0aW9uIHdhcyBjYWxsZWQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHBhcmVudFRhZyBcbiAgICAgKiBAcmV0dXJucyBpdGVyYXRpb24gbnVtYmVyO1xuICAgICAqL1xuICAgIGl0ZXIocGFyZW50VGFnOnN0cmluZykgOiBudW1iZXI7XG5cblxuXHQvKipcblx0ICogQXR0YWNoIGFuIGFzc2V0J3MgY29udHJvbCB0byB0aGUgdGFyZ2V0IG5vZGUuIFRoZSBuZXcgY29udHJvbCB3aWxsIGJlIHJlbmRlcmVkIGZyb20gdGhlIGF0dGFjaG1lbnQgcGFyZW50LlxuXHQgKiBcblx0ICogQHBhcmFtICBwYXJlbnQgVGhlIHNvdXJjZSBvciB0YXJnZXQgZG9tIG5vZGUgb3IgcXVlcnkgc2VsZWN0b3Igd2hvc2UgY2hpbGQgdGhlIG5ldyBjb250cm9sIHdpbGwgYmVjb21lLlxuXHQgKiBAcGFyYW0gIHRvQXR0YWNoIFRoZSBjb250cm9sIG9yIGFzc2V0IHRvIGF0dGFjaC5cblx0ICogQHBhcmFtICBwYXJhbWV0ZXJzIChPcHRpb25hbCksIGlmICd0b0F0dGFjaCcgd2FzIGFuIGFzc2V0LCB0aGVuIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gcGFzcyB0byB0ZSBhc3NldC4gVGhpcyBvYmplY3QgaXMgYXZhaWxhYmxlIHRvIHRoZSBhc3NldCBhcyAndGhpcy5wYXJhbWV0ZXJzJ1xuXHQgKiBcblx0ICogQHJldHVybiBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjb250cm9sIGlzIGxvYWRlZFxuXHQgKi9cblx0YXR0YWNoKHBhcmVudDogTm9kZSB8IHN0cmluZywgdG9BdHRhY2g6IENvRWxlbWVudCB8IEFzc2V0SUQgfCBzdHJpbmcsIHBhcmFtZXRlcnM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogUHJvbWlzZTxDb0VsZW1lbnQ+O1xuXG5cdC8qKlxuXHQqIERldGFjaGVzIGEgcHJldmlvdXNseSBhdHRhY2hlZCgpIGNvbnRyb2wuXG5cdCogXG5cdCogQHBhcmFtIHRvRGV0YWNoIFRoZSBjb250cm9sIHRoYXQgd2FzIGF0dGFjaGVkLCBvciB0aGUgc291cmNlIG9yIHRhcmdldCBub2RlIG9yIHF1ZXJ5IHNlbGVjdG9yIG9mIHRoZSBwYXJlbnQgZnJvbSB3aGljaCB0byBkZXRhY2ggYWxsIHByZXZpb3VzbHkgYXR0YWNoZWQgY29udHJvbHNcblx0Ki9cblx0ZGV0YWNoKHRvRGV0YWNoOiBzdHJpbmcgfCBDb0VsZW1lbnQpOiBQcm9taXNlPGFueT47XG5cbiAgICAvKipcbiAgICAgKiBJc3N1ZSBhbiBhc3luYyBjYWxsLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjYWxsTmFtZSBcbiAgICAgKiBAcGFyYW0ganNvblRvU2VuZCBcbiAgICAgKiBAcGFyYW0gY2FjaGUgXG4gICAgICogQHBhcmFtIHJlc3BvbnNlRGF0YVR5cGUgXG4gICAgICovXG5cdGFqYXgoY2FsbE5hbWU6IHN0cmluZywganNvblRvU2VuZDogYW55LCBjYWNoZT86IEFqYXhDYWNoZSwgcmVzcG9uc2VEYXRhVHlwZT86ICd4bWwnIHwgJ2pzb24nIHwgJ3NjcmlwdCcgfCAnaHRtbCcgfCAnanNvbnAnIHwgJ3RleHQnKTogUHJvbWlzZTxhbnk+O1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IEFzc2V0RmFjdG9yeS5cbiAgICAgKi9cblx0YXNzZXRzKCk6IEFzc2V0RmFjdG9yeTtcblxuXHQvKipcblx0ICogRGlzcGF0Y2ggYSBET00gc3ludGhldGljIGV2ZW50IG9uIHRoZSByb290IG5vZGUgb2YgdGhpcyBvYmplY3QuXG5cdCAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvQ3JlYXRpbmdfYW5kX3RyaWdnZXJpbmdfZXZlbnRzXG5cdCAqIFxuXHQgKiBAcGFyYW0gZXZlbnRuYW1lIFRoZSBldmVudCB0byBzZW5kLCBleGFtcGxlICdteWV2ZW50Jy4gXG5cdCAqIEBwYXJhbSBkZXRhaWwgIChPcHRpb25hbCkgdGhlIG9iamVjdCB0aGF0IHdpbGwgYmUgcmVjZWl2ZWQgYnkgYW55IGxpc3RlbmVyIGluIHRoZSBgZXZlbnQuZGV0YWlsYCBwYXJhbWV0ZXIuIFVzZSB0aGlzIHRvIHNlbmQgYW55IGluZm9ybWF0aW9uIHRvIHRoZSBsaXN0ZW5lci4gVGhlIHByb3BlcnR5IGBldmVudC5kZXRhaWwuc2VuZGVyYCBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0aGUgY2FsbGVyLlxuXHQgKi9cblx0ZGlzcGF0Y2hFdmVudChldmVudG5hbWU6IHN0cmluZywgZGV0YWlsPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgb3B0aW9ucz86IEV2ZW50SW5pdCk6IEV2ZW50O1xuXG5cdC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBhcmFtZXRlciBibG9jayBhcyBzZXQgYnkgYW55IHBhcmVudCBDb21wb25lbnQgZm9yIHRoaXMgY29tcG9uZW50XG4gICAgICovXG4gICAgcGFyYW1zKCkgOiBhbnk7XG5cbn0iLCJpbXBvcnQgeyBDb21sIH0gZnJvbSBcIi4vQ29tbFwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi9SZW5kZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUgfSBmcm9tIFwiLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4vVGhpc1wiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29FbGVtZW50PFQgZXh0ZW5kcyBUaGlzPVRoaXM+IGV4dGVuZHMgQ29tbCB7XG5cbiAgICAvKipcbiAgICAgKiBBbiBvcHRpb25hbCBtZXRob2QgLSBpZiBpbXBsZW1lbnRlZCwgd2lsbCBiYSBjYWxsZWQgd2hlbiBhbiBpbnZhbGlkYXRlIHdpdGggJ2ZvcmdldCcgaXMgY2FsbGVkIG9uIGFuIGV4aXN0aW5nIENvbXBvbmVudC5cbiAgICAgKiBUaGUgY29tcG9uZW50IHNob3VsZCBpbXBsZW1lbnQgbG9naWMgdG8gcmVzZXQgYW55IGNhY2hlZCBzdGF0ZS5cbiAgICAgKi9cbiAgICBmb3JnZXQ/KCkgOiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoaXMgY29tcG9uZW50J3MgY29udmVydGVyLlxuICAgICAqL1xuICAgIGdldEN2dCgpIDogQ29udmVydGVyPFQ+O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoaXMgY29udmVydGVyJ3MgVGFyZ2V0Tm9kZVxuICAgICAqL1xuICAgIGdldFROKCkgOiBUYXJnZXROb2RlO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgaWYgeW91IG5lZWQgdG8gYmUgY2FsbGVkIG9uIG9uQWZ0ZXJSZW5kZXJpbmcoKS4gcmVmIGlzIHRoaXMgY29udHJvbCdzIGRvbXJlZlxuICAgICAqIFxuICAgICAqIEBwYXJhbSByZWYgXG4gICAgICovXG4gICAgb25Qb3N0UmVuZGVyPyhub2RlOiBhbnkpO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgaWYgeW91IG5lZWQgdG8gYmUgY2FsbGVkIG9uIGJlZm9yZSByZW5kZXJpbmcgc3RhcnRzLiBcbiAgICAgKiBAcGFyYW0gcmVmIFxuICAgICAqL1xuICAgIG9uUHJlUmVuZGVyPygpO1xuXG5cbiAgICBvblJlbmRlcihybTogUmVuZGVyKTtcblxuICAgIGNsZWFudXA/KCk7XG5cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb0VsZW1lbnQocG90OmFueSkgOiBwb3QgaXMgQ29FbGVtZW50PGFueT4ge1xuICAgIHJldHVybiBwb3QgJiYgdHlwZW9mIHBvdCA9PSAnb2JqZWN0JyAmJiAnb25SZW5kZXInIGluIHBvdDtcbn0iLCJcbi8qKlxuICogQSBkZXBlbmRlbmN5IGlzIHNvbWV0aGluZyB0aGF0IGEgQ09FbGVtZW50IHJlbGllcyB1cG9uIGJlaW5nIHByZXNlbnQgaW4gdGhlIGN1cnJlbnQgd2luZG93J3MgZG9jdW1lbnQuXG4gKiBUaGlzIGludGVyZmFjZSBkZWZpbmVzIGFuIEFQSSB0aGF0IGNhbiBiZSB1c2VkIHRvIG1hbmFnZSBhdHRhY2htZW50IGFuZCBkZXRhY2htZW50IG9mIGRlcGVuZGVuY2llcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZXBlbmRlbmN5IHtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gaWQgdGhhdCB1bmlxdWx5IGlkZW50aWZpZXMgdGhpcyBkZXBlbmRlbmN5XG4gICAgICovXG4gICAgZ2V0SWQoKSA6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiB0aW1lcyB0aGlzIGRlcGVuZGVuY3kgaGFzIGJlZW4gYXR0YWNoZWQgdG8gdGhlIGRvY3VtZW50LlxuICAgICAqL1xuICAgIGdldFJlZkNvdW50KCkgOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIGF0dGFjaG1lbnQgb2YgdGhpcyBkZXBlbmRlbmN5IGJ5IHRoZSBpbmNyZW1lbnQgZ2l2ZW4gaW4gYGJ5YFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBieSBcbiAgICAgKi9cbiAgICB1cGRhdGVSZWZDb3VudChieTpudW1iZXIpO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIHRoaXMgZGVwZW5kZW5jeSBmcm9tIHRoZSBjdXJyZW50IHdpbmRvdydzIGRvY3VtZW50IGFuZCBzZXQgaXRzIHJlZmVyZW5jZSBjb3VudCB0byAxXG4gICAgICovXG4gICAgYXR0YWNoKCkgOiBQcm9taXNlPGFueT47XG5cbiAgICAvKipcbiAgICAgKiBkZXRhY2ggKHJlbW92ZSkgdGhpcyBkZXBlbmRlbmN5IGZyb20gdGhlIGN1cnJlbnQgd2luZG93J3MgZG9jdW1lbnQuXG4gICAgICovXG4gICAgZGV0YWNoKCk7XG59IiwiaW1wb3J0IHsgQXNzZXRJRCB9IGZyb20gXCIuL0Fzc2V0XCI7XG5pbXBvcnQgeyBEZXBlbmRlbmN5IH0gZnJvbSBcIi4vRGVwZW5kZW5jeVwiO1xuXG4vKipcbiAqIEFuIEF0dGFjaG1lbnQgaW1wbGVtZW50cyB0aGUgY29ubmVjdGlvbiBvZiBhIENPTUwgQXNzZXQgdG8gdGhlIHRkb20uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0YWNobWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2hlcyBgdG9JbnNlcnRgIChhbiBhc3NldCkgdG8gdGhlIGdpdmVuIHRkb20gZWxlbWVudC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcbiAgICAgKiBAcGFyYW0gdG9JbnNlcnQgXG4gICAgICovXG4gICAgYXR0YWNoKGVsZW1lbnQ6RWxlbWVudCx0b0luc2VydDpzdHJpbmd8QXNzZXRJRCk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2ggdGhlIHByZXZpb3VzbHkgYXR0YWNoZWQgZnJvbSB0aGUgdGRvbVxuICAgICAqL1xuICAgIGRldGFjaCgpO1xuXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgZGVwZW5kZW5jeVxuICAgICAqIFxuICAgICAqIEBwYXJhbSBkZXAgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgIGFkZERlcGVuZGVuY3koZGVwOkRlcGVuZGVuY3kpIDogUHJvbWlzZTxhbnk+O1xuXG4gICAgIHJlbW92ZURlcGVuZGVuY3koZGVwOkRlcGVuZGVuY3kpO1xufSIsImltcG9ydCB7IEltcGxlbWVudGF0aW9ucyB9IGZyb20gXCIuLi9JbXBsZW1lbnRhdGlvbnNcIjtcbmltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IFJlbmRlciB9IGZyb20gXCIuLi9SZW5kZXJcIjtcbmltcG9ydCB7IEFzc2V0LCBBc3NldElELCBpc0NvRWxlbWVudEFzc2V0LCBzdHJpbmdpZnlBc3NldElEIH0gZnJvbSBcIi4uL0Fzc2V0XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBEZXBlbmRlbmN5IH0gZnJvbSBcIi4uL0RlcGVuZGVuY3lcIjtcbmltcG9ydCB7IEF0dGFjaGFibGUsIGlzQXR0YWNoYWJsZSB9IGZyb20gXCIuLi9BdHRhY2hhYmxlXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlSW1wbCB9IGZyb20gXCIuL1RhcmdldE5vZGVJbXBsXCI7XG5pbXBvcnQgeyBQYXRjaCB9IGZyb20gXCIuLi9QYXRjaFwiO1xuaW1wb3J0IHsgQXR0YWNobWVudCB9IGZyb20gXCIuLi9BdHRhY2htZW50XCI7XG5cbi8qKlxuICogQXR0YWNoZXMgYSBDb0VsZW1lbnQgYXMgYSBjaGlsZCBvZiB0aGUgd2luZG93LmRvY3VtZW50IC0gaS5lLiB0aGUgYnJvd3Nlci12aXNpYmxlIGRvY3VtZW50LlxuICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb25cbiAqIFxuICogTWFuYWdlcyB0aGUgZGVwZW5kZW5jaWVzIHN1Y2ggYXMgc3R5bGVzIG9mIENvbWwgZG9jdW1lbnRzIGFzIHRoZXkgYXR0YWNoL2RldGFjaCB0byB0aGUgbWFpbiB3aW5kb3cuIFxuICovXG5leHBvcnQgY2xhc3MgQXR0YWNobWVudEltcGwgaW1wbGVtZW50cyBBdHRhY2htZW50IHtcbiAgICBwcm90ZWN0ZWQgZGVwZW5kZW5jaWVzOiBNYXA8c3RyaW5nLCBEZXBlbmRlbmN5PjtcbiAgICBwcm90ZWN0ZWQgY29FbGVtZW50OkNvRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgUGF0Y2ggaW1wbGVtZW50YXRpb24gdGhhdCB3aWxsIGF0dGFjaCB0aGUgdG9wIGNvbXBvbmVudCB0byB0aGUgb3V0c2lkZSBodG1sLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0bm9kZSBcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUGF0Y2godG5vZGU6Tm9kZSxlbGVtZW50OkVsZW1lbnQpIDogUGF0Y2gge1xuICAgICAgICByZXR1cm4gbmV3IFBhdGNoRXh0ZXJuYWxFbGVtZW50KHRub2RlLGVsZW1lbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBtYWtlQ29FbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQsIHRvSW5zZXJ0OiBzdHJpbmcgfCBBc3NldElEKSA6IFByb21pc2U8Q29FbGVtZW50PiB7XG5cbiAgICAgICAgbGV0IGFzc2V0PUltcGxlbWVudGF0aW9ucy5nZXRBc3NldEZhY3RvcnkoKVxuICAgICAgICAgICAgLmdldCh0b0luc2VydCk7XG5cbiAgICAgICAgaWYgKCFhc3NldClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgZmluZCBhbiBhc3NldCBmb3IgJHtzdHJpbmdpZnlBc3NldElEKHRvSW5zZXJ0KX1gKTtcblxuICAgICAgICBpZiAoaXNDb0VsZW1lbnRBc3NldChhc3NldCkpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIENoaWxkTm9kZSB0aGF0IHdpbGwgcmVhdHRhY2ggYXQgdGhlIHNvbGUgcG9zaXRpb24gaW4gdGhlIGF0dGFjaG1lbnQgZWxlbWVudDpcbiAgICAgICAgICAgIGxldCB0aGF0PXRoaXM7XG4gICAgICAgICAgICBsZXQgdG4gPSBuZXcgKGNsYXNzIGV4dGVuZHMgVGFyZ2V0Tm9kZUltcGwge1xuICAgICAgICAgICAgICAgIHB1YmxpYyBnZXRQYXRjaCgpIDogUGF0Y2gge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5jcmVhdGVQYXRjaCh0aGlzLnRub2RlLGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKG51bGwpO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGFzc2V0XG4gICAgICAgICAgICAgICAgLmFzQ29FbGVtZW50KHRuKSAgICAgICAgXG4gICAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2V0ICR7c3RyaW5naWZ5QXNzZXRJRCh0b0luc2VydCl9IGlzIG5vdCBhIENvRWxlbWVudEFzc2V0YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXR0YWNoKGVsZW1lbnQ6IEVsZW1lbnQsIHRvSW5zZXJ0OiBzdHJpbmcgfCBBc3NldElEKSB7XG5cbiAgICAgICAgdGhpcy5tYWtlQ29FbGVtZW50KGVsZW1lbnQsdG9JbnNlcnQpXG4gICAgICAgIC50aGVuKChjb0VsZW1lbnQpPT57XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUF0dGFjaChjb0VsZW1lbnQpO1xuXG4gICAgICAgICAgICAvL3RoaXMucmVuZGVyRnJvbVRvcChjdnQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgY29FbGVtZW50LmdldEN2dCgpLmludmFsaWRhdGUoY29FbGVtZW50LmdldFROKCkpO1xuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUF0dGFjaChjb0VsZW1lbnQ6Q29FbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY29FbGVtZW50PWNvRWxlbWVudDtcbiAgICAgICAgbGV0IGN2dCA9IGNvRWxlbWVudC5nZXRDdnQoKTtcbiAgICAgICAgaWYgKGlzQXR0YWNoYWJsZShjdnQpKSB7XG4gICAgICAgICAgICBjdnQuc2V0QXR0YWNobWVudCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkZXRhY2goKSB7XG4gICAgICAgIGlmICh0aGlzLmNvRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGN2dCA9IHRoaXMuY29FbGVtZW50LmdldEN2dCgpO1xuICAgICAgICAgICAgaWYgKGlzQXR0YWNoYWJsZShjdnQpKSB7XG4gICAgICAgICAgICAgICAgY3Z0LnNldEF0dGFjaG1lbnQobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgZGVwZW5kZW5jeVxuICAgICAqIFxuICAgICAqIEBwYXJhbSBkZXAgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIGFkZERlcGVuZGVuY3koZGVwOiBEZXBlbmRlbmN5KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKCF0aGlzLmRlcGVuZGVuY2llcylcbiAgICAgICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gbmV3IE1hcCgpO1xuICAgICAgICBsZXQgYWxyZWFkeSA9IHRoaXMuZGVwZW5kZW5jaWVzLmdldChkZXAuZ2V0SWQoKSk7XG4gICAgICAgIGlmIChhbHJlYWR5KSB7XG4gICAgICAgICAgICBhbHJlYWR5LnVwZGF0ZVJlZkNvdW50KDEpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMuc2V0KGRlcC5nZXRJZCgpLCBkZXApO1xuICAgICAgICAgICAgcmV0dXJuIGRlcC5hdHRhY2goKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVEZXBlbmRlbmN5KGRlcDogRGVwZW5kZW5jeSkge1xuICAgICAgICBsZXQgYWxyZWFkeSA9IHRoaXMuZGVwZW5kZW5jaWVzLmdldChkZXAuZ2V0SWQoKSk7XG4gICAgICAgIGlmIChhbHJlYWR5KSB7XG4gICAgICAgICAgICBpZiAoYWxyZWFkeS5nZXRSZWZDb3VudCgpID4gMSkge1xuICAgICAgICAgICAgICAgIGFscmVhZHkudXBkYXRlUmVmQ291bnQoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMuZGVsZXRlKGRlcC5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVwLmRldGFjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59XG5cbi8qKlxuICogUmVtZW1iZXJzIGFuZCByZXN0b3JlcyB0aGUgQXR0YWNobWVudCBvZiB0aGUgQ09NTCBkb2N1bWVudCBpbiB0aGUgZXh0ZXJuYWwgZWxlbWVudCBcbiAqL1xuY2xhc3MgUGF0Y2hFeHRlcm5hbEVsZW1lbnQgaW1wbGVtZW50cyBQYXRjaCB7XG4gICAgcHJvdGVjdGVkIGluZGV4Om51bWJlcj0tMTtcbiAgICBwcm90ZWN0ZWQgdG5vZGU6Tm9kZTtcbiAgICBwcm90ZWN0ZWQgYXR0YWNoZWRUb0VsZW1lbnQ6RWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKHRub2RlOk5vZGUsYXR0YWNoZWRUb0VsZW1lbnQ6RWxlbWVudCkge1xuICAgICAgICB0aGlzLnRub2RlPXRub2RlO1xuICAgICAgICB0aGlzLmF0dGFjaGVkVG9FbGVtZW50PWF0dGFjaGVkVG9FbGVtZW50O1xuICAgICAgICBpZiAodGhpcy50bm9kZSkge1xuICAgICAgICAgICAgdGhpcy5pbmRleD1BcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGF0dGFjaGVkVG9FbGVtZW50LmNoaWxkTm9kZXMsIHRoaXMudG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzdG9yZVBvc2l0aW9uKGVsZW06IEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMudG5vZGUgJiYgdGhpcy5pbmRleD49MClcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoZWRUb0VsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy50bm9kZSlcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaGVkVG9FbGVtZW50LmlubmVySFRNTD0nJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXR0YWNoZWRUb0VsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfVxufSIsImltcG9ydCB7IEF0dGFjaG1lbnRJbXBsIH0gZnJvbSBcIi4vaW1wbC9BdHRhY2htZW50SW1wbFwiO1xuXG5cbi8qKlxuICogQSBoZWlyYXJjaHkgb2Ygb2JqZWN0cyB0aGF0IG5lZWQgdG8ga25vdyB3aGVuIHRoZXkgYXR0YWNoIG9yIGRldGFjaFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dGFjaGFibGUge1xuICAgIC8qKlxuICAgICAqIFNldCB0aGUgYXR0YWNobWVudCBvbiB0aGlzIGNvbnZlcnRyIC0gd2hlbiBpdCBpcyBhdHRhY2hlZCB0byBhIG5vZGUgb24gdGhlIHdpbmRvdy5kb2N1bWVudFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhdHRhY2htZW50IFxuICAgICAqL1xuICAgIHNldEF0dGFjaG1lbnQoYXR0YWNobWVudDpBdHRhY2htZW50SW1wbCkgO1xuXG4gICAgXG4gICAgYWRkQ2hpbGQoY2hpbGQ6QXR0YWNoYWJsZSk7XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZDpBdHRhY2hhYmxlKTtcblxuICAgIHNldFBhcmVudChwYXJlbnQ6QXR0YWNoYWJsZSk7XG5cbiAgICBnZXRQYXJlbnQocGFyZW50OkF0dGFjaGFibGUpIDogQXR0YWNoYWJsZTtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBdHRhY2hhYmxlKG9iajogYW55KTogb2JqIGlzIEF0dGFjaGFibGUge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmICdzZXRBdHRhY2htZW50JyBpbiBvYmo7XG59IiwiaW1wb3J0IHsgQXNzZXRJRCwgaXNUZXh0QXNzZXQgfSBmcm9tIFwiLi4vQXNzZXRcIjtcbmltcG9ydCB7IERlcGVuZGVuY3kgfSBmcm9tIFwiLi4vRGVwZW5kZW5jeVwiO1xuaW1wb3J0IHsgSW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uL0ltcGxlbWVudGF0aW9uc1wiO1xuXG4vKipcbiAqIEEgU3R5bGUgaXMgYSBEZXBlbmRlbmN5IHRoYXQgaGFuZGxlcyA8c3R5bGU+IGFuZCA8bGluayByZWw9XCJzdHlsZXNoZWV0XCI+IGVsZW1lbnRzIFxuICogaW4gYSBkb2N1bWVudC4gXG4gKiBcbiAqIFdoZW4gYW55IENPTUwgZG9jdW1lbnQgYXR0YWhlcyAvIGRldGFjaGVzIHRvIHRoZSBtYWluIFNQQSBwYWdlcywgaXRzIFN0eWxlIG9iamVjdHMgXG4gKiBtYW5hZ2UgdGhlIHJlZmVyZW5jZSBjb3VudGVkIHN0eWxlIGFkZGl0aW9uIGFuZCByZW1vdmFsXG4gKi9cbmV4cG9ydCBjbGFzcyBTdHlsZSBpbXBsZW1lbnRzIERlcGVuZGVuY3kge1xuXG4gICAgcHJvdGVjdGVkIHNyY0RvYzpEb2N1bWVudDtcblx0cHJvdGVjdGVkIG93bmVySUQ6QXNzZXRJRDtcblx0cHJvdGVjdGVkIHRhcmdldEVsZW1lbnQ6RWxlbWVudDtcblx0cHJvdGVjdGVkIGNzc2lkczpzdHJpbmdbXT1bXTtcblx0cHJvdGVjdGVkIGlkc0J1aWx0OmJvb2xlYW49ZmFsc2U7XG5cbiAgIFxuXHQvKipcblx0ICogQ3JlYXRlIGEgU3R5bGUgb2JqZWN0LlxuXHQgKiBcblx0ICogQHBhcmFtIHNyY0RvYyA6IFRoZSBkb2N1bWVudCBmcm9tIHdob3NlIDxoZWFkPiB0aGUgc3R5bGVzIGFyZSBsb2FkZWQuXG5cdCAqIEBwYXJhbSBvd25lcklEIDogQSBpZCBvZiB0aGUgb3duZXIgKHRoZSBhc3NldCB0aGF0IGNvbnRhaW5zIHRoaXMgc3R5bGUpXG5cdCAqL1xuICAgICBjb25zdHJ1Y3RvcihzcmNEb2M6RG9jdW1lbnQsb3duZXJJRDpBc3NldElEKSB7XG5cdFx0dGhpcy5zcmNEb2M9c3JjRG9jO1xuXHRcdHRoaXMub3duZXJJRD1vd25lcklEO1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJyk7XG5cdH1cblxuXG5cdFxuXHRwcm90ZWN0ZWQgZ2VuZXJhdGVJZChpbmRleDpudW1iZXIpIDogc3RyaW5nIHtcblx0XHRsZXQgbmFtZT10aGlzLm93bmVySUQubmFtZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblx0XHRpZiAodGhpcy5vd25lcklELnR5cGUpIHtcblx0XHRcdG5hbWUrPSdUJztcblx0XHRcdG5hbWUrPXRoaXMub3duZXJJRC50eXBlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBgJHtuYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCBcIl9cIil9LSR7aW5kZXh9YDtcblx0fVxuXG5cdFxuXG5cdHByb3RlY3RlZCBnZXRTdHlsZXMoKSA6IChIVE1MU3R5bGVFbGVtZW50fEhUTUxMaW5rRWxlbWVudClbXSB7XG5cdFx0bGV0IGFsbD1bXTtcblxuXG5cdFx0bGV0IGZvdW5kPXRoaXMuc3JjRG9jLmhlYWQuY2hpbGRyZW47XG5cdFx0Zm9yKGxldCBpPTA7aTxmb3VuZC5sZW5ndGg7aSsrKSB7XG5cdFx0XHRsZXQgZT1mb3VuZFtpXTtcblx0XHRcdGxldCB0YWc9ZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRcdGlmICh0YWc9PSdzdHlsZSd8fCh0YWc9PSdsaW5rJyAmJiAoIWUuZ2V0QXR0cmlidXRlKCdyZWwnKSB8fCBlLmdldEF0dHJpYnV0ZSgncmVsJyk9PSdzdHlsZXNoZWV0JykpKVxuXHRcdFx0XHRhbGwucHVzaChlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFsbDtcblx0fVxuXG5cblx0cHJvdGVjdGVkIGJ1aWxkSURzKGZvcklkPzooc3R5bGU6SFRNTFN0eWxlRWxlbWVudHxIVE1MTGlua0VsZW1lbnQsaWQ6c3RyaW5nKT0+YW55KSB7XG5cdFx0dGhpcy5pZHNCdWlsdD10cnVlO1xuXHRcdGxldCBzdHlsZXM9dGhpcy5nZXRTdHlsZXMoKTtcblxuXHRcdGZvcihsZXQgaT0wO2k8c3R5bGVzLmxlbmd0aDtpKyspIHtcblx0XHRcdGxldCBzdHlsZT1zdHlsZXNbaV07XG5cdFx0XHRsZXQgaWQ9c3R5bGUuZ2V0QXR0cmlidXRlKCdpZCcpO1xuXHRcdFx0aWYgKCFpZCkge1xuXHRcdFx0XHRpZD10aGlzLmdlbmVyYXRlSWQoaSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuY3NzaWRzLnB1c2goaWQpOyBcblx0XHRcdGlmIChmb3JJZClcblx0XHRcdCAgIGZvcklkKHN0eWxlLGlkKTtcblx0XHR9XG5cblx0XHRcblx0fVxuXG5cdC8qKlxuICAgICAqIEluc2VydHMgdGhlIDxzdHlsZT4gZWxlbWVudCBpbiBgaW5zdHlsZWAgaW50byB0aGUgdGFyZ2V0RWxlbWVudFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbnN0eWxlIFxuICAgICAqIEBwYXJhbSBkb250V2FpdEZvckxpbmtMb2FkIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuXHQgcHJvdGVjdGVkIGxvYWRJbmxpbmVTdHlsZShpbnN0eWxlOkhUTUxTdHlsZUVsZW1lbnQsaWQ6c3RyaW5nLGNsb25lOmJvb2xlYW49dHJ1ZSxkb250V2FpdEZvckxpbmtMb2FkOmJvb2xlYW49ZmFsc2UpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3R5bGUgPSAoY2xvbmUpID8gaW5zdHlsZS5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTFN0eWxlRWxlbWVudDppbnN0eWxlO1xuXHRcdFx0c3R5bGUuc2V0QXR0cmlidXRlKCdpZCcsaWQpO1xuXHRcdFx0c3R5bGUuc2V0QXR0cmlidXRlKCdkYXRhLXJlZmNvdW50JywnMScpO1xuICAgICAgICAgICAgaWYoICFkb250V2FpdEZvckxpbmtMb2FkICl7XG4gICAgICAgICAgICAgICAgc3R5bGUub25sb2FkID0gZnVuY3Rpb24oKSB7IFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7IFxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdHlsZSBoYXMgbG9hZGVkIC0gaWQ9JytpZCk7IFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuXHRcdFx0XG4gICAgICAgICAgICB0aGlzLnRhcmdldEVsZW1lbnQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXHRcdFx0aWYgKGRvbnRXYWl0Rm9yTGlua0xvYWQpXG4gICAgICAgICAgICBcdHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cblx0LyoqXG4gICAgICogTG9hZHMgYSBjc3MgbGluayBieSB1c2luZyBHZXRQdWJsaWNGaWxlIHRvIGxvYWQgIHRoZSBsaW5rLCBhdHRhY2hlZCBpdCB0byB0aGUgPHN0eWxlcz4gZWxlbWVudHMgb2YgdGhlIFNQQVxuICAgICAqIGFuZCByZXR1cm5zIHRoZSBwcm9taXNlIHRoYXQgb24gcmVvbHV0aW9uIHdpbGwgaW5kaWNhdGUgdGhhdCB0aGUgY3NzIGhhcyBsb2FkZWQuXG4gICAgICogXG4gICAgICogQHBhcmFtIGxpbmsgXG4gICAgICogQHBhcmFtIGlkIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuXHQgcHJvdGVjdGVkIGxvYWRDU1NMaW5rKGVsZW06SFRNTExpbmtFbGVtZW50LGlkOnN0cmluZykgOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRsZXQgaHJlZj1lbGVtLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXHRcdGlmICghaHJlZikge1xuXHRcdFx0Y29uc29sZS53YXJuKGBTdHlsZSAtIG5vICdocmVmJyBpbiA8bGluaz4gZWxlbWVudGApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBhc3NldD1JbXBsZW1lbnRhdGlvbnNcblx0XHQuZ2V0QXNzZXRGYWN0b3J5KClcblx0XHQuZ2V0KGhyZWYpO1xuXG5cdFx0aWYgKCFpc1RleHRBc3NldChhc3NldCkpXHR7XG5cdFx0XHRjb25zb2xlLndhcm4oYFN0eWxlIC0gJ2hyZWYnICR7aHJlZn0gaXMgbm90IGEgdGV4dCBhc3NldGApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHJldHVybihcblx0XHRcdGFzc2V0LmdldFRleHQoKVxuXHRcdFx0LnRoZW4oKGNzc3RleHQpPT57XG5cdFx0XHRcdGxldCBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdFx0XHRjc3Muc2V0QXR0cmlidXRlKCd0eXBlJywndGV4dC9jc3MnKTtcblx0XHRcdFx0Y3NzLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzc3RleHQpKTsgICAgXG5cdFx0XHRcdHJldHVybiB0aGlzLmxvYWRJbmxpbmVTdHlsZShjc3MsaWQsZmFsc2UpOyAgICAgICAgICAgIFxuXHRcdFx0fSlcblx0XHQpO1xuICAgIH1cblxuXHRwcm90ZWN0ZWQgbG9hZFN0eWxlKGVsZW06SFRNTFN0eWxlRWxlbWVudHxIVE1MTGlua0VsZW1lbnQsaWQ6c3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKT09J3N0eWxlJylcblx0XHRcdHJldHVybiB0aGlzLmxvYWRJbmxpbmVTdHlsZShlbGVtLGlkKTtcblx0XHRlbHNlIFxuXHRcdFx0cmV0dXJuIHRoaXMubG9hZENTU0xpbmsoZWxlbSBhcyBIVE1MTGlua0VsZW1lbnQsaWQpO1xuXHR9IFxuXG5cdC8qKlxuXHQgKiBDb3BpZXMgYWxsIDxzdHlsZT4gYW5kIDxsaW5rIHR5cGU9XCJzdHlsZXNoZWV0XCI+IGVsZW1lbnRzIGZyb20gdGhlIHNyYyBET00gdG8gdGhlIHRhcmdldCBlbGVtZW50LlxuXHQgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYWxsIHN0eWxlcyBhcmUgbG9hZGVkLlxuXHQgKi9cblx0cHJvdGVjdGVkIGNvcHlTdHlsZXNUb1RhcmdldCgpIDogUHJvbWlzZTxhbnk+IHtcblx0XHRsZXQgYWxsOlByb21pc2U8YW55PltdPVtdO1xuXHRcdHRoaXMuYnVpbGRJRHMoKHN0eWxlLGlkKT0+e1xuXHRcdFx0bGV0IHByb209dGhpcy5sb2FkU3R5bGUoc3R5bGUsaWQpO1xuXHRcdFx0aWYgKHByb20pXG5cdFx0XHRcdGFsbC5wdXNoKHByb20pO1xuXHRcdH0pXG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYWxsKTtcblx0fVxuXG5cdHByb3RlY3RlZCBjaGVja0lkcygpIHtcblx0XHRpZiAoIXRoaXMuaWRzQnVpbHQpXG5cdFx0XHR0aGlzLmJ1aWxkSURzKCk7XG5cdH1cblxuXHRcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gRGVwZW5kZW5jeVxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGdldElkKCk6IHN0cmluZyB7XG5cdFx0dGhpcy5jaGVja0lkcygpO1xuXHRcdGlmICh0aGlzLmNzc2lkcy5sZW5ndGg+MClcblx0XHRcdHJldHVybiB0aGlzLmNzc2lkc1swXTtcblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZUlkKDApO1xuICAgIH1cblxuICAgIGdldFJlZkNvdW50KCk6IG51bWJlciB7XG5cdFx0dGhpcy5jaGVja0lkcygpO1xuICAgICAgICBpZiAodGhpcy5jc3NpZHMubGVuZ3RoPjApIHtcbiAgICAgICAgICAgIGxldCBzdD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZSMke3RoaXMuY3NzaWRzWzBdfWApO1xuICAgICAgICAgICAgaWYgKHN0KSBcbiAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KHN0LmdldEF0dHJpYnV0ZSgnZGF0YS1yZWZjb3VudCcpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlUmVmQ291bnQoaW5jcmVtZW50OiBudW1iZXIpIHtcblx0XHR0aGlzLmNoZWNrSWRzKCk7XG4gICAgICAgIHRoaXMuY3NzaWRzLmZvckVhY2goKGlkKT0+e1xuICAgICAgICAgICAgbGV0IHN0PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlIyR7aWR9YCk7XG4gICAgICAgICAgICBpZiAoc3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgY250PU51bWJlci5wYXJzZUludChzdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVmY291bnQnKSk7XG4gICAgICAgICAgICAgICAgc3Quc2V0QXR0cmlidXRlKCdkYXRhLXJlZmNvdW50JywoY250K2luY3JlbWVudCkudG9GaXhlZCgwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgYXR0YWNoKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTdHlsZXNUb1RhcmdldCgpO1xuICAgIH1cbiAgICBcbiAgICBkZXRhY2goKSB7XG5cdFx0dGhpcy5jaGVja0lkcygpO1xuICAgICAgICB0aGlzLmNzc2lkcy5mb3JFYWNoKChpZCk9PntcbiAgICAgICAgICAgIGxldCBzdD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZSMke2lkfWApO1xuICAgICAgICAgICAgaWYgKHN0KSB7XG4gICAgICAgICAgICAgICAgc3QucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbn0iLCJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi9UaGlzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGl6YWJsZSB7XG4gICAgLyoqXG4gICAgICogVGVtbGF0ZSB0aGUgZG9jdW1lbnQsIHVzaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgbm9kZSAncmVwbGFjZWQnXG4gICAgICogQHBhcmFtIHJlcGxhY2VkIFxuICAgICAqL1xuICAgIHRlbXBsYXRpemUoY2FsbGVyOkNvbnZlcnRlcjxUaGlzPixyZXBsYWNlZDpOb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVGVtcGxhdGl6YWJsZShvYmo6IGFueSk6IG9iaiBpcyBUZW1wbGF0aXphYmxlIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiAndGVtcGxhdGl6ZScgaW4gb2JqO1xufSIsImltcG9ydCB7IEFzc2V0SUQsIGlzQ29FbGVtZW50QXNzZXQgfSBmcm9tIFwiLi4vQXNzZXRcIjtcbmltcG9ydCB7IEF0dGFjaGFibGUsIGlzQXR0YWNoYWJsZSB9IGZyb20gXCIuLi9BdHRhY2hhYmxlXCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBDb0VsZW1lbnRGYWN0b3J5IH0gZnJvbSBcIi4uL0NvRWxlbWVudEZhY3RvcnlcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IEltcGxlbWVudGF0aW9ucyB9IGZyb20gXCIuLi9JbXBsZW1lbnRhdGlvbnNcIjtcbmltcG9ydCB7IFJlbmRlciB9IGZyb20gXCIuLi9SZW5kZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGVJbXBsIH0gZnJvbSBcIi4vVGFyZ2V0Tm9kZUltcGxcIjtcbmltcG9ydCB7IGlzVGVtcGxhdGl6YWJsZSB9IGZyb20gXCIuLi9UZW1wbGF0aXphYmxlXCI7XG5pbXBvcnQgeyBnZXRBdHRyIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuXG4vKipcbiAqIEEgQ29FbGVtZW50RmFjdG9yeSB0aGF0IHVzZXMgYSBDT01MIHBhZ2UgdG8gYnVpbGQgYSBDb0VsZW1lbnRcbiAqL1xuZXhwb3J0IGNsYXNzIEFzc2V0Q29FbGVtZW50RmFjdG9yeSBpbXBsZW1lbnRzIENvRWxlbWVudEZhY3Rvcnkge1xuICAgIHByb3RlY3RlZCBhc3NldElkOkFzc2V0SUQ7XG4gICAgcHJvdGVjdGVkIHRhZzpzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihhc3NldElkOkFzc2V0SUQsdGFnOnN0cmluZykge1xuICAgICAgICB0aGlzLmFzc2V0SWQ9YXNzZXRJZDtcbiAgICAgICAgdGhpcy50YWc9dGFnO1xuICAgIH1cblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGVJbXBsLCBjdnQ6IENvbnZlcnRlcjxUaGlzPik6IFByb21pc2U8Q29FbGVtZW50PiB7XG5cbiAgICAgICAgbGV0IGFzc2V0PUltcGxlbWVudGF0aW9ucy5nZXRBc3NldEZhY3RvcnkoKS5nZXQodGhpcy5hc3NldElkKTtcblxuICAgICAgICBpZiAoIWlzQ29FbGVtZW50QXNzZXQoYXNzZXQpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbXBvcnQgJHt0aGlzLmFzc2V0SWR9IGlzIG5vdCBhIENvRWxlbWVudEFzc2V0YCk7XG5cbiAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgYXNzZXQuYXNDb0VsZW1lbnQodW5kZWZpbmVkLHVuZGVmaW5lZCwoYXR0cmliOnN0cmluZyk9PntcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0QXR0cjxzdHJpbmc+KGN2dCx0bi5zbm9kZSxhdHRyaWIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChjbyk9PntcbiAgICAgICAgICAgICAgICBsZXQgY3Z0Q2hpbGQ9Y28uZ2V0Q3Z0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXR0YWNoYWJsZShjdnQpICYmIGlzQXR0YWNoYWJsZShjdnRDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3Z0LmFkZENoaWxkKGN2dENoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGlzVGVtcGxhdGl6YWJsZShjbykpXG4gICAgICAgICAgICAgICAgICAgIGNvLnRlbXBsYXRpemUoY3Z0LHRuLnNub2RlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY287XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgXG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGYWN0b3J5KGN2dDogQ29udmVydGVyPFRoaXM+KSB7XG4gICAgICAgIGN2dC5yZWdpc3RlckZhY3RvcnkodGhpcy50YWcsdGhpcyk7ICAgIFxuICAgIH1cblxufSIsImltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUgfSBmcm9tIFwiLi4vVGFyZ2V0Tm9kZVwiO1xuaW1wb3J0IHsgVGhpcyB9IGZyb20gXCIuLi9UaGlzXCI7XG5cbi8qKlxuICogSW5zdGFsbHMgRE9NIGV2ZW50IGhhbmRsZXJzIG9uIGEgdGFyZ2V0IG5vZGUgZnJvbSB0aGUgYXR0cmlidXRlcyBvZiBhIHNvdXJjZSBub2RlLlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVycyB7XG4gICAgcHJvdGVjdGVkIHRub2RlOkVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIHRuOlRhcmdldE5vZGU7XG5cbiAgICBjb25zdHJ1Y3Rvcih0bm9kZTpFbGVtZW50LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICAgdGhpcy50bm9kZT10bm9kZTtcbiAgICAgICAgdGhpcy50bj10bjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpZiAnYXR0cicgaXMgYW4gYXR0cmlidXRlIG5hbWUgdGhhdCBmb2xsb3dzIHRoZSBuYW1pbmcgY29udmVudGlvbiBvZiBhbiBldmVudCBoYW5kbGVyLCByZXR1cm5zIHRoZSBldmVudCBuYW1lLCBlbHNlIG5vdGhpbmdcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXR0ciBcbiAgICAgKlxuICAgICovXG4gICAgc3RhdGljIGlzRXZlbnRBdHRyKGF0dHI6IHN0cmluZykge1xuICAgICAgICBpZiAoYXR0ci5zdGFydHNXaXRoKCdvbicpKVxuICAgICAgICAgICAgcmV0dXJuIGF0dHIuc3Vic3RyaW5nKDIpO1xuICAgICAgICBpZiAoYXR0ci5zdGFydHNXaXRoKCdjby1vbicpKVxuICAgICAgICAgICAgcmV0dXJuIGF0dHIuc3Vic3RyaW5nKDUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gZXZlbnQgaGFuZGxlciBhcyBpbnN0YWxsZWQgb24gYW4gZWxlbWVudHMgJ29uPGV2ZW50PicgYXR0cmlidXRlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzY3JpcHQgVGhlIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUgKHNjcmlwdCB0ZXh0LCBlLmcuICd0aGlzLm9uY2xpY2soZXZlbnQpJylcbiAgICAgKiBAcGFyYW0gY3Z0IFRoZSBjb252ZXJ0ZXIgdG8gdXNlIGZvciBzdHJpbmcgZXhwYW5zaW9uLCBhbmQgd2hvc2UgVGhpcyB3aWxsIGJlIGJvdW5kIHRvIHRoZSBoYW5kbGVyLlxuICAgICAqIEByZXR1cm5zIEEgZnVuY3RhaW9uXG4gICAgICovXG4gICAgcHVibGljIG1ha2VFdmVudEhhbmRsZXIoc2NyaXB0OnN0cmluZyxjdnQ6IENvbnZlcnRlcjxUaGlzPikgOiAoZXZlbnQ6RXZlbnQpPT5hbnkge1xuICAgICAgICBsZXQgc2NyaXB0Ym9keT1jdnQuZXhwYW5kU3RyaW5nKHNjcmlwdCx0aGlzLnRuKTtcbiAgICAgICAgaWYgKHNjcmlwdGJvZHkpXG4gICAgICAgICAgICByZXR1cm4gKG5ldyBGdW5jdGlvbignZXZlbnQnLHNjcmlwdGJvZHkpKS5iaW5kKGN2dC5nZXRUaGlzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc3RhbGxzIGFsbCBldmVudCBoYW5kbGVycyBkZWNsYXJlZCBvbiBzbm9kZSBvbnRvIHRub2RlXG4gICAgICogXG4gICAgICogQHBhcmFtIHNub2RlIFxuICAgICAqIEBwYXJhbSBjdnQgXG4gICAgICovXG4gICAgcHVibGljIGFkZEV2ZW50SGFuZGxlcnNGcm9tQXR0cnNPZihzbm9kZTogRWxlbWVudCwgY3Z0OiBDb252ZXJ0ZXI8VGhpcz4pIHtcbiAgICAgICAvKiBpZiAoc25vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpPT0nd3MtcGFsZXR0ZS1jb2xvcicpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRk9VTkQgMWApO1xuXG4gICAgICAgIGlmIChzbm9kZS5nZXRBdHRyaWJ1dGUoJ2lkJyk9PSd4eXonKVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGT1VORFwiKTsgKi9cbiAgICAgICAgbGV0IGF0dHJzID0gc25vZGUuYXR0cmlidXRlcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGV2bmFtZTtcbiAgICAgICAgICAgIGlmIChhdHRyc1tpXS5uYW1lIT0nY2xhc3MnICYmIGF0dHJzW2ldLm5hbWUhPSdzdHlsZScgJiYgKGV2bmFtZT1FdmVudEhhbmRsZXJzLmlzRXZlbnRBdHRyKGF0dHJzW2ldLm5hbWUpKSkge1xuICAgICAgICAgICAgICAgIGxldCBoYW5kbGVyPXRoaXMubWFrZUV2ZW50SGFuZGxlcihhdHRyc1tpXS52YWx1ZSxjdnQpO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZuYW1lLGhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG59IiwiaW1wb3J0IHsgQWpheENhY2hlIH0gZnJvbSBcIi4uL0FqYXhcIjtcbmltcG9ydCB7IEFzc2V0SUQsIEFzc2V0RmFjdG9yeSB9IGZyb20gXCIuLi9Bc3NldFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4uL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgR2V0IH0gZnJvbSBcIi4uL0dldFwiO1xuaW1wb3J0IHsgSW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uL0ltcGxlbWVudGF0aW9uc1wiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgZ2V0QXR0ciwgVGFyZ2V0Tm9kZSB9IGZyb20gXCIuLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4uL1RoaXNcIjtcblxuLyoqXG4gKiBVdGlsaWx0eSBjbGFzcyB0aGF0IGFjdHMgYXMgYSBiYXNlIGZvciB3cml0aW5nIHlvdXIgb3duIENvRWxlbWVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCYXNlQ29FbGVtZW50PFQgZXh0ZW5kcyBUaGlzPVRoaXM+IGltcGxlbWVudHMgQ29FbGVtZW50PFQ+IHtcbiAgICBwcm90ZWN0ZWQgdG46VGFyZ2V0Tm9kZTtcbiAgICBwcm90ZWN0ZWQgY3Z0OkNvbnZlcnRlcjxUPjtcblxuICAgIGNvbnN0cnVjdG9yKGN2dDpDb252ZXJ0ZXI8VD4sdG46VGFyZ2V0Tm9kZSkge1xuICAgICAgICB0aGlzLnRuPXRuO1xuICAgICAgICB0aGlzLmN2dD1jdnQ7XG4gICAgfVxuXG4gICAgZ2V0Q3Z0KCk6IENvbnZlcnRlcjxUPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN2dDsgICAgICAgIFxuICAgIH1cblxuICAgIGdldFROKCk6IFRhcmdldE5vZGUge1xuICAgICAgICByZXR1cm4gdGhpcy50bjsgICAgICAgIFxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGFyYW1ldGVyIGJsb2NrIGFzIHNldCBieSBhbnkgcGFyZW50IENvbXBvbmVudCBmb3IgdXNcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFyYW1zKCkgOiBhbnkge1xuICAgICAgICAvLyBmaW5kIHRoZSBmaXJzdCBwYXJlbnQgdGhhdCBoYXNcbiAgICAgICAgbGV0IGZvdW5kOmFueTtcbiAgICAgICAgbGV0IG1lPSh0aGlzLmdldFROKCkuc25vZGUgYXMgRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB0aGlzLmdldEN2dCgpLmZpbmRQYXJlbnRBbmRJdGVyYXRpb24odGhpcy5nZXRUTigpLCh0bixpdGVyYXRpb24pPT57XG4gICAgICAgICAgICBmb3VuZD10bi5jaGlsZFBhcmFtcyhpdGVyYXRpb24sbWUpO1xuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIGN1cnJlbnQgZWxlbWVudCdzIDAgYmFzZWQgaXRlcmF0aW9uIGluIGEgcGFyZW50IHdpdGggdGhlIHRhZyAncGFyZW50VGFnJy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcGFyZW50VGFnIFxuICAgICAqIEByZXR1cm5zIGl0ZXJhdGlvbiBudW1iZXI7XG4gICAgICovXG4gICAgcHVibGljIGl0ZXIocGFyZW50VGFnOnN0cmluZykgOiBudW1iZXIge1xuICAgICAgICBjb25zdCB7cGFyZW50LGl0ZXJhdGlvbn0gPSB0aGlzLmdldEN2dCgpLmZpbmRQYXJlbnRBbmRJdGVyYXRpb24odGhpcy5nZXRUTigpLCh0bik9PntcbiAgICAgICAgICAgIHJldHVybiAodG4uc25vZGUgYXMgRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpPT1wYXJlbnRUYWc7ICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpdGVyYXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGF0dHI8VCBleHRlbmRzIChudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuKSA9IHN0cmluZz4oYXR0cjogc3RyaW5nLCBkZWZ2YWx1ZT86IFQpOiBUIHtcbiAgICAgICAgaWYgKCEodGhpcy5nZXRUTigpLnNub2RlIGFzIEVsZW1lbnQpLmhhc0F0dHJpYnV0ZShhdHRyKSkgeyAvLyBpZiBpdCBkb2VzbnQgZXhpc3Qgb24gb3VyIGVsZW1lbnQsIGRlbGVnYXRlIHRvIHRoZSBvd25pbmcgdGhpc1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3Z0KCkuZ2V0VGhpcygpLmF0dHIoYXR0cixkZWZ2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldEF0dHI8VD4odGhpcy5nZXRDdnQoKSx0aGlzLmdldFROKCkuc25vZGUsYXR0cixkZWZ2YWx1ZSx0aGlzLnRuKTtcbiAgICB9XG5cbiAgICAvKipcblx0ICogUmV0dXJucyB0aGUgdGV4dCBjb250ZW50IG9mIHRoaXMgRUxlbWVudCwgYWZ0ZXIgZXZhbHVhdGluZyBhbnkgJHt9IGV4cHJlc3Npb25zLlxuXHQgKi9cblx0cHVibGljIGNvbnRlbnQoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN2dCgpLmV4cGFuZFN0cmluZygodGhpcy5nZXRUTigpLnNub2RlIGFzIHVua25vd24gYXMgRWxlbWVudCkudGV4dENvbnRlbnQsdGhpcy5nZXRUTigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBzb3VyY2UgdGFnbmFtZSwgcmV0dXJucyB0aGUgZmlyc3QgbWF0Y2hpbmcgcGFyZW50IENvRWxlbWVudC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcGFyZW50VGFnIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwYXJlbnQ8VCBleHRlbmRzIENvRWxlbWVudD4ocGFyZW50VGFnOnN0cmluZykgOiBUIHtcbiAgICAgICAgbGV0IGZvdW5kPXRoaXMuZ2V0Q3Z0KCkuZmluZFBhcmVudCh0aGlzLmdldFROKCksKHRuKT0+e1xuICAgICAgICAgICAgcmV0dXJuICh0bi5zbm9kZSBhcyBFbGVtZW50KS50YWdOYW1lLnRvTG93ZXJDYXNlKCk9PXBhcmVudFRhZztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGZvdW5kKVxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kLmNvbXBvbmVudCBhcyBUO1xuICAgIH1cblxuICAgIG9uUmVuZGVyKHJtOiBSZW5kZXIpIHtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2ggYSBET00gc3ludGhldGljIGV2ZW50IG9uIHRoZSByb290IG5vZGUgb2YgdGhpcyBvYmplY3QuXG4gICAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy9DcmVhdGluZ19hbmRfdHJpZ2dlcmluZ19ldmVudHNcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZXZlbnRuYW1lIFxuICAgICAqIEBwYXJhbSBkZXRhaWwgXG4gICAgICovXG4gICAgcHVibGljIGRpc3BhdGNoRXZlbnQoZXZlbnRuYW1lOnN0cmluZyxkZXRhaWw/Ontba2V5OnN0cmluZ106YW55fSxvcHRpb25zPzpFdmVudEluaXQpIDogRXZlbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUTigpLmRpc3BhdGNoRXZlbnQoZXZlbnRuYW1lLGRldGFpbCxvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52YWxpZGF0ZShub2RlPzogc3RyaW5nIHwgTm9kZSB8IFRhcmdldE5vZGUsZm9yZ2V0Pzpib29sZWFuKSB7XG5cdFx0aWYgKCFub2RlKSAvLyBtZWFucyB1c1xuXHRcdFx0bm9kZT10aGlzLmdldFROKCk7XG4gICAgICAgIHRoaXMuY3Z0LmludmFsaWRhdGUobm9kZSxmb3JnZXQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQ8VCBleHRlbmRzIENvRWxlbWVudDxUaGlzPj4obm9kZTogc3RyaW5nIHwgTm9kZSxnZXRmdW5jPzpHZXQ8VD4pOiBUIHtcblx0XHRpZiAoIW5vZGUpIHsgLy8gbWVhbnMgdXNcbiAgICAgICAgICAgIGlmIChnZXRmdW5jKVxuICAgICAgICAgICAgICAgIGdldGZ1bmModGhpcyBhcyBhbnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmN2dC5nZXQobm9kZSxnZXRmdW5jKSBhcyB1bmtub3duIGFzIFQ7XG4gICAgfVxuXG4gICAgcHVibGljICQobm9kZT86IHN0cmluZyB8IE5vZGUgfCBUYXJnZXROb2RlLCBjaGFuZ2VpZD86IHN0cmluZywgY2hhbmdlcj86IChFbGVtZW50OiBhbnkpID0+IGFueSk6IEVsZW1lbnQge1xuXHRcdGlmICghbm9kZSlcblx0XHRcdG5vZGU9dGhpcy5nZXRUTigpO1xuICAgICAgICByZXR1cm4gdGhpcy5jdnQuJChub2RlLGNoYW5nZWlkLGNoYW5nZXIpO1xuICAgIH1cblxuXHQvKipcblx0ICogQXR0YWNoIGFuIGFzc2V0J3MgY29udHJvbCB0byB0aGUgdGFyZ2V0IG5vZGUuXG5cdCAqIFxuXHQgKiBAcGFyYW0gIHBhcmVudCBUaGUgdGFyZ2V0IGRvbSBub2RlIG9yIHF1ZXJ5IHNlbGVjdG9yIHdob3NlIGNoaWxkIHRoZSBuZXcgY29udHJvbCB3aWxsIGJlY29tZS5cblx0ICogQHBhcmFtICB0b0F0dGFjaCBUaGUgY29udHJvbCBvciBhc3NldCB0byBhdHRhY2guXG5cdCAqIEBwYXJhbSAgcGFyYW1ldGVycyAoT3B0aW9uYWwpLCBpZiAndG9BdHRhY2gnIHdhcyBhbiBhc3NldCwgdGhlbiBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGUgYXNzZXQuIFRoaXMgb2JqZWN0IGlzIGF2YWlsYWJsZSB0byB0aGUgYXNzZXQgYXMgJ3RoaXMucGFyYW1ldGVycydcblx0ICogXG5cdCAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY29udHJvbC4gXG5cdCAqL1xuXHRwdWJsaWMgYXR0YWNoKHBhcmVudDogTm9kZSB8IHN0cmluZywgdG9BdHRhY2g6IENvRWxlbWVudCB8IEFzc2V0SUQgfCBzdHJpbmcsIHBhcmFtZXRlcnM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogUHJvbWlzZTxDb0VsZW1lbnQ+IHtcblx0XHRyZXR1cm4gdGhpcy5jdnQuYXR0YWNoKHBhcmVudCwgdG9BdHRhY2gsIHBhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCogRGV0YWNoZXMgYSBwcmV2aW91c2x5IGF0dGFjaGVkKCkgY29udHJvbC5cblx0KiBcblx0KiBAcGFyYW0gdG9EZXRhY2ggVGhlIGNvbnRyb2wgdGhhdCB3YXMgYXR0YWNoZWQsIG9yIHRoZSB0YXJnZXQgbm9kZSBvciBxdWVyeSBzZWxlY3RvciBvZiB0aGUgcGFyZW50IGZyb20gd2hpY2ggdG8gYXR0YWNoIGFsbCBwcmV2aW91c2x5IGF0dGFjaGVkIGNvbnRyb2xzXG5cdCovXG5cdHB1YmxpYyBkZXRhY2godG9EZXRhY2g6IHN0cmluZyB8IENvRWxlbWVudCk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIHRoaXMuY3Z0LmRldGFjaCh0b0RldGFjaCk7XG5cdH1cblxuICAgIHB1YmxpYyBhamF4KGNhbGxOYW1lOiBzdHJpbmcsIGpzb25Ub1NlbmQ6IGFueSwgY2FjaGU/OiBBamF4Q2FjaGUsIHJlc3BvbnNlRGF0YVR5cGU/OiAneG1sJyB8ICdqc29uJyB8ICdzY3JpcHQnIHwgJ2h0bWwnIHwgJ2pzb25wJyB8ICd0ZXh0Jyk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIEltcGxlbWVudGF0aW9ucy5nZXRBamF4KCkuYWpheChjYWxsTmFtZSwganNvblRvU2VuZCwgY2FjaGUsIHJlc3BvbnNlRGF0YVR5cGUpO1xuXHR9XG5cblx0cHVibGljIGFzc2V0cygpOiBBc3NldEZhY3Rvcnkge1xuXHRcdHJldHVybiBJbXBsZW1lbnRhdGlvbnMuZ2V0QXNzZXRGYWN0b3J5KCk7XG5cdH1cblxuICAgIFxuXG59IiwiaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJJbXBsIH0gZnJvbSBcIi4uL2ltcGwvQ29udmVydGVySW1wbFwiO1xuaW1wb3J0IHsgVGFyZ2V0Tm9kZSB9IGZyb20gXCIuLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBFdmVudEhhbmRsZXJzIH0gZnJvbSBcIi4vRXZlbnRIYW5kbGVyc1wiO1xuaW1wb3J0IHsgQmFzZUNvRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L0Jhc2VDb0VsZW1lbnRcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuXG4vKipcbiAqIGVsZW1lbnRzIGxpa2UgPGRpdj48cD4sPGgxPiw8ZGl2PjxzcGFuPiBldGMgdGhhdCBjYW4gYmUgcmVuZGVyZWQgYXMgdGhlbXNlbHZlcyBpbnRvIGh0bWwuXG4gKiBcbiAqL1xuIGV4cG9ydCBjbGFzcyBIdG1sRWxlbWVudCAgZXh0ZW5kcyBCYXNlQ29FbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKGN2dDpDb252ZXJ0ZXI8VGhpcz4sdG46VGFyZ2V0Tm9kZSkge1xuICAgICAgICBzdXBlcihjdnQsdG4pO1xuICAgIH1cblxuICAgIFxuICAgIHByb3RlY3RlZCBnZXRUYWdOYW1lKGVsZW06RWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN0YXJ0KHJtOiBSZW5kZXIsY3Z0OiBDb252ZXJ0ZXI8VGhpcz4sZWxlbTpFbGVtZW50LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICAgcm0ub3BlblN0YXJ0KHRoaXMuZ2V0VGFnTmFtZShlbGVtKSx0aGlzKTtcbiAgICAgICAgaWYgKGVsZW0uY2xhc3NMaXN0ICYmIGVsZW0uY2xhc3NMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxlbGVtLmNsYXNzTGlzdC5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN0cj1jdnQuZXhwYW5kU3RyaW5nKGVsZW0uY2xhc3NMaXN0W2ldLHRuKTtcbiAgICAgICAgICAgICAgICBpZiAoIXN0ciB8fCBzdHIubGVuZ3RoPT0wKSAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGNsYXNzIFske2VsZW0uY2xhc3NMaXN0W2ldfV0gZXhwYW5kZWQgdG8gZW1wdHkgc3RyaW5nYClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBybS5jbGFzcyhzdHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIFxuXG4gICAgICAgIC8vIHNldCBpbmxpbmUgc3R5bGVzXG4gICAgICAgIGxldCBzdHI9ZWxlbS5nZXRBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgICAgIGlmIChzdHIgJiYgc3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGVzdHI9Y3Z0LmV4cGFuZFN0cmluZyhzdHIsdG4pO1xuICAgICAgICAgICAgbGV0IHBhaXJzOnN0cmluZ1tdW109ZXN0ci5zbGljZSgwLCBlc3RyLmxlbmd0aCAtIDEpLnNwbGl0KCc7JykubWFwKHggPT4geC5zcGxpdCgnOicpKTsgLy8vLyBnaXZlcyBbIFsnY29sb3InLCAnYmx1ZSddLCBbJ2Rpc3BsYXknLCAnZmxleCddIF1cbiAgICAgICAgICAgIGZvcihsZXQgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGlmIChwYWlyICYmIHBhaXIubGVuZ3RoPjEgJiYgcGFpclswXSAmJiBwYWlyWzFdICYmIHBhaXJbMF0udHJpbSgpLmxlbmd0aCkgIHtcbiAgICAgICAgICAgICAgICAgICAgcm0uc3R5bGUocGFpclswXS50cmltKCkscGFpclsxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGF0dHJzID0gZWxlbS5hdHRyaWJ1dGVzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXR0cnNbaV0ubmFtZSE9J2NsYXNzJyAmJiBhdHRyc1tpXS5uYW1lIT0nc3R5bGUnICYmICFFdmVudEhhbmRsZXJzLmlzRXZlbnRBdHRyKGF0dHJzW2ldLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcm0uYXR0cihhdHRyc1tpXS5uYW1lLGN2dC5leHBhbmRTdHJpbmcoYXR0cnNbaV0udmFsdWUsdG4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2N2dC5lbmNvZGVXU0Uocm0sdG4pO1xuICAgICAgICBybS5vcGVuRW5kKCk7XG4gICAgfVxuXG4gXG5cbiAgICBwcm90ZWN0ZWQgY2hpbGRyZW4ocm06IFJlbmRlcixjdnQ6IENvbnZlcnRlcjxUaGlzPix0bjpUYXJnZXROb2RlKSB7XG4gICAgICAgIGN2dC5yZW5kZXJDaGlsZHJlbihybSx0bik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGVuZChybTogUmVuZGVyLGN2dDogQ29udmVydGVyPFRoaXM+LGVsZW06RWxlbWVudCkge1xuICAgICAgICBybS5jbG9zZSh0aGlzLmdldFRhZ05hbWUoZWxlbSkpO1xuICAgIH1cblxuICAgIG9uUmVuZGVyKHJtOiBSZW5kZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IGVsZW09KHRoaXMudG4uc25vZGUgYXMgdW5rbm93biBhcyBFbGVtZW50KSA7XG5cbiAgICAgICAgdGhpcy5zdGFydChybSx0aGlzLmN2dCxlbGVtLHRoaXMudG4pO1xuXG4gICAgICAgIHRoaXMuY2hpbGRyZW4ocm0sdGhpcy5jdnQsdGhpcy50bik7XG5cbiAgICAgICAgdGhpcy5lbmQocm0sdGhpcy5jdnQsZWxlbSk7XG5cbiAgICB9XG5cbiAgICBcblxufVxuXG5leHBvcnQgY2xhc3MgSHRtbEVsZW1lbnRGYWN0b3J5ICBpbXBsZW1lbnRzIENvRWxlbWVudEZhY3Rvcnkge1xuICAgXG5cbiAgICByZWdpc3RlckZhY3RvcnkoY3Z0OiBDb252ZXJ0ZXI8VGhpcz4pIHtcbiAgICAgICBcbiAgICB9XG5cblxuICAgIFxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsIGN2dDogQ29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBIdG1sRWxlbWVudChjdnQsdG4pIDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuaW1wb3J0IHsgSHRtbEVsZW1lbnQsIEh0bWxFbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuL0h0bWxFbGVtZW50XCI7XG5cbi8qKlxuKiAgIEJ5cGFzc2VzIHRoZSBjdXJyZW50IG5vZGUgZW50aXJlbHkgLSBidXQgaXRzIGNoaWxkcmVuIGFyZSByZW5kZXJlZCB0byBodG1sXG4qL1xuY2xhc3MgQnlwYXNzRWxlbWVudCBleHRlbmRzIEh0bWxFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihjdnQ6Q29udmVydGVyPFRoaXM+LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICAgc3VwZXIoY3Z0LHRuKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc3RhcnQocm06IFJlbmRlcixjdnQ6IENvbnZlcnRlcjxUaGlzPixlbGVtOkVsZW1lbnQpIHtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZW5kKHJtOiBSZW5kZXIsY3Z0OiBDb252ZXJ0ZXI8VGhpcz4sZWxlbTpFbGVtZW50KSB7XG4gICAgfVxufVxuXG4vKipcbiogYnlwYXNzZXMgdGhlIGN1cnJlbnQgbm9kZSBlbnRpcmVseSAtIGl0cyBjaGlsZHJlbiBhcmUgcmVuZGVyZWQgdG8gaHRtbFxuKi9cbmV4cG9ydCBjbGFzcyBCeXBhc3NFbGVtZW50RmFjdG9yeSBleHRlbmRzIEh0bWxFbGVtZW50RmFjdG9yeSB7XG4gICBcblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsIGN2dDogQ29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBCeXBhc3NFbGVtZW50KGN2dCx0bikgO1xuICAgIH1cblxufSIsImltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vQ29FbGVtZW50RmFjdG9yeVwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4uL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgQmFzZUNvRWxlbWVudCB9IGZyb20gXCIuLi9lbGVtZW50L0Jhc2VDb0VsZW1lbnRcIjtcbmltcG9ydCB7IFJlbmRlciB9IGZyb20gXCIuLi9SZW5kZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUgfSBmcm9tIFwiLi4vVGFyZ2V0Tm9kZVwiO1xuaW1wb3J0IHsgVGhpcyB9IGZyb20gXCIuLi9UaGlzXCI7XG5cbi8qKlxuICogZXhlY3V0ZXMgYW55IDxzY3JpcHQ+IHRhZ3MgaW4gdGhlIGNvbnRleHQgb2YgdGhlIENvbnZlcnRlckltcGwncyAnVGhpcycgb2JqZWN0LlxuICovXG4gZXhwb3J0IGNsYXNzIFNjcmlwdEVsZW1lbnQgIGV4dGVuZHMgQmFzZUNvRWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcihjdnQ6Q29udmVydGVyPFRoaXM+LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICAgc3VwZXIoY3Z0LHRuKTtcbiAgICB9XG5cblxuICAgIG9uUmVuZGVyKHJtOiBSZW5kZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHNjcmlwdDpzdHJpbmc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50bi5zbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY249dGhpcy50bi5zbm9kZS5jaGlsZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoY24ubm9kZVR5cGU9PU5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjbi5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmICghc2NyaXB0KVxuICAgICAgICAgICAgICAgICAgICBzY3JpcHQ9Y24ubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdCs9KCdcXG4nK2NuLm5vZGVWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBcbiAgICAgICAgaWYgKHNjcmlwdCkge1xuICAgICAgICAgICAgdGhpcy5jdnQuZXhlY3V0ZVNjcmlwdChzY3JpcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cblxuXG4vKipcbiAqIGV4ZWN1dGVzIGFueSA8c2NyaXB0PiB0YWdzIGluIHRoZSBjb250ZXh0IG9mIHRoZSBDb252ZXJ0ZXJJbXBsJ3MgJ1RoaXMnIG9iamVjdC5cbiAqL1xuIGV4cG9ydCBjbGFzcyBTY3JpcHRFbGVtZW50RmFjdG9yeSAgaW1wbGVtZW50cyBDb0VsZW1lbnRGYWN0b3J5IHtcblxuICAgIHJlZ2lzdGVyRmFjdG9yeShjdnQ6IENvbnZlcnRlcjxUaGlzPikge1xuICAgICAgICBcbiAgICB9XG5cblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsY3Z0OkNvbnZlcnRlcjxUaGlzPik6IENvRWxlbWVudCB7XG4gICAgICAgIHJldHVybiBuZXcgU2NyaXB0RWxlbWVudChjdnQsdG4pO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHsgQWpheENhY2hlIH0gZnJvbSBcIi4uL0FqYXhcIjtcbmltcG9ydCB7IEFzc2V0SUQsIEFzc2V0RmFjdG9yeSB9IGZyb20gXCIuLi9Bc3NldFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuXG5cbi8qKlxuICogRG9lcyBub3QgcmVuZGVyIHRoZSBub2RlIG9yIGl0cyBjaGlsZHJlbi4gZS5nLiA8aGVhZD5cbiAqL1xuIGNsYXNzIERvTm90UmVuZGVyRWxlbWVudCBpbXBsZW1lbnRzIENvRWxlbWVudCB7XG5cbiAgICBwYXJhbXMoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBpdGVyKHBhcmVudFRhZzogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgb25Qb3N0UmVuZGVyPyhub2RlOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIG9uUHJlUmVuZGVyPygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIGNsZWFudXA/KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgYXR0cjxUIGV4dGVuZHMgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiA9IHN0cmluZz4oYXR0cjogc3RyaW5nLCBkZWZ2YWx1ZT86IFQpOiBUIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuXG4gICAgY29udGVudCgpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBcbiAgICBpbnZhbGlkYXRlKG5vZGU6IHN0cmluZyB8IFRhcmdldE5vZGUgfCBOb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBnZXQ8VCBleHRlbmRzIENvRWxlbWVudDxUaGlzPj4obm9kZTogc3RyaW5nIHwgTm9kZSk6IFQge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgJChub2RlOiBzdHJpbmcgfCBUYXJnZXROb2RlIHwgTm9kZSwgY2hhbmdlaWQ/OiBzdHJpbmcsIGNoYW5nZXI/OiAoRWxlbWVudDogYW55KSA9PiBhbnkpOiBFbGVtZW50IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuICAgIGF0dGFjaChwYXJlbnQ6IHN0cmluZyB8IE5vZGUsIHRvQXR0YWNoOiBzdHJpbmcgfCBBc3NldElEIHwgQ29FbGVtZW50PFRoaXM+LCBwYXJhbWV0ZXJzPzogeyBba2V5OiBzdHJpbmddOiBhbnk7IH0pOiBQcm9taXNlPENvRWxlbWVudDxUaGlzPj4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgZGV0YWNoKHRvRGV0YWNoOiBzdHJpbmcgfCBDb0VsZW1lbnQ8VGhpcz4pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgYWpheChjYWxsTmFtZTogc3RyaW5nLCBqc29uVG9TZW5kOiBhbnksIGNhY2hlPzogQWpheENhY2hlLCByZXNwb25zZURhdGFUeXBlPzogXCJ4bWxcIiB8IFwianNvblwiIHwgXCJzY3JpcHRcIiB8IFwiaHRtbFwiIHwgXCJqc29ucFwiIHwgXCJ0ZXh0XCIpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9XG4gICAgYXNzZXRzKCk6IEFzc2V0RmFjdG9yeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH1cbiAgICBcbiAgICBkaXNwYXRjaEV2ZW50KGV2ZW50bmFtZTogc3RyaW5nLCBkZXRhaWw/OiB7IFtrZXk6IHN0cmluZ106IGFueTsgfSwgb3B0aW9ucz86IEV2ZW50SW5pdCk6IEV2ZW50IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgfVxuXG4gICAgZ2V0Q3Z0KCk6IENvbnZlcnRlcjxUaGlzPiB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZ2V0VE4oKTogVGFyZ2V0Tm9kZSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvblJlbmRlcihybTogUmVuZGVyKSB7XG4gICAgICAgIFxuICAgIH1cblxufVxuXG5cbi8qKlxuICogRG9lcyBub3QgcmVuZGVyIHRoZSBub2RlIG9yIGl0cyBjaGlsZHJlbi4gZS5nLiA8aGVhZD5cbiAqL1xuIGV4cG9ydCBjbGFzcyBEb05vdFJlbmRlckVsZW1lbnRGYWN0b3J5IGltcGxlbWVudHMgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgXG5cbiAgICBtYWtlQ29tcG9uZW50KHRuOiBUYXJnZXROb2RlLCBjdnQ6IENvbnZlcnRlcjxUaGlzPik6IENvRWxlbWVudCB7XG4gICAgICAgIHJldHVybiBuZXcgRG9Ob3RSZW5kZXJFbGVtZW50KCk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGYWN0b3J5KGN2dDogQ29udmVydGVyPFRoaXM+KSB7XG4gICAgICAgXG4gICAgfVxuXG59XG4iLCJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuaW1wb3J0IHsgQmFzZUNvRWxlbWVudCB9IGZyb20gXCIuL0Jhc2VDb0VsZW1lbnRcIjtcblxuZXhwb3J0IGNsYXNzIEVycm9yQ29FbGVtZW50IGV4dGVuZHMgQmFzZUNvRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIG1zZzpzdHJpbmc7XG4gICAgY29uc3RydWN0b3IoY3Z0OkNvbnZlcnRlcjxUaGlzPix0bjpUYXJnZXROb2RlLG1zZzpzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoY3Z0LHRuKTtcbiAgICAgICAgdGhpcy5tc2c9bXNnO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3VybmFtZSgpIHtcbiAgICAgICAgbGV0IG5hbWU9KHRoaXMuZ2V0VE4oKS5zbm9kZSBhcyBFbGVtZW50KS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIC8qXG4gICAgICAgIGxldCBkYXNoPW5hbWUuaW5kZXhPZignLScpO1xuICAgICAgICBpZiAoZGFzaD4wICYmIGRhc2g8bmFtZS5sZW5ndGgtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWUuc3Vic3RyaW5nKGRhc2grMSk7XG4gICAgICAgIH0qL1xuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG5cbiAgICBvblJlbmRlcihybTogUmVuZGVyKSB7XG4gICAgICAgIHJtLm9wZW5TdGFydCgnZGl2Jyx0aGlzKVxuICAgICAgICAuY2xhc3MoJ3UtY29tbC1lcnJvcicpXG4gICAgICAgIC5jbGFzcygndS0nK3RoaXMuZ2V0U3VybmFtZSgpKVxuICAgICAgICAub3BlbkVuZCgpXG4gICAgICAgIC50ZXh0KHRoaXMubXNnKTtcblxuICAgICAgICB0aGlzLmdldEN2dCgpLnJlbmRlckNoaWxkcmVuKHJtLHRoaXMuZ2V0VE4oKSk7XG5cbiAgICAgICAgcm0uY2xvc2UoJ2RpdicpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBpc1RhcmdldE5vZGUsIFRhcmdldE5vZGUgfSBmcm9tIFwiLi4vVGFyZ2V0Tm9kZVwiO1xuXG5cbi8qKlxuICogcmV0dXJucyAnY2h0JyByZXBlYXRlZCBjbnQgdGltZXMuXG4gKiBcbiAqIEBwYXJhbSBjbnQgXG4gKiBAcGFyYW0gY2hyIFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFkKGNudDpudW1iZXIsY2hyOnN0cmluZz0nLScpIDogc3RyaW5nIHtcbiAgICBsZXQgcz0nJztcbiAgICB3aGlsZShjbnQ+MCkgICAge1xuICAgICAgICBzKz1jaHI7XG4gICAgICAgIGNudC0tO1xuICAgIH1cbiAgICByZXR1cm4gcztcbn1cblxuLyoqXG4gICAgICogRm9yIGRlYnVnZ2luZywgZGlzcGxheSBhbiBpZGVudGlmaWFibGUgc3RyaW5nIGZvciBhIG5vZGUuXG4gICAgICogQHBhcmFtIG5vZGUgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gZXhwb3J0IGZ1bmN0aW9uIHRvU3RyKG5vZGU6Tm9kZXxzdHJpbmd8VGFyZ2V0Tm9kZSkge1xuICAgIGlmICghbm9kZSlcbiAgICAgICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICAgIGlmICh0eXBlb2Ygbm9kZT09J3N0cmluZycpXG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIGlmIChpc1RhcmdldE5vZGUobm9kZSkpXG4gICAgICAgIG5vZGU9bm9kZS5zbm9kZTtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxldCBpZD0obm9kZSBhcyBFbGVtZW50KS5pZDtcbiAgICAgICAgbGV0IHRhZz1ub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBsZXQgY2xhc3Nlcz0nJztcblxuICAgICAgICBpZiAobm9kZS5jbGFzc0xpc3QgJiYgbm9kZS5jbGFzc0xpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IobGV0IGk9MDtpPG5vZGUuY2xhc3NMaXN0Lmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzKz1ub2RlLmNsYXNzTGlzdFtpXTtcbiAgICAgICAgICAgICAgICBjbGFzc2VzKz0nLic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xhc3Nlcy5sZW5ndGg+MCkge1xuICAgICAgICAgICAgcmV0dXJuIGAke3RhZ30keyhpZCk/ICcjJytpZDonJ30uYCtjbGFzc2VzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGAke3RhZ30keyhpZCk/ICcjJytpZDonJ31gO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCB0eXBlPSdub2RlJztcbiAgICAgICAgc3dpdGNoKChub2RlIGFzIGFueSkubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgTm9kZS5BVFRSSUJVVEVfTk9ERTogdHlwZT0nQVRUUklCVVRFX05PREUnO2JyZWFrO1xuICAgICAgICAgICAgLyoqIG5vZGUgaXMgYSBDREFUQVNlY3Rpb24gbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5DREFUQV9TRUNUSU9OX05PREU6IHR5cGU9J0NEQVRBX1NFQ1RJT05fTk9ERSc7YnJlYWs7XG4gICAgICAgICAgICAvKiogbm9kZSBpcyBhIENvbW1lbnQgbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5DT01NRU5UX05PREU6IHR5cGU9J0NPTU1FTlRfTk9ERSc7YnJlYWs7XG4gICAgICAgICAgICAvKiogbm9kZSBpcyBhIERvY3VtZW50RnJhZ21lbnQgbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFOiB0eXBlPSdET0NVTUVOVF9GUkFHTUVOVF9OT0RFJzticmVhaztcbiAgICAgICAgICAgIC8qKiBub2RlIGlzIGEgZG9jdW1lbnQuICovXG4gICAgICAgICAgICBjYXNlIE5vZGUuRE9DVU1FTlRfTk9ERTogXG4gICAgICAgICAgICAgICAgdHlwZT0nRE9DVU1FTlRfTk9ERSAnKyhub2RlIGFzIERvY3VtZW50KS5kb2N1bWVudFVSSTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qKiBTZXQgd2hlbiBvdGhlciBpcyBhIGRlc2NlbmRhbnQgb2Ygbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9DT05UQUlORURfQlk6IHR5cGU9J0RPQ1VNRU5UX1BPU0lUSU9OX0NPTlRBSU5FRF9CWSc7YnJlYWs7XG4gICAgICAgICAgICAvKiogU2V0IHdoZW4gb3RoZXIgaXMgYW4gYW5jZXN0b3Igb2Ygbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9DT05UQUlOUzogdHlwZT0nRE9DVU1FTlRfUE9TSVRJT05fQ09OVEFJTlMnO2JyZWFrO1xuICAgICAgICAgICAgLyoqIFNldCB3aGVuIG5vZGUgYW5kIG90aGVyIGFyZSBub3QgaW4gdGhlIHNhbWUgdHJlZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9ESVNDT05ORUNURUQ6IHR5cGU9J0RPQ1VNRU5UX1BPU0lUSU9OX0RJU0NPTk5FQ1RFRCc7YnJlYWs7XG4gICAgICAgICAgICAvKiogU2V0IHdoZW4gb3RoZXIgaXMgZm9sbG93aW5nIG5vZGUuICovXG4gICAgICAgICAgICBjYXNlIE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fRk9MTE9XSU5HOiB0eXBlPSdET0NVTUVOVF9QT1NJVElPTl9GT0xMT1dJTkcnO2JyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX0lNUExFTUVOVEFUSU9OX1NQRUNJRklDOiB0eXBlPSdET0NVTUVOVF9QT1NJVElPTl9JTVBMRU1FTlRBVElPTl9TUEVDSUZJQyc7YnJlYWs7XG4gICAgICAgICAgICAvKiogU2V0IHdoZW4gb3RoZXIgaXMgcHJlY2VkaW5nIG5vZGUuICovXG4gICAgICAgICAgICBjYXNlIE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fUFJFQ0VESU5HOiB0eXBlPSdET0NVTUVOVF9QT1NJVElPTl9QUkVDRURJTkcnO2JyZWFrO1xuICAgICAgICAgICAgLyoqIG5vZGUgaXMgYSBkb2N0eXBlLiAqL1xuICAgICAgICAgICAgY2FzZSBOb2RlLkRPQ1VNRU5UX1RZUEVfTk9ERTogdHlwZT0nRE9DVU1FTlRfVFlQRV9OT0RFJzticmVhaztcbiAgICAgICAgICAgIC8qKiBub2RlIGlzIGFuIGVsZW1lbnQuICovXG4gICAgICAgICAgICBjYXNlIE5vZGUuRUxFTUVOVF9OT0RFOiB0eXBlPSdFTEVNRU5UX05PREUnO2JyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb2RlLkVOVElUWV9OT0RFOiB0eXBlPSdFTlRJVFlfTk9ERSc7YnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vZGUuRU5USVRZX1JFRkVSRU5DRV9OT0RFOiB0eXBlPSdFTlRJVFlfUkVGRVJFTkNFX05PREUnO2JyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb2RlLk5PVEFUSU9OX05PREU6IHR5cGU9J05PVEFUSU9OX05PREUnO2JyZWFrO1xuICAgICAgICAgICAgLyoqIG5vZGUgaXMgYSBQcm9jZXNzaW5nSW5zdHJ1Y3Rpb24gbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5QUk9DRVNTSU5HX0lOU1RSVUNUSU9OX05PREU6IHR5cGU9J1BST0NFU1NJTkdfSU5TVFJVQ1RJT05fTk9ERSc7YnJlYWs7XG4gICAgICAgICAgICAvKiogbm9kZSBpcyBhIFRleHQgbm9kZS4gKi9cbiAgICAgICAgICAgIGNhc2UgTm9kZS5URVhUX05PREU6IHR5cGU9J1RFWFRfTk9ERSc7YnJlYWs7ICAgICAgXG4gICAgICAgIH0gIFxuXG4gICAgICAgIHJldHVybiB0eXBlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBBc3NldElELCBBc3NldFR5cGUsIGlzQ29FbGVtZW50QXNzZXQsIHJlc3RvcmVBc3NldElELCBzdHJpbmdpZnlBc3NldElEIH0gZnJvbSBcIi4uL0Fzc2V0XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQsIGlzQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBpc1RhcmdldE5vZGUsIFRhcmdldE5vZGUsIFROUyB9IGZyb20gXCIuLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlSW1wbCB9IGZyb20gXCIuL1RhcmdldE5vZGVJbXBsXCI7XG5pbXBvcnQgeyBHZXRBdHRyVCwgVGhpcyB9IGZyb20gXCIuLi9UaGlzXCI7XG5pbXBvcnQgeyBBdHRhY2hhYmxlLCBpc0F0dGFjaGFibGUgfSBmcm9tIFwiLi4vQXR0YWNoYWJsZVwiO1xuaW1wb3J0IHsgQXR0YWNobWVudEltcGwgfSBmcm9tIFwiLi9BdHRhY2htZW50SW1wbFwiO1xuaW1wb3J0IHsgU3R5bGUgfSBmcm9tIFwiLi9TdHlsZVwiO1xuaW1wb3J0IHsgQXNzZXRDb0VsZW1lbnRGYWN0b3J5IH0gZnJvbSBcIi4vQXNzZXRDb0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBIdG1sRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vaHRtbC9IdG1sRWxlbWVudFwiO1xuaW1wb3J0IHsgQnlwYXNzRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vaHRtbC9CeXBhc3NFbGVtZW50XCI7XG5pbXBvcnQgeyBTY3JpcHRFbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi9odG1sL1NjcmlwdEVsZW1lbnRcIjtcbmltcG9ydCB7IERvTm90UmVuZGVyRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vaHRtbC9Eb05vdFJlbmRlckVsZW1lbnRcIjtcbmltcG9ydCB7IEVycm9yQ29FbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvRXJyb3JDb0VsZW1lbnRcIjtcbmltcG9ydCB7IFBhdGNoIH0gZnJvbSBcIi4uL1BhdGNoXCI7XG5pbXBvcnQgeyB0b1N0ciB9IGZyb20gXCIuL0RlYnVnXCI7XG5pbXBvcnQgeyBFdmVudEhhbmRsZXJzIH0gZnJvbSBcIi4uL2h0bWwvRXZlbnRIYW5kbGVyc1wiO1xuaW1wb3J0IHsgU3RhdGVDaGFuZ2VyLCBTdGF0ZUNoYW5nZXJzIH0gZnJvbSBcIi4uL1N0YXRlQ2hhbmdlclwiO1xuaW1wb3J0IHsgR2V0IH0gZnJvbSBcIi4uL0dldFwiO1xuXG5kZWNsYXJlIHZhciByZXF1aXJlOmFueTsgLy8gdGhlIEFNRCBsb2FkZXIgbXVzdCBiZSBwcmVzZW50XG5cbmludGVyZmFjZSBUYWdNYXRjaCB7XG4gICAgbWF0Y2g6KHRhZzpzdHJpbmcpPT5ib29sZWFuLFxuICAgIGZhY3Rvcnk6Q29FbGVtZW50RmFjdG9yeVxufVxuXG4vKipcbiAqIEEgQ09NTCB0byBIdG1sIGNvbnZlcnRlciAtIHJlYWRzIHRoZSBET00gdHJlZSBvZiBhIGdpdmVuIEh0bWwgZmlsZSB3aXRoIENPTUwgbWFya3VwIGFuZCByZW5kZXJzIGFsbCBub2RlcyBpbiB0aGUgdHJlZSB0byBcbiAqIGh0bWwgYnkgY2FsbGluZyBmYWN0b3JpZXMgb2YgTWFya3VwQ29tcG9uZW50cy4gTm9ybWFsIGh0bWwgbm9kZXMgaW4gdGhlIG9yaWdpbmFsIGh0bWwgZG9tIHRyZWUgYXJlIHByZXNlcnZlZC5cbiAqIFxuICogIyMjIFByaW5jaXBsZXM6XG4gKiAxLiBUaGVyZSBpcyBhIHNvdXJjZSBkb20gKHNkb20pIHdoaWNoIGlzIGNvbnZlcnRlZCB0byB0aGUgdGFyZ2V0IGRvbSAodGRvbSkuXG4gKiAyLiBFYWNoIG5vZGUgaW4gdGhlIHNkb20gaXMgY29udmVydGVkIHRvIDAgb3IgbWFueSBub2RlcyBpbiB0aGUgdGRvbS5cbiAqIDMuIE9iamVjdHMgdGhhdCBpbXBsZW1lbnQgdGhlIENvRWxlbWVudCBpbnRlcmZhY2UgaGFuZGxlIHRoZSBjb252ZXJzaW9uLiBGb3IgZWFjaCBzZG9tIG5vZGUsIHRoZXkgZ2VuZXJhdGUgMCwxIG9yIG1hbnkgdGRvbSBub2Rlcy5cbiAqIDQuIFRoZXJlIGNhbiBiZSBtYW55IGluc3RhbmNlcyBvZiBhIENvRWxlbWVudCBsaW5rZWQgdG8gYW55IHNpbmdsZSBzZG9tIG5vZGUuXG4gKiA1LiBUaGUgY29udmVyc2lvbiBjYW4gYmUgYXN5bmNyb25vdXMsIGJlY2F1c2UgQSBDb0VsZW1lbnQgbWF5IG5lZWQgaW5mb3JtYXRpb24gdG8gcmVuZGVyIGl0cyB0ZG9tIGJhc2VkIG9uIGFuIGFzeW5jLiBjYWxsIC0gdHlwaWNhbGx5IGEganNvbmNhbGwuXG4gKiA2LiBNYXJrdXBDb21wb25lbnRzIHN1cHBvcnQgJ211dGF0aW9uJyBvZiB0aGUgdGRvbSBlbGVtZW50LiBUaGlzIG1lYW5zIGF0IHJ1bnRpbWUgYW4gZXZlbnQgc3VjaCBhcyBhIHVzZXIgY2xpY2sgbWF5IGNoYW5nZSBkeW5hbWljYWxseSB0aGUgYXR0cmlidXRlcyBvZlxuICogICAgYSBzZG9tIG5vZGUuIFRoaXMgd2lsbCBjYXVzZSB0aGUgQ29FbGVtZW50IHRvIHJlZ2VuZXJhdGUgdGhlIHN1Ym5vZGVzIG9mIHRoZSB0ZG9tIG9ubHkgZm9yIHRoYXQgc2RvbSBub2RlLlxuICogNy4gQSBDb0VsZW1lbnQgbWF5IHJlbmRlciBpdHMgY29udGVudCB1c2luZyBhbnkgaHRtbGNvbnRyb2wuIFxuICogXG4gKiAjIyMgSW1wbGVtZW50YXRpb246IChPYmplY3RpdmUgaXMgdG8gbWFpbnRhaW4gc3RhdGUgYmV0d2VlbiByZXJlbmRlcnMsIGZvciBleGFtcGxlIGNvbnRyb2xzIGNyZWF0ZWQgZHVyaW5nIG9uZSByZW5kZXIgYXJlIGF2YWlsYWJlIGF0IHRoZSBuZXh0KVxuICogXG4gKiAxLiBEdXJpbmcgcmVuZGVyaW5nLCBhIHRyZWUgaXMgY3JlYXRlZCBmcm9tIHRoZSBgcm9vdGAgb2JqZWN0IGZvciBlYWNoIGNvbWwgdGFnIGVuY291bnRlcmVkLiBFYWNoIENvRWxlbWVudCdzXG4gKiAgICBgb25SZW5kZXIoKWAgZnVuY3Rpb24gYWRkcyBpdHMgb3duIHRhZ3MsIHRoZW4gY2FsbHMgdGhlIGByZW5kZXJDaGlsZHJlbigpYCB0byBhZGQgZnVydGhlciBjaGlsZCBub2Rlcy4gXG4gKiAgICBJZiBubyBtYXRjaGluZyBDb0VsZW1lbnQgaXMgZm91bmQgZm9yIGEgdGFnLCB0aGUgc2RvbSBub2RlIGlzIGNvcGllZCB2ZXJiYXRpbSB0byB0aGUgdGRvbS4gRWFjaCBub2RlIGluIHRoaXMgdHJlZSBpcyBhICdUYXJnZXROb2RlJ1xuICogMi4gRWFjaCBUYXJnZXROb2RlIGlzIGEgbWFwcGluZyBvZiAxIHNub2RlIHZpYSBhIENvRWxlbWVudCB0byBtYW55IHRub2Rlcy4gT25jZSB0aGUgdHJlZSBoYXMgYmVlbiBjcmVhdGVkLFxuICogICAgc3Vic2VxdWVudCByZW5kZXJzIGNhbGwgdGhlIHNhbWUgQ29FbGVtZW50IGluc3RhbmNlLiBJZiBhIHByZXZpb3VzbHkgcmVuZGVyZWRcbiAqICAgIFRhcmdldE5vZGUgaXMgbm90IHZpc2l0ZWQgZHVyaW5nIHRoaXMgcmVuZGVyLCB0aGVuIHRoZSBUYXJnZXROb2RlIGlzIHJlbW92ZWQgZnJvbSB0aGUgcGFyZW50LlxuICogNC4gTG9vcGluZy4gSWYgYSBwYXJlbnQgQ29FbGVtZW50IHJlbmRlcnMgaXRzIGNoaWxkcmVuIG11bHRpcGxlIHRpbWUsIGl0IHVzZXMgdGhlIGByZW5kZXJDaGlsZHJlbigpYCdzIGBpdGVyYXRpb25gIHBhcmFtZXRlclxuICogICAgdG8gcGFzcyBpbiB0aGUgaXRlcmF0aW9uIGNvdW50LiBUaGUgVGFyZ2V0Tm9kZSB0aGVuIG1haW50YWlucyB0aGUgY2hpbGRyZW4gZ2VuZXJhdGVkIHBlciBpdGVyYXRpb24uIFxuICovXG5leHBvcnQgY2xhc3MgQ29udmVydGVySW1wbDxUIGV4dGVuZHMgVGhpcz1UaGlzPiBpbXBsZW1lbnRzIENvbnZlcnRlcjxUPiB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyBzaGFyZWRFbGVtRmFjdG9yaWVzOk1hcDxzdHJpbmcsQ29FbGVtZW50RmFjdG9yeT47IC8vIHNoYXJlZCBieSBhbGwgaW5zdGFuY2VzIG9mIENvbnZlcnRlckltcGxcbiAgICBwcm90ZWN0ZWQgaW5zdGFuY2VGYWN0b3JpZXM6TWFwPHN0cmluZyxDb0VsZW1lbnRGYWN0b3J5Pj1uZXcgTWFwKCk7IC8vIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgLSBsb2FkZWQgdmlhIGltcG9ydHNcbiAgICBwcm90ZWN0ZWQgbWF0Y2hpbmdGYWN0b3JpZXM6VGFnTWF0Y2hbXT1bXTtcbiAgICBwcm90ZWN0ZWQgREVGQVVMVF9GQUNUT1JZOkh0bWxFbGVtZW50RmFjdG9yeSA9IG5ldyBIdG1sRWxlbWVudEZhY3RvcnkoKTtcbiAgICBwcm90ZWN0ZWQgVGhpczpUOyAvLyB0aGUgJ3RoaXMnIG9mIGFueSBzY3JpcHRzLlxuICAgIHByb3RlY3RlZCByZWFkeTpib29sZWFuPWZhbHNlO1xuICAgIHByb3RlY3RlZCByb290OlRhcmdldE5vZGU7IC8vIHRoZSByb290IGZyb20gd2hpY2ggdG8gc3RhcnQgcmVuZGVyaW5nXG4gICAgcHJvdGVjdGVkIGRvYzpEb2N1bWVudDtcbiAgICBwcm90ZWN0ZWQgb2JzZXJ2ZXI6TXV0YXRpb25PYnNlcnZlcjtcbiAgICBwdWJsaWMgICAgc3RhdGljIGJsb2NrTXV0YXRpb246Ym9vbGVhbjsgLy8gbmVlZGVkIHRvIHN0b3AgbXV0YXRpb24gb2JzZXJ2ZXIgZHVyaW5nIHRlbXBsYXRlIG9wZXJhdGlvbnNcbiAgICBwcm90ZWN0ZWQgcmVuZGVyQ29tbWVudHM6Ym9vbGVhbj10cnVlOyAvLyBpZiB0cnVlLCBjb21tZW50cyBsaWtlIDwhLS0gc29tZSBjb21tZW50IC0tPiBpbiB0aGUgc291cmNlIGRvbSB3aWxsIGJlIHJlbmRlcmVkIGFzIDx3cy1jb21tZW50IHN0eWxlPVwiZGlzcGxheTpub25lO1wiPiBzb21lIGNvbW1lbnQgPC93cy1jb21tZW50PlxuICAgIHByb3RlY3RlZCBpbXBvcnRlZERvY3M6U2V0PERvY3VtZW50PjtcbiAgICBwcm90ZWN0ZWQgYXNzZXRJZDogQXNzZXRJRDtcbiAgICBwcm90ZWN0ZWQgZm5HZXRBdHRyIDogR2V0QXR0clQ7XG5cbiAgICAvLyBsaXN0ZW5lcnNcbiAgICBwcm90ZWN0ZWQgb25BZnRlclJlbmRlckNhbGxiYWNrczooKCk9PnZvaWQpW109W107XG4gICAgcHJvdGVjdGVkIG9uVGhpc0NyZWF0ZWRDYWxsYmFja3M6KChUaGlzOlRoaXMpPT52b2lkKVtdPVtdO1xuXG5cbiAgICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgaWYgKCFDb252ZXJ0ZXJJbXBsLnNoYXJlZEVsZW1GYWN0b3JpZXMpIHtcbiAgICAgICAgICAgIENvbnZlcnRlckltcGwuc2hhcmVkRWxlbUZhY3Rvcmllcz1uZXcgTWFwKCk7XG5cbiAgICAgICAgICAgIC8vQ29udmVydGVySW1wbC5zaGFyZWRFbGVtRmFjdG9yaWVzLnNldCgnZG9jdW1lbnQnLG5ldyBEb2N1bWVudEVsZW1lbnRGYWN0b3J5KCkpOyAvLyBoYW5kbGVkIGJ5IEJhc2VUaGlzXG4gICAgICAgICAgICBDb252ZXJ0ZXJJbXBsLnNoYXJlZEVsZW1GYWN0b3JpZXMuc2V0KCdoZWFkJyxuZXcgRG9Ob3RSZW5kZXJFbGVtZW50RmFjdG9yeSgpKTtcbiAgICAgICAgICAgIENvbnZlcnRlckltcGwuc2hhcmVkRWxlbUZhY3Rvcmllcy5zZXQoJ2h0bWwnLG5ldyBCeXBhc3NFbGVtZW50RmFjdG9yeSgpKTtcbiAgICAgICAgICAgIENvbnZlcnRlckltcGwuc2hhcmVkRWxlbUZhY3Rvcmllcy5zZXQoJ2JvZHknLG5ldyBCeXBhc3NFbGVtZW50RmFjdG9yeSgpKTtcbiAgICAgICAgICAgIENvbnZlcnRlckltcGwuc2hhcmVkRWxlbUZhY3Rvcmllcy5zZXQoJ3NjcmlwdCcsbmV3IFNjcmlwdEVsZW1lbnRGYWN0b3J5KCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IuIElmIHR3byBDb252ZXJ0ZXJJbXBscyBzaGFyZSBzdGF0ZSAoVGhpcyBhbmQgaW1wcnRzKSwgdGhlbiBwYXNzIHRoZSBvcmlnaW5hbCAuIFRoaXMgaXMgbmVlZGVkIHdoZW5cbiAgICAgKiB0d28gc2VwZXJhdGUgcmVuZGVyIGNoYWlucyBhcmUgcnVuIGZyb20gdGhlIHNhbWUgSHRtbFBhZ2UsIChmb3IgZXhhbXBsZSB0aGUgV1NUb29sa2l0IGVsZW1lbnQpXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29weVN0YXRlRnJvbT86Q29udmVydGVyPFQ+KSB7XG4gICAgICAgIGlmICghY29weVN0YXRlRnJvbSkgXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpOyAvLyBzZXQgdXAgZmFjdG9yaWVzXG5cbiAgICAgICAgICAgIC8vdGhpcy5UaGlzPW5ldyBCYXNlVGhpcyh0aGlzKTtcblxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLlRoaXM9Y29weVN0YXRlRnJvbS5nZXRUaGlzKCk7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlRmFjdG9yaWVzPShjb3B5U3RhdGVGcm9tIGFzIHVua25vd24gYXMgQ29udmVydGVySW1wbDxUPikuaW5zdGFuY2VGYWN0b3JpZXM7IC8vIHNvIHRoZSBwYXJlbnRzIGltcG9ydHMgYXJlIGF2YWxhYmxlIHRvIHVzXG4gICAgICAgICAgICB0aGlzLm1hdGNoaW5nRmFjdG9yaWVzPShjb3B5U3RhdGVGcm9tIGFzIHVua25vd24gYXMgQ29udmVydGVySW1wbDxUPikubWF0Y2hpbmdGYWN0b3JpZXM7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGZ1bmN0b24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gZXhwYW5kIGF0dHJpYnV0ZXNcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZm5HZXRBdHRyIFxuICAgICAqL1xuICAgIHNldEdldEF0dHJGbihmbkdldEF0dHI6IEdldEF0dHJUKSB7XG4gICAgICAgIHRoaXMuZm5HZXRBdHRyPWZuR2V0QXR0cjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEluc3RhdGlhdGUgdGhpcyBmcm9tIHRoZSBgPG1ldGEgbmFtZT1cInRoaXNjbGFzc1wiIGNvbnRlbnQ9XCJwYXRoL1RvL0NsYXNzXCI+YCBtZXRhLlxuICAgICAqIElmIG5vdCBmb3VuZCwganVzdCB1c2UgYW4gaW5zdGFuY2Ugb2YgQmFzZVRoaXMuXG4gICAgICogXG4gICAgICogQHBhcmFtIGRvYyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaW5zdGFudGlhdGVUaGlzKGRvYzpEb2N1bWVudCkgOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBsZXQgbWV0YT1kb2MucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwidGhpc2NsYXNzXCJdJykgYXMgSFRNTE1ldGFFbGVtZW50O1xuICAgICAgICBpZiAobWV0YSAmJiBtZXRhLmNvbnRlbnQgJiYgbWV0YS5jb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHRoaXNDbGFzcz1tZXRhLmNvbnRlbnQ7XG5cbiAgICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1RoaXModGhpc0NsYXNzKVxuICAgICAgICAgICAgICAgIC50aGVuKChpbnN0YW5jZTpUKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLlRoaXM9aW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25UaGlzQ3JlYXRlZCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5UaGlzPUltcGxlbWVudGF0aW9ucy5jcmVhdGVUaGlzKHRoaXMsdGhpcy5mbkdldEF0dHIpIGFzIFQ7IFxuICAgICAgICAgICAgdGhpcy5vblRoaXNDcmVhdGVkKCk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHByb3RlY3RlZCBuZXdUaGlzKHBhdGg6c3RyaW5nKSA6IFByb21pc2U8VD4ge1xuXHRcdGxldCByZXMscmVqO1xuXHRcdGxldCBwcm9taXNlOlByb21pc2U8YW55Pj1uZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT57XG5cdFx0XHRyZXM9cmVzb2x2ZTtcblx0XHRcdHJlaj1yZWplY3Q7XG5cdFx0fSk7XG5cblx0XHQocmVxdWlyZSBhcyBhbnkpKFtwYXRoXSxcblx0XHQobW9kdWxlKT0+e1xuXHRcdFx0bGV0IGluc3RhbmNlPW5ldyBtb2R1bGUuZGVmYXVsdCh0aGlzLHRoaXMuVGhpcyx0aGlzLmZuR2V0QXR0cik7XG5cdFx0XHRyZXMoaW5zdGFuY2UpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cblxuXG4gICAgXG5cblxuICAgIC8qKlxuICAgICAqIENhbGxzIGFueSByZWdpc3RlcmVkIGNhbGxiYWNrcyBvbiBUaGlzIGNyZWF0aW9uXG4gICAgICogXG4gICAgICogQHBhcmFtIHJlZiBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgb25UaGlzQ3JlYXRlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMub25UaGlzQ3JlYXRlZENhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjYiBvZiB0aGlzLm9uVGhpc0NyZWF0ZWRDYWxsYmFja3MpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYih0aGlzLlRoaXMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QXNzZXRJZCgpIDogQXNzZXRJRCB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzc2V0SWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHRvcGNvbnRyb2wgZmluaXNoZXMgcmVuZGVyaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjYiBcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkT25UaGlzQ3JlYXRlZExpc3RlbmVyKGNiOiAoVGhpczogVGhpcykgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLm9uVGhpc0NyZWF0ZWRDYWxsYmFja3MucHVzaChjYik7XG4gICAgfVxuXG4gICAgXG5cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IG9ic2VydmluZyB0aGUgc291cmNlIGRvY3VtZW50IC0gYW55IGNoYW5nZXMgdG8gYXR0cmludXRlcyBjYXVzZXMgd2lsbCB0cmlnZ2VyIGEgcmVkcmF3IG9mIHRoZVxuICAgICAqIG5vZGUgdGhhdCBjaGFuZ2VkLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGFydE9ic2VydmluZygpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpPT4ge1xuICAgICAgICAgICAgaWYgKENvbnZlcnRlckltcGwuYmxvY2tNdXRhdGlvbilcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBsZXQgY2hhbmdlZDpTZXQ8VGFyZ2V0Tm9kZT47XG4gICAgICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaCgobXV0YXRpb246TXV0YXRpb25SZWNvcmQpPT57XG4gICAgICAgICAgICAgIGlmIChtdXRhdGlvbi50eXBlID09PSBcImF0dHJpYnV0ZXNcIikge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE1VVEFURUQ6ICR7bXV0YXRpb24uYXR0cmlidXRlTmFtZX0gb24gdGFyZ2V0PSR7dG9TdHIobXV0YXRpb24udGFyZ2V0KX0gZnJvbSAke211dGF0aW9uLm9sZFZhbHVlfSB0byAkeyhtdXRhdGlvbi50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZShtdXRhdGlvbi5hdHRyaWJ1dGVOYW1lKX1gKTtcbiAgICAgICAgICAgICAgICBsZXQgdG49dGhpcy5maW5kKHRoaXMucm9vdCwodG4pPT4odG4uc25vZGU9PW11dGF0aW9uLnRhcmdldCB8fCB0bi5yZXBsYWNlZD09bXV0YXRpb24udGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgaWYgKHRuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2hhbmdlZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQ9bmV3IFNldCgpO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkLmFkZCh0bik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE1VVEFURUQ6ICR7bXV0YXRpb24uYXR0cmlidXRlTmFtZX0gY291bGQgbm90IGZpbmQgdGFyZ2V0IGZyb20gcm9vdD0ke3RvU3RyKHRoaXMucm9vdC5zbm9kZSl9YCk7XG4gICAgICAgICAgICAgICAgfSAqL1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE1VVEFURUQ6ICR7bXV0YXRpb24uYXR0cmlidXRlTmFtZX0gb24gdGFyZ2V0PSR7dG9TdHIobXV0YXRpb24udGFyZ2V0KX0gZnJvbSAke211dGF0aW9uLm9sZFZhbHVlfSB0byAkeyhtdXRhdGlvbi50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZShtdXRhdGlvbi5hdHRyaWJ1dGVOYW1lKX1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdETyBOT1QgQ0hBTkdFIFNPVVJDRSBOT0RFUyAoU05PREVTKSAtIFVTRSB0aGlzLiQoc2VsZWN0b3IsKGVsZW0pPT57ZWxlbS5zZXRBdHRyaWJ1dGUoXCJrZXlcIixcInZhbHVlXCIpfSkgSU5TVEVBRC4nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlZC5mb3JFYWNoKCh0bik9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkSW50KHRuKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5nZXREb2N1bWVudCgpLCB7YXR0cmlidXRlczogdHJ1ZSxzdWJ0cmVlOnRydWV9KTsgICAgICAgIFxuICAgIH1cblxuICAgICAvKipcbiAgICAgKiBQZXJmb3JtIHVud2F0Y2hlZCBjaGFuZ2VzIG9uIGFuIHNub2RlIHZpYSBjaGFuZ2VzKCkuIFdvbid0IHRyaWdnZXIgYSByZWJ1aWxkLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzbm9kZSBcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyBcbiAgICAgKlxuICAgIHVud2F0Y2hlZFNub2RlQ2hhbmdlKHNub2RlOk5vZGUsY2hhbmdlczooKT0+YW55KSB7XG4gICAgICAgIHRyeSB7IC8vIGJsb2NrIG11dGF0aW9uIHRpbGwgYWZ0ZXIgdGhlIFxuICAgICAgICAgICAgQ29udmVydGVySW1wbC5ibG9ja011dGF0aW9uPXRydWU7XG4gICAgICAgICAgICBjaGFuZ2VzKCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBQcm9taXNlXG4gICAgICAgICAgICAucmVzb2x2ZSgpXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIENvbnZlcnRlckltcGwuYmxvY2tNdXRhdGlvbj1mYWxzZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9ICovXG5cblxuICAgIHB1YmxpYyBnZXRSb290KCkgOiBUYXJnZXROb2RlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlIHRoZSByb290LCBlLmcuIGR1cmluZyB0ZW1wbGF0aXphdGlvbi5cbiAgICAgKiBAcGFyYW0gcm9vdCBcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVwbGFjZVJvb3Qocm9vdDpUYXJnZXROb2RlKSB7XG4gICAgICAgIHRoaXMucm9vdD1yb290O1xuICAgIH1cbiAgICBcblxuICAgIHB1YmxpYyBnZXREb2N1bWVudCgpIDogRG9jdW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5kb2M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW1wb3J0cyBhIGRvY3VtZW50IGJ5IGltcG9ydGluZyBpdHMgc3R5bGVzIGFuZCB0aGUgZXhlY3V0aW5nIGl0cyA8c2NyaXB0PiBibG9jayBmcm9tIHRoZSBoZWFkLlxuICAgICAqIFxuICAgICAqICAgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGltcG9ydERvY3VtZW50SW50KGRvYzpEb2N1bWVudCkgOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4odGhpcy5pbXBvcnRNYXJrdXBDb21wb25lbnRzKGRvYykpO1xuICAgIH1cblxuICAgIFxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0cyBzY3JpcHRzIGFuZCBzdHlsZXMsIGFuZCBzZXRzIHRoZSBkb2N1bWVudCBhcyB0aGUgcm9vdCBub2RlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBkb2MgXG4gICAgICogQHBhcmFtIGFzc2V0SWQgSWYgdGhlIGRvY3VtZW50IHdhcyBsb2FkZWQgZnJvbSBhbiBhc3NldCwgdGhlIGFzc2V0SWQuIFRoaXMgaXMgc3RvcmVkIGluIHRoZSBUaGlzIG9iamVjdC4gQWxzbywgd2Ugc3RhcnQgbW9uaXRvcmluZyBzY29wZSBjaGFuZ2VzIGZvciB0aGlzIGFzc2V0ICh3aGljaCByZXByZXNlbnRzIHRoZSB0b3AgbGV2ZWwgcGFnZSksIHNvIHRoYXQgc3R5bGVzIGFyZSByZW1vdmVkIHdoZW4gbm90IGluIHNjb3BlIFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXREb2N1bWVudChkb2M6RG9jdW1lbnQsYXNzZXRJZDpBc3NldElELHJvb3Q/OlRhcmdldE5vZGUpIDogUHJvbWlzZTxDb252ZXJ0ZXI8VGhpcz4+IHtcbiAgICAgICAgdGhpcy5yb290PShyb290KSA/IHJvb3Q6bmV3IFRhcmdldE5vZGVJbXBsKGRvYy5ib2R5KTtcbiAgICAgICAgaWYgKCF0aGlzLnJvb3Quc25vZGUpXG4gICAgICAgICAgICB0aGlzLnJvb3Quc25vZGU9ZG9jLmJvZHk7XG4gICAgICAgIGRvYy5ib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1hc3NldC1pZCcsc3RyaW5naWZ5QXNzZXRJRChhc3NldElkKSk7XG4gICAgICAgIC8vaWYgKGF0dGFjaG1lbnROb2RlKVxuICAgICAgICAvLyAgICB0aGlzLnJvb3QuYXR0YWNobWVudE5vZGU9YXR0YWNobWVudE5vZGU7XG4gICAgICAgIHRoaXMuZG9jPWRvYzsgLy8gc28gVGhpcyBjb25zdHJ1Y3Rpb24gdXNlIG9mICQgd2lsbCBoYXZlIGRvYyBhdmFpbGFibGVcbiAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgdGhpcy5pbnN0YW50aWF0ZVRoaXMoZG9jKVxuICAgICAgICAgICAgLnRoZW4oKCk9PnsgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1wb3J0RG9jdW1lbnRJbnQoZG9jKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5kb2M9ZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0VGhpcygpLmRvY3VtZW50PXRoaXMuZG9jO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2V0SWQ9YXNzZXRJZDtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0T2JzZXJ2aW5nKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuXG5cbiAgICAvKipcbiAgICAgKiBDYWxsIHNvIGFueSB0ZW1wbGF0ZSdzIGluc3RhbGxlZCBvbkFmdGVyUmVuZGVyIGNhbGxiYWNrcyBhcmUgY2FsbGVkLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSByZWYgXG4gICAgICovXG4gICAgcHVibGljIG9uQWZ0ZXJSZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQWZ0ZXJSZW5kZXJDYWxsYmFja3MubGVuZ3RoPjApICAge1xuICAgICAgICAgICAgZm9yKGxldCBjYiBvZiB0aGlzLm9uQWZ0ZXJSZW5kZXJDYWxsYmFja3MpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goeCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSB0b3Bjb250cm9sIGZpbmlzaGVzIHJlbmRlcmluZy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY2IgXG4gICAgICovXG4gICAgcHVibGljIGFkZE9uQWZ0ZXJSZW5kZXJMaXN0ZW5lcihjYjogKCkgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLm9uQWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaChjYik7XG5cdH1cblxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIGFsbCBhdHRyaWJ1dGVzIGZyb20gbm9kZSB0byB0aGUgUmVuZGVyICh1c2luZyBybS5hdHRyKCkpIGV4Y2VwdCBmb3IgYW55IHNwZWNpZmllZCBpbiB0aGUgZG9Ob3RDb3B5IGxpc3QuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJtIFxuICAgICAqIEBwYXJhbSBub2RlIFxuICAgICAqIEBwYXJhbSBkb05vdENvcHkgXG4gICAgICovXG4gICAgcHVibGljIGNvcHlBdHRyRXhjZXB0KHJtOiBSZW5kZXIsIG5vZGU6IE5vZGUsIGRvTm90Q29weT86IHN0cmluZ1tdLGN1cnJ0bj86VGFyZ2V0Tm9kZSkge1xuICAgICAgICBsZXQgZWxlbTpFbGVtZW50ID0gKG5vZGUgYXMgYW55IGFzIEVsZW1lbnQpO1xuICAgICAgICBsZXQgYXR0cnMgPSBlbGVtLmF0dHJpYnV0ZXM7XG4gICAgICAgIGxldCBpZ25vcmVzZXQ6U2V0PHN0cmluZz47XG4gICAgICAgIGlmIChkb05vdENvcHkgJiZkb05vdENvcHkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZ25vcmVzZXQ9bmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICBmb3IobGV0IGlnIG9mIGRvTm90Q29weSlcbiAgICAgICAgICAgICAgICBpZ25vcmVzZXQuYWRkKGlnLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhdHRyc1tpXS5uYW1lIT0nY2xhc3MnICYmIGF0dHJzW2ldLm5hbWUhPSdzdHlsZScgJiYgICFFdmVudEhhbmRsZXJzLmlzRXZlbnRBdHRyKGF0dHJzW2ldLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlnbm9yZXNldCAmJiBpZ25vcmVzZXQuaGFzKGF0dHJzW2ldLm5hbWUudG9Mb3dlckNhc2UoKSkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHJtLmF0dHIoYXR0cnNbaV0ubmFtZSx0aGlzLmV4cGFuZFN0cmluZyhhdHRyc1tpXS52YWx1ZSxjdXJydG4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAgXG4gICAgICAgIFxuICAgICAgICAvLyBjb3B5IGNsYXNzIGFuZCBhdHRyaWJ1dGVzXG4gICAgICAgIGlmIChlbGVtLmNsYXNzTGlzdCAmJiBlbGVtLmNsYXNzTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8ZWxlbS5jbGFzc0xpc3QubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgICAgIGxldCBzdHI9dGhpcy5leHBhbmRTdHJpbmcoZWxlbS5jbGFzc0xpc3RbaV0sY3VycnRuKTtcbiAgICAgICAgICAgICAgICBpZiAoIXN0ciB8fCBzdHIubGVuZ3RoPT0wKSAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGNsYXNzIFske2VsZW0uY2xhc3NMaXN0W2ldfV0gZXhwYW5kZWQgdG8gZW1wdHkgc3RyaW5nYCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcm0uY2xhc3Moc3RyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXQgaW5saW5lIHN0eWxlc1xuICAgICAgICBsZXQgc3RyPWVsZW0uZ2V0QXR0cmlidXRlKCdzdHlsZScpO1xuICAgICAgICBpZiAoc3RyICYmIHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBwYWlyczpzdHJpbmdbXVtdPXN0ci5zbGljZSgwLCBzdHIubGVuZ3RoIC0gMSkuc3BsaXQoJzsnKS5tYXAoeCA9PiB4LnNwbGl0KCc6JykpOyAvLy8vIGdpdmVzIFsgWydjb2xvcicsICdibHVlJ10sIFsnZGlzcGxheScsICdmbGV4J10gXVxuICAgICAgICAgICAgZm9yKGxldCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhaXIgJiYgcGFpci5sZW5ndGg+MSAmJiBwYWlyWzBdICYmIHBhaXJbMV0gJiYgcGFpclswXS50cmltKCkubGVuZ3RoKSAge1xuICAgICAgICAgICAgICAgICAgICBybS5zdHlsZShwYWlyWzBdLnRyaW0oKSx0aGlzLmV4cGFuZFN0cmluZyhwYWlyWzFdLGN1cnJ0bikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICBDb3B5J3MgdGhlIHNub2RlJ3MgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyBhbmQgc3R5bGVzIHRvIHRoZSB0bm9kZSBcbiAgICAgKiBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG5vZGUgVGhlIHRub2RlIHRvIGNvcHkgdG8uXG4gICAgICogQHBhcmFtIHNub2RlIFRoZSBub2RlIHRvIGNvcHkgZnJvbS5cbiAgICAgKiBAcGFyYW0gZG9Ob3RDb3B5IEEgbGlzdCBvZiBhdHRyaWJ1dGUgTk9UIHRvIGNvcHlcbiAgICAgKiBAcGFyYW0gYXR0cjJzZXQgQWRkaXRpb25hbCBhdHRyaWJ1dGVzIHRvIHNldCAoYXJyYXkgb2Yga2V5L3ZhbHVlIHBhaXJzKVxuICAgICAqL1xuICAgICBwdWJsaWMgY29weUF0dHJFeGNlcHRUb1ROb2RlKHRub2RlOk5vZGUsIHNub2RlOiBOb2RlLCBkb05vdENvcHk/OiBzdHJpbmdbXSxhdHRyMnNldD86c3RyaW5nW11bXSxjdXJydG4/OlRhcmdldE5vZGUpIHtcbiAgICAgICAgbGV0IGVsZW06RWxlbWVudCA9IChzbm9kZSBhcyBhbnkgYXMgRWxlbWVudCk7XG4gICAgICAgIGxldCB0ZWxlbTpFbGVtZW50ID0gKHRub2RlIGFzIEVsZW1lbnQpO1xuICAgICAgICBsZXQgYXR0cnMgPSBlbGVtLmF0dHJpYnV0ZXM7XG4gICAgICAgIGxldCBpZ25vcmVzZXQ6U2V0PHN0cmluZz47XG4gICAgICAgIGlmIChkb05vdENvcHkgJiZkb05vdENvcHkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZ25vcmVzZXQ9bmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgICAgICBmb3IobGV0IGlnIG9mIGRvTm90Q29weSlcbiAgICAgICAgICAgICAgICBpZ25vcmVzZXQuYWRkKGlnLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9sZXQgdG5vZGVKUT0kKHRub2RlKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXR0cnNbaV0ubmFtZSE9J2NsYXNzJyAmJiAvLyBjbGFzcyBoYW5kbGVkIHNlcGVyYXRlbHkgdmlhIGNsYXNzbGlzdCBiZWxvd1xuICAgICAgICAgICAgICAgIGF0dHJzW2ldLm5hbWUhPSdzdHlsZScgJiYgIC8vIHN0eWxlcyBoYW5kbGVkIHNlcGVyYXRlbHlcbiAgICAgICAgICAgICAgICBhdHRyc1tpXS5uYW1lIT0ncmVtb3ZlJyAgJiYgXG4gICAgICAgICAgICAgICAgIUV2ZW50SGFuZGxlcnMuaXNFdmVudEF0dHIoYXR0cnNbaV0ubmFtZSlcbiAgICAgICAgICAgICAgICAmJiBhdHRyc1tpXS5uYW1lIT0naWQnKSB7IC8vIGFzIGl0cyBhIGNvbnRyb2wsIHdlIGNhbnQgb3ZlcndyaXRlIHRoZSB1aTUgaWQgd2l0aCB0aGUgc291cmNlJ3NcbiAgICAgICAgICAgICAgICBpZiAoaWdub3Jlc2V0ICYmIGlnbm9yZXNldC5oYXMoYXR0cnNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgdGVsZW0uc2V0QXR0cmlidXRlKGF0dHJzW2ldLm5hbWUsdGhpcy5leHBhbmRTdHJpbmcoYXR0cnNbaV0udmFsdWUsY3VycnRuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gIFxuXG4gICAgICAgIC8vIGlmIGFueSBhdHRyaWJ1dGVzIHRvIHNldCwgY29waWVzIHRoZXNlIHRvbzpcbiAgICAgICAgaWYgKGF0dHIyc2V0KSB7XG4gICAgICAgICAgICBmb3IobGV0IGt2IG9mIGF0dHIyc2V0KSB7XG4gICAgICAgICAgICAgICAgdGVsZW0uc2V0QXR0cmlidXRlKGt2WzBdLGt2WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gY29weSBjbGFzcyBhbmQgYXR0cmlidXRlc1xuICAgICAgICBpZiAoIShpZ25vcmVzZXQgJiYgaWdub3Jlc2V0LmhhcygnY2xhc3MnKSkpIHtcbiAgICAgICAgICAgIGlmIChlbGVtLmNsYXNzTGlzdCAmJiBlbGVtLmNsYXNzTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPGVsZW0uY2xhc3NMaXN0Lmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGVsZW0uY2xhc3NMaXN0LmFkZCh0aGlzLmV4cGFuZFN0cmluZyhlbGVtLmNsYXNzTGlzdFtpXSxjdXJydG4pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXQgaW5saW5lIHN0eWxlc1xuICAgICAgICBsZXQgc3RyPWVsZW0uZ2V0QXR0cmlidXRlKCdzdHlsZScpO1xuICAgICAgICBpZiAoc3RyICYmIHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBzdHlsZXN0cj0odGVsZW0uZ2V0QXR0cmlidXRlKCdzdHlsZScpKSA/IHRlbGVtLmdldEF0dHJpYnV0ZSgnc3R5bGUnKTonJztcbiAgICAgICAgICAgIC8qIHdoeSBwYXJzZSB0byBwYWlycz8gXG4gICAgICAgICAgICBsZXQgcGFpcnM6c3RyaW5nW11bXT1zdHIuc2xpY2UoMCwgc3RyLmxlbmd0aCAtIDEpLnNwbGl0KCc7JykubWFwKHggPT4geC5zcGxpdCgnOicpKTsgLy8vLyBnaXZlcyBbIFsnY29sb3InLCAnYmx1ZSddLCBbJ2Rpc3BsYXknLCAnZmxleCddIF1cbiAgICAgICAgICAgIGZvcihsZXQgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGlmIChwYWlyICYmIHBhaXIubGVuZ3RoPjEgJiYgcGFpclswXSAmJiBwYWlyWzFdICYmIHBhaXJbMF0udHJpbSgpLmxlbmd0aCkgIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzdHIrPWAke3BhaXJbMF0udHJpbSgpfToke3RoaXMuZXhwYW5kU3RyaW5nKHBhaXJbMV0pfTtgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgc3R5bGVzdHIrPXRoaXMuZXhwYW5kU3RyaW5nKHN0cixjdXJydG4pO1xuICAgICAgICAgICAgaWYgKHN0eWxlc3RyLmxlbmd0aD4wKSB7XG4gICAgICAgICAgICAgICAgdGVsZW0uc2V0QXR0cmlidXRlKCdzdHlsZScsc3R5bGVzdHIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyByZW1vdmVcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGF0dHJzW2ldLm5hbWU9PSdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgdGVsZW0ucmVtb3ZlQXR0cmlidXRlKGF0dHJzW2ldLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG5cbiAgICBcblxuICAgIFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB0aGlzIG9iamVjdCB0aGF0IGlzIHZpc2libGUgdG8gc2NyaXB0cyBhbmQgc3RyaW5nIHRlbXBsYXRlcyBpbiB0aGUgaHRtbCBwYWdlXG4gICAgICovXG4gICAgcHVibGljIGdldFRoaXMoKSA6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5UaGlzO1xuICAgIH1cblxuXG5cbiAgICBwcm90ZWN0ZWQgbG9hZEVsZW1lbnRQcm9taXNlczpQcm9taXNlPGFueT5bXT1bXTtcbiAgICAvKipcbiAgICAgKiBpbXBvcnRzIGFueSB3cy1lbGVtZW50IGltcG9ydCBzdGF0ZW1lbnRzIGluIHRoZSBoZWFkIG9mIHRoZSB0ZW1wbGF0ZSwgdGhlbiBzZXRzIHRoZSByZWFkeSBmbGFnLlxuICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbGwgaW1wb3J0cyBhcmUgZG9uZSBhbmQgdGhlIHJlYWR5IGZsYWcgaXMgc2V0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBkb2MgXG4gICAgICogXG4gICAgICovXG4gICAgcHVibGljIGltcG9ydE1hcmt1cENvbXBvbmVudHMoZG9jOiBEb2N1bWVudCkgOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBsZXQgaGVhZD1kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKTtcblxuICAgICAgICB0aGlzLmxvYWRFbGVtZW50UHJvbWlzZXM9W107XG4gICAgICAgIGlmIChoZWFkICYmIGhlYWQubGVuZ3RoPjApIHtcbiAgICAgICAgICAgIGxldCBzY3JpcHRzPWhlYWRbMF0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXG4gICAgICAgICAgICBmb3IobGV0IGk9MDtpPHNjcmlwdHMubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgICAgIGxldCB0bj1uZXcgVGFyZ2V0Tm9kZUltcGwoc2NyaXB0c1tpXSk7XG4gICAgICAgICAgICAgICAgbGV0IGU9dGhpcy5tYWtlQ29FbGVtZW50KHRuKTsgLy8gd2lsbCB1c2UgdGhlIHNjcmlwdCBmYWN0b3J5XG4gICAgICAgICAgICAgICAgaWYgKGlzQ29FbGVtZW50KGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGUub25SZW5kZXIobnVsbCk7IC8vIHRoaXMgd2lsbCBwdXNoIHRvIHRoaXMubG9hZEVsZW1lbnRQcm9taXNlc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHRoaXMubG9hZEVsZW1lbnRQcm9taXNlcylcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRSZWFkeSh0cnVlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFJlYWR5KHJlYWR5OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMucmVhZHk9cmVhZHk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhIGpzIHNjcmlwdCB1c2luZyBBTUQgYW5kIGNyZWF0ZXMgYSBDb0VsZW1lbnQgb3V0IG9mIHRoZSBsb2FkZWQgbW9kdWxlIChNb2R1bGUuZGVmYXVsdClcbiAgICAgKiBUaGlzIGlzIHRoZW4gaXN0YWxsZWQgb24gdGhpcyBpbnN0YW5jZSdzIGVsZW1lbnQgZmFjdG9yaWVzLlxuICAgICAqIFRoaXMgZnVuY3Rpb24gYWxzbyBwdXNoZXMgdGhlIHByb21pc2Ugb250byB0aGlzLmxvYWRFbGVtZW50UHJvbWlzZXMsIHdoaWNoIGNhbiBiZSB1c2VkXG4gICAgICogdG8gd2FpdCBmb3IgYWxsIHdzLWVsZW1lbnRzIHRvIGxvYWQgYmVmb3JlIHJlbmRlcmluZyB0aGUgdGVtcGxhdGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGpzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBsb2FkTWFya3VwRmFjdG9yeShqczpzdHJpbmcpIDogUHJvbWlzZTxDb0VsZW1lbnRGYWN0b3J5PiB7XG4gICAgICAgIC8vIG5vcm1hbCBwYWdlOlxuICAgICAgICBsZXQgcHJvbWlzZT1cbiAgICAgICAgIG5ldyBQcm9taXNlPENvRWxlbWVudEZhY3Rvcnk+KChyZXNvbHZlLHJlamVjdCk9PntcbiAgICAgICAgICAgIHJlcXVpcmUoW2pzXSwgXG4gICAgICAgICAgICAgICAgKE1vZHVsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiaGVyZSFcIik7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmFjdG9yeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgTW9kdWxlLmRlZmF1bHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWN0b3J5PW5ldyBNb2R1bGUuZGVmYXVsdCgpOyAvLyBpcyBhbiBBTUQgbW9kdWxlIChjb21waWxlZCB0cyBjbGFzcylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYCR7anN9IGlzIG5vdCBhIE1vZHVsZWA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFjdG9yeSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnJvcik9PntcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgfSkgOyAgIFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvYWRFbGVtZW50UHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGV4ZWN1dGUgdGhlIGphdmFzY3JpcHQgaW4gJ3NjcmlwdCcgYWZ0ZXIgc2V0dGluZyBpdHMgJ3RoaXMnIHRvIHBvaW50IHRvIHRoZSBUaGlzIG9iamVjdC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc2NyaXB0IFxuICAgICAqL1xuICAgIHB1YmxpYyBleGVjdXRlU2NyaXB0KHNjcmlwdDpzdHJpbmcpIHtcbiAgICAgICAgbGV0IGY9KG5ldyBGdW5jdGlvbihzY3JpcHQpKS5iaW5kKHRoaXMuVGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIGYoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZXhwYW5kU3RyaW5nKHN0cjpzdHJpbmcsX19jdXJydG46VGFyZ2V0Tm9kZSkgOiBzdHJpbmcge1xuICAgICAgICAvL2xldCB4PXN0cjtcbiAgICAgICAgaWYgKHN0ciAmJiBzdHIuaW5kZXhPZignJHsnKT49MCkge1xuICAgICAgICAgICAgLy8gZXhwYW5kXG4gICAgICAgICAgICAodGhpcy5UaGlzIGFzIGFueSkuX19jdXJydG49X19jdXJydG47XG4gICAgICAgICAgICBsZXQgZj0obmV3IEZ1bmN0aW9uKFwidHJ5IHtcXG4gcmV0dXJuIGBcIitzdHIrXCJgO1xcbn1cXG4gY2F0Y2goZSkge1xcbnJldHVybiAnJztcXG59XFxuXCIpKS5iaW5kKHRoaXMuVGhpcyk7XG4gICAgICAgICAgICBzdHI9ZigpO1xuICAgICAgICAgICAgZGVsZXRlICh0aGlzLlRoaXMgYXMgYW55KS5fX2N1cnJ0bjtcbiAgICAgICAgfSBcbiAgICAgICAgLy9jb25zb2xlLmxvZygnSU5QVVQ6Jyt4KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnIENWVEQ6JytzdHIpO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBtYWtlQ29FbGVtZW50Rm9yVGFnKHRhZzpzdHJpbmcsdG46VGFyZ2V0Tm9kZSkgOiBDb0VsZW1lbnQgfCBQcm9taXNlPENvRWxlbWVudD4ge1xuICAgICAgICAvLyB1c2UgaW5zdGFuY2UgZmFjdG9yaWVzIGZpcnN0XG4gICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5tYXRjaGluZ0ZhY3Rvcmllcy5sZW5ndGg7aSsrKSAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXRjaGluZ0ZhY3Rvcmllc1tpXS5tYXRjaCh0YWcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hpbmdGYWN0b3JpZXNbaV0uZmFjdG9yeS5tYWtlQ29tcG9uZW50KHRuLHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGY9dGhpcy5pbnN0YW5jZUZhY3Rvcmllcy5nZXQodGFnKTtcbiAgICAgICAgaWYgKGYpIHtcbiAgICAgICAgICAgIGlmIChmLm1ha2VDb21wb25lbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGYubWFrZUNvbXBvbmVudCh0bix0aGlzKTtcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvckNvRWxlbWVudCh0aGlzLHRuLGAke3RhZ30gLSBubyBtYWtlQ29tcG9uZW50KClgKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIFxuXG4gICAgICAgIC8vIHVzZSBzdGF0aWMgZmFjdG9yaWVzIG5leHRcbiAgICAgICAgZj1Db252ZXJ0ZXJJbXBsLnNoYXJlZEVsZW1GYWN0b3JpZXMuZ2V0KHRhZyk7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgcmV0dXJuIGYubWFrZUNvbXBvbmVudCh0bix0aGlzKTtcblxuXG4gICAgICAgIC8vIGZhbGxiYWNrIHRvIHRoZSBkZWZhdWx0IGh0bWwgaGFuZGxlclxuICAgICAgICByZXR1cm4gdGhpcy5ERUZBVUxUX0ZBQ1RPUlkubWFrZUNvbXBvbmVudCh0bix0aGlzKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBtYWtlQ29FbGVtZW50KHRuOlRhcmdldE5vZGUpIDogQ29FbGVtZW50IHwgUHJvbWlzZTxDb0VsZW1lbnQ+IHtcbiAgICAgICAgbGV0IHNub2RlOk5vZGU9KHRuLnJlcGxhY2VkKSA/IHRuLnJlcGxhY2VkOnRuLnNub2RlO1xuICAgICAgICBzd2l0Y2goc25vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIC8vY2FzZSBOb2RlLkRPQ1VNRU5UX05PREU6IC8vIG5vdyBoYW5kbGVkIGJ5IEJhc2VUaGlzXG4gICAgICAgICAgICAvLyAgICByZXR1cm4gdGhpcy5tYWtlQ29FbGVtZW50Rm9yVGFnKCdkb2N1bWVudCcsdG4pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSBOb2RlLkVMRU1FTlRfTk9ERToge1xuICAgICAgICAgICAgICAgIC8vIHVzZSBzdGF0aWMgZmFjdG9yaWVzIGZpcnN0XG4gICAgICAgICAgICAgICAgbGV0IHRhZz0oc25vZGUgYXMgRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1ha2VDb0VsZW1lbnRGb3JUYWcodGFnLHRuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYERvIG5vdCBrbm93IGhvdyB0byBoYW5kbGUgJHt0bi5zbm9kZS5ub2RlVHlwZX1gKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBmYWN0b3J5IHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhpcyBjb252ZXJ0ZXIgaXMgY2FsbGVkIHRvIGNvbnZlcnQgXG4gICAgICogYSBub2RlIHdpdGggdGFnTmFtZSAndGFnJy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdGFnIFxuICAgICAqIEBwYXJhbSBmYWN0b3J5IFxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckZhY3RvcnkodGFnOnN0cmluZ3woKHRhZzpzdHJpbmcpPT5ib29sZWFuKSxmYWN0b3J5OkNvRWxlbWVudEZhY3RvcnkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YWc9PSdzdHJpbmcnKVxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZUZhY3Rvcmllcy5zZXQodGFnLGZhY3RvcnkpO1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgdGhpcy5tYXRjaGluZ0ZhY3Rvcmllcy5wdXNoKHttYXRjaDp0YWcsZmFjdG9yeTpmYWN0b3J5fSlcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaXNBc3NldChwYXNzOmFueSk6IHBhc3MgaXMgQXNzZXRJRCB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcGFzcyA9PSdvYmplY3QnICYmICgnbmFtZScgaW4gcGFzcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0IGEgQ09NTCBmYWN0b3J5LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbXBvcnRlZSBUaGUgZnVsbHkgcXVhbGlmaWVkIHBhdGggdG8gYSBDT01MIENvRUxlbWVudEZhY3RvcnkgKGUuZy4gYGNvbWwvZWxlbWVudC9Db0ZpZWxkc2ApIG9yIHRoZSBhc3NldElkIG9mIGEgQ09NTCBwYWdlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbXBvcnQoaW1wb3J0ZWU6c3RyaW5nfEFzc2V0SUQsdGFnRm9yQXNzZXQ/OnN0cmluZykgOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAodGhpcy5pc0Fzc2V0KGltcG9ydGVlKSkge1xuICAgICAgICAgICAgaWYgKCF0YWdGb3JBc3NldClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGltcG9ydCgke2ltcG9ydGVlfSkgLS0gbm8gdGFnIHNwZWNpZmllZGApO1xuICAgICAgICAgICAgbGV0IGZhY3Rvcnk9bmV3IEFzc2V0Q29FbGVtZW50RmFjdG9yeShpbXBvcnRlZSx0YWdGb3JBc3NldCk7XG4gICAgICAgICAgICBmYWN0b3J5LnJlZ2lzdGVyRmFjdG9yeSh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRNYXJrdXBGYWN0b3J5KGltcG9ydGVlKVxuICAgICAgICAgICAgICAgIC50aGVuKChmYWN0b3J5KT0+e1xuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5LnJlZ2lzdGVyRmFjdG9yeSh0aGlzKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIHBhcmVudCBvZiAndG4nIGZvciB3aGljaCAnbWF0Y2hlcicgcmV0dXJucyB0cnVlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0biBcbiAgICAgKiBAcGFyYW0gbWF0Y2hlciBcbiAgICAgKiBAcmV0dXJucyBUaGUgcGFyZW50IGZvdW5kIG9yIHVuZGVmaW5lZCBpZiBub24uXG4gICAgICovXG4gICAgcHVibGljIGZpbmRQYXJlbnQodG46VGFyZ2V0Tm9kZSxtYXRjaGVyOih0bjpUYXJnZXROb2RlKT0+Ym9vbGVhbikgOiBUYXJnZXROb2RlIHtcbiAgICAgICAgd2hpbGUodG4ucGFyZW50KSB7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcih0bi5wYXJlbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0bi5wYXJlbnQ7XG4gICAgICAgICAgICB0bj10bi5wYXJlbnRcbiAgICAgICAgfSAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmRzIHRoZSBwYXJlbnQgb2YgJ3RuJyBmb3Igd2hpY2ggJ21hdGNoZXInIHJldHVybnMgdHJ1ZS4gU2ltaWxhciB0b1xuICAgICAqIGZpbmRQYXJlbnQsIGV4Y2VwdCB0aGUgaXRlcmF0aW9uIHRoYXQgcmVzdWx0ZWQgaW4gdGhlIGNoaWxkICd0bicgaXMgYWxzbyByZXR1cm5lZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG4gXG4gICAgICogQHBhcmFtIG1hdGNoZXIgXG4gICAgICogQHJldHVybnMgRWl0aGVyIHtwYXJlbnQ6VGhlIHBhcmVudCBmb3VuZCxpdGVyYXRpb246VGhlIGl0ZXJhdGlvbiBvZiB0aGUgYnJhbmNoIHRoYXQgcmVzdWx0ZWQgaW4gdGhlIGNoaWxkIH0gb3IgdW5kZWZpbmVkIGlmIG5vIHBhcmVudFxuICAgICAqLyBcbiAgICBwdWJsaWMgZmluZFBhcmVudEFuZEl0ZXJhdGlvbih0bjpUYXJnZXROb2RlLG1hdGNoZXI6KHBhcmVudHRuOlRhcmdldE5vZGUsaXRlcmF0aW9uPzpudW1iZXIpPT5ib29sZWFuKSA6IHtwYXJlbnQ6VGFyZ2V0Tm9kZSxpdGVyYXRpb246bnVtYmVyfSB7XG4gICAgICAgIHdoaWxlKHRuLnBhcmVudCkge1xuICAgICAgICAgICAgbGV0IGl0ZXJhdGlvbj10bi5wYXJlbnQuZ2V0SXRlcmF0aW9uT2ZDaGlsZCh0bik7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcih0bi5wYXJlbnQsaXRlcmF0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDp0bi5wYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdGlvbjppdGVyYXRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0bj10bi5wYXJlbnQ7XG4gICAgICAgIH0gICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgZmlyc3QgY2hpbGQgb2YgJ3RuJyBmb3Igd2hpY2ggJ21hdGNoZXInIHJldHVybnMgdHJ1ZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG4gVGhlIHJvb3QgdG8gZmluZCBjaGlsZHJlbiBvZlxuICAgICAqIEBwYXJhbSBtYXRjaGVyIE1hdGNoaW5nIGZ1bmN0aW9uXG4gICAgICogQHJldHVybnMgVGhlIHBhcmVudCBmb3VuZCBvciB1bmRlZmluZWQgaWYgbm9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBmaW5kQ2hpbGQodG46VGFyZ2V0Tm9kZSxtYXRjaGVyOih0bjpUYXJnZXROb2RlKT0+Ym9vbGVhbikgOiBUYXJnZXROb2RlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZCh0bixtYXRjaGVyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbG9nMmRlcHRoKGRlcHRoOm51bWJlcixtc2c6c3RyaW5nKXtcbiAgICAgICAgbGV0IG09J3x8JztcbiAgICAgICAgZm9yKGxldCBpPTA7aTxkZXB0aDtpKyspICAgIHtcbiAgICAgICAgICAgIG0rPSctLSc7XG4gICAgICAgIH1cbiAgICAgICAgbSs9bXNnO1xuICAgICAgICBjb25zb2xlLmxvZyhtKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZmluZCh0bjpUYXJnZXROb2RlLG1hdGNoZXI6KHRuOlRhcmdldE5vZGUpPT5ib29sZWFuLGRlcHRoPzpudW1iZXIpIDogVGFyZ2V0Tm9kZSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGVwdGg9PSd1bmRlZmluZWQnKVxuICAgICAgICAgICAgZGVwdGg9MDtcbiAgICAgICAgLy90aGlzLmxvZzJkZXB0aChkZXB0aCwndG49Jyt0b1N0cih0bi5zbm9kZSkpO1xuICAgICAgICBpZiAobWF0Y2hlcih0bikpIHtcbiAgICAgICAgICAgIC8vdGhpcy5sb2cyZGVwdGgoZGVwdGgsJ0ZPVU5EJyk7XG4gICAgICAgICAgICByZXR1cm4gdG47XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpPTA7aTx0bi5jaGlsZHJlbi5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICBmb3IobGV0IGo9MDtqPHRuLmNoaWxkcmVuW2ldLmxlbmd0aDtqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgZj10aGlzLmZpbmQodG4uY2hpbGRyZW5baV1bal0sbWF0Y2hlcixkZXB0aCsxKTtcbiAgICAgICAgICAgICAgICBpZiAoZilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgXG4gICAgXG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHRkb2Mgbm9kZSwgY2hlY2tzIGlmIGl0IGhhcyBhICdkYXRhLWNvaWQnIHRhZyBhbmQgaWYgc28sIGZpbmRzIHRoZSBUYXJnZXROb2RlIHRoYXQgbWF0Y2hlcyBpdFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBub2RlIEEgdG5vZGVcbiAgICAgKiBAcmV0dXJucyBUaGUgZm91bmQgVGFyZ2V0Tm9kZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBmaW5kVGFyZ2V0Tm9kZUJ5VE5vZGUobm9kZTpOb2RlKSA6IFRhcmdldE5vZGUge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCB3c2lkPW5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWNvaWQnKTtcbiAgICAgICAgICAgIGlmICh3c2lkKVxuICAgICAgICAgICAgICAgIHJldHVybih0aGlzLmZpbmRDaGlsZCh0aGlzLnJvb3QsKHRuKT0+dG4uZ2V0SWQoKT09d3NpZCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzbm9kZSBnaXZlbiBhIHNlbGVjdG9yIGluIGVpdGhlciB0aGUgc291cmNlIG9yIHRhcmdldCBkb20uXG4gICAgICogXG4gICAgICogVGhpcyBzb3VyY2UgZG9jdW1lbnQgaXMgZmlyc3Qgc2VhcmNoZWQsIHRoZW4gaXRzIGltcG9ydGVkLlxuICAgICAqIFxuICAgICAqIElmIG5vdCBmb3VuZCBhbmQgdGhlICdjb3VsZEJlVGRvY1NlbGVjdG9yJyBpcyB0cnVlLCB3aWxsIHRoZW4gc2VhcmNoIHRoZSB0YXJnZXQgZG9jdW1lbnQgLklmIGZvdW5kLCBpdHMgd3NpZCBpcyB1c2VkIHRvIGZpbmRcbiAgICAgKiB0aGUgc25vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZG9tIG9yIHRkb20gc2VsZWN0b3IuXG4gICAgICogQHBhcmFtIGNvdWxkQmVUZG9jU2VsZWN0b3IgXG4gICAgICogQHJldHVybnMgVGhlIGZvdW5kIHNub2RlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFNub2RlRnJvbVNvclRzZWxlY3RvcihzZWxlY3RvcjpzdHJpbmcsY291bGRCZVRkb2NTZWxlY3Rvcj86Ym9vbGVhbikgOiBOb2RlIHtcbiAgICAgICAgbGV0IHNub2RlPXRoaXMuZG9jLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoc25vZGUpXG4gICAgICAgICAgICByZXR1cm4gc25vZGU7XG4gICAgICAgIGlmICh0aGlzLmltcG9ydGVkRG9jcykgIHtcbiAgICAgICAgICAgIHRoaXMuaW1wb3J0ZWREb2NzLmZvckVhY2goKGRvYyk9PntcbiAgICAgICAgICAgICAgICBpZiAoIXNub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNub2RlPWRvYy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChzbm9kZSlcbiAgICAgICAgICAgIHJldHVybiBzbm9kZTtcbiAgICAgICAgaWYgKGNvdWxkQmVUZG9jU2VsZWN0b3IpIHtcbiAgICAgICAgICAgIGxldCB0bm9kZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0bm9kZSkge1xuICAgICAgICAgICAgICAgIGxldCB0bj10aGlzLmZpbmRUYXJnZXROb2RlQnlUTm9kZSh0bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRuKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG4uc25vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdGFyZ2V0IG5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIG5vZGUgQW4gc25vZGUsdG5vZGUgb3Igc2VsZWN0b3Igb24gZWl0aGVyIHNvdXJjZSBkb2N1bWVudCBvciB0YXJnZXQgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgVGhlIGZpcnN0IGZvdW5kIFRhcmdldE5vZGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXNUYXJnZXROb2RlKG5vZGU6Tm9kZXxzdHJpbmd8VGFyZ2V0Tm9kZSkgOiB7c25vZGU6Tm9kZSx0bjpUYXJnZXROb2RlfSB7XG4gICAgICAgIFxuICAgICAgICBpZiAodHlwZW9mIG5vZGU9PSdzdHJpbmcnKSB7IFxuICAgICAgICAgICAgLy8gaXRzIGEgcXVlcnkgc2VsZWN0b3JcbiAgICAgICAgICAgIGxldCBuPXRoaXMuZ2V0U25vZGVGcm9tU29yVHNlbGVjdG9yKG5vZGUpOyAvLyB0cnkgZGlyZWN0bHkgb24gdGhlIHNvdXJjZSBkb2NcbiAgICAgICAgICAgIGlmICghbikge1xuICAgICAgICAgICAgICAgIC8vIGNvdWxkIGl0IGJlIGEgcXVlcnlTZWxlY3RvciBvbiB0aGUgdGFyZ2V0IGRvY3VtZW50P1xuICAgICAgICAgICAgICAgIGxldCBlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRuPXRoaXMuZmluZFRhcmdldE5vZGVCeVROb2RlKGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG4pIC8vIGl0IHdhcyBhIHRub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge3RuOnRuLHNub2RlOnRuLnNub2RlfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGZvdW5kIHRoZSBzbm9kZSwgZmluZCBpdHMgVGFyZ2V0Tm9kZVxuICAgICAgICAgICAgICAgIGxldCB0bj10aGlzLmZpbmQodGhpcy5yb290LHRuPT50bi5tYXRjaFNub2RlKHNub2RlMm1hdGNoPT5zbm9kZTJtYXRjaD09bikpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7dG46dG4sc25vZGU6bn07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNUYXJnZXROb2RlKG5vZGUpKSB7XG4gICAgICAgICAgICAvLyBpdHMgYSBUYXJnZXROb2RlXG4gICAgICAgICAgICByZXR1cm4ge3RuOm5vZGUsc25vZGU6bm9kZS5zbm9kZX07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpdHMgYSBOb2RlXG4gICAgICAgICAgICBsZXQgbj10aGlzLmZpbmRUYXJnZXROb2RlQnlUTm9kZShub2RlKTtcbiAgICAgICAgICAgIGlmIChuKSAvLyBpdCB3YXMgYSB0bm9kZVxuICAgICAgICAgICAgICAgIHJldHVybiB7dG46bixzbm9kZTpuLnNub2RlfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge3RuOm51bGwsc25vZGU6bnVsbH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhbiBzbm9kZSBnaXZlbiBhbiBzbm9kZSx0bm9kZSxUYXJnZXROb2RlIG9yIHNkb2MgLyB0ZG9jIHNlbGVjdG9yLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBub2RlIFxuICAgICAqIEByZXR1cm5zIFRoZSBmb3VuZCBzb3VyY2UgZG9jdW1lbnQgbm9kZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc25vZGVGcm9tQW55KG5vZGU6Tm9kZXxzdHJpbmd8VGFyZ2V0Tm9kZSkge1xuICAgICAgICBsZXQgc25vZGU6Tm9kZTtcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlPT0nc3RyaW5nJylcbiAgICAgICAgICAgIHNub2RlPXRoaXMuZ2V0U25vZGVGcm9tU29yVHNlbGVjdG9yKG5vZGUsdHJ1ZSk7XG4gICAgICAgIGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBzbm9kZT1ub2RlO1xuICAgICAgICAgICAgbGV0IHRuPXRoaXMuZmluZFRhcmdldE5vZGVCeVROb2RlKHNub2RlKTtcbiAgICAgICAgICAgIGlmICh0bilcbiAgICAgICAgICAgICAgICBzbm9kZT10bi5zbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNub2RlPW5vZGUuc25vZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc25vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZ2VuZXJhdGVkIHRhcmdldCBub2RlICh0bm9kZSkgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIuIE9wdGlvbmFsbHkgbGV0cyB0aGUgY2FsbGVyIHNwZWNpZnkgYSAnc3RhdGUgY2hhbmdlcidcbiAgICAgKiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHRvIGVmZmVjdCBjaGFuZ2VzIG9mIHN0YXRlIHRvIHRoZSB0bm9kZS4gVGhlIHN0YXRlIGNoYW5nZXIgaXMgc3RvcmVkIHNvIHRoYXRcbiAgICAgKiB0aGUgY2hhbmdlcyBhcmUgcmVjcmVhdGVkIG9uIGV2ZXJ5IHJlcGFpbnQgb2YgdGhlIHRub2RlLlxuICAgICAqICBcbiAgICAgKiBAcGFyYW0gbm9kZSBhbiBzbm9kZSwgVGFyZ2V0Tm9kZSBvciBzb3VyY2Ugb3IgdGFyZ2V0IGRvY3VtZW50IHNlbGVjdG9yLlxuICAgICAqIEBwYXJhbSBjaGFuZ2VpZCAoT3B0aW9uYWwgYnV0IHJlcXVpcmVkIGlmIGNoYW5nZXIgaXMgc3BlY2lmaWVkKSBhIHVuaXF1ZSBpZCBvZiB0aGUgY2hhbmdlIChJZiB0aGUgY2hhbmdlIGlzIHJlYWRkZWQgd2l0aCB0aGUgc2FtZSBpZCwgaXQgd2lsbCByZXBsYWNlIHRoZSBlYXJsaWVyIGNoYW5nZSlcbiAgICAgKiBAcGFyYW0gY2hhbmdlciAoT3B0aW9uYWwpIFRoZSBjYWxsYmFjayB0byBlZmZlY3QgY2hhbmdlcywgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB0bm9kZSBpcyBhdmFpbGFibGUuIElmIGN1cnJlbnRseSBhdmFpbGFibGUsIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseS4gVGhlIGNhbGxiYWNrIHdpbGwgYWxzbyBiZSBjYWxsZWQgb24gYW55IHN1YnNlcXVlbnQgcmVwYWludCBvZiB0aGUgdG5vZGUuXG4gICAgICovXG4gICAgcHVibGljICQobm9kZTpOb2RlfHN0cmluZ3xUYXJnZXROb2RlLGNoYW5nZWlkPzpzdHJpbmcsY2hhbmdlcj86KEVsZW1lbnQpPT5hbnkpIDogRWxlbWVudCB7XG4gICAgICAgIGlmICghY2hhbmdlciAmJiAhY2hhbmdlaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHt0bixzbm9kZX09dGhpcy5hc1RhcmdldE5vZGUobm9kZSk7XG4gICAgICAgICAgICBpZiAodG4gJiYgdG4udG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiB0bi50bm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjaGFuZ2VpZC5sZW5ndGg9PTApXG4gICAgICAgICAgICAgICAgY2hhbmdlaWQ9dW5kZWZpbmVkO1xuICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGUgc25vZGUsIHNvIHdlIGNhbiBhdHRhY2gvcmVtb3ZlIHRoZSBjaGFuZ2UgdG8gaXQgKFROIG1heSBub3QgZXhpc3QpXG4gICAgICAgICAgICBsZXQgc25vZGU6Tm9kZT10aGlzLnNub2RlRnJvbUFueShub2RlKTtcblxuICAgICAgICAgICAgaWYgKHNub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNoYW5nZWlkKSAvLyBwZXJzaXN0IG9yIGRlbGV0ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlQ2hhbmdlcihjaGFuZ2VpZCxzbm9kZSxjaGFuZ2VyKTsgLy8gYWRkLCBvciBkZWxldGUgaWYgY2hhbmdlciBpcyBudWxsIG9yIGNoYW5nZWlkIGlzIGVtcHR5IChzaW5nbGUgc2hvdClcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBydW4gbm93XG4gICAgICAgICAgICAgICAgICAgIGxldCB0bj10aGlzLmZpbmQodGhpcy5yb290LHRuPT50bi5tYXRjaFNub2RlKHNub2RlMm1hdGNoPT5zbm9kZTJtYXRjaD09c25vZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRuICYmIHRuLnRub2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlcih0bi50bm9kZSk7IFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghY2hhbmdlaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlcnNpc3Qgb25jZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9uY2VpZD0nQE9OQ0UnK01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZUNoYW5nZXIob25jZWlkLHNub2RlLGNoYW5nZXIpOyAvLyBhZGQgd2l0aCBhbiBpZCB0aGF0IHdpbGwgY2F1c2UgaXQgdG8gYmUgcmVtb3ZlZCBvbiBmaXJzdCBjYWxsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgc3RhdGUgY2hhbmdlIGZ1bmN0aW9uLCB3aGljaCBjYW4gbWFrZSBjaGFuZ2VzIHRvIHRoZSBhdHRyaWJ1dGVzIGV0YyBvZiBhIHRub2RlIHRoYXQgYXJlIGRpZmZlcmVudCBmcm9tIHRob3NlXG4gICAgICogY29waWVkIGZyb20gdGhlIHNub2RlLiBUaGUgY2hhbmdlciBjYWxsYmFjayBpcyBjYWxsZWQgb24gZXZlcnkgcmVuZGVyIG9mIHRoZSB0bm9kZSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgYWZmZWN0ZWRcbiAgICAgKiBvbmNlIGFyZSBub3QgbG9zdCBkdWUgdG8gcmVnZW5lcmF0aW9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpZCBBIHVuaXF1ZSBpZCBvZiB0aGUgc3RhdGUgY2hhbmdlLlxuICAgICAqIEBwYXJhbSBzbm9kZSBUaGUgc25vZGUgdG8gYWRkL3JlbW92ZSB0aGUgY2hhbmdlciBmb3JcbiAgICAgKiBAcGFyYW0gY2hhbmdlciBUaGUgY2hhbmdlciBjYWxsYmFjayB0byBhZGQgb3IgdW5kZWZpbmVkIHRvIHJlbW92ZSBleGlzdGluZyBjaGFuZ2Vycy4gVGhpcyB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSB0bm9kZSBFTGVtZW50IGFuZCBjYW4gbWFrZSBhbnkgY2hhbmdlcyB0byBpdC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGVDaGFuZ2VyKGlkOnN0cmluZyxzbm9kZTpOb2RlLGNoYW5nZXI/OlN0YXRlQ2hhbmdlcikge1xuICAgICAgICBpZiAoY2hhbmdlcikge1xuICAgICAgICAgICAgbGV0IHN0YXRlY2hhbmdlcnM9dGhpcy5nZXRTdGF0ZUNoYW5nZXJzKHNub2RlLHRydWUpO1xuICAgICAgICAgICAgc3RhdGVjaGFuZ2Vyc1tpZF09Y2hhbmdlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRlbGV0aW5nICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHN0YXRlY2hhbmdlcnM9dGhpcy5nZXRTdGF0ZUNoYW5nZXJzKHNub2RlKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZWNoYW5nZXJzKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHN0YXRlY2hhbmdlcnNbaWRdO1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhzdGF0ZWNoYW5nZXJzKS5sZW5ndGg9PTApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU3RhdGVDaGFuZ2Vycyhzbm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHNlbGVjdG9yIG9yIGVsZW1lbnQgaW4gZWl0aGVyIHRoZSBzb3VyY2Ugb3IgdGFyZ2V0IGRvY3VtZW50LCBmaW5kcyB0aGUgYXNzb2NpYXRlZCBDb0VsZW1lbnQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHNlbGVjdG9yT3JOb2RlIGFuIHNub2RlLHRub2RlLCBUYXJnZXROb2RlIG9yIHNvdXJjZSBvciB0YXJnZXQgZG9jdW1lbnQgc2VsZWN0b3IuXG4gICAgICogQHJldHVybnMgVGhlIENvRWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIFxuICAgICAqL1xuICAgIHB1YmxpYyAgZ2V0KHNlbGVjdG9yT3JOb2RlOk5vZGV8c3RyaW5nfFRhcmdldE5vZGUsZ2V0ZnVuYz86R2V0KSA6IENvRWxlbWVudDxUPiB7XG4gICAgICAgIGNvbnN0IHt0bixzbm9kZX09dGhpcy5hc1RhcmdldE5vZGUoc2VsZWN0b3JPck5vZGUpO1xuICAgICAgICBpZiAodG4pIHtcbiAgICAgICAgICAgIGlmIChnZXRmdW5jKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRuLmNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICBnZXRmdW5jKHRuLmNvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzbm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgYXMgYSBwZW5kaW5nIGdldFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEdldHMoc25vZGUsZ2V0ZnVuYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRuLmNvbXBvbmVudCBhcyBDb0VsZW1lbnQ8VD47XG4gICAgICAgIH0gZWxzZSBpZiAoZ2V0ZnVuYyAmJiBzbm9kZSkge1xuICAgICAgICAgICAgLy8gYWRkIGFzIGEgcGVuZGluZyBnZXRcbiAgICAgICAgICAgIHRoaXMuc2V0R2V0cyhzbm9kZSxnZXRmdW5jKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuXHQgKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGdpdmVuIG5vZGUuXG5cdCAqIFxuXHQgKiBAcGFyYW0gbm9kZSAgICAgIFRoZSBub2RlIG9yIGl0cyBzZWxlY3RvclxuXHQgKiBAcGFyYW0gZXZlbnRuYW1lIFRoZSBldmVudCBuYW1lLCBlLmcuICdjbGljaycgb3IgJ215Y3VzdG9tZXZlbnQnXG5cdCAqIEBwYXJhbSBoYW5kbGVyICBUaGUgY2FsbGJhY2suXG5cdCAqL1xuXHQvL3B1YmxpYyBhZGRFdmVudExpc3RlbmVyKG5vZGU6Tm9kZXxzdHJpbmd8VGFyZ2V0Tm9kZSxldmVudG5hbWU6c3RyaW5nLGhhbmRsZXI6KGV2ZW50OkV2ZW50KT0+YW55KSB7XG4gICAgLy8gICAgdGhpcy5hc1RhcmdldE5vZGUobm9kZSkuYWRkRXZlbnRMaXN0ZW5lcihldmVudG5hbWUsaGFuZGxlcik7XG4gICAgLy99XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFuIGV2ZW50aGFuZGxlciBhZGRlZCB2aWEgYWRkRXZlbnRMaXN0ZW5lci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZXZlbnRuYW1lIFxuICAgICAqIEBwYXJhbSBoYW5kbGVyIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuXHQvL3B1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKG5vZGU6Tm9kZXxzdHJpbmd8VGFyZ2V0Tm9kZSxldmVudG5hbWU6c3RyaW5nLGhhbmRsZXI6KGV2ZW50OkV2ZW50KT0+YW55KSB7XG4gICAgLy8gICAgdGhpcy5hc1RhcmdldE5vZGUobm9kZSkucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudG5hbWUsaGFuZGxlcik7XG4gICAgLy99XG5cblxuICAgIC8qKlxuICAgICAqIFJlYnVpbGQgdGhlIGdpdmVuIG5vZGUgYXMgaWYgZnJvbSBuZXcuIFRoaXMgaXMgYSBtb3JlIGV4cGVuc2l2ZSBvcGVyYXRpb24gdGhhbiBhbiBpbnZhbGlkYXRlXG4gICAgICogYXMgdGhlIG5vZGUncyBjb21wb25lbnQgYW5kIGNoaWxkcmVuIGFyZSByZWJ1aWx0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzbm9kZSBUaGUgc25vZGUsIGl0cyBzZG9tIHF1ZXJ5IHNlbGVjdG9yLCBvciB0aGUgdGFyZ2V0IG5vZGUgdG8gcmVidWlsZC4gSWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGVoIHJvb3QgVGFyZ2V0Tm9kZVxuICAgICAqXG4gICAgcHVibGljICByZWJ1aWxkKHNub2RlPzpOb2RlfHN0cmluZ3xUYXJnZXROb2RlKSB7XG4gICAgICAgIGxldCB0bjpUYXJnZXROb2RlPShzbm9kZSkgPyB0aGlzLmFzVGFyZ2V0Tm9kZShzbm9kZSk6dGhpcy5yb290O1xuICAgICAgICBpZiAoIXRuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHJlYnVpbGQoKSAtIGNhbnQgZmluZCAke3RvU3RyKHNub2RlKX1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYnVpbGRJbnQodG4pO1xuICAgIH0qL1xuXG4gICAgcHJvdGVjdGVkIHJlYnVpbGRJbnRDbyh0bjpUYXJnZXROb2RlLGNvOkNvRWxlbWVudCxwYXRjaDpQYXRjaCkge1xuICAgICAgICB0bi5jb21wb25lbnQ9Y287XG4gICAgICAgIGlmIChjby5nZXRUTigpIT10biAmJiB0bi5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRuLnBhcmVudC5yZXBsYWNlQ2hpbGQodG4sY28uZ2V0VE4oKSk7XG4gICAgICAgICAgICB0bj1jby5nZXRUTigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUludCh0bixwYXRjaCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlYnVpbGRJbnQodG46VGFyZ2V0Tm9kZSkge1xuICAgICAgICBsZXQgcGF0Y2g6UGF0Y2g9dG4uZ2V0UGF0Y2goKTsgLy8gZ2V0IHRoZSBwYXRjaCBCRUZPUkUgd2UgcmVzZXQgLSBvdGhlcndpc2UgcG9zaXRpb24gaW5mbyBtYXkgYmUgbG9zdFxuICAgICAgICB0bi5yZXNldCgpOyAvLyByZXNldHMgdGhlIHRuIHRvIHByZXN0aW5lXG4gICAgICAgIGxldCBjbz10aGlzLm1ha2VDb0VsZW1lbnQodG4pO1xuICAgICAgICBpZiAoaXNDb0VsZW1lbnQoY28pKSB7XG4gICAgICAgICAgICB0aGlzLnJlYnVpbGRJbnRDbyh0bixjbyxwYXRjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjby5cbiAgICAgICAgICAgIHRoZW4oKGNvKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMucmVidWlsZEludENvKHRuLGNvLHBhdGNoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW52YWxpZGF0ZSh0b2ludmFsaWRhdGU/Ok5vZGV8c3RyaW5nfFRhcmdldE5vZGUsZm9yZ2V0Pzpib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHt0bixzbm9kZX09KHRvaW52YWxpZGF0ZSkgPyB0aGlzLmFzVGFyZ2V0Tm9kZSh0b2ludmFsaWRhdGUpOnt0bjp0aGlzLnJvb3Qsc25vZGU6dGhpcy5yb290LnNub2RlfTtcbiAgICAgICAgaWYgKCF0bikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkYXRlKCkgLSBjYW50IGZpbmQgJHt0b1N0cih0b2ludmFsaWRhdGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUludCh0bix1bmRlZmluZWQsZm9yZ2V0KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaXNOb25FbGVtZW50R2VuZXJhdGluZyh0bjpUYXJnZXROb2RlKSA6IGJvb2xlYW4ge1xuICAgICAgICAvLyBoYWNrXG4gICAgICAgIGlmICh0bi5zbm9kZS5ub2RlVHlwZT09Tm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgIGxldCB0YWc9KHRuLnNub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGlmICh0YWc9PSdodG1sJ3x8dGFnPT0nYm9keScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaW52YWxpZGF0ZWQ6TWFwPFRhcmdldE5vZGUsYm9vbGVhbj49bmV3IE1hcCgpO1xuXG4gICAgcHJvdGVjdGVkIGludmFsaWRhdGVJbnQodG46VGFyZ2V0Tm9kZSxwYXRjaD86UGF0Y2gsZm9yZ2V0Pzpib29sZWFuKSB7XG4gICAgICAgIGlmIChmb3JnZXQgJiYgdG4uY29tcG9uZW50ICYmIHRuLmNvbXBvbmVudC5mb3JnZXQpIHtcbiAgICAgICAgICAgIHRuLmNvbXBvbmVudC5mb3JnZXQoKTtcbiAgICAgICAgICAgIHJldHVybjsgLy8gZG8gTk9UIGNhbGwgcmVuZGVyKCkgYmVsb3cgLSBhcyB0aGUgZm9yZ2V0KCkgc2hvdWxkIGhhdmUgY2FsbGVkIGl0LCBvciB3aWxsIGNhbGwgaXQgd2hlbiBpdCByZWJ1aWxkcyBzdGF0ZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW52YWxpZGF0ZWQuaGFzKHRuKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZWQuc2V0KHRuLGZvcmdldCk7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCk9PntcbiAgICAgICAgICAgICAgICBsZXQgZm9yZ2V0PXRoaXMuaW52YWxpZGF0ZWQuZ2V0KHRuKTtcbiAgICAgICAgICAgICAgICB0aGlzLmludmFsaWRhdGVkLmRlbGV0ZSh0bik7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhgLS0tLS0tLXJlcGFpbnRpbmcgZnJvbSAke3RvU3RyKHRuKX0tLS0tLS1gKTtcbiAgICAgICAgICAgICAgICAvL2lmICgnd3MtcGFnZS1jb250YWluZXIudS1hcHAtdmlld2VyLWNvbnRhaW5lci4nPT10b1N0cih0bikpXG4gICAgICAgICAgICAgICAgLy8gICAgY29uc29sZS5sb2coJy0tLS0tLS0taGVyZS0tLS0tLS0tLScpO1xuICAgICAgICAgICAgICAgIC8vIG5vdGUgd2UgY2Fubm90IHJlbmRlciBpZlxuICAgICAgICAgICAgICAgIC8vIDEuIHRoZXJlIGlzIG5vIFBhdGNoIGF2YWlsYWJsZSAoQ2FudCBwYXRjaCBiYWNrIHRvIHRoZSBwYXJlbnQpXG4gICAgICAgICAgICAgICAgLy8gMi4gdGhlIGNvZWxlbWVudCBkb2VzIG5vdCBnZW5lcmF0ZSBpdHMgb3duIGVsZW1lbnQgKGl0cyBjaGlsZHJlbiB3aWxsIHdyaXRlIHRvIGEgcGFyZW50IGVsZW1lbnQgdGhhdCBkb2VzIG5vdCBleGlzdClcbiAgICAgICAgICAgICAgICBsZXQgb3JpZ1ROPXRuO1xuICAgICAgICAgICAgICAgIGlmICghcGF0Y2gpXG4gICAgICAgICAgICAgICAgICAgIHBhdGNoPXRuLmdldFBhdGNoKCk7XG4gICAgICAgICAgICAgICAgd2hpbGUodG4ucGFyZW50ICYmICghcGF0Y2ggfHwgdGhpcy5pc05vbkVsZW1lbnRHZW5lcmF0aW5nKHRuKSkpICAge1xuICAgICAgICAgICAgICAgICAgICB0bj10bi5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHBhdGNoPXRuLmdldFBhdGNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChwYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGAgICAgIChhY3R1YWw9ICR7dG9TdHIodG4pfSlgKVxuICAgICAgICAgICAgICAgICAgICBsZXQgcm09SW1wbGVtZW50YXRpb25zLmNyZWF0ZVJlbmRlcihwYXRjaCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZShybSx0bik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBpbnZhbGlkYXRlSW50KCkgLSB1bmFibGUgdG8gcmVwYWludCAke3RvU3RyKG9yaWdUTil9IGJlY2F1c2UgbmVpdGhlciBpdCBub3IgYW4gYW5jZXN0b3IgaGFzIGEgcG9zaXRpb24uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZWQuZGVsZXRlKHRuKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gY2F0Y2goeCkge1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlZC5kZWxldGUodG4pO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxuICAgIHByb3RlY3RlZCBkZXNlcmlhbGl6ZSh2YWw6c3RyaW5nKSA6IGFueSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09J3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICh2YWwuaW5kZXhPZigneycpPj0wKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsLnJlcGxhY2UoLycvZywnXCInKSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIHNvdXJjZSBUYXJnZXROb2RlIHRoYXQgZ2VuZXJhdGVkIHRoZSB0YXJnZXQgaWQgb3Igbm9kZSAnaWRub2RlJ1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBub2RlSWRPclNlbGVjdG9yIFRoZSB0YXJnZXQgbm9kZSwgb3IgaXRzICdkYXRhLWNvaWQnIGF0dHJpYnV0ZSBpZCwgb3IgYSBzZWxlY3Rvci5cbiAgICAgKiBAcmV0dXJucyBUaGUgZm91bmQgc291cmNlIHRhcmdldCBub2RlIG9yIG51bGwgaWYgbm9uIGZvdW5kLiBUbyBmZXRjaCB0aGUgbm9kZSwgdXNlIGB0bi5zbm9kZWBcbiAgICAgKlxuICAgIHB1YmxpYyBnZXRTb3VyY2VOb2RlKG5vZGVJZE9yU2VsZWN0b3I6Tm9kZXxzdHJpbmcpIDogVGFyZ2V0Tm9kZSB7XG4gICAgICAgIGxldCBpZDpzdHJpbmc7XG4gICAgICAgIGlmIChub2RlSWRPclNlbGVjdG9yICYmICh0eXBlb2Ygbm9kZUlkT3JTZWxlY3RvciE9J3N0cmluZycpKSB7XG4gICAgICAgICAgICBpZD0obm9kZUlkT3JTZWxlY3RvciBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29pZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaXMgaXQgYW4gaWQgKG51bWJlcikgP1xuICAgICAgICAgICAgbGV0IGlzbnVtID0gL15cXGQrJC8udGVzdChpZCk7XG4gICAgICAgICAgICBpZiAoaXNudW0pIHtcbiAgICAgICAgICAgICAgICBpZD1ub2RlSWRPclNlbGVjdG9yIGFzIHN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgeyAvLyBpdHMgYSBzZWxlY3RvclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFNvdXJjZU5vZGUodGhpcy4kKG5vZGVJZE9yU2VsZWN0b3IpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4odGhpcy5maW5kQ2hpbGQodGhpcy5yb290LCh0bik9PnRuLmdldElkKCk9PWlkKSlcbiAgICB9ICovXG5cbiAgICBcbiAgICBcblxuICAgIHByb3RlY3RlZCBhdHRhY2hDb250cm9sKHBhcmVudDpOb2RlfHN0cmluZ3xUYXJnZXROb2RlLGNvbnRyb2w6Q29FbGVtZW50KSAge1xuICAgICAgICBjb25zdCB7dG4sc25vZGV9PXRoaXMuYXNUYXJnZXROb2RlKHBhcmVudCk7XG4gICAgICAgIGlmICghdG4pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5hYmxlIHRvIGF0dGFjaCBjb250cm9sIHRvIG5vZGUgJHt0b1N0cihwYXJlbnQpfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGN2dCA9IGNvbnRyb2wuZ2V0Q3Z0KCk7XG4gICAgICAgICAgICBpZiAoaXNBdHRhY2hhYmxlKGN2dCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKGN2dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRuLmF0dGFjaENvbnRyb2woY29udHJvbCk7XG4gICAgICAgICAgICB0aGlzLmludmFsaWRhdGVJbnQodG4pO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gYXNzZXQncyBjb250cm9sIHRvIHRoZSB0YXJnZXQgbm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gIHBhcmVudCBUaGUgdGFyZ2V0IGRvbSBub2RlIG9yIHF1ZXJ5IHNlbGVjdG9yIHdob3NlIGNoaWxkIHRoZSBuZXcgY29udHJvbCB3aWxsIGJlY29tZS5cbiAgICAgKiBAcGFyYW0gIHRvQXR0YWNoIFRoZSBjb250cm9sIG9yIGFzc2V0IHRvIGF0dGFjaC5cbiAgICAgKiBAcGFyYW0gIHBhcmFtZXRlcnMgKE9wdGlvbmFsKSwgaWYgJ3RvQXR0YWNoJyB3YXMgYW4gYXNzZXQsIHRoZW4gb3B0aW9uYWwgcGFyYW1ldGVycyB0byBwYXNzIHRvIHRlIGFzc2V0LiBUaGlzIG9iamVjdCBpcyBhdmFpbGFibGUgdG8gdGhlIGFzc2V0IGFzICd0aGlzLnBhcmFtZXRlcnMnXG4gICAgICogXG4gICAgICogQHJldHVybiBBIHByb21pc2Ugd2hlbiB0aGUgY29udHJvbCBpcyBsb2FkZWQgKGlmIGl0IHdhcyBhbiBhc3NldCkgYXR0YWNoZWQuXG4gICAgICovXG4gICAgIHB1YmxpYyBhdHRhY2gocGFyZW50Ok5vZGV8c3RyaW5nLHRvQXR0YWNoOkFzc2V0SUR8c3RyaW5nfENvRWxlbWVudCxwYXJhbWV0ZXJzPzp7W2tleTpzdHJpbmddOmFueX0pIDogUHJvbWlzZTxDb0VsZW1lbnQ+IHtcbiAgICAgICAgaWYgKGlzQ29FbGVtZW50KHRvQXR0YWNoKSkge1xuICAgICAgICAgICAgLy8gaXRzIGEgY29udHJvbFxuICAgICAgICAgICAgdGhpcy5hdHRhY2hDb250cm9sKHBhcmVudCx0b0F0dGFjaCk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRvQXR0YWNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhc3NldD1JbXBsZW1lbnRhdGlvbnMuZ2V0QXNzZXRGYWN0b3J5KClcbiAgICAgICAgICAgICAgICAgICAgLmdldCh0b0F0dGFjaCk7XG5cbiAgICAgICAgaWYgKCFpc0NvRWxlbWVudEFzc2V0KGFzc2V0KSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0YWNoOiAke3N0cmluZ2lmeUFzc2V0SUQodG9BdHRhY2gpfSBpcyBub3QgYSBDb0VsZW1lbnRBc3NldGApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgYXNzZXRcbiAgICAgICAgICAgIC5hc0NvRWxlbWVudCh1bmRlZmluZWQsKGN2dCk9PntcbiAgICAgICAgICAgICAgICBjdnQuYWRkT25UaGlzQ3JlYXRlZExpc3RlbmVyKChUaGlzOlRoaXMpPT57XG4gICAgICAgICAgICAgICAgICAgIFRoaXMucGFyYW1ldGVycz1wYXJhbWV0ZXJzO1xuXHRcdFx0XHR9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoY29FbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaENvbnRyb2wocGFyZW50LGNvRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvRWxlbWVudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBUYXJnZXROb2RlIGFuZCBjb250cm9sIHRoYXQgd2FzIGF0dGFjaGVkIGF0IHRvQ2hlY2sgXG4gICAgICogXG4gICAgICogQHBhcmFtIHRvQ2hlY2sgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIGZpbmRBdHRhY2hlZCh0b0NoZWNrOnN0cmluZ3xDb0VsZW1lbnQpIDoge3RhcmdldG5vZGU6VGFyZ2V0Tm9kZSxjb250cm9sOkNvRWxlbWVudH0ge1xuICAgICAgICBsZXQgcGFyZW50OlRhcmdldE5vZGU7XG4gICAgICAgIGxldCBjb250cm9sOkNvRWxlbWVudDtcbiAgICAgICAgaWYgKGlzQ29FbGVtZW50KHRvQ2hlY2spKSB7XG4gICAgICAgICAgICBwYXJlbnQ9dGhpcy5maW5kKHRoaXMucm9vdCwodG4pPT50bi5pc0F0dGFjaGVkKGNvbnRyb2w9dG9DaGVjaykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHNub2RlPXRoaXMuZG9jLnF1ZXJ5U2VsZWN0b3IodG9DaGVjayk7XG4gICAgICAgICAgICBpZiAoc25vZGUpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ9dGhpcy5maW5kKHRoaXMucm9vdCx0bj0+dG4ubWF0Y2hTbm9kZShzbm9kZTJtYXRjaD0+c25vZGUybWF0Y2g9PXNub2RlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt0YXJnZXRub2RlOnBhcmVudCxjb250cm9sOmNvbnRyb2x9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGFjaGVzIGEgcHJldmlvdXNseSBhdHRhY2hlZCgpIGNvbnRyb2wuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRvRGV0YWNoIFRoZSBjb250cm9sIHRoYXQgd2FzIGF0dGFjaGVkLCBvciB0aGUgdGFyZ2V0IG5vZGUgb3IgcXVlcnkgc2VsZWN0b3Igb2YgdGhlIHBhcmVudCBmcm9tIHdoaWNoIHRvIGF0dGFjaCBhbGwgcHJldmlvdXNseSBhdHRhY2hlZCBjb250cm9sc1xuICAgICAqL1xuICAgIHB1YmxpYyBkZXRhY2godG9EZXRhY2g6c3RyaW5nfENvRWxlbWVudCkgOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCB7dGFyZ2V0bm9kZTogcGFyZW50LGNvbnRyb2x9PXRoaXMuZmluZEF0dGFjaGVkKHRvRGV0YWNoKTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgLy8gZmluZCB0aGUgYXR0YWNoZWRcbiAgICAgICAgICAgIGlmIChjb250cm9sKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50LnJlbW92ZUF0dGFjaGVkQ29udHJvbChjb250cm9sKTtcbiAgICAgICAgICAgICAgICBsZXQgY3Z0PWNvbnRyb2wuZ2V0Q3Z0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXR0YWNoYWJsZShjdnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoY3Z0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVBbGxBdHRhY2hlZENvbnRyb2xzKChjb250cm9sKT0+e1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3Z0PWNvbnRyb2wuZ2V0Q3Z0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0F0dGFjaGFibGUoY3Z0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChjdnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuaW52YWxpZGF0ZUludChwYXJlbnQpKTtcbiAgICAgICAgfVxuICAgIH0gXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBpZCBvZiB0aGUgc291cmNlIHRhcmdldG5vZGUgdG8gdGhlIHJlbmRlcmVkIG9iamVjdC4gU2hvdWxkIGJlIGNhbGxlZCBcbiAgICAgKiBwcmlvciB0byBybS5vcGVuRW5kKCkuXG4gICAgICogICAgICAqIDxwPlxuICAgICAqIEBwYXJhbSBybSBcbiAgICAgKiBAcGFyYW0gdG4gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIGVuY29kZVdTRShybTpSZW5kZXIsdG46VGFyZ2V0Tm9kZSkgOiBSZW5kZXIgIHtcbiAgICAgICAgLy9ybS5hdHRyKCdkYXRhLWNvaWQnLHRuLmdldElkKCkpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJtO1xuICAgIH1cblxuXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGhlIGNoaWxkcmVuIG9mIG5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJtIFxuICAgICAqIEBwYXJhbSBwYXJlbnR0biBUaGUgcGFyZW50IHRyZWVub2RlIHdob3NlIHNub2RlJ3MgY2hpbGRyZW4gYXJlIHRvIGJlIHJlbmRlcmVkIFxuICAgICAqIEBwYXJhbSBpdGVyYXRpb24gdGhlIHJlcGVhdCBpdGVyYXRpb24gKDAgZm9yIGZpcnN0IGFuZCBpbmNyZW1lbnRpbmcgZm9yIGVhY2ggc3VjY2Vzc2l2ZSByZXBlYXQpXG4gICAgICovXG4gICAgIHB1YmxpYyByZW5kZXJDaGlsZHJlbihybTogUmVuZGVyLHBhcmVudHRuOlRhcmdldE5vZGUsaXRlcmF0aW9uOm51bWJlcj0wKSB7XG5cbiAgICAgICAgLy8gcmVuZGVyIGFueSBhdHRhY2hlZCAodGVtcCkgY29tcG9uZW50cyBvbmx5IG9uIHRoZSBmaXJzdCBpdGVyYXRpb246XG4gICAgICAgIGlmIChpdGVyYXRpb249PTApXG4gICAgICAgICAgICBwYXJlbnR0bi5yZW5kZXJBdHRhY2hlZChybSx0aGlzKTtcblxuICAgICAgICBsZXQgY2hpbGROb2Rlcz1wYXJlbnR0bi5zb3VyY2VDaGlsZE5vZGVzKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNuPWNoaWxkTm9kZXNbaV07XG5cbiAgICAgICAgICAgIGlmIChjbi5ub2RlVHlwZT09Tm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICBsZXQgY2luZGV4PXBhcmVudHRuLmZpbmRDaGlsZEZvck5vZGUoY24saXRlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICBsZXQgY3RuOlRhcmdldE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGNpbmRleD09LTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IG9uZVxuXG4gICAgICAgICAgICAgICAgICAgIGN0bj1wYXJlbnR0bi5tYWtlVGFyZ2V0Tm9kZShjbix0aGlzKTsvLyBuZXcgVGFyZ2V0Tm9kZShjbix1bmRlZmluZWQscGFyZW50dG4pO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnR0bi5hZGRDaGlsZChjdG4saXRlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdG49cGFyZW50dG4uY2hpbGRyZW5baXRlcmF0aW9uXVtjaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICBjdG4ubWFya2VkPVROUy5SRVVTRUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHBhcmVudCBoZXJpYXJjaHkgbXVzdCBiZSBjb21wbGV0ZSBzbyBkdXJpbmcgcmVuZGVyIGEgd3NlbGVtbnQgY2FuIHRyYXZlcnNlIHRvIHRvcCAtIGUuZy4gdG8gYWRkIGNvbnRyb2xzLlxuICAgICAgICAgICAgICAgIGN0bi5nZXRPd25lcih0aGlzKS5yZW5kZXJOb2RlKHJtLGN0bik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjbi5ub2RlVHlwZT09Tm9kZS5URVhUX05PREUpIHtcbiAgICAgICAgICAgICAgICBybS50ZXh0KHRoaXMuZXhwYW5kU3RyaW5nKGNuLm5vZGVWYWx1ZSxwYXJlbnR0bikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5yZW5kZXJDb21tZW50cyAmJiBjbi5ub2RlVHlwZT09Tm9kZS5DT01NRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudD1jbi50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJtLnVuc2FmZUh0bWwoYDwhLS0ke2NvbnRlbnR9LS0+YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcHJvdGVjdGVkIGVsZW1lblJlbmRlckxpc3RlbmVyczpNYXA8c3RyaW5nLCgodGFnOnN0cmluZyxlOkNvRWxlbWVudCk9PnZvaWQpW10+O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBjYWxsZWQganVzdCBiZWZvcmUgYW55IGVsZW1lbnQgd2hvc2UgdGFnIG1hdGNoZXMgYW55IGVudHJ5IGluICd0YWdzJyByZW5kZXJzIHRoZSBzb3VyY2UgdHJlZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdGFncyBcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgXG4gICAgICovXG4gICAgcHVibGljIGFkZE9uRWxlbWVudFJlbmRlckxpc3RlbmVyKHRhZ3M6c3RyaW5nW10sbGlzdGVuZXI6KHRhZzpzdHJpbmcsZTpDb0VsZW1lbnQpPT52b2lkKSB7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW5SZW5kZXJMaXN0ZW5lcnMpXG4gICAgICAgICAgICB0aGlzLmVsZW1lblJlbmRlckxpc3RlbmVycz1uZXcgTWFwKCk7XG4gICAgICAgIFxuICAgICAgICBmb3IobGV0IHRhZyBvZiB0YWdzKSB7XG4gICAgICAgICAgICBsZXQgbmVycz10aGlzLmVsZW1lblJlbmRlckxpc3RlbmVycy5nZXQodGFnKTtcbiAgICAgICAgICAgIGlmICghbmVycykgIHtcbiAgICAgICAgICAgICAgICBuZXJzPVtdO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVuUmVuZGVyTGlzdGVuZXJzLnNldCh0YWcsbmVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgYWRkZWQgbGlzdGVuZXIgZnJvbSB0aGUgdGFncyBhZ2FpbnN0IHdoaWNoIGl0IHdhcyBhZGRlZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdGFncyB3cy1lbGVtZW50IHRvIHRyaWdnZXJ0aGUgbGlzdGVuZXIgb3IgJycgZm9yIGFsbFxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlT25FbGVtZW50UmVuZGVyTGlzdGVuZXIodGFnczpzdHJpbmdbXSxsaXN0ZW5lcjoodGFnOnN0cmluZyxlOkNvRWxlbWVudCk9PnZvaWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lblJlbmRlckxpc3RlbmVycylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGZvcihsZXQgdGFnIG9mIHRhZ3MpIHtcbiAgICAgICAgICAgIGxldCBuZXJzPXRoaXMuZWxlbWVuUmVuZGVyTGlzdGVuZXJzLmdldCh0YWcpO1xuICAgICAgICAgICAgaWYgKG5lcnMgJiYgbmVycy5sZW5ndGg+MCkgIHtcbiAgICAgICAgICAgICAgICBsZXQgbj1uZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIGlmIChuIT0tMSkge1xuICAgICAgICAgICAgICAgICAgICBuZXJzLnNwbGljZShuLDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY29tYmluZShhOigodGFnOnN0cmluZyxlOkNvRWxlbWVudCk9PnZvaWQpW10sYjooKHRhZzpzdHJpbmcsZTpDb0VsZW1lbnQpPT52b2lkKVtdKSA6ICgodGFnOnN0cmluZyxlOkNvRWxlbWVudCk9PnZvaWQpW10ge1xuICAgICAgICBpZiAoIWEpXG4gICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgaWYgKCFiKVxuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIHJldHVybiBhLmNvbmNhdChiKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgdHJpZ2dlckxpc3RlbmVycyhub2RlOk5vZGUsZTpDb0VsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lblJlbmRlckxpc3RlbmVycyB8fCAhdGhpcy5lbGVtZW5SZW5kZXJMaXN0ZW5lcnMuc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCB0YWc9KG5vZGUgYXMgSFRNTEVsZW1lbnQpLmxvY2FsTmFtZTtcbiAgICAgICAgICAgIGxldCBsaXN0ZW5lcnMwPXRoaXMuZWxlbWVuUmVuZGVyTGlzdGVuZXJzLmdldCh0YWcpO1xuICAgICAgICAgICAgbGV0IGxpc3RlbmVyczE9dGhpcy5lbGVtZW5SZW5kZXJMaXN0ZW5lcnMuZ2V0KCcnKTtcbiAgICAgICAgICAgIGxldCBsaXN0ZW5lcnM9dGhpcy5jb21iaW5lKGxpc3RlbmVyczAsbGlzdGVuZXJzMSk7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycylcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIodGFnLGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFsbENvbXBsZXRlZDpQcm9taXNlPGFueT5bXTsgLy8ga2VlcHMgdHJhY2sgb2YgdGhlIHByb21pc2VzIG9mIGFueSBBc3luY0xvYWRpbmdFbGVtZW50c1xuICAgIHByaXZhdGUgZGVwdGg6bnVtYmVyPTA7XG5cbiAgICBwcml2YXRlIGRvdHMoY291bnQ6bnVtYmVyKSB7XG4gICAgICAgIGxldCBzPScnO1xuICAgICAgICB3aGlsZShjb3VudC0tPjApXG4gICAgICAgICAgICBzKz0nLSc7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJlUmVuZGVyTG9nKHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coYERbJHt0aGlzLmFzc2V0SWQubmFtZX1dJHt0aGlzLmRvdHModGhpcy5kZXB0aCl9LT5TWyR7dG9TdHIodG4uc25vZGUpfV0gVFske3RvU3RyKHRuLnRub2RlKX1dYCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwb3N0UmVuZGVyTG9nKHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coYERbJHt0aGlzLmFzc2V0SWQubmFtZX1dJHt0aGlzLmRvdHModGhpcy5kZXB0aCl9LTxTWyR7dG9TdHIodG4uc25vZGUpfV0gVFske3RvU3RyKHRuLnRub2RlKX1dYCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlck5vZGUocm06UmVuZGVyLHRuOlRhcmdldE5vZGUpICB7XG4gICAgICAgIC8qaWYgKHRuPT10aGlzLmdldFJvb3QoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHJlbmRlcmluZyByb290ICAke3RvU3RyKHRuLnNub2RlKX0gYWxsY29tcD0ke3RoaXMuYWxsQ29tcGxldGVkLmxlbmd0aH1gKTtcbiAgICAgICAgICAgIHRoaXMuYWxsQ29tcGxldGVkPVtdO1xuICAgICAgICB9Ki9cbiAgICAgICAgdG4uaW5pdE1hcmsoKTtcbiAgICAgICAgaWYgKHRuLmNvbXBvbmVudCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyTGlzdGVuZXJzKHRuLnNub2RlLHRuLmNvbXBvbmVudCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vdGhpcy5wcmVSZW5kZXJMb2codG4pO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwdGgrKztcbiAgICAgICAgICAgICAgICAvL2lmICh0b1N0cih0bik9PSdoZWFkJylcbiAgICAgICAgICAgICAgICAvLyAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB0bi5yZW5kZXIocm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goeCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEFuIGV4Y2VwdGlvbiBvY2N1cnJlZCBkdXJpbmcgcmVuZGVyaW5nIG9mICR7dG9TdHIodG4pfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoeCk7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZmluYWxseXtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHRoLS07XG4gICAgICAgICAgICAgICAgLy90aGlzLnBvc3RSZW5kZXJMb2codG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuYWxsQ29tcGxldGVkICYmIHR5cGVvZiAodG4uY29tcG9uZW50IGFzIGFueSkuY29tcGxldGVkID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFsbENvbXBsZXRlZC5wdXNoKCh0bi5jb21wb25lbnQgYXMgYW55KS5jb21wbGV0ZWQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdG4ucmV0aXJlVW51c2VkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGFsbCBhc3luYyBsb2FkaW5nIHdzIGVsZW1ldHMgY29tcGxldGUgcmVuZGVyaW5nLCBvciByZWplY3RzIGlmIGFueSByZWplY3RzLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqXG4gICAgcHVibGljIGNvbXBsZXRlZCgpIDogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMuYWxsQ29tcGxldGVkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaG93TWFueSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYC0tQXQgdGhpcyB0aW1lICR7dGhpcy5hbGxDb21wbGV0ZWQubGVuZ3RofSBwcm9taXNlc2ApO1xuICAgIH0qL1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIEF0dGFjaGFibGVcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFxuICAgIHByb3RlY3RlZCBhdHRhY2htZW50OkF0dGFjaG1lbnRJbXBsO1xuICAgIHByb3RlY3RlZCBwYXJlbnQ6QXR0YWNoYWJsZTtcbiAgICBwcm90ZWN0ZWQgY2hpbGRyZW46QXR0YWNoYWJsZVtdPVtdO1xuXG5cbiAgICBwcm90ZWN0ZWQgYWRkU3R5bGVzVG9BdHRhY2htZW50KGF0dGFjaG1lbnQ6QXR0YWNobWVudEltcGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0RG9jdW1lbnQoKSkge1xuICAgICAgICAgICAgYXR0YWNobWVudC5hZGREZXBlbmRlbmN5KG5ldyBTdHlsZSh0aGlzLmdldERvY3VtZW50KCksdGhpcy5hc3NldElkKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlU3R5bGVzRnJvbUF0dGFjaG1lbnQoYXR0YWNobWVudDpBdHRhY2htZW50SW1wbCkge1xuICAgICAgICBpZiAodGhpcy5nZXREb2N1bWVudCgpKSB7XG4gICAgICAgICAgICBhdHRhY2htZW50LnJlbW92ZURlcGVuZGVuY3kobmV3IFN0eWxlKHRoaXMuZ2V0RG9jdW1lbnQoKSx0aGlzLmFzc2V0SWQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgYXR0YWNobWVudCBvbiB0aGlzIGNvbnZlcnRlciAtIHdoZW4gaXQgaXMgYXR0YWNoZWQgdG8gYSBub2RlIG9uIHRoZSB3aW5kb3cuZG9jdW1lbnRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXR0YWNobWVudCBcbiAgICAgKi9cbiAgICBzZXRBdHRhY2htZW50KGF0dGFjaG1lbnQ6QXR0YWNobWVudEltcGwpIHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNobWVudCkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVTdHlsZXNGcm9tQXR0YWNobWVudCh0aGlzLmF0dGFjaG1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXR0YWNobWVudD1hdHRhY2htZW50O1xuICAgICAgICBpZiAodGhpcy5hdHRhY2htZW50KVxuICAgICAgICAgICAgdGhpcy5hZGRTdHlsZXNUb0F0dGFjaG1lbnQodGhpcy5hdHRhY2htZW50KTtcblxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKT0+e1xuICAgICAgICAgICAgY2hpbGQuc2V0QXR0YWNobWVudCh0aGlzLmF0dGFjaG1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAgICAgXG4gICAgYWRkQ2hpbGQoY2hpbGQ6QXR0YWNoYWJsZSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICBjaGlsZC5zZXRQYXJlbnQodGhpcyk7XG4gICAgICAgIGNoaWxkLnNldEF0dGFjaG1lbnQodGhpcy5hdHRhY2htZW50KTtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZDpBdHRhY2hhYmxlKSB7XG4gICAgICAgIGxldCBpbmRleD10aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpO1xuICAgICAgICBpZiAoaW5kZXg+PTApIHtcbiAgICAgICAgICAgIGNoaWxkLnNldEF0dGFjaG1lbnQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgICAgIGNoaWxkLnNldFBhcmVudChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFBhcmVudChwYXJlbnQ6QXR0YWNoYWJsZSkge1xuICAgICAgICB0aGlzLnBhcmVudD1wYXJlbnQ7XG4gICAgfVxuXG4gICAgZ2V0UGFyZW50KHBhcmVudDpBdHRhY2hhYmxlKSA6IEF0dGFjaGFibGUge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNoYW5nZXJzQnlTbm9kZTpNYXA8Tm9kZSxTdGF0ZUNoYW5nZXJzPjtcblxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgc3RhdGUgY2hhbmdlciBmb3IgdGhpcyBzbm9kZS5cbiAgICAgKiBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlU3RhdGVDaGFuZ2Vycyhzbm9kZTogTm9kZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jaGFuZ2Vyc0J5U25vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlcnNCeVNub2RlLmRlbGV0ZShzbm9kZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGFuZ2Vyc0J5U25vZGUuc2l6ZT09MClcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZXJzQnlTbm9kZT1udWxsO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgU3RhdGVDaGFuZ2VycyBmb3IgdGhpcyBzbm9kZS4gaWYgJ2NyZWF0ZUlmTm90RXhpc3QnIGlzIHRydWUsIHRoZW4gY3JlYXRlIGlmIGl0IGRvZXNudCBleGlzdFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzbm9kZSBcbiAgICAgKiBAcGFyYW0gY3JlYXRlSWZOb3RFeGlzdHMgXG4gICAgICovXG4gICAgcHVibGljIGdldFN0YXRlQ2hhbmdlcnMoc25vZGU6IE5vZGUsIGNyZWF0ZUlmTm90RXhpc3RzPzogYm9vbGVhbik6IFN0YXRlQ2hhbmdlcnMge1xuICAgICAgICBpZiAoIXRoaXMuY2hhbmdlcnNCeVNub2RlICYmIGNyZWF0ZUlmTm90RXhpc3RzKVxuICAgICAgICAgICAgdGhpcy5jaGFuZ2Vyc0J5U25vZGU9bmV3IE1hcCgpO1xuICAgICAgICBpZiAodGhpcy5jaGFuZ2Vyc0J5U25vZGUpIHtcbiAgICAgICAgICAgIGxldCBzYz10aGlzLmNoYW5nZXJzQnlTbm9kZS5nZXQoc25vZGUpO1xuICAgICAgICAgICAgaWYgKHNjKVxuICAgICAgICAgICAgICAgIHJldHVybiBzYztcbiAgICAgICAgICAgIGlmIChjcmVhdGVJZk5vdEV4aXN0cykge1xuICAgICAgICAgICAgICAgIHNjPXt9O1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlcnNCeVNub2RlLnNldChzbm9kZSxzYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRzOk1hcDxOb2RlLEdldFtdPjtcblxuICAgIC8qKlxuICAgICAqIFNldCBhIEdldHMgZnVuY3Rpb24gb24gdGhlIHNub2RlLiBJZiBubyBHZXQgdGhlbiBhbGwgR2V0cyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBnaXZlbiBzbm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc25vZGUgXG4gICAgICogQHBhcmFtIGdldCBcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0R2V0cyhzbm9kZTogTm9kZSxnZXQ/OkdldCk6IHZvaWQge1xuICAgICAgICBpZiAoZ2V0KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZ2V0cykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0cz1uZXcgTWFwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYXJyOkdldFtdPXRoaXMuZ2V0cy5nZXQoc25vZGUpO1xuICAgICAgICAgICAgaWYgKCFhcnIpIHtcbiAgICAgICAgICAgICAgICBhcnI9W107XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRzLnNldChzbm9kZSxhcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyLnB1c2goZ2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZVxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0cykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0cy5kZWxldGUoc25vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBjdXJyZW50bHkgc2V0IEdldCBmdW5jdGlvbnMgb24gdGhpcyBzbm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gc25vZGUgXG4gICAgICovXG4gICAgcHVibGljIGdldEdldHM8VCBleHRlbmRzIENvRWxlbWVudD1Db0VsZW1lbnQ+KHNub2RlOiBOb2RlKTogR2V0PFQ+W10ge1xuICAgICAgICBpZiAodGhpcy5nZXRzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRzLmdldChzbm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgIFxuXG59IiwiXG5cbi8qKlxuICogQSB0cmVlIHN0cnVjdG9yZSBvZiBub2RlcyB3aG9zZSB2aXJ0aWFsIGRlcHRoIG9mIG5vZGVzIGNhbiBiZSBpbmNyZWFzZWQgdmlhIHRoZSBzaGlmdERvd25CeSgpIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgU2luZ2xlVHJlZSAge1xuICAgIG4/Ok5vZGU7XG4gICAgcGFyZW50OlNpbmdsZVRyZWU7XG4gICAgY2hpbGRyZW4/OlNpbmdsZVRyZWVbXTtcblxuICAgIGNvbnN0cnVjdG9yKHI/Ok5vZGUscGFyZW50PzpTaW5nbGVUcmVlKSB7XG4gICAgICAgIGlmIChwYXJlbnQpXG4gICAgICAgICAgICB0aGlzLnBhcmVudD1wYXJlbnQ7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgICB0aGlzLm49cjsgXG5cbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8ci5jaGlsZE5vZGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW49W107XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKG5ldyBTaW5nbGVUcmVlKHIuY2hpbGROb2Rlc1tpXSx0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbmNyZWFzZXMgdGhlIHRyZWUncyBkZXB0aCBkb3duIGJ5ICdjb3VudCcgYnkgYWRkaW5nICdjb3VudCcgZW1wdHkgbm9kZXMgYmV0d2VlbiB0aGlzIG5vZGUgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY291bnQgXG4gICAgICovXG4gICAgc2hpZnREb3duQnkoY291bnQ6IG51bWJlcikge1xuICAgICAgICBsZXQgZW1wdHk9bmV3IFNpbmdsZVRyZWUodW5kZWZpbmVkLHRoaXMpO1xuICAgICAgICBlbXB0eS5jaGlsZHJlbj10aGlzLmNoaWxkcmVuO1xuICAgICAgICB0aGlzLmNoaWxkcmVuPVtlbXB0eV07XG4gICAgICAgIGVtcHR5LnVwZGF0ZUNoaWxkcmVuc1BhcmVudHMoKTtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKGNvdW50PjApIHtcbiAgICAgICAgICAgIGVtcHR5LnNoaWZ0RG93bkJ5KGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCB1cGRhdGVDaGlsZHJlbnNQYXJlbnRzKCkge1xuICAgICAgIGlmICh0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpPT57XG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQ9dGhpcztcbiAgICAgICAgfSlcbiAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIE1lcmdlZE5vZGUgdGhhdCBtYXRjaGVzIG92ZXJsYXAuXG4gICAgICogXG4gICAgICogQHBhcmFtIG4gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgZmluZChuOk5vZGUpIDogU2luZ2xlVHJlZSB7XG4gICAgICAgIGlmIChuPT10aGlzLm4pXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5jaGlsZHJlbi5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGY9dGhpcy5jaGlsZHJlbltpXS5maW5kKG4pO1xuICAgICAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBwbHVtYihkZXB0aDpudW1iZXIpIDoge2RlZXA6bnVtYmVyLG5vZGU6U2luZ2xlVHJlZX0ge1xuICAgICAgICBpZiAoIXRoaXMuY2hpbGRyZW4gfHx0aGlzLmNoaWxkcmVuLmxlbmd0aD09MClcbiAgICAgICAgICAgIHJldHVybiB7ZGVlcDpkZXB0aCxub2RlOnRoaXN9O1xuXG4gICAgICAgIGxldCBhbGw6e2RlZXA6bnVtYmVyLG5vZGU6U2luZ2xlVHJlZX1bXT1bXTtcblxuICAgICAgICBmb3IobGV0IGk9MDtpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoO2krKykgXG4gICAgICAgICAgICBhbGwucHVzaCh0aGlzLmNoaWxkcmVuW2ldLnBsdW1iKGRlcHRoKzEpKTtcblxuICAgICAgICBpZiAoYWxsLmxlbmd0aD4xKSB7XG4gICAgICAgICAgICBhbGwuc29ydCgoYSxiKT0+e1xuICAgICAgICAgICAgICAgIHJldHVybiBiLmRlZXAtYS5kZWVwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbGxbMF07XG4gICAgfVxuXG4gICAgZGVlcGVzdCgpIDogU2luZ2xlVHJlZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsdW1iKDApLm5vZGU7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgcGFkLCB0b1N0ciB9IGZyb20gXCIuL0RlYnVnXCI7XG5pbXBvcnQgeyBTaW5nbGVUcmVlIH0gZnJvbSBcIi4vU2luZ2xlVHJlZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE92ZXJsYXAge1xuICAgIG4wOiBOb2RlO1xuICAgIG4xOiBOb2RlO1xufVxuXG4vKipcbiAqIEEgVHJlZSB0aGF0IHN0b3JlcyB0aGUgcmVzdWx0IG9mIGEgVHJlZU1lcmdlLiBFYWNoIG9iamVjdCBpcyBhIG5vZGUgaW4gdGhpcyB0cmVlXG4gKiB3aXRoIHRoZSBIdG1sIG5vZGUgb2YgZWl0aGVyIHRoZSAwdGggKG4wKSBvciBmaXJzdCAobjEpIHN0b3JlZCwgYW5kIGNoaWxkcmVuIGFmdGVyIG1lZ2Ugc3RvcmVkIGluICdjaGlsZHJlbidcbiAqIFxuICovXG5leHBvcnQgY2xhc3MgTWVyZ2VkVHJlZSB7XG4gICAgbjA/OiBOb2RlO1xuICAgIG4xPzogTm9kZTtcbiAgICBwYXJlbnQ6IE1lcmdlZFRyZWU7XG4gICAgY2hpbGRyZW4/OiBNZXJnZWRUcmVlW107XG4gICAgc2hhZG93PzogYm9vbGVhbjsgLy8gbWVhbnMgbjAgaXMgc2hhZG93IC0gKG5vcm1hbGx5IG4xIGlzIHNoYWRvdykgLSB0aGUgbm9uIHNoYWRvdyBuIGlzIHRoZSBvbmUgd2hvc2UgYXR0cmlidXRlcyBhcmUgZXhwcmVzc2VkLlxuXG4gICAgY29uc3RydWN0b3IoczA6IFNpbmdsZVRyZWUsIHMxOiBTaW5nbGVUcmVlKSB7XG4gICAgICAgIHRoaXMubjAgPSBzMC5uO1xuICAgICAgICB0aGlzLm4xID0gczEubjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBwYXJlbnQgdG8gdGhzIG5vZGUgZnJvbSB0aGUgbWVyZ2luZyBvZiBjMCxjMSBhbmQgcmV0dXJuIGl0XG4gICAgICogXG4gICAgICogQHBhcmFtIGMwIFxuICAgICAqIEBwYXJhbSBjMSBcbiAgICAgKi9cbiAgICBtZXJnZVBhcmVudChjMDogU2luZ2xlVHJlZSwgYzE6IFNpbmdsZVRyZWUpOiBNZXJnZWRUcmVlIHtcbiAgICAgICAgbGV0IHAgPSBuZXcgTWVyZ2VkVHJlZShjMCwgYzEpO1xuICAgICAgICBwLmNoaWxkcmVuID0gW3RoaXNdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHA7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYW55IGNoaWxkcmVuIG9mICdvdGhlcicgYXMgY2hpbGRyZW4gb2YgdGhpcyBub2RlIG9ubHkgaWYgdGhvc2UgY2hpbGRyZW4gYXJlIGRpZmZlcmVudFxuICAgICAqIGZyb20gdGhpcydzIGV4aXN0aW5nIGNoaWxkcmVuXG4gICAgICogXG4gICAgICogQHBhcmFtIG90aGVyIFxuICAgICAqL1xuICAgIHRha2VvdmVyQ2hpbGRyZW4ob3RoZXI6TWVyZ2VkVHJlZSkge1xuICAgICAgICBpZiAob3RoZXIuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGxldCB0b2FkZDpNZXJnZWRUcmVlW109W107XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG90aGVyLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZpbmRDaGlsZChvdGhlci5jaGlsZHJlbltpXS5uMCxvdGhlci5jaGlsZHJlbltpXS5uMSkpXG4gICAgICAgICAgICAgICAgICAgIHRvYWRkLnB1c2gob3RoZXIuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvYWRkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jaGlsZHJlbilcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbj1bXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvYWRkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaCh0b2FkZFtpXSk7XG4gICAgICAgICAgICAgICAgICAgIHRvYWRkW2ldLnBhcmVudD10aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZpbmQgYW4gaW1tZWRpYXRlIGNoaWxkIGNvbnRhaW5pbmcgYm90aCBuMSxuMFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuMCBcbiAgICAgKiBAcGFyYW0gbjEgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgZmluZENoaWxkKG4wOiBOb2RlLCBuMTogTm9kZSkge1xuICAgICAgICBpZiAoIXRoaXMuY2hpbGRyZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW5baV0uZmluZChuMCxuMSx0cnVlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbltpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgaW1tZWRpYXRlIGNoaWxkIHRoYXQgY29udGFpbnMgbiBhcyBuMFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGZpbmRDaGlsZDAobjogTm9kZSxyZWN1cnNlPzpib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy5jaGlsZHJlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGlsZHJlbltpXS5uMD09bilcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlY3Vyc2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgZj10aGlzLmNoaWxkcmVuW2ldLmZpbmRDaGlsZDAobix0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoZilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGltbWVkaWF0ZSBjaGlsZCB0aGF0IGNvbnRhaW5zIG4gYXMgbjBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbiBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBmaW5kQ2hpbGQxKG46IE5vZGUscmVjdXJzZT86Ym9vbGVhbikge1xuICAgICAgICBpZiAoIXRoaXMuY2hpbGRyZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW5baV0ubjE9PW4pXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW5baV07XG4gICAgICAgICAgICBlbHNlIGlmIChyZWN1cnNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGY9dGhpcy5jaGlsZHJlbltpXS5maW5kQ2hpbGQxKG4sdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgTWVyZ2VkVHJlZSBub2RlIGRvd24gdGhlIHRyZWUgdGhhdCBtYXRjaGVzIG4wLG4xLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGZpbmQobjA6IE5vZGUsIG4xOiBOb2RlLG5vQ2hpbGRyZW4/OmJvb2xlYW4pOiBNZXJnZWRUcmVlIHtcbiAgICAgICAgaWYgKG4wID09IHRoaXMubjAgJiYgbjE9PXRoaXMubjEpXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4gJiYgIW5vQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBmID0gdGhpcy5jaGlsZHJlbltpXS5maW5kKG4wLG4xKTtcbiAgICAgICAgICAgICAgICBpZiAoZilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3IgZGVidWdnaW5nIC0gcHJpbnRzIHRoZSBtZXJnZWQgdHJlZSB0byB0aGUgY29uc29sZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZGVwdGggXG4gICAgICovXG4gICAgcHJpbnQoZGVwdGg6bnVtYmVyPTApIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7cGFkKGRlcHRoKX0gbjA9JHt0b1N0cih0aGlzLm4wKX0gKysgbjE9JHt0b1N0cih0aGlzLm4xKX1gKTtcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoYyk9PntcbiAgICAgICAgICAgICAgICBjLnByaW50KGRlcHRoKzEpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuXG59IiwiaW1wb3J0IHsgQ29FbGVtZW50LCBpc0NvRWxlbWVudCB9IGZyb20gXCIuLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IEV2ZW50SGFuZGxlcnMgfSBmcm9tIFwiLi4vaHRtbC9FdmVudEhhbmRsZXJzXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuaW1wb3J0IHsgTWVyZ2VkVHJlZSB9IGZyb20gXCIuL01lcmdlZFRyZWVcIjtcbmltcG9ydCB7IFRhcmdldE5vZGVJbXBsIH0gZnJvbSBcIi4vVGFyZ2V0Tm9kZUltcGxcIjtcblxuXG5cbi8qKlxuICogQSB0YXJnZXQgbm9kZSB0aGF0IHJlcHJlc2VudHMgYSBtZXJnZWQgbm9kZSAuIFxuICogbjAgcmVwcmVzZW50cyBvbmUgdHJlZSAodGhlIGNhbGxlcikgYW5kIG4xIHJlcHJlc2VudHMgdGhlIGNhbGxlZSB0cmVlICh0aGUgdGVtcGxhdGUpXG4gKiBcbiAqIFxuICovXG5leHBvcnQgY2xhc3MgTWVyZ2VkVGFyZ2V0Tm9kZSBleHRlbmRzIFRhcmdldE5vZGVJbXBsIHtcbiAgICBwcm90ZWN0ZWQgbW5vZGU6TWVyZ2VkVHJlZTtcbiAgICBwcm90ZWN0ZWQgY3Z0MDpDb252ZXJ0ZXI8VGhpcz47XG4gICAgcHJvdGVjdGVkIGN2dDE6Q29udmVydGVyPFRoaXM+O1xuICAgIHByb3RlY3RlZCBtY2hpbGRyZW46KE5vZGV8TWVyZ2VkVHJlZSlbXTtcblxuICAgIGNvbnN0cnVjdG9yKG1ub2RlOk1lcmdlZFRyZWUsY3Z0MDpDb252ZXJ0ZXI8VGhpcz4sY3Z0MTpDb252ZXJ0ZXI8VGhpcz4pIHtcbiAgICAgICAgc3VwZXIobW5vZGUuc2hhZG93PyBtbm9kZS5uMTptbm9kZS5uMHx8bW5vZGUubjEsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbiAgICAgICAgdGhpcy5jdnQwID0gY3Z0MDtcbiAgICAgICAgdGhpcy5jdnQxID0gY3Z0MTtcbiAgICAgICAgdGhpcy5tbm9kZT1tbm9kZTtcbiAgICB9XG5cbiAgICBtYXRjaFNub2RlKG1hdGNoZXI6KHNub2RlOk5vZGUpPT5ib29sZWFuKSA6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoc3VwZXIubWF0Y2hTbm9kZShtYXRjaGVyKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICByZXR1cm4gKHRoaXMubW5vZGUubjAgJiYgbWF0Y2hlcih0aGlzLm1ub2RlLm4wKSkgfHwgKHRoaXMubW5vZGUubjEgJiYgbWF0Y2hlcih0aGlzLm1ub2RlLm4xKSlcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcnVuU3RhdGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgICAgICBzdXBlci5ydW5TdGF0ZUNoYW5nZXMoKTsgXG4gICAgICAgIGlmICghdGhpcy5tbm9kZS5zaGFkb3cgJiYgdGhpcy5tbm9kZS5uMCAmJiB0aGlzLm1ub2RlLm4xICYmIHRoaXMudG5vZGUpIHtcbiAgICAgICAgICAgIC8vIFJ1biBzdGF0ZSBjaGFuZ2VycyBzZXQgYnkgY3Z0MSBvbiBuMVxuICAgICAgICAgICAgdGhpcy5ydW5TdGF0ZUNoYW5nZUZvcih0aGlzLmN2dDEsdGhpcy5tbm9kZS5uMSk7XG5cbiAgICAgICAgICAgIC8vIGVuc3VyZSBuMSdzIGNsYXNzZXMgYW5kIGF0dHJpYnV0ZXMgTk9UIHNldCBieSBuMCBhcmUgY29waWVkIHRvIHRoZSB0bm9kZS5cbiAgICAgICAgICAgIC8vIFRoZSBjbGFzc2VzIGZyb20gbjAgd2lsbCBhbHJlYWR5IGhhdmUgYmVlbiBjb3BpZWQgZHVyaW5nIHRoZSBub3JtYWwgZXhwYW5zaW9uXG4gICAgICAgICAgICB0aGlzLmN2dDEuY29weUF0dHJFeGNlcHRUb1ROb2RlKHRoaXMudG5vZGUsdGhpcy5tbm9kZS5uMSx0aGlzLmdldEF0dHJpYnNUaGF0QXJlTm90Q2xhc3NTdHlsZU9yRXZlbnQodGhpcy5tbm9kZS5uMCBhcyBFbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0QXR0cmlic1RoYXRBcmVOb3RDbGFzc1N0eWxlT3JFdmVudChlbGVtOkVsZW1lbnQpIDogc3RyaW5nW10ge1xuICAgICAgICBsZXQgYXR0cnMgPSBlbGVtLmF0dHJpYnV0ZXM7XG5cbiAgICAgICAgbGV0IGZpbHRlcmVkOnN0cmluZ1tdPVtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXR0cnNbaV0ubmFtZSE9J2NsYXNzJyAmJiAvLyBcbiAgICAgICAgICAgICAgICBhdHRyc1tpXS5uYW1lIT0nc3R5bGUnICYmICAvLyBcbiAgICAgICAgICAgICAgICBhdHRyc1tpXS5uYW1lIT0ncmVtb3ZlJyAgJiYgXG4gICAgICAgICAgICAgICAgIUV2ZW50SGFuZGxlcnMuaXNFdmVudEF0dHIoYXR0cnNbaV0ubmFtZSlcbiAgICAgICAgICAgICAgICApIHsgLy8gXG4gICAgICAgICAgICAgICAgZmlsdGVyZWQucHVzaChhdHRyc1tpXS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBcblxuICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgc28gd2UgY2FuIGF0dGFjaCBldmVudCBoYW5kbGVycyBmcm9tIG4xICh0aGUgdGVtcGxhdGUpXG4gICAgICogXG4gICAgICogQXBwbHkgYWxsIGF0dHJpYnV0ZSBiYXNlZCBldmVudCBoYW5kbGVycyAoZWl0aGVyICdvblhYWCcgb3IgJ2NvLW9uWFhYJykgaW4gc25vZGUgdG8gdGhlIFxuICAgICAqIHRub2RlIGFzICdhZGRFdmVudExpc3RlbmVyKCd4eHh4JykuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGF0dGFjaEV2ZW50SGFuZGxlcnNGcm9tQXR0cmlidXRlcygpIHtcbiAgICAgICAgc3VwZXIuYXR0YWNoRXZlbnRIYW5kbGVyc0Zyb21BdHRyaWJ1dGVzKCk7XG4gICAgICAgIGlmICh0aGlzLnRub2RlICYmIHRoaXMubW5vZGUubjEpIHtcbiAgICAgICAgICAgIGxldCBlaD1uZXcgRXZlbnRIYW5kbGVycyh0aGlzLnRub2RlIGFzIEVsZW1lbnQsdGhpcyk7XG5cbiAgICAgICAgICAgIGVoLmFkZEV2ZW50SGFuZGxlcnNGcm9tQXR0cnNPZih0aGlzLm1ub2RlLm4xIGFzIEVsZW1lbnQsdGhpcy5jdnQxKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cblxuICAgIC8qKlxuICAgICAgICAgKiBHaXZlbiBhIGNoaWxkIHNub2RlIChhcyByZXR1cm5lZCBieSBzb3VyY2VDaGlsZE5vZGVzKCkpLCBjcmVhdGUgaXRzIFRhcmdldE5vZGVcbiAgICAgICAgICogd2l0aCBjb21wb25lbnRcbiAgICAgICAgICogXG4gICAgICAgICAqIFRoZSBpbXBsZW1lbnRhdGlvbiB3aWxsOlxuICAgICAgICAgKiAgICAgIDEuIHVzZSBpdHMgb3duaW5nIENvbnZlcnRlciB0byBjcmVhdGUgdGhlIENvRWxlbWVudCBmb3IgdGhlIG5ldyBjaGlsZC5cbiAgICAgICAgICogICAgICAyLiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBUYXJnZXROb2RlIGFzIHRoZSBjaGlsZFxuICAgICAgICAgKiAgICAgIDMuIEFkZCB0aGlzIENvRWxlbWVudCB0byB0aGUgY2hpbGQncyAnY29tcG9uZW50J1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIHNub2RlIFxuICAgICAgICAgKiBAcmV0dXJucyBcbiAgICAgICAgICovXG4gICAgcHVibGljIG1ha2VUYXJnZXROb2RlKHNub2RlOk5vZGUsY3Z0OkNvbnZlcnRlcjxUaGlzPik6IFRhcmdldE5vZGUge1xuICAgICAgICBsZXQgbWNoaWxkcmVuPXRoaXMuZ2V0TWVyZ2VkQ2hpbGRyZW4oKTtcbiAgICAgICAgbGV0IGN0bjpUYXJnZXROb2RlO1xuXG4gICAgICAgIGZvcihsZXQgaT0wO2k8bWNoaWxkcmVuLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIGxldCBtPW1jaGlsZHJlbltpXTtcblxuICAgICAgICAgICAgaWYgKG0gaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG09PXNub2RlKSAgIHtcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNub2RlLm5vZGVUeXBlPT1Ob2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGU6RWxlbWVudD1zbm9kZSBhcyBFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUuaWQ9PSdwMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZpbmQgcDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAgICAgICAgIGN0bj1uZXcgVGFyZ2V0Tm9kZUltcGwoc25vZGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzbm9kZT09bS5uMCB8fCBzbm9kZT09bS5uMSkge1xuICAgICAgICAgICAgICAgICAgICBjdG49bmV3IE1lcmdlZFRhcmdldE5vZGUobSx0aGlzLmN2dDAsdGhpcy5jdnQxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN0bi5wYXJlbnQ9dGhpczsgLy8gc28gaWYgdGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBDb0VsZW1lbnQgdHJpZXMgdG8gYWNjZXNzIHBhcmVudCwgaXQgd2lsbCB3b3JrXG4gICAgICAgIGxldCBjbz1jdG4uZ2V0T3duZXIoY3Z0KS5tYWtlQ29FbGVtZW50KGN0bik7XG4gICAgICAgIGlmIChpc0NvRWxlbWVudChjbykpIHtcbiAgICAgICAgICAgIGN0bi5jb21wb25lbnQ9Y287XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb1xuICAgICAgICAgICAgLnRoZW4oKGNvKT0+e1xuICAgICAgICAgICAgICAgIGlmIChjby5nZXRUTigpIT1jdG4gJiYgY3RuLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjdG4ucGFyZW50LnJlcGxhY2VDaGlsZChjdG4sY28uZ2V0VE4oKSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvY3RuPWN0bjtcbiAgICAgICAgICAgICAgICAgICAgY3RuPWNvLmdldFROKCk7XG4gICAgICAgICAgICAgICAgICAgIGN0bi5yZXBsYWNlZD1vY3RuLnNub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjby5nZXRDdnQoKS5pbnZhbGlkYXRlKGN0bik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGN0bjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgQ29udmVydGVyIHRoYXQgJ293bnMnIHRoaXMgVGFyZ2V0Tm9kZS4gVGhpcyBjb252ZXJ0ZXIgd2lsbCBiZSB1c2VkXG4gICAgICogdG8gcmVuZGVyIHRoaXMgVGFyZ2V0Tm9kZSwgYW5kIGhlbmNlIGl0cyAnVGhpcycgd2lsbCBiZSB1c2UgZHVyaW5nIHJlbmRlcmluZyBvZiB0aGUgVGFyZ2V0Tm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZGVmYXVsdE93bmVyIFRoZSBkZWZhdWx0IG93bmVyLlxuICAgICAqIEByZXR1cm5zIFRoZSBDb252ZXJ0ZXIgdG8gdXNlIHRvIHJlbmRlciB0aGlzIFRhcmdldE5vZGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0T3duZXIoZGVmYXVsdE93bmVyOiBDb252ZXJ0ZXI8VGhpcz4pIHtcbiAgICAgICAgaWYgKHRoaXMubW5vZGUubjAgJiYgIXRoaXMubW5vZGUuc2hhZG93KVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3Z0MDtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3Z0MTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbWFrZU1lcmdlZENoaWxkcmVuKCkgOiAoTm9kZXxNZXJnZWRUcmVlKVtdIHtcbiAgICAgICAgbGV0IGNoaWxkczooTm9kZXxNZXJnZWRUcmVlKVtdPVtdO1xuXG4gICAgICAgIGlmICh0aGlzLm1ub2RlLm4wICYmICF0aGlzLm1ub2RlLm4xKSB7XG4gICAgICAgICAgICAvLyBvbmx5IG4wO1xuICAgICAgICAgICAgZm9yKGxldCBpPTA7aTx0aGlzLm1ub2RlLm4wLmNoaWxkTm9kZXMubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgICAgIGxldCBjbj10aGlzLm1ub2RlLm4wLmNoaWxkTm9kZXNbaV07XG4gICAgICAgICAgICAgICAgbGV0IG1uOk1lcmdlZFRyZWU9dGhpcy5tbm9kZS5maW5kQ2hpbGQwKGNuKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1uICYmIHRoaXMudXNlZEZ1cnRoZXJEb3duMChjbikpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBza2lwIGFzIHRoaXMgcmF3IGNuIGlzIHVzZWQgZnVydGhlciBkb3duIC0gYmVjYXVzZSBvZiB0cmVlIHN0cmV0Y2hpbmdcbiAgICAgICAgICAgICAgICBjaGlsZHMucHVzaChtbnx8Y24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW5vZGUubjEgJiYgIXRoaXMubW5vZGUubjApIHtcbiAgICAgICAgICAgIC8vIG9ubHkgbjA7XG4gICAgICAgICAgICBmb3IobGV0IGk9MDtpPHRoaXMubW5vZGUubjEuY2hpbGROb2Rlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNuPXRoaXMubW5vZGUubjEuY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgbW46TWVyZ2VkVHJlZT10aGlzLm1ub2RlLmZpbmRDaGlsZDEoY24pO1xuICAgICAgICAgICAgICAgIGlmICghbW4gJiYgdGhpcy51c2VkRnVydGhlckRvd24xKGNuKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7IC8vIHNraXAgYXMgdGhpcyByYXcgY24gaXMgdXNlZCBmdXJ0aGVyIGRvd24gLSBiZWNhdXNlIG9mIHRyZWUgc3RyZXRjaGluZ1xuICAgICAgICAgICAgICAgIGNoaWxkcy5wdXNoKG1ufHxjbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBib3RoIG4wIGFuZCBuMS4gdXNlIHBvc2l0aW9uIHRvIG9yZGVyXG4gICAgICAgICAgICBsZXQgb3JkZXI6TWFwPE5vZGV8TWVyZ2VkVHJlZSxudW1iZXI+PW5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5tbm9kZS5uMC5jaGlsZE5vZGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY249dGhpcy5tbm9kZS5uMC5jaGlsZE5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIGxldCBtbjpNZXJnZWRUcmVlPXRoaXMubW5vZGUuZmluZENoaWxkMChjbik7XG4gICAgICAgICAgICAgICAgaWYgKCFtbiAmJiB0aGlzLnVzZWRGdXJ0aGVyRG93bjAoY24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gc2tpcCBhcyB0aGlzIHJhdyBjbiBpcyB1c2VkIGZ1cnRoZXIgZG93biAtIGJlY2F1c2Ugb2YgdHJlZSBzdHJldGNoaW5nXG4gICAgICAgICAgICAgICAgbGV0IGVpdGhlcj1tbnx8Y247XG4gICAgICAgICAgICAgICAgY2hpbGRzLnB1c2goZWl0aGVyKTtcbiAgICAgICAgICAgICAgICBvcmRlci5zZXQoZWl0aGVyLGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKGxldCBpPTA7aTx0aGlzLm1ub2RlLm4xLmNoaWxkTm9kZXMubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgICAgIGxldCBjbj10aGlzLm1ub2RlLm4xLmNoaWxkTm9kZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNuLm5vZGVUeXBlPT1Ob2RlLlRFWFRfTk9ERSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgbGV0IG1uOk1lcmdlZFRyZWU9dGhpcy5tbm9kZS5maW5kQ2hpbGQxKGNuKTtcbiAgICAgICAgICAgICAgICBpZiAobW4gJiYgbW4ubjApXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBhbHJlYWR5IGNvdW50ZWQgYWJvdmVcbiAgICAgICAgICAgICAgICBpZiAoIW1uICYmIHRoaXMudXNlZEZ1cnRoZXJEb3duMShjbikpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBza2lwIGFzIHRoaXMgcmF3IGNuIGlzIHVzZWQgZnVydGhlciBkb3duIC0gYmVjYXVzZSBvZiB0cmVlIHN0cmV0Y2hpbmdcbiAgICAgICAgICAgICAgICBsZXQgZWl0aGVyPW1ufHxjbjtcbiAgICAgICAgICAgICAgICBjaGlsZHMucHVzaChlaXRoZXIpO1xuICAgICAgICAgICAgICAgIG9yZGVyLnNldChlaXRoZXIsaSswLjIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHMuc29ydCgoYSxiKT0+e1xuICAgICAgICAgICAgICAgIGxldCBhbz1vcmRlci5nZXQoYSk7XG4gICAgICAgICAgICAgICAgbGV0IGJvPW9yZGVyLmdldChiKTtcblxuICAgICAgICAgICAgICAgIC8vcmV0dXJuIGJvLWFvO1xuICAgICAgICAgICAgICAgIHJldHVybiBhby1ibztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdHJ1ZSBpZiBtbm9kZXMgMCBjaGlsZHJlbiBoYXMgYSBjaGlsZCBlcXVhbCB0byBjbi4gTm90ZSB3ZSBza2lwIGRpcmVjdCBjaGlsZHJlbiBvZiBtbm9kZVxuICAgICAqIEBwYXJhbSBjbiBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXNlZEZ1cnRoZXJEb3duMChjbjogTm9kZSkgOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLm1ub2RlLmNoaWxkcmVuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubW5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBmPXRoaXMubW5vZGUuY2hpbGRyZW5baV0uZmluZENoaWxkMChjbix0cnVlKTtcbiAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVzZWRGdXJ0aGVyRG93bjEoY246IE5vZGUpIDogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5tbm9kZS5jaGlsZHJlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1ub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZj10aGlzLm1ub2RlLmNoaWxkcmVuW2ldLmZpbmRDaGlsZDEoY24sdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZilcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJvdGVjdGVkIGdldE1lcmdlZENoaWxkcmVuKCkgOiAgKE5vZGV8TWVyZ2VkVHJlZSlbXSB7XG4gICAgICAgIGlmICghdGhpcy5tY2hpbGRyZW4pXG4gICAgICAgICAgICB0aGlzLm1jaGlsZHJlbj10aGlzLm1ha2VNZXJnZWRDaGlsZHJlbigpO1xuICAgICAgICByZXR1cm4gdGhpcy5tY2hpbGRyZW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaHRtbCBjaGlsZCBOb2RlcyBvZiB0aGlzIFRhcmdldE5vZGUgd2hpY2ggc2hvdWxkIGJlIHVzZWQgZm9yIGNyZWF0aW5nIFxuICAgICAqIGNoaWxkIFRhcmdldE5vZGVzLlxuICAgICAqIFxuICAgICAqIE91ciBjaGlsZHJlbiBhcmUgY2hpbGRyZW4gb2YgbjAgaW50ZXJzZWN0ZWQgd2l0aCBjaGlsZHJlbiBvZiBuMS4gVGhlIGludGVyc2VjdGluZyBtZW1iZXJzXG4gICAgICogYXJlIHRob3NlIHRoYXQgaGF2ZSBib3RoIG4wIGFuZCBuMS5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgc291cmNlQ2hpbGROb2RlcygpOiBOb2RlTGlzdE9mPENoaWxkTm9kZT4gfCBOb2RlW10ge1xuICAgICAgICBcbiAgICAgICAgbGV0IGNoaWxkcmVuOk5vZGVbXT1bXTtcbiAgICAgICAgbGV0IG1jaGlsZHJlbj10aGlzLmdldE1lcmdlZENoaWxkcmVuKCk7XG4gICAgICAgIGZvcihsZXQgaT0wO2k8bWNoaWxkcmVuLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIGxldCBtbj1tY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAobW4gaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChtbik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFtbi5zaGFkb3cpIHtcbiAgICAgICAgICAgICAgICAvKiBkZWxldGVkIC0gY2FudCBjaGFuZ2UgY2FjaGVkIHNub2Rlcy4gRE8gdGhlIG1yZ2UgdXNpbmcgc3RhdGVjaGFuZ2Vyc1xuICAgICAgICAgICAgICAgIGlmIChtbi5uMCAmJiBtbi5uMSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW5vZGU9bW47XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Z0MC51bndhdGNoZWRTbm9kZUNoYW5nZShtbi5uMCwoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzc2VzRnJvbShtbm9kZS5uMCxtbm9kZS5uMSBhcyBFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSAqL1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2gobW4ubjB8fG1uLm4xKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChtbi5uMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfVxuXG4gICAgLypcbiAgICBwcm90ZWN0ZWQgYWRkQ2xhc3Nlc0Zyb20odG86IE5vZGUsIGZyb206IEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRvLm5vZGVUeXBlPT1Ob2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxmcm9tLmNsYXNzTGlzdC5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgKHRvIGFzIEVsZW1lbnQpLmNsYXNzTGlzdC5hZGQoZnJvbS5jbGFzc0xpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSovXG5cblxufSIsImltcG9ydCB7IEFzc2V0VHlwZSwgRG9jdW1lbnRBc3NldCB9IGZyb20gXCIuLi9Bc3NldFwiO1xuaW1wb3J0IHsgSW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uL0ltcGxlbWVudGF0aW9uc1wiO1xuaW1wb3J0IHsgTWVyZ2VkVHJlZSwgT3ZlcmxhcCB9IGZyb20gXCIuL01lcmdlZFRyZWVcIjtcbmltcG9ydCB7IFNpbmdsZVRyZWUgfSBmcm9tIFwiLi9TaW5nbGVUcmVlXCI7XG5cblxuXG5cblxuXG4vKipcbiAqIE1lcmdlcyB0d28gRE9NIHRyZWVzIGZyb20gYSBzaW5nbGUgc3RhcmluZyBub2RlIGluIGVhY2ggKHJvb3QxIGFuZCByb290MikuIHRoZSBtZXJnZSBpc1xuICogcGVyZm9ybWVkIGJhc2VkIG9uIG5vZGVzIHRoYXQgb3ZlcmxhcCBiZXR3ZWVuIHIxIGFuZCByMi5cbiAqIFxuICogVGhlIHJ1bGVzOlxuICogXG4gKiAxLiBpZiB0d28gbm9kZXMgb3ZlcmxhcCwgdGhlbiB0aGUgbm9kZSBmcm9tIHIxIHJlcGxhY2VzIHRoZSBvbmUgZnJvbSByMi5cbiAqICAgIFRoZSBjaGlsZHJlbiBvZiByMiBhcmUgdGhlbiBtZXJnZWQgd2l0aCB0aGUgY2hpbGRyZW4gb2YgcjEgKGJlY29tZSBhbHNvIGNoaWxkcmVuIG9mIHIxKSBcbiAqIDIuIHRoZSByb290IG5vZGVzLCByMSBhbmQgcjIsIGFyZSBkZWVtZWQgdG8gb3ZlcmxhcC5cbiAqIDMuIEFsbCBvdGhlciBvdmVybGFwcyBhcmUgc3VwcGxpZWQgaW4gYSBtYXAgJ292ZXJsYXBzJyAtIHdoaWNoIGNvbnRhaW4gdGhlIG5vZGVzIG9mIHIyIHRoYXQgb3ZlcmxhcCB3aXRoIHIxLiAoa2V5IGlzIHIxIG5vZGUsIHZhbHVlIGlzIHIyIG5vZGUpXG4gKiA0LiBXZSBkZWZpbmUgYSBkZXB0aCBmb3IgZWFjaCBub2RlIGFzOiBcInRoZSBsZXZlbCBiZWxvdyB0aGUgcm9vdFwiLiBGb3IgZXhhbXBsZSwgdGhlIGRlcHRoIG9mIGEgcm9vdCBub2RlIGlzIDAuIE5vZGVzIDEgbGV2ZWwgZGVlcCBhcmUgMSBldGMuXG4gKiA1LiBUaGUgbWVyZ2Ugd29ya3MgYmV0d2VlbiB0aGUgc3RhcnRpbmcgb3ZlcmxhcHBlZCBub2RlcyByMSBhbmQgcjIsIGFuZCB0aGUgZW5kaW5nIG92ZXJsYXBzIGdpdmVuIGluICdvdmVybGFwcycuIFNvIHdlIGhhdmVcbiAqICAgIHR3byBzZXRzIG9mIG5vZGVzIG9mIHRoZSBzYW1lIHNpemU6IGUxIChlbmQgbm9kZXMgMSkgd2hpY2ggYXJlIGRlc2NlbmRlbnRzIG9mIHIxLCBhbmQgZTIgKG9mIHIyKS4gXG4gKiA2LiBUaGUgbWF4ZGVwdGgoclgpIGlzIGRlZmluZWQgYXMgdGhlIG1heGltdW0gZGVwdGggb2YgYW55IG5vZGUgb2YgZVguIFxuICogNy4gVGhlIG1lcmdlIHdvcmtzIGJ5IGNyZWF0aW5nIGEgdmlydHVhbCBkZXB0aCBmb3IgZWFjaCBub2RlIGluIGVhY2ggdHJlZS4gVGhlIHZpcnR1YWwgZGVwdGggaXMgdGhlIGRlcHRoIG9mIG5vZGVzIGZyb20gdGhlXG4gKiAgICAgb3RoZXIgdHJlZSB0byB3aGljaCB0aGlzIG5vZGUgd2lsbCBiZSBtYXBwZWQgdG8gZHVyaW5nIG1lcmdlLlxuICogOC4gSWYgbWF4ZGVwdGgocjEpID09IG1heGRlcHRoKHIyKSwgdGhlbiB0aGUgdmlydHVhbCBkZXB0aCBmb3IgYWxsIG5vZGVzIG9mIHIxIGFuZCByMiBhcmUgdGhlIHNhbWUgYXMgdGhlaXIgcmVhbCBkZXB0aHMuXG4gKiA5ICBPdGhlcndpc2UsIHRoZSB0cmVlIHdpdGggdGhlIGxlc3NlciBtYXhkZXB0aCBpcyBhZGp1c3RlZCBieSAnYm90dG9tIGFsaWduaW5nJyBhbGwgaXRzIG5vZGVzIG90aGVyIHRoYW4gdGhlIHJvb3QsIHRvIHRoZVxuICogICAgb3RoZXIgdHJlZS4gVGhlIHJvb3Qgbm9kZSBpcyBrZXB0IGF0IHRoZSBzYW1lIGxldmVsICgwKSwgZm9yIGFsbCBjaGlsZHJlbiwgYWRqdXN0IHRoZWlyIHZpcnR1YWxkZXB0aCBkb3dud2FyZHMgaW50cm9kdWNpbmdcbiAqICAgIGVtcHR5IGxheWVycy4gRXhhbXBsZTpcbiBgYGB0ZXh0XG4tLSBCb3R0b20gYWxpZ25pZyBleGFtcGxlOlxuIEZvciB0aGUgZm9sb3dpbmcgdHJlZXMsIG92ZXJsYXAgaXMgW1hiMT0+WWQyXSwgW1hjMT0+WWUyXVxuUkVBTCBERVBUSDpcbiAwICAgWGEwICAgICAgICAgICAgICAgICBZYTAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gMSAgWGIxIFhjMSAgICAgICAgICAgICBZYjEgWWMxICAgICAgXG4gMiAgICAgICAgICAgICAgICAgICBZZDIgWWUyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICBBcyBYIGlzIHNob3J0ZXIsIHNvIGl0cyBsZXZlbCAyIGlzIGJvdHRvbSBhbGlnbmVkOlxuVklSVFVBTCBERVBUSFxuIDAgICBYYTBcbiAxICAgW2VtcHR5XVxuIDIgIFhiMVs9WWQyXSBYYzFbPVllMl1cbiBgYGBcbiAqIDEwLiBUaGUgbWVyZ2UgYmVnaW5zIGZyb20gZWFjaCBtZW1iZXIgb2YgZTEgYW5kIHRyYXZlcnNlcyB1cCB0aGUgdHJlZTpcbiAgICAgICBBMS4gRXF1YWxpemUgdHJlZSBkZXB0aHMgYXQgb3ZlcmxhcHMsIGUuZy4gaW5zZXJ0IGVtcHR5IG5vZGVzIGF0IHRoZSB0b3Agb2YgdGhlIHNtYWxsZXIgdHJlZS4gSWYgdGhlIGRpZmZlcmVuY2UgaW4gcmVhbCBkZXB0aCBvZiBhbGwgbWVtYmVycyBvZiBlMSBhbmQgdGhlaXIgb3ZlcmxhcHBpbmcgZTIsIGlzIG5vdCB0aGUgc2FtZSwgdGhlbiB0aGUgdHJlZSBtZXJnZVxuICAgICAgICAgICBmYWlscyB3aXRoIGFuICdpbmNvbnNpc3RlbnQgbWVyZ2UgZGVwdGgnIGVycm9yLlxuICAgICAgIEEuIFNldCBjdXJybm9kZSA9IGUxLiBvdmVybGFwbm9kZT0gb3ZlcmxhcChlMSksIChEZXB0aCBvZiBib3RoIGlzIHRoZSBzYW1lIGJlY2F1c2Ugb2YgQTEpXG4gICAgICAgQi4gR2VuZXJhdGUgYzEgPSBNZXJnZU5vZGUoY3Vycm5vZGUsb3ZlcmxhcG5vZGUsbW9kZSkuIChtb2RlID0gJ2tlZXAgY2hpbGRyZW4gb2YgY3Vycm5vZGUnLCdrZWVwIGNoaWxkcmVuIG9mIGJvdGgnKVxuICAgICAgIEMuIFNldCBjdXJybm9kZSA9ICBwYXJlbnQgb2YgY3Vycm5vZGUsIG92ZXJsYXBwbm9kZSA9IHBhcmVudCBvZiBvdmVybGFwcG5vZGUuXG4gICAgICAgRC4gUmVwZWF0IGZyb20gYyB1bnRpbCBjdXJybm9kZSA9IHIxLiBhbmQgb3ZlcmxhcHBub2RlPXIyXG4gICAgQXQgdGhpcyBwb2ludCB0aGUgbWVyZ2Ugcm9vdCBoYXMgYWxsIHRoZSBsZWFmcyBvcmlnaW5hdGluZyBmcm9tIHRoZSBvdmVybGFwcywgYnV0IGxhY2tzIG90aGVyIGxlYWZzIG9mIHIxLHIyXG5cbiAqIFxuICogMTEuIEZpbmQgYWxsIGxlYWZzIG9mIHIxIHRoYXQgYXJlIE5PVCBkZXNjZW5kZW50cyBvZiBvdmVybGFwcy4gRm9yIGVhY2ggZmluZCBpdHMgbmVhcmVzdCBhbmNlc3RvciB0aGF0IGlzIGFscmVhZHlcbiAqICAgIGluIHRoZSBtZXJnZSByb290IGZyb20gKDEwKS4gSm9pbiB0aGUgbWVyZ2Ugcm9vdCdzIHRyZWUgYXQgdGhhdCBwb2ludC5cbiAqIFxuICogMTIuIFJlcGVhdCBmb3IgcjIuXG4gKiBcbiAqIFxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmVlTWVyZ2Uge1xuICAgIHByb3RlY3RlZCByMDpOb2RlO1xuICAgIHByb3RlY3RlZCByMTpOb2RlO1xuICAgIHByb3RlY3RlZCBvdmVybGFwczpPdmVybGFwW107XG4gICAgcHJvdGVjdGVkIHIwaXNTaGFkb3c6Ym9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHIwOk5vZGUscjBpc1NoYWRvdzpib29sZWFuLHIxOk5vZGUsb3ZlcmxhcHM/Ok92ZXJsYXBbXSkge1xuICAgICAgICB0aGlzLnIwPXIwO1xuICAgICAgICB0aGlzLnIwaXNTaGFkb3c9cjBpc1NoYWRvdztcbiAgICAgICAgdGhpcy5yMT1yMTtcbiAgICAgICAgdGhpcy5vdmVybGFwcz1vdmVybGFwcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXB0aCBvZiBlIHRvIGl0cyBhbmNlc3RvciByLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSByIFxuICAgICAqIEBwYXJhbSBlIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBkZXB0aChyOk5vZGUsZTpOb2RlKSA6IG51bWJlciB7XG4gICAgICAgIGxldCBjZGVwdGg9MDtcbiAgICAgICAgd2hpbGUoZSAmJiBlIT1yKSB7XG4gICAgICAgICAgICBjZGVwdGgrKztcbiAgICAgICAgICAgIGU9ZS5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjZGVwdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgbWVyZ2UoKSA6IE1lcmdlZFRyZWUge1xuICAgICAgICBsZXQgdDA6U2luZ2xlVHJlZT1uZXcgU2luZ2xlVHJlZSh0aGlzLnIwKTtcbiAgICAgICAgbGV0IHQxOlNpbmdsZVRyZWU9bmV3IFNpbmdsZVRyZWUodGhpcy5yMSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXBzfHx0aGlzLm92ZXJsYXBzLmxlbmd0aD09MCkge1xuICAgICAgICAgICAgLy8gY3JlYXRlIGEgZGVmYXVsdCBvdmVybGFwIGJ5IHRha2luZyB0aGUgZGVlcGVzdCBtZW1iZXIgb2YgZWFjaCB0cmVlOlxuICAgICAgICAgICAgdGhpcy5vdmVybGFwcz1be1xuICAgICAgICAgICAgICAgIG4wOnQwLmRlZXBlc3QoKS5uLFxuICAgICAgICAgICAgICAgIG4xOnQxLmRlZXBlc3QoKS5uXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEwIEExLiBlcXVhbGl6ZSBkZXB0aCBieSBhZGRpbmcgZXh0cmEgZW1wdHkgbm9kZXMgaWYgbmVlZGVkOlxuICAgICAgICBsZXQgZmlyc3Q9dHJ1ZTtcbiAgICAgICAgbGV0IGxkZXB0aDA6bnVtYmVyO1xuICAgICAgICBsZXQgbGRlcHRoMTpudW1iZXI7XG4gICAgICAgIHRoaXMub3ZlcmxhcHMuZm9yRWFjaCgob3YpPT57XG4gICAgICAgICAgICBsZXQgZGVwdGgwPXRoaXMuZGVwdGgodGhpcy5yMCxvdi5uMCk7XG4gICAgICAgICAgICBsZXQgZGVwdGgxPXRoaXMuZGVwdGgodGhpcy5yMSxvdi5uMSk7XG4gICAgICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVwdGgwPGRlcHRoMSkge1xuICAgICAgICAgICAgICAgICAgICB0MC5zaGlmdERvd25CeShkZXB0aDEtZGVwdGgwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlcHRoMTxkZXB0aDApIHtcbiAgICAgICAgICAgICAgICAgICAgdDEuc2hpZnREb3duQnkoZGVwdGgwLWRlcHRoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxkZXB0aDA9ZGVwdGgwO1xuICAgICAgICAgICAgICAgIGxkZXB0aDE9ZGVwdGgxO1xuICAgICAgICAgICAgICAgIGZpcnN0PWZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsZGVwdGgwLWxkZXB0aDEhPWRlcHRoMC1kZXB0aDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEluY29uc2lzdGVudCBtZXJnZSBkZXB0aCwgbGFzdD0ke2xkZXB0aDAtbGRlcHRoMX0gbm93PSR7ZGVwdGgwLWRlcHRoMX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2VVcCh0MCx0MSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWVyZ2VzIGVxdWFsaXplZCBkZXB0aCB0cmVlcyB0MCx0MSBpbnRvIGEgTWVyZ2VkTm9kZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0MCBcbiAgICAgKiBAcGFyYW0gdDEgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG1lcmdlVXAodDA6U2luZ2xlVHJlZSx0MTpTaW5nbGVUcmVlKTogTWVyZ2VkVHJlZSB7XG4gICAgICAgIGxldCBtZXJnZVJvb3Q6TWVyZ2VkVHJlZTtcbiAgICAgICAgbGV0IGNvdW50ZXI9MDtcblxuICAgICAgICB0aGlzLm92ZXJsYXBzLmZvckVhY2goKG92KT0+e1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBTdGVwIDEwOlxuICAgICAgICAgICAgICAgIEEuIFNldCBjdXJybm9kZSA9IGUxLiBvdmVybGFwbm9kZT0gb3ZlcmxhcChlMSksIChEZXB0aCBvZiBib3RoIGlzIHRoZSBzYW1lIGJlY2F1c2Ugb2YgQTEpXG4gICAgICAgICAgICAgICAgQi4gR2VuZXJhdGUgYzEgPSBNZXJnZU5vZGUoY3Vycm5vZGUsb3ZlcmxhcG5vZGUsbW9kZSkuIChtb2RlID0gJ2tlZXAgY2hpbGRyZW4gb2YgY3Vycm5vZGUnLCdrZWVwIGNoaWxkcmVuIG9mIGJvdGgnKVxuICAgICAgICAgICAgICAgIEMuIFNldCBjdXJybm9kZSA9ICBwYXJlbnQgb2YgY3Vycm5vZGUsIG92ZXJsYXBwbm9kZSA9IHBhcmVudCBvZiBvdmVybGFwcG5vZGUuXG4gICAgICAgICAgICAgICAgRC4gUmVwZWF0IGZyb20gYyB1bnRpbCBjdXJybm9kZSA9IHIxLiBhbmQgb3ZlcmxhcHBub2RlPXIyXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgY3Vycm5vZGUwOlNpbmdsZVRyZWU9dDAuZmluZChvdi5uMCk7XG4gICAgICAgICAgICBsZXQgY3Vycm5vZGUxOlNpbmdsZVRyZWU9dDEuZmluZChvdi5uMSk7XG5cbiAgICAgICAgICAgIGxldCBtZXJnZWQ9bmV3IE1lcmdlZFRyZWUoY3Vycm5vZGUwLGN1cnJub2RlMSk7XG5cbiAgICAgICAgICAgIHdoaWxlKGN1cnJub2RlMCE9dDAgJiYgY3Vycm5vZGUxIT10MSkge1xuICAgICAgICAgICAgICAgIGN1cnJub2RlMD1jdXJybm9kZTAucGFyZW50O1xuICAgICAgICAgICAgICAgIGN1cnJub2RlMT1jdXJybm9kZTEucGFyZW50O1xuXG4gICAgICAgICAgICAgICAgbWVyZ2VkPW1lcmdlZC5tZXJnZVBhcmVudChjdXJybm9kZTAsY3Vycm5vZGUxKTtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSb290KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZz1tZXJnZVJvb3QuZmluZChtZXJnZWQubjAsbWVyZ2VkLm4xKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy50YWtlb3ZlckNoaWxkcmVuKG1lcmdlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gam9pbmVkIHRvIHRoZSBleGlzdGluZyByb290J3MgaGVpcmFyY2h5IHNvIGRvbmUgZm9yIHRoaXMgcnVuLlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIW1lcmdlUm9vdCkgLy8gZmlyc3QgcnVuXG4gICAgICAgICAgICAgICAgbWVyZ2VSb290PW1lcmdlZDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNvdW50ZXI+MCAmJiAoY3Vycm5vZGUwPT10MCAmJiBjdXJybm9kZTE9PXQxKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYE1FUkdFLSBGaW5pc2hlZCBvdmVybGFwIG1lcmdlICMke2NvdW50ZXJ9IHdpdGhvdXQgam9pbmluZyB0byB0aGUgZXhpc3Rpbmcgcm9vdC5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICB9KTtcblxuICAgIC8qIDExLiBGaW5kIGFsbCBsZWFmcyBvZiByMCB0aGF0IGFyZSBOT1QgZGVzY2VuZGVudHMgb2Ygb3ZlcmxhcHMuIEZvciBlYWNoIGZpbmQgaXRzIG5lYXJlc3QgYW5jZXN0b3IgdGhhdCBpcyBhbHJlYWR5XG4gICAgICAgIGluIHRoZSBtZXJnZSByb290IGZyb20gKDEwKS4gSm9pbiB0aGUgbWVyZ2Ugcm9vdCdzIHRyZWUgYXQgdGhhdCBwb2ludC4gKi9cbiAgICBcbiAgICAvKiBOTyBORUVEPCBhcyB0aGlzIGNhbiBiZSBkb25lICdvbiB0aGUgZmx5JyBkdXJpbmcgY2hpbGQgVGFyZ2V0Tm9kZSBnZW5lcmF0aW9uIFxuICAgIGxldCBvdnNldDpTZXQ8Tm9kZT49bmV3IFNldCgpO1xuICAgIHRoaXMub3ZlcmxhcHMuZm9yRWFjaCgob3YpPT57XG4gICAgICAgIG92c2V0LmFkZChvdi5uMCk7XG4gICAgfSlcbiAgICBsZXQgbGVhZnM6Tm9kZVtdPXQwLmxlYWZzRXhjZXB0SW4ob3ZzZXQpO1xuXG4gICAgbGVhZnMuZm9yRWFjaCgobGVhZik9PntcbiAgICAgICAgbGV0IGN1cnJub2RlOk5vZGU9bGVhZjtcblxuICAgICAgICB3aGlsZShjdXJybm9kZSE9dDAubikge1xuICAgICAgICAgICAgY3Vycm5vZGU9Y3Vycm5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgbGV0IGV4aXN0aW5nPW1lcmdlUm9vdC5maW5kMChjdXJybm9kZSk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZy50YWtlb3ZlckNoaWxkcmVuKG1lcmdlZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIGpvaW5lZCB0byB0aGUgZXhpc3Rpbmcgcm9vdCdzIGhlaXJhcmNoeSBzbyBkb25lIGZvciB0aGlzIHJ1bi5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSkgKi9cblxuICAgIGlmICh0aGlzLnIwaXNTaGFkb3cpXG4gICAgICAgIG1lcmdlUm9vdC5zaGFkb3c9dHJ1ZVxuXG4gICAgcmV0dXJuIG1lcmdlUm9vdDtcblxuICAgIH1cblxuICAgIFxufVxuXG5leHBvcnQgY2xhc3MgVGVzdHMge1xuICAgIHRlc3QxKCkge1xuICAgICAgICBsZXQgYXNzQT1JbXBsZW1lbnRhdGlvbnMuZ2V0QXNzZXRGYWN0b3J5KCkuZ2V0KHtuYW1lOidBLmh0bWwnLHR5cGU6QXNzZXRUeXBlLnBhZ2V9KTtcbiAgICAgICAgbGV0IGFzc0I9SW1wbGVtZW50YXRpb25zLmdldEFzc2V0RmFjdG9yeSgpLmdldCh7bmFtZTonQi5odG1sJyx0eXBlOkFzc2V0VHlwZS5wYWdlfSk7XG5cbiAgICAgICAgbGV0IGFsbDpQcm9taXNlPERvY3VtZW50PltdPVtdO1xuICAgICAgICBhbGwucHVzaCgoYXNzQSBhcyBEb2N1bWVudEFzc2V0KS5nZXREb2N1bWVudCgpKTtcbiAgICAgICAgYWxsLnB1c2goKGFzc0IgYXMgRG9jdW1lbnRBc3NldCkuZ2V0RG9jdW1lbnQoKSk7XG5cbiAgICAgICAgUHJvbWlzZS5hbGwoYWxsKVxuICAgICAgICAudGhlbigoZG9jcyk9PntcbiAgICAgICAgICAgIGxldCByMD1kb2NzWzBdLnF1ZXJ5U2VsZWN0b3IoJyNyb290YScpO1xuICAgICAgICAgICAgbGV0IHIxPWRvY3NbMV0ucXVlcnlTZWxlY3RvcignI3Jvb3RiJyk7XG4gICAgICAgICAgICBsZXQgb3ZlcmxhcHM6T3ZlcmxhcFtdPVtcbiAgICAgICAgICAgICAgIC8vIHtuMDpkb2NzWzBdLnF1ZXJ5U2VsZWN0b3IoJyNhMScpLG4xOmRvY3NbMV0ucXVlcnlTZWxlY3RvcignI2IxJyl9LFxuICAgICAgICAgICAgICAgLy8ge24wOmRvY3NbMF0ucXVlcnlTZWxlY3RvcignI2EyJyksbjE6ZG9jc1sxXS5xdWVyeVNlbGVjdG9yKCcjYjInKX1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGxldCB0bT1uZXcgVHJlZU1lcmdlKHIwLGZhbHNlLHIxLG92ZXJsYXBzKTtcbiAgICAgICAgICAgIGxldCB0PXRtLm1lcmdlKCk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHQpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgIH1cbn0iLCJpbXBvcnQgeyBDb0VsZW1lbnQsIGlzQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4uL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgVGFyZ2V0Tm9kZSB9IGZyb20gXCIuLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBNZXJnZWRUcmVlLCBPdmVybGFwIH0gZnJvbSBcIi4vTWVyZ2VkVHJlZVwiO1xuaW1wb3J0IHsgTWVyZ2VkVGFyZ2V0Tm9kZSB9IGZyb20gXCIuL01lcmdlZFRhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRhcmdldE5vZGVJbXBsIH0gZnJvbSBcIi4vVGFyZ2V0Tm9kZUltcGxcIjtcbmltcG9ydCB7IFRyZWVNZXJnZSB9IGZyb20gXCIuL1RyZWVNZXJnZVwiO1xuaW1wb3J0IHsgRXZlbnRIYW5kbGVycyB9IGZyb20gXCIuLi9odG1sL0V2ZW50SGFuZGxlcnNcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuaW1wb3J0IHsgR2V0IH0gZnJvbSBcIi4uL0dldFwiO1xuXG5cblxuLyoqXG4gKiBBIHRhcmdldCBub2RlIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSB0ZW1wbGF0ZSBkb2N1bWVudCdzIHRyZWUsIGFzIGluc2VydGVkIGludG8gdGhlIGNhbGxlcidzIFRhcmdldFRyZWVcbiAqIFxuICogS2VlcHMgb24gZGVsaXZlcmluZyB0aGUgdGVtcGxhdGUgZG9jJ3Mgbm9kZXMgdW50aWwgdGhlICdpbnNlcnRpb24tcm9vdCcgbm9kZVxuICogaXMgcmVhY2hlZCwgd2hlcmV1cG9uIHN3aXRjaGVzIHRvIHRoZSBNZXJnZWRUYXJnZXROb2RlIFxuICovXG5leHBvcnQgY2xhc3MgQmVmb3JlTWVyZ2VUYXJnZXROb2RlIGV4dGVuZHMgVGFyZ2V0Tm9kZUltcGwge1xuICAgIHByb3RlY3RlZCBjdnQwOkNvbnZlcnRlcjxUaGlzPjtcbiAgICBwcm90ZWN0ZWQgY3Z0MTpDb252ZXJ0ZXI8VGhpcz47XG4gICAgcHJvdGVjdGVkIHJlcGxhY2VkTm9kZTpOb2RlOyAvLyAgc2VlICdnZXRSZXBsYWNlZE5vZGUoKScgLSB0aGUgbm9kZSB0aGF0IHdhcyByZXBsYWNlZCBieSB0aGlzIHRlbXBsYXRlLCBpdHMgY29udGVudHMgd2lsbCBiZW1lcmdlZCB0byB0aGUgdGVtcGxhdGUncyBpbnNlcnRpb24tcm9vdFxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHNub2RlIFRoZSBzbm9kZSB0byB1c2UgYmVmb3JlIHRoZSBtZXJnZSBwb2ludCAoZnJvbSB0aGUgdGVtcGxhdGUgb3IgY2FsbGVlKVxuICAgICAqIEBwYXJhbSBwYXJlbnQgXG4gICAgICogQHBhcmFtIGN2dDAgVGhlIGNhbGxlcidzIGN2dFxuICAgICAqIEBwYXJhbSBjdnQxIFRoZSBjYWxsZWUncyBjdnRcbiAgICAgKiBAcGFyYW0gcmVwbGFjZWQgVGhlIGNhbGxlcidzIHJlcGxhY2VkIHNub2RlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNub2RlOk5vZGUscGFyZW50PzpUYXJnZXROb2RlLGN2dDA/OkNvbnZlcnRlcjxUaGlzPixjdnQxPzpDb252ZXJ0ZXI8VGhpcz4scmVwbGFjZWQ/Ok5vZGUpIHtcbiAgICAgICAgc3VwZXIoc25vZGUsIHVuZGVmaW5lZCxwYXJlbnQpO1xuICAgICAgICB0aGlzLmN2dDAgPSBjdnQwO1xuICAgICAgICB0aGlzLmN2dDEgPSBjdnQxO1xuICAgICAgICB0aGlzLnJlcGxhY2VkTm9kZT1yZXBsYWNlZDsgXG4gICAgICAgIGlmICh0aGlzLnJlcGxhY2VDaGlsZCkge1xuICAgICAgICAgICAgLy90aGlzLmNvcHlFdmVudEhhbmRsZXJzRnJvbVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29udmVydGVycyAtIGlmIHplcm8sIHRoZW4gY3Z0MCAoQ2FsbGVyKSwgZWxzZSBjdnQxIChjYWxsZWUpXG4gICAgICogXG4gICAgICogQHBhcmFtIHplcm8gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEN2dCh6ZXJvOmJvb2xlYW4pIDogQ29udmVydGVyPFRoaXM+IHtcbiAgICAgICAgbGV0IGM6QmVmb3JlTWVyZ2VUYXJnZXROb2RlPXRoaXM7XG5cbiAgICAgICAgaWYgKHplcm8pIHtcbiAgICAgICAgICAgIHdoaWxlKCFjLmN2dDApICBcbiAgICAgICAgICAgICAgICBjPWMucGFyZW50IGFzIEJlZm9yZU1lcmdlVGFyZ2V0Tm9kZTtcbiAgICAgICAgICAgIHJldHVybiBjLmN2dDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSghYy5jdnQxKSAgXG4gICAgICAgICAgICAgICAgYz1jLnBhcmVudCBhcyBCZWZvcmVNZXJnZVRhcmdldE5vZGU7XG4gICAgICAgICAgICByZXR1cm4gYy5jdnQxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbm9kZSBpbiBjYWxsZXIgdGhhdCB3YXMgcmVwbGFjZWQgYnkgdGhlIHRlbXBsYXRlLiBFRywgaW4gdGhlIGZvbGxvd2luZywgaXQgd2lsbCBiZSB0aGUgPGNvLWZvbz4gRUxlbWVudFxuICAgICAqIGBgYCBcbiAgICAgKiB0aGlzLmltcG9ydCh7bmFtZTonZm9vLmh0bWwnfSwnY28tZm9vJyk7XG4gICAgICogXG4gICAgICogPGJvZHk+XG4gICAgICogICAgPGNvLWZvbz5cbiAgICAgKiAgICAgICAgPGRpdj5CYXI8L2Rpdj5cbiAgICAgKiAgICA8L2NvLWZvbz5cbiAgICAgKiA8L2JvZHk+XG4gICAgICogXG4gICAgICogYGBgXG4gICAgICogIFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZXBsYWNlZE5vZGUoKSB7XG4gICAgICAgIGxldCBjOkJlZm9yZU1lcmdlVGFyZ2V0Tm9kZT10aGlzO1xuXG4gICAgICAgIHdoaWxlKCFjLnJlcGxhY2VkTm9kZSkgIFxuICAgICAgICAgICAgYz1jLnBhcmVudCBhcyBCZWZvcmVNZXJnZVRhcmdldE5vZGU7XG4gICAgICAgIHJldHVybiBjLnJlcGxhY2VkTm9kZTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgY2hpbGQgc25vZGUgKGFzIHJldHVybmVkIGJ5IHNvdXJjZUNoaWxkTm9kZXMoKSksIGNyZWF0ZSBpdHMgVGFyZ2V0Tm9kZVxuICAgICAqIHdpdGggY29tcG9uZW50XG4gICAgICogXG4gICAgICogVGhlIGltcGxlbWVudGF0aW9uIHdpbGw6XG4gICAgICogICAgICAxLiB1c2UgaXRzIG93bmluZyBDb252ZXJ0ZXIgdG8gY3JlYXRlIHRoZSBDb0VsZW1lbnQgZm9yIHRoZSBuZXcgY2hpbGQuXG4gICAgICogICAgICAyLiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBUYXJnZXROb2RlIGFzIHRoZSBjaGlsZFxuICAgICAqICAgICAgMy4gQWRkIHRoaXMgQ29FbGVtZW50IHRvIHRoZSBjaGlsZCdzICdjb21wb25lbnQnXG4gICAgICogXG4gICAgICogQHBhcmFtIHNub2RlIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgICBwdWJsaWMgbWFrZVRhcmdldE5vZGUoc25vZGU6Tm9kZSxjdnQ6Q29udmVydGVyPFRoaXM+KTogVGFyZ2V0Tm9kZSB7XG4gICAgICAgIGxldCBjdG46VGFyZ2V0Tm9kZTtcbiAgICAgICAgaWYgKHNub2RlLm5vZGVUeXBlPT1Ob2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgbGV0IGU6RWxlbWVudD0oc25vZGUgYXMgRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGxldCBpcm9vdD1lLmdldEF0dHJpYnV0ZSgnaW5zZXJ0aW9uLXJvb3QnKTtcbiAgICAgICAgICAgIGlmIChpcm9vdCkge1xuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwcz10aGlzLm1ha2VPdmVybGFwcygpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHtjYWxsZXJSb290LHNoYWRvd309dGhpcy5nZXRDYWxsZXJSb290KCk7Ly8gKHRoaXMuZ2V0UmVwbGFjZWROb2RlKCkgYXMgRWxlbWVudCkuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgICAgICAgICBsZXQgdHJlZW09bmV3IFRyZWVNZXJnZShjYWxsZXJSb290LHNoYWRvdyxlLG92ZXJsYXBzKTtcbiAgICAgICAgICAgICAgICBsZXQgbXQ9dHJlZW0ubWVyZ2UoKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCc9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PScpO1xuICAgICAgICAgICAgICAgIC8vbXQucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBjdG49bmV3IE1lcmdlZFRhcmdldE5vZGUobXQsdGhpcy5nZXRDdnQodHJ1ZSksdGhpcy5nZXRDdnQoZmFsc2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWN0bilcbiAgICAgICAgICAgIGN0bj1uZXcgQmVmb3JlTWVyZ2VUYXJnZXROb2RlKHNub2RlLHRoaXMpO1xuXG4gICAgICAgIGN0bi5wYXJlbnQ9dGhpczsgLy8gc28gaWYgdGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBDb0VsZW1lbnQgdHJpZXMgdG8gYWNjZXNzIHBhcmVudCwgaXQgd2lsbCB3b3JrXG4gICAgICAgIGxldCBjbz1jdG4uZ2V0T3duZXIoY3Z0KS5tYWtlQ29FbGVtZW50KGN0bik7XG4gICAgICAgIGlmIChpc0NvRWxlbWVudChjbykpIHtcbiAgICAgICAgICAgIGN0bi5jb21wb25lbnQ9Y287XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb1xuICAgICAgICAgICAgLnRoZW4oKGNvKT0+e1xuICAgICAgICAgICAgICAgIGlmIChjby5nZXRUTigpIT1jdG4gJiYgY3RuLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjdG4ucGFyZW50LnJlcGxhY2VDaGlsZChjdG4sY28uZ2V0VE4oKSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvY3RuPWN0bjtcbiAgICAgICAgICAgICAgICAgICAgY3RuPWNvLmdldFROKCk7XG4gICAgICAgICAgICAgICAgICAgIGN0bi5yZXBsYWNlZD1vY3RuLnNub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjby5nZXRDdnQoKS5pbnZhbGlkYXRlKGN0bik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3RuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5vZGUgZnJvbSB0aGUgQ2FsbGVyIHRoYXQgc2hvdWxkIGJlIG1hcHBlZCB0byB0aGUgdGVtbHBsYXRlJ3MgaW5zZXJ0aW9uLXJvb3Qgbm9kZSBkdXJpbmcgbWVyZ2UuXG4gICAgICogJ3NoYWRvdycgaXMgdHJ1ZSBpZiB0aGVyZSBpcyBubyBkZWNsYXJlZCByb290IGF0dHJpYnV0ZSB3aXRoaW4gdGhlIHJlcGxhY2VkIG5vZGUuIEluIHRoaXMgY2FzZVxuICAgICAqIHRoZSBjYWxsZWVyIHJvb3QgaXMgdGhlIHJlcGxhY2VkIGVsZW1lbnQgaXRzZWxmLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRDYWxsZXJSb290KCkgOiB7Y2FsbGVyUm9vdDpFbGVtZW50LHNoYWRvdzpib29sZWFufSB7XG4gICAgICAgIGxldCByZXQ9e1xuICAgICAgICAgICAgY2FsbGVyUm9vdDpudWxsLFxuICAgICAgICAgICAgc2hhZG93OmZhbHNlICAgICAgICAgICAgXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHRvcDpFbGVtZW50PSh0aGlzLmdldFJlcGxhY2VkTm9kZSgpIGFzIEVsZW1lbnQpO1xuICAgICAgICBsZXQgcm9vdD10b3AucXVlcnlTZWxlY3RvcignW3Jvb3RdJyk7XG5cbiAgICAgICAgcmV0LmNhbGxlclJvb3Q9cm9vdHx8dG9wO1xuICAgICAgICByZXQuc2hhZG93PSFyb290O1xuXG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbWFrZU92ZXJsYXBzKCkgOiBPdmVybGFwW10ge1xuICAgICAgICBsZXQgb3ZlcmxhcHM6T3ZlcmxhcFtdPVtdO1xuICAgICAgICBsZXQgaG9sZXM9dGhpcy5nZXRDdnQoZmFsc2UpLmdldERvY3VtZW50KCkucXVlcnlTZWxlY3RvckFsbCgnW2hvbGVdJyk7XG4gICAgICAgIGlmIChob2xlcy5sZW5ndGg9PTApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQgcGx1Z3M6TWFwPHN0cmluZyxOb2RlW10+O1xuICAgICAgICBmb3IobGV0IGk9MDtpPGhvbGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIGxldCBob2xlPWhvbGVzW2ldO1xuICAgICAgICAgICAgbGV0IGhvbGVpZD1ob2xlLmdldEF0dHJpYnV0ZSgnaG9sZScpO1xuICAgICAgICAgICAgaWYgKGhvbGVpZCkge1xuICAgICAgICAgICAgICAgIGlmICghcGx1Z3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcGx1Z3M9dGhpcy5tYWtlUGx1Z3NNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwbHVncylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHBsdWc9cGx1Z3MuZ2V0KGhvbGVpZCk7XG4gICAgICAgICAgICAgICAgaWYgKHBsdWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcGx1Zy5mb3JFYWNoKChwbCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsYXBzLnB1c2goe24wOnBsLG4xOmhvbGV9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG92ZXJsYXBzO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgbWFrZVBsdWdzTWFwKCk6IE1hcDxzdHJpbmcsIE5vZGVbXT4ge1xuICAgICAgICBsZXQgc2lkPXRoaXMuZ2V0Q2FsbGVyUm9vdCgpLmNhbGxlclJvb3QuZ2V0QXR0cmlidXRlKCdzaWQnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZVBsdWdzRnJvbU5vZGUodGhpcy5nZXRDYWxsZXJSb290KCkuY2FsbGVyUm9vdCxzaWQsbnVsbCx0cnVlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgbWFrZVBsdWdzRnJvbU5vZGUobm9kZTpOb2RlLHNpZDpzdHJpbmcsbWFwOk1hcDxzdHJpbmcsTm9kZVtdPixpZ25vcmVub2RlPzpib29sZWFuKSA6IE1hcDxzdHJpbmcsTm9kZVtdPiB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlPT1Ob2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgaWYgKCFpZ25vcmVub2RlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBsdWdob2xlPShub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgncGx1Z2hvbGUnKTtcbiAgICAgICAgICAgICAgICBpZiAocGx1Z2hvbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsdWdob2xlLnN0YXJ0c1dpdGgoc2lkKycuJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbHVnaG9sZT1wbHVnaG9sZS5zdWJzdHJpbmcoc2lkLmxlbmd0aCsxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG9lc250IG1hdGNoIG91cnMgLSBhYm9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdob2xlPW51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGx1Z2hvbGUuaW5kZXhPZignLicpPj0wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBubyBzaWQgaW4gdGhlIGNhbGxlclJvb3QsIGJ1dCB0aGUgcGx1Z2h1bGUgaGFzIGEgLiBzbyBubyBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgcGx1Z2hvbGU9bnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbHVnaG9sZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwPW5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbGw9bWFwLmdldChwbHVnaG9sZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0KHBsdWdob2xlLGFsbD1bXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGwucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gaGFuZGxlIGNoaWxkcmVuXG4gICAgICAgICAgICBmb3IobGV0IGk9MDtpPG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgbWFwPXRoaXMubWFrZVBsdWdzRnJvbU5vZGUobm9kZS5jaGlsZE5vZGVzW2ldLHNpZCxtYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBhbGwgYXR0cmlidXRlIGJhc2VkIGV2ZW50IGhhbmRsZXJzIChlaXRoZXIgJ29uWFhYJyBvciAnY28tb25YWFgnKSBpbiBzbm9kZSB0byB0aGUgXG4gICAgICogdG5vZGUgYXMgJ2FkZEV2ZW50TGlzdGVuZXIoJ3h4eHgnKS5cbiAgICAgKiBcbiAgICAgKiBPdmVycmlkZSBzbyB0aGF0IGlmIHdlIGFyZSB0aGUgdG9wIGxldmVsIGFuZCBoYXZlICdyZXBsYWNlZCcsIHdlIGNhbiBpbnN0YWxsIHRoZSByZXBsYWNlZCBlbGVtZW50c1xuICAgICAqIGV2ZW50IGhhbmRsZXJzIHVzaW5nIGN2dDAsIHRoZW4gYWRkIGFueVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhdHRhY2hFdmVudEhhbmRsZXJzRnJvbUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGlmICghdGhpcy5yZXBsYWNlZE5vZGUpIHtcbiAgICAgICAgICAgIHN1cGVyLmF0dGFjaEV2ZW50SGFuZGxlcnNGcm9tQXR0cmlidXRlcygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWVyZ2UgdGhlIGV2ZW50IGhhbmRsZXJzLiBmaXJzdCBhcHBseSB0aGUgb25lcyBmcm9tIHJlcGxhY2VkLiB0aGVuIGZyb20gMiBcbiAgICAgICAgaWYgKHRoaXMudG5vZGUgJiYgdGhpcy5zbm9kZSAmJiB0aGlzLmNvbXBvbmVudCkge1xuICAgICAgICAgICAgbGV0IGVoPW5ldyBFdmVudEhhbmRsZXJzKHRoaXMudG5vZGUgYXMgRWxlbWVudCx0aGlzKTtcblxuICAgICAgICAgICAgZWguYWRkRXZlbnRIYW5kbGVyc0Zyb21BdHRyc09mKHRoaXMuc25vZGUgYXMgRWxlbWVudCx0aGlzLmNvbXBvbmVudC5nZXRDdnQoKSk7XG4gICAgICAgICAgICBlaC5hZGRFdmVudEhhbmRsZXJzRnJvbUF0dHJzT2YodGhpcy5yZXBsYWNlZE5vZGUgYXMgRWxlbWVudCx0aGlzLmN2dDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHNvIHdlIGNhbiBjb3ZlciB0aGUgcmVwbGFjZWROb2RlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBtYXRjaGVyIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBtYXRjaFNub2RlKG1hdGNoZXI6KHNub2RlOk5vZGUpPT5ib29sZWFuKSA6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VwZXIubWF0Y2hTbm9kZShtYXRjaGVyKSAgfHwgKHRoaXMucmVwbGFjZWROb2RlICYmIHRoaXMucmVwbGFjZWROb2RlIT10aGlzLnJlcGxhY2VkICYmIG1hdGNoZXIodGhpcy5yZXBsYWNlZE5vZGUpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcnVuR2V0c0ZvckFsbEN2dHMoc25vZGU6Tm9kZSkge1xuICAgICAgICBpZiAodGhpcy5jdnQwKVxuICAgICAgICAgICAgdGhpcy5ydW5HZXRzRm9yQ3Z0KHRoaXMuY3Z0MCxzbm9kZSk7XG4gICAgICAgIGlmICh0aGlzLmN2dDEpXG4gICAgICAgICAgICB0aGlzLnJ1bkdldHNGb3JDdnQodGhpcy5jdnQxLHNub2RlKTtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IEFzc2V0LCBBc3NldEZhY3RvcnksIEFzc2V0SUQgfSBmcm9tIFwiLi4vQXNzZXRcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IGN0biwgZ2V0QXR0ciwgVGFyZ2V0Tm9kZSB9IGZyb20gXCIuLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBHZXRBdHRyVCwgVGhpcyB9IGZyb20gXCIuLi9UaGlzXCI7XG5pbXBvcnQgeyBBamF4Q2FjaGUgfSBmcm9tIFwiLi4vQWpheFwiO1xuaW1wb3J0IHsgSW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uL0ltcGxlbWVudGF0aW9uc1wiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgVGVtcGxhdGl6YWJsZSB9IGZyb20gXCIuLi9UZW1wbGF0aXphYmxlXCI7XG5pbXBvcnQgeyBCZWZvcmVNZXJnZVRhcmdldE5vZGUgfSBmcm9tIFwiLi9CZWZvcmVNZXJnZVRhcmdldE5vZGVcIjtcbmltcG9ydCB7IEdldCB9IGZyb20gXCIuLi9HZXRcIjtcblxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBUaGlzIGludGVyZmFjZS5cbiAqIEJ5IGRlZmF1bHQgdGhpcyBjbGFzcyBpcyB1c2VkIHRvIGltcGxlbWVudCBgdGhpc2AgZm9yIGEgY29tbCBwYWdlLlxuICogXG4gKiBZb3UgY2FuIG92ZXJyaWRlIHRoaXMgYnkgc3ViY2xhc3NpbmcgdGhpcyBjbGFzcywgYWRkaW5nIHBhZ2UgZnVuY3Rpb25hbGl0eSB0byBpdCwgYW5kIFxuICogc2V0dGluZyBpdCBpbnNpZGUgYSBwYWdlIGJ5IHVzZSBvZiB0aGUgPG1ldGEgbmFtZT1cInRoaXNjbGFzc1wiIGNvbnRlbnQ9XCJwYXRoL1RvWW91ckNsYXNzXCI+IHRhZyBpbiB0aGVcbiAqIDxoZWFkPiBvZiB0aGUgY29tbCBodG1sIHBhZ2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VUaGlzIGltcGxlbWVudHMgVGhpcywgVGVtcGxhdGl6YWJsZSB7XG5cdHB1YmxpYyBkb2N1bWVudDogRG9jdW1lbnQ7XG5cdHByb3RlY3RlZCBjdnQ6IENvbnZlcnRlcjx0aGlzPjtcblx0cHJvdGVjdGVkIHVpZDogc3RyaW5nO1xuXHRwcm90ZWN0ZWQgZm5HZXRBdHRyOiBHZXRBdHRyVDtcblx0cHVibGljIHBhcmFtZXRlcnM6YW55O1xuXG5cdGNvbnN0cnVjdG9yKGN2dDogQ29udmVydGVyPFRoaXM+LCBzdGF0ZUZyb20/OiBCYXNlVGhpcywgZm5HZXRBdHRyPzogR2V0QXR0clQpIHtcblx0XHR0aGlzLmZuR2V0QXR0ciA9IGZuR2V0QXR0cjtcblx0XHR0aGlzLmN2dCA9IGN2dCBhcyBDb252ZXJ0ZXI8dGhpcz47XG5cdFx0dGhpcy5jdnQuZ2V0Um9vdCgpLmNvbXBvbmVudCA9IHRoaXM7IC8vIHNvIHRoZSB0b3AgJ2RvY3VtZW50JyBlbGVtZW50IGlzIHJlbmRlcmVkIGJ5IHVzXG5cdFx0dGhpcy5kb2N1bWVudCA9IGN2dC5nZXREb2N1bWVudCgpO1xuXHRcdGlmIChzdGF0ZUZyb20pIHtcblx0XHRcdC8vIGNvcHkgc3RhdGUgYWxyZWFkeSBpbml0aWFsaXplZCBpbiB0aGUgb3JpZ2luYWwgb2JqZWN0XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIGNhc3RUb1R5cGU8VD4odmFsdWU6IHN0cmluZywgdHlwZTogbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbik6IFQge1xuXHRcdC8vIGNvbnZlcnRcblx0XHRpZiAodHlwZW9mIHR5cGUgPT0gJ251bWJlcicpXG5cdFx0XHRyZXR1cm4gTnVtYmVyLnBhcnNlRmxvYXQodmFsdWUpIGFzIGFueTtcblx0XHRpZiAodHlwZW9mIHR5cGUgPT0gJ2Jvb2xlYW4nKVxuXHRcdFx0cmV0dXJuICh2YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKSA9PSAndHJ1ZScpIGFzIGFueTtcblx0XHRyZXR1cm4gKHZhbHVlIGFzIGFueSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0QXR0ckludDxUIGV4dGVuZHMgKG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4pID0gc3RyaW5nPihhdHRyOiBzdHJpbmcsIGRlZnZhbHVlPzogVCk6IFQge1xuXHRcdGlmICh0aGlzLmZuR2V0QXR0cikge1xuXHRcdFx0bGV0IHZhbHVlID0gdGhpcy5mbkdldEF0dHIoYXR0cik7XG5cdFx0XHRpZiAoIXZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gZGVmdmFsdWU7XG5cblx0XHRcdHJldHVybiB0aGlzLmNhc3RUb1R5cGU8VD4odmFsdWUsIGRlZnZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGdldEF0dHI8VD4odGhpcy5jdnQsIHRoaXMuZ2V0VE4oKS5zbm9kZSwgYXR0ciwgZGVmdmFsdWUgYXMgYW55LHRoaXMuZ2V0VE4oKSk7XG5cdH1cblxuXHQvKipcbiAgICAgKiBGaW5kcyB0aGlzIGVsZW1lbnQncyAwIGJhc2VkIGl0ZXJhdGlvbiBpbiBpdHMgcGFyZW50IHdpdGggdGhlIHRhZyAncGFyZW50VGFnJ1xuXHQgKiBUaGUgbGFzdCBwYXNzZWQgY3VycnRuIHRvIGV4cGFuZFN0cmluZyB3aWxsIGJlIHVzZWQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHBhcmVudFRhZyBcbiAgICAgKiBAcmV0dXJucyBpdGVyYXRpb24gbnVtYmVyO1xuICAgICAqL1xuICAgIHB1YmxpYyBpdGVyKHBhcmVudFRhZzpzdHJpbmcpIDogbnVtYmVyIHtcblx0XHRsZXQgY3VycnRuOlRhcmdldE5vZGU9KHRoaXMgYXMgYW55KS5fX2N1cnJ0bjsgLy8gc2VlIENvbnZlcnRlckltcGwuZXhwYW5kU3RyaW5nKCk7XG5cdFx0aWYgKCFjdXJydG4pXG5cdFx0XHRjdXJydG49dGhpcy5nZXRUTigpO1xuXG4gICAgICAgIGxldCBwaSA9IHRoaXMuZ2V0Q3Z0KCkuZmluZFBhcmVudEFuZEl0ZXJhdGlvbihjdXJydG4sKHRuKT0+e1xuICAgICAgICAgICAgcmV0dXJuICh0bi5zbm9kZSBhcyBFbGVtZW50KS50YWdOYW1lLnRvTG93ZXJDYXNlKCk9PXBhcmVudFRhZzsgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChwaT8gIHBpLml0ZXJhdGlvbjowKTtcbiAgICB9XG5cblxuXG5cdHB1YmxpYyBhdHRyPFQgZXh0ZW5kcyAobnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbikgPSBzdHJpbmc+KGF0dHI6IHN0cmluZywgZGVmdmFsdWU/OiBUKTogVCB7XG5cdFx0aWYgKHRoaXNbJ3BhcmFtZXRlcnMnXSAmJiBhdHRyIGluIHRoaXNbJ3BhcmFtZXRlcnMnXSkge1xuXHRcdFx0bGV0IHJhd3YgPSB0aGlzWydwYXJhbWV0ZXJzJ11bYXR0cl07XG5cdFx0XHRpZiAodHlwZW9mIHJhd3YgIT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiByYXd2ID09IHR5cGVvZiBkZWZ2YWx1ZSlcblx0XHRcdFx0XHRyZXR1cm4gcmF3djtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2FzdFRvVHlwZSgnJyArIHJhd3YsIGRlZnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXR0ckludDxUPihhdHRyLCBkZWZ2YWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdGV4dCBjb250ZW50IG9mIHRoaXMgRUxlbWVudCwgYWZ0ZXIgZXZhbHVhdGluZyBhbnkgJHt9IGV4cHJlc3Npb25zLlxuXHQgKi9cblx0cHVibGljIGNvbnRlbnQoKSA6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN2dCgpLmV4cGFuZFN0cmluZygodGhpcy5nZXRUTigpLnNub2RlIGFzIHVua25vd24gYXMgRWxlbWVudCkudGV4dENvbnRlbnQsdGhpcy5nZXRUTigpKTtcbiAgICB9XG5cblxuXHQvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwYXJhbWV0ZXIgYmxvY2sgYXMgc2V0IGJ5IGFueSBwYXJlbnQgQ29tcG9uZW50IGZvciB1c1xuICAgICAqL1xuICAgIHB1YmxpYyBwYXJhbXMoKSA6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMucGFyYW1ldGVycztcblx0fVxuXG5cdHB1YmxpYyBnZXRJZCgpOiBzdHJpbmcge1xuXHRcdGlmICghdGhpcy51aWQpIHtcblx0XHRcdHRoaXMudWlkID0gJ3RoaXMnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnVpZDtcblx0fVxuXG5cdHB1YmxpYyBhc3NldElkKCk6IEFzc2V0SUQge1xuXHRcdHJldHVybiB0aGlzLmN2dC5nZXRBc3NldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW1wb3J0IGEgQ09NTCBmYWN0b3J5LlxuXHQgKiBcblx0ICogQHBhcmFtIGltcG9ydGVlIFRoZSBmdWxseSBxdWFsaWZpZWQgcGF0aCB0byBhIENPTUwgQ29FbGVtZW50RmFjdG9yeSAoZS5nLiBgY29tbC9lbGVtZW50L0NvRmllbGRzYCkgb3IgdGhlIGFzc2V0SWQgb2YgYSBDT01MIHBhZ2UuXG5cdCAqIEBwYXJhbSB0YWdGb3JBc3NldCBvcHRpb25hbCwgcmVxdWlyZWQgb25seSBpZiBpbXBvcnRlZSBpcyBhbiBhc3NldElkLiBUaGUgdGFnIHRvIHVzZSBmb3IgdGhpcyBhc3NldCdzIENvRWxlbWVudFxuXHQgKi9cblx0aW1wb3J0KGltcG9ydGVlOiBzdHJpbmcgfCBBc3NldElELCB0YWdGb3JBc3NldD86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIHRoaXMuY3Z0LmltcG9ydChpbXBvcnRlZSwgdGFnRm9yQXNzZXQpO1xuXHR9XG5cblx0cHVibGljIG9uQWZ0ZXJSZW5kZXIoY2I6ICgpID0+IHZvaWQpOiB2b2lkIHtcblx0XHR0aGlzLmN2dC5hZGRPbkFmdGVyUmVuZGVyTGlzdGVuZXIoY2IpO1xuXHR9XG5cblx0cHVibGljIGdldFNvdXJjZURvY3VtZW50KCk6IERvY3VtZW50IHtcblx0XHRyZXR1cm4gdGhpcy5jdnQuZ2V0RG9jdW1lbnQoKVxuXHR9XG5cblx0cHVibGljIGludmFsaWRhdGUobm9kZT86IE5vZGUgfCBzdHJpbmcgfCBUYXJnZXROb2RlLGZvcmdldD86Ym9vbGVhbik6IHZvaWQge1xuXHRcdGlmICghbm9kZSlcblx0XHRcdG5vZGU9dGhpcy5nZXRUTigpO1xuXHRcdHRoaXMuY3Z0LmludmFsaWRhdGUobm9kZSxmb3JnZXQpO1xuXHR9XG5cblx0cHVibGljIGdldDxUIGV4dGVuZHMgQ29FbGVtZW50Pihub2RlOiBOb2RlIHwgc3RyaW5nLGdldGZ1bmM/OkdldDxUPik6IFQge1xuXHRcdHJldHVybiB0aGlzLmN2dC5nZXQobm9kZSxnZXRmdW5jKSBhcyB1bmtub3duIGFzIFQ7XG5cdH1cblxuXHQvKipcblx0XHQqIFJldHVybnMgdGhlIGdlbmVyYXRlZCB0YXJnZXQgbm9kZSAodG5vZGUpIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyLiBPcHRpb25hbGx5IGxldHMgdGhlIGNhbGxlciBzcGVjaWZ5IGEgJ3N0YXRlIGNoYW5nZXInXG5cdFx0KiBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHRvIGVmZmVjdCBjaGFuZ2VzIG9mIHN0YXRlIHRvIHRoZSB0bm9kZS4gVGhlIHN0YXRlIGNoYW5nZXIgaXMgc3RvcmVkIHNvIHRoYXRcblx0XHQqIHRoZSBjaGFuZ2VzIGFyZSByZWNyZWF0ZWQgb24gZXZlcnkgcmVwYWludCBvZiB0aGUgdG5vZGUuXG5cdFx0KiAgXG5cdFx0KiBAcGFyYW0gbm9kZSBhbiBzbm9kZSwgVGFyZ2V0Tm9kZSBvciBzb3VyY2UgZG9jdW1lbnQgc2VsZWN0b3IuXG5cdFx0KiBAcGFyYW0gY2hhbmdlaWQgKE9wdGlvbmFsIGJ1dCByZXF1aXJlZCBpZiBjaGFuZ2VyIGlzIHNwZWNpZmllZCkgYSB1bmlxdWUgaWQgb2YgdGhlIGNoYW5nZSAoSWYgdGhlIGNoYW5nZSBpcyByZWFkZGVkIHdpdGggdGhlIHNhbWUgaWQsIGl0IHdpbGwgcmVwbGFjZSB0aGUgZWFybGllciBjaGFuZ2UpXG5cdFx0KiBAcGFyYW0gY2hhbmdlciAoT3B0aW9uYWwpIFRoZSBjYWxsYmFjayB0byBlZmZlY3QgY2hhbmdlcywgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB0bm9kZSBpcyBhdmFpbGFibGUuIElmIGN1cnJlbnRseSBhdmFpbGFibGUsIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseS4gVGhlIGNhbGxiYWNrIHdpbGwgYWxzbyBiZSBjYWxsZWQgb24gYW55IHN1YnNlcXVlbnQgcmVwYWludCBvZiB0aGUgdG5vZGUuXG5cdFx0Ki9cblx0cHVibGljICQobm9kZT86IE5vZGUgfCBzdHJpbmcgfCBUYXJnZXROb2RlLCBjaGFuZ2VpZD86IHN0cmluZywgY2hhbmdlcj86IChFbGVtZW50KSA9PiBhbnkpOiBFbGVtZW50IHtcblx0XHRpZiAoIW5vZGUpXG5cdFx0XHRub2RlPXRoaXMuZ2V0VE4oKTtcblx0XHRyZXR1cm4gdGhpcy5jdnQuJChub2RlLGNoYW5nZWlkLGNoYW5nZXIpO1xuXHR9XG5cblxuXHQvKipcblx0ICogQXR0YWNoIGFuIGFzc2V0J3MgY29udHJvbCB0byB0aGUgdGFyZ2V0IG5vZGUuXG5cdCAqIFxuXHQgKiBAcGFyYW0gIHBhcmVudCBUaGUgdGFyZ2V0IGRvbSBub2RlIG9yIHF1ZXJ5IHNlbGVjdG9yIHdob3NlIGNoaWxkIHRoZSBuZXcgY29udHJvbCB3aWxsIGJlY29tZS5cblx0ICogQHBhcmFtICB0b0F0dGFjaCBUaGUgY29udHJvbCBvciBhc3NldCB0byBhdHRhY2guXG5cdCAqIEBwYXJhbSAgcGFyYW1ldGVycyAoT3B0aW9uYWwpLCBpZiAndG9BdHRhY2gnIHdhcyBhbiBhc3NldCwgdGhlbiBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGUgYXNzZXQuIFRoaXMgb2JqZWN0IGlzIGF2YWlsYWJsZSB0byB0aGUgYXNzZXQgYXMgJ3RoaXMucGFyYW1ldGVycydcblx0ICogXG5cdCAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY29udHJvbC4gXG5cdCAqL1xuXHRwdWJsaWMgYXR0YWNoKHBhcmVudDogTm9kZSB8IHN0cmluZywgdG9BdHRhY2g6IENvRWxlbWVudCB8IEFzc2V0SUQgfCBzdHJpbmcsIHBhcmFtZXRlcnM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogUHJvbWlzZTxDb0VsZW1lbnQ+IHtcblx0XHRyZXR1cm4gdGhpcy5jdnQuYXR0YWNoKHBhcmVudCwgdG9BdHRhY2gsIHBhcmFtZXRlcnMpO1xuXHR9XG5cblxuXG5cdC8qKlxuXHQqIERldGFjaGVzIGEgcHJldmlvdXNseSBhdHRhY2hlZCgpIGNvbnRyb2wuXG5cdCogXG5cdCogQHBhcmFtIHRvRGV0YWNoIFRoZSBjb250cm9sIHRoYXQgd2FzIGF0dGFjaGVkLCBvciB0aGUgdGFyZ2V0IG5vZGUgb3IgcXVlcnkgc2VsZWN0b3Igb2YgdGhlIHBhcmVudCBmcm9tIHdoaWNoIHRvIGF0dGFjaCBhbGwgcHJldmlvdXNseSBhdHRhY2hlZCBjb250cm9sc1xuXHQqL1xuXHRwdWJsaWMgZGV0YWNoKHRvRGV0YWNoOiBzdHJpbmcgfCBDb0VsZW1lbnQpOiBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiB0aGlzLmN2dC5kZXRhY2godG9EZXRhY2gpO1xuXHR9XG5cblx0cHVibGljIGFqYXgoY2FsbE5hbWU6IHN0cmluZywganNvblRvU2VuZDogYW55LCBjYWNoZT86IEFqYXhDYWNoZSwgcmVzcG9uc2VEYXRhVHlwZT86ICd4bWwnIHwgJ2pzb24nIHwgJ3NjcmlwdCcgfCAnaHRtbCcgfCAnanNvbnAnIHwgJ3RleHQnKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gSW1wbGVtZW50YXRpb25zLmdldEFqYXgoKS5hamF4KGNhbGxOYW1lLCBqc29uVG9TZW5kLCBjYWNoZSwgcmVzcG9uc2VEYXRhVHlwZSk7XG5cdH1cblxuXHRwdWJsaWMgYXNzZXRzKCk6IEFzc2V0RmFjdG9yeSB7XG5cdFx0cmV0dXJuIEltcGxlbWVudGF0aW9ucy5nZXRBc3NldEZhY3RvcnkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwYXRjaCBhIERPTSBzeW50aGV0aWMgZXZlbnQgb24gdGhlIHJvb3Qgbm9kZSBvZiB0aGlzIG9iamVjdC5cblx0ICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy9DcmVhdGluZ19hbmRfdHJpZ2dlcmluZ19ldmVudHNcblx0ICogXG5cdCAqIEBwYXJhbSBldmVudG5hbWUgXG5cdCAqIEBwYXJhbSBkZXRhaWwgXG5cdCAqL1xuXHRwdWJsaWMgZGlzcGF0Y2hFdmVudChldmVudG5hbWU6IHN0cmluZywgZGV0YWlsPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSwgb3B0aW9ucz86IEV2ZW50SW5pdCk6IEV2ZW50IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRUTigpLmRpc3BhdGNoRXZlbnQoZXZlbnRuYW1lLCBkZXRhaWwsIG9wdGlvbnMpO1xuXHR9XG5cblxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqXG5cdCAqIGltcGxlbWVudCBDb0VsZW1lbnQgXG5cdCAqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGlzIGNvbXBvbmVudCdzIGNvbnZlcnRlci5cblx0ICovXG5cdGdldEN2dCgpOiBDb252ZXJ0ZXI8VGhpcz4ge1xuXHRcdHJldHVybiB0aGlzLmN2dDtcblx0fVxuXG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGlzIGNvbnZlcnRlcidzIFRhcmdldE5vZGVcblx0ICovXG5cdGdldFROKCk6IFRhcmdldE5vZGUge1xuXHRcdGxldCBuID0gdGhpcy5nZXRDdnQoKS5nZXRSb290KCk7XG5cdFx0aWYgKCFuLmNvbXBvbmVudCkge1xuXHRcdFx0bi5jb21wb25lbnQgPSB0aGlzO1xuXHRcdH1cblx0XHRyZXR1cm4gbjtcblx0fVxuXG5cdHRlbXBsYXRpemUoY2FsbGVyOiBDb252ZXJ0ZXI8VGhpcz4sIHJlcGxhY2VkOiBOb2RlKSB7XG5cdFx0bGV0IHRlbXBsYXRlVE4gPSBuZXcgQmVmb3JlTWVyZ2VUYXJnZXROb2RlKHRoaXMuZ2V0Q3Z0KCkuZ2V0RG9jdW1lbnQoKS5ib2R5LCB1bmRlZmluZWQsIGNhbGxlciwgdGhpcy5nZXRDdnQoKSwgcmVwbGFjZWQpO1xuXHRcdHRoaXMuZ2V0Q3Z0KCkucmVwbGFjZVJvb3QodGVtcGxhdGVUTik7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBPdmVycmlkZSBpZiB5b3UgbmVlZCB0byBiZSBjYWxsZWQgb24gb25BZnRlclJlbmRlcmluZygpLiByZWYgaXMgdGhpcyBjb250cm9sJ3MgZG9tcmVmXG5cdCAqIFxuXHQgKiBAcGFyYW0gcmVmIFxuXHQgKi9cblx0b25Qb3N0UmVuZGVyPyhub2RlOiBhbnkpIHtcblx0XHRpZiAodGhpcy5nZXRDdnQoKSkge1xuXHRcdFx0UHJvbWlzZS5yZXNvbHZlKClcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuZ2V0Q3Z0KCkub25BZnRlclJlbmRlcigpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogT3ZlcnJpZGUgaWYgeW91IG5lZWQgdG8gYmUgY2FsbGVkIG9uIGJlZm9yZSByZW5kZXJpbmcgc3RhcnRzLiBcblx0ICogQHBhcmFtIHJlZiBcblx0ICovXG5cdG9uUHJlUmVuZGVyKCkge1xuXG5cdH1cblxuXG5cdG9uUmVuZGVyKHJtOiBSZW5kZXIpIHtcblx0XHRjb25zdCB7IGN2dCwgdG4gfSA9IGN0bih0aGlzKTtcblx0XHRsZXQgZWxlbSA9IHRuLnNub2RlO1xuXHRcdGxldCBlbGVtMiA9ICh0biBpbnN0YW5jZW9mIEJlZm9yZU1lcmdlVGFyZ2V0Tm9kZSkgPyB0bi5nZXRSZXBsYWNlZE5vZGUoKSA6IG51bGw7XG5cblx0XHRybS5vcGVuU3RhcnQoJ2RpdicsIHRoaXMpXG5cdFx0XHQuY2xhc3MoJ3UtZG9jdW1lbnQnKTtcblxuXHRcdGN2dC5jb3B5QXR0ckV4Y2VwdChybSwgZWxlbSwgW10sdG4pO1xuXHRcdGlmIChlbGVtMilcblx0XHRcdGN2dC5jb3B5QXR0ckV4Y2VwdChybSwgZWxlbTIsW10sdG4pO1xuXG5cdFx0cm0ub3BlbkVuZCgpO1xuXG5cdFx0Y3Z0LnJlbmRlckNoaWxkcmVuKHJtLCB0bik7XG5cblxuXHRcdHJtLmNsb3NlKCdkaXYnKTtcblx0fVxufSIsImltcG9ydCB7IEFqYXggfSBmcm9tIFwiLi9BamF4XCI7XG5pbXBvcnQgeyBBc3NldEZhY3RvcnkgfSBmcm9tIFwiLi9Bc3NldFwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBQYXRjaCB9IGZyb20gXCIuL1BhdGNoXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi9SZW5kZXJcIjtcbmltcG9ydCB7IEF0dGFjaG1lbnQgfSBmcm9tIFwiLi9BdHRhY2htZW50XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJJbXBsIH0gZnJvbSBcIi4vaW1wbC9Db252ZXJ0ZXJJbXBsXCI7XG5pbXBvcnQgeyBHZXRBdHRyVCwgVGhpcyB9IGZyb20gXCIuL1RoaXNcIjtcbmltcG9ydCBCYXNlVGhpcyBmcm9tIFwiLi9pbXBsL0Jhc2VUaGlzXCI7XG5cblxuLyoqXG4gKiBBIHNpbmdsZXRvbiBmcm9tIHdoaWNoIGFsbCBpbXBsZW1lbnRhdGlvbnMgb2YgaW50ZXJmYWNlcyBjYW4gYmUgZmV0Y2hlZC5cbiAqIFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW1wbGVtZW50YXRpb25zIHtcbiAgICBwcm90ZWN0ZWQgc3RhdGljIGltcDpJbXBsZW1lbnRhdGlvbnM7XG5cbiAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIEltcGxlbWVudGF0aW9ucy5pbXA9dGhpcztcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0QWpheEltcGwoKSA6IEFqYXg7XG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEFzc2V0RmFjdG9yeUltcGwoKSA6IEFzc2V0RmFjdG9yeTtcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlQ29udmVydGVySW1wbChjb3B5U3RhdGVGcm9tPzpDb252ZXJ0ZXI8VGhpcz4pIDogQ29udmVydGVyPFRoaXM+O1xuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVSZW5kZXJJbXBsKHBvczpQYXRjaCkgOiBSZW5kZXI7XG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUF0dGFjaG1lbnRJbXBsKCkgOiBBdHRhY2htZW50O1xuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVUaGlzSW1wbChjdnQ6Q29udmVydGVyPFRoaXM+LGZuR2V0QXR0cjpHZXRBdHRyVCk6IFRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGN1cnJlbnQgQWpheCBpbXBsZW1lbnRhaW9uLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0QWpheCgpIDogQWpheCB7XG4gICAgICAgIHJldHVybiBJbXBsZW1lbnRhdGlvbnMuaW1wLmdldEFqYXhJbXBsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBjdXJyZW50IEFzc2V0RmFjdG9yeSBpbXBsZW1lbnRhaW9uLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgICBwdWJsaWMgc3RhdGljIGdldEFzc2V0RmFjdG9yeSgpIDogQXNzZXRGYWN0b3J5IHtcbiAgICAgICAgcmV0dXJuIEltcGxlbWVudGF0aW9ucy5pbXAuZ2V0QXNzZXRGYWN0b3J5SW1wbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIENvbWxDb252ZXJ0ZXIuXG4gICAgICogXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVDb252ZXJ0ZXIoY29weVN0YXRlRnJvbT86Q29udmVydGVyPFRoaXM+KSA6IENvbnZlcnRlcjxUaGlzPiB7XG4gICAgICAgIHJldHVybiBJbXBsZW1lbnRhdGlvbnMuaW1wLmNyZWF0ZUNvbnZlcnRlckltcGwoY29weVN0YXRlRnJvbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgUmVuZGVyLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlUmVuZGVyKHBvczpQYXRjaCkgOiBSZW5kZXIge1xuICAgICAgICByZXR1cm4gSW1wbGVtZW50YXRpb25zLmltcC5jcmVhdGVSZW5kZXJJbXBsKHBvcyk7XG4gICAgfVxuXG4gICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhbiBBVHRhY2htZW50LlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlQXR0YWNobWVudCgpIDogQXR0YWNobWVudCB7XG4gICAgICAgIHJldHVybiBJbXBsZW1lbnRhdGlvbnMuaW1wLmNyZWF0ZUF0dGFjaG1lbnRJbXBsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgVGhpcyBvYmplY3QgZm9yIHRoZSBnaXZlbiBDb252ZXJ0ZXIuXG4gICAgICogXG4gICAgICogQHBhcmFtIGN2dCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZVRoaXMoY3Z0OkNvbnZlcnRlcjxUaGlzPixmbkdldEF0dHI6R2V0QXR0clQpOiBUaGlzIHtcbiAgICAgICAgcmV0dXJuIEltcGxlbWVudGF0aW9ucy5pbXAuY3JlYXRlVGhpc0ltcGwoY3Z0LGZuR2V0QXR0cik7XG4gICAgfVxuXG5cbn0iLCJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQsIGlzQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgUmVwYWludCB9IGZyb20gXCIuLi9SZXBhaW50XCI7XG5pbXBvcnQgeyBQYXRjaCB9IGZyb20gXCIuLi9QYXRjaFwiO1xuaW1wb3J0IHsgVGFyZ2V0Tm9kZSwgVE5TIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IHBhZCwgdG9TdHIgfSBmcm9tIFwiLi9EZWJ1Z1wiO1xuaW1wb3J0IHsgRXZlbnRIYW5kbGVycyB9IGZyb20gXCIuLi9odG1sL0V2ZW50SGFuZGxlcnNcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuaW1wb3J0IHsgU3RhdGVDaGFuZ2VyLCBTdGF0ZUNoYW5nZXJzIH0gZnJvbSBcIi4uL1N0YXRlQ2hhbmdlclwiO1xuaW1wb3J0IHsgR2V0IH0gZnJvbSBcIi4uL0dldFwiO1xuXG5cbmV4cG9ydCB0eXBlIFNvdXJjZUNoaWxkTm9kZXNTdXBwbHllciA9ICh0bjpUYXJnZXROb2RlSW1wbCk9PiBOb2RlTGlzdE9mPENoaWxkTm9kZT4gfCBOb2RlW10gO1xuXG5leHBvcnQgdHlwZSBNYWtlVGFyZ2V0Tm9kZSA9IChzbm9kZTpOb2RlLHdzZWxlbWVudD86Q29FbGVtZW50LHBhcmVudD86VGFyZ2V0Tm9kZUltcGwpID0+IFRhcmdldE5vZGVJbXBsO1xuXG4vKipcbiAqIFRhcmdldE5vZGUgc3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgY29udmVyc2lvbiBiZXR3ZWVuIGEgU291cmNlIG5vZGUgKHNub2RlKSBpbiB0aGUgQ09NTCBodG1sIGZpbGVcbiAqIGFuZCB0aGUgcmVuZGVyZWQgZmluYWwgTm9kZSAodGFyZ2V0IG5vZGUgb3IgdG5vZGUpLlxuICogXG4gKiBcbiAqL1xuIGV4cG9ydCBjbGFzcyBUYXJnZXROb2RlSW1wbCBpbXBsZW1lbnRzIFRhcmdldE5vZGUgIHtcbiAgICAvKipcbiAgICAgKiBUaGUgc291cmNlIG5vZGUgdGhhdCB0aGlzIHRhcmdldCBub2RlIHJlcHJlc2VudHNcbiAgICAgKi9cbiAgICBwdWJsaWMgc25vZGU6Tm9kZTtcbiAgICAvKipcbiAgICAgKiBUaGUgdGFyZ2V0IG5vZGUgdGhhdCBpcyBnZW5lcmF0ZWQgYnkgdGhlIENvRWxlbWVudCdzIG9uUmVuZGVyKClcbiAgICAgKi9cbiAgICBwdWJsaWMgdG5vZGU6Tm9kZTsgIFxuICAgIHB1YmxpYyByZXBsYWNlZDpOb2RlOyAvLyB1c2VkIHdoZW4gYW4gc25vZGUgaXMgcmVwbGFjZWQgZHVyaW5nIHRlbXBsYXRpbmcgb3IgYXR0YWNoLiBUaGUgbm9kZSB0aGF0IHdhcyByZXBsYWNlZC5cbiAgICBwdWJsaWMgY29tcG9uZW50OkNvRWxlbWVudDtcbiAgICBwdWJsaWMgcGFyZW50PzpUYXJnZXROb2RlO1xuICAgIHB1YmxpYyBjaGlsZHJlbjpUYXJnZXROb2RlWy8qIGl0ZXJhdGlvbiAqL11bLyogaW5kZXggKi9dPVtdOyBcbiAgICBwdWJsaWMgbWFya2VkOlROUztcblxuICAgIHByb3RlY3RlZCBpZDtcbiAgICBwcm90ZWN0ZWQgYXR0YWNoZWQ6Q29FbGVtZW50W107XG4gICAgcHJvdGVjdGVkIGNoaWxkcD86e1tpdGVyYXRpb246bnVtYmVyXTp7W3RhZzpzdHJpbmddOmFueX19O1xuXG5cbiAgICBjb25zdHJ1Y3Rvcihzbm9kZTpOb2RlLHdzZWxlbWVudD86Q29FbGVtZW50LHBhcmVudD86VGFyZ2V0Tm9kZSkge1xuICAgICAgICB0aGlzLnNub2RlPXNub2RlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudD13c2VsZW1lbnQ7XG4gICAgICAgIHRoaXMucGFyZW50PXBhcmVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIGNoaWxkIHNub2RlIChhcyByZXR1cm5lZCBieSBzb3VyY2VDaGlsZE5vZGVzKCkpLCBjcmVhdGUgaXRzIFRhcmdldE5vZGVcbiAgICAgKiB3aXRoIGNvbXBvbmVudFxuICAgICAqIFxuICAgICAqIFRoZSBpbXBsZW1lbnRhdGlvbiB3aWxsOlxuICAgICAqICAgICAgMS4gdXNlIGl0cyBvd25pbmcgQ29udmVydGVyIHRvIGNyZWF0ZSB0aGUgQ29FbGVtZW50IGZvciB0aGUgbmV3IGNoaWxkLlxuICAgICAqICAgICAgMi4gQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgVGFyZ2V0Tm9kZSBhcyB0aGUgY2hpbGRcbiAgICAgKiAgICAgIDMuIEFkZCB0aGlzIENvRWxlbWVudCB0byB0aGUgY2hpbGQncyAnY29tcG9uZW50J1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBzbm9kZSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgbWFrZVRhcmdldE5vZGUoc25vZGU6Tm9kZSxjdnQ6Q29udmVydGVyPFRoaXM+KTogVGFyZ2V0Tm9kZSB7XG4gICAgICAgIGxldCBjdG46VGFyZ2V0Tm9kZT1uZXcgVGFyZ2V0Tm9kZUltcGwoc25vZGUpO1xuICAgICAgICBjdG4ucGFyZW50PXRoaXM7IC8vIHNvIGlmIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgQ29FbGVtZW50IHRyaWVzIHRvIGFjY2VzcyBwYXJlbnQsIGl0IHdpbGwgd29ya1xuICAgICAgICBsZXQgY289Y3RuLmdldE93bmVyKGN2dCkubWFrZUNvRWxlbWVudChjdG4pO1xuICAgICAgICBpZiAoaXNDb0VsZW1lbnQoY28pKSB7XG4gICAgICAgICAgICBjdG4uY29tcG9uZW50PWNvO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29cbiAgICAgICAgICAgIC50aGVuKChjbyk9PntcbiAgICAgICAgICAgICAgICBpZiAoY28uZ2V0VE4oKSE9Y3RuICYmIGN0bi5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RuLnBhcmVudC5yZXBsYWNlQ2hpbGQoY3RuLGNvLmdldFROKCkpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgb2N0bj1jdG47XG4gICAgICAgICAgICAgICAgICAgIGN0bj1jby5nZXRUTigpO1xuICAgICAgICAgICAgICAgICAgICBjdG4ucmVwbGFjZWQ9b2N0bi5zbm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY28uZ2V0Q3Z0KCkuaW52YWxpZGF0ZShjdG4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0bjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgQ29udmVydGVyIHRoYXQgJ293bnMnIHRoaXMgVGFyZ2V0Tm9kZS4gVGhpcyBjb252ZXJ0ZXIgd2lsbCBiZSB1c2VkXG4gICAgICogdG8gcmVuZGVyIHRoaXMgVGFyZ2V0Tm9kZSwgYW5kIGhlbmNlIGl0cyAnVGhpcycgd2lsbCBiZSB1c2UgZHVyaW5nIHJlbmRlcmluZyBvZiB0aGUgVGFyZ2V0Tm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZGVmYXVsdE93bmVyIFRoZSBkZWZhdWx0IG93bmVyLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRPd25lcihkZWZhdWx0T3duZXI6Q29udmVydGVyPFRoaXM+KSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0T3duZXI7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0SWQoKTogYW55IHtcbiAgICAgICAgaWYgKCF0aGlzLmlkKSB7XG4gICAgICAgICAgICB0aGlzLmlkPScnK01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgIH1cblxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBodG1sIGNoaWxkIE5vZGVzIG9mIHRoaXMgVGFyZ2V0Tm9kZSB3aGljaCBzaG91bGQgYmUgdXNlZCBmb3IgY3JlYXRpbmcgXG4gICAgICogY2hpbGQgVGFyZ2V0Tm9kZXMuXG4gICAgICogXG4gICAgICogRHVyaW5nIHRlbXBsYXRpbmcsIHRoZSBhY3R1YWwgbm9kZXMgcmV0dXJuZWQgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSB0cnVlIGNoaWxkcmVuIG9mIHRoaXMuc25vZGVcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgc291cmNlQ2hpbGROb2RlcygpIDogTm9kZUxpc3RPZjxDaGlsZE5vZGU+IHwgTm9kZVtde1xuICAgICAgICAvL2lmICh0aGlzLnNvdXJjZUNoaWxkTm9kZXNTdXBwbHllcilcbiAgICAgICAgLy8gICByZXR1cm4gdGhpcy5zb3VyY2VDaGlsZE5vZGVzU3VwcGx5ZXIodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzLnNub2RlLmNoaWxkTm9kZXM7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGFsbCB0YXJnZXQgbm9kZXMgZ2VuZXJhdGVkIGJ5IHRoaXMgc291cmNlIG5vZGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIGdldEdlbmVyYXRlZE5vZGVzKCk6IE5vZGVbXSB7XG4gICAgICAgIGlmICghdGhpcy5pZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBsZXQgYWw9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtY29pZD1cIiR7dGhpcy5pZH1cIl1gKTtcbiAgICAgICAgaWYgKGFsKSB7XG4gICAgICAgICAgICBsZXQgbnM6Tm9kZVtdO1xuXG4gICAgICAgICAgICBhbC5mb3JFYWNoKChlbCk9PntcbiAgICAgICAgICAgICAgICBpZiAoIW5zKVxuICAgICAgICAgICAgICAgICAgICBucz1bXTtcbiAgICAgICAgICAgICAgICBucy5wdXNoKGVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gbnM7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSAgY2hpbGQgdGFyZ2V0IG5vZGUgYXMgYSBjaGlsZCB0byB0aGlzIHRhcmdldCBub2RlLCBmb3IgdGhlIGl0ZXJhdGlvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG4gXG4gICAgICogQHBhcmFtIGl0ZXJhdGlvbiBcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkQ2hpbGQodG46VGFyZ2V0Tm9kZSxpdGVyYXRpb246bnVtYmVyKSB7XG4gICAgICAgIHRuLnBhcmVudD10aGlzO1xuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGg8aXRlcmF0aW9uKzEpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaT10aGlzLmNoaWxkcmVuLmxlbmd0aDtpPGl0ZXJhdGlvbisxO2krKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGlsZHJlbltpdGVyYXRpb25dLnB1c2godG4pO1xuICAgICAgICB0bi5tYXJrZWQ9VE5TLkFEREVEO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2UgdGhlIGNoaWxkICd0bicgd2l0aCB0aGUgcmVwbGFjZW1lbnQgJ3J0bidcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG4gXG4gICAgICogQHBhcmFtIHJ0biBcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVwbGFjZUNoaWxkKHRuOiBUYXJnZXROb2RlLCBydG46IFRhcmdldE5vZGUpIHtcbiAgICAgICAgdG4ucGFyZW50PXRoaXM7XG4gICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5jaGlsZHJlbi5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICBsZXQgYz10aGlzLmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxjLmxlbmd0aDtqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY1tqXT09dG4pIHtcbiAgICAgICAgICAgICAgICAgICAgY1tqXT1ydG47XG4gICAgICAgICAgICAgICAgICAgIHJ0bi5wYXJlbnQ9dGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICBcbiAgICAgICAgfVxuICAgIFxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoaXMgdGFyZ2V0IG5vZGUgZnJvbSB0aGUgcmVuZGVyIHRyZWUsIGFuZCBhbGwgaXRzIGNoaWxkcmVuLlxuICAgICAqL1xuICAgIHJlbW92ZShkb250TnVsbFBhcmVudD86dHJ1ZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICAgIGlmICghZG9udE51bGxQYXJlbnQpXG4gICAgICAgICAgICB0aGlzLnBhcmVudD11bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLmNvbXBvbmVudCAmJiB0aGlzLmNvbXBvbmVudC5jbGVhbnVwKVxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnQuY2xlYW51cCgpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudD11bmRlZmluZWQ7XG4gICAgICAgIC8vdGhpcy5zb3VyY2VDaGlsZE5vZGVzU3VwcGx5ZXI9dW5kZWZpbmVkO1xuICAgICAgICAvL3RoaXMudGFyZ2V0Tm9kZU1ha2VyPXVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucmVwbGFjZWQpXG4gICAgICAgICAgICB0aGlzLnNub2RlPXRoaXMucmVwbGFjZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBjaGlsZHJlbiBmcm9tIHRoaXMgdGFyZ2V0IG5vZGUuXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUFsbENoaWxkcmVuKCkge1xuICAgICAgICBmb3IobGV0IGl0IG9mIHRoaXMuY2hpbGRyZW4pXG4gICAgICAgICAgICBmb3IobGV0IHQgb2YgaXQpXG4gICAgICAgICAgICAgICAgdC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5jaGlsZHJlbj1bXTsgICAgXG4gICAgfVxuXG5cbiAgICBcbiAgICAvKipcbiAgICAgKiByZW1vdmUgYW55IHVudXNlZCBjaGlsZHJlbiwgY2FsbGluZyB0aGUgYXR0YWNoZWQgd3NlbGVtZW50J3MgJ2NsZWFudXAnIGlmIHN1cHBsaWVkLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBwYXJlbnR0biBcbiAgICAgKi9cbiAgICBwdWJsaWMgcmV0aXJlVW51c2VkKCkge1xuICAgICAgICBmb3IobGV0IGk9dGhpcy5jaGlsZHJlbi5sZW5ndGgtMTtpPj0wO2ktLSkge1xuICAgICAgICAgICAgbGV0IGM9dGhpcy5jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGZvcihsZXQgaj1jLmxlbmd0aC0xO2o+PTA7ai0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNbal0ubWFya2VkPT1UTlMuTUFSS0VEKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1hcmtlZCBmb3IgcmVtb3ZhbFxuICAgICAgICAgICAgICAgICAgICBjW2pdLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjLnNwbGljZShqLDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjLmxlbmd0aD09MCkgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGksMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBpbiBjaGlsZHJlbiBvZiB0aGUgY2hpbGQgd2hvc2Ugbm9kZSBtYXRjaGVzICdjbidcbiAgICAgKiBhbmQgd2FzIGdlbmVyYXRlZCBpbiBpdGVyYXRpb24gbnVtYmVyICdpdGVyYXRpb24nIHByZXZpb3VzbHkuXG4gICAgICogXG4gICAgICogQHBhcmFtIGNuIFxuICAgICAqIEBwYXJhbSBpdGVyYXRpb24gXG4gICAgICogQHJldHVybnMgdGhlIGluZGV4IGluIGNoaWxkcmVuIG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZmluZENoaWxkRm9yTm9kZShjbjogTm9kZSxpdGVyYXRpb246bnVtYmVyKSA6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuICYmIHRoaXMuY2hpbGRyZW5baXRlcmF0aW9uXSkge1xuICAgICAgICAgICAgZm9yKGxldCBpPTA7aTx0aGlzLmNoaWxkcmVuW2l0ZXJhdGlvbl0ubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoaWxkcmVuW2l0ZXJhdGlvbl1baV0uc25vZGU9PT1jbiB8fCB0aGlzLmNoaWxkcmVuW2l0ZXJhdGlvbl1baV0ucmVwbGFjZWQ9PWNuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaXRlcmF0aW9uIHRvIHdoaWNoIHRoZSBkaXJlY3QgY2hpbGQgYGNoaWxkYCBiZWxvbmdzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjaGlsZCBBIGRpcmVjdCBjaGlsZCBvZiB0aGlzIFRhcmdldE5vZGVcbiAgICAgKiBAcmV0dXJucyBUaGUgaXRlcmF0aW9uLCBvciAtMSBpZiBub3QgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIGdldEl0ZXJhdGlvbk9mQ2hpbGQoY2hpbGQ6VGFyZ2V0Tm9kZSkgOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgZm9yKGxldCBpdGVyYXRpb249MDtpdGVyYXRpb248dGhpcy5jaGlsZHJlbi5sZW5ndGg7aXRlcmF0aW9uKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZHJlbltpdGVyYXRpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5jaGlsZHJlbltpdGVyYXRpb25dLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoaWxkcmVuW2l0ZXJhdGlvbl1baV09PT1jaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIFxuXG4gICAgcHVibGljIGluaXRNYXJrKCkge1xuICAgICAgICBmb3IobGV0IGl0IG9mIHRoaXMuY2hpbGRyZW4pXG4gICAgICAgICAgICBmb3IobGV0IHQgb2YgaXQpXG4gICAgICAgICAgICAgICAgdC5tYXJrZWQ9VE5TLk1BUktFRDtcbiAgICB9XG5cbiAgICBcblxuICAgIC8qXG4gICAgcHVibGljIGdldENvbnRyb2woKSA6IENvRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2w7XG4gICAgfSovXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYW4gJ2F0dGFjaGVkJyBjb250cm9sIChzdWNoIGFzIGFkZGVkIGJ5IHRoaXMuYXR0YWNoKCkpIHRvIHRoaXMgbm9kZS5cbiAgICAgKiBcbiAgICAgKi9cbiAgICBwdWJsaWMgYXR0YWNoQ29udHJvbChjb250cm9sOiBDb0VsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmF0dGFjaGVkKVxuICAgICAgICAgICAgdGhpcy5hdHRhY2hlZD1bXTtcbiAgICAgICAgdGhpcy5hdHRhY2hlZC5wdXNoKGNvbnRyb2wpO1xuICAgICAgICAvL3RoaXMuYWRkQ29udHJvbFRvUGFyZW50KGNvbnRyb2wpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVBdHRhY2hlZENvbnRyb2woY29udHJvbDpDb0VsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmF0dGFjaGVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBsZXQgZm91bmQ9LTE7XG4gICAgICAgIHRoaXMuYXR0YWNoZWQuZm9yRWFjaCgoYyxpbmRleCk9PntcbiAgICAgICAgICAgIGlmIChjPT1jb250cm9sKVxuICAgICAgICAgICAgICAgIGZvdW5kPWluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGZvdW5kIT0tMSkge1xuICAgICAgICAgICAgLy90aGlzLnJlbW92ZUNvbnRyb2xGcm9tUGFyZW50KGNvbnRyb2wpO1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hlZC5zcGxpY2UoZm91bmQsMSk7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRhY2hlZC5sZW5ndGg9PTApXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hlZD1udWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUFsbEF0dGFjaGVkQ29udHJvbHMoY2I/Oihjb21wOkNvRWxlbWVudCk9PmFueSkge1xuICAgICAgICBpZiAoIXRoaXMuYXR0YWNoZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoZWQuZm9yRWFjaCgoY29udHJvbCk9PntcbiAgICAgICAgICAgICAgICBjYihjb250cm9sKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdHRhY2hlZD1udWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0F0dGFjaGVkKGNvbnRyb2w6IENvRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuYXR0YWNoZWQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCBmb3VuZD1mYWxzZTtcbiAgICAgICAgdGhpcy5hdHRhY2hlZC5mb3JFYWNoKChhdHRhY2hlZCk9PntcbiAgICAgICAgICAgIGlmIChhdHRhY2hlZD09Y29udHJvbClcbiAgICAgICAgICAgICAgICBmb3VuZD10cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVuZGVyQXR0YWNoZWQocm06UmVuZGVyLGN2dDpDb252ZXJ0ZXI8VGhpcz4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmF0dGFjaGVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLmF0dGFjaGVkLmZvckVhY2goKGNvbnRyb2wpPT57XG4gICAgICAgICAgICAvL3JtLnJlbmRlckNvbnRyb2woY29udHJvbCk7XG4gICAgICAgICAgICBjb250cm9sLmdldEN2dCgpLnJlbmRlck5vZGUocm0sY29udHJvbC5nZXRUTigpKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoaXMgdGFyZ2V0IG5vZGUuXG4gICAgICogVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgYSBDb252ZXJ0ZXIuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJtIFxuICAgICAqL1xuICAgIHB1YmxpYyByZW5kZXIocm06UmVuZGVyKSB7XG4gICAgICAgIGxldCBsaXN0ZW5lckFycmF5OigocmVmPzphbnkpPT5hbnkpW107XG4gICAgICAgIGlmICh0aGlzLmxpc3RlbmVycyAmJiAobGlzdGVuZXJBcnJheT10aGlzLmxpc3RlbmVyc1snb25QcmVSZW5kZXInXSkpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyQXJyYXkuZm9yRWFjaCgobCk9PntcbiAgICAgICAgICAgICAgICBsKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvbXBvbmVudC5vblByZVJlbmRlcikge1xuICAgICAgICAgICAgdGhpcy5jb21wb25lbnQub25QcmVSZW5kZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgIHRoaXMubWF0Y2hTbm9kZSgoc25vZGUpPT57XG4gICAgICAgICAgICBpZiAoc25vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjcmVhdHVyZScpPj0wKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDUkVBVFVSRSBGT1VORCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7ICovXG5cbiAgICAgICAgdGhpcy5jb21wb25lbnQub25SZW5kZXIocm0pOyAvLyB0aGlzIHdpbGwgY2hhbmdlIHRoaXMudG5vZGVcblxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50SGFuZGxlcnNGcm9tQXR0cmlidXRlcygpO1xuICAgICAgICBcblxuICAgICAgICBpZiAodGhpcy5jb21wb25lbnQub25Qb3N0UmVuZGVyKVxuICAgICAgICAgICAgdGhpcy5jb21wb25lbnQub25Qb3N0UmVuZGVyKHRoaXMudG5vZGUpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgncG9zdHJlbmRlcicpO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgc3RhdGVcbiAgICAgICAgdGhpcy5ydW5TdGF0ZUNoYW5nZXMoKTtcblxuICAgICAgICAvLyBydW4gYW55IHBlbmRpbmcgZ2V0cygpIHRoYXQgZGlkbnQgcmVzb2x2ZSBiZWNhdXNlIHRoZSBUYXJnZXROb2RlIGhhZG50IGJlZW4gY3JlYXRlZCB0aGVuXG4gICAgICAgIHRoaXMucnVuUGVuZGluZ0dldHMoKTtcblxuICAgICAgICBpZiAodGhpcy5saXN0ZW5lcnMgJiYgKGxpc3RlbmVyQXJyYXk9dGhpcy5saXN0ZW5lcnNbJ29uUG9zdFJlbmRlciddKSkge1xuICAgICAgICAgICAgbGlzdGVuZXJBcnJheS5mb3JFYWNoKChsKT0+e1xuICAgICAgICAgICAgICAgIGwodGhpcy50bm9kZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGx5IGFsbCBhdHRyaWJ1dGUgYmFzZWQgZXZlbnQgaGFuZGxlcnMgKGVpdGhlciAnb25YWFgnIG9yICdjby1vblhYWCcpIGluIHNub2RlIHRvIHRoZSBcbiAgICAgKiB0bm9kZSBhcyAnYWRkRXZlbnRMaXN0ZW5lcigneHh4eCcpLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhdHRhY2hFdmVudEhhbmRsZXJzRnJvbUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLnRub2RlICYmIHRoaXMuc25vZGUgJiYgdGhpcy5jb21wb25lbnQpIHtcbiAgICAgICAgICAgIGxldCBlaD1uZXcgRXZlbnRIYW5kbGVycyh0aGlzLnRub2RlIGFzIEVsZW1lbnQsdGhpcyk7XG5cbiAgICAgICAgICAgIGVoLmFkZEV2ZW50SGFuZGxlcnNGcm9tQXR0cnNPZih0aGlzLnNub2RlIGFzIEVsZW1lbnQsdGhpcy5jb21wb25lbnQuZ2V0Q3Z0KCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIERPTSBzeW50aGV0aWMgZXZlbnQgb24gdGhlIHJvb3Qgbm9kZSBvZiB0aGlzIG9iamVjdC5cbiAgICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL0NyZWF0aW5nX2FuZF90cmlnZ2VyaW5nX2V2ZW50c1xuICAgICAqIFxuICAgICAqIEBwYXJhbSBldmVudG5hbWUgVGhlIGV2ZW50IHRvIHNlbmQgLCBlLmcuICdteWV2ZW50JyBcbiAgICAgKiBAcGFyYW0gZGV0YWlsIEFuIGFyYm90cmFyeSBwYXlsb2FkLiBJZiBub3Qgc3VwcGxpZWQsIHtzZW5kZXI6dGhpcy5jb2VsZW1lbnR9IHdpbGwgYmUgdXNlZC5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VzdG9tIGV2ZW50LiBcbiAgICAgKi9cbiAgICBwdWJsaWMgZGlzcGF0Y2hFdmVudChldmVudG5hbWU6c3RyaW5nLGRldGFpbD86e1trZXk6c3RyaW5nXTphbnl9LG9wdGlvbnM/OkV2ZW50SW5pdCkgOiBFdmVudCB7XG5cdFx0aWYgKCFkZXRhaWwpXG5cdFx0XHRkZXRhaWw9e3NlbmRlcjp0aGlzLmNvbXBvbmVudH1cblx0XHRlbHNlIGlmICghZGV0YWlsLnNlbmRlcikge1xuXHRcdFx0ZGV0YWlsLnNlbmRlcj10aGlzLmNvbXBvbmVudDtcblx0XHR9XG5cblx0XHQvLyBjdXN0b20gZXZlbnQsIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvQ3VzdG9tRXZlbnRcblx0XHRsZXQgZXZlbnQ9bmV3IEN1c3RvbUV2ZW50KGV2ZW50bmFtZSwob3B0aW9ucykgPyBPYmplY3QuYXNzaWduKG9wdGlvbnMse2RldGFpbDpkZXRhaWx9KTp7YnViYmxlczp0cnVlLGRldGFpbDpkZXRhaWx9KTtcblxuICAgICAgICBpZiAodGhpcy50bm9kZSkge1xuXHRcdCAgICB0aGlzLnRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gdG5vZGUgLSB1c3VhbGx5IGJlY2F1c2UgdGhlIENvRWxlbWVudCBkb2VzIG5vdCByZW5kZXIgYSBkaXYgKGUuZy4gc2VlIFdTQ2Fyb3VzZWwpLlxuICAgICAgICAgICAgLy8gSW4gdGhpcyBjYXNlIHdlIHNlZSBpZiB0aGUgJ29uPGV2ZW50bmFtZT4nIGF0dHJpYnV0ZSBleGlzdHMgb24gdGhlIHNub2RlLCBjcmVhdGUgYSBoYW5kbGVyIGJvdW5kIHRvIG91ciBUaGlzIGFuZCBjYWxsIHRoYXQuXG4gICAgICAgICAgICBpZiAodGhpcy5zbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgdGhpcy5jb21wb25lbnQgJiYgdGhpcy5jb21wb25lbnQuZ2V0Q3Z0KCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgc2NyaXB0PXRoaXMuc25vZGUuZ2V0QXR0cmlidXRlKCdvbicrZXZlbnRuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoc2NyaXB0KXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVoPW5ldyBFdmVudEhhbmRsZXJzKHRoaXMudG5vZGUgYXMgRWxlbWVudCx0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgaGFuZGxlcj1laC5tYWtlRXZlbnRIYW5kbGVyKHNjcmlwdCx0aGlzLmNvbXBvbmVudC5nZXRDdnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcihldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cdFx0cmV0dXJuIGV2ZW50O1xuXHR9XG5cbiAgICBwcm90ZWN0ZWQgcnVuU3RhdGVDaGFuZ2VGb3IoY3Z0OkNvbnZlcnRlcjxUaGlzPixzbm9kZTpOb2RlKSB7XG4gICAgICAgIGlmICgodGhpcy50bm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBsZXQgc3RhdGVjaGFuZ2VyczpTdGF0ZUNoYW5nZXJzPWN2dC5nZXRTdGF0ZUNoYW5nZXJzKHNub2RlKTtcblxuICAgICAgICAgICAgbGV0IHRicmVtb3ZlZDpzdHJpbmdbXTtcbiAgICAgICAgICAgIGZvcihsZXQgc3RhdGVpZCBpbiBzdGF0ZWNoYW5nZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVjaGFuZ2Vyc1tzdGF0ZWlkXSh0aGlzLnRub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVpZC5zdGFydHNXaXRoKCdAT05DRScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGJyZW1vdmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGJyZW1vdmVkPVtdO1xuICAgICAgICAgICAgICAgICAgICB0YnJlbW92ZWQucHVzaChzdGF0ZWlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IobGV0IHN0YXRlaWQgb2YgdGJyZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN2dC5zdGF0ZUNoYW5nZXIoc3RhdGVpZCxzbm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcnVuU3RhdGVDaGFuZ2VzKCkge1xuICAgICAgICB0aGlzLnJ1blN0YXRlQ2hhbmdlRm9yKHRoaXMuY29tcG9uZW50LmdldEN2dCgpLHRoaXMuc25vZGUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBydW5HZXRzRm9yQ3Z0KGN2dDpDb252ZXJ0ZXI8VGhpcz4sc25vZGU6Tm9kZSkge1xuICAgICAgICBsZXQgZ2V0czpHZXRbXT1jdnQuZ2V0R2V0cyhzbm9kZSk7XG4gICAgICAgIGlmIChnZXRzKSB7Ly8gZGVsZXRlIGFsbFxuICAgICAgICAgICAgY3Z0LnNldEdldHMoc25vZGUpOyBcblxuICAgICAgICAgICAgZm9yKGxldCBnZXQgb2YgZ2V0cykge1xuICAgICAgICAgICAgICAgIGdldCh0aGlzLmNvbXBvbmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcnVuR2V0c0ZvckFsbEN2dHMoc25vZGU6Tm9kZSkge1xuICAgICAgICB0aGlzLnJ1bkdldHNGb3JDdnQodGhpcy5jb21wb25lbnQuZ2V0Q3Z0KCksc25vZGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biBhbnkgcGVuZGluZyBnZXRzIC0gYHRoaXMuZ2V0cygnY28tc29tZXRoaW5nJywoY28pPT57fSlgIGNhbGxzIHRoYXQgYXJlIHN0aWxsIHBlbmRpbmdcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcnVuUGVuZGluZ0dldHMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbXBvbmVudCkge1xuXG4gICAgICAgICAgICBsZXQgYWxsOk5vZGVbXT1bXTtcbiAgICAgICAgICAgIHRoaXMubWF0Y2hTbm9kZSgoc25vZGUpPT57XG4gICAgICAgICAgICAgICAgYWxsLnB1c2goc25vZGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmb3IobGV0IHNub2RlIG9mIGFsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucnVuR2V0c0ZvckFsbEN2dHMoc25vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIFBhdGNoIG9iamVjdCB0aGF0IGlzIHVzZWQgZHVyaW5nIGludmFsaWRhdGlvbiB0byBhdHRhY2hcbiAgICAgKiB0aGUgcmVnZW5lcmF0ZWQgbm9kZSBiYWNrIHRvIGl0cyBwYXJlbnQuXG4gICAgICovXG4gICAgcHVibGljIGdldFBhdGNoKCkgOiBQYXRjaCB7XG4gICAgICAgIGxldCBwYXJlbnRUbm9kZTpOb2RlO1xuICAgICAgICBpZiAodGhpcy50bm9kZSAmJiB0aGlzLnRub2RlLnBhcmVudE5vZGUpXG4gICAgICAgICAgICBwYXJlbnRUbm9kZT10aGlzLnRub2RlLnBhcmVudE5vZGU7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRUbm9kZSAmJiAodGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQudG5vZGUpKVxuICAgICAgICAgICAgcGFyZW50VG5vZGU9dGhpcy5wYXJlbnQudG5vZGU7XG5cbiAgICAgICAgLypcbiAgICAgICAgaWYgKCFwYXJlbnRUbm9kZSAmJiAodGhpcy5hdHRhY2htZW50Tm9kZSAmJiB0aGlzLmF0dGFjaG1lbnROb2RlLnRub2RlKSlcbiAgICAgICAgICAgIHBhcmVudFRub2RlPXRoaXMuYXR0YWNobWVudE5vZGUudG5vZGU7XG4gICAgICAgICovXG5cbiAgICAgICAgaWYgKHBhcmVudFRub2RlKSB7IFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXBhaW50KHBhcmVudFRub2RlLHRoaXMudG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgLyoqXG4gICAgICogRW1wdHkgdGhpcyBub2RlLCBhcyBpZiBpdCBoYWQganVzdCBiZWVuIGFkZGVkIHRvIGl0cyBwYXJlbnQsIHByaW9yIHRvIGEgZnVsbCByZWdlbmVyYXRpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBzdHlsZSBjbGFzcyB0byB0aGUgdGFyZ2V0IG5vZGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGNsYXp6IFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRTdHlsZUNsYXNzKGNsYXp6OnN0cmluZykge1xuICAgICAgICBpZiAodGhpcy50bm9kZSlcbiAgICAgICAgICAgICh0aGlzLnRub2RlIGFzIEVsZW1lbnQpLmNsYXNzTGlzdC5hZGQoY2xhenopO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBzdHlsZSBmcm9tIHRoZSB0bm9kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY2xhenogXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZVN0eWxlQ2xhc3MoY2xheno6c3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnRub2RlKVxuICAgICAgICAgICAgKHRoaXMudG5vZGUgYXMgRWxlbWVudCkuY2xhc3NMaXN0LnJlbW92ZShjbGF6eik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGN1c3RvbURhdGE/OmFueTtcbiAgICBwcm90ZWN0ZWQgZmluZEN1c3RvbURhdGEoa2V5OnN0cmluZykge1xuICAgICAgICBpZiAoIXRoaXMuY3VzdG9tRGF0YSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VzdG9tRGF0YVtrZXldO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgc2V0Q3VzdG9tRGF0YShrZXk6c3RyaW5nLCB2YWx1ZTphbnkpIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1c3RvbURhdGEpXG4gICAgICAgICAgICB0aGlzLmN1c3RvbURhdGE9e307XG4gICAgICAgIHRoaXMuY3VzdG9tRGF0YVtrZXldPXZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuXHQgKiBSZXRyaWV2ZXMsIG1vZGlmaWVzIG9yIHJlbW92ZXMgY3VzdG9tIGRhdGEgYXR0YWNoZWQgdG8gYSBDb0VsZW1lbnQuXG5cdCAqXG5cdCAqIFVzYWdlczpcblx0ICogPGg0PlNldHRpbmcgdGhlIHZhbHVlIGZvciBhIHNpbmdsZSBrZXk8L2g0PlxuXHQgKiA8cHJlPlxuXHQgKiAgICBkYXRhKFwibXlLZXlcIiwgbXlEYXRhKVxuXHQgKiA8L3ByZT5cblx0ICogQXR0YWNoZXMgPGNvZGU+bXlEYXRhPC9jb2RlPiAod2hpY2ggY2FuIGJlIGFueSBKUyBkYXRhIHR5cGUsIGUuZy4gYSBudW1iZXIsIGEgc3RyaW5nLCBhbiBvYmplY3QsIG9yIGEgZnVuY3Rpb24pXG5cdCAqIHRvIHRoaXMgZWxlbWVudCwgdW5kZXIgdGhlIGdpdmVuIGtleSBcIm15S2V5XCIuIElmIHRoZSBrZXkgYWxyZWFkeSBleGlzdHMsdGhlIHZhbHVlIHdpbGwgYmUgdXBkYXRlZC5cblx0ICpcblx0ICpcblx0ICogPGg0PlNldHRpbmcgYSB2YWx1ZSBmb3IgYSBzaW5nbGUga2V5IChyZW5kZXJlZCB0byB0aGUgRE9NKTwvaDQ+XG5cdCAqIDxwcmU+XG5cdCAqICAgIGRhdGEoXCJteUtleVwiLCBteURhdGEsIHdyaXRlVG9Eb20pXG5cdCAqIDwvcHJlPlxuXHQgKiBBdHRhY2hlcyA8Y29kZT5teURhdGE8L2NvZGU+IHRvIHRoaXMgZWxlbWVudCwgdW5kZXIgdGhlIGdpdmVuIGtleSBcIm15S2V5XCIgLiBJZiB0aGUga2V5IGFscmVhZHkgZXhpc3RzLHRoZSB2YWx1ZSB3aWxsIGJlIHVwZGF0ZWQuXG5cdCAqIFdoaWxlIDxjb2RlPm9WYWx1ZTwvY29kZT4gY2FuIGJlIGFueSBKUyBkYXRhIHR5cGUgdG8gYmUgYXR0YWNoZWQsIGl0IG11c3QgYmUgYSBzdHJpbmcgdG8gYmUgYWxzb1xuXHQgKiB3cml0dGVuIHRvIERPTS4gVGhlIGtleSBtdXN0IGFsc28gYmUgYSB2YWxpZCBIVE1MIGF0dHJpYnV0ZSBuYW1lIChpdCBtdXN0IGNvbmZvcm0gdG8gPGNvZGU+c2FwLnVpLmNvcmUuSUQ8L2NvZGU+XG5cdCAqIGFuZCBtYXkgY29udGFpbiBubyBjb2xvbikgYW5kIG1heSBub3Qgc3RhcnQgd2l0aCBcInNhcC11aVwiLiBXaGVuIHdyaXR0ZW4gdG8gSFRNTCwgdGhlIGtleSBpcyBwcmVmaXhlZCB3aXRoIFwiZGF0YS1cIi5cblx0ICpcblx0ICpcblx0ICogPGg0PkdldHRpbmcgdGhlIHZhbHVlIGZvciBhIHNpbmdsZSBrZXk8L2g0PlxuXHQgKiA8cHJlPlxuXHQgKiAgICBkYXRhKFwibXlLZXlcIilcblx0ICogPC9wcmU+XG5cdCAqIFJldHJpZXZlcyB3aGF0ZXZlciBkYXRhIGhhcyBiZWVuIGF0dGFjaGVkIHRvIHRoaXMgZWxlbWVudCAodXNpbmcgdGhlIGtleSBcIm15S2V5XCIpIGJlZm9yZS5cblx0ICpcblx0ICpcblx0ICogPGg0PlJlbW92aW5nIHRoZSB2YWx1ZSBmb3IgYSBzaW5nbGUga2V5PC9oND5cblx0ICogPHByZT5cblx0ICogICAgZGF0YShcIm15S2V5XCIsIG51bGwpXG5cdCAqIDwvcHJlPlxuXHQgKiBSZW1vdmVzIHdoYXRldmVyIGRhdGEgaGFzIGJlZW4gYXR0YWNoZWQgdG8gdGhpcyBlbGVtZW50ICh1c2luZyB0aGUga2V5IFwibXlLZXlcIikgYmVmb3JlLlxuXHQgKlxuXHQgKlxuXHQgKiA8aDQ+UmVtb3ZpbmcgYWxsIGN1c3RvbSBkYXRhIGZvciBhbGwga2V5czwvaDQ+XG5cdCAqIDxwcmU+XG5cdCAqICAgIGRhdGEobnVsbClcblx0ICogPC9wcmU+XG5cdCAqXG5cdCAqXG5cdCAqIDxoND5HZXR0aW5nIGFsbCBjdXN0b20gZGF0YSB2YWx1ZXMgYXMgYSBwbGFpbiBvYmplY3Q8L2g0PlxuXHQgKiA8cHJlPlxuXHQgKiAgICBkYXRhKClcblx0ICogPC9wcmU+XG5cdCAqIFJldHVybnMgYWxsIGRhdGEsIGFzIGEgbWFwLWxpa2Ugb2JqZWN0LCBwcm9wZXJ0eSBuYW1lcyBhcmUga2V5cywgcHJvcGVydHkgdmFsdWVzIGFyZSB2YWx1ZXMuXG5cdCAqXG5cdCAqXG5cdCAqIDxoND5TZXR0aW5nIG11bHRpcGxlIGtleS92YWx1ZSBwYWlycyBpbiBhIHNpbmdsZSBjYWxsPC9oND5cblx0ICogPHByZT5cblx0ICogICAgZGF0YSh7XCJteUtleTFcIjogbXlEYXRhLCBcIm15S2V5MlwiOiBudWxsfSlcblx0ICogPC9wcmU+XG5cdCAqIEF0dGFjaGVzIDxjb2RlPm15RGF0YTwvY29kZT4gKHVzaW5nIHRoZSBrZXkgXCJteUtleTFcIiBhbmQgcmVtb3ZlcyBhbnkgZGF0YSB0aGF0IGhhZCBiZWVuXG5cdCAqIGF0dGFjaGVkIGZvciBrZXkgXCJteUtleTJcIi5cblx0ICpcbiAgICAgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3Q8c3RyaW5nLGFueT58bnVsbH0gW3ZLZXlPckRhdGFdXG5cdCAqICAgICBTaW5nbGUga2V5IHRvIHNldCBvciByZW1vdmUsIG9yIGFuIG9iamVjdCB3aXRoIGtleS92YWx1ZSBwYWlycyBvciA8Y29kZT5udWxsPC9jb2RlPiB0byByZW1vdmVcblx0ICogICAgIGFsbCBjdXN0b20gZGF0YVxuXHQgKiBAcGFyYW0ge3N0cmluZ3xhbnl9IFt2VmFsdWVdXG5cdCAqICAgICBWYWx1ZSB0byBzZXQgb3IgPGNvZGU+bnVsbDwvY29kZT4gdG8gcmVtb3ZlIHRoZSBjb3JyZXNwb25kaW5nIGN1c3RvbSBkYXRhXG5cdCAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLGFueT58YW55fG51bGx9XG5cdCAqICAgICBBIG1hcCB3aXRoIGFsbCBjdXN0b20gZGF0YSwgYSBjdXN0b20gZGF0YSB2YWx1ZSBmb3IgYSBzaW5nbGUgc3BlY2lmaWVkIGtleSBvciA8Y29kZT5udWxsPC9jb2RlPlxuXHQgKiAgICAgd2hlbiBubyBjdXN0b20gZGF0YSBleGlzdHMgZm9yIHN1Y2ggYSBrZXkgb3IgdGhpcyBlbGVtZW50IHdoZW4gY3VzdG9tIGRhdGEgd2FzIHRvIGJlIHJlbW92ZWQuXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn1cblx0ICogICAgIFdoZW4gdGhlIHR5cGUgb2YgdGhlIGdpdmVuIHBhcmFtZXRlcnMgZG9lc24ndCBtYXRjaCBhbnkgb2YgdGhlIGRvY3VtZW50ZWQgdXNhZ2VzXG5cdCAqIFxuXHQgKi9cblx0cHVibGljIGRhdGEoLi4uX2FyZ3MpIDogYW55IHtcblx0XHRsZXQgYXJnTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcblxuXHRcdGlmIChhcmdMZW5ndGggPT0gMCkgeyAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIEFMTCBkYXRhIGFzIGEgbWFwXG5cdFx0XHRsZXQgYURhdGEgPSB0aGlzLmN1c3RvbURhdGEsXG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0aWYgKGFEYXRhKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYURhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRyZXN1bHRbYURhdGFbaV0uZ2V0S2V5KCldID0gYURhdGFbaV0uZ2V0VmFsdWUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblxuXHRcdH0gZWxzZSBpZiAoYXJnTGVuZ3RoID09IDEpIHtcblx0XHRcdGxldCBhcmcwID0gYXJndW1lbnRzWzBdO1xuXG5cdFx0XHRpZiAoYXJnMCA9PT0gbnVsbCkgeyAgICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBBTEwgZGF0YVxuXHRcdFx0XHRkZWxldGUgdGhpcy5jdXN0b21EYXRhOyAvLyBkZWxldGUgd2hvbGUgbWFwXG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhcmcwID09IFwic3RyaW5nXCIpIHsgLy8gcmV0dXJuIHJlcXVlc3RlZCBkYXRhIGVsZW1lbnRcblx0XHRcdFx0cmV0dXJuIHRoaXMuZmluZEN1c3RvbURhdGEoYXJnMCk7XG5cblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGFyZzAgPT0gXCJvYmplY3RcIikgeyAvLyBzaG91bGQgYmUgYSBtYXAgLSBzZXQgbXVsdGlwbGUgZGF0YSBlbGVtZW50c1xuXHRcdFx0XHRmb3IgKGxldCBrZXkgaW4gYXJnMCkgeyAvLyBUT0RPOiBpbXByb3ZlIHBlcmZvcm1hbmNlIGFuZCBhdm9pZCBleGVjdXRpbmcgc2V0RGF0YSBtdWx0aXBsZSB0aW1lc1xuXHRcdFx0XHRcdHRoaXMuc2V0Q3VzdG9tRGF0YShrZXksIGFyZzBba2V5XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGVycm9yLCBpbGxlZ2FsIGFyZ3VtZW50XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJXaGVuIGRhdGEoKSBpcyBjYWxsZWQgd2l0aCBvbmUgYXJndW1lbnQsIHRoaXMgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgYW4gb2JqZWN0IG9yIG51bGwsIGJ1dCBpcyBcIiArICh0eXBlb2YgYXJnMCkgKyBcIjpcIiArIGFyZzAgKyBcIiAob24gVUkgRWxlbWVudCB3aXRoIElEICdcIiArIHRoaXMuZ2V0SWQoKSArIFwiJylcIik7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYgKGFyZ0xlbmd0aCA9PSAyKSB7ICAgICAgICAgICAgLy8gc2V0IG9yIHJlbW92ZSBvbmUgZGF0YSBlbGVtZW50XG5cdFx0XHR0aGlzLnNldEN1c3RvbURhdGEoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9ICBlbHNlIHtcblx0XHRcdC8vIGVycm9yLCBpbGxlZ2FsIGFyZ3VtZW50c1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcImRhdGEoKSBtYXkgb25seSBiZSBjYWxsZWQgd2l0aCAwLTIgYXJndW1lbnRzIChvbiBDb0VsZW1lbnQgd2l0aCB0YWcgJ1wiICsgKHRoaXMuc25vZGUgYXMgRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgXCInKVwiKTtcblx0XHR9XG5cdH07XG5cbiAgICBwcm90ZWN0ZWQgbGlzdGVuZXJzOntba2V5OnN0cmluZ106KChyZWY/OmFueSk9PmFueSlbXX07XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGZ1bmN0aW9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuYW1lIFRoZSBmdW5jdGlvbiB0byBsaXN0ZW4gdG9cbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGNhbGxiYWNrIHRvIGNhbGxcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkTGlzdGVuZXIobmFtZTonb25QcmVSZW5kZXInfCdvblBvc3RSZW5kZXInLGxpc3RlbmVyOihyZWY/OmFueSk9PmFueSkge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzKVxuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnM9e307XG4gICAgICAgIGxldCBhcnI9dGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgIGlmICghYXJyKSAgIHtcbiAgICAgICAgICAgIGFycj1bXTtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdPWFycjtcbiAgICAgICAgfVxuICAgICAgICBhcnIucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgYWRkZWQgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBmdW5jdGlvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbmFtZSBcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUxpc3RlbmVyKG5hbWU6J29uUHJlUmVuZGVyJ3wnb25Qb3N0UmVuZGVyJyxsaXN0ZW5lcjoocmVmPzphbnkpPT5hbnkpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVycylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgbGV0IGFycj10aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgaWYgKCFhcnIpICAgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGxldCBpbmRleD1hcnIuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICAgIGlmIChpbmRleD49MCkge1xuICAgICAgICAgICAgYXJyLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgICAgIGlmIChhcnIubGVuZ3RoPT0wKVxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBGb3IgZGVidWdnaW5nIC0gcHJpbnRzIHRoZSB0YXJnZXQgdHJlZSBzbm9kZXMgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGRlcHRoIFxuICAgICAqL1xuICAgIHByaW50KGRlcHRoOm51bWJlcj0wKSB7XG4gICAgICAgIGlmICh0aGlzLnNub2RlICYmIHRoaXMuc25vZGUubm9kZVR5cGUhPU5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtwYWQoZGVwdGgpfSBzbm9kZT0ke3RvU3RyKHRoaXMuc25vZGUpfSArKyB0bm9kZT0ke3RvU3RyKHRoaXMudG5vZGUpfSAoJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9KSMke3RoaXMuZ2V0SWQoKX1gKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlcGxhY2VkKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3BhZChkZXB0aCwnICcpfSByZXBsYWNlZD0ke3RvU3RyKHRoaXMucmVwbGFjZWQpfWApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IobGV0IGk9MDtpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgbGV0IGM9dGhpcy5jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8Yy5sZW5ndGg7aisrKSB7XG4gICAgICAgICAgICAgICAgKGNbal1hcyBUYXJnZXROb2RlSW1wbCkucHJpbnQoZGVwdGgrMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxscyB0aGUgbWF0Y2hlciBmdW5jdGlvbiBhZ2FpbnN0IGFsbCBzbm9kZXMgdGhpcyBUYXJnZXROb2RlIGltcGxlbWVudGF0aW9uIGlzIGhhbmRsaW5nLlxuICAgICAqIFRoaXMgcHJvdmlkZXMgYW4gZXh0ZW5zaWJsZSB3YXkgZm9yIHRyYXZlcnNpbmcgZWFjaCBUYXJnZXROb2RlcydzIHNub2RlKHMpLCBmb3IgZXhhbXBsZSwgdG8gZmluZFxuICAgICAqIFRhcmdldE5vZGVzIGJ5IHNub2Rlcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbWF0Y2hlciBcbiAgICAgKiBAcmV0dXJucyBUaGUgZmlyc3QgdHJ1ZSBmcm9tIG1hdGNoZXIuXG4gICAgICovXG4gICAgcHVibGljIG1hdGNoU25vZGUobWF0Y2hlcjooc25vZGU6Tm9kZSk9PmJvb2xlYW4pIDogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBtYXRjaGVyKHRoaXMuc25vZGUpIHx8ICh0aGlzLnJlcGxhY2VkICYmIG1hdGNoZXIodGhpcy5yZXBsYWNlZCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgb3Igc2V0cyBwYXJhbWV0ZXJzIGZvciBjaGlsZHJlbiBieSB0aGVpciBpdGVyYXRpb24gYW5kIHRhZyBuYW1lLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpdGVyYXRpb24gXG4gICAgICogQHBhcmFtIHRhZ25hbWUgXG4gICAgICogQHBhcmFtIHBhcmFtZXRlcnMgSWYgc3BlY2lmaWVkLCBzZXRzIHRoZSBwYXJhbWV0ZXJzLCBlbHNlIHJldHVybnMgdGhlbVxuICAgICAqL1xuICAgIHB1YmxpYyBjaGlsZFBhcmFtcyhpdGVyYXRpb246bnVtYmVyLHRhZ25hbWU6c3RyaW5nLHBhcmFtZXRlcnM/OmFueSkgOiBhbnkge1xuICAgICAgICBpZiAocGFyYW1ldGVycykge1xuICAgICAgICAgICAgLy8gaW5zZXJ0XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2hpbGRwKVxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRwPXt9O1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNoaWxkcFtpdGVyYXRpb25dKVxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRwW2l0ZXJhdGlvbl09e307XG4gICAgICAgICAgICB0aGlzLmNoaWxkcFtpdGVyYXRpb25dW3RhZ25hbWVdPXBhcmFtZXRlcnM7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jaGlsZHAgJiYgdGhpcy5jaGlsZHBbaXRlcmF0aW9uXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRwW2l0ZXJhdGlvbl1bdGFnbmFtZV07XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG5cblxuXG4iLCJpbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgVGFyZ2V0Tm9kZUltcGwgfSBmcm9tIFwiLi9pbXBsL1RhcmdldE5vZGVJbXBsXCI7XG5pbXBvcnQgeyBHZXRBdHRyVCwgVGhpcyB9IGZyb20gXCIuL1RoaXNcIjtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2YgYWxsIEFzc2V0cy5cbiAqL1xuZXhwb3J0IGVudW0gQXNzZXRUeXBlIHtcblx0aW1hZ2UgPSAnaW1hZ2UnLFxuXHRwYWdlID0gJ3BhZ2UnLFxuXHRmcmFtZSA9ICdmcmFtZScsXG5cdGxvb2s9J2xvb2snLFxuXHRsb29rc3ViPSdsb29rc3ViJyxcblx0Zm9ybT0nZm9ybScsXG5cdGluZGV4cGFnZT0naW5kZXhwYWdlJyxcblx0cGFsZXR0ZT0ncGFsZXR0ZScsXG5cdG90aGVyPSdvdGhlcidcbn1cblxuLyoqXG4gKiBFYWNoIGFzc2V0IGlzIHVuaXF1ZWx5IGlkZW50aWZpZWQgYnkgYW4gQXNzZXRJRC4gSXRzIGFuIG9wYXF1ZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXNzZXRJRCB7XG5cdHR5cGU6QXNzZXRUeXBlO1xuXHRuYW1lOnN0cmluZztcblx0cHJvamVjdD86c3RyaW5nOyBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXNzZXRJZChvYmo6IGFueSk6IG9iaiBpcyBBc3NldElEIHtcbiAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgJ3R5cGUnIGluIG9iaiAmJiAnbmFtZScgaW4gb2JqO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYW4gYXNzZXRpZCB0byBhIHN0cmluZyBzdWl0YWJsZSBmb3Igc2V0dGluZyBvbiBhbiBFbGVtZW50IGF0dHJpYnV0ZS5cbiAqIFxuICogQHBhcmFtIGlkIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlBc3NldElEKGlkOkFzc2V0SUR8c3RyaW5nKSA6IHN0cmluZyB7XG5cdGlmICghaWQpXG5cdFx0cmV0dXJuICcnO1xuXHRpZiAodHlwZW9mIGlkPT0nc3RyaW5nJylcblx0XHRyZXR1cm4gaWQ7XG5cdHJldHVybiBKU09OLnN0cmluZ2lmeShpZCkucmVwbGFjZSgvXCIvZyxcIidcIik7XG59XG5cbi8qKlxuICogUmVjb3ZlciBhbiBBc3NldElEIGZyb20gYSBzdHJpbmcgcmV0dXJuZWQgYnkgc3RyaW5naWZ5QXNzZXRJRC4gXG4gKiBcbiAqIFRoaXMgZnVuY3Rpb24gaXMgc2FmZSB0byBjYWxsIHdoZXJldmVyIGFuIEFzc2V0SUR8c3RyaW5nIGlzIHNwZWNpZmllZCwgYXMgaXQgdGFrZXMgYWNjb3VudCBvZiBib3RoIHRvIHJldHVybiBhbiBBc3NldElELlxuICogXG4gKiBAcGFyYW0gc3RyaW5naWZpZWRJRCBhIHN0cmluZ2lnaWZpZWQgYXNzZXRJRCwgb3IgYW4gYWN0dWFsIGFzZXRJZCBvciBudWxsLlxuICogQHJldHVybnMgbnVsbCBpZiBudWxsIHN1cHBsaWVkLCBlbHNlIHRoZSByZXN0b3JlZCBBc3NldElEXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlQXNzZXRJRChzdHJpbmdpZmllZElEb3JOYW1lOnN0cmluZ3xBc3NldElELHR5cGVJZk5hbWVPbmx5OkFzc2V0VHlwZT1Bc3NldFR5cGUucGFnZSkgOiBBc3NldElEIHtcblx0aWYgKCFzdHJpbmdpZmllZElEb3JOYW1lKVxuXHRcdHJldHVybjtcblx0aWYgKHR5cGVvZiBzdHJpbmdpZmllZElEb3JOYW1lID09J3N0cmluZycpIHtcblx0XHRpZiAoc3RyaW5naWZpZWRJRG9yTmFtZS5pbmRleE9mKCd7Jyk8MClcblx0XHRcdHN0cmluZ2lmaWVkSURvck5hbWU9YHsndHlwZSc6JyR7dHlwZUlmTmFtZU9ubHl9JywnbmFtZSc6JyR7c3RyaW5naWZpZWRJRG9yTmFtZX0nfWA7XG5cdFx0cmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5naWZpZWRJRG9yTmFtZS5yZXBsYWNlKC8nL2csJ1wiJykpO1xuXHR9XG5cdHJldHVybiBzdHJpbmdpZmllZElEb3JOYW1lO1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHR3byBhc3NldHMgaWRzIGZvciBlcXVhbGl0eS4gVGhlIGlkcyBjYW4gYmUgYW4gQXNzZXRJZCwgYSBzdHJpbmdpZmllZCBBc3NldElkLCBvciBqdXN0IGFuIGFzc2V0IG5hbWUsIGZvciBleGFtcGxlICdteXBhZ2UuaHRtbCcuXG4gKiBFYWNoIGFzc2V0IGlzIGNvbnZlcnRlZCB0byBhbiBBc3NldElkIG9iamVjdCBiZWZvcmUgY29tcGFyaXNvbi5cbiAqIFxuICogQHBhcmFtIGlkMSBcbiAqIEBwYXJhbSBpZDIgXG4gKiBAcGFyYW0gdHlwZUlmTmFtZU9ubHkgSWYgYW4gaWQgY29tcHJpc2VzIGEgbmFtZSBvbmx5LCB1c2UgdGhpcyB0eXBlIHRvIGNyZWF0ZSB0aGUgQXNzZXRJZCBmb3IgY29tcGFyaXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFyZUFzc2V0SWRzRXF1YWwoaWQxOkFzc2V0SUR8c3RyaW5nLGlkMjpBc3NldElEfHN0cmluZyx0eXBlSWZOYW1lT25seTpBc3NldFR5cGU9QXNzZXRUeXBlLnBhZ2UpIDogYm9vbGVhbiB7XG5cdGlmICghaWQxIHx8ICFpZDIpXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFxuXHRsZXQgc2lkMT0odHlwZW9mIGlkMT09J3N0cmluZycpID8gcmVzdG9yZUFzc2V0SUQoaWQxLHR5cGVJZk5hbWVPbmx5KTppZDE7XG5cdGxldCBzaWQyPSh0eXBlb2YgaWQyPT0nc3RyaW5nJykgPyByZXN0b3JlQXNzZXRJRChpZDIsdHlwZUlmTmFtZU9ubHkpOmlkMjtcblxuXHRyZXR1cm4gc2lkMS50eXBlPT09c2lkMi50eXBlICYmIHNpZDEubmFtZT09PXNpZDIubmFtZTtcbn1cblxuXG5cbi8qKlxuICogQW4gQXNzZXQgaXMgYSByZXNvdXJjZSB0aGF0IGNhbiBiZSB1c2VkIGluc2lkZSBhIFdTLUVsZW1lbnQgaHRtbCBwYWdlLiBUaGUgcmVzb3VyY2UgaXMgXG4gKiByZW5kZXJlZCBhcyBhIDx3cy1lbGVtZW50PiBpbnNpZGUgYSBEb2N1bWVudCAtIHRoZSBzb3VyY2UgZG9tLiBcbiAqIFxuICogRXhhbXBsZXMgb2YgYXNzZXRzIGFyZSBmb3JtcywgY2hhcnRzLCBpbmJveGVzLCBzZWFyY2ggYm94ZXMsIGltYWdlc1xuICogZXRjLiAtIGFueXRoaW5nIHRoYXQgaXMgYnVpbHQgaW5zaWRlIFdSQSBhbmQgY2FuIGJlIHVzZWQgYXMgYSBwYXJ0IG9mIGEgcGFnZS5cbiAqIFxuICogVGhlIEFzc2V0IGludGVyZmFjZSBleHBvc2VzIHRoZSBhc3NldCB0aHJvdWdoIHRoZSBgZ2V0RG9jdW1lbnQoKWAgZnVuY3Rpb24sIHdoaWNoIHJldHVybnMgYSBzb3VyY2UgRE9NIGluIHdoaWNoIHRoZVxuICogYXNzZXQncyB3cy1lbGVtZW50IGlzIGNvbnRhaW5lZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBc3NldCB7XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgdW5pcXVlIGlkIG9mIGFuIGFzc2V0LlxuXHQgKiBHaXZlbiBhbiBpZCwgdGhlIEFzc2V0RmFjdG9yeSBjYW4gcmVjcmVhdGUgdGhpcyBhc3NldC5cblx0ICovXG5cdGdldElkKCkgOiBBc3NldElEO1xuXG5cdFxufVxuXG4vKipcbiAqIEFuIEFzc2V0IHRoYXQgY2FuIHJldHVybiBhIGRvY3VtZW50XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRG9jdW1lbnRBc3NldCBleHRlbmRzIEFzc2V0IHtcblx0LyoqXG5cdCAqIHJldHVybnMgdGhlIERPTSBkb2N1bWVudCBvZiB0aGlzIGFzc2V0LlxuXHQgKi9cblx0Z2V0RG9jdW1lbnQoKSA6IFByb21pc2U8RG9jdW1lbnQ+O1xuXG5cdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEb2N1bWVudEFzc2V0KG9iajogYW55KTogb2JqIGlzIERvY3VtZW50QXNzZXQge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmICdnZXREb2N1bWVudCcgaW4gb2JqO1xufVxuXG5cbi8qKlxuICogQW4gQXNzZXQgdGhhdCBjYW4gcmV0dXJuIGEgdGV4dFxuICovXG4gZXhwb3J0IGludGVyZmFjZSBUZXh0QXNzZXQgZXh0ZW5kcyBBc3NldCB7XG5cdC8qKlxuXHQgKiByZXR1cm5zIHRoZSB0ZXh0IG9mIHRoaXMgYXNzZXQuXG5cdCAqL1xuXHRnZXRUZXh0KCkgOiBQcm9taXNlPHN0cmluZz47XG5cblx0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RleHRBc3NldChvYmo6IGFueSk6IG9iaiBpcyBUZXh0QXNzZXQge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmICdnZXRUZXh0JyBpbiBvYmo7XG59XG5cbi8qKlxuICogQW4gQXNzZXQgdGhhdCBjYW4gcmVwcmVzZW50IGl0c2VsZiBhcyBhIENvRWxlbWVudFxuICovXG4gZXhwb3J0IGludGVyZmFjZSBDb0VsZW1lbnRBc3NldCBleHRlbmRzIEFzc2V0IHtcblxuXHQvKipcblx0ICogUmV0dXJuIHRoaXMgYXNzZXQgd3JhcHBlZCBhcyBhIENvRWxlbWVudC5cblx0ICogPHA+XG5cdCAqIEBwYXJhbSBhdHRhY2htZW50Tm9kZSBBbiBvcHRpb25hbCBub2RlIHRoYXQgc2VydmVzIHRvIHJlcHJlc2VudCB0aGUgYXNzZXQncyBwYXJlbnQgdG5vZGUgaW4gdGhlIHdpbmRvdy5kb2N1bWVudFxuXHQgKi9cblx0YXNDb0VsZW1lbnQ8VCBleHRlbmRzIFRoaXM+KGF0dGFjaG1lbnROb2RlPzpUYXJnZXROb2RlSW1wbCxjYj86KGN2dDpDb252ZXJ0ZXI8VD4pPT52b2lkLGZuR2V0QXR0cj86R2V0QXR0clQpIDogUHJvbWlzZTxDb0VsZW1lbnQ8VD4+O1xuXHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29FbGVtZW50QXNzZXQob2JqOiBhbnkpOiBvYmogaXMgQ29FbGVtZW50QXNzZXQge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmICdhc0NvRWxlbWVudCcgaW4gb2JqO1xufVxuXG5cblxuXG4vKipcbiAqIEFuIGlueWVyZmFjZSB0aGF0IGZpbmRzIGFuZCBjcmVhdGVzIGFzc2V0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBc3NldEZhY3Rvcnkge1xuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoaXMgYXNzZXQgZmFjdG9yeSBoYW5kbGVzIHRoaXMgaWQgKGJhc2VkIG9uIHR5cGUpXG5cdCAqIFxuXHQgKiBAcGFyYW0gaWQgXG5cdCAqL1xuXHRpc0ZvcihpZDpBc3NldElEKSA6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIExpc3RzIGFzc2V0cyBvZiB0aGUgZ2l2ZW4gdHlwZS5cblx0ICogXG5cdCAqIEBwYXJhbSB0eXBlcyBcblx0ICogQHBhcmFtIHByb2plY3QgXG5cdCAqL1xuXHRsaXN0KHR5cGVzOkFzc2V0VHlwZVtdLHByb2plY3Q/OnN0cmluZykgOiBQcm9taXNlPEFzc2V0W10+O1xuXG5cdC8qKlxuXHQgKiBGZXRjaCB0aGUgYXNzZXQgZ2l2ZW4gaXRzIGlkLlxuXHQgKiBcblx0ICogQHBhcmFtIGFzc2V0SWQgXG5cdCAqL1xuXHRnZXQoYXNzZXRJZDpBc3NldElEfHN0cmluZykgOiBBc3NldDtcbn1cbiIsImltcG9ydCB7IEFzc2V0SUQgfSBmcm9tIFwiLi9Bc3NldFwiO1xuXG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIGZvciBjYWNoaW5nIEFqYXggY2FsbHMgaW4gdGhlIGJyb3dzZXIuaWYgbmVlZGVkLCBpbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgYW5kIHBhc3MgaXQgdG9cbiAqIHRoZSBBamF4LmFqYXggaW50ZXJmYWNlIGFzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciBhbmQgaXQgd2xsIGNoZWNrIGlmIHRoZSByZXNwb25zZSBhbHJlYWR5IGV4aXN0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBamF4Q2FjaGUge1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbWF4aW11bSBpdGVtIGxlbmd0aCBmb3Igd2hpY2ggYSByZXNwb25zZSBkYXRhIHNob3VsZCBiZSBjYWNoZWQuIElmIGJpZ2dlciB0aGFuIHRoaXMsIGRvbnQgY2FjaGUuXG4gICAgICovXG4gICAgZ2V0VmFsdWVTaXplTGltaXQoKTogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgYSByZXN1bHQgYWdhaW5zdCBhIGtleVxuICAgICAqIFxuICAgICAqIEBwYXJhbSBzdHJpbmdpZmllZEpzb24gVGhlIGtleSAodXN1YWxseSB0aGUgY2FsbCBwYXJhbWV0ZXJzKSBhZ2FpbnN0IHdoaWNoIHRvIGNhY2hlXG4gICAgICogQHBhcmFtIHJlc3VsdCBUaGUgaXRlbSB0byBjYWNoZS5cbiAgICAgKi9cbiAgICB3cml0ZShzdHJpbmdpZmllZEpzb246IHN0cmluZywgcmVzdWx0OiBhbnkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNhY2hlZCBkYXRhIGZvciBhIHJlcXVlc3RcbiAgICAgKiBcbiAgICAgKiovIFxuICAgIHJlYWQoa2V5OiBzdHJpbmcpXG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBBamF4IGNhbGxzXG4gKiBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBamF4IHtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwYWdlJ3MgY29udGVudCwgZ2l2ZW4gYSBwYXRoXG4gICAgICogXG4gICAgICogQHBhcmFtIHBhdGhUb0dldCBcbiAgICAgKiBAcGFyYW0gY2FjaGUgXG4gICAgICogQHBhcmFtIHJlc3BvbnNlRGF0YVR5cGUgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgLy9nZXQocGF0aFRvR2V0OiBzdHJpbmcsIGNhY2hlPzogQWpheENhY2hlLCByZXNwb25zZURhdGFUeXBlPzogJ3htbCcgfCAnanNvbicgfCAnc2NyaXB0JyB8ICdodG1sJyB8ICdqc29ucCcgfCAndGV4dCcpIDogUHJvbWlzZTxhbnk+O1xuXG5cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYW4gYWpheCByZXF1ZXN0LCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSByZXN1bHQuXG4gICAgICogYGBgXG4gICAgICogLy8gdHlwaWNhbCB1c2FnZTpcbiAgICAgKiBhamF4KFwiR2V0U29tZXRoaW5nXCIse3NvbWVQYXJhbWV0ZXIsXCJTb21lVmFsdWVcIiwuLi59KVxuICAgICAqIC50aGVuKChyZXN1bHQ6U29tZVR5cGUpPT57XG4gICAgICogfSlcbiAgICAgKiAuY2F0Y2goKGVycm9yOnN0cmluZ3xKU09ORXhjZXB0aW9uKT0+e1xuICAgICAqIH0pXG4gICAgICogYGBgXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNhbGxOYW1lIFxuICAgICAqIEBwYXJhbSB7Kn0ganNvblRvU2VuZFxuICAgICAqIEBwYXJhbSB7QWpheENhY2hlfSBjYWNoZSBJZiBzdXBwbGllZCwgdXNlIHRoaXMgY2FjaGVcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBcbiAgICAgKi9cbiAgICBhamF4KGNhbGxOYW1lOiBzdHJpbmcsIGpzb25Ub1NlbmQ6IGFueSAsIGNhY2hlPzogQWpheENhY2hlLHJlc3BvbnNlRGF0YVR5cGU/Oid4bWwnfCdqc29uJ3wnc2NyaXB0J3wnaHRtbCd8J2pzb25wJ3wndGV4dCcpIDogUHJvbWlzZTxhbnk+O1xuXG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhbiBBc3NldElELCByZXR1cm4gaXRzIGNvbnRlbnQgaW4gdGhlIHNwZWNpZmllZCByZXNwb25zZURhdGFUeXBlLlxuICAgICAqIFxuICAgICAqL1xuICAgIGdldEFzc2V0KGFzc2V0SWQ6QXNzZXRJRCwgY2FjaGU/OiBBamF4Q2FjaGUsIHJlc3BvbnNlRGF0YVR5cGU/OiAneG1sJyB8ICdqc29uJyB8ICdzY3JpcHQnIHwgJ2h0bWwnIHwgJ2pzb25wJyB8ICd0ZXh0JykgOiBQcm9taXNlPGFueT5cblxuXG59IiwibGV0IERvbVJlbmRlcmVyID0ge1xuICAgIGFwaVZlcnNpb24gOiAyLCAvLyBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzYzNTE2OTQvd3JpdGluZy1zYXB1aTUtY29udHJvbC1yZW5kZXJlci1pbi1zYXAtdWktZGVmaW5lLXN0eWxlXG4gICAgcmVuZGVyIDogZnVuY3Rpb24ob1JNLCBvQ29udHJvbCl7XG5cdFx0aWYgKG9Db250cm9sLm9wdGlvbnMub25SZW5kZXIpIHtcblx0XHRcdG9Db250cm9sLm9wdGlvbnMub25SZW5kZXIob1JNLG9Db250cm9sKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBBIFJhdyBKYXZhU2NyaXB0IG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNhbGwgdGhlIHVpNSBjb250cm9sJ3MgJ2V4dGVuZCcgZnVuY3Rpb24uXG4gKiBUaGlzIHdpbGwgY3JlYXRlIGEgY2xhc3MgaW4gdGhlIGdsb2JhbCBhcmVhLlxuICogWW91IGNhbiB0aGVuIHN1YmNsYXNzIHRoaXMgY2xhc3MgdG8gcHJvdmlkZSB5b3VyIHJlbmRlciBmdW5jdGlvbmFsaXR5IHZpYSB0aGUgaW5pdCBvcHRpb25zLlxuICovXG5sZXQgVUk1Q29udHJvbD0ge1xuXG4gICAgaW5pdE9wdGlvbnMgKCkge1xuICAgICAgICB0aGlzLm9wdGlvbnM9IHtcbiAgICAgICAgICAgIG9uUmVuZGVyOnVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9uUG9zdFJlbmRlcjp1bmRlZmluZWRcbiAgICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzZXRDb250cm9sT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zKXtcbiAgICAgICAgICAgIHRoaXMuaW5pdE9wdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyxvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgc2V0S2V5VmFsdWUoa2V5LHZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zKXtcbiAgICAgICAgICAgIHRoaXMuaW5pdE9wdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnNba2V5XT12YWx1ZTtcbiAgICB9LFxuXG4gICAgZ2V0S2V5VmFsdWUoa2V5KSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zW2tleV0pXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2tleV07XG4gICAgfSxcblxuICAgIHJlbW92ZUtleShrZXkpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnNba2V5XSlcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnNba2V5XTtcbiAgICB9LFxuXG4gICAgb25BZnRlclJlbmRlcmluZyAoZXZ0KSB7XG4gICAgICAgIGlmIChldnQpIHtcbiAgICAgICAgICAgIGxldCByZWYgPSBldnQuc3JjQ29udHJvbC5nZXREb21SZWYoKTtcbiAgICAgICAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZ0LnNyY0NvbnRyb2wub3B0aW9ucy5vblBvc3RSZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZ0LnNyY0NvbnRyb2wub3B0aW9ucy5vblBvc3RSZW5kZXIocmVmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ29uQWZ0ZXJSZW5kZXJpbmcgcmVmIGlzIG51bGwnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uQmVmb3JlUmVuZGVyaW5nIChldnQpIHtcbiAgICAgICAgaWYgKGV2dC5zcmNDb250cm9sLm9wdGlvbnMub25QcmVSZW5kZXIpIHtcbiAgICAgICAgICAgIGV2dC5zcmNDb250cm9sLm9wdGlvbnMub25QcmVSZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuaW5pdE9wdGlvbnMoKTtcbiAgICB9LFxuXG4gICAgZXhpdCgpIHtcbiAgICB9LFxuXG4gICAgcmVuZGVyZXI6IERvbVJlbmRlcmVyXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzaW1wbGUgVUk1Q29udHJvbCBjbGFzcyB0aGF0IHlvdSBjYW4gaW5zdGFudGlhdGUuXG4gKiBcbiAqIFNhbXBsZSB1c2U6XG4gKiBgYGB0eXBlc2NyaXB0XG4gICAgICAgIGxldCBNeUNsYXNzPWV4dGVuZFVJNSgnZm9vLkJhcicpO1xuICAgICAgICBsZXQgbXljb250cm9sOnNhcC51aS5jb3JlLkNvbnRyb2w9bmV3IChjbGFzcyBleHRlbmRzIE15Q2xhc3Mge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDb250cm9sT3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgIG9uUHJlUmVuZGVyOigpPT57fSxcbiAgICAgICAgICAgICAgICAgICAgb25SZW5kZXI6IChybTpzYXAudWkuY29yZS5SZW5kZXJNYW5hZ2VyKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJtXG4gICAgICAgICAgICAgICAgICAgICAgICAub3BlblN0YXJ0KCdkaXYnLHRoaXMgYXMgYW55KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzKCd1LXVpNS1jbGFzcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3BlbkVuZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBybS5jbG9zZSgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uUG9zdFJlbmRlcjoocmVmOmFueSk9Pnt9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpIGFzIHNhcC51aS5jb3JlLkNvbnRyb2w7XG4gKiBcbiAqIFxuICogYGBgXG4gKiBcbiAqIEBwYXJhbSBjbGFzc25hbWUgVGhlIGNsYXNzIHRvIGNyZWF0ZSwgZWcsICdjb21sLk15Q2xhc3MnXG4gKiBAcmV0dXJucyBBIGNsYXNzIG9iamVjdCB0aGF0IHlvdSBjYW4gaW5zdGFudGlhdGUgdXNpbmcgbmV3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kVUk1KGNsYXNzbmFtZTpzdHJpbmcpIDogYW55IHtcbiAgICByZXR1cm4gKHNhcC51aS5jb3JlLkNvbnRyb2wgYXMgYW55KS5leHRlbmQoY2xhc3NuYW1lLE9iamVjdC5hc3NpZ24oe30sVUk1Q29udHJvbCkpO1xufSIsImltcG9ydCB7IEFzc2V0SUQgfSBmcm9tIFwiLi4vLi4vQXNzZXRcIjtcbmltcG9ydCB7IFBhdGNoIH0gZnJvbSBcIi4uLy4uL1BhdGNoXCI7XG5pbXBvcnQgeyBBdHRhY2htZW50SW1wbCB9IGZyb20gXCIuLi8uLi9pbXBsL0F0dGFjaG1lbnRJbXBsXCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vLi4vSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBleHRlbmRVSTUgfSBmcm9tIFwiLi9VSTVDb250cm9sQ2xhc3NcIjtcblxuXG5leHBvcnQgaW50ZXJmYWNlIFVJNUJyaWRnZSB7XG4gICAgLy9zZXRDdnQoY3Z0OkNvbnZlcnRlcik7XG59XG5cbi8qKlxuICogQW4gQXR0YWNobWVudCBpbXBsZW1lbnRhdGlvbiBmb3IgVUk1LiBcbiAqIFxuICogQHNlZSBodHRwczovL29wZW51aTUub3JnL1xuICogXG4gKiBVSTUgY29udHJvbHMgcmVxdWlyZSBhIHRvcCBsZXZlbCB1aTUgcGFyZW50IGNvbnRyb2wgb2Ygd2hpY2ggdGhleSBhcmUgdGhlIGNoaWxkcmVuLiBcbiAqIFxuICogVGhpcyBhdHRhY2htZW50IGltcGxlbWVudGF0aW9uIGJ1aWxkcyBhIGN1c3RvbSBzaW5nbGV0b24gY29udHJvbCAodGhlIGJyaWRnZSksIGF0dGFjaGVzIGl0IHRvIHRoZSBhdHRhY2htZW50IGVsZW1lbnRcbiAqIGluIHRoZSB0ZG9tLiBUaGlzIGNvbnRyb2wgdGhlbiByZW5kZXJzIHRoZSBDT01MIGluIGl0cyAnb25SZW5kZXIoKScgbWV0aG9kLCB3aGljaCBldmVudHVhbGx5IHJlbmRlcnMgdGhlXG4gKiBDT01MIGNyZWF0ZWQgVUk1IGNvbnRyb2xzLCBzbyBVSTUgc2VlcyB0aGUgZXhwZWN0ZWQgcGFyZW50IC8gY2hpbGQgY29udHJvbCByZW5kZXJpbmcgYmVoYXZpb3VyXG4gKiBcbiAqIFN0cmF0ZWd5OiBBdHRhY2ggdGhlIGJyaWRnZSBjb250cm9sIHRvIHRoZSBhdHRhY2htZW50IHBvaW50IHVzaW5nIHRoZSBVSTUgcGxhY2VBdC4gXG4gKiBMb2FkIHRoZSBjb0VsZW1lbnQgYXNzZXQgYW5kIHdoZW4gbG9hZGVkLCByZW5kZXIgaXQgaW5zaWRlIHRoZSBicmlkZ2UncyBvblJlbmRlcigpLiBBdCB0aGlzIHBvaW50XG4gKiB0aGUgYnJpZGdlIGRvZXNudCBoYXZlIGEgZG9tIHJlZmVyZW5jZSwgc28ganVzdCBzdG9yZSB0aGUgcmVuZGVyZWQgZWxlbWVudC4gV2hlbiB0aGUgYnJpZGdlJ3Mgb25Qb3N0UmVuZGVyKCkgXG4gKiBpcyBjYWxsZWQsIGFwcGVuZCB0aGlzIGVsZW1lbnQgdG8gdGhlIGJyaWRnZSdzIGRvbSBlbGVtZW50LlxuICogXG4gKi9cbmV4cG9ydCBjbGFzcyBVSTVBdHRhY2htZW50IGV4dGVuZHMgQXR0YWNobWVudEltcGwge1xuICAgIHByb3RlY3RlZCBzdGF0aWMgYnJpZGdlIDogc2FwLnVpLmNvcmUuQ29udHJvbDtcbiAgICBwcm90ZWN0ZWQgcmVuZGVyZWQ6Tm9kZTsgXG4gICAgcHJvdGVjdGVkIGNvdW50Om51bWJlcj0wO1xuXG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEJyaWRnZSgpIDogc2FwLnVpLmNvcmUuQ29udHJvbCB7XG4gICAgICAgIHJldHVybiBVSTVBdHRhY2htZW50LmJyaWRnZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUGF0Y2godG5vZGU6Tm9kZSxlbGVtZW50OkVsZW1lbnQpIHtcbiAgICAgICAgbGV0IHRoYXQ9dGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyAoY2xhc3MgaW1wbGVtZW50cyBQYXRjaCB7XG4gICAgICAgICAgICByZXN0b3JlUG9zaXRpb24oZWxlbTogTm9kZSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhhdC5yZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB1aTUgcmVyZW5kZXJpZyBcbiAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZyBleGNlcHQgc2F2ZSB0aGUgcmVuZGVyZWQgbm9kZSBhcyB0aGUgVUk1IGVsZW1lbnQgd2lsbCBhdHRhY2ggcmVuZGVyZWQgdG8gdGhlIHBhcmVudCBicmlkZ2VcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5yZW5kZXJlZD1lbGVtO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVpNSBpcyBub3QgcmVyZW5kaW5nIChvblByZVJlbmRlciB3YXMgbm90IGNhbGxlZClcbiAgICAgICAgICAgICAgICAgICAgLy8gc28ganVzdCBwYXRjaCB0aGUgbmV3bHkgY3JlYXRlZCBlbGVtIGJhY2sgdG8gdGhlIGJyaWRnZSdzIGRvbSByZWZcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvcD1VSTVBdHRhY2htZW50LmdldEJyaWRnZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50OkVsZW1lbnQ9dG9wLmdldERvbVJlZigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5uZXJIVE1MPVwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBVSTVBdHRhY2htZW50IC0gQ2Fubm90IHBhdGNoIGJhY2sgcmVyZW5kZXJlZCBlbGVtZW50IHRvIHRoZSBicmlkZ2VgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkoKTtcbiAgICB9XG5cbiAgICBvblByZVJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlZD1udWxsO1xuICAgIH1cblxuXG4gICAgb25SZW5kZXIocm06c2FwLnVpLmNvcmUuUmVuZGVyTWFuYWdlcikge1xuICAgICAgICBjb25zb2xlLndhcm4oYC0tLS0tLS0tLS0tLS0tYnJpZGdlIHJlbmRlciAjJHt0aGlzLmNvdW50Kyt9LS0tLS0tLS0tYCk7XG4gICAgICAgIHJtLm9wZW5TdGFydCgnZGl2JyxVSTVBdHRhY2htZW50LmdldEJyaWRnZSgpKVxuICAgICAgICAuY2xhc3MoJ3UtY29tbC11aTVicmlkZ2UnKVxuICAgICAgICAub3BlbkVuZCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IHI9SW1wbGVtZW50YXRpb25zLmNyZWF0ZVJlbmRlcih0aGlzLmNvRWxlbWVudC5nZXRUTigpLmdldFBhdGNoKCkpO1xuICAgICAgICAgICAgdGhpcy5jb0VsZW1lbnQuZ2V0Q3Z0KCkucmVuZGVyTm9kZShyLHRoaXMuY29FbGVtZW50LmdldFROKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcm0uY2xvc2UoJ2RpdicpO1xuICAgIH1cblxuICAgIG9uUG9zdFJlbmRlcihyZWY6RWxlbWVudCl7XG4gICAgICAgIGlmICh0aGlzLnJlbmRlcmVkKVxuICAgICAgICAgICAgcmVmLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZWQpO1xuICAgIH1cblxuICAgIFxuICAgIHByb3RlY3RlZCBzdGF0aWMgbWFrZUJyaWRnZUNvbnRyb2woYXR0YWNobWVudDogVUk1QXR0YWNobWVudCxlbGVtZW50OiBFbGVtZW50LHRvSW5zZXJ0OiBzdHJpbmcgfCBBc3NldElEKSA6IHNhcC51aS5jb3JlLkNvbnRyb2wge1xuICAgICAgICBsZXQgQ29udHJvbENsYXNzPWV4dGVuZFVJNShcImNvbWwuVUk1QnJpZGdlXCIpOy8vKHNhcC51aS5jb3JlLkNvbnRyb2wgYXMgYW55KS5leHRlbmQoXCJjb21sLlVJNUJyaWRnZVwiLE9iamVjdC5hc3NpZ24oe30sVUk1Q29udHJvbCkpO1xuXG4gICAgICAgIFVJNUF0dGFjaG1lbnQuYnJpZGdlPSBuZXcgKGNsYXNzIGV4dGVuZHMgQ29udHJvbENsYXNzIGltcGxlbWVudHMgVUk1QnJpZGdlIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgICAgIC8vIGRlbGVnYXRlIFVJNSByZW5kZXJpbmcgYmFjayB0byB0aGUgYXR0YWNobWVudFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q29udHJvbE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICBvblByZVJlbmRlcjooKT0+YXR0YWNobWVudC5vblByZVJlbmRlcigpLFxuICAgICAgICAgICAgICAgICAgICBvblJlbmRlcjogKHJtKT0+YXR0YWNobWVudC5vblJlbmRlcihybSksXG4gICAgICAgICAgICAgICAgICAgIG9uUG9zdFJlbmRlcjoocmVmOmFueSk9PmF0dGFjaG1lbnQub25Qb3N0UmVuZGVyKHJlZiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgc2V0Q3Z0KGN2dDpDb252ZXJ0ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN2dD1jdnQ7XG4gICAgICAgICAgICB9Ki9cbiAgICAgICAgfSkoKSBhcyBhbnk7XG5cbiAgICAgICAgcmV0dXJuIFVJNUF0dGFjaG1lbnQuYnJpZGdlO1xuICAgIH1cblxuICAgIFxuICAgIHB1YmxpYyBhdHRhY2goZWxlbWVudDogRWxlbWVudCwgdG9JbnNlcnQ6IHN0cmluZyB8IEFzc2V0SUQpIHtcbiAgICAgICAgbGV0IHRvcD1VSTVBdHRhY2htZW50LmdldEJyaWRnZSgpO1xuXG4gICAgICAgIGlmICghdG9wKXtcbiAgICAgICAgICAgIC8vIGRlb3NudCB5ZXQgZXhpc3QgLSBjcmVhdGUgb3VyIHNpZ25lbGV0b24gYXQgcGxhY2VBdCB0aGUgZWxlbWVudFxuICAgICAgICAgICAgdG9wPVVJNUF0dGFjaG1lbnQubWFrZUJyaWRnZUNvbnRyb2wodGhpcyxlbGVtZW50LHRvSW5zZXJ0KTtcbiAgICAgICAgICAgIHRvcC5wbGFjZUF0KGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYWtlQ29FbGVtZW50KGVsZW1lbnQsdG9JbnNlcnQpXG4gICAgICAgIC50aGVuKCh2YWx1ZSk9PntcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQXR0YWNoKHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuY29FbGVtZW50PXZhbHVlO1xuICAgICAgICAgICAgdG9wLmludmFsaWRhdGUoKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vUmVuZGVyXCI7XG5pbXBvcnQgeyBQYXRjaCB9IGZyb20gXCIuLi9QYXRjaFwiO1xuXG50eXBlIEdldElkID0oYzpDb0VsZW1lbnQpPT5zdHJpbmc7XG5cblxuXG5leHBvcnQgY2xhc3MgUmVuZGVySW1wbCBpbXBsZW1lbnRzIFJlbmRlciB7XG4gICAgcHJvdGVjdGVkIGdldElkOkdldElkO1xuICAgIHByb3RlY3RlZCBwbjpFbGVtZW50W109W107IC8vIHRoZSBub2RlIHRvIHdoaWNoIHdlIGFyZSBhZGRpbmdcbiAgICBwcm90ZWN0ZWQgdGRvYzpEb2N1bWVudDtcbiAgICBwcm90ZWN0ZWQgcGF0Y2g6UGF0Y2g7XG5cbiAgICBjb25zdHJ1Y3RvcihwYXRjaDpQYXRjaCxnZXRJZDpHZXRJZCkge1xuICAgICAgICB0aGlzLmdldElkPWdldElkO1xuICAgICAgICB0aGlzLnRkb2M9ZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMucGF0Y2g9cGF0Y2g7XG4gICAgfVxuXG4gICAgXG5cbiAgICBwcm90ZWN0ZWQgZSgpIDogRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLnBuW3RoaXMucG4ubGVuZ3RoLTFdO1xuICAgIH1cblxuICAgIGF0dHIoc05hbWU6IHN0cmluZywgdlZhbHVlOiBhbnkpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lKCkuc2V0QXR0cmlidXRlKHNOYW1lLHZWYWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBjbGFzcyhzQ2xhc3M6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLmUoKS5jbGFzc0xpc3QuYWRkKHNDbGFzcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgY2xvc2Uoc1RhZ05hbWU6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICBpZiAodGhpcy5wbi5sZW5ndGg9PTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFJNIC0gbWlzbWF0Y2hlZCBjbG9zZSB0YWcgJHtzVGFnTmFtZX1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGFzdGU9dGhpcy5wbi5wb3AoKTtcbiAgICAgICAgdGhpcy5pbnNlcnRSZW5kZXJlZChsYXN0ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvcHkgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyB3aXRoICR7fSBleHBhbnNpb24gaW50byB0aGUgbGFzdCBvcGVuZWQgSFRNTCBlbGVtZW50LlxuICAgICAqIFxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjb21wb25lbnQgVGhlIGNvbXBvbmVudCBcbiAgICAgKiBAcGFyYW0gZG9Ob3RDb3B5IChPcHRpb25hbCkgYW4gYXJyYXkgb2YgYXR0cmlidXRlcyB0byBOT1QgY29weS5cbiAgICAgKiBAcGFyYW0gY29weUZyb20gIChPcHRpb25hbCkgdGhlIGVsZW1lbnQgdG8gY29weSBmcm9tLiBJZiBub3Qgc3BlY2lmaWVkLCBkZWZhdWx0cyB0byB0aGlzIGNvbXBvbmVudCdzIHNvdXJjZSBub2RlXG4gICAgICovXG4gICAgY29weUF0dHJFeGNlcHQoY29tcG9uZW50OkNvRWxlbWVudCxkb05vdENvcHk/OiBzdHJpbmdbXSxjb3B5RnJvbT86IE5vZGUpIDogdGhpcyB7XG4gICAgICAgIGNvbXBvbmVudC5nZXRDdnQoKS5jb3B5QXR0ckV4Y2VwdCh0aGlzLChjb3B5RnJvbSkgPyBjb3B5RnJvbTpjb21wb25lbnQuZ2V0VE4oKS5zbm9kZSxkb05vdENvcHksY29tcG9uZW50LmdldFROKCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIHB1YmxpYyByZW5kZXJDaGlsZHJlbihjb21wb25lbnQ6Q29FbGVtZW50LCBpdGVyYXRpb24/Om51bWJlcixwYXJhbWV0ZXJzUGVyQ2hpbGQ/OntbdGFnbmFtZTpzdHJpbmddOmFueX0pOiB0aGlzIHtcbiAgICAgICAgaWYgKHBhcmFtZXRlcnNQZXJDaGlsZCkge1xuICAgICAgICAgICAgZm9yKGxldCB0YWduYW1lIGluIHBhcmFtZXRlcnNQZXJDaGlsZCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5nZXRUTigpLmNoaWxkUGFyYW1zKGl0ZXJhdGlvbix0YWduYW1lLHBhcmFtZXRlcnNQZXJDaGlsZFt0YWduYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29tcG9uZW50LmdldEN2dCgpLnJlbmRlckNoaWxkcmVuKHRoaXMsY29tcG9uZW50LmdldFROKCksaXRlcmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0IGEgcHJlcmVuZGVyZWQgZG9tIG5vZGUgaW50byB0aGUgY3VycmVudCByZW5kZXJpbmcgcG9zaXRpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIGVsZW0gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgaW5zZXJ0UmVuZGVyZWQoZWxlbTpOb2RlKSA6IHRoaXMge1xuICAgICAgICBpZiAodGhpcy5wbi5sZW5ndGg+PTEpIHsgLy8gYXRsZWFzdCBvbmUgaXRlbSByZW1haW5zIG9uIHRoZSBzdGFjaywgbWFrZSBlbGVtIGNoaWxkIG9mIHRoYXRcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYCAke3RoaXMucG4ubGVuZ3RofSBSTSBhZGRpbmcgY2hpbGQgJHt0aGlzLnRvU3RyKGVsZW0pfSB0byAke3RoaXMudG9TdHIodGhpcy5lKCkpfWApO1xuICAgICAgICAgICAgdGhpcy5lKCkuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIHdlIGp1c3QgYnVpbGQgdGhlIGxhc3Qgb2JqZWN0LCBzbyB1c2UgdGhlIHBhdGNoIHRvIHJlc3RvcmUgaXRcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYCAke3RoaXMucG4ubGVuZ3RofSBSTSByZXN0b3JpbmcgY2hpbGQgJHt0aGlzLnRvU3RyKHRoaXMuZSgpKX1gKTtcbiAgICAgICAgICAgIHRoaXMucGF0Y2gucmVzdG9yZVBvc2l0aW9uKGVsZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB9XG5cbiAgICBvcGVuRW5kKCk6IHRoaXMge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcblx0ICogQ3JlYXRlcyBhbiBIVE1MIGVsZW1lbnQgZnJvbSB0aGUgZ2l2ZW4gdGFnIG5hbWUgYW5kIHBhcmVudCBuYW1lc3BhY2Vcblx0ICovXG5cdHByb3RlY3RlZCBjcmVhdGVFbGVtZW50KHNUYWdOYW1lOnN0cmluZywgb1BhcmVudD86RWxlbWVudCkgOiBFbGVtZW50e1xuXHRcdGlmIChzVGFnTmFtZSA9PSBcInN2Z1wiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuXHRcdH1cblxuXHRcdHZhciBzTmFtZXNwYWNlVVJJID0gb1BhcmVudCAmJiBvUGFyZW50Lm5hbWVzcGFjZVVSSTtcblx0XHRpZiAoIXNOYW1lc3BhY2VVUkkgfHwgc05hbWVzcGFjZVVSSSA9PSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiB8fCBvUGFyZW50LmxvY2FsTmFtZSA9PSBcImZvcmVpZ25PYmplY3RcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMudGRvYy5jcmVhdGVFbGVtZW50KHNUYWdOYW1lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy50ZG9jLmNyZWF0ZUVsZW1lbnROUyhzTmFtZXNwYWNlVVJJLCBzVGFnTmFtZSk7XG5cdH07XG5cbiAgICBvcGVuU3RhcnQoc1RhZ05hbWU6IHN0cmluZywgY29tcD86IENvRWxlbWVudCxub0NvSWQ/OmJvb2xlYW4pOiB0aGlzIHtcbiAgICAgICAgbGV0IGU9dGhpcy5jcmVhdGVFbGVtZW50KHNUYWdOYW1lLCh0aGlzLnBuLmxlbmd0aD4wKSA/IHRoaXMuZSgpOnVuZGVmaW5lZCk7XG4gICAgICAgIGlmIChjb21wKSB7XG4gICAgICAgICAgICBjb21wLmdldFROKCkudG5vZGU9ZTtcbiAgICAgICAgICAgIGlmICghbm9Db0lkKSB7XG4gICAgICAgICAgICAgICAgZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtY29pZCcsY29tcC5nZXRUTigpLmdldElkKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbi5wdXNoKGUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuXG4gICAgc3R5bGUoc05hbWU6IHN0cmluZywgc1ZhbHVlOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgKHRoaXMuZSgpIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5jc3NUZXh0ICs9IGAke3NOYW1lfToke3NWYWx1ZX07YDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGV4dChzVGV4dDogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc1RleHQpO1xuICAgICAgICAvL3RoaXMuZSgpLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgdGhpcy5pbnNlcnRSZW5kZXJlZCh0ZXh0Tm9kZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVuc2FmZUh0bWwoc0h0bWw6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICAvL3RoaXMuZSgpLmlubmVySFRNTD1zSHRtbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxufSIsImltcG9ydCB7IEFqYXggfSBmcm9tIFwiLi4vQWpheFwiO1xuaW1wb3J0IHsgQXNzZXRGYWN0b3J5IH0gZnJvbSBcIi4uL0Fzc2V0XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBQYXRjaCB9IGZyb20gXCIuLi9QYXRjaFwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgQ29udmVydGVySW1wbCB9IGZyb20gXCIuL0NvbnZlcnRlckltcGxcIjtcbmltcG9ydCB7IFJlbmRlckltcGwgfSBmcm9tIFwiLi9SZW5kZXJJbXBsXCI7XG5pbXBvcnQgeyBBdHRhY2htZW50IH0gZnJvbSBcIi4uL0F0dGFjaG1lbnRcIjtcbmltcG9ydCB7IEF0dGFjaG1lbnRJbXBsIH0gZnJvbSBcIi4vQXR0YWNobWVudEltcGxcIjtcbmltcG9ydCB7IEdldEF0dHJULCBUaGlzIH0gZnJvbSBcIi4uL1RoaXNcIjtcbmltcG9ydCBCYXNlVGhpcyBmcm9tIFwiLi9CYXNlVGhpc1wiO1xuXG4vKipcbiAqIERlZmF1bHQgaW1wbGVtZW50YXRpb25zIG9mIGFsbCBpbnRlcmZhY2VzLlxuICogXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0SW1wbGVtZW50YXRpb25zIGV4dGVuZHMgSW1wbGVtZW50YXRpb25zIHtcbiAgICBwcm90ZWN0ZWQgYWpheDpBamF4O1xuICAgIHByb3RlY3RlZCBhc3NldEZhY3Rvcnk6QXNzZXRGYWN0b3J5O1xuXG4gICAgY29uc3RydWN0b3IoYWpheDpBamF4LGFzc2V0RmFjdG9yeTpBc3NldEZhY3RvcnkpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hamF4PWFqYXg7XG4gICAgICAgIHRoaXMuYXNzZXRGYWN0b3J5PWFzc2V0RmFjdG9yeTtcbiAgICB9XG5cblxuICAgIHByb3RlY3RlZCBnZXRBamF4SW1wbCgpOiBBamF4IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWpheDtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGdldEFzc2V0RmFjdG9yeUltcGwoKTogQXNzZXRGYWN0b3J5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXNzZXRGYWN0b3J5O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVDb252ZXJ0ZXJJbXBsKGNvcHlTdGF0ZUZyb20/OiBDb252ZXJ0ZXI8VGhpcz4pOiBDb252ZXJ0ZXI8VGhpcz4ge1xuICAgICAgICByZXR1cm4gbmV3IENvbnZlcnRlckltcGwoY29weVN0YXRlRnJvbSk7XG4gICAgfVxuICAgIHByb3RlY3RlZCBjcmVhdGVSZW5kZXJJbXBsKHBvczpQYXRjaCk6IFJlbmRlciB7XG4gICAgICAgIHJldHVybiBuZXcgUmVuZGVySW1wbChwb3MsKGMpPT57XG4gICAgICAgICAgICByZXR1cm4gJ19pZCcrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwMDAwMDAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUF0dGFjaG1lbnRJbXBsKCk6IEF0dGFjaG1lbnQge1xuICAgICAgICByZXR1cm4gbmV3IEF0dGFjaG1lbnRJbXBsKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVRoaXNJbXBsKGN2dDpDb252ZXJ0ZXI8VGhpcz4sZm5HZXRBdHRyOkdldEF0dHJUKTogVGhpcyB7XG4gICAgICAgIHJldHVybiBuZXcgQmFzZVRoaXMoY3Z0LHVuZGVmaW5lZCxmbkdldEF0dHIpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBBamF4LCBBamF4Q2FjaGUgfSBmcm9tIFwiLi4vQWpheFwiO1xuaW1wb3J0IHsgQXNzZXRJRCwgaXNBc3NldElkIH0gZnJvbSBcIi4uL0Fzc2V0XCI7XG5cbmRlY2xhcmUgdmFyIGpRdWVyeTogYW55O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBiYXNlIGZvbGRlciBvZiBhbiBhc3NldElkIHRvIGZldGNoIHBhZ2VzIGZyb20uIFxuICpcbnR5cGUgR2V0QXNzZXRCYXNlID0gKGFzc2V0SWQ6QXNzZXRJRCk9PnN0cmluZztcbiovXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBBamF4IGludGVyZmFjZSB1c2luZyBqUXVlcnkuXG4gKiBcbiAqIEZvciB0aGlzIHRvIHdvcmssIHRoZSBtYWluIGh0bWwgcGFnZSBvZiB5b3VyIFNQQSBtdXN0IGluY2x1ZGUgalF1ZXJ5LlxuICogXG4gKiBGb3IgZXhhbXBsZTpcbiAqIFxuICAgPHNjcmlwdCBzcmM9XCJodHRwczovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnktMy42LjAubWluLmpzXCI+PC9zY3JpcHQ+XG5cbiAqIFxuICovXG5leHBvcnQgY2xhc3MgSlF1ZXJ5QWpheCBpbXBsZW1lbnRzIEFqYXgge1xuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgYmFzZSBwYXRoIG9mIHRoZSBVUkwgb2YgdGhlIGN1cnJlbnQgd2luZG93XG4gICAgICogXG4gICAgICogc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQwNjE5Mi9nZXQtY3VycmVudC11cmwtd2l0aC1qcXVlcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0QmFzZVBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgLy8gKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSBpcyBzb21ldGhpbmcgbGlrZSA6ICcvV1JBX1YyL3B1YmxpYy9zYW1wbGVzL3NxbC5odG1sJ1xuICAgICAgICAvLyB3aWxsIHJldHVybiAnL1dSQV9WMi8nXG5cbiAgICAgICAgbGV0IGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl9wYXJlbnRMb2NhdGlvbikgeyAvLyBpZiB3ZSBhcmUgcGFydCBvZiBhbiBpZnJhbWUsIHVzZSB0aGUgX3BhcmVudExvY2F0aW9uIHNldCBvbiB1cyBieSBvdXIgcGFyZW50XG4gICAgICAgICAgICBsb2NhdGlvbiA9ICh3aW5kb3cgYXMgYW55KS5fcGFyZW50TG9jYXRpb247XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2F0aW9uICYmIGxvY2F0aW9uLnBhdGhuYW1lKSB7XG4gICAgICAgICAgICBsZXQgcCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHAgPT09ICdzdHJpbmcnICYmIHAubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHAgPSBwLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBsZXQgZG90ID0gcC5pbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgICAgaWYgKGRvdCA+IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnLycgKyBwLnN1YnN0cmluZygwLCBkb3QgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uTm90TG9nZ2VkSW5FcnJvcigpIHtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWpheEFzUHJvbWlzZShnZXRvcnBvc3Q6J0dFVCd8J1BPU1QnLGhlYWRlcnM6YW55LHVybDpzdHJpbmcsY29udGVudFR5cGU6c3RyaW5nLGNhY2hlPzogQWpheENhY2hlLHJlc3BvbnNlRGF0YVR5cGU/OiAneG1sJyB8ICdqc29uJyB8ICdzY3JpcHQnIHwgJ2h0bWwnIHwgJ2pzb25wJyB8ICd0ZXh0Jyxwb3N0ZGF0YT86c3RyaW5nKSA6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHR5cGU6IGdldG9ycG9zdCxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogKCFyZXNwb25zZURhdGFUeXBlKSA/ICdqc29uJyA6IHJlc3BvbnNlRGF0YVR5cGUsXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICAgICAgZGF0YTogcG9zdGRhdGEsXG4gICAgICAgICAgICAgICAgLyogdXJsOiB0aGlzcy5nZXRCYXNlUGF0aCgpKydqc29uY2FsbC8nICsgY2FsbE5hbWUsKi9cbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcblxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQsIHN0YXR1cywganFYSFIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdSQSB3aWxsIHNlcmlhbGl6ZSBhbiBleGNlcHRpb24gYW5kIHNlbmQgaXQgdG8gdXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcmVzcG9uc2VEYXRhVHlwZSB3YXMgJ2pzb24nIHRoZW4ganF1ZXJ5J3MgYWxyZWFkeSBwYXJzZWQgdGhlIHJlc3VsdCwgc28gd2UgY2FuIGNoZWNrIHRoZSBqYXZhc2NyaXB0IG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm90IChmb3IgZXhhbXBsZSB0aGUgcmVzcG9uc2VEYXRhVHlwZSB3YXMgc3RyaW5nKSwgd2UgbXVzdCBwYXJzZSBpdCBzb3Vyc2VsdmVzIGVmZmljaWVudGx5XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlcnIgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VEYXRhVHlwZSAhPSAnanNvbicgJiYgdHlwZW9mIHJlc3VsdCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhcnRzV2l0aCgne1wiRVhDRVBUSU9OJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyciA9IEpTT04ucGFyc2UocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5FUlJPUiB8fCBlcnIuRVhDRVBUSU9OKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci54aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIEpTT05FeGNlcHRpb24sIHNvIHBhc3MgaXQgYXMgYSB3aG9sZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKGVyci5FUlJPUikgPyBlcnIuRVJST1IgOiBlcnIuRVhDRVBUSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHtzdHJpbmdpZmllZEpzb246c3RyaW5naWZpZWRKc29uLGxlbmd0aDpqcVhIUi5yZXNwb25zZVRleHQubGVuZ3RoIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LmludmFsaWRTZXNzaW9uS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJTRVNTSU9OIEVSUk9SOlwiICsgcmVzdWx0LmludmFsaWRTZXNzaW9uS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5vdExvZ2dlZEluRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdC5pbnZhbGlkU2Vzc2lvbktleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvc3RkYXRhICYmIGNhY2hlICYmIGpxWEhSLnJlc3BvbnNlVGV4dC5sZW5ndGggPCBjYWNoZS5nZXRWYWx1ZVNpemVMaW1pdCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSBpbiB0aGUgY2FjaGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLndyaXRlKHBvc3RkYXRhLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlcnIgPSBgWyR7KHRleHRTdGF0dXMpID8gdGV4dFN0YXR1cyA6ICcnfV06JHsoZXJyb3JUaHJvd24gJiYgZXJyb3JUaHJvd24ubWVzc2FnZSkgPyBlcnJvclRocm93bi5tZXNzYWdlIDogJyd9YDtcbiAgICAgICAgICAgICAgICAgICAgLy8odGV4dFN0YXR1cyAmJiAodHlwZW9mIHRleHRTdGF0dXM9PT0nc3RyaW5nJykpID8gdGV4dFN0YXR1czooZXJyb3JUaHJvd24gJiYgKHR5cGVvZiBlcnJvclRocm93bj09PSdzdHJpbmcnKSkgPyBlcnJvclRocm93bjonQW4gZXJyb3Igb2NjdXJyZWQnO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChzZXJyKTsvLyxlcnJvclRocm93bik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgYWpheFRvU2VydmVyKGJhc2VVcmw6IHN0cmluZywgY2FsbE5hbWU6IHN0cmluZywgc3RyaW5naWZpZWRKc29uOiBzdHJpbmcsIGNhY2hlPzogQWpheENhY2hlLCByZXNwb25zZURhdGFUeXBlPzogJ3htbCcgfCAnanNvbicgfCAnc2NyaXB0JyB8ICdodG1sJyB8ICdqc29ucCcgfCAndGV4dCcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICAvLyBjcmVhdGUgYW4gaWRcbiAgICAgICAgLy9sZXQgYWpheF90aW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgIHJldHVybiB0aGlzLmFqYXhBc1Byb21pc2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeydjYWxsJzogY2FsbE5hbWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZURhdGFUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdpZmllZEpzb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhbiBhamF4IHJlcXVlc3QsIHJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlc3VsdC5cbiAgICAgKiBgYGBcbiAgICAgKiAvLyB0eXBpY2FsIHVzYWdlOlxuICAgICAqIGFqYXgoXCJHZXRTb21ldGhpbmdcIix7c29tZVBhcmFtZXRlcixcIlNvbWVWYWx1ZVwiLC4uLn0pXG4gICAgICogLnRoZW4oKHJlc3VsdDpTb21lVHlwZSk9PntcbiAgICAgKiB9KVxuICAgICAqIC5jYXRjaCgoZXJyb3I6c3RyaW5nfEpTT05FeGNlcHRpb24pPT57XG4gICAgICogfSlcbiAgICAgKiBgYGBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2FsbE5hbWUgXG4gICAgICogQHBhcmFtIHsqfSBqc29uVG9TZW5kXG4gICAgICogQHBhcmFtIHtBamF4Q2FjaGV9IGNhY2hlIElmIHN1cHBsaWVkLCB1c2UgdGhpcyBjYWNoZVxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IFxuICAgICAqKi9cbiAgICBwdWJsaWMgYWpheChjYWxsTmFtZTogc3RyaW5nLCBqc29uVG9TZW5kOiBhbnksIGNhY2hlPzogQWpheENhY2hlLCByZXNwb25zZURhdGFUeXBlPzogJ3htbCcgfCAnanNvbicgfCAnc2NyaXB0JyB8ICdodG1sJyB8ICdqc29ucCcgfCAndGV4dCcpIHtcbiAgICAgICAgbGV0IGJhc2VVcmwgPSB0aGlzLmdldEJhc2VQYXRoKCkgKyAnanNvbmNhbGwvJyArIGNhbGxOYW1lO1xuXG5cbiAgICAgICAgbGV0IHN0cmluZ2lmaWVkSnNvbiA9IEpTT04uc3RyaW5naWZ5KGpzb25Ub1NlbmQpO1xuICAgICAgICBjb25zb2xlLndhcm4oc3RyaW5naWZpZWRKc29uKTtcbiAgICAgICAgaWYgKGNhY2hlKSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgY2FjaGUgaGFzIGEgcmVzdWx0LCBhbmQgaWYgc28sIHVzZSBpdDpcbiAgICAgICAgICAgIGxldCBjYWNoZWRSZXN1bHQgPSBjYWNoZS5yZWFkKHN0cmluZ2lmaWVkSnNvbik7XG4gICAgICAgICAgICBpZiAoY2FjaGVkUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4oJ0NBQ0hFIEhJVCBvbiBbJytzdHJpbmdpZmllZEpzb24rJ10nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZFJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLmFqYXhUb1NlcnZlcihiYXNlVXJsLCBjYWxsTmFtZSwgc3RyaW5naWZpZWRKc29uLCBjYWNoZSwgcmVzcG9uc2VEYXRhVHlwZSlcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgIH0gXG5cbiAgICBwcm90ZWN0ZWQgYXNzZXRzRm9sZGVyKGFzc2V0SWQ6QXNzZXRJRCkgOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRCYXNlUGF0aCgpKydodG1sLyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYW4gQXNzZXRJRCwgcmV0dXJuIGl0cyBjb250ZW50IGluIHRoZSBzcGVjaWZpZWQgcmVzcG9uc2VEYXRhVHlwZS5cbiAgICAgKiBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QXNzZXQoYXNzZXRJZDpBc3NldElELCBjYWNoZT86IEFqYXhDYWNoZSwgcmVzcG9uc2VEYXRhVHlwZT86ICd4bWwnIHwgJ2pzb24nIHwgJ3NjcmlwdCcgfCAnaHRtbCcgfCAnanNvbnAnIHwgJ3RleHQnKSA6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGxldCB1cmw9dGhpcy5hc3NldHNGb2xkZXIoYXNzZXRJZCkrYCR7YXNzZXRJZC50eXBlfS8ke2Fzc2V0SWQubmFtZX1gO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFqYXhBc1Byb21pc2UoXG4gICAgICAgICAgICAnR0VUJyxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIGNhY2hlLFxuICAgICAgICAgICAgcmVzcG9uc2VEYXRhVHlwZVxuICAgICAgICApXG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQXNzZXQsIEFzc2V0SUQsIEFzc2V0VHlwZSwgQ29FbGVtZW50QXNzZXQsIERvY3VtZW50QXNzZXQsIHN0cmluZ2lmeUFzc2V0SUQgfSBmcm9tIFwiLi4vQXNzZXRcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IEltcGxlbWVudGF0aW9ucyB9IGZyb20gXCIuLi9JbXBsZW1lbnRhdGlvbnNcIjtcbmltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IFRhcmdldE5vZGVJbXBsIH0gZnJvbSBcIi4vVGFyZ2V0Tm9kZUltcGxcIjtcbmltcG9ydCB7IEdldEF0dHJULCBUaGlzIH0gZnJvbSBcIi4uL1RoaXNcIjtcbmltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vQ29FbGVtZW50RmFjdG9yeVwiO1xuXG4vKipcbiAqIEFuIGFzc2V0IHRoYXQgcmVwcmVzZW50cyBhIC5odG1sIGZpbGUgdGhhdCBjYW4gYmUgcGFyc2VkIGludG8gYSBEb2N1bWVudCBvYmplY3QuXG4gKiBcbiAqIFRoZSB0eXBlIGlzIHNpbXBseSB1c2VkIGFzIHRoZSBzdWJmb2xkZXIgaW4gdGhlIGAvcHVibGljL3BhZ2VzJyBmb2xkZXIuIEl0IGRlZmF1bHRzIHRvICdwYWdlJ1xuICogVGhlIG5hbWUgaXMgdGhlIGZpbGUgaW4gdGhlIGZvbGRlci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERvY3VtZW50Q29FbGVtZW50QXNzZXQgaW1wbGVtZW50cyBBc3NldCxEb2N1bWVudEFzc2V0LENvRWxlbWVudEFzc2V0IHtcblx0cHJvdGVjdGVkIGFzc2V0SWQ6QXNzZXRJRDtcblx0cHJvdGVjdGVkIGNvbnRyb2w6Q29FbGVtZW50O1xuXG5cdFxuXG5cdGNvbnN0cnVjdG9yKGFzc2V0SWQ6QXNzZXRJRCkge1xuXHRcdHRoaXMuYXNzZXRJZD1hc3NldElkO1xuXHR9XG5cblx0cHVibGljIGdldElkKCk6IEFzc2V0SUQge1xuICAgICAgICByZXR1cm4gdGhpcy5hc3NldElkO1xuICAgIH1cblxuXG5cdHB1YmxpYyBnZXRUeXBlKCk6IEFzc2V0VHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldElkKCkudHlwZTtcbiAgICB9XG5cblxuXG5cdHB1YmxpYyBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRJZCgpLm5hbWU7XG5cdH1cblxuXG5cblxuXHQvKipcblx0ICogcmV0dXJucyB0aGUgRE9NIGRvY3VtZW50IG9mIHRoaXMgYXNzZXQuXG5cdCAqL1xuXHRwdWJsaWMgYWJzdHJhY3QgZ2V0RG9jdW1lbnQoKSA6IFByb21pc2U8RG9jdW1lbnQ+O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhpcyBhc3NldCB3cmFwcGVkIGFzIGEgY29tcG9uZW50IGVsZW1lbnQuXG5cdCAqIFRoaXMgY29tcG9uZW50IGNhbiB0aGVuIGJlIGluc2VydGVkIGludG8gdGhlIGN1cnJlbnQgZG9jdW1lbnQuXG4gICAgICogVGhlIENvRWxlbWVudCBoYXMgaXRzIG93biBUaGlzIGFuZCBDb21sQ29udmVydGVyLlxuXHQgKi9cblx0cHVibGljIGFzQ29FbGVtZW50PFQgZXh0ZW5kcyBUaGlzPihyb290PzpUYXJnZXROb2RlSW1wbCxjYj86KGN2dDpDb252ZXJ0ZXI8VD4pPT52b2lkLGZuR2V0QXR0cj86R2V0QXR0clQpIDogUHJvbWlzZTxDb0VsZW1lbnQ8VD4+IHtcblx0XHRsZXQgY29tcG9uZW50OkNvRWxlbWVudDxUPjtcblx0XHRyZXR1cm4oXG5cdFx0XHR0aGlzLmdldERvY3VtZW50KClcblx0XHRcdC50aGVuKChkb2MpPT57XG5cdFx0XHRcdGxldCBjdnQ9SW1wbGVtZW50YXRpb25zLmNyZWF0ZUNvbnZlcnRlcigpO1xuXHRcdFx0XHRpZiAoY2IpXHR7XG5cdFx0XHRcdFx0Y2IoY3Z0IGFzIENvbnZlcnRlcjxUPik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3Z0LnNldEdldEF0dHJGbihmbkdldEF0dHIpO1xuXHRcdFx0XHRyZXR1cm4gY3Z0LnNldERvY3VtZW50KGRvYyx0aGlzLmdldElkKCkscm9vdCk7IC8vIHRoaXMgd2lsbCBjYXVzZSB0aGUgdGhpcyBzY3JpcHQgdG8gYmUgY2FsbGVkIGFzIGltcG9ydHMgYXJlIGxvYWRlZFxuXHRcdFx0fSlcblx0XHRcdC50aGVuKChjdnQpPT57XG5cdFx0XHRcdGlmICghY29tcG9uZW50KSB7XG5cdFx0XHRcdFx0Ly9jb21wb25lbnQ9Y3Z0Lm1ha2VDb0VsZW1lbnQoY3Z0LmdldFJvb3QoKSk7XG5cdFx0XHRcdFx0Y29tcG9uZW50PWN2dC5nZXRUaGlzKCkgYXMgYW55IGFzIENvRWxlbWVudDxUPjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gY29tcG9uZW50O1x0XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0gICAgXG59IiwiaW1wb3J0IHsgQXNzZXRJRCwgVGV4dEFzc2V0IH0gZnJvbSBcIi4uL0Fzc2V0XCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBEb2N1bWVudENvRWxlbWVudEFzc2V0IH0gZnJvbSBcIi4vRG9jdW1lbnRDb0VsZW1lbnRBc3NldFwiO1xuXG4vKipcbiAqIEFuIGFzc2V0IHRoYXQgcmVwcmVzZW50cyBhIC5odG1sIGZpbGUgdGhhdCBjYW4gYmUgcGFyc2VkIGludG8gYSBEb2N1bWVudCBvYmplY3QuXG4gKiBcbiAqIFRoZSB0eXBlIGlzIHNpbXBseSB1c2VkIGFzIHRoZSBzdWJmb2xkZXIgaW4gdGhlIGAvcHVibGljL3BhZ2VzJyBmb2xkZXIuIEl0IGRlZmF1bHRzIHRvICdwYWdlJ1xuICogVGhlIG5hbWUgaXMgdGhlIGZpbGUgaW4gdGhlIGZvbGRlci5cbiAqL1xuZXhwb3J0IGNsYXNzIERvY3VtZW50QXNzZXRJbXBsIGV4dGVuZHMgRG9jdW1lbnRDb0VsZW1lbnRBc3NldCBpbXBsZW1lbnRzIFRleHRBc3NldCB7XG5cblx0Y29uc3RydWN0b3IoYXNzZXRJZDpBc3NldElEKSB7XG5cdFx0c3VwZXIoYXNzZXRJZClcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSByYXcgdGV4dCBvZiB0aGlzIGh0bWwgYXNzZXQuXG5cdCAqIFxuXHQgKiBAcmV0dXJucyBcblx0ICovXG5cdHB1YmxpYyBnZXRUZXh0KCkgOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHJldHVybiBJbXBsZW1lbnRhdGlvbnMuZ2V0QWpheCgpLmdldEFzc2V0KHRoaXMuYXNzZXRJZCwgdW5kZWZpbmVkLCAndGV4dCcpO1xuXHR9XG5cblxuXHQvKipcblx0ICogcmV0dXJucyB0aGUgRE9NIGRvY3VtZW50IG9mIHRoaXMgYXNzZXQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0RG9jdW1lbnQoKSA6IFByb21pc2U8RG9jdW1lbnQ+IHtcblx0XHRyZXR1cm4oXG5cdFx0XHR0aGlzLmdldFRleHQoKVxuXHRcdFx0LnRoZW4oKHRleHQpPT57XG5cdFx0XHRcdGxldCBwYXJzZXI9bmV3IERPTVBhcnNlcigpO1xuXHRcdFxuXHRcdFx0XHRsZXQgZG9jPXBhcnNlci5wYXJzZUZyb21TdHJpbmcodGV4dCwndGV4dC9odG1sJyk7XG5cdFx0XHRcdHJldHVybiBkb2M7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH1cblxuXG59IiwiaW1wb3J0IHsgQXNzZXQsIEFzc2V0RmFjdG9yeSwgQXNzZXRJRCwgQXNzZXRUeXBlLCByZXN0b3JlQXNzZXRJRCB9IGZyb20gXCIuLi9Bc3NldFwiO1xuaW1wb3J0IHsgRG9jdW1lbnRBc3NldEltcGwgfSBmcm9tIFwiLi9Eb2N1bWVudEFzc2V0SW1wbFwiO1xuXG4vKipcbiAqIEFuIGFzc2V0IGZhY3RvcnkgaW1wbGVtZW50YXRpb24gdGhhdCBzaW1wbHkgZmV0Y2hlcyBhbiBhc3NldCBhcyBhbiBodG1sIGZpbGUgdXNpbmcgdGhlIFxuICogR2V0UHVibGljRmlsZSBqc29uIGNhbGwgaW1wbGVtZW50ZWQgaW4gdGhlIFNhbXBsZVNlcnZlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZUFzc2V0RmFjdG9yeSBpbXBsZW1lbnRzIEFzc2V0RmFjdG9yeSB7XG5cblxuICAgIHB1YmxpYyBpc0ZvcihpZDogQXNzZXRJRCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbGlzdCh0eXBlczogQXNzZXRUeXBlW10sIHByb2plY3Q/OiBzdHJpbmcpOiBQcm9taXNlPEFzc2V0W10+IHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldChhc3NldElkOiBzdHJpbmcgfCBBc3NldElEKTogQXNzZXQge1xuICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50QXNzZXRJbXBsKHJlc3RvcmVBc3NldElEKGFzc2V0SWQpKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBBc3NldElEIH0gZnJvbSBcIi4vQXNzZXRcIjtcbmltcG9ydCB7IEF0dGFjaG1lbnQgfSBmcm9tIFwiLi9BdHRhY2htZW50XCI7XG5pbXBvcnQgeyBVSTVBdHRhY2htZW50IH0gZnJvbSBcIi4vYnJpZGdlL3VpNS9VSTVBdHRhY2htZW50XCI7XG5pbXBvcnQgeyBBdHRhY2htZW50SW1wbCB9IGZyb20gXCIuL2ltcGwvQXR0YWNobWVudEltcGxcIjtcbmltcG9ydCB7IERlZmF1bHRJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi9pbXBsL0RlZmF1bHRJbXBsZW1lbnRhdGlvbnNcIjtcbmltcG9ydCB7IEpRdWVyeUFqYXggfSBmcm9tIFwiLi9pbXBsL0pRdWVyeUFqYXhcIjtcbmltcG9ydCB7IFNpbXBsZUFzc2V0RmFjdG9yeSB9IGZyb20gXCIuL2ltcGwvU2ltcGxlQXNzZXRGYWN0b3J5XCI7XG5pbXBvcnQgeyBUZXN0cyB9IGZyb20gXCIuL2ltcGwvVHJlZU1lcmdlXCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi9JbXBsZW1lbnRhdGlvbnNcIjtcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBDT01MIGVudHJ5cG9pbnQuXG4gKiBcbiAqIEluc3RhbGwgeW91ciBhdHRhY2htZW50LCBhc3NldCBmYWN0b3J5IGFuZCBhdHRhY2ggQ09NTCB0byBhbiBlbGVtZW50IG9mIHlvdXIgU1BBJ3Mgc3RhcnQgaHRtbCBmaWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21sU3RhcnR1cCB7XG4gICAgcHJvdGVjdGVkIGRvbnRVc2VVSTU6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihkb250VXNlVUk1OmJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5kb250VXNlVUk1PWRvbnRVc2VVSTU7XG4gICAgICAgIHRoaXMuY29uZmlndXJlSW1wbGVtZW50YXRpb25zKClcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY29uZmlndXJlSW1wbGVtZW50YXRpb25zKCkge1xuICAgICAgICAvKiBzZXQgdXAgdGhlIGltcGxlbW50YXRpb25zIG9mIGFqYXgsIGFzc2V0cywgQ29udmVydGVyIGFuZCBSZW5kZXIgKi9cbiAgICAgICAgbGV0IHRoYXQ9dGhpcztcbiAgICAgICAgbmV3IChjbGFzcyBleHRlbmRzIERlZmF1bHRJbXBsZW1lbnRhdGlvbnMge1xuICAgICAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUF0dGFjaG1lbnRJbXBsKCk6IEF0dGFjaG1lbnQge1xuICAgICAgICAgICAgICAgIGlmICghdGhhdC5kb250VXNlVUk1KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVJNUF0dGFjaG1lbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEF0dGFjaG1lbnRJbXBsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIChcbiAgICAgICAgICAgIG5ldyBKUXVlcnlBamF4KCksXG4gICAgICAgICAgICBuZXcgU2ltcGxlQXNzZXRGYWN0b3J5KClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBhdHRhY2hUbyhpZDpzdHJpbmcscGFnZTpzdHJpbmd8QXNzZXRJRCkge1xuICAgICAgICBsZXQgaW5zZXJ0ZXI9SW1wbGVtZW50YXRpb25zLmNyZWF0ZUF0dGFjaG1lbnQoKTtcbiAgICAgICAgbGV0IGVsZW1lbnQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MPScnO1xuICAgICAgICBpbnNlcnRlci5hdHRhY2goZWxlbWVudCxwYWdlKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgaXNUZXh0QXNzZXQsIHJlc3RvcmVBc3NldElEIH0gZnJvbSBcIi4uLy4uLy4uL2NvbWwvQXNzZXRcIjtcbmltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21sL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi8uLi8uLi9jb21sL0NvRWxlbWVudEZhY3RvcnlcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi8uLi8uLi9jb21sL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgQmFzZUNvRWxlbWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21sL2VsZW1lbnQvQmFzZUNvRWxlbWVudFwiO1xuaW1wb3J0IHsgSW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbWwvSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbC9SZW5kZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUsIGdldEF0dHIsIGN0biB9IGZyb20gXCIuLi8uLi8uLi9jb21sL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbC9UaGlzXCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBDaGFydGpzVHlwZSB7XG5cdC8qKlxuXHQgKiBDb252ZXJ0IE1EIHRvIGh0bWxcblx0ICogQHBhcmFtIGVsZW0gXG5cdCAqIEBwYXJhbSBjb25maWcgXG5cdCAqL1xuICAgIG1ha2VIdG1sKHRleHQ6c3RyaW5nKSA6c3RyaW5nO1xuXG59XG5cbmRlY2xhcmUgdmFyIENoYXJ0OiBhbnk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRqc1NldHRpbmdzIHtcblx0XG59XG5cbi8qKlxuICogXG4gKi9cbmNsYXNzIENoYXJ0anNFbGVtZW50IGV4dGVuZHMgQmFzZUNvRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIGNoYXJ0OkNoYXJ0anNUeXBlO1xuXG5cbiAgICBjb25zdHJ1Y3RvcihjdnQ6Q29udmVydGVyPFRoaXM+LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICBzdXBlcihjdnQsdG4pO1xuICAgIH1cblxuICAgXG5cblxuICAgIG9uUmVuZGVyKHJtOiBSZW5kZXIpIHtcbiAgICAgICAgY29uc3Qge2N2dCx0bn0gPSBjdG4odGhpcyk7XG5cbiAgICAgICAgcm0ub3BlblN0YXJ0KCdkaXYnLHRoaXMpO1xuXHRcdHJtLmNsYXNzKCd1LWNoYXJ0anMnKTtcbiAgICAgICAgY3Z0LmNvcHlBdHRyRXhjZXB0KHJtLHRuLnNub2RlKTtcblx0XHRybS5vcGVuRW5kKCk7XG5cbiAgICAgICAgICAgIHJtXG4gICAgICAgICAgICAub3BlblN0YXJ0KCdjYW52YXMnKVxuICAgICAgICAgICAgLmNsYXNzKCd1LWNoYXJ0anMtY2FudmFzJylcbiAgICAgICAgICAgIC5vcGVuRW5kKClcbiAgICAgICAgICAgIC5jbG9zZSgnY2FudmFzJyk7XG5cblxuXHRcdHJtLmNsb3NlKCdkaXYnKTsgIFxuICAgIH1cblxuICAgXG4gICAgcHJvdGVjdGVkIGdldFNjcmlwdFRleHQoc2NyaXB0RWxlbTpOb2RlKSB7XG4gICAgICAgIGxldCBzY3JpcHQ6c3RyaW5nO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdEVsZW0uY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNuPXNjcmlwdEVsZW0uY2hpbGROb2Rlc1tpXTtcblxuICAgICAgICAgICAgaWYgKGNuLm5vZGVUeXBlPT1Ob2RlLlRFWFRfTk9ERSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY24ubm9kZVZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNjcmlwdClcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0PWNuLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICBzY3JpcHQrPSgnXFxuJytjbi5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY3JpcHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc2V0dGluZ3MgZnJvbSBhbnkgPHNjcmlwPiBibG9jayBvZiBvdXIgc25vZGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgdGhlIFNldHRpbmdzIG9iamVjdCBuZWVkZWQgdG8gaW5pdGlhbGl6ZSB0aGUgVUk1IENvbnRyb2wgdGhhdCB3ZSB3aWxsIGhvc3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U2V0dGluZ3MoKSB7XG4gICAgICAgIGNvbnN0IHt0bixjdnR9ID0gY3RuKHRoaXMpO1xuXG4gICAgICAgIGxldCBzY3JpcHQ7XG4gICAgICAgIGZvcihsZXQgaT0wO2k8KHRuLnNub2RlIGFzIEVsZW1lbnQpLmNoaWxkcmVuLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIGlmICgodG4uc25vZGUgYXMgRWxlbWVudCkuY2hpbGRyZW5baV0udGFnTmFtZS50b0xvd2VyQ2FzZSgpPT0nc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgIHNjcmlwdD10aGlzLmdldFNjcmlwdFRleHQoKHRuLnNub2RlIGFzIEVsZW1lbnQpLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgXG4gICAgICAgIGxldCBzZXR0aW5ncz17fTtcbiAgICAgICAgaWYgKHNjcmlwdCkge1xuICAgICAgICAgICAgKGN2dC5nZXRUaGlzKCkgYXMgYW55KS5zZXR0aW5ncz0oaW5jb21pbmcpPT57XG4gICAgICAgICAgICAgICAgc2V0dGluZ3M9aW5jb21pbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdnQuZXhlY3V0ZVNjcmlwdChzY3JpcHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSBpZiB5b3UgbmVlZCB0byBiZSBjYWxsZWQgb24gb25BZnRlclJlbmRlcmluZygpLiByZWYgaXMgdGhpcyBjb250cm9sJ3MgZG9tcmVmXG4gICAgICogXG4gICAgICogQHBhcmFtIHJlZiBcbiAgICAgKi9cbiAgICBvblBvc3RSZW5kZXIocmVmOiBhbnkpIHtcbiAgICAgICAgbGV0IGVsZW06RWxlbWVudD0ocmVmIGFzIEVsZW1lbnQpO1xuXHRcdGlmIChlbGVtKSB7XG4gICAgICAgICAgICBsZXQgY2FudmFzPWVsZW0ucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XG5cdFx0XHRcbiAgICAgICAgICAgIGxldCBzZXR0aW5ncz10aGlzLmdldFNldHRpbmdzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hhcnQ9bmV3IENoYXJ0KGNhbnZhcyxzZXR0aW5ncyk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldENoYXJ0anMoKSA6IENoYXJ0anNUeXBlIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFydDtcblx0fVxuXG59XG5cbi8qKlxuICogVGhlIGZhY3RvcnkgY2xhc3MgaXMgcmVnaXN0ZXJlZCB3aGVuIGltcG9ydGVkIHZpYSBhIHNjcmlwdCBpbiB0aGUgPGhlYWQ+XG4gKiBcbiAqIGBgYFxuICogPGhlYWQ+XG4gICAgPHNjcmlwdD5cbiAgICAgICAgdGhpcy5pbXBvcnQoJ2NvbWwvYnJpZGdlL2NoYXJ0anMvQ29DaGFydGpzJyk7XG4gICAgPC9zY3JpcHQ+XG4gIDwvaGVhZD4gXG4gKiBgYGBcbiAqIFxuICovXG4gIGV4cG9ydCBkZWZhdWx0IGNsYXNzIENvQ2hhcnRqc0ZhY3RvcnkgaW1wbGVtZW50cyBDb0VsZW1lbnRGYWN0b3J5IHtcbiAgICByZWdpc3RlckZhY3RvcnkoY3Z0OiBDb252ZXJ0ZXI8VGhpcz4pIHtcbiAgICAgICAgY3Z0LnJlZ2lzdGVyRmFjdG9yeSgnY28tY2hhcnRqcycsIHRoaXMpO1xuICAgIH1cblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsIGN2dDogQ29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBDaGFydGpzRWxlbWVudChjdnQsIHRuKTtcbiAgICB9XG5cbn1cblxuIiwiaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4uLy4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi8uLi9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBCYXNlQ29FbGVtZW50IH0gZnJvbSBcIi4uLy4uL2VsZW1lbnQvQmFzZUNvRWxlbWVudFwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uLy4uL1JlbmRlclwiO1xuaW1wb3J0IHsgY3RuLCBnZXRBdHRyLCBUYXJnZXROb2RlIH0gZnJvbSBcIi4uLy4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vLi4vVGhpc1wiO1xuaW1wb3J0IHsgVUk1QXR0YWNobWVudCB9IGZyb20gXCIuL1VJNUF0dGFjaG1lbnRcIjtcbmltcG9ydCB7IGV4dGVuZFVJNSB9IGZyb20gXCIuL1VJNUNvbnRyb2xDbGFzc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBVSTVDb0VsZW1lbnQgZXh0ZW5kcyBCYXNlQ29FbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgY29udHJvbDpzYXAudWkuY29yZS5Db250cm9sO1xuICAgIC8vcHJvdGVjdGVkIHNldHRpbmdzPXt9O1xuXG4gICAgY29uc3RydWN0b3IoY3Z0OkNvbnZlcnRlcjxUaGlzPix0bjpUYXJnZXROb2RlKSB7XG4gICAgICAgIHN1cGVyKGN2dCx0bik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbnRyb2woKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyb2w7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFNjcmlwdFRleHQoc2NyaXB0RWxlbTpOb2RlKSB7XG4gICAgICAgIGxldCBzY3JpcHQ6c3RyaW5nO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdEVsZW0uY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNuPXNjcmlwdEVsZW0uY2hpbGROb2Rlc1tpXTtcblxuICAgICAgICAgICAgaWYgKGNuLm5vZGVUeXBlPT1Ob2RlLlRFWFRfTk9ERSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY24ubm9kZVZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNjcmlwdClcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0PWNuLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICBzY3JpcHQrPSgnXFxuJytjbi5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY3JpcHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc2V0dGluZ3MgZnJvbSBhbnkgPHNjcmlwPiBibG9jayBvZiBvdXIgc25vZGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgdGhlIFNldHRpbmdzIG9iamVjdCBuZWVkZWQgdG8gaW5pdGlhbGl6ZSB0aGUgVUk1IENvbnRyb2wgdGhhdCB3ZSB3aWxsIGhvc3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0U2V0dGluZ3MoKSB7XG4gICAgICAgIGNvbnN0IHt0bixjdnR9ID0gY3RuKHRoaXMpO1xuXG4gICAgICAgIGxldCBzY3JpcHQ7XG4gICAgICAgIGZvcihsZXQgaT0wO2k8KHRuLnNub2RlIGFzIEVsZW1lbnQpLmNoaWxkcmVuLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIGlmICgodG4uc25vZGUgYXMgRWxlbWVudCkuY2hpbGRyZW5baV0udGFnTmFtZS50b0xvd2VyQ2FzZSgpPT0nc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgIHNjcmlwdD10aGlzLmdldFNjcmlwdFRleHQoKHRuLnNub2RlIGFzIEVsZW1lbnQpLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgXG4gICAgICAgIGxldCBzZXR0aW5ncz17fTtcbiAgICAgICAgaWYgKHNjcmlwdCkge1xuICAgICAgICAgICAgKGN2dC5nZXRUaGlzKCkgYXMgYW55KS5zZXR0aW5ncz0oaW5jb21pbmcpPT57XG4gICAgICAgICAgICAgICAgc2V0dGluZ3M9aW5jb21pbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdnQuZXhlY3V0ZVNjcmlwdChzY3JpcHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9XG5cbiAgIFxuXG4gICAgcHJvdGVjdGVkIHJlbmRlclVJNUNvbnRyb2wocm06UmVuZGVyLGNvbnRyb2w6c2FwLnVpLmNvcmUuQ29udHJvbCxvbkNvbnRyb2xEb21SZWZBdmFpbGFibGU6KGRvbVJlZjpFbGVtZW50KT0+YW55LGRvbnRDb3B5QXR0clRvQ3RybD86Ym9vbGVhbikge1xuICAgICAgICBsZXQgb0NvcmUgPSBzYXAudWkuZ2V0Q29yZSgpO1xuICAgICAgICBsZXQgb1JlbmRlck1hbmFnZXI6c2FwLnVpLmNvcmUuUmVuZGVyTWFuYWdlciA9IG9Db3JlLmNyZWF0ZVJlbmRlck1hbmFnZXIoKTtcbiAgICAgICAgb1JlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChjb250cm9sKTtcbiAgICAgICAgbGV0IGR1bW15OkhUTUxEaXZFbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBpZiAoIWNvbnRyb2wuZ2V0RG9tUmVmKCkpIHsgLy8gZmlyc3QgdGltZSwgb25seSB0aGUgUk0gaGFzIHRoZSBkb20gcmVmLCBzbyBmbHVzaCB0byBhIGR1bW15XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9SZW5kZXJNYW5hZ2VyLmZsdXNoKGR1bW15IGFzIGFueSxmYWxzZSx0cnVlKTtcbiAgICAgICAgICAgIH0gY2F0Y2goeCkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgZXhjZXB0aW9uIGhhcHBlbnMgb24gc2FwLm0uTXVsdGlDb21ib0JveC4gVGhlIFRva2VuaXplciB0cmllcyB0byBpbnN0YWxsIGEgbGlzdGVuZXIgYnV0IHRoZSBlbGVtZW50IGlzIHJlZiBpcyBudWxsLlxuICAgICAgICAgICAgICAgIC8vIGlnbm9yaW5nIHRoZSBlcnJvciBzZWVtcyB0byB3b3JrXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkdW1teS5jaGlsZHJlbi5sZW5ndGg+MCkge1xuICAgICAgICAgICAgICAgIGxldCByZW5kZXJlZD1kdW1teS5jaGlsZHJlblswXTtcbiAgICAgICAgICAgICAgICByZW5kZXJlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBvbkNvbnRyb2xEb21SZWZBdmFpbGFibGUocmVuZGVyZWQpO1xuICAgICAgICAgICAgICAgIGlmICghZG9udENvcHlBdHRyVG9DdHJsKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEN2dCgpLmNvcHlBdHRyRXhjZXB0VG9UTm9kZShyZW5kZXJlZCx0aGlzLmdldFROKCkuc25vZGUsWydpZCcsJ2NsYXNzJ10pO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICBybS5pbnNlcnRSZW5kZXJlZChyZW5kZXJlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvUmVuZGVyTWFuYWdlci5mbHVzaChkdW1teSBhcyBhbnksZmFsc2UsdHJ1ZSk7IC8vIGRvZXNudCBkbyBhbnl0aGluZyBcbiAgICAgICAgICAgIG9uQ29udHJvbERvbVJlZkF2YWlsYWJsZShjb250cm9sLmdldERvbVJlZigpKTtcbiAgICAgICAgICAgIHJtLmluc2VydFJlbmRlcmVkKGNvbnRyb2wuZ2V0RG9tUmVmKCkpO1xuICAgICAgICB9XG4gICAgICAgIG9SZW5kZXJNYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgc3RhdGljIFdyYXBwZXJDbGFzczphbnk7XG4gICAgcHJvdGVjdGVkIGNvbnRyb2xPckl0c1dyYXBwZXI6c2FwLnVpLmNvcmUuQ29udHJvbDtcblxuICAgIHByb3RlY3RlZCBzdGF0aWMgd3JhcHBlckNsYXNzKCkge1xuICAgICAgICBpZiAoIVVJNUNvRWxlbWVudC5XcmFwcGVyQ2xhc3MpXG4gICAgICAgICAgICBVSTVDb0VsZW1lbnQuV3JhcHBlckNsYXNzPWV4dGVuZFVJNShcImNvbWwuVUk1V1JhcHBlclwiKTsvLyhzYXAudWkuY29yZS5Db250cm9sIGFzIGFueSkuZXh0ZW5kKFwiY29tbC5VSTVXUmFwcGVyXCIsT2JqZWN0LmFzc2lnbihVSTVDb250cm9sKSk7XG5cbiAgICAgICAgcmV0dXJuIFVJNUNvRWxlbWVudC5XcmFwcGVyQ2xhc3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV1JhcCB0aGUgYWN0dWFsIGNvbnRyb2wgYnkgb25lIHRoYXQgc3RvcHMgdGhlIGludmFsaWRhdGlvbigpIG9mIGNvbnRyb2xzIHRvIHByb3BhZ2F0ZSB0byB0aGUgdG9wIGxldmVsIGJyaWRnZSxcbiAgICAgKiB3aGljaCBjYXVzZXMgYSByZXBhaW50IG9mIHRoZSBlbnRpcmUgQ09NTCBhcHAuIFdlIHNldCBkaXNwbGF5OmNvbnRlbnRzIG9uIG91ciBlbGVtZW50IHNvIHRoYXQgdGhlIHdyYXBwaW5nIGhhcyBubyBhZmZlY3QgYXMgXG4gICAgICogZmFyIGFzIGh0bWwgbGF5b3V0aW5nIGlzIGNvbmNlcm5lZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdG93cmFwIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3cmFwQ29udHJvbCh0b3dyYXA6c2FwLnVpLmNvcmUuQ29udHJvbCkge1xuICAgICAgICBsZXQgV3JhcHBlckNsYXNzPVVJNUNvRWxlbWVudC53cmFwcGVyQ2xhc3MoKTtcblxuICAgICAgICBsZXQgd3JhcHBlcjpzYXAudWkuY29yZS5Db250cm9sPW5ldyAoY2xhc3MgZXh0ZW5kcyBXcmFwcGVyQ2xhc3Mge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJDb3VudD0wO1xuXG4gICAgICAgICAgICAgICAgLy8gZGVsZWdhdGUgVUk1IHJlbmRlcmluZyBiYWNrIHRvIHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDb250cm9sT3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgIG9uUHJlUmVuZGVyOigpPT57fSxcbiAgICAgICAgICAgICAgICAgICAgb25SZW5kZXI6IChybTpzYXAudWkuY29yZS5SZW5kZXJNYW5hZ2VyKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJtXG4gICAgICAgICAgICAgICAgICAgICAgICAub3BlblN0YXJ0KCdkaXYnLHRoaXMgYXMgYW55KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzKCd1LXVpNS13cmFwJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnZGlzcGxheScsJ2NvbnRlbnRzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcGVuRW5kKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVmPSh0aGlzIGFzIGFueSBhcyBzYXAudWkuY29yZS5Db250cm9sKS5nZXREb21SZWYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSRUZbJHt0aGlzLmdldElkKCl9XT09YCtyZWYpOyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGByZW5kZXJDb3VudD0ke3RoaXMucmVuZGVyQ291bnR9IC0gcmVuZGVyaWluZyB3cmFwcGVkYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm0ucmVuZGVyQ29udHJvbCh0b3dyYXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGByZW5kZXJDb3VudD0ke3RoaXMucmVuZGVyQ291bnR9IC0gaW52YWxpZGF0aW5nYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLmludmFsaWRhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBybS5jbG9zZSgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uUG9zdFJlbmRlcjoocmVmOmFueSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYHJlbmRlckNvdW50PSR7dGhpcy5yZW5kZXJDb3VudH0gLSBvblBvc3RSZW5kZXJgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgICAgICAgICAgICAvLyBkZWxpYmVyYXRlIGRvIG5vdGhpbmcgLSB0aGlzIHN0b3BzIHRoZSBmaXJzdCB0aW1lIGludmFsaWRhdGlvbiBhbGwgdGhlIHdheSB0byB0aGUgYnJpZGdlciwgd2hpY2ggY2F1c2VzIENPTUwgYXBwcyB0byBsb3NlIHN0YXRlXG4gICAgICAgICAgICAgICAgLy9zdXBlci5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KSgpIGFzIHNhcC51aS5jb3JlLkNvbnRyb2w7XG5cbiAgICAgICAgKHRvd3JhcCBhcyBhbnkpLnNldFBhcmVudCh3cmFwcGVyLCdjaGlsZHJlbicsdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHdyYXBwZXI7XG4gICAgfVxuXG5cbiAgICBwcm90ZWN0ZWQgd3JhcCh0b3dyYXA6c2FwLnVpLmNvcmUuQ29udHJvbCkgOiBzYXAudWkuY29yZS5Db250cm9sIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRyb2xPckl0c1dyYXBwZXIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHI8Ym9vbGVhbj4oJ3dyYXAnLHRydWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sT3JJdHNXcmFwcGVyPXRoaXMud3JhcENvbnRyb2wodG93cmFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sT3JJdHNXcmFwcGVyPXRvd3JhcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb250cm9sT3JJdHNXcmFwcGVyO1xuICAgIH1cblxuICAgIG9uUmVuZGVyKHJtOiBSZW5kZXIpIHtcbiAgICAgICAgbGV0IGNvbnRyb2xUb1JlbmRlcjpzYXAudWkuY29yZS5Db250cm9sO1xuICAgICAgICBpZiAoIXRoaXMuY29udHJvbCkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY29udHJvbD10aGlzLmNyZWF0ZUNvbnRyb2woKTsgIFxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2wpIHsgICAgXG4gICAgICAgICAgICAgICAgY29udHJvbFRvUmVuZGVyPXRoaXMud3JhcCh0aGlzLmNvbnRyb2wpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVsZW09dGhpcy5nZXRUTigpLnNub2RlIGFzIEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0uY2xhc3NMaXN0ICYmIGVsZW0uY2xhc3NMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPGVsZW0uY2xhc3NMaXN0Lmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbC5hZGRTdHlsZUNsYXNzKHRoaXMuZ2V0Q3Z0KCkuZXhwYW5kU3RyaW5nKGVsZW0uY2xhc3NMaXN0W2ldLHRoaXMuZ2V0VE4oKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIC8vdGhpcy5jb250cm9sLnBsYWNlQXQodGhpcy5nZXRUTigpLnRub2RlKTtcbiAgICAgICAgICAgICAgICBsZXQgYnJpZGdlPVVJNUF0dGFjaG1lbnQuZ2V0QnJpZGdlKCk7XG5cbiAgICAgICAgICAgICAgICAoY29udHJvbFRvUmVuZGVyIGFzIGFueSkuc2V0UGFyZW50KGJyaWRnZSwnY2hpbGRyZW4nLHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udHJvbFRvUmVuZGVyPXRoaXMud3JhcCh0aGlzLmNvbnRyb2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRyb2xUb1JlbmRlcikge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhgPC0tIGVuZCBsZW49JHtwZS5jaGlsZHJlbi5sZW5ndGh9YCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclVJNUNvbnRyb2wocm0sY29udHJvbFRvUmVuZGVyLCh1aTVlbGVtKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0VE4oKS50bm9kZT11aTVlbGVtO1xuICAgICAgICAgICAgICAgIHVpNWVsZW0uc2V0QXR0cmlidXRlKCdkYXRhLWNvaWQnLHRoaXMuZ2V0VE4oKS5nZXRJZCgpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgVUk1IGNvbnRyb2wuXG4gICAgICogT3ZlcnJpZGUgaWYgeW91IHdhbnQgdG8gcmV0dXJuIHlvdXIgb3duIGNvbnRyb2wuXG4gICAgICogXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRyb2woKSA6IHNhcC51aS5jb3JlLkNvbnRyb2wge1xuICAgICAgICBsZXQgdWk1Y2xhc3M9dGhpcy5hdHRyPHN0cmluZz4oJ3VpNWNsYXNzJyk7XG5cbiAgICAgICAgbGV0IHBhdGg9dWk1Y2xhc3Muc3BsaXQoJy4nKTtcbiAgICAgICAgbGV0IG9iaj1nbG9iYWxUaGlzO1xuXG4gICAgICAgIGZvcihsZXQgaT0wO2k8cGF0aC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIG9iaj1vYmpbcGF0aFtpXV07XG4gICAgICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgdWk1Y29udHJvbCAtIGNhbnQgZmluZCBvYmplY3QgJHtwYXRoW2ldfSBpbiB1aTVjbGFzcz1bJHt1aTVjbGFzc31dIHBvc2l0aW9uICR7aX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IChvYmogYXMgYW55KSh1bmRlZmluZWQsdGhpcy5nZXRTZXR0aW5ncygpKSBhcyBzYXAudWkuY29yZS5Db250cm9sO1xuICAgIH1cblxuXG4gICAgY2xlYW51cD8oKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2wpXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2wuZGVzdHJveSh0cnVlKTsgICAgICAgIFxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVSTVDb0VsZW1lbnRGYWN0b3J5IGltcGxlbWVudHMgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgbWFrZUNvbXBvbmVudCh0bjogVGFyZ2V0Tm9kZSwgY3Z0OiBDb252ZXJ0ZXI8VGhpcz4pOiBDb0VsZW1lbnQge1xuICAgICAgICBzd2l0Y2goKHRuLnNub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgY2FzZSAndWk1JzpyZXR1cm4gbmV3IFVJNUNvRWxlbWVudChjdnQsdG4pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIHJlZ2lzdGVyRmFjdG9yeShjdnQ6IENvbnZlcnRlcjxUaGlzPikge1xuICAgICAgICBjdnQucmVnaXN0ZXJGYWN0b3J5KCd1aTUnLHRoaXMpO1xuICAgIH1cblxufSIsImltcG9ydCB7IGlzRG9jdW1lbnRBc3NldCwgcmVzdG9yZUFzc2V0SUQgfSBmcm9tIFwiLi4vQXNzZXRcIjtcbmltcG9ydCB7IGlzQXR0YWNoYWJsZSB9IGZyb20gXCIuLi9BdHRhY2hhYmxlXCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi4vQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBDb0VsZW1lbnRGYWN0b3J5IH0gZnJvbSBcIi4uL0NvRWxlbWVudEZhY3RvcnlcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IEltcGxlbWVudGF0aW9ucyB9IGZyb20gXCIuLi9JbXBsZW1lbnRhdGlvbnNcIjtcbmltcG9ydCB7IFJlbmRlciB9IGZyb20gXCIuLi9SZW5kZXJcIjtcbmltcG9ydCB7IGdldEF0dHIsIFRhcmdldE5vZGUgfSBmcm9tIFwiLi4vVGFyZ2V0Tm9kZVwiO1xuaW1wb3J0IHsgVGhpcyB9IGZyb20gXCIuLi9UaGlzXCI7XG5pbXBvcnQgeyBCYXNlQ29FbGVtZW50IH0gZnJvbSBcIi4vQmFzZUNvRWxlbWVudFwiO1xuXG5cbi8qKlxuICogPGNvLWluc2VydCBzcmM9XCJhc3NldFwiPlxuICogXG4gKiAgV2lsbCBpbnNlcnQgYSBEb2N1bWVudEFzc2V0IGludG8gdGhlIHNkb20gYW5kIHJlYnVpbGQgaXQuXG4gKiAgVGhpcyBpcyBmb3IgaW1wb3J0aW5nIHJlc291cmNlcyAsIHRoZSBjdXJyZW50IGNvbnZlcnRlciB3aWxsIHRyZWF0IHRoZSBpbXBvcnRlZCBkb2N1bWVudCBhcyBpZiBpdCB3YXMgcGFydFxuICogIG9mIHRoZSBzZG9tLCB0aGUgZG9jdW1lbnQgb2YgdGhlIGltcG9ydGVkIGl0ZW0gcmVwbGFjaW5nIHRoZSBzbm9kZSBhdCB0aGlzIHBvaW50LlxuICogXG4gKiAgTm90ZSB0aGUgb2JqZWN0IHRoZXJlZm9yZSBzaGFyZXMgdGhlICd0aGlzJyBvZiB0aGUgY29tcG9uZW50IHRvIHdoaWNoIGl0IGlzIGJlaW5nIGluc2VydGVkLlxuICogIChUaGlzIGlzIGRpZmZlcmVudCBmcm9tIGFuIGltcG9ydCBvciBhbiBhdHRhY2gpXG4gKi9cbmV4cG9ydCBjbGFzcyBDb0luc2VydEVsZW1lbnQgZXh0ZW5kcyBCYXNlQ29FbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgc3JjOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGVycm9yOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihjdnQ6IENvbnZlcnRlcjxUaGlzPiwgdG46IFRhcmdldE5vZGUpIHtcbiAgICAgICAgc3VwZXIoY3Z0LCB0bik7XG4gICAgICAgIHRoaXMuc3JjID0gZ2V0QXR0cjxzdHJpbmc+KGN2dCwgdG4uc25vZGUsICdzcmMnLHVuZGVmaW5lZCx0bik7XG4gICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgbGV0IGFzc2V0SWQ9cmVzdG9yZUFzc2V0SUQodGhpcy5zcmMpO1xuXG5cbiAgICAgICAgICAgIGxldCBhc3NldD1JbXBsZW1lbnRhdGlvbnMuZ2V0QXNzZXRGYWN0b3J5KClcbiAgICAgICAgICAgICAgICAuZ2V0KGFzc2V0SWQpO1xuICAgICAgICAgICAgaWYgKCFhc3NldCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3I9YGNvLWluc2VydDogY2FuJ3QgZmluZCBhbiBhc3NldCB3aXRoIGlkID0ke3RoaXMuc3JjfWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmICghaXNEb2N1bWVudEFzc2V0KGFzc2V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3I9YGNvLWluc2VydDogYXNzZXQgd2l0aCBpZCA9JHt0aGlzLnNyY30gaXMgbm90IGEgRG9jdW1lbnRBc3NldGA7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3NldC5nZXREb2N1bWVudCgpXG4gICAgICAgICAgICAudGhlbigoZG9jKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHJlcGxhY2VkPXRoaXMudG4uc25vZGU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG4uc25vZGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlZD10aGlzLnRuLnNub2RlOy8vIGJlZm9yZSB3ZSByZXBsYWNlLCBzdG9yZSBvcmlnaW5hbCBzbyBmaW5kIGR1cmluZyBtdXRhdGlvbiBmaW5kcyBpdC5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50bi5zbm9kZT1kb2MuYm9keTtcbiAgICAgICAgICAgICAgICB0aGlzLnRuLmNvbXBvbmVudD10aGlzLmN2dC5tYWtlQ29FbGVtZW50KHRoaXMudG4pIGFzIENvRWxlbWVudDtcbiAgICAgICAgICAgICAgICB0aGlzLnRuLnJlcGxhY2VkPXJlcGxhY2VkO1xuICAgICAgICAgICAgICAgIC8vdGhpcy5jdnQucmVidWlsZCh0aGlzLnRuKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN2dC5pbnZhbGlkYXRlKHRoaXMudG4pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcj1gY28taW5zZXJ0OiBhc3NldCB3aXRoIGlkID0ke3RoaXMuc3JjfSBlcnJvcj0ke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgdGhpcy5jdnQuaW52YWxpZGF0ZSh0aGlzLnRuKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgIH1cblxuXG4gICAgcHVibGljIG9uUmVuZGVyKHJtOiBSZW5kZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3IpIHtcbiAgICAgICAgICAgIHJtLm9wZW5TdGFydCgnZGl2Jyx0aGlzKVxuICAgICAgICAgICAgLmNsYXNzKCd1LWNvbWwtZXJyb3InKVxuICAgICAgICAgICAgLm9wZW5FbmQoKVxuICAgICAgICAgICAgLnRleHQodGhpcy5lcnJvcik7XG4gICAgXG4gICAgXG4gICAgICAgICAgICBybS5jbG9zZSgnZGl2Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBybS5vcGVuU3RhcnQoJ2RpdicsdGhpcylcbiAgICAgICAgICAgIC5jbGFzcygndS1jby1pbnNlcnQnKVxuICAgICAgICAgICAgLm9wZW5FbmQoKVxuICAgICAgICAgICAgLmNsb3NlKCdkaXYnKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnNlcnRGYWN0b3J5IGltcGxlbWVudHMgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgcmVnaXN0ZXJGYWN0b3J5KGN2dDogQ29udmVydGVyPFRoaXM+KSB7XG4gICAgICAgIGN2dC5yZWdpc3RlckZhY3RvcnkoJ2NvLWluc2VydCcsIHRoaXMpO1xuICAgIH1cblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsIGN2dDogQ29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb0luc2VydEVsZW1lbnQoY3Z0LCB0bik7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vQ29udmVydGVyXCI7XG5pbXBvcnQgeyBCYXNlQ29FbGVtZW50IH0gZnJvbSBcIi4uL2VsZW1lbnQvQmFzZUNvRWxlbWVudFwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgY3RuLCBnZXRBdHRyLCBUYXJnZXROb2RlIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vVGhpc1wiO1xuXG5cblxuLyoqXG4gKiBBIGZvciBsb29wIGl0ZXJhdGVzIG92ZXIgYSBsaXN0IG9yIGEgZml4ZWQgY291bnQuIFRoZSBjdXJyZW50IHZhbHVlIGNhbiBiZSByZWFkIGZyb20gdGhlIGB0aGlzYCBvYmplY3RcbiAqIGluIGEgZmllbGQgZ2l2ZW4gYnkgdGhlIGBjb3VudGVybmFtZWAgYXR0cmlidXRlLlxuICogXG4gKiBGaXhlZCBjb3VudDpcbiAqIGBgYGh0bWxcbiAqIDxmb3IgY291bnQ9XCIxMFwiIGNvdW50ZXJuYW1lPVwiY254XCI+XG4gICAgIDxkaXY+JHt0aGlzLmNueH08L2Rpdj5cbiAqIDwvZm9yPlxuICogYGBgXG4gKiBcbiAqIE92ZXIgYSBsaXN0IGluIGFuIGF0dHJpYnV0ZSAnaW4nXG4gKiBgYGBodG1sXG4gKiA8Zm9yIGluPVwiT3JhbmdlcyxBcHBsZXMsQmFuYW5hc1wiIGNvdW50ZXJuYW1lPVwiZnJ1aXRcIj5cbiAqICAgIFxuICogICAgICAgIDxkaXY+JHt0aGlzLmZydWl0fTwvZGl2PlxuICogICAgXG4gKiA8L2Zvcj5cbiAqIGBgYFxuICogXG4gKiBPdmVyIGEgbGlzdCBzcGVjaWZpZWQgdmlhIGNvZGU6XG4gKiBgYGBodG1sXG4gKiA8c2NyaXB0PlxuICogICAgdGhpcy5jYXJzPVtcbiAqICAgICAge21vZGVsOidDb3JvbGxhJyxlbmdTaXplOidtZWRpdW0nfSxcbiAqICAgICAge21vZGVsOidDYW1yeScsZW5nU2l6ZTonYmlnJ30sXG4gKiAgICBdO1xuICogPC9zY3JpcHQ+XG4gKiBcbiAqIDxmb3IgY291bnRlcm5hbWU9XCJjYXJcIiBpbnRoaXM9XCJjYXJzXCI+XG4gKiAgICBcbiAqICAgICAgICA8ZGl2PiR7dGhpcy5jYXIubW9kZWx9PC9kaXY+XG4gKiAgICAgICAgPGRpdj4ke3RoaXMuY2FyLmVuZ2luZVNpemV9PC9kaXY+XG4gKiAgICBcbiAqIDwvZm9yPlxuICogYGBgXG4gKiBcbiAqL1xuY2xhc3MgRm9yRWxlbWVudCBleHRlbmRzIEJhc2VDb0VsZW1lbnQge1xuICAgIHB1YmxpYyByZXBlYXQ6bnVtYmVyO1xuICAgIHB1YmxpYyBpbnM6c3RyaW5nfHN0cmluZ1tdfG51bWJlcltdfG9iamVjdFtdO1xuICAgIHB1YmxpYyBjb3VudGVybmFtZTpzdHJpbmc7XG4gICAgcHVibGljIGNvdW50ZXI6YW55O1xuICAgIHB1YmxpYyBsaXN0Om9iamVjdFtdO1xuXG4gICAgY29uc3RydWN0b3IoY3Z0OkNvbnZlcnRlcjxUaGlzPix0bjpUYXJnZXROb2RlKSB7XG4gICAgICAgIHN1cGVyKGN2dCx0bik7XG4gICAgfVxuXG5cbiAgICBvblJlbmRlcihybTogUmVuZGVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHtjdnQsdG59PWN0bih0aGlzKTtcbiAgICAgICAgcm0ub3BlblN0YXJ0KCdkaXYnLHRoaXMpXG4gICAgICAgIC5jbGFzcygnY28tZm9yJyk7XG4gICAgICAgIGN2dC5jb3B5QXR0ckV4Y2VwdChybSx0bi5zbm9kZSk7XG4gICAgICAgIGN2dC5lbmNvZGVXU0Uocm0sdG4pO1xuICAgICAgICBybS5vcGVuRW5kKCk7XG5cbiAgICAgICAgdGhpcy5jb3VudGVybmFtZT1nZXRBdHRyPHN0cmluZz4oY3Z0LHRuLnNub2RlLCdjb3VudGVybmFtZScsJ193c19sb29wX2NvdW50Jyx0bik7XG5cbiAgICAgICAgbGV0IGludGhpcz1nZXRBdHRyPHN0cmluZz4oY3Z0LHRuLnNub2RlLCdpbnRoaXMnKTtcbiAgICAgICAgaWYgKGludGhpcylcbiAgICAgICAgICAgIHRoaXMubGlzdD1jdnQuZ2V0VGhpcygpW2ludGhpc107XG5cbiAgICAgICAgaWYgKCF0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIHRoaXMucmVwZWF0PWdldEF0dHI8bnVtYmVyPihjdnQsdG4uc25vZGUsJ3dzLWNvdW50JywwLHRuKSB8fCBnZXRBdHRyPG51bWJlcj4oY3Z0LHRuLnNub2RlLCdjb3VudCcsMCx0bik7XG4gICAgICAgICAgICB0aGlzLmlucz1nZXRBdHRyPHN0cmluZz4oY3Z0LHRuLnNub2RlLCdpbicpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnM9dGhpcy5pbnMuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcGVhdD10aGlzLmlucy5sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zPVtdIGFzIG51bWJlcltdO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8dGhpcy5yZXBlYXQ7aSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbnM9dGhpcy5saXN0O1xuICAgICAgICAgICAgdGhpcy5yZXBlYXQ9dGhpcy5saXN0Lmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgXG4gICAgICAgIHRoaXMuY291bnRlcj0wO1xuICAgICAgICBmb3IobGV0IGk9MDtpPHRoaXMucmVwZWF0O2krKykgeyAvLyBleGVjdXRlIHRoZSBsb29wLiBzYXZlIHRoZSBjb3VudGVyIFxuICAgICAgICAgICAgbGV0IHg9KHRoaXMuaW5zLmxlbmd0aCkgPyB0aGlzLmluc1tpJXRoaXMuaW5zLmxlbmd0aF06aTtcbiAgICAgICAgICAgIGN2dC5nZXRUaGlzKClbdGhpcy5jb3VudGVybmFtZV09eDtcbiAgICAgICAgICAgIHRoaXMuY291bnRlcj14O1xuICAgICAgICAgICAgY3Z0LnJlbmRlckNoaWxkcmVuKHJtLHRuLGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcm0uY2xvc2UoJ2RpdicpO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXU0xvb3BGYWN0b3J5IGltcGxlbWVudHMgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgcmVnaXN0ZXJGYWN0b3J5KGN2dDogQ29udmVydGVyPFRoaXM+KSB7XG4gICAgICAgIGN2dC5yZWdpc3RlckZhY3RvcnkoJ2ZvcicsdGhpcyk7XG4gICAgfVxuXG4gICAgbWFrZUNvbXBvbmVudCh0bjpUYXJnZXROb2RlLGN2dDpDb252ZXJ0ZXI8VGhpcz4pOiBDb0VsZW1lbnQge1xuICAgICAgICBzd2l0Y2goKHRuLnNub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgY2FzZSAnZm9yJzpyZXR1cm4gbmV3IEZvckVsZW1lbnQoY3Z0LHRuKTsgXG4gICAgICAgIH1cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBBc3NldCwgQXNzZXRJRCwgQXNzZXRUeXBlLCBpc0NvRWxlbWVudEFzc2V0LCBzdHJpbmdpZnlBc3NldElEIH0gZnJvbSBcIi4uL0Fzc2V0XCJcbmltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vQ29FbGVtZW50RmFjdG9yeVwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4uL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgY3RuLCBnZXRBdHRyLCBUYXJnZXROb2RlIH0gZnJvbSBcIi4uL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IEJhc2VDb0VsZW1lbnQgfSBmcm9tIFwiLi4vZWxlbWVudC9CYXNlQ29FbGVtZW50XCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4uL1RoaXNcIjtcbmltcG9ydCB7IERvY3VtZW50QXNzZXRJbXBsIH0gZnJvbSBcIi4uL2ltcGwvRG9jdW1lbnRBc3NldEltcGxcIjtcblxuXG4vKipcbiAqIEEgY29tcG9uZW50IHdoaWNoIGNvbnRhaW5zIG90aGVyIGNvbWwgcGFnZXMuIEFueSBwYWdlIGNhbiBiZSBzaG93biBieSBjYWxsaW5nIHRoZSBzaG93KCkgbWV0aG9kLlxuICovXG5jbGFzcyBQYWdlcyBleHRlbmRzIEJhc2VDb0VsZW1lbnQge1xuICAgIHByb3RlY3RlZCBuYW1lOnN0cmluZztcbiAgICBwcm90ZWN0ZWQgbG9jYWw6Ym9vbGVhbjtcbiAgICBwcm90ZWN0ZWQgY2hpbGQ6Q29FbGVtZW50O1xuICAgIHByb3RlY3RlZCBjYWNoZTpNYXA8c3RyaW5nLENvRWxlbWVudD49bmV3IE1hcCgpO1xuXG4gICAgY29uc3RydWN0b3IoY3Z0OkNvbnZlcnRlcjxUaGlzPix0bjpUYXJnZXROb2RlKSB7XG4gICAgICAgIHN1cGVyKGN2dCx0bik7XG4gICAgICAgIHRoaXMubmFtZT1nZXRBdHRyPHN0cmluZz4oY3Z0LHRuLnNub2RlLCduYW1lJyx1bmRlZmluZWQsdG4pO1xuICAgICAgICB0aGlzLmxvY2FsPWdldEF0dHI8Ym9vbGVhbj4oY3Z0LHRuLnNub2RlLCdsb2NhbCcsZmFsc2UsdG4pO1xuXG4gICAgICAgIC8vdGhpcy5yZWdpc3RlclNlcnZpY2VFdmVudHMoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFNob3dzIGRpcmVjdCBodG1sIGNvbnRlbnQgaW5zaWRlIHRoaXMgcGFnZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaHRtbCBcbiAgICAgKiBAcGFyYW0gYW5pbWF0aW9uIFxuICAgICAqL1xuICAgIHB1YmxpYyBzaG93SHRtbChodG1sOnN0cmluZyxhbmltYXRpb24/Oid0byd8J2JhY2snfCd1cCd8J2Rvd24nLHBhcmFtcz86e1trZXk6c3RyaW5nXTphbnl9KSB7XG4gICAgICAgIGxldCBhbm9uQXNzZXQ9bmV3IGNsYXNzIGV4dGVuZHMgRG9jdW1lbnRBc3NldEltcGwge1xuICAgICAgICAgICAgcHVibGljIGdldFRleHQoKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShodG1sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSh7bmFtZTonX19hbm9uJyx0eXBlOkFzc2V0VHlwZS5wYWdlfSk7XG4gICAgICAgIHRoaXMuc2hvd0Fzc2V0KGFub25Bc3NldCxhbmltYXRpb24sdHJ1ZSxwYXJhbXMpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzaG93QXNzZXQoYXNzZXQ6QXNzZXQsXG4gICAgICAgIGFuaW1hdGlvbj86J3RvJ3wnYmFjayd8J3VwJ3wnZG93bicsXG4gICAgICAgIGRvbnRSZXVzZT86Ym9vbGVhbixcbiAgICAgICAgcGFyYW1zPzp7W2tleTpzdHJpbmddOmFueX0pIHtcblxuICAgICAgICBpZiAoaXNDb0VsZW1lbnRBc3NldChhc3NldCkpIHtcbiAgICAgICAgICAgIGxldCBhc0NvbnRyb2w6IFByb21pc2U8Q29FbGVtZW50PjtcbiAgICAgICAgICAgIGlmICghZG9udFJldXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRyb2wgPSB0aGlzLmZyb21DYWNoZShhc3NldC5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJvbCkge1xuICAgICAgICAgICAgICAgICAgICBhc0NvbnRyb2wgPSBQcm9taXNlLnJlc29sdmUoY29udHJvbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFhc0NvbnRyb2wpXG4gICAgICAgICAgICAgICAgYXNDb250cm9sID0gYXNzZXQuYXNDb0VsZW1lbnQodW5kZWZpbmVkLChjdnQpPT57XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN2dC5hZGRPblRoaXNDcmVhdGVkTGlzdGVuZXIoKHQ6VGhpcyk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LnBhcmFtZXRlcnM9cGFyYW1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhc0NvbnRyb2xcbiAgICAgICAgICAgICAgICAudGhlbigoY29udHJvbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb250cm9sLmdldFROKCkuZGF0YShcIl9fYXNzZXRfaWRcIiwgYXNzZXQuZ2V0SWQoKSk7IC8vIG5vdGU6IHNlcmlhbGl6aW5nIHRoZSBhc3NldGlkIGNhdXNlcyBhIHByb2JsZW0gLCB1aTUgdHJpZXMgdG8gYmluZCBpdCAoSSB0aGluayAneycgdGhyb3dzIGl0KX0pXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYC0tLWlkMT0ke2NvbnRyb2wuZGF0YShcIl9fYXNzZXRfaWRcIil9YCk7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNhbGxiYWNrKGNvbnRyb2wsICgoY29udHJvbCBhcyBhbnkpLmdldFRoaXMpID8gKGNvbnRyb2wgYXMgYW55KS5nZXRUaGlzKCkgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b0NhY2hlKGFzc2V0LmdldElkKCksIGNvbnRyb2wpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENoaWxkQ29udHJvbChjb250cm9sLCBhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGAtLS1pZDI9JHtjb250cm9sLmRhdGEoXCJfX2Fzc2V0X2lkXCIpfWApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEN2dCgpLmdldFRoaXMoKS5kaXNwYXRjaEV2ZW50KCdwYWdlY2hhbmdlZCcse2Fzc2V0OmFzc2V0fSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzaG93KHBhZ2VpZDogc3RyaW5nfEFzc2V0SUQsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uPzondG8nfCdiYWNrJ3wndXAnfCdkb3duJyxcbiAgICAgICAgICAgICAgICBkb250UmV1c2U/OmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgcGFyYW1zPzp7W2tleTpzdHJpbmddOmFueX0pIHtcbiAgICAgICAgbGV0IGFzc2V0aWQ6IHN0cmluZyB8IEFzc2V0SUQ7XG4gICAgICAgIGlmICh0eXBlb2YgcGFnZWlkID09ICdzdHJpbmcnICYmIHBhZ2VpZC5pbmRleE9mKCd7JykgPCAwKSB7XG4gICAgICAgICAgICAvLyBpdHMgbm90IGEgc3RyaW5naWZpZWQgaWRcbiAgICAgICAgICAgIGFzc2V0aWQgPSB7IHR5cGU6IEFzc2V0VHlwZS5wYWdlLCBuYW1lOiBwYWdlaWQgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFzc2V0aWQgPSBwYWdlaWQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXNzZXQgPSBJbXBsZW1lbnRhdGlvbnMuZ2V0QXNzZXRGYWN0b3J5KCkuZ2V0KGFzc2V0aWQpO1xuICAgICAgICBpZiAoIWFzc2V0ICYmIHR5cGVvZiBwYWdlaWQgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIHRyeSBjb252ZXJ0aW5nIHRvIGFuIGFzc2V0IGlkXG4gICAgICAgICAgICBhc3NldCA9IEltcGxlbWVudGF0aW9ucy5nZXRBc3NldEZhY3RvcnkoKS5nZXQoeyB0eXBlOiBBc3NldFR5cGUuaW5kZXhwYWdlLCBuYW1lOiBwYWdlaWQgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXNzZXQpXG4gICAgICAgICAgICB0aGlzLnNob3dBc3NldChhc3NldCxhbmltYXRpb24sZG9udFJldXNlLHBhcmFtcyk7XG4gICAgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgbmV3IGNoaWxkIGNvbnRyb2wsIG9yIHJlbW92ZXMgY3VycmVudCBjaGlsZCBpdCBpZiBgY29udHJvbGAgaXMgbnVsbC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0Q2hpbGRDb250cm9sKGNvbnRyb2w6Q29FbGVtZW50LGFuaW1hdGlvbj86J3RvJ3wnYmFjayd8J3VwJ3wnZG93bicpIHtcbiAgICAgICAgY29uc3Qge2N2dCx0bn0gPSBjdG4odGhpcyk7XG4gICAgICAgIGxldCBsYXN0Q29udHJvbDpDb0VsZW1lbnQ7XG4gICAgICAgIC8vbGV0IGNoYW5nZWQ9KHRoaXMuY2hpbGQhPWNvbnRyb2wpO1xuICAgICAgICBpZiAodGhpcy5jaGlsZCkge1xuICAgICAgICAgICAgbGFzdENvbnRyb2w9dGhpcy5jaGlsZDtcbiAgICAgICAgICAgIGN2dC5kZXRhY2godGhpcy5jaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoaWxkPWNvbnRyb2w7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkKSB7XG5cbiAgICAgICAgICAgIGN2dC5hdHRhY2godG4udG5vZGUsdGhpcy5jaGlsZClcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlKHRoaXMuY2hpbGQsYW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICAvL2N2dC5pbnZhbGlkYXRlKHRuKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdnQuaW52YWxpZGF0ZSh0bik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYW5pbWF0ZU9sZChjb250cm9sOiBDb0VsZW1lbnQsYW5pbWF0aW9uPzondG8nfCdiYWNrJ3wndXAnfCdkb3duJykge1xuICAgICAgICBpZiAoYW5pbWF0aW9uKSB7IC8vIGFuaW1hdGlvblxuXG4gICAgICAgICAgICBsZXQgbGFzdEV2ZW50RGVsZWdhdGU9Y29udHJvbC5nZXRUTigpLmRhdGEoJ19fYW5pbWF0b3InKTtcbiAgICAgICAgICAgIGlmIChsYXN0RXZlbnREZWxlZ2F0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2wuZ2V0VE4oKS5yZW1vdmVMaXN0ZW5lcignb25Qb3N0UmVuZGVyJyxsYXN0RXZlbnREZWxlZ2F0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250cm9sLmdldFROKCkuYWRkTGlzdGVuZXIoJ29uUG9zdFJlbmRlcicsbGFzdEV2ZW50RGVsZWdhdGU9KGRvbVJlZjpFbGVtZW50KT0+IHtcbiAgICAgICAgICAgICAgICBkb21SZWYuY2xhc3NMaXN0LmFkZCgnY28tYW5pbWF0aW9uLScrYW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgICAgIGRvbVJlZi5jbGFzc0xpc3QucmVtb3ZlKCdjby1hbmltYXRpb24tJythbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIH0sNTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29udHJvbC5nZXRUTigpLmRhdGEoJ19fYW5pbWF0b3InLGxhc3RFdmVudERlbGVnYXRlKTsgLy8gc28gd2UgY2FuIHJlbW92ZSB0aGUgZnVuY3Rpb24gYWdhaW5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBhbnVtPTA7XG4gICAgcHJvdGVjdGVkIGFuaW1hdGUoY29udHJvbDogQ29FbGVtZW50LGFuaW1hdGlvbj86J3RvJ3wnYmFjayd8J3VwJ3wnZG93bicpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbikgeyAvLyBhbmltYXRpb25cbiAgICAgICAgICAgIGxldCBudW09UGFnZXMuYW51bSsrO1xuICAgICAgICAgICAgY29udHJvbC4kKG51bGwsJ19fYW5pbWF0b3InLChlbGVtKT0+e1xuICAgICAgICAgICAgICAgIC8vbGV0IGFpZD0oY29udHJvbC5nZXRUTigpLnNub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgnZGF0YS1hc3NldC1pZCcpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tQU5JTVsnK2FpZCsnXS0tLS1bJytudW0rJ109JythbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZCgnY28tYW5pbWF0aW9uLScrYW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2wuJChudWxsLCdfX2FuaW1hdG9yJyk7IC8vIHJlbW92ZSBcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdjby1hbmltYXRpb24tJythbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIH0sNTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udHJvbC4kKG51bGwsJ19fYW5pbWF0b3InKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCB0b0NhY2hlKGFzc2V0SWQ6QXNzZXRJRCxjb250cm9sOiBDb0VsZW1lbnQpIHtcbiAgICAgICAgbGV0IGtleT1zdHJpbmdpZnlBc3NldElEKGFzc2V0SWQpO1xuICAgICAgICB0aGlzLmNhY2hlLnNldChrZXksY29udHJvbCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGZyb21DYWNoZShhc3NldElkOkFzc2V0SUQpIDogQ29FbGVtZW50IHtcbiAgICAgICAgbGV0IGtleT1zdHJpbmdpZnlBc3NldElEKGFzc2V0SWQpO1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoa2V5KTtcbiAgICB9XG5cbiAgICBvblJlbmRlcihybTogUmVuZGVyKTogdm9pZCB7XG4gICAgICAgIHJtLm9wZW5TdGFydCgnZGl2Jyx0aGlzKTtcbiAgICAgICAgcm0uY2xhc3MoJ3Utd3MtcGFnZS1jb250YWluZXInKTtcbiAgICAgICAgaWYgKCF0aGlzLmNoaWxkKVxuICAgICAgICAgICAgcm0uY2xhc3MoJ3Utd3Mtbm9jaGlsZCcpO1xuICAgICAgICBybS5jb3B5QXR0ckV4Y2VwdCh0aGlzLFsnaWQnXSk7XG4gICAgICAgIHRoaXMuY3Z0LmVuY29kZVdTRShybSx0aGlzLnRuKTtcbiAgICAgICAgcm0ub3BlbkVuZCgpO1xuXG4gICAgICAgIHRoaXMuZ2V0Q3Z0KCkucmVuZGVyQ2hpbGRyZW4ocm0sdGhpcy5nZXRUTigpKTtcblxuICAgICAgICBybS5jbG9zZSgnZGl2Jyk7XG4gICAgfVxuXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnZXNGYWN0b3J5IGltcGxlbWVudHMgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgcHVibGljIHJlZ2lzdGVyRmFjdG9yeShjdnQ6IENvbnZlcnRlcjxUaGlzPikge1xuICAgICAgICBjdnQucmVnaXN0ZXJGYWN0b3J5KCdwYWdlcycsdGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIG1ha2VDb21wb25lbnQodG46VGFyZ2V0Tm9kZSxjdnQ6Q29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWdlcyhjdnQsdG4pIDtcbiAgICB9XG5cbn1cblxuIiwiaW1wb3J0IHsgQ29FbGVtZW50IH0gZnJvbSBcIi4uL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4uL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uL1JlbmRlclwiO1xuaW1wb3J0IHsgVGFyZ2V0Tm9kZSB9IGZyb20gXCIuLi9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4uL1RoaXNcIjtcbmltcG9ydCB7IEh0bWxFbGVtZW50LCBIdG1sRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi9IdG1sRWxlbWVudFwiO1xuXG4vKipcbiogICBEb2N1bWVudEVsZW1lbnQgaGFuZGxlcyBhIGRvY3VtZW50IG5vZGUuIEl0IGlzIHJlbmRlcmVkIGFzIGEgPGRpdj5cblxuICAgIEBkZXByZWNhdGVkIC0gbm90IHVzZWQuIFRoZSBkb2N1bWVudCBub2RlIGlzIG5vdyBoYW5kbGVkIGJ5IHRoZSBUaGlzIG9iamVjdC5cbiovXG5jbGFzcyBEb2N1bWVudEVsZW1lbnQgZXh0ZW5kcyBIdG1sRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoY3Z0OkNvbnZlcnRlcjxUaGlzPix0bjpUYXJnZXROb2RlKSB7XG4gICAgICAgIHN1cGVyKGN2dCx0bik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHN0YXJ0KHJtOiBSZW5kZXIsY3Z0OiBDb252ZXJ0ZXI8VGhpcz4sZWxlbTpFbGVtZW50KSB7XG4gICAgICAgIHJtLm9wZW5TdGFydCgnZGl2Jyx0aGlzKVxuICAgICAgICAuY2xhc3MoJ3UtZG9jdW1lbnQnKTtcbiAgICAgICAgaWYgKChlbGVtIGluc3RhbmNlb2YgRG9jdW1lbnQpICYmIChlbGVtIGFzIERvY3VtZW50KS5ib2R5KSB7XG4gICAgICAgICAgICBjdnQuY29weUF0dHJFeGNlcHQocm0sIChlbGVtIGFzIERvY3VtZW50KS5ib2R5LFsnaWQnXSx0aGlzLnRuKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgcm0ub3BlbkVuZCgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBlbmQocm06IFJlbmRlcixjdnQ6IENvbnZlcnRlcjxUaGlzPixlbGVtOkVsZW1lbnQpIHtcbiAgICAgICAgcm0uY2xvc2UoJ2RpdicpO1xuICAgIH1cblxuICAgIG9uUG9zdFJlbmRlcihyZWY6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5jdnQpIHtcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuY3Z0Lm9uQWZ0ZXJSZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiogXG4qL1xuZXhwb3J0IGNsYXNzIERvY3VtZW50RWxlbWVudEZhY3RvcnkgZXh0ZW5kcyBIdG1sRWxlbWVudEZhY3Rvcnkge1xuICAgXG5cbiAgICBtYWtlQ29tcG9uZW50KHRuOiBUYXJnZXROb2RlLCBjdnQ6IENvbnZlcnRlcjxUaGlzPik6IENvRWxlbWVudCB7XG4gICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnRFbGVtZW50KGN2dCx0bikgO1xuICAgIH1cblxufSIsIiIsImltcG9ydCB7IEFzc2V0LCBBc3NldElELCByZXN0b3JlQXNzZXRJRCwgc3RyaW5naWZ5QXNzZXRJRCB9IGZyb20gXCIuLi9jb21sL0Fzc2V0XCI7XG5pbXBvcnQgeyBTaW1wbGVBc3NldEZhY3RvcnkgfSBmcm9tIFwiLi4vY29tbC9pbXBsL1NpbXBsZUFzc2V0RmFjdG9yeVwiO1xuXG4vKipcbiAqIEFzc2V0IGZhY3RvcnkgdGhhdCByZXR1cm5zIGNvZGUgZnJvbSBhIENvQ29kZSBlbGVtZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBGcm9tQ29kZUFzc2V0RmFjdG9yeSBleHRlbmRzIFNpbXBsZUFzc2V0RmFjdG9yeSB7XG5cbiAgICBwcm90ZWN0ZWQgYWRkZWQ6TWFwPHN0cmluZywoYXNzZXRJZDogc3RyaW5nIHwgQXNzZXRJRCk9PkFzc2V0Pj1uZXcgTWFwKCk7XG5cbiAgICBwcm90ZWN0ZWQgdG9LZXkoYXNzZXRJZDogc3RyaW5nIHwgQXNzZXRJRCkgOiBzdHJpbmcge1xuICAgICAgICBsZXQgYWlkMD1yZXN0b3JlQXNzZXRJRChhc3NldElkKTsgLy8gbm90IGluIGFueSBwYXJ0aWN1bGFyIGtleSBvcmRlclxuICAgICAgICBsZXQgYWlkPXsgLy8gb3JkZXJlZCBieSBuYW1lLCB0eXBlXG4gICAgICAgICAgICBuYW1lOmFpZDAubmFtZSxcbiAgICAgICAgICAgIHR5cGU6YWlkMC50eXBlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBhcyBhc3NldElkcyBhcmUgZWxlbWVudCBpZHMsIHRoZXkgY2FudCBoYXZlICcuJyAocXVlcnlTZWxlY3RvciB3aWxsIHRyZWF0IGl0IGFzIGEgY2xhc3MpIC0gc28gdXNlIF8gYXMgYSBzdWJzdGl0dXRlXG4gICAgICAgIGFpZC5uYW1lPWFpZC5uYW1lLnJlcGxhY2UoJ18nLCcuJyk7XG4gICAgICAgIGxldCBzaWQ9c3RyaW5naWZ5QXNzZXRJRChhaWQpO1xuICAgICAgICByZXR1cm4gc2lkO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRBc3NldChhc3NldElkOiBzdHJpbmcgfCBBc3NldElELGdldGZuOihhc3NldElkOiBzdHJpbmcgfCBBc3NldElEKT0+QXNzZXQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgLS1BRERJTkcoJHtzaWR9KWApO1xuICAgICAgICB0aGlzLmFkZGVkLnNldCh0aGlzLnRvS2V5KGFzc2V0SWQpLGdldGZuKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0KGFzc2V0SWQ6IHN0cmluZyB8IEFzc2V0SUQpOiBBc3NldCB7XG4gICAgICAgIGxldCBmbj10aGlzLmFkZGVkLmdldCh0aGlzLnRvS2V5KGFzc2V0SWQpKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgLS0gICAgTFUoJHtzaWR9KT09PiR7KGZuKT8nRk9VTkQnOidCWVBBU1MnfSBgKTtcbiAgICAgICAgaWYgKGZuKVxuICAgICAgICAgICAgcmV0dXJuIGZuKHJlc3RvcmVBc3NldElEKGFzc2V0SWQpKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldChhc3NldElkKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnJvbUNvZGVBc3NldEZhY3Rvcnkob2JqOiBhbnkpOiBvYmogaXMgRnJvbUNvZGVBc3NldEZhY3Rvcnkge1xuICAgIHJldHVybiBvYmogJiYgdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiAnYWRkQXNzZXQnIGluIG9iajtcbn1cbiIsImltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vY29tbC9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJJbXBsIH0gZnJvbSBcIi4uL2NvbWwvaW1wbC9Db252ZXJ0ZXJJbXBsXCI7XG5cblxuLyoqXG4gKiBBIENvbnZlcnRlciBmb3IgdGhlIGRlbW8uIENoZWNrcyBmb3IgQ29FbGVtZW50RmFjdHJpZXMgaW4gdGhlIGdsb2JhbFRoaXMgc28gdGhhdCBlbGVtZW50cyB3cml0dGVuIGluIHRoZSBkZW1vIEFwcHMgY2FuIGJlIGxvYWRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIERlbW9Db252ZXJ0ZXJJbXBsIGV4dGVuZHMgQ29udmVydGVySW1wbCB7XG4gICAgLyoqXG4gICAgICogTG9hZHMgYSBqcyBzY3JpcHQgdXNpbmcgQU1EIGFuZCBjcmVhdGVzIGEgQ29FbGVtZW50IG91dCBvZiB0aGUgbG9hZGVkIG1vZHVsZSAoTW9kdWxlLmRlZmF1bHQpXG4gICAgICogVGhpcyBpcyB0aGVuIGluc3RhbGxlZCBvbiB0aGlzIGluc3RhbmNlJ3MgZWxlbWVudCBmYWN0b3JpZXMuXG4gICAgICogVGhpcyBmdW5jdGlvbiBhbHNvIHB1c2hlcyB0aGUgcHJvbWlzZSBvbnRvIHRoaXMubG9hZEVsZW1lbnRQcm9taXNlcywgd2hpY2ggY2FuIGJlIHVzZWRcbiAgICAgKiB0byB3YWl0IGZvciBhbGwgd3MtZWxlbWVudHMgdG8gbG9hZCBiZWZvcmUgcmVuZGVyaW5nIHRoZSB0ZW1wbGF0ZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ganMgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIGxvYWRNYXJrdXBGYWN0b3J5KGpzOnN0cmluZykgOiBQcm9taXNlPENvRWxlbWVudEZhY3Rvcnk+IHtcbiAgICAgICAgaWYgKGdsb2JhbFRoaXNbanNdICYmIHR5cGVvZiBnbG9iYWxUaGlzW2pzXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBnbG9iYWxUaGlzW2pzXSBhcyBDb0VsZW1lbnRGYWN0b3J5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdXBlci5sb2FkTWFya3VwRmFjdG9yeShqcyk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHsgQXNzZXRJRCB9IGZyb20gXCIuLi9jb21sL0Fzc2V0XCI7XG5pbXBvcnQgeyBBdHRhY2htZW50IH0gZnJvbSBcIi4uL2NvbWwvQXR0YWNobWVudFwiO1xuaW1wb3J0IHsgVUk1QXR0YWNobWVudCB9IGZyb20gXCIuLi9jb21sL2JyaWRnZS91aTUvVUk1QXR0YWNobWVudFwiO1xuaW1wb3J0IHsgRnJvbUNvZGVBc3NldEZhY3RvcnkgfSBmcm9tIFwiLi9Gcm9tQ29kZUFzc2V0RmFjdG9yeVwiO1xuaW1wb3J0IHsgQXR0YWNobWVudEltcGwgfSBmcm9tIFwiLi4vY29tbC9pbXBsL0F0dGFjaG1lbnRJbXBsXCI7XG5pbXBvcnQgeyBEZWZhdWx0SW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uL2NvbWwvaW1wbC9EZWZhdWx0SW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBKUXVlcnlBamF4IH0gZnJvbSBcIi4uL2NvbWwvaW1wbC9KUXVlcnlBamF4XCI7XG5pbXBvcnQgeyBJbXBsZW1lbnRhdGlvbnMgfSBmcm9tIFwiLi4vY29tbC9JbXBsZW1lbnRhdGlvbnNcIjtcbmltcG9ydCBDb21sU3RhcnR1cCBmcm9tIFwiLi4vY29tbC9Db21sU3RhcnR1cFwiO1xuaW1wb3J0IHsgQmFzZUNvRWxlbWVudCB9IGZyb20gXCIuLi9jb21sL2VsZW1lbnQvQmFzZUNvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29udmVydGVyIH0gZnJvbSBcIi4uL2NvbWwvQ29udmVydGVyXCI7XG5pbXBvcnQgeyBUaGlzLCBHZXRBdHRyVCB9IGZyb20gXCIuLi9jb21sL1RoaXNcIjtcbmltcG9ydCB7IERlbW9Db252ZXJ0ZXJJbXBsIH0gZnJvbSBcIi4vRGVtb0NvbnZlcnRlckltcGxcIjtcblxuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgZm9yIHRoZSBkZW1vIGFwcC5cbiAqIFxuICogV2UgaW5zdGFsbCBvdXIgc3BlY2lhbCBGcm9tQ29kZUFzc2V0RmFjdG9yeSBzbyB0aGF0IHRoZSBDb0NvZGUgZWxlbWVudHMgY2FuIGRlbGl2ZXIgdXNlciBjb2RlIG9uIHRoZSBmbHkgdG9cbiAqIGRpc3BsYXkgaW4gPHBhZ2VzPi4gQWxzbywgd2UgYWRkIHRoZSAnZXhwb3NlJyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVtb0FwcCBleHRlbmRzIENvbWxTdGFydHVwIHtcbiAgICBjb25zdHJ1Y3Rvcihkb250VXNlVUk1OmJvb2xlYW4pIHtcbiAgICAgICAgc3VwZXIoZG9udFVzZVVJNSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgc28gd2UgY2FuIGFkZCBvdXIgc3BlY2lhbCBhc3NldCBmYWN0b3J5LCB3aGljaCB3aWxsIHNlcnZlIHVwIG1vZGlmaWVkIGNvZGUgYXNzZXRzIHN0cmFpZ2h0IGZyb21cbiAgICAgKiB0aGUgPGNvLWNvZGU+PC9jby1jb2RlPiBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY29uZmlndXJlSW1wbGVtZW50YXRpb25zKCkge1xuICAgICAgICAvKiBzZXQgdXAgdGhlIGltcGxlbW50YXRpb25zIG9mIGFqYXgsIGFzc2V0cywgQ29udmVydGVyIGFuZCBSZW5kZXIgKi9cbiAgICAgICAgbGV0IHRoYXQ9dGhpcztcbiAgICAgICAgbmV3IChjbGFzcyBleHRlbmRzIERlZmF1bHRJbXBsZW1lbnRhdGlvbnMge1xuICAgICAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUF0dGFjaG1lbnRJbXBsKCk6IEF0dGFjaG1lbnQge1xuICAgICAgICAgICAgICAgIGlmICghdGhhdC5kb250VXNlVUk1KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVJNUF0dGFjaG1lbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEF0dGFjaG1lbnRJbXBsKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb3RlY3RlZCBjcmVhdGVDb252ZXJ0ZXJJbXBsKGNvcHlTdGF0ZUZyb20/OiBDb252ZXJ0ZXI8VGhpcz4pOiBDb252ZXJ0ZXI8VGhpcz4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGVtb0NvbnZlcnRlckltcGwoY29weVN0YXRlRnJvbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIChcbiAgICAgICAgICAgIG5ldyAoY2xhc3MgZXh0ZW5kcyBKUXVlcnlBamF4IHsgLy8gYWRkIHRoZSAnZGVtbycgdG8gdGhlIHBhdGhcbiAgICAgICAgICAgICAgICBwcm90ZWN0ZWQgYXNzZXRzRm9sZGVyKGFzc2V0SWQ6QXNzZXRJRCkgOiBzdHJpbmcge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRCYXNlUGF0aCgpKydkZW1vL2h0bWwvJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbmV3IEZyb21Db2RlQXNzZXRGYWN0b3J5KClcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmFkZENvbWxPYmplY3RzVG9HbG9iYWxTY29wZSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhZGRDb21sT2JqZWN0c1RvR2xvYmFsU2NvcGUoKSB7XG4gICAgICAgIGdsb2JhbFRoaXMuQmFzZUNvRWxlbWVudD1CYXNlQ29FbGVtZW50O1xuXG4gICAgICAgIGdsb2JhbFRoaXMuZXhwb3NlID0gZnVuY3Rpb24oLi4uY2xhc3NlczphbnkpIHtcbiAgICAgICAgICAgIGZvcihjb25zdCBjbGF6eiBvZiBjbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsYXp6Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbFRoaXNbY2xhenoubmFtZV09Y2xheno7XG4gICAgICAgICAgICAgICAgZWxzZSAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVW5hYmxlIHRvIGhvaXN0IGNsYXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNsYXp6KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGF0dGFjaFRvKGlkOnN0cmluZyxwYWdlOnN0cmluZ3xBc3NldElEKSB7XG4gICAgICAgIGxldCBpbnNlcnRlcj1JbXBsZW1lbnRhdGlvbnMuY3JlYXRlQXR0YWNobWVudCgpO1xuICAgICAgICBsZXQgZWxlbWVudD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUw9Jyc7XG4gICAgICAgIGluc2VydGVyLmF0dGFjaChlbGVtZW50LHBhZ2UpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vY29tbC9Db252ZXJ0ZXJcIjtcbmltcG9ydCBCYXNlVGhpcyBmcm9tIFwiLi4vY29tbC9pbXBsL0Jhc2VUaGlzXCI7XG5pbXBvcnQgeyBSZW5kZXJJbXBsIH0gZnJvbSBcIi4uL2NvbWwvaW1wbC9SZW5kZXJJbXBsXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4uL2NvbWwvVGhpc1wiO1xuXG4vKipcbiAqIERlbW9uc3RyYXRlcyBob3cgdG8gdXNlIGEgVHlwZXNjcmlwdCBvYmplY3QgYXMgdGhlICd0aGlzJyBvZiBhbiBodG1sIHBhZ2UuXG4gKiBcbmBgYGh0bWxcbjxodG1sPlxuPGhlYWQ+XG4gICAgPG1ldGEgbmFtZT1cInRoaXNjbGFzc1wiIGNvbnRlbnQ9XCJkZW1vL015UGFnZVwiPlxuICBcbjwvaGVhZD5cblxuPGJvZHkgY2xhc3M9XCJkZW1vLWJhc2VcIj5cbiAgICA8aDI+SG93IHRvIHVzZSBhIFR5cGVzY3JpcHQgY2xhc3MgaW5zdGVhZCBvZiBhbiBpbmxpbmUgc2NyaXB0PC9oMj5cbjwvYm9keT5cblxuPC9odG1sPlxuYGBgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15UGFnZSBleHRlbmRzIEJhc2VUaGlzIHtcbiAgICBwcm90ZWN0ZWQgYWRkcmVzcz0nd2EnO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGN2dDpDb252ZXJ0ZXI8TXlQYWdlPixzdGF0ZUZyb20/OkJhc2VUaGlzKSB7XG4gICAgICAgIHN1cGVyKGN2dCxzdGF0ZUZyb20pXG4gICAgICAgIGNvbnNvbGUubG9nKGBDb25zdHJ1Y3RlZGApO1xuXG4gICAgICAgIGxldCBybT1uZXcgUmVuZGVySW1wbChudWxsLG51bGwpO1xuICAgICAgICBjb25zb2xlLmxvZyhybSk7XG4gICAgfVxuXG4gICAgc2hvd0NsaWNrKGV2Ok1vdXNlRXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0hlcmUgMj0nKyh0aGlzIGFzIGFueSkubmFtZSk7XG4gICAgfVxufSIsImltcG9ydCB7IGlzVGV4dEFzc2V0LCByZXN0b3JlQXNzZXRJRCB9IGZyb20gXCIuLi8uLi9jb21sL0Fzc2V0XCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi4vLi4vY29tbC9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vLi4vY29tbC9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vLi4vY29tbC9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IEJhc2VDb0VsZW1lbnQgfSBmcm9tIFwiLi4vLi4vY29tbC9lbGVtZW50L0Jhc2VDb0VsZW1lbnRcIjtcbmltcG9ydCB7IERvY3VtZW50QXNzZXRJbXBsIH0gZnJvbSBcIi4uLy4uL2NvbWwvaW1wbC9Eb2N1bWVudEFzc2V0SW1wbFwiO1xuaW1wb3J0IHsgSW1wbGVtZW50YXRpb25zIH0gZnJvbSBcIi4uLy4uL2NvbWwvSW1wbGVtZW50YXRpb25zXCI7XG5pbXBvcnQgeyBSZW5kZXIgfSBmcm9tIFwiLi4vLi4vY29tbC9SZW5kZXJcIjtcbmltcG9ydCB7IFRhcmdldE5vZGUsIGdldEF0dHIsIGN0biB9IGZyb20gXCIuLi8uLi9jb21sL1RhcmdldE5vZGVcIjtcbmltcG9ydCB7IFRoaXMgfSBmcm9tIFwiLi4vLi4vY29tbC9UaGlzXCI7XG5pbXBvcnQgeyBpc0Zyb21Db2RlQXNzZXRGYWN0b3J5IH0gZnJvbSBcIi4uL0Zyb21Db2RlQXNzZXRGYWN0b3J5XCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBDb2RlTWlycm9yVHlwZSB7XG5cdC8qKlxuXHQgKiBDb252ZXJ0IGEgdGV4dGFyZWEgaW4gZWxlbSB0byBhIENvZGVNaXJyb3IuXG5cdCAqIEBwYXJhbSBlbGVtIFxuXHQgKiBAcGFyYW0gY29uZmlnIFxuXHQgKi9cblx0ZnJvbVRleHRBcmVhKGVsZW06RWxlbWVudCxjb25maWc/OkNvZGVTZXR0aW5ncykgOkNvZGVNaXJyb3JUeXBlO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGNvZGUgaW5zaWRlIHRoZSBlZGl0b3IgYXMgdGV4dC5cblx0ICovXG5cdGdldFZhbHVlKCkgOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgY29kZSBpbnNpZGUgdGhlIGVkaXRvci5cblx0ICogXG5cdCAqIEBwYXJhbSBjb2RlIFxuXHQgKi9cblx0c2V0VmFsdWUoY29kZTpzdHJpbmcpOyBcbn1cblxuZGVjbGFyZSB2YXIgQ29kZU1pcnJvcjogQ29kZU1pcnJvclR5cGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZVNldHRpbmdzIHtcblx0dmFsdWU/OiBzdHJpbmc7Ly9cImZ1bmN0aW9uIG15U2NyaXB0KCl7cmV0dXJuIDEwMDt9XFxuXCIsXG5cdG1vZGU/OiAgc3RyaW5nOy8vXCJqYXZhc2NyaXB0XCJcblx0bGluZVdyYXBwaW5nPzpib29sZWFuO1xuXHRsaW5lTnVtYmVycz86Ym9vbGVhbjtcblx0dGFiU2l6ZT86bnVtYmVyO1xuXHR0aGVtZT86c3RyaW5nO1xuXHRmb2xkR3V0dGVyPzogYm9vbGVhbjtcbiAgICBndXR0ZXJzPzogc3RyaW5nW107Ly9bXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIsIFwiQ29kZU1pcnJvci1mb2xkZ3V0dGVyXCJdO1xufVxuXG4vKipcbiAqIERpc3BsYXlzIGNvZGUgdXNpbmcgY29kZW1pcnJvclxuICogXG4gKiBQdXQgdGhlc2Ugc2NyaXB0IHRhZ3MgaW4geW91ciBodG1sIGJlZm9yZSB1c2luZzpcbiAqIFxuICogYGBgaHRtbFxuICogICAgIDwhLS1jb2RlbWlycm9yIGFuZCBmcmllbmRzLS0+XG4gICAgPHNjcmlwdCBzcmM9J2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2NvZGVtaXJyb3IvNS42NS4yL2NvZGVtaXJyb3IubWluLmpzJz48L3NjcmlwdD5cbiAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2NvZGVtaXJyb3IvNS42NS4yL2NvZGVtaXJyb3IubWluLmNzc1wiPlxuXG4gICAgPHNjcmlwdCBzcmM9XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9jb2RlbWlycm9yLzUuNjUuMi9tb2RlL3htbC94bWwuanNcIj48L3NjcmlwdD5cbiAgICA8c2NyaXB0IHNyYz1cImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2NvZGVtaXJyb3IvNS42NS4yL21vZGUvamF2YXNjcmlwdC9qYXZhc2NyaXB0LmpzXCI+PC9zY3JpcHQ+XG4gICAgPHNjcmlwdCBzcmM9XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9jb2RlbWlycm9yLzUuNjUuMi9tb2RlL2Nzcy9jc3MuanNcIj48L3NjcmlwdD5cbiAgICA8c2NyaXB0IHNyYz1cImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2NvZGVtaXJyb3IvNS42NS4yL21vZGUvaHRtbG1peGVkL2h0bWxtaXhlZC5qc1wiPjwvc2NyaXB0PlxuXG4gICAgPCEtLSBqcyBiZWF1dGlmeSBmb3IgY29kZSBtaXJyb3IgLS0+XG4gICAgPHNjcmlwdCBzcmM9XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9qcy1iZWF1dGlmeS8xLjE0LjAvYmVhdXRpZnkuanNcIj48L3NjcmlwdD5cbiAgICA8c2NyaXB0IHNyYz1cImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2pzLWJlYXV0aWZ5LzEuMTQuMC9iZWF1dGlmeS1jc3MuanNcIj48L3NjcmlwdD5cbiAgICA8c2NyaXB0IHNyYz1cImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2pzLWJlYXV0aWZ5LzEuMTQuMC9iZWF1dGlmeS1odG1sLmpzXCI+PC9zY3JpcHQ+XG5cbiAqIGBgYFxuXG4gICAgVGhlbiBleGFtcGxlIHVzYWdlIDpcblxuYGBgaHRtbFxuICAgIDxjb2RlICBzcmM9XCJ0YWJzLmh0bWxcIiBtb2RlPVwiaHRtbG1peGVkXCIgbGluZU51bWJlcnM9XCJ0cnVlXCIgdGFiU2l6ZT1cIjJcIj48L2NvZGU+XG5gYGBcbiAqIFxuICovXG5jbGFzcyBDb2RlRWxlbWVudCBleHRlbmRzIEJhc2VDb0VsZW1lbnQge1xuICAgIHByb3RlY3RlZCBjb2RlTWlycm9yOkNvZGVNaXJyb3JUeXBlO1xuXG5cbiAgICBjb25zdHJ1Y3RvcihjdnQ6Q29udmVydGVyPFRoaXM+LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICBzdXBlcihjdnQsdG4pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb2RlVGV4dChjb2RlOnN0cmluZyxtb2RlOnN0cmluZykge1xuICAgICAgICBsZXQgZm49J2h0bWxfYmVhdXRpZnknO1xuICAgICAgICBpZiAobW9kZT09J2phdmFzY3JpcHQnKVxuICAgICAgICAgICAgZm49J2pzX2JlYXV0aWZ5JztcbiAgICAgICAgaWYgKHRoaXMuY29kZU1pcnJvciAmJiAod2luZG93IGFzIGFueSkuaHRtbF9iZWF1dGlmeSkge1xuICAgICAgICAgICAgY29kZT0od2luZG93IGFzIGFueSlbZm5dKGNvZGUseyAvLyBzZWUgaHR0cHM6Ly9iZWF1dGlmaWVyLmlvL1xuICAgICAgICAgICAgICAgIFwiaW5kZW50X3NpemVcIjogXCIyXCIsXG4gICAgICAgICAgICAgICAgXCJpbmRlbnRfY2hhclwiOiBcIiBcIixcbiAgICAgICAgICAgICAgICBcIm1heF9wcmVzZXJ2ZV9uZXdsaW5lc1wiOiBcIjVcIixcbiAgICAgICAgICAgICAgICBcInByZXNlcnZlX25ld2xpbmVzXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJrZWVwX2FycmF5X2luZGVudGF0aW9uXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwiYnJlYWtfY2hhaW5lZF9tZXRob2RzXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwiaW5kZW50X3NjcmlwdHNcIjogXCJub3JtYWxcIixcbiAgICAgICAgICAgICAgICBcImJyYWNlX3N0eWxlXCI6IFwiY29sbGFwc2VcIixcbiAgICAgICAgICAgICAgICBcInNwYWNlX2JlZm9yZV9jb25kaXRpb25hbFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwidW5lc2NhcGVfc3RyaW5nc1wiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcImpzbGludF9oYXBweVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcImVuZF93aXRoX25ld2xpbmVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJ3cmFwX2xpbmVfbGVuZ3RoXCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgIFwiaW5kZW50X2lubmVyX2h0bWxcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJjb21tYV9maXJzdFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcImU0eFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcImluZGVudF9lbXB0eV9saW5lc1wiOiBmYWxzZVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29kZU1pcnJvcikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgbGluZXMgPSBjb2RlLnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsaW5lczwxMClcbiAgICAgICAgICAgICAgICBjb2RlPWNvZGUrYFxcblxcblxcblxcblxcblxcblxcblxcbmA7IFxuICAgICAgICAgICAgdGhpcy5jb2RlTWlycm9yLnNldFZhbHVlKGNvZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBvblJlbmRlcihybTogUmVuZGVyKSB7XG4gICAgICAgIHJtLm9wZW5TdGFydCgnZGl2Jyx0aGlzKVxuICAgICAgICAuY2xhc3MoJ3UtY28tY29kZScpXG4gICAgICAgIC5jb3B5QXR0ckV4Y2VwdCh0aGlzKVxuXHRcdC5vcGVuRW5kKClcblxuICAgICAgICAgICAgLm9wZW5TdGFydCgndGV4dGFyZWEnKVxuICAgICAgICAgICAgLmNsYXNzKCd1LWNvZGVjb250cm9sJylcbiAgICAgICAgICAgIC5jb3B5QXR0ckV4Y2VwdCh0aGlzKVxuICAgICAgICAgICAgLm9wZW5FbmQoKVxuXG5cbiAgICAgICAgICAgIC5jbG9zZSgndGV4dGFyZWEnKVxuXG4gICAgICAgIC5jbG9zZSgnZGl2Jyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnQoKSA6IHN0cmluZyB7XG4gICAgICAgIGxldCB0ZXh0PSh0aGlzLmdldFROKCkuc25vZGUgYXMgRWxlbWVudCkuaW5uZXJIVE1MO1xuICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgIHRleHQ9dGV4dC50cmltKCk7XG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aD4wKVxuICAgICAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvJmd0Oy9nLCAnPicpLnJlcGxhY2UoLyZsdDsvZywgJzwnKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0Q29kZSgpIDogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuYXR0cjxzdHJpbmc+KCdzcmMnKTtcbiAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgbGV0IGFzc2V0SWQ9cmVzdG9yZUFzc2V0SUQoc3JjKTtcblxuICAgICAgICAgICAgbGV0IGFzc2V0PUltcGxlbWVudGF0aW9ucy5nZXRBc3NldEZhY3RvcnkoKVxuICAgICAgICAgICAgICAgIC5nZXQoYXNzZXRJZCk7XG4gICAgICAgICAgICBpZiAoIWFzc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY28tY29kZTogY2FuJ3QgZmluZCBhbiBhc3NldCB3aXRoIGlkID0ke3NyY31gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9ICAgICAgICBcblxuICAgICAgICAgICAgaWYgKGlzVGV4dEFzc2V0KGFzc2V0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3NldC5nZXRUZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmdldENvbnRlbnQoKSk7XG5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0Q29kZVNldHRpbmdzKCkgOiBDb2RlU2V0dGluZ3N7XG4gICAgICAgIGNvbnN0IHtjdnQsdG59ID0gY3RuKHRoaXMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGluZVdyYXBwaW5nOnRoaXMuYXR0cignbGluZVdyYXBwaW5nJyxmYWxzZSksXG4gICAgICAgICAgICBsaW5lTnVtYmVyczp0aGlzLmF0dHIoJ2xpbmVOdW1iZXJzJyx0cnVlKSxcbiAgICAgICAgICAgIC8vZm9sZEd1dHRlcjp0aGlzLmF0dHIoJ2ZvbGRHdXR0ZXInLGZhbHNlKSxcbiAgICAgICAgICAgIHRhYlNpemU6dGhpcy5hdHRyPG51bWJlcj4oJ3RhYlNpemUnLDIpLFxuICAgICAgICAgICAgdGhlbWU6dGhpcy5hdHRyPHN0cmluZz4oJ3RoZW1lJywnZGVmYXVsdCcpLFxuICAgICAgICAgICAgbW9kZTp0aGlzLmF0dHI8c3RyaW5nPignbW9kZScsJ2h0bWxtaXhlZCcpLFxuICAgICAgICAgICAgLy9ndXR0ZXJzOiBbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIsIFwiQ29kZU1pcnJvci1mb2xkZ3V0dGVyXCJdXG4gICAgICAgIH0gICAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIGlmIHlvdSBuZWVkIHRvIGJlIGNhbGxlZCBvbiBvbkFmdGVyUmVuZGVyaW5nKCkuIHJlZiBpcyB0aGlzIGNvbnRyb2wncyBkb21yZWZcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcmVmIFxuICAgICAqL1xuICAgIG9uUG9zdFJlbmRlcihyZWY6IGFueSkge1xuICAgICAgICBsZXQgZWxlbTpFbGVtZW50PShyZWYgYXMgRWxlbWVudCk7XG4gICAgICAgIGlmIChlbGVtKVxuICAgICAgICAgICAgZWxlbT1lbGVtLnF1ZXJ5U2VsZWN0b3IoJ3RleHRhcmVhJyk7XG5cdFx0aWYgKGVsZW0pIHtcbiAgICAgICAgICAgIGxldCBzZXR0aW5ncz10aGlzLmdldENvZGVTZXR0aW5ncygpO1xuXHRcdFx0dGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoZWxlbSxzZXR0aW5ncyk7XG4gICAgICAgICAgICBsZXQgY29kZT10aGlzLmdldENvZGUoKTtcbiAgICAgICAgICAgIGlmIChjb2RlKSB7XG4gICAgICAgICAgICAgICAgY29kZS50aGVuKCh0ZXh0KT0+e1xuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRDb2RlVGV4dCh0ZXh0LHNldHRpbmdzLm1vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cdFx0fVxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29udGVudEFzQXNzZXQoKTtcblx0fVxuXG4gICAgcHVibGljIGdldEFzc2V0SWQoKSB7XG4gICAgICAgIHJldHVybiAvKnRoaXMuZ2V0QXR0cignc3JjJyl8fCovdGhpcy5hdHRyKCdpZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgd2l0aCBvdXIgZGVtbyBhc3NldCBmYWN0b3J5IHNvIHRoYXQgd2hlbiBhIGRvY3VtZW50IGlzIFxuICAgICAqIHJldHJpdmVkIGZvciBleGVjdXRpb24sIHdlIHJldHVybiB0aGUgKHBvc3NpYmx5IHVzZXIgbW9kaWZpZWQpIGNvbnRlbnRzIGZyb21cbiAgICAgKiBjb2RlIG1pcnJvci5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVnaXN0ZXJDb250ZW50QXNBc3NldCgpIHtcbiAgICAgICAgbGV0IGFzc2Y9SW1wbGVtZW50YXRpb25zLmdldEFzc2V0RmFjdG9yeSgpO1xuICAgICAgICBpZiAoaXNGcm9tQ29kZUFzc2V0RmFjdG9yeShhc3NmKSkge1xuICAgICAgICAgICAgbGV0IGlkPXRoaXMuZ2V0QXNzZXRJZCgpO1xuICAgICAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRoYXQ9dGhpcztcbiAgICAgICAgICAgICAgICBhc3NmLmFkZEFzc2V0KGlkLChhc3NldElkKT0+e1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGNsYXNzIGV4dGVuZHMgRG9jdW1lbnRBc3NldEltcGwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljIGdldFRleHQoKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGF0LmNvZGVNaXJyb3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0ocmVzdG9yZUFzc2V0SUQoYXNzZXRJZCkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuXHRwdWJsaWMgZ2V0Q29kZU1pcnJvcigpIDogQ29kZU1pcnJvclR5cGUge1xuXHRcdHJldHVybiB0aGlzLmNvZGVNaXJyb3I7XG5cdH1cblxufVxuXG4vKipcbiAqIFRoZSBmYWN0b3J5IGNsYXNzIGlzIHJlZ2lzdGVyZWQgaW50byB0aGUgVUk1Q29udmVydGVyLCBleGFtcGxlIHdoZW4gaW1wb3J0ZWQgdmlhIGEgc2NyaXB0IGluIHRoZSA8aGVhZD5cbiAqIFxuICogYGBgXG4gKiA8aGVhZD5cbiAgICA8c2NyaXB0PlxuICAgICAgICB0aGlzLmltcG9ydCgnZGVtby9lbGVtZW50L0NvQ29kZScpO1xuICAgIDwvc2NyaXB0PlxuICA8L2hlYWQ+IFxuICogYGBgXG4gKiBcbiAqL1xuICBleHBvcnQgZGVmYXVsdCBjbGFzcyBDb0NvZGVGYWN0b3J5IGltcGxlbWVudHMgQ29FbGVtZW50RmFjdG9yeSB7XG4gICAgcmVnaXN0ZXJGYWN0b3J5KGN2dDogQ29udmVydGVyPFRoaXM+KSB7XG4gICAgICAgIGN2dC5yZWdpc3RlckZhY3RvcnkoJ2NvLWNvZGUnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBtYWtlQ29tcG9uZW50KHRuOiBUYXJnZXROb2RlLCBjdnQ6IENvbnZlcnRlcjxUaGlzPik6IENvRWxlbWVudCB7XG4gICAgICAgIHJldHVybiBuZXcgQ29kZUVsZW1lbnQoY3Z0LCB0bik7XG4gICAgfVxuXG59XG5cbiIsImltcG9ydCB7IENvRWxlbWVudCB9IGZyb20gXCIuLi8uLi9jb21sL0NvRWxlbWVudFwiO1xuaW1wb3J0IHsgQ29FbGVtZW50RmFjdG9yeSB9IGZyb20gXCIuLi8uLi9jb21sL0NvRWxlbWVudEZhY3RvcnlcIjtcbmltcG9ydCB7IENvbnZlcnRlciB9IGZyb20gXCIuLi8uLi9jb21sL0NvbnZlcnRlclwiO1xuaW1wb3J0IHsgQmFzZUNvRWxlbWVudCB9IGZyb20gXCIuLi8uLi9jb21sL2VsZW1lbnQvQmFzZUNvRWxlbWVudFwiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uLy4uL2NvbWwvUmVuZGVyXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlLCBnZXRBdHRyLCBjdG4gfSBmcm9tIFwiLi4vLi4vY29tbC9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4uLy4uL2NvbWwvVGhpc1wiO1xuXG5cbi8qKlxuICogRGlzcGxheXMgYW4gZXJyb3Ivc3VjY2VzcyBtZXNzYWdlXG4gKiBcbiAqL1xuY2xhc3MgRXJyb3JFbGVtZW50IGV4dGVuZHMgQmFzZUNvRWxlbWVudCB7XG5cblxuICAgIGNvbnN0cnVjdG9yKGN2dDpDb252ZXJ0ZXI8VGhpcz4sdG46VGFyZ2V0Tm9kZSkge1xuICAgICAgIHN1cGVyKGN2dCx0bik7XG4gICAgfVxuXG5cblxuICAgIHByb3RlY3RlZCBlcnJvckFzVGV4dChlcnJvcjpzdHJpbmd8RXJyb3IpIDogc3RyaW5nIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlcnJvcj09J3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyb3IubWVzc2FnZSA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJldHVybiBlcnJvci5tZXNzYWdlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gbWVzc2FnZSB0byB0aGUgY29kZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBUaGUgc3RyaW5nIG9yIHRocm93biBlcnJvciB0byBzaG93LlxuICAgICAqIEBwYXJhbSBlcnJ0eXBlIElmIHRoZSBlcnJvciBoYXBwZW5lZCBhdCBjb21waWxlIG9yIHJ1biB0aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRNZXNzYWdlKG1lc3NhZ2U/OnN0cmluZ3xFcnJvcixlcnJ0eXBlPzonY29tcGlsZSd8J3J1bid8J3N1Y2Nlc3MnKSB7XG4gICAgICAgIGNvbnN0IHtjdnQsdG59ID0gY3RuKHRoaXMpO1xuICAgICAgICBsZXQgY3RhZzpFbGVtZW50PXRuLnRub2RlIGFzIEVsZW1lbnQ7XG4gICAgICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlXG4gICAgICAgICAgICBsZXQgZXRhZz1jdGFnLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi51LWNvZGUtZXJyb3InKTtcbiAgICAgICAgICAgIGlmIChldGFnKSB7XG4gICAgICAgICAgICAgICAgZXRhZy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBldGFnPWN0YWcucXVlcnlTZWxlY3RvcignZGl2LnUtY29kZS1lcnJvcicpO1xuICAgICAgICAgICAgaWYgKCFldGFnKSB7XG4gICAgICAgICAgICAgICAgZXRhZz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBldGFnLmNsYXNzTmFtZT0nJztcbiAgICAgICAgICAgICAgICBjdGFnLmFwcGVuZENoaWxkKGV0YWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXRhZy5jbGFzc0xpc3QuYWRkKCd1LWNvZGUtZXJyb3InKTtcbiAgICAgICAgICAgIGV0YWcuY2xhc3NMaXN0LmFkZChlcnJ0eXBlKTtcbiAgICAgICAgICAgIGV0YWcudGV4dENvbnRlbnQ9dGhpcy5lcnJvckFzVGV4dChtZXNzYWdlKTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgZXRhZy5jbGFzc0xpc3QuYWRkKCd1LWZhZGUnKTtcbiAgICAgICAgICAgIH0sMjAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgb25SZW5kZXIocm06IFJlbmRlcikge1xuICAgICAgICBybS5vcGVuU3RhcnQoJ2RpdicsdGhpcylcbiAgICAgICAgLmNsYXNzKCd1LWNvLWVycm9yJylcbiAgICAgICAgLmNvcHlBdHRyRXhjZXB0KHRoaXMpXG5cdFx0Lm9wZW5FbmQoKVxuXG4gICAgICAgIC5jbG9zZSgnZGl2Jyk7XG4gICAgfVxuXG59XG5cbi8qKlxuICogVGhlIGZhY3RvcnkgY2xhc3MgaXMgcmVnaXN0ZXJlZCBpbnRvIHRoZSBVSTVDb252ZXJ0ZXIsIGV4YW1wbGUgd2hlbiBpbXBvcnRlZCB2aWEgYSBzY3JpcHQgaW4gdGhlIDxoZWFkPlxuICogXG4gKiBgYGBcbiAqIDxoZWFkPlxuICAgIDxzY3JpcHQ+XG4gICAgICAgIHRoaXMuaW1wb3J0KCdkZW1vL2VsZW1lbnQvQ29FcnJvcicpO1xuICAgIDwvc2NyaXB0PlxuICA8L2hlYWQ+IFxuICogYGBgXG4gKiBcbiAqL1xuICBleHBvcnQgZGVmYXVsdCBjbGFzcyBDb0Vycm9yRmFjdG9yeSBpbXBsZW1lbnRzIENvRWxlbWVudEZhY3Rvcnkge1xuICAgIHJlZ2lzdGVyRmFjdG9yeShjdnQ6IENvbnZlcnRlcjxUaGlzPikge1xuICAgICAgICBjdnQucmVnaXN0ZXJGYWN0b3J5KCdjby1lcnJvcicsIHRoaXMpO1xuICAgIH1cblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsIGN2dDogQ29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvckVsZW1lbnQoY3Z0LCB0bik7XG4gICAgfVxuXG59XG5cbiIsImltcG9ydCB7IGlzVGV4dEFzc2V0LCByZXN0b3JlQXNzZXRJRCB9IGZyb20gXCIuLi8uLi9jb21sL0Fzc2V0XCI7XG5pbXBvcnQgeyBDb0VsZW1lbnQgfSBmcm9tIFwiLi4vLi4vY29tbC9Db0VsZW1lbnRcIjtcbmltcG9ydCB7IENvRWxlbWVudEZhY3RvcnkgfSBmcm9tIFwiLi4vLi4vY29tbC9Db0VsZW1lbnRGYWN0b3J5XCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXIgfSBmcm9tIFwiLi4vLi4vY29tbC9Db252ZXJ0ZXJcIjtcbmltcG9ydCB7IEJhc2VDb0VsZW1lbnQgfSBmcm9tIFwiLi4vLi4vY29tbC9lbGVtZW50L0Jhc2VDb0VsZW1lbnRcIjtcbmltcG9ydCB7IEltcGxlbWVudGF0aW9ucyB9IGZyb20gXCIuLi8uLi9jb21sL0ltcGxlbWVudGF0aW9uc1wiO1xuaW1wb3J0IHsgUmVuZGVyIH0gZnJvbSBcIi4uLy4uL2NvbWwvUmVuZGVyXCI7XG5pbXBvcnQgeyBUYXJnZXROb2RlLCBnZXRBdHRyLCBjdG4gfSBmcm9tIFwiLi4vLi4vY29tbC9UYXJnZXROb2RlXCI7XG5pbXBvcnQgeyBUaGlzIH0gZnJvbSBcIi4uLy4uL2NvbWwvVGhpc1wiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2hvd2Rvd25UeXBlIHtcblx0LyoqXG5cdCAqIENvbnZlcnQgTUQgdG8gaHRtbFxuXHQgKiBAcGFyYW0gZWxlbSBcblx0ICogQHBhcmFtIGNvbmZpZyBcblx0ICovXG4gICAgbWFrZUh0bWwodGV4dDpzdHJpbmcpIDpzdHJpbmc7XG5cbn1cblxuZGVjbGFyZSB2YXIgc2hvd2Rvd246IGFueTtcblxuZXhwb3J0IGludGVyZmFjZSBTaG93ZG93blNldHRpbmdzIHtcblx0XG59XG5cbi8qKlxuICogXG4gKi9cbmNsYXNzIE1hcmtkb3duRWxlbWVudCBleHRlbmRzIEJhc2VDb0VsZW1lbnQge1xuICAgIHByb3RlY3RlZCBjb252ZXJ0ZXI6U2hvd2Rvd25UeXBlO1xuXG5cbiAgICBjb25zdHJ1Y3RvcihjdnQ6Q29udmVydGVyPFRoaXM+LHRuOlRhcmdldE5vZGUpIHtcbiAgICAgICBzdXBlcihjdnQsdG4pO1xuXG4gICAgfVxuXG4gICBcblxuXG4gICAgb25SZW5kZXIocm06IFJlbmRlcikge1xuICAgICAgICBybS5vcGVuU3RhcnQoJ2RpdicsdGhpcylcblx0XHQuY2xhc3MoJ3UtbWFya2Rvd24nKVxuICAgICAgICAuY29weUF0dHJFeGNlcHQodGhpcylcblx0XHQub3BlbkVuZCgpXG5cblx0XHQuY2xvc2UoJ2RpdicpICBcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudCgpIDogc3RyaW5nIHtcbiAgICAgICAgbGV0IHRleHQ6c3RyaW5nO1xuICAgICAgICBpZiAodGhpcy5nZXRUTigpLnNub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGxldCBjbj10aGlzLmdldFROKCkuc25vZGUuY2hpbGROb2RlcztcbiAgICAgICAgICAgIHRleHQ9Jyc7XG4gICAgICAgICAgICBmb3IobGV0IGk9MDtpPGNuLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY25baV0ubm9kZVR5cGU9PU5vZGUuVEVYVF9OT0RFKVxuICAgICAgICAgICAgICAgICAgICB0ZXh0Kz1jbltpXS5ub2RlVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgdGV4dD10ZXh0LnRyaW0oKTtcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoPjApXG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TWFya2Rvd24oKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHtjdnQsdG59ID0gY3RuKHRoaXMpO1xuICAgICAgICBsZXQgc3JjID0gZ2V0QXR0cjxzdHJpbmc+KGN2dCwgdG4uc25vZGUsICdzcmMnKTtcbiAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgbGV0IGFzc2V0SWQ9cmVzdG9yZUFzc2V0SUQoc3JjKTtcblxuXG4gICAgICAgICAgICBsZXQgYXNzZXQ9SW1wbGVtZW50YXRpb25zLmdldEFzc2V0RmFjdG9yeSgpXG4gICAgICAgICAgICAgICAgLmdldChhc3NldElkKTtcbiAgICAgICAgICAgIGlmICghYXNzZXQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjby1jb2RlOiBjYW4ndCBmaW5kIGFuIGFzc2V0IHdpdGggaWQgPSR7c3JjfWApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gICAgICAgIFxuXG4gICAgICAgICAgICBpZiAoaXNUZXh0QXNzZXQoYXNzZXQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0LmdldFRleHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5nZXRDb250ZW50KCkpO1xuXG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFNldHRpbmdzKCkgOiBTaG93ZG93blNldHRpbmdze1xuICAgICAgICBjb25zdCB7Y3Z0LHRufSA9IGN0bih0aGlzKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBcbiAgICAgICAgfSAgICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgaWYgeW91IG5lZWQgdG8gYmUgY2FsbGVkIG9uIG9uQWZ0ZXJSZW5kZXJpbmcoKS4gcmVmIGlzIHRoaXMgY29udHJvbCdzIGRvbXJlZlxuICAgICAqIFxuICAgICAqIEBwYXJhbSByZWYgXG4gICAgICovXG4gICAgb25Qb3N0UmVuZGVyKHJlZjogYW55KSB7XG4gICAgICAgIGxldCBlbGVtOkVsZW1lbnQ9KHJlZiBhcyBFbGVtZW50KTtcblx0XHRpZiAoZWxlbSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnZlcnRlcilcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnZlcnRlcj1uZXcgc2hvd2Rvd24uQ29udmVydGVyKHt9KTtcblxuICAgICAgICAgICAgbGV0IGNvZGU9dGhpcy5nZXRNYXJrZG93bigpO1xuICAgICAgICAgICAgaWYgKGNvZGUpIHtcbiAgICAgICAgICAgICAgICBjb2RlLnRoZW4oKHRleHQpPT57XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaHRtbD10aGlzLmNvbnZlcnRlci5tYWtlSHRtbCh0ZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5pbm5lckhUTUw9aHRtbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBnZXRTaG93ZG93bigpIDogU2hvd2Rvd25UeXBlIHtcblx0XHRyZXR1cm4gdGhpcy5jb252ZXJ0ZXI7XG5cdH1cblxufVxuXG4vKipcbiAqIFRoZSBmYWN0b3J5IGNsYXNzIGlzIHJlZ2lzdGVyZWQgaW50byB0aGUgVUk1Q29udmVydGVyLCBleGFtcGxlIHdoZW4gaW1wb3J0ZWQgdmlhIGEgc2NyaXB0IGluIHRoZSA8aGVhZD5cbiAqIFxuICogYGBgXG4gKiA8aGVhZD5cbiAgICA8c2NyaXB0PlxuICAgICAgICB0aGlzLmltcG9ydCgnZGVtby9lbGVtZW50L0NvTWFya2Rvd24nKTtcbiAgICA8L3NjcmlwdD5cbiAgPC9oZWFkPiBcbiAqIGBgYFxuICogXG4gKi9cbiAgZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29Db2RlRmFjdG9yeSBpbXBsZW1lbnRzIENvRWxlbWVudEZhY3Rvcnkge1xuICAgIHJlZ2lzdGVyRmFjdG9yeShjdnQ6IENvbnZlcnRlcjxUaGlzPikge1xuICAgICAgICBjdnQucmVnaXN0ZXJGYWN0b3J5KCdjby1tYXJrZG93bicsIHRoaXMpO1xuICAgIH1cblxuICAgIG1ha2VDb21wb25lbnQodG46IFRhcmdldE5vZGUsIGN2dDogQ29udmVydGVyPFRoaXM+KTogQ29FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXJrZG93bkVsZW1lbnQoY3Z0LCB0bik7XG4gICAgfVxuXG59XG5cbiJdfQ==