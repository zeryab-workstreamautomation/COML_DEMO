import { Asset, AssetID, restoreAssetID, stringifyAssetID } from "../coml/Asset";
import { SimpleAssetFactory } from "../coml/impl/SimpleAssetFactory";

/**
 * Asset factory that returns code from a CoCode element
 */
export class FromCodeAssetFactory extends SimpleAssetFactory {

    protected added:Map<string,(assetId: string | AssetID)=>Asset>=new Map();

    protected toKey(assetId: string | AssetID) : string {
        let aid0=restoreAssetID(assetId); // not in any particular key order
        let aid={ // ordered by name, type
            name:aid0.name,
            type:aid0.type
        };
        
        // as assetIds are element ids, they cant have '.' (querySelector will treat it as a class) - so use _ as a substitute
        aid.name=aid.name.replace('_','.');
        let sid=stringifyAssetID(aid);
        return sid;
    }

    public addAsset(assetId: string | AssetID,getfn:(assetId: string | AssetID)=>Asset) {
        //console.log(`--ADDING(${sid})`);
        this.added.set(this.toKey(assetId),getfn);
    }

    public get(assetId: string | AssetID): Asset {
        let fn=this.added.get(this.toKey(assetId));
        //console.log(`--    LU(${sid})==>${(fn)?'FOUND':'BYPASS'} `);
        if (fn)
            return fn(restoreAssetID(assetId));
        return super.get(assetId);
    }

}

export function isFromCodeAssetFactory(obj: any): obj is FromCodeAssetFactory {
    return obj && typeof obj == 'object' && 'addAsset' in obj;
}
