class Weather extends BaseCoElement {
    constructor(cvt,tn) {
      super(cvt,tn);
    }

    temperature_2m=[1.1,2.2,3.3];
    
    onRender(rm) {              // rm:Render
      rm.openStart('div',this)  // <div
      .class('u-weather')       // class="u-hello"
      .openEnd();               // >

      if (this.temperature_2m)  // do we have it?
        rm.text(this.temperature_2m[0]); // yes, then done

      rm.close('div');          // </div>
    }
  
  }
  
  class WeatherFactory {
    registerFactory(cvt) {
        cvt.registerFactory('co-weather', this);
    }
  
    makeComponent(tn, cvt) {
        return new Weather(cvt, tn);
    }
  
  }
  
  expose(WeatherFactory);
  