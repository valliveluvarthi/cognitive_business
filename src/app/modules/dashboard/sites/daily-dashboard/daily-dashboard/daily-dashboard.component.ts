import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { faArrowDown, faArrowLeft, faCalendarDay, faCheckCircle, faChevronDown, faExclamationCircle, faExclamationTriangle, faExternalLinkAlt, faPauseCircle, faPlayCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as $ from 'jquery';
import * as moment from 'moment';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import { DecisionService } from 'src/app/services/decision.service';
import { environment } from '../../../../../../environments/environment';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { ActivatedRoute, Router } from '@angular/router';

import { PATHS } from 'src/app/enums';
@Component({
  selector: 'cb-daily-dashboard',
  templateUrl: './daily-dashboard.component.html',
  styleUrls: ['./daily-dashboard.component.scss']
})
export class DailyDashboardComponent implements OnInit, OnDestroy {

  faChevronDown = faChevronDown;
  faCheckCircle = faCheckCircle;
  faExclamation = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faArrowLeft = faArrowLeft;
  faArrowDown = faArrowDown;
  faExternalLink = faExternalLinkAlt;
  faCalender = faCalendarDay;
  faTimes = faTimes;
  faPlayCircle = faPlayCircle;
  faPauseCircle = faPauseCircle;

  activeTab = 'map';
  loading = false;
  loadingTurbineData = false;
  selectedSite;
  siteData;
  turbineSignals: any = [];
  selectedTurbineSignal;
  turbineSignalData = {
    val: 0,
    type: 'text'
  };
  predictionData = [];
  turbines = [];
  selectedTurbine;
  period = [{
    key: 3,
    value: '24 Hours'
  },
  {
    key: 2,
    value: 'Past (3h) + Forecast(12h)'
  }
  ];
  selectedPeriod;
  header;
  currentHourData;

  map: any;
  markers = [];
  slider = 0;
  maxSlider = 0;
  playing = false;
  timer: any;

  forcastData = {};

  showMapChart = true;
  mapChart = {
    labels: [],
    data: [{ data: [], label: '', backgroundColor: [], borderWidth: 2 }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
            borderColor: 'rgba(0,0,0,0)'
          },
          ticks: {
            color: '#a3a3a3',
            font: {
              size: 12,
              family: 'Roboto',
              weight: 400
            },
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          grid: {
            color: "#474747",
            borderColor: 'rgba(0,0,0,0)',
            borderDash: [1, 1]
          },
          ticks: {
            color: '#a3a3a3',
            font: {
              size: 12,
              family: 'Roboto',
              weight: 400
            }
          }
        }
      }
    }
  };

  columns = [];
  rows = [];
  popup = {
    show: false,
    data: {}
  }

  layers = [];
  selectedLayer;

  selectedPopupPeriod = null;
  popupFrom = null;
  popupTo = null;

  selectedSiteSubscription = null;

  $TableHeaderScroller: any;
  $TableBodyContentScroller: any;
  $TableBodyHeaderScroller: any;
  @ViewChild('$element', { static: true }) $element: ElementRef;
  swh_max: any;
  swh_min: any;
  popup_loading: boolean = false;
  presentHour: any;

  constructor(
    private decisionService: DecisionService,
    private util: CommonUtilService,
    private route: ActivatedRoute,
    private router: Router,
    ) {
    
    mapboxgl.accessToken = environment.mapKey;
    this.layers = this.decisionService.getAvailableLayers();
    this.selectedLayer = this.layers[0];
    
  }

  ngOnInit(): void {
    this.selectedPeriod = this.period[0];
    this.selectedSiteSubscription = this.util.selectedSiteSub.subscribe( site => {
      this.selectedSite = site ? site : null;
      if(this.selectedSite){
        this.getSiteData();
      } 
      else if(this.selectedSite == null){
        this.router.navigateByUrl(PATHS.ACCESS_DENIED);
      }
    });
    this.reloadData(this.getReloadTime());
  }

  ngOnDestroy() {
    this.selectedSiteSubscription && this.selectedSiteSubscription.unsubscribe && this.selectedSiteSubscription.unsubscribe()
  }

  /* STEP: fun => reloadData 
    Definition => Recurring function
    param {}: mini => take time to recall function.
  */
    reloadData(mini) {
      if(mini) {
        setTimeout(() => {
          this.loadPageData();
          this.reloadData(this.getReloadTime());    
        },1000 * 60 * mini)
      }
    }
  
    /* STEP: fun => getReloadTime 
      Definition => Return time of next hour.
      param {}: mini => take time to recall function.
    */
    getReloadTime() {
      let currentMinute = +moment(new Date().setSeconds(0)).format('mm');
      return 61 - currentMinute;
    }
  
  // fetchData() {
  //   this.loading = true;
  //   this.decisionService.getSites().subscribe((response: any) => {
  //     if (response && response.length) {
  //       this.sites = response;
  //       this.selectedSite = response[0];
  //       this.loading = false;
  //       this.getSiteData();
  //     } else {
  //       this.loading = false;
  //       this.util.notification.error({
  //         title: 'ERROR',
  //         msg: 'Error while fetching site list.'
  //       });
  //     }
  //   }, () => {
  //     this.loading = false;
  //     this.util.notification.error({
  //       title: 'ERROR',
  //       msg: 'Error while fetching site list.'
  //     });
  //   });
  // }

  // changeSite(site) {
  //   this.selectedSite = site;
  //   this.getSiteData();
  // }

  /* STEP: fun => loadPageData 
     definition => loading a data for page
  */ 
  loadPageData() {
    this.decisionService.loadPageData(this.selectedSite.key, this.selectedTurbine.key, this.selectedPeriod.key, "daily").subscribe( async (response) =>  {
      this.turbineSignals = response.turbineData.forecastSignals;
      this.selectedTurbineSignal = this.turbineSignals[0];     
      const range = this.decisionService.getRangeByType(this.selectedPeriod.key);
      this.setHeader(range);      

      let result = await this.decisionService.setDailyRows(response, this.selectedSite, this.siteData, this.selectedTurbine.key, this.selectedPeriod.key);
      this.forcastData = result.forcastData; 
      this.columns = result.columns; 
      let indexOfNow = this.columns.indexOf("Now");
      this.swh_max = this.forcastData?.["VHM0_max"]?.[indexOfNow];
      this.swh_min = this.forcastData?.["VHM0"]?.[indexOfNow];
      let previousHour = this.predictionData[indexOfNow-1];
      let previoushour_arr = previousHour[0].split(" ");
      if(previousHour[0] === "12 PM"){
        this.presentHour = "1 PM";
      }else if(previousHour[0] === "12 AM"){
        this.presentHour = "1 AM";
      }
      else{
        this.presentHour = parseInt(previoushour_arr[0]) + 1 + " " + previoushour_arr[1];
      }
      let currentDate = moment().format("MMM Do");
      currentDate = currentDate.substring(0, currentDate.length - 2) + ", " + this.presentHour;
      
      this.rows = result.rows;
      this.setCurrentHourData(result);

      this.loading = false;
      this.setInitData();
    });
  }

  getSiteData() {
    this.loading = true;
    this.decisionService.getSiteData(this.selectedSite.key, this.selectedPeriod.key, this.selectedSite).subscribe((response: any) => {
      if (response) {
        this.predictionData = response.predictionData;
        this.maxSlider = this.predictionData.length * 2;
        const limits = {};
        if (response.signalLimits && response.signalLimits.length) {
          for (let i = 0; i < response.signalLimits.length; i++) {
            const element = response.signalLimits[i];
            limits[element.signalKey] = element.upperLimit;
          }
        }
        delete response.signalLimits;
        response.limits = limits;
        this.siteData = response;
        this.turbines = this.siteData.turbines;
        this.selectedTurbine = this.turbines[0];
        this.loading = false;
         // STEP: 1 Retrieve chart data
        this.loadPageData();
      } else {
        this.loading = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching site data.'
        });
      }
    }, () => {
      this.loading = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching site data.'
      });
    });
  }

  setHeader(range) {
    this.header = moment(range.from).format('MMM D');
  }

  setScrollers() {
    this.$TableHeaderScroller = $(this.$element.nativeElement)
      .find("#fixed_table #table_header_scroller");
    this.$TableBodyContentScroller = $(this.$element.nativeElement)
      .find("#fixed_table #table_body_content_scroller");
    this.$TableBodyHeaderScroller = $(this.$element.nativeElement)
      .find("#fixed_table #table_body_header_scroller");
  }

  // getTurbineData(silent = false) {
  //   !silent && (this.loadingTurbineData = true);
  //   this.decisionService.getTurbineData(this.selectedSite.key, this.selectedTurbine.key, this.selectedPeriod.key).subscribe((response) => {
  //     this.turbineSignals = response.forecastSignals;
  //     this.selectedTurbineSignal = this.turbineSignals[0];
  //     const data = this.decisionService.mergeForecastAndLiveData(response);
  //     this.forcastData = data;
  //     const range = this.decisionService.getRangeByType(this.selectedPeriod.key);
  //     data.range = range;
  //     data.type = this.selectedPeriod.key;
  //     data.selectedSite = this.selectedSite;
  //     data.siteData = this.siteData;
  //     this.setHeader(range);
  //     this.generateData(data);
  //     !silent && (this.loadingTurbineData = false);
  //     this.setInitData();
  //   });
  // }

  changeTurbineSignal(signal) {
    this.selectedTurbineSignal = signal;
    this.loadChartWithinMapView();
    this.setCurrentHourSignalData();
  }

  // generateData(data) {
  //   const dailyData = this.decisionService.getDailyData(data);
  //   this.rows.length = 0;
  //   this.columns.length = 0;
  //   this.setCurrentHourData(dailyData);
  //   this.rows = this.rows.concat(dailyData.rows);
  //   this.columns = this.columns.concat(dailyData.columns);
  // }

  setCurrentHourData(data) {
    const obj = {};
    for (let i = 0; i < data.columns.length; i++) {
      const element = data.columns[i];
      if (element == 'Now') {
        for (let j = 0; j < data.rows.length; j++) {
          const rowData = data.rows[j];
          obj[rowData.title] = {
            item: rowData.data[i]
          };
        }
        break;
      }
    }
    this.currentHourData = obj;
  }

  changeTurbine(turbine, silent = false) {
    this.selectedTurbine = turbine;
    this.loading = true;
    this.loadPageData();
  }

  changePeriod(period, silent = false) {
    this.selectedPeriod = period;
    this.loading = true;
    this.loadPageData();
  }

  onScroll(e) {
    this.$TableHeaderScroller.scrollLeft(e.target.scrollLeft);
    this.$TableBodyHeaderScroller.css("top", e.target.scrollTop * -1);
  }

  toggleGraph(data: any = { config: {} }) {
    let chartData = JSON.parse(JSON.stringify(data));
    chartData.config.labels = this.columns;
    if (chartData && chartData.config && chartData.config.options) {
      chartData.config.options.responsive = true;
      chartData.config.options.maintainAspectRatio = false;
    }
    this.selectedPopupPeriod = '24h';
    this.popup = {
      data: chartData,
      show: !this.popup.show
    };
  }

  setInitData() {
    setTimeout(() => {
      switch (this.activeTab) {
        case 'charts':
          this.setScrollers();
          break;
        case 'map':
          this.loadMap();
          this.loadChartWithinMapView();
          this.setCurrentHourSignalData();
          break;
      }
    }, 100);
  }

  loadChartWithinMapView() {
    if (this.selectedPeriod.key == 2) {
      this.mapChart.labels = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    }
    if (this.selectedPeriod.key == 3) {
      this.mapChart.labels = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    }
    const colors = [];
    this.mapChart.data[0].data = this.forcastData[this.selectedTurbineSignal.key];
    this.mapChart.data[0].label = this.selectedTurbineSignal.description;
    for (let i = 0; i < this.forcastData['prediction'].length; i++) {
      const element = this.forcastData['prediction'][i];
      if (element === 1) {
        colors.push('#47b250');
      } else {
        colors.push('#ffaa33');
      }
    }
    this.mapChart.data[0].backgroundColor = colors;
    this.showMapChart = false;
    setTimeout(() => {
      this.showMapChart = true;
    }, 100);
  }

  setCurrentHourSignalData() {
    const index = (this.slider - 1) / 2;
    const forecastData = this.forcastData[this.selectedTurbineSignal.key];
    this.turbineSignalData = { val: forecastData[index], type: this.selectedTurbineSignal.unit };
  }

  changeTab(tab) {
    this.activeTab = tab;
    this.setInitData();
  }

  loadMap() {
    const map = new mapboxgl.Map({
      container: 'map',
      center: [this.selectedSite.longitude, this.selectedSite.latitude],
      zoom: 12,
      style: 'mapbox://styles/mapbox/dark-v10'
    });
    map.addControl(
      new MapboxGeocoder({
        accessToken: environment.mapKey,
        mapboxgl: mapboxgl
      })
    );
    map.addControl(new mapboxgl.NavigationControl());
    this.map = map;
    this.setMarkers();
  }

  setMarkers() {
    if (!this.turbines.length) {
      return;
    }
    let prediction;
    for (let i = 0; i < this.predictionData.length; i++) {
      const element = this.predictionData[i];
      if (element[0] == 'Now') {
        prediction = element;
        this.slider = (i * 2) + 1;
        break;
      }
    }
    this.setMarkersByPrediction(prediction);
  }

  clearAllMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      const element = this.markers[i];
      element.remove();
    }
  }

  setMarkersByPrediction(prediction) {
    this.clearAllMarkers();
    for (let i = 0; i < this.turbines.length; i++) {
      const element = this.turbines[i];
      const color = prediction[1][element.key];
      const span = document.createElement('span');
      span.className = 'circle ' + color;
      const marker = new mapboxgl.Marker({
        element: span
      }).setLngLat([element.longitude, element.latitude]).addTo(this.map);
      this.markers.push(marker);
    }
  }

  onLayerChange(layer) {
    this.selectedLayer = layer;
  }

  loadMarkerBySlider() {
    const index = (this.slider - 1) / 2;
    this.setMarkersByPrediction(this.predictionData[index]);
  }

  onSliderChange(val) {
    setTimeout(() => {
      if (val == 0) {
        this.slider = 1;
      } else if (val == this.maxSlider) {
        this.slider = this.maxSlider - 1;
      } else if (val % 2 == 0) {
        this.slider = val + 1;
        return;
      }
      this.loadMarkerBySlider();
      this.setCurrentHourSignalData();
    });
  }

  toggleSlider() {
    this.playing = !this.playing;
    if (this.playing) {
      this.timer = setInterval(() => {
        const inc = this.slider + 2;
        if (inc > this.maxSlider) {
          this.slider = 1;
        } else {
          this.slider = inc;
        }
        this.loadMarkerBySlider();
        this.setCurrentHourSignalData();
      }, 1000);
    } else {
      clearInterval(this.timer);
    }
  }

  changePopupPeriod(period) {
    this.popup_loading = true;
    this.selectedPopupPeriod = period;
    let range = this.decisionService.getStartAndEndDate(this.selectedPopupPeriod, this.popupFrom, this.popupTo);
    this.decisionService.getPopupChartData(this.popup.data['signals'],range, this.selectedSite.key, this.selectedTurbine.key).subscribe( data => {
      this.popup.data['config'] = {
        ...this.popup.data['config'], 
        data: data.data,
        labels: data.labels
      };
      this.popup_loading = false;
    });
  }
  
}
