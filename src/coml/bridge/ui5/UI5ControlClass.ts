let DomRenderer = {
    apiVersion : 2, // see https://stackoverflow.com/questions/36351694/writing-sapui5-control-renderer-in-sap-ui-define-style
    render : function(oRM, oControl){
		if (oControl.options.onRender) {
			oControl.options.onRender(oRM,oControl);
		}
	}
}

/**
 * A Raw JavaScript object that can be used to call the ui5 control's 'extend' function.
 * This will create a class in the global area.
 * You can then subclass this class to provide your render functionality via the init options.
 */
let UI5Control= {

    initOptions () {
        this.options= {
            onRender:undefined,
            onPostRender:undefined
          };
    },

    setControlOptions(options) {
        if (!this.options){
            this.initOptions();
        }
        Object.assign(this.options,options);
    },

    setKeyValue(key,value) {
        if (!this.options){
            this.initOptions();
        }
        this.options[key]=value;
    },

    getKeyValue(key) {
        if (this.options && this.options[key])
            return this.options[key];
    },

    removeKey(key) {
        if (this.options && this.options[key])
            delete this.options[key];
    },

    onAfterRendering (evt) {
        if (evt) {
            let ref = evt.srcControl.getDomRef();
            if (ref) {
                if (evt.srcControl.options.onPostRender) {
                    evt.srcControl.options.onPostRender(ref);
                }
            } else {
                //console.log('onAfterRendering ref is null')
            }
        }
    },

    onBeforeRendering (evt) {
        if (evt.srcControl.options.onPreRender) {
            evt.srcControl.options.onPreRender();
        }
    },


    init() {
        this.initOptions();
    },

    exit() {
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
export function extendUI5(classname:string) : any {
    return (sap.ui.core.Control as any).extend(classname,Object.assign({},UI5Control));
}