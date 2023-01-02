import { Asset, AssetID, AssetType, CoElementAsset, DocumentAsset, stringifyAssetID } from "../Asset";
import { Converter } from "../Converter";
import { Implementations } from "../Implementations";
import { CoElement } from "../CoElement";
import { TargetNodeImpl } from "./TargetNodeImpl";
import { GetAttrT, This } from "../This";
import { CoElementFactory } from "../CoElementFactory";

/**
 * An asset that represents a .html file that can be parsed into a Document object.
 * 
 * The type is simply used as the subfolder in the `/public/pages' folder. It defaults to 'page'
 * The name is the file in the folder.
 */
export abstract class DocumentCoElementAsset implements Asset,DocumentAsset,CoElementAsset {
	protected assetId:AssetID;
	protected control:CoElement;

	

	constructor(assetId:AssetID) {
		this.assetId=assetId;
	}

	public getId(): AssetID {
        return this.assetId;
    }


	public getType(): AssetType {
        return this.getId().type;
    }



	public getName() {
        return this.getId().name;
	}




	/**
	 * returns the DOM document of this asset.
	 */
	public abstract getDocument() : Promise<Document>;

	/**
	 * Return this asset wrapped as a component element.
	 * This component can then be inserted into the current document.
     * The CoElement has its own This and ComlConverter.
	 */
	public asCoElement<T extends This>(root?:TargetNodeImpl,cb?:(cvt:Converter<T>)=>void,fnGetAttr?:GetAttrT) : Promise<CoElement<T>> {
		let component:CoElement<T>;
		return(
			this.getDocument()
			.then((doc)=>{
				let cvt=Implementations.createConverter();
				if (cb)	{
					cb(cvt as Converter<T>);
				}
				cvt.setGetAttrFn(fnGetAttr);
				return cvt.setDocument(doc,this.getId(),root); // this will cause the this script to be called as imports are loaded
			})
			.then((cvt)=>{
				if (!component) {
					//component=cvt.makeCoElement(cvt.getRoot());
					component=cvt.getThis() as any as CoElement<T>;
				}
				return component;	
			})
		);
	}    
}