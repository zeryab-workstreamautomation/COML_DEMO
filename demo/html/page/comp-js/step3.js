class Weather extends BaseCoElement {
    constructor(cvt,tn) {
      super(cvt,tn);
    }

    callapi(url) /*: Promise<any> */ {
      return new Promise( (resolve, reject)=> {
          $.get(url, function(data, status){
              resolve(data);
            });
      });
    }

    temperature_2m=null;
    
    fetchWeather() {
      this.callapi(`https://api.open-meteo.com/v1/forecast?latitude=${this.attr('lat')}&longitude=${this.attr('long')}&hourly=temperature_2m`)
      .then((result)=>{
        this.temperature_2m=result.hourly.temperature_2m;
        this.invalidate();
      })
    }
  
    onRender(rm) {              // rm:Render
      rm.openStart('div',this)  // <div
      .class('u-weather')       // class="u-hello"
      .openEnd();               // >

      if (this.temperature_2m)  // do we have it?
        rm.text(this.temperature_2m[0]); // yes, then done
      else 
        this.fetchWeather(); // no, so fetch async, and invalidate when us when done.

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
  