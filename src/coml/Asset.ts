import { CoElement } from "./CoElement";
import { Converter } from "./Converter";
import { TargetNodeImpl } from "./impl/TargetNodeImpl";
import { GetAttrT, This } from "./This";

/**
 * The types of all Assets.
 */
export enum AssetType {
	image = 'image',
	page = 'page',
	frame = 'frame',
	look='look',
	looksub='looksub',
	form='form',
	indexpage='indexpage',
	palette='palette',
	other='other'
}

/**
 * Each asset is uniquely identified by an AssetID. Its an opaque object.
 */
export interface AssetID {
	type:AssetType;
	name:string;
	project?:string; 
}

export function isAssetId(obj: any): obj is AssetID {
    return obj && typeof obj == 'object' && 'type' in obj && 'name' in obj;
}

/**
 * Convert an assetid to a string suitable for setting on an Element attribute.
 * 
 * @param id 
 * @returns 
 */
export function stringifyAssetID(id:AssetID|string) : string {
	if (!id)
		return '';
	if (typeof id=='string')
		return id;
	return JSON.stringify(id).replace(/"/g,"'");
}

/**
 * Recover an AssetID from a string returned by stringifyAssetID. 
 * 
 * This function is safe to call wherever an AssetID|string is specified, as it takes account of both to return an AssetID.
 * 
 * @param stringifiedID a stringigified assetID, or an actual asetId or null.
 * @returns null if null supplied, else the restored AssetID
 */
export function restoreAssetID(stringifiedIDorName:string|AssetID,typeIfNameOnly:AssetType=AssetType.page) : AssetID {
	if (!stringifiedIDorName)
		return;
	if (typeof stringifiedIDorName =='string') {
		if (stringifiedIDorName.indexOf('{')<0)
			stringifiedIDorName=`{'type':'${typeIfNameOnly}','name':'${stringifiedIDorName}'}`;
		return JSON.parse(stringifiedIDorName.replace(/'/g,'"'));
	}
	return stringifiedIDorName;
}

/**
 * Compares two assets ids for equality. The ids can be an AssetId, a stringified AssetId, or just an asset name, for example 'mypage.html'.
 * Each asset is converted to an AssetId object before comparison.
 * 
 * @param id1 
 * @param id2 
 * @param typeIfNameOnly If an id comprises a name only, use this type to create the AssetId for comparison.
 */
export function areAssetIdsEqual(id1:AssetID|string,id2:AssetID|string,typeIfNameOnly:AssetType=AssetType.page) : boolean {
	if (!id1 || !id2)
		return false;
		
	let sid1=(typeof id1=='string') ? restoreAssetID(id1,typeIfNameOnly):id1;
	let sid2=(typeof id2=='string') ? restoreAssetID(id2,typeIfNameOnly):id2;

	return sid1.type===sid2.type && sid1.name===sid2.name;
}



/**
 * An Asset is a resource that can be used inside a WS-Element html page. The resource is 
 * rendered as a <ws-element> inside a Document - the source dom. 
 * 
 * Examples of assets are forms, charts, inboxes, search boxes, images
 * etc. - anything that is built inside WRA and can be used as a part of a page.
 * 
 * The Asset interface exposes the asset through the `getDocument()` function, which returns a source DOM in which the
 * asset's ws-element is contained.
 */
export interface Asset {

	/**
	 * Return the unique id of an asset.
	 * Given an id, the AssetFactory can recreate this asset.
	 */
	getId() : AssetID;

	
}

/**
 * An Asset that can return a document
 */
export interface DocumentAsset extends Asset {
	/**
	 * returns the DOM document of this asset.
	 */
	getDocument() : Promise<Document>;

	
}

export function isDocumentAsset(obj: any): obj is DocumentAsset {
    return typeof obj == 'object' && 'getDocument' in obj;
}


/**
 * An Asset that can return a text
 */
 export interface TextAsset extends Asset {
	/**
	 * returns the text of this asset.
	 */
	getText() : Promise<string>;

	
}

export function isTextAsset(obj: any): obj is TextAsset {
    return typeof obj == 'object' && 'getText' in obj;
}

/**
 * An Asset that can represent itself as a CoElement
 */
 export interface CoElementAsset extends Asset {

	/**
	 * Return this asset wrapped as a CoElement.
	 * <p>
	 * @param attachmentNode An optional node that serves to represent the asset's parent tnode in the window.document
	 */
	asCoElement<T extends This>(attachmentNode?:TargetNodeImpl,cb?:(cvt:Converter<T>)=>void,fnGetAttr?:GetAttrT) : Promise<CoElement<T>>;
	
}

export function isCoElementAsset(obj: any): obj is CoElementAsset {
    return typeof obj == 'object' && 'asCoElement' in obj;
}




/**
 * An inyerface that finds and creates assets.
 */
export interface AssetFactory {
	/**
	 * Returns true if this asset factory handles this id (based on type)
	 * 
	 * @param id 
	 */
	isFor(id:AssetID) : boolean;

	/**
	 * Lists assets of the given type.
	 * 
	 * @param types 
	 * @param project 
	 */
	list(types:AssetType[],project?:string) : Promise<Asset[]>;

	/**
	 * Fetch the asset given its id.
	 * 
	 * @param assetId 
	 */
	get(assetId:AssetID|string) : Asset;
}
