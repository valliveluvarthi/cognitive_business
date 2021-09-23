import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import {
  faArrowDown,
  faArrowLeft,
  faCalendarDay,
  faCheckCircle,
  faChevronDown,
  faExclamationCircle,
  faExclamationTriangle,
  faExternalLinkAlt,
  faPauseCircle,
  faPlayCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import * as $ from 'jquery';
import * as moment from 'moment';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import { CommonUtilService } from 'src/app/services/common-util.service';
import { environment } from '../../../../../../environments/environment';
import { DecisionService } from 'src/app/services/decision.service';
import { Router } from '@angular/router';
import { PATHS } from 'src/app/enums';
import { ChartOptions } from 'chart.js';

export interface tSignalObj {
  description: string;
  unit: string;
  val: any;
}
@Component({
  selector: 'cb-weekly-dashboard',
  templateUrl: './weekly-dashboard.component.html',
  styleUrls: ['./weekly-dashboard.component.scss'],
})
export class WeeklyDashboardComponent implements OnInit, OnDestroy {
  gonogo: any;
  @HostListener('window:beforeunload ', ['$event'])
  unloadHandler(event) {
    localStorage.setItem("activeTab", "");
  }
  SIGNAL_DATA: tSignalObj[] = [];
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
    type: 'text',
  };
  predictionData = [];
  turbines = [];
  selectedTurbine;
  period = [
    {
      key: 1,
      value: '5 days',
    },
  ];
  selectedPeriod;
  header;

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
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              let date: any = moment(this.forcastData['from'][context.dataIndex]).format('MMM Do, h:mm');
              return context.dataset.label + " : " + context.dataset.data[context.dataIndex] + ' on ' + date;
            }
          }
        }
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: true,
            borderColor: 'rgba(0,0,0,0)',
          },
          ticks: {
            display: true,
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
  cChart: ChartOptions = {
    responsive: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let date: any = moment(this.forcastData['from'][context.dataIndex]).format('MMM Do, h:mm');
            return context.dataset.label + " : " + context.dataset.data[context.dataIndex] + ' on ' + date;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          borderColor: 'rgba(0,0,0,0)',
        },
        ticks: {
          display: true,
          color: '#a3a3a3',
          font: {
            size: 12,
            family: 'Roboto',
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
          mirror : true,
          color: '#a3a3a3',
          font: {
            size: 12,
            family: 'Roboto',
          },
        },
      },
    }
  };

  columns = [];
  rows = [];
  popup = {
    show: false,
    data: {},
  };

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
  presentHour: string;
  currentNowIndex:number = -1;

  constructor(
    private decisionService: DecisionService,
    private util: CommonUtilService,
    private router: Router,
  ) {
    mapboxgl.accessToken = environment.mapKey;
    this.layers = this.decisionService.getAvailableLayers();
    this.selectedLayer = this.layers[0];
  }

  ngOnInit(): void {
    this.selectedPeriod = this.period[0];
    if (localStorage.getItem("activeTab") != "" && localStorage.getItem("activeTab") != null) {
      this.activeTab = localStorage.getItem("activeTab");
    }
    this.selectedSiteSubscription = this.util.selectedSiteSub.subscribe(site => {
      this.selectedSite = site ? site : null;
      if (this.selectedSite && this.selectedSite !== "init") {
        this.getSiteData();
      }
      else if (this.selectedSite == null) {
        this.router.navigateByUrl(PATHS.ACCESS_DENIED);
      }
    });
  }

  ngOnDestroy() {
    this.selectedSiteSubscription && this.selectedSiteSubscription.unsubscribe && this.selectedSiteSubscription.unsubscribe()
  }

  // fetchData() {
  //   this.loading = true;
  //   this.decisionService.getSites().subscribe(
  //     (response: any) => {
  //       if (response && response.length) {
  //         this.sites = response;
  //         this.selectedSite = response[0];
  //         this.loading = false;
  //         this.getSiteData();
  //       } else {
  //         this.loading = false;
  //         this.util.notification.error({
  //           title: 'ERROR',
  //           msg: 'Error while fetching site list.',
  //         });
  //       }
  //     },
  //     () => {
  //       this.loading = false;
  //       this.util.notification.error({
  //         title: 'ERROR',
  //         msg: 'Error while fetching site list.',
  //       });
  //     }
  //   );
  // }

  // changeSite(site) {
  //   this.selectedSite = site;
  //   this.getSiteData();
  // }

  /* STEP: fun => loadPageData 
     definition => loading a data for page
  */
  loadPageData() {
    this.decisionService
      .loadPageData(
        this.selectedSite.key,
        this.selectedTurbine.key,
        this.selectedPeriod.key,
        'weekly'
      )
      .subscribe(async (response) => {
        this.turbineSignals = response.turbineData.forecastSignals;
        this.selectedTurbineSignal = this.turbineSignals[0];
        const range = this.decisionService.getRangeByType(
          this.selectedPeriod.key
        );
        this.setHeader(range);

        let result = await this.decisionService.setWeeklyRows(
          response,
          this.selectedSite,
          this.siteData,
          this.selectedTurbine.key,
          this.selectedPeriod.key
        );
        this.forcastData = result.forcastData;
        this.columns = result.columns;
        this.rows = result.rows;
        let currentDate = moment().format("MMM Do");
        currentDate = currentDate.substring(0, currentDate.length - 2);
        let indexOfCurrentDay = this.columns.indexOf(currentDate);
        let currentHour = moment().hours();
        this.presentHour = moment().tz(this.selectedSite.timezone).format('LT');

        let currentISODate = moment().tz(this.selectedSite.timezone).set({hour:0,minute:0,second:0,millisecond:0}).toISOString(); 
        let hourarray = this.presentHour.split(" ");
        let hour = hourarray[0].split(":");
        this.presentHour = hour[0] + " " + hourarray[1];
        
        let entriesPerDay = 24;
        let index = (indexOfCurrentDay * entriesPerDay) + (currentHour - 1);
        this.swh_max = this.forcastData?.["VHM0_max"]?.[index];
        this.swh_min = this.forcastData?.["VHM0"]?.[index];
        console.log(this.rows);
        for (let i = 0; i < this.rows.length; i++) {
          if (this.rows[i].type === 'chart') {
            this.rows[i].config.labels = [];
            for (let j = 0; j < this.forcastData['from'].length; j++) {
              const item = this.forcastData['from'][j];
              if(item === currentISODate){
                this.currentNowIndex = j;
              }
              let currentDateTime = moment(this.forcastData['from'][j]).format('MMM-D, h A');
              currentDateTime = currentDateTime.substr(3);

              let currentMonth: any = moment(this.forcastData['from'][j]).month();
              currentMonth = currentMonth + 1;
              currentMonth = currentMonth.toString();

              currentDateTime = currentMonth + currentDateTime;
              this.rows[i].config.labels.push(currentDateTime);
            }
          }
        }
        for (let i = 0; i < this.rows.length; i++) {
          if (this.rows[i].title === 'Go / No-Go') {
           this.gonogo = this.rows[i].data[this.currentNowIndex];
          }
        }

        this.loading = false;
        this.setInitData();
      });
  }

  getSiteData() {
    this.loading = true;
    this.decisionService
      .getSiteData(
        this.selectedSite.key,
        this.selectedPeriod.key,
        this.selectedSite
      )
      .subscribe(
        (response: any) => {
          if (response) {
            this.predictionData = response.predictionData;
            this.maxSlider = this.predictionData.length + 1;
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
            // STEP: Retrieve chart data
            this.loadPageData();
          } else {
            this.loading = false;
            this.util.notification.error({
              title: 'ERROR',
              msg: 'Error while fetching site data.',
            });
          }
        },
        () => {
          this.loading = false;
          this.util.notification.error({
            title: 'ERROR',
            msg: 'Error while fetching site data.',
          });
        }
      );
  }

  setHeader(range) {
    const date = [];
    const from = moment(range.from);
    date.push(from.format('MMM D') + ' - ');
    date.push(
      this.selectedPeriod.key == 1 ? from.add(4, 'days').format('MMM D') : ''
    );
    this.header = date.join('');
  }

  setScrollers() {
    this.$TableHeaderScroller = $(this.$element.nativeElement).find(
      '#fixed_table #table_header_scroller'
    );
    this.$TableBodyContentScroller = $(this.$element.nativeElement).find(
      '#fixed_table #table_body_content_scroller'
    );
    this.$TableBodyHeaderScroller = $(this.$element.nativeElement).find(
      '#fixed_table #table_body_header_scroller'
    );
  }

  // getTurbineData(silent = false) {
  //   !silent && (this.loadingTurbineData = true);
  //   this.decisionService
  //     .getTurbineData(
  //       this.selectedSite.key,
  //       this.selectedTurbine.key,
  //       this.selectedPeriod.key
  //     )
  //     .subscribe((response) => {
  //       this.turbineSignals = response.forecastSignals;
  //       this.selectedTurbineSignal = this.turbineSignals[0];
  //       const data = this.decisionService.mergeForecastAndLiveData(response);
  //       this.forcastData = data;
  //       const range = this.decisionService.getRangeByType(
  //         this.selectedPeriod.key
  //       );
  //       data.range = range;
  //       data.type = this.selectedPeriod.key;
  //       data.selectedSite = this.selectedSite;
  //       data.siteData = this.siteData;
  //       this.setHeader(range);
  //       this.generateData(data);
  //       !silent && (this.loadingTurbineData = false);
  //       this.setInitData();
  //     });
  // }

  changeTurbineSignal(signal) {
    this.selectedTurbineSignal = signal;
    this.loadChartWithinMapView();
    this.setCurrentHourSignalData();
  }

  // generateData(data) {
  //   const weeklyData = this.decisionService.getWeeklyData(data);
  //   this.rows.length = 0;
  //   this.columns.length = 0;
  //   this.rows = this.rows.concat(weeklyData.rows);
  //   this.columns = this.columns.concat(weeklyData.columns);
  // }

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
    this.$TableBodyHeaderScroller.css('top', e.target.scrollTop * -1);
  }

  toggleGraph(data: any = { config: {} }) {
    let chartData = JSON.parse(JSON.stringify(data));
    let modifiedlabels = [];
    for (let i = 0; i < this.forcastData['from'].length; i++) {
      let currentDateTime = moment(this.forcastData['from'][i]).format('MMM D, h A');
      modifiedlabels.push(currentDateTime);
    }
    chartData.config.labels = modifiedlabels;
    if (chartData && chartData.config && chartData.config.options) {
      chartData.config.options.responsive = true;
      chartData.config.options.maintainAspectRatio = false;
    }
    this.popup = {
      data: chartData,
      show: !this.popup.show,
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
    this.mapChart.labels = [];
    if (this.selectedPeriod.key == 1) {
      // for (let i = 0; i < 120; i++) {
      //   this.mapChart.labels.push('');
      // }
      for (let i = 0; i < this.forcastData['from'].length; i++) {
        let currentDateTime = moment(this.forcastData['from'][i]).format('MMM D, h A');
        this.mapChart.labels.push(currentDateTime);
      }
    }
    const colors = [];
    //STEP: set color
    this.mapChart.data[0].data =
      this.forcastData[this.selectedTurbineSignal.key];
    this.mapChart.data[0].label = this.selectedTurbineSignal.description;
    for(let i=0; i<this.predictionData.length; i++){
      let element = this.predictionData[i][1];
      if(element[this.selectedTurbine.key] === "bg-red"){
        colors.push('rgb(255, 90, 89)');
      }
      else if(element[this.selectedTurbine.key] === "bg-green"){
        colors.push('rgb(71, 178, 80)');
      }
    }
    this.mapChart.data[0].backgroundColor = colors;
    this.showMapChart = false;
    setTimeout(() => {
      this.showMapChart = true;
    }, 100);
  }

  setCurrentHourSignalData() {
    const forecastData = this.forcastData[this.selectedTurbineSignal.key];
    this.turbineSignalData = {
      val: forecastData[this.slider],
      type: this.selectedTurbineSignal.unit,
    };
    this.SIGNAL_DATA = [];
    this.turbineSignals.forEach(element => {
      let signal: tSignalObj = {
        description: element['description'],
        unit: element['unit'],
        val: parseFloat(this.forcastData[element.key][this.slider]).toFixed(2)
      }
      this.SIGNAL_DATA.push(signal);
    });
  }

  changeTab(tab) {
    this.popup.show = false;
    this.activeTab = tab;
    this.setInitData();
  }
  redirectTo() {
    localStorage.setItem("activeTab", this.activeTab);
    let current_url = this.router.url;
    current_url = current_url.replace("weekly-dashboard", PATHS.DAILY_DASHBOARD);
    this.router.navigateByUrl(current_url);
  }

  loadMap() {
    const map = new mapboxgl.Map({
      container: 'map',
      center: [this.selectedSite.longitude, this.selectedSite.latitude],
      zoom: 12,
      style: 'mapbox://styles/mapbox/dark-v10',
    });
    map.addControl(
      new MapboxGeocoder({
        accessToken: environment.mapKey,
        mapboxgl: mapboxgl,
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
        this.slider = i;
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
      span.setAttribute("title", element.key);
      span.addEventListener("click", () => {
        this.changeTurbine(element);
      });
      const marker = new mapboxgl.Marker({
        element: span,
      })
        .setLngLat([element.longitude, element.latitude])
        .addTo(this.map);
      this.markers.push(marker);
    }
  }

  onLayerChange(layer) {
    this.selectedLayer = layer;
  }

  loadMarkerBySlider() {
    this.setMarkersByPrediction(this.predictionData[this.slider]);
  }

  onSliderChange(val) {
    setTimeout(() => {
      if (val == this.maxSlider) {
        this.slider = this.maxSlider - 1;
      }
      this.loadMarkerBySlider();
      this.setCurrentHourSignalData();
    });
  }

  toggleSlider() {
    this.playing = !this.playing;
    if (this.playing) {
      this.timer = setInterval(() => {
        const inc = this.slider + 1;
        if (inc == this.maxSlider) {
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
    this.decisionService.getPopupChartData(this.popup.data['signals'], range, this.selectedSite.key, this.selectedTurbine.key).subscribe(data => {
      this.popup.data['config']['data'] = [];
      this.popup.data['config']['labels'] = [];
      this.popup.data['config'] = {
        ...this.popup.data['config'],
        data: data.data,
        labels: data.labels
      };
      this.popup_loading = false;
    });
  }
  onRangeChange(period) {
    if (this.popupFrom != null && this.popupTo != null) {

      let from_date = new Date(this.popupFrom.year, (this.popupFrom.month - 1), this.popupFrom.day);
      let to_date = new Date(this.popupTo.year, (this.popupTo.month - 1), this.popupTo.day);

      if (from_date < to_date) {
        this.popup_loading = true;
        this.selectedPopupPeriod = period;
        let range = this.decisionService.getStartAndEndDate(this.selectedPopupPeriod, this.popupFrom, this.popupTo);
        this.decisionService.getPopupChartData(this.popup.data['signals'], range, this.selectedSite.key, this.selectedTurbine.key).subscribe(data => {
          this.popup.data['config'] = {
            ...this.popup.data['config'],
            data: data.data,
            labels: data.labels
          };
          this.popup_loading = false;
        });
      }
      else {
        this.loading = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Start date is grater than end date.'
        });
      }
    }
    // else {
    //   this.loading = false;
    //   this.util.notification.error({
    //     title: 'ERROR',
    //     msg: 'Enter valid dates.'
    //   });
    // }
  }
}
