import { Asset, AssetFactory, AssetID, AssetType, restoreAssetID } from "../Asset";
import { DocumentAssetImpl } from "./DocumentAssetImpl";

/**
 * An asset factory implementation that simply fetches an asset as an html file using the 
 * GetPublicFile json call implemented in the SampleServer.
 */
export class SimpleAssetFactory implements AssetFactory {


    public isFor(id: AssetID): boolean {
        return true;
    }

    public list(types: AssetType[], project?: string): Promise<Asset[]> {
        return null;
    }

    public get(assetId: string | AssetID): Asset {
        return new DocumentAssetImpl(restoreAssetID(assetId));
    }

}