import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { forkJoin } from 'rxjs';
import * as moment from 'moment-timezone';

import { ApiConstant, API_URL } from '../enums';
import { map } from 'rxjs/operators';
import { CommonUtilService } from './common-util.service';

@Injectable({
  providedIn: 'root',
})
export class DecisionService {
  public chartsConfig = {
    options: {
      responsive: false,
      scales: {
        x: {
          grid: {
            display: false,
            borderColor: 'rgba(0,0,0,0)',
          },
          ticks: {
            color: '#a3a3a3',
            font: {
              size: 12,
              family: 'Roboto',
              weight: 400,
            },
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          grid: {
            color: '#474747',
            borderColor: 'rgba(0,0,0,0)',
            borderDash: [1, 1],
          },
          ticks: {
            color: '#a3a3a3',
            font: {
              size: 12,
              family: 'Roboto',
              weight: 400,
            },
          },
        },
      },
    },
  };

  constructor(private http: HttpClient, private util: CommonUtilService) {}

  getSites() {
    return this.http.get(ApiConstant.SITES);
  }

  getSiteData(site, type, siteData) {
    return forkJoin({
      prediction: this.getForcastBySignalKey(site, type, 'prediction'),
      confidence: this.getForcastBySignalKey(site, type, 'confidence'),
      signalLimits: this.getSiteSignalLimits(site),
      liveSignals: this.getSiteLiveSignals(site),
      forcastSignals: this.getSiteForecastSignals(site),
      turbines: this.getSiteTurbines(site),
    }).pipe(map((response) => this.mergePredectionData(response, siteData)));
  }

  getSiteSignals(site, type) {
    return forkJoin({
      prediction: this.getForcastBySignalKey(site.key, type, 'prediction'),
      confidence: this.getForcastBySignalKey(site.key, type, 'confidence'),
    }).pipe(map((response) => this.mergePredectionData(response, site)));
  }

  mergePredectionData(response, siteData) {
    const data = [];
    const { confidence, prediction } = response;
    const now = moment().tz(siteData.timezone).format('DD h A');
    for (let i = 0; i < prediction.vectors.length; i++) {
      const element = prediction.vectors[i];
      const hour = moment(element[0]).tz(siteData.timezone).format('DD h A');
      const key =
        hour == now
          ? 'Now'
          : moment(element[0]).tz(siteData.timezone).format('h A');
      const val = [];
      val.push(key);
      const obj = {};
      for (let j = 0; j < prediction.turbines.length; j++) {
        const turbine = prediction.turbines[j];
        const c = confidence.vectors[i][j + 1];
        const p = element[j + 1];
        let color = '';
        if (c < 0.7) {
          color = 'bg-yellow';
        } else {
          color = p == 1 ? 'bg-green' : 'bg-red';
        }
        obj[turbine] = color;
      }
      val.push(obj);
      data.push(val);
    }
    response.predictionData = data;
    return response;
  }

  getSiteSignalLimits(site) {
    return this.http.get(
      ApiConstant.SITE_SIGNAL_LIMITS.replace('{{siteKey}}', site)
    );
  }

  getSiteForecastSignals(site) {
    return this.http.get(
      ApiConstant.SITE_FORCAST_SIGNALS.replace('{{siteKey}}', site)
    );
  }

  getSiteLiveSignals(site) {
    return this.http.get(
      ApiConstant.SITE_LIVE_SIGNALS.replace('{{siteKey}}', site)
    );
  }

  getSiteTurbines(site) {
    return this.http.get(
      ApiConstant.SITE_TURBINES.replace('{{siteKey}}', site)
    );
  }

  changeSignalLimits(data, siteKey, limitTemplate) {
    return this.http.post(
      ApiConstant.CHANGE_SIGNAL_LIMITS.replace('{{siteKey}}', siteKey).replace(
        '{{limitTemplate}}',
        limitTemplate
      ),
      data
    );
  }

  getForcastBySignalKeyWithoutTurbines(site, range, signalKey) {
    const params: HttpParams = new HttpParams({
      fromObject: {
        dataType: 'all',
        ...range,
      },
    });
    return this.http.get(
      ApiConstant.SITE_FORECAST_SIGNAL.replace('{{siteKey}}', site).replace(
        '{{signalKey}}',
        signalKey
      ),
      { params }
    );
  }

  getForcastBySignalKey(site, type, signalKey) {
    const params: HttpParams = new HttpParams({
      fromObject: {
        dataType: 'all',
        ...this.getRangeByType(type),
      },
    });
    return this.http.get(
      ApiConstant.SITE_FORCAST_BY_SIGNAL.replace('{{siteKey}}', site).replace(
        '{{signalKey}}',
        signalKey
      ),
      { params }
    );
  }

  getTurbineData(site, turbine, type) {
    const range = this.getRangeByType(type); 
    const params: HttpParams = new HttpParams({
      fromObject: {
        dataType: 'all',
        ...range,
      },
    });
    return forkJoin({
      forecastSignals: this.getTurbineForecastSignals(params, site, turbine),
      forecast: this.getTurbineForecastData(params, site, turbine),
      live: this.getTurbineLiveData(params, site, turbine),
      lightning: this.getForcastBySignalKeyWithoutTurbines(
        site,
        range,
        'thunderstorm'
      ),
      windspeed: this.getForcastBySignalKeyWithoutTurbines(
        site,
        range,
        'windspeed_ms'
      ),
    });
  }

  mergeForecastAndLiveData(data) {
    const obj = {};
    const obj1: any = {};
    for (let i = 0; i < data.forecast.length; i++) {
      const forecastData = data.forecast[i];
      obj[forecastData.from] = forecastData;

      for (let j = 0; j < data.forecast.length; j++) {
        const liveData = data.live[j];
        const lightningData = data.lightning[j];
        const windspeedData = data.windspeed[j];
        if (liveData && forecastData.from == liveData.from) {
          obj[forecastData.from] = {
            ...obj[forecastData.from],
            ...liveData,
          };
        }
        if (lightningData && forecastData.from == lightningData[0]) {
          obj[forecastData.from] = {
            ...obj[forecastData.from],
            lightning: lightningData[1],
          };
        }
        if (windspeedData && forecastData.from == windspeedData[0]) {
          obj[forecastData.from] = {
            ...obj[forecastData.from],
            windspeed: windspeedData[1],
          };
        }
      }
      for (const key in obj[forecastData.from]) {
        if (Object.prototype.hasOwnProperty.call(obj[forecastData.from], key)) {
          const element = obj[forecastData.from][key];
          !obj1[key] && (obj1[key] = []);
          obj1[key].push(element);
        }
      }
    }
    return obj1;
  }

  getTurbineForecastData(params, site, turbine) {
    return this.http.get(
      ApiConstant.TURBINE_FORECAST.replace('{{siteKey}}', site).replace(
        '{{turbineKey}}',
        turbine
      ),
      { params }
    );
  }

  getTurbineForecastSignals(params, site, turbine) {
    return this.http.get(
      ApiConstant.TURBINE_FORECAST_SIGNALS.replace('{{siteKey}}', site).replace(
        '{{turbineKey}}',
        turbine
      )
    );
  }

  getTurbineLiveData(params, site, turbine) {
    return this.http.get(
      ApiConstant.TURBINE_LIVE.replace('{{siteKey}}', site).replace(
        '{{turbineKey}}',
        turbine
      ),
      { params }
    );
  }

  getTurbineDataBySignal(params, site, turbine, signal) {
    return this.http.get(
      ApiConstant.TURBINE_FORECAST.replace('{{siteKey}}', site).replace(
        '{{turbineKey}}',
        turbine
      ) +
        '/' +
        signal,
      { params }
    );
  }

  getISOTimeString(date) {
    return moment(date).toISOString();
  }

  getRangeByType(type) {
    let from = new Date();
    let to = new Date();
    switch (type) {
      case 1: //5 days
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() + 4);
        to.setHours(23, 59, 59, 99);
        return {
          from: this.getISOTimeString(from),
          to: this.getISOTimeString(to),
        };
        break;
      case 2: //Past (3h) + Forecast(12h)
        from.setHours(from.getHours() - 3, 0, 0, 0);
        to.setHours(to.getHours() + 12, 0, 0, 0);
        return {
          from: this.getISOTimeString(from),
          to: this.getISOTimeString(to),
        };
        break;
      case 3: //24 Hours
        from.setHours(from.getHours() - 3, 0, 0, 0);
        to.setHours(to.getHours() + 20, 59, 59, 99);
        return {
          from: this.getISOTimeString(from),
          to: this.getISOTimeString(to),
        };
        break;
    }
  }

