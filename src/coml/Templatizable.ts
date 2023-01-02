import { Converter } from "./Converter";
import { This } from "./This";

export interface Templatizable {
    /**
     * Temlate the document, using the contents of the node 'replaced'
     * @param replaced 
     */
    templatize(caller:Converter<This>,replaced:Node);
}

export function isTemplatizable(obj: any): obj is Templatizable {
    return typeof obj == 'object' && 'templatize' in obj;
}