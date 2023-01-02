import { Converter } from "../coml/Converter";
import BaseThis from "../coml/impl/BaseThis";
import { RenderImpl } from "../coml/impl/RenderImpl";
import { This } from "../coml/This";

/**
 * Demonstrates how to use a Typescript object as the 'this' of an html page.
 * 
```html
<html>
<head>
    <meta name="thisclass" content="demo/MyPage">
  
</head>

<body class="demo-base">
    <h2>How to use a Typescript class instead of an inline script</h2>
</body>

</html>
```
 */
export default class MyPage extends BaseThis {
    protected address='wa';
    
    constructor(cvt:Converter<MyPage>,stateFrom?:BaseThis) {
        super(cvt,stateFrom)
        console.log(`Constructed`);

        let rm=new RenderImpl(null,null);
        console.log(rm);
    }

    showClick(ev:MouseEvent) {
        console.log('Here 2='+(this as any).name);
    }
}