import { CoElementFactory } from "../coml/CoElementFactory";
import { ConverterImpl } from "../coml/impl/ConverterImpl";


/**
 * A Converter for the demo. Checks for CoElementFactries in the globalThis so that elements written in the demo Apps can be loaded.
 */
export class DemoConverterImpl extends ConverterImpl {
    /**
     * Loads a js script using AMD and creates a CoElement out of the loaded module (Module.default)
     * This is then installed on this instance's element factories.
     * This function also pushes the promise onto this.loadElementPromises, which can be used
     * to wait for all ws-elements to load before rendering the template.
     * 
     * @param js 
     * @returns 
     */
    public loadMarkupFactory(js:string) : Promise<CoElementFactory> {
        if (globalThis[js] && typeof globalThis[js] == 'function') {
            return Promise.resolve(new globalThis[js] as CoElementFactory);
        }

        return super.loadMarkupFactory(js);
    }

}