  getGoNOGODataDaily(data) {
    const predictions = data.prediction || [];
    const stormRisk = data.lightning || [];
    const windspeed = data.windspeed || [];
    const goData = [];
    const limits = data.siteData.limits;
    for (let i = 0; i < predictions.length; i++) {
      if (
        predictions[i] > limits.prediction ||
        windspeed[i] > limits.windspeed ||
        stormRisk[i] > limits.lightning
      ) {
        goData.push('no-go');
      } else {
        goData.push('go');
      }
    }
    return goData;
  }

  getPrediction(data) {
    const goData = [];
    const limits = data.siteData.limits;
    for (let i = 0; i < data.prediction.length; i++) {
      if (data.prediction[i] > limits.prediction) {
        goData.push('no-go');
      } else {
        goData.push('go');
      }
    }
    return goData;
  }

  getStormRisk(data) {
    const riskData = [];
    const lightning = data.lightning || [];
    const limits = data.siteData.limits;
    
    for (let i = 0; i < lightning.length; i++) {
      if (lightning[i] == 0) {
        riskData.push('go');
      } else {
        riskData.push('no-go');
      }
    }
    return riskData;
  }

  getWindSpeed(data) {
    const riskData = [];
    const windspeed = data.windspeed || [];
    const limits = data.siteData.limits;
    
    for (let i = 0; i < windspeed.length; i++) {
      if (windspeed[i] > limits.windspeed) {
        riskData.push({
          data: windspeed[i],
          class: 'danger',
        });
      } else {
        riskData.push({
          data: windspeed[i],
          class: '',
        });
      }
    }
    return riskData;
  }

