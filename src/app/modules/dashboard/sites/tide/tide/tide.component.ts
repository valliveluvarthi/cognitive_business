import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { faCalendarDay, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { PATHS } from 'src/app/enums';

import { CommonUtilService } from 'src/app/services/common-util.service';
import { DecisionService } from 'src/app/services/decision.service';

@Component({
  selector: 'cb-tide',
  templateUrl: './tide.component.html',
  styleUrls: ['./tide.component.scss']
})
export class TideComponent implements OnInit, OnDestroy {

  loading = false;
  loadingChartData = false;
  filter = 'p30d';
  from;
  to;

  sites = [];
  selectedSite;
  threshold;

  faCalender = faCalendarDay;
  faChevronDown = faChevronDown;
  faTimes = faTimes;

  data = [];
  
  options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          borderColor: 'rgba(0,0,0,0)'
        },
        ticks: {
          display: false
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
  };

  selectedSiteSubscription = null;

  labels = []

  constructor(
    private decisionService: DecisionService,
    private util: CommonUtilService,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getSites();
    this.setPopupDate();
    this.selectedSiteSubscription = this.util.selectedSiteSub.subscribe( site => {
      this.selectedSite = site ? site : null;
      if(this.selectedSite){
        this.getThreshold();
      } else if(this.selectedSite == null){
        this.router.navigateByUrl(PATHS.CONTACT_ADMIN);
      }
    });
  }

  ngOnDestroy() {
    this.selectedSiteSubscription && this.selectedSiteSubscription.unsubscribe && this.selectedSiteSubscription.unsubscribe()
  }

  getSites() {
    this.loading = true;
    this.decisionService.getSites().subscribe((response: any) => {
      if (response && response.length) {
        this.sites = response;
        this.selectedSite = response[0];
        this.loading = false;
        this.getThreshold();
      } else {
        this.loading = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching site list.'
        });
      }
    }, () => {
      this.loading = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching site list.'
      });
    });
  }

  getThreshold() {
    this.loading = true;
    this.decisionService.getSiteSignalLimits(this.selectedSite.key).subscribe((response: any) => {
      if (response && response.length) {
        this.threshold = response.filter((data) => { return data.signalKey == 'tide' })[0];
        this.loading = false;
        this.getData();
      } else {
        this.loading = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching signal threshold.'
        });
      }
    }, () => {
      this.loading = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching signal threshold.'
      });
    });
  }

  getParams() {
    const obj = {
      from: '',
      to: ''
    };
    switch (this.filter) {
      case 'p30d':
        obj.from = moment().subtract(30, 'd').toISOString();
        obj.to = moment().toISOString();
        break;
      case 'p7d':
        obj.from = moment().subtract(7, 'd').toISOString();
        obj.to = moment().toISOString();
        break;
      case 'n7d':
        obj.from = moment().toISOString();
        obj.to = moment().add(7, 'd').toISOString();
        break;
      case 'n30d':
        obj.from = moment().toISOString();
        obj.to = moment().add(30, 'd').toISOString();
        break;
      case 'custom':
        obj.from = moment(this.util.getDateString(this.from), 'D-M-YYYY').toISOString();
        obj.to = moment(this.util.getDateString(this.to), 'D-M-YYYY').toISOString();
    }
    return obj;
  }

  getData() {
    this.loadingChartData = true;
    const params = this.getParams();
    this.decisionService.getForcastBySignalKeyWithoutTurbines(this.selectedSite.key, params, 'tide').subscribe((response: any) => {
      if (response) {
        this.setChartData(response);
      } else {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while fetching data.'
        });
      }
      this.loadingChartData = false;
    }, () => {
      this.loadingChartData = false;
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while fetching data.'
      });
    });
  }

  setChartData(data) {
    this.data.length = 0;
    this.labels.length = 0;
    const points = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      points.push(+element[1]);
      const date = moment(element[0]).tz(this.selectedSite.timezone).format('DD-MM-YYYY h A');
      this.labels.push(date);
    }
    this.data.push({ data: points, label: 'Tide', borderColor: '#47b250', backgroundColor: '#47b250', borderWidth: 2 });
    this.data.push({
      data: Array.apply(null, new Array(data.length)).map(Number.prototype.valueOf, this.threshold.lowerLimit),
      fill: false,
      radius: 0,
      pointHitRadius: 0,
      backgroundColor: '#7dc1ff',
      borderColor: '#7dc1ff'
    })
  }

  setPopupDate() {
    const date = this.calendar.getToday();
    this.from = this.calendar.getPrev(date, 'd', 30);
    this.to = date;
  }

  changeFilter(type) {
    this.filter = type;
    this.getData();
  }

  startDateChanged(selectedDate, type) {
    if (type == 'from' && moment(this.util.getDateString(this.to), 'D-M-YYYY').isBefore(moment(this.util.getDateString(this.from), 'D-M-YYYY'))) {
      this.to = this.from;
    }
    this.getData();
  }

  saveThresoldValue() {
    const obj = {
      "upperLimit": this.threshold.upperLimit,
      "lowerLimit": this.threshold.lowerLimit,
      "signalKey": this.threshold.signalKey
    };
    this.decisionService.changeSignalLimits(obj, this.selectedSite.key, this.threshold.signalTemplate).subscribe((response: any) => {
      if (!response) {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while fetching data.'
        });
      }
    }, () => {
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while fetching data.'
      });
    });
  }

  openPopup(content) {
    let self = this;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true, windowClass: "modal-wrapper" }).result.then((result) => {
      self.loadingChartData = true;
      self.data[1].data = Array.apply(null, new Array(self.data[0].data.length)).map(Number.prototype.valueOf, this.threshold.lowerLimit);
      self.saveThresoldValue();
      setTimeout(() => {
        self.loadingChartData = false;
      }, 100)
    });
  }

}
