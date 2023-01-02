import { CoElement } from "./CoElement";
import { TargetNode } from "./TargetNode";
import { Converter } from "./Converter";
import { This } from "./This";

export interface CoElementFactory {
    makeComponent(tn:TargetNode,cvt:Converter<This>) : CoElement | Promise<CoElement>;
    registerFactory(cvt:Converter<This>);
}