  gerRandomDigits(l) {
    const array = [];
    for (let i = 0; i < l; i++) {
      array.push('');
    }
    return array;
  }

  getDailyData(data, dynamicRows) {
    let columns = [];
    let rows = [];
    const now = moment().tz(data.selectedSite.timezone).format('h A');
    let nowIndex = 0;

    for (let i = 0; i < data.from.length; i++) {
      const hour = moment(data.from[i])
        .tz(data.selectedSite.timezone)
        .format('h A');
      hour == now && (nowIndex = i);
      columns.push(hour == now ? 'Now' : hour);
    }
    // rows.push({
    //   title: 'Go / No-Go',
    //   type: 'icon',
    //   nowIndex,
    //   data: [...this.getGoNOGODataDaily(data)],
    //   signals: [],
    // });
    // rows.push({
    //   title: 'WAVES output',
    //   type: 'icon',
    //   nowIndex,
    //   data: [...this.getPrediction(data)],
    //   signals: [],
    // });
    // rows.push({
    //   title: 'Storm Risk',
    //   type: 'icon',
    //   units: '',
    //   nowIndex,
    //   data: [...this.getStormRisk(data)],
    //   signals: [],
    // });
    // rows.push({
    //   title: 'Wind Speed',
    //   type: 'percentage',
    //   units: 'mph',
    //   nowIndex,
    //   data: [...this.getWindSpeed(data)],
    //   signals: [],
    // });

    dynamicRows.forEach((element) => {
      rows.push({ nowIndex, ...element });
    });
    return {
      columns,
      rows,
    };
  }

