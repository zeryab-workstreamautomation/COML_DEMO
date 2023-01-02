class Weather extends BaseCoElement {
  constructor(cvt, tn) {
    super(cvt, tn);
  }

  forget() {
    this.fetchWeather();
  }

  callapi(url) /*: Promise<any> */ {
    return new Promise((resolve, reject) => {
      $.get(url, function (data, status) {
        resolve(data);
      });
    });
  }

  temperature_2m = null;

  fetchWeather() {
    this.callapi(`https://api.open-meteo.com/v1/forecast?latitude=${this.attr('lat')}&longitude=${this.attr('long')}&hourly=temperature_2m`)
      .then((result) => {
        this.temperature_2m = result.hourly.temperature_2m;
        this.invalidate();
      })
  }

  onRender(rm) {              // rm:Render
    rm.openStart('div', this)  // <div
      .class('u-weather')       // class="u-hello"
      .openEnd();               // >

    if (this.temperature_2m) { // do we have it?
      for (let i = 0; i < Math.min(this.temperature_2m.length,20); i++) {
        rm.renderChildren(this, i, {
          'co-temperature': { temp: this.temperature_2m[i] }
        });
      }
    }
    else  
      this.fetchWeather(); // no, so fetch async, and invalidate us when we have it.

    rm.close('div');          // </div>
  }

}

class Temperature extends BaseCoElement {
  constructor(cvt, tn) {
    super(cvt, tn);
  }

  onRender(rm) {
    rm.openStart('div', this)
      .class('u-temperature')
      .openEnd();

    let temp = this.params().temp;

    if (temp) {
      rm.text(temp);
    }

    rm.close('div');
  }

}

class WeatherFactory {
  registerFactory(cvt) {
    cvt.registerFactory('co-weather', this);
    cvt.registerFactory('co-temperature', this);
  }

  makeComponent(tn, cvt) {
    switch (tn.snode.tagName.toLowerCase()) {
      case 'co-weather': return new Weather(cvt, tn);
      case 'co-temperature': return new Temperature(cvt, tn);
    }

  }

}

expose(WeatherFactory);
