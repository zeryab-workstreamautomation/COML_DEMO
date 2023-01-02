import { AssetID } from "./Asset";


/**
 * An interface for caching Ajax calls in the browser.if needed, implement this interface and pass it to
 * the Ajax.ajax interface as an optional parameter and it wll check if the response already exists.
 */
export interface AjaxCache {

    /**
     * Returns the maximum item length for which a response data should be cached. If bigger than this, dont cache.
     */
    getValueSizeLimit(): number;

    /**
     * Store a result against a key
     * 
     * @param stringifiedJson The key (usually the call parameters) against which to cache
     * @param result The item to cache.
     */
    write(stringifiedJson: string, result: any);

    /**
     * Return cached data for a request
     * 
     **/ 
    read(key: string)
}

/**
 * Interface for Ajax calls
 * 
 */
export interface Ajax {

    /**
     * Returns a page's content, given a path
     * 
     * @param pathToGet 
     * @param cache 
     * @param responseDataType 
     * @returns 
     */
    //get(pathToGet: string, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text') : Promise<any>;



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
     */
    ajax(callName: string, jsonToSend: any , cache?: AjaxCache,responseDataType?:'xml'|'json'|'script'|'html'|'jsonp'|'text') : Promise<any>;


    /**
     * Given an AssetID, return its content in the specified responseDataType.
     * 
     */
    getAsset(assetId:AssetID, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text') : Promise<any>


}