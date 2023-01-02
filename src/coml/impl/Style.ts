import { AssetID, isTextAsset } from "../Asset";
import { Dependency } from "../Dependency";
import { Implementations } from "../Implementations";

/**
 * A Style is a Dependency that handles <style> and <link rel="stylesheet"> elements 
 * in a document. 
 * 
 * When any COML document attahes / detaches to the main SPA pages, its Style objects 
 * manage the reference counted style addition and removal
 */
export class Style implements Dependency {

    protected srcDoc:Document;
	protected ownerID:AssetID;
	protected targetElement:Element;
	protected cssids:string[]=[];
	protected idsBuilt:boolean=false;

   
	/**
	 * Create a Style object.
	 * 
	 * @param srcDoc : The document from whose <head> the styles are loaded.
	 * @param ownerID : A id of the owner (the asset that contains this style)
	 */
     constructor(srcDoc:Document,ownerID:AssetID) {
		this.srcDoc=srcDoc;
		this.ownerID=ownerID;
		this.targetElement=document.querySelector('head');
	}


	
	protected generateId(index:number) : string {
		let name=this.ownerID.name.toLowerCase().trim();
		if (this.ownerID.type) {
			name+='T';
			name+=this.ownerID.type.toLowerCase().trim();
		}

		return `${name.replace(/[^a-zA-Z0-9]/g, "_")}-${index}`;
	}

	

	protected getStyles() : (HTMLStyleElement|HTMLLinkElement)[] {
		let all=[];


		let found=this.srcDoc.head.children;
		for(let i=0;i<found.length;i++) {
			let e=found[i];
			let tag=e.tagName.toLowerCase();

			if (tag=='style'||(tag=='link' && (!e.getAttribute('rel') || e.getAttribute('rel')=='stylesheet')))
				all.push(e);
		}
		return all;
	}


	protected buildIDs(forId?:(style:HTMLStyleElement|HTMLLinkElement,id:string)=>any) {
		this.idsBuilt=true;
		let styles=this.getStyles();

		for(let i=0;i<styles.length;i++) {
			let style=styles[i];
			let id=style.getAttribute('id');
			if (!id) {
				id=this.generateId(i);
			}

			this.cssids.push(id); 
			if (forId)
			   forId(style,id);
		}

		
	}

	/**
     * Inserts the <style> element in `instyle` into the targetElement
     * 
     * @param instyle 
     * @param dontWaitForLinkLoad 
     * @returns 
     */
	 protected loadInlineStyle(instyle:HTMLStyleElement,id:string,clone:boolean=true,dontWaitForLinkLoad:boolean=false) : Promise<void> {
        return new Promise((resolve, reject) => {
            let style = (clone) ? instyle.cloneNode(true) as HTMLStyleElement:instyle;
			style.setAttribute('id',id);
			style.setAttribute('data-refcount','1');
            if( !dontWaitForLinkLoad ){
                style.onload = function() { 
                    resolve(); 
                    //console.log('style has loaded - id='+id); 
                };
            }
        
			
            this.targetElement.appendChild(style);
			if (dontWaitForLinkLoad)
            	resolve();
        });
    }


	/**
     * Loads a css link by using GetPublicFile to load  the link, attached it to the <styles> elements of the SPA
     * and returns the promise that on reolution will indicate that the css has loaded.
     * 
     * @param link 
     * @param id 
     * @returns 
     */
	 protected loadCSSLink(elem:HTMLLinkElement,id:string) : Promise<void> {
		let href=elem.getAttribute('href');
		if (!href) {
			console.warn(`Style - no 'href' in <link> element`);
			return;
		}

		let asset=Implementations
		.getAssetFactory()
		.get(href);

		if (!isTextAsset(asset))	{
			console.warn(`Style - 'href' ${href} is not a text asset`);
			return;
		}

		return(
			asset.getText()
			.then((csstext)=>{
				let css = document.createElement('style');
				css.setAttribute('type','text/css');
				css.appendChild(document.createTextNode(csstext));    
				return this.loadInlineStyle(css,id,false);            
			})
		);
    }

	protected loadStyle(elem:HTMLStyleElement|HTMLLinkElement,id:string) : Promise<void> {
		if (elem.tagName.toLowerCase()=='style')
			return this.loadInlineStyle(elem,id);
		else 
			return this.loadCSSLink(elem as HTMLLinkElement,id);
	} 

	/**
	 * Copies all <style> and <link type="stylesheet"> elements from the src DOM to the target element.
	 * Returns a promise that resolves when all styles are loaded.
	 */
	protected copyStylesToTarget() : Promise<any> {
		let all:Promise<any>[]=[];
		this.buildIDs((style,id)=>{
			let prom=this.loadStyle(style,id);
			if (prom)
				all.push(prom);
		})

		return Promise.all(all);
	}

	protected checkIds() {
		if (!this.idsBuilt)
			this.buildIDs();
	}

	
    /////////////////////////////////////////////////////////////////////////
    // Dependency
    /////////////////////////////////////////////////////////////////////////

    getId(): string {
		this.checkIds();
		if (this.cssids.length>0)
			return this.cssids[0];
		return this.generateId(0);
    }

    getRefCount(): number {
		this.checkIds();
        if (this.cssids.length>0) {
            let st=document.querySelector(`style#${this.cssids[0]}`);
            if (st) 
                return Number.parseInt(st.getAttribute('data-refcount'))
        }
    }

    updateRefCount(increment: number) {
		this.checkIds();
        this.cssids.forEach((id)=>{
            let st=document.querySelector(`style#${id}`);
            if (st) {
                let cnt=Number.parseInt(st.getAttribute('data-refcount'));
                st.setAttribute('data-refcount',(cnt+increment).toFixed(0));
            }
        })
    }

    attach(): Promise<any> {
        return this.copyStylesToTarget();
    }
    
    detach() {
		this.checkIds();
        this.cssids.forEach((id)=>{
            let st=document.querySelector(`style#${id}`);
            if (st) {
                st.remove();
            }
        })
    }


}