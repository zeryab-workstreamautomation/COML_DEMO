import { Ajax, AjaxCache } from "../Ajax";
import { AssetID, isAssetId } from "../Asset";

declare var jQuery: any;

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
export class JQueryAjax implements Ajax {

    /**
     * returns the base path of the URL of the current window
     * 
     * see https://stackoverflow.com/questions/406192/get-current-url-with-jquery
     */
    protected getBasePath(): string {
        // (window.location.pathname is something like : '/WRA_V2/public/samples/sql.html'
        // will return '/WRA_V2/'

        let location = window.location;
        if ((window as any)._parentLocation) { // if we are part of an iframe, use the _parentLocation set on us by our parent
            location = (window as any)._parentLocation;
        }
        if (location && location.pathname) {
            let p = location.pathname;

            if (typeof p === 'string' && p.length > 0) {
                p = p.substring(1);
                let dot = p.indexOf('/');
                if (dot > 0)
                    return '/' + p.substring(0, dot + 1);
            }
        }

        return '/';
    }

    protected onNotLoggedInError() {
    }

    protected ajaxAsPromise(getorpost:'GET'|'POST',headers:any,url:string,contentType:string,cache?: AjaxCache,responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text',postdata?:string) : Promise<any> {
        return new Promise((resolve, reject) => {
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

                success: (result, status, jqXHR) => {
                    try {
                        // WRA will serialize an exception and send it to us.
                        // if the responseDataType was 'json' then jquery's already parsed the result, so we can check the javascript object
                        // if not (for example the responseDataType was string), we must parse it sourselves efficiently

                        let err = result;
                        if (responseDataType != 'json' && typeof result == 'string') {
                            if (result.startsWith('{"EXCEPTION')) {
                                try {
                                    err = JSON.parse(result);
                                } catch (x) {
                                }
                            }
                        }
                        if (err.ERROR || err.EXCEPTION) {
                            if (err.xid) {
                                // this is a JSONException, so pass it as a whole
                                reject(err);
                            } else {
                                reject((err.ERROR) ? err.ERROR : err.EXCEPTION);
                            }
                        }
                        else {
                            //console.log({stringifiedJson:stringifiedJson,length:jqXHR.responseText.length });
                            if (result && result.invalidSessionKey) {
                                console.error("SESSION ERROR:" + result.invalidSessionKey);
                                this.onNotLoggedInError();
                                reject(result.invalidSessionKey);
                            } else {
                                if (postdata && cache && jqXHR.responseText.length < cache.getValueSizeLimit()) {
                                    // store in the cache
                                    cache.write(postdata, result);
                                }
                                resolve(result);
                            }
                        }
                    } finally {
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {

                    let serr = `[${(textStatus) ? textStatus : ''}]:${(errorThrown && errorThrown.message) ? errorThrown.message : ''}`;
                    //(textStatus && (typeof textStatus==='string')) ? textStatus:(errorThrown && (typeof errorThrown==='string')) ? errorThrown:'An error occurred';

                    reject(serr);//,errorThrown);
                }
            });
        });
    }
    
    protected ajaxToServer(baseUrl: string, callName: string, stringifiedJson: string, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text'): Promise<any> {
        // create an id
        //let ajax_time = window.performance.now();
        try {

           return this.ajaxAsPromise(
                                'POST',
                                {'call': callName},
                                baseUrl,
                                'application/json',
                                cache,
                                responseDataType,
                                stringifiedJson
                            )
        } catch (error) {
            throw error;
        }
    }


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
    public ajax(callName: string, jsonToSend: any, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text') {
        let baseUrl = this.getBasePath() + 'jsoncall/' + callName;


        let stringifiedJson = JSON.stringify(jsonToSend);
        console.warn(stringifiedJson);
        if (cache) {
            // check if the cache has a result, and if so, use it:
            let cachedResult = cache.read(stringifiedJson);
            if (cachedResult) {
                //console.warn('CACHE HIT on ['+stringifiedJson+']');
                return Promise.resolve(cachedResult);
            }
        }


        return (
            this.ajaxToServer(baseUrl, callName, stringifiedJson, cache, responseDataType)
            .then((result) => {
                return result;
            })
        );

    } 

    protected assetsFolder(assetId:AssetID) : string {
        return this.getBasePath()+'html/';
    }

    /**
     * Given an AssetID, return its content in the specified responseDataType.
     * 
     */
    public getAsset(assetId:AssetID, cache?: AjaxCache, responseDataType?: 'xml' | 'json' | 'script' | 'html' | 'jsonp' | 'text') : Promise<any> {
        let url=this.assetsFolder(assetId)+`${assetId.type}/${assetId.name}`;

        return this.ajaxAsPromise(
            'GET',
            undefined,
            url,
            'application/json',
            cache,
            responseDataType
        )
    }

}