  chunkArray(array = [], chunkSize) {
    return [].concat.apply(
      [],
      array.map((elem, i) => {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  }

  getAvg(data) {
    const array = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      var total = 0;
      for (let j = 0; j < element.length; j++) {
        total += element[j];
      }
      array.push(total / element.length);
    }
    return array;
  }

  getGoNoGOData(data) {
    const predictions = this.chunkArray(data.prediction, 24);
    const avgPrediction = this.getAvg(predictions);
    const stormRisk = this.chunkArray(data.lightning, 24);
    const avgStormRisk = this.getAvg(stormRisk);
    const windspeed = this.chunkArray(data.lightning, 24);
    const avgWindspeed = this.getAvg(windspeed);
    const goData = [];
    const limits = data.siteData.limits;
    for (let i = 0; i < avgPrediction.length; i++) {
      if (
        avgPrediction[i] > limits.prediction ||
        avgWindspeed[i] > limits.windspeed ||
        avgStormRisk[i] > limits.lightning
      ) {
        goData.push('no-go');
      } else {
        goData.push('go');
      }
    }
    return goData;
  }

  getDirectionData(data, key) {
    const directions = [];
    for (let i = 0; i < data[key].length; i = i + 12) {
      directions.push(data[key][i]);
    }
    return directions;
  }

  getLabels(data, all = false) {
    const labels = [];
    if (!all) {
      for (let i = 0; i < data.from.length; i = i + 12) {
        labels.push(moment(data.from[i]).format('MMM D h A'));
      }
    } else {
      for (let i = 0; i < data.from.length; i++) {
        labels.push(moment(data.from[i]).format('MMM D h A'));
      }
    }
    return labels;
  }

  getWeeklyData(data, dynamicRows) {
    const from = moment(data.range.from);
    let columns = [];
    let rows = [];
    const numberOfColumns = data.type == 1 ? 5 : 0;
    for (let i = 0; i < numberOfColumns; i++) {
      columns.push(from.format('MMM D'));
      from.add(1, 'day');
    }
    // for (let i = 0; i < 1; i++) {
    //   rows.push({
    //     title: 'Go / No-Go',
    //     type: 'icon',
    //     data: [...this.getGoNoGOData(data)],
    //     signals: [],
    //   });
    // }

    dynamicRows.forEach((element) => {
      if (element.type === 'chart') {
        element.config = {
          ...element.config,
          // labels: this.gerRandomDigits(columns.length),
        };
        element.data = this.gerRandomDigits(columns.length);
        rows.push({ ...element });
      } else {
        rows.push({ ...element });
      }
    });
    return {
      columns,
      rows,
    };
  }

  getAvailableLayers() {
    return [
      {
        key: 'none',
        text: 'None',
      },
      {
        key: 'sig-wave-height',
        text: 'Sig. Wave Height',
        title: 'Sig. Wave Height',
      },
      {
        key: 'windspeed',
        text: 'Windspeed',
        title: 'Windspeed',
      },
      {
        key: 'wind-wave-height',
        text: 'Wind Wave Height',
        title: 'Wind Wave Height',
      },
      {
        key: 'max-wave-height',
        text: 'Max Wave Height',
        title: 'Max Wave Height',
      },
      {
        key: 'percipitation',
        text: 'Percipitation',
        title: 'Percipitation',
      },
      {
        key: 'stokes-drift',
        text: 'Stokes Drift',
        title: 'Stokes Drift',
      },
      {
        key: 'lightning',
        text: 'Lightning',
        title: 'Lightning',
      },
      {
        key: 'temperature',
        text: 'Temperature',
        title: 'Temperature',
      },
      {
        key: 'clouds',
        text: 'Clouds',
        title: 'Clouds',
      },
      {
        key: 'vessels',
        text: 'Vessels',
        title: 'Vessels',
      },
      {
        key: 'radar',
        text: 'Radar',
        title: 'Radar',
      },
      {
        key: 'tidal-gate',
        text: 'Tidal Gate',
        title: 'Tidal Gate',
      },
    ];
  }

  /* getChartRows() 
  Return chart rows 
*/
  getChartRows(site, type) {
    let url = null;
    switch (type) {
      case 'daily':
        url = ApiConstant.DAILY_SITE_CHARTS.replace('{{siteKey}}', site);
        break;
      case 'weekly':
        url = ApiConstant.WEEKLY_SITE_CHARTS.replace('{{siteKey}}', site);
        break;
      default:
        break;
    }
    return this.http.get(url);
  }

  /* getRouteData() 
    Return route data.
 
    @param {1} chartRows : chartRowsData
    @param {2} site : selected site
    @param {3} turbine : selected turbine
    @param {4} periodType : selected period 
  */
  getRouteData(url, site, turbine, type) {
    const params: HttpParams = new HttpParams({
      fromObject: {
        ...this.getRangeByType(type),
      },
    });
    return this.http.get(
      `${API_URL}${url}`
        .replace('{siteKey}', site)
        .replace('{turbineKey}', turbine),
      { params }
    );
  }

  /* addChartDataIntoChartRows() 
    Add chart data inside chart row
 
    @param {1} chartRows : chartRowsData
    @param {2} site : selected site
    @param {3} turbine : selected turbine
    @param {4} periodType : selected period
 
    return: chartRows with chart data
  */
  addChartDataIntoChartRows(chartRows, data, from) {
    chartRows.forEach((row) => {
      if (row.signals) {
        let chartData = [];
        row.signals.forEach((signal) => {
          if (data[signal.key]) {
            if (row.type === 'limit') {
              row.data = data[signal.key].map((item, index) => {
                if(signal.lowerLimit !== null){
                  if(signal.lowerLimit > +item[1]) {
                    return "go"
                  }else{
                    return "no-go"
                  }
                }
                else if(signal.upperLimit !== null){
                  if(signal.upperLimit > +item[1]) {
                    return "no-go"
                  }else{
                    return "go"
                  }
                }
              });
            }else if (row.type === 'chart') {
              let backgroundColor = signal.series.color; 
              if(signal.series.type === "bar"){
                backgroundColor = [];
              }
              let chartinfo = data[signal.key].map((item, index) => {
                if(signal.series.type === "bar"){
                  let color = signal.series.color;
                  if(signal.lowerLimit || signal.upperLimit){
                    if(signal.lowerLimit !== null){
                      if(signal.lowerLimit > +item[1]) {
                        color =  "rgb(71, 178, 80)";
                      }else{
                        color =  "rgb(255, 90, 89)";
                      }
                    }
                    else if(signal.upperLimit !== null){
                      if(signal.upperLimit > +item[1]) {
                        color =  "rgb(255, 90, 89)";
                      }else{
                        color =  "rgb(71, 178, 80)";
                      }
                    }
                  }
                  backgroundColor.push(color);
                }
                return item[1];
              });
              let chartInfo: any = {
                data: chartinfo,
                label: signal.name,
                type: signal.series.type,
                borderColor: backgroundColor,
                backgroundColor: backgroundColor,
                borderWidth: 2,
                spanGaps: false,
              };
              if (signal.series.style) {
                chartInfo.borderDash = [5, 10];
              }
              chartData.push(chartInfo);
            } else {
              row.data = data[signal.key].map((item, index) => item[1]);
            }
          }
        });
        if (row.type === 'chart') {
          row.config = {
            ...this.chartsConfig,
            data: chartData,
            labels: this.gerRandomDigits(from.length),
          };
          row.data = this.gerRandomDigits(from.length);
        }
      }
    });
    return chartRows;
  }

  /* getRowsChartData() 
    Retrieve rows chart data.
 
    @param {1} chartRows : chartRowsData
    @param {2} site : selected site
    @param {3} turbine : selected turbine
    @param {4} periodType : selected period
 
    return: chartRows with chart data
  */
  getRowsChartData(chartRows, site, turbine, periodType, from) {
    const routes: any = {};

    chartRows.forEach((row) => {
      let height = 0;

      if (row.signals) {
        row.signals.forEach((signal) => {
          if (signal.key && signal.route) {
            routes[signal.key] = this.getRouteData(
              signal.route,
              site,
              turbine,
              periodType
            );
          }
          if (row.type == 'chart') {
            height += this.calculateRowHeight(signal.name, 17, 21) + 8;
          }
        });
      }

      if (row.type == 'chart') {
        height += this.calculateRowHeight(row.title, 17, 21) + 64;
        height = height > 192 ? height : 192;
      } else {
        height += this.calculateRowHeight(row.title, 17, 19) + 32;
        height = height > 72 ? height : 72;
      }
      row.height = height;
    });

    return forkJoin(routes).pipe(
      map((response) =>
        this.addChartDataIntoChartRows(chartRows, response, from)
      )
    );
  }

  calculateRowHeight(text, textLength, height) {
    let chunks = [];
    for (
      var i = 0, charsLength = text.length;
      i < charsLength;
      i += textLength
    ) {
      chunks.push(text.substring(i, i + textLength));
    }
    return chunks.length * height;
  }
  /* STEP: fun => setDailyRows 
    Set rows for page.
    @param {1} : data => data 
    @param {2} : site => Selected site 
    @param {3} : siteData => site data 
    @param {4} : turbine => Selected turbine key 
    @param {5} : period => Selected period key 
  */
  async setWeeklyRows(response, site, siteData, turbine, period) {
    let resultSet = this.mergeForecastAndLiveData(response.turbineData);
    const range = this.getRangeByType(period);
    resultSet.range = range;
    resultSet.type = period;
    resultSet.selectedSite = site;
    resultSet.siteData = siteData;

    let dynamicRows = await this.getRowsChartData(
      response.chartData,
      site.key,
      turbine,
      period,
      resultSet.from
    ).toPromise();

    let { columns, rows } = this.getWeeklyData(resultSet, dynamicRows);

    return {
      forcastData: resultSet,
      columns: columns,
      rows: rows,
    };
  }

  /* STEP: fun => setDailyRows 
    Set rows for page.
    @param {1} : data => data 
    @param {2} : site => Selected site 
    @param {3} : siteData => site data 
    @param {4} : turbine => Selected turbine key 
    @param {5} : period => Selected period key 
  */
  async setDailyRows(data, site, siteData, turbine, period) {
    let resultSet = this.mergeForecastAndLiveData(data.turbineData);
    const range = this.getRangeByType(period);
    resultSet.range = range;
    resultSet.type = period;
    resultSet.selectedSite = site;
    resultSet.siteData = siteData;

    let dynamicRows = await this.getRowsChartData(
      data.chartData,
      site.key,
      turbine,
      period,
      resultSet.from
    ).toPromise();

    let { columns, rows } = this.getDailyData(resultSet, dynamicRows);

    return {
      forcastData: resultSet,
      columns: columns,
      rows: rows,
    };
  }

  /* STEP: fun => loadPageData 
    Retrieve all data for page.
    @param {1} : site => Selected site key 
    @param {2} : turbine => Selected turbine key 
    @param {3} : period => Selected period key 
    @param {3} : type => daily || weekly 
  */
  loadPageData(site, turbine, period, type) {
    return forkJoin({
      turbineData: this.getTurbineData(site, turbine, period),
      chartData: this.getChartRows(site, type),
    });
  }

  /* STEP: fun => getPopupChartData 
      definition : Retrieve char signal data
    */
  getPopupChartData(signals, range, site, turbine) {
    const routes: any = {};
    const params: HttpParams = new HttpParams({
      fromObject: {
        ...range,
      },
    });

    if (signals.length > 0) {
      signals.forEach((signal) => {
        if (signal.key && signal.route) {
          routes[signal.key] = this.http.get(
            `${API_URL}${signal.route}`
              .replace('{siteKey}', site)
              .replace('{turbineKey}', turbine),
            { params }
          );
        }
      });
    }
    
    return forkJoin(routes).pipe(
      map((response: any) => {
        let chartData = [];
        signals.forEach((signal) => {
          if (response[signal.key]) {
            let chartInfo: any = {
              data: response[signal.key].map((item, index) => item[1]),
              label: signal.name,
              type: signal.series.type,
              borderColor: signal.series.color,
              backgroundColor: signal.series.color,
              borderWidth: 2,
            };
            if (signal.series.style) {
              chartInfo.borderDash = [5, 10];
            }
            chartData.push(chartInfo);
          }
        });
        return chartData;
      })
    );
  }

  getStartAndEndDate(period, from, to) {
    const obj = {
      from: '',
      to: ''
    };
    switch (period) {
      case '24h':
        obj.from = moment().subtract(3, 'h').toISOString();
        obj.to = moment().add(20,'h').toISOString();
        break;
      case 'p30d':
        obj.from = moment().subtract(30, 'd').toISOString();
        obj.to = moment().toISOString();
        break;
      case 'p90d':
        obj.from = moment().subtract(90, 'd').toISOString();
        obj.to = moment().toISOString();
        break;
      case 'p360d':
        obj.from = moment().subtract(360, 'd').toISOString();
        obj.from = moment().toISOString();
        break;
      case 'custom':
        obj.from = moment(this.util.getDateString(from), 'D-M-YYYY').toISOString();
        obj.to = moment(this.util.getDateString(to), 'D-M-YYYY').toISOString();
    }
    return obj;
  }
  
}
