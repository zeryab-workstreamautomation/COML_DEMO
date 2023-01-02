class Hello extends BaseCoElement {
    constructor(cvt,tn) {
      super(cvt,tn);
    }
  
    onRender(rm) {              // rm:Render
      rm.openStart('div',this)  // <div
      .class('u-hello')         // class="u-hello"
      .attr('draggable',true)   // draggable="true"
      .openEnd();               // >

      rm.text('Hello, World!'); // add text content

      rm.close('div');          // </div>
    }
  
  }
  
  class HelloFactory {
    registerFactory(cvt) {
        cvt.registerFactory('co-hello', this);
    }
  
    makeComponent(tn, cvt) {
        return new Hello(cvt, tn);
    }
  
  }
  
  expose(HelloFactory);
  