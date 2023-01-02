import { AssetID, TextAsset } from "../Asset";
import { Implementations } from "../Implementations";
import { DocumentCoElementAsset } from "./DocumentCoElementAsset";

/**
 * An asset that represents a .html file that can be parsed into a Document object.
 * 
 * The type is simply used as the subfolder in the `/public/pages' folder. It defaults to 'page'
 * The name is the file in the folder.
 */
export class DocumentAssetImpl extends DocumentCoElementAsset implements TextAsset {

	constructor(assetId:AssetID) {
		super(assetId)
	}

	/**
	 * Returns the raw text of this html asset.
	 * 
	 * @returns 
	 */
	public getText() : Promise<string> {
		return Implementations.getAjax().getAsset(this.assetId, undefined, 'text');
	}


	/**
	 * returns the DOM document of this asset.
	 */
	public getDocument() : Promise<Document> {
		return(
			this.getText()
			.then((text)=>{
				let parser=new DOMParser();
		
				let doc=parser.parseFromString(text,'text/html');
				return doc;
			})
		);
	}


}