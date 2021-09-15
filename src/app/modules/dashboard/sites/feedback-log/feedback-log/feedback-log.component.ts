import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { faCalendarCheck, faCalendarWeek, faCheckCircle, faChevronDown, faChevronLeft, faChevronRight, faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as $ from 'jquery';

import { CommonUtilService } from 'src/app/services/common-util.service';
import { DecisionService } from 'src/app/services/decision.service';
import { FeedbackLogService } from 'src/app/services/feedback-log.service';
import { PATHS } from 'src/app/enums';
import { Router } from '@angular/router';

@Component({
  selector: 'cb-feedback-log',
  templateUrl: './feedback-log.component.html',
  styleUrls: ['./feedback-log.component.scss']
})
export class FeedbackLogComponent implements OnInit, OnDestroy {

  faChevronDown = faChevronDown;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faCalender = faCalendarWeek;
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamation = faExclamationCircle;
  faToday = faCalendarCheck;

  loading = false;
  loadingFeedbackData = false;
  loadingEditLogData = false;

  selectedSite;

  editLogData = {
    cancellationReasons: []
  }


  selectedDate: NgbDate;
  startDate: NgbDate;
  endDate: NgbDate;

  columns = [];
  rows = [];
  popup: any = {
    show: false,
    loading: false,
    selectedSite: {},
    filter: '365d',
    data: {}
  }
  selectedSiteSubscription = null;

  addEditPopup: any = {
    show: false,
    success: false,
    data: ''
  }

  @ViewChild('$element', { static: true }) $element: ElementRef;

  constructor(
    private decisionService: DecisionService,
    private feedbackService: FeedbackLogService,
    private util: CommonUtilService,
    private calendar: NgbCalendar,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.setDate();
    this.setPopupDate();
    this.selectedSiteSubscription = this.util.selectedSiteSub.subscribe( site => {
      this.selectedSite = site ? site : null;
      this.popup.selectedSite = this.selectedSite;
      if(this.selectedSite){
        this.fetchFeedbackLogData();
        this.fetchEditLogData();
      } 
      else if(this.selectedSite == null){
        this.router.navigateByUrl(PATHS.CONTACT_ADMIN);
      }
    });
  }

  ngOnDestroy() {
    this.selectedSiteSubscription && this.selectedSiteSubscription.unsubscribe && this.selectedSiteSubscription.unsubscribe()
  }

  setDate(date?: NgbDate) {
    this.selectedDate = date || this.calendar.getToday();
    this.startDate = this.calendar.getPrev(this.selectedDate, 'd', 6);
    this.endDate = this.selectedDate;
  }

  setPopupDate() {
    const date = this.calendar.getToday();
    this.popup.from = this.calendar.getPrev(date, 'd', 365);
    this.popup.to = date;
  }

  dateChanged(date) {
    this.setDate(date);
    this.fetchFeedbackLogData();
  }

  // fetchSitesData() {
  //   this.loading = true;
  //   this.loadingEditLogData = true;
  //   this.decisionService.getSites().subscribe((response: any) => {
  //     if (response && response.length) {
  //       this.sites = response;
  //       this.selectedSite = response[0];
  //       this.popup.selectedSite = response[0];
  //       this.loading = false;
  //       this.fetchFeedbackLogData();
  //       this.fetchEditLogData();
  //     } else {
  //       this.loading = false;
  //       this.loadingEditLogData = true;
  //       this.util.notification.error({
  //         title: 'ERROR',
  //         msg: 'Error while fetching sites list.'
  //       });
  //     }
  //   }, () => {
  //     this.loading = false;
  //     this.loadingEditLogData = true;
  //     this.util.notification.error({
  //       title: 'ERROR',
  //       msg: 'Error while fetching sites list.'
  //     });
  //   });
  // }

  fetchFeedbackLogData(silent = false) {
    !silent && (this.loadingFeedbackData = true);
    const obj = {
      siteKey: this.selectedSite.key,
      from: moment(this.util.getDateString(this.startDate), 'D-M-YYYY').startOf('day').toISOString(),
      to: moment(this.util.getDateString(this.endDate), 'D-M-YYYY').endOf('day').toISOString()
    }
    this.feedbackService.getHourlyAccess(obj).subscribe((response: any) => {
      if (response) {
        const data = response;
        this.generateData({
          data,
          from: obj.from,
          to: obj.to,
          selectedSite: this.selectedSite
        });
      } else {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while fetching sites list.'
        });
      }
      !silent && (this.loadingFeedbackData = false);
    }, () => {
      !silent && (this.loadingFeedbackData = false);
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while fetching sites list.'
      });
    });
  }

  fetchEditLogData() {
    this.feedbackService.fetchReasons(this.selectedSite.key).subscribe((response: any) => {
      if (response) {
        this.editLogData.cancellationReasons = response;
      } else {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while fetching data.'
        });
      }
      this.loadingEditLogData = false;
    }, () => {
      this.loadingEditLogData = false;
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while fetching data.'
      });
    });
  }

  fetchPopupData() {
    this.popup.loading = true;
    const obj = {
      siteKey: this.popup.selectedSite.key,
      from: moment(this.util.getDateString(this.popup.from), 'D-M-YYYY').toISOString(),
      to: moment(this.util.getDateString(this.popup.to), 'D-M-YYYY').toISOString()
    };
    if (this.popup.filter == '365d') {
      obj.from = moment().subtract(365, 'd').toISOString();
      obj.to = moment().toISOString();
    }
    this.feedbackService.getHourlyAccess(obj).subscribe((response: any) => {
      if (response) {
        const data = {
          ...obj,
          selectedSite: this.selectedSite,
          response
        }
        this.popup.data = this.feedbackService.getOverviewData(data);
      } else {
        this.util.notification.error({
          title: 'Error',
          msg: 'Error while fetching sites list.'
        });
      }
      this.popup.loading = false;
    }, () => {
      this.popup.loading = false;
      this.util.notification.error({
        title: 'Error',
        msg: 'Error while fetching sites list.'
      });
    });
  }

  generateData(data) {
    const weeklyData = this.feedbackService.getFormattedData(data);
    this.rows.length = 0;
    this.columns.length = 0;
    this.rows = this.rows.concat(weeklyData.rows);
    this.columns = this.columns.concat(weeklyData.columns);
    setTimeout(() => this.setScroll(), 100);
  }

  setScroll() {
    $(this.$element.nativeElement)
      .find(".content div").animate({
        scrollTop: 330
      }, 200);
  }

  moveDate(action, day) {
    if (day == 'today') {
      const today = this.calendar.getToday();
      this.startDate = this.calendar.getPrev(today, 'd', 3);
      this.endDate = this.calendar.getNext(today, 'd', 3);
    } else {
      this.startDate = this.calendar[action](this.startDate, 'd', day);
      this.endDate = this.calendar[action](this.endDate, 'd', day);
    }

    // TODO: Use this if future dates are disabled
    /* const isFutureStartDate = moment(this.util.getDateString(this.startDate), 'D-M-YYYY').isAfter(moment());
    isFutureStartDate && this.setDate();

    const isFutureEndDate = moment(this.util.getDateString(this.endDate), 'D-M-YYYY').isAfter(moment());
    if (isFutureEndDate) {
      this.endDate = this.calendar.getToday();
      this.startDate = this.calendar.getPrev(this.endDate, 'd', 6);
    }; */

    this.fetchFeedbackLogData();
  }

  // changeSite(site) {
  //   this.selectedSite = site;
  //   this.fetchFeedbackLogData();
  // }

  changePopupSite(site) {
    this.popup.selectedSite = site;
    this.fetchPopupData();
  }

  togglePopup() {
    this.popup.show = !this.popup.show;
    if (this.popup.show) {
      this.fetchPopupData();
    }
  }

  toggleAddEditPopup(selectedItem: any = '', success?) {
    this.addEditPopup.show = !this.addEditPopup.show;
    selectedItem && (this.addEditPopup.data = selectedItem);
    if (selectedItem.data) {
      this.addEditPopup.success = selectedItem.success;
    }
    if (success != undefined) {
      this.addEditPopup.success = success;
    }
  }

  onCloseAddEditLog(data) {
    if (data.updateData) {
      switch (data.for) {
        case 'delete':
          this.feedbackService.clearLogData(this.rows, data.data);
          break;
        case 'update':
          this.fetchFeedbackLogData(true);
          break;
      }
    }
    this.toggleAddEditPopup();
  }

  changePopupFilter(type) {
    this.popup.filter = type;
    this.fetchPopupData();
  }

  startDateChanged(selectedDate, type) {
    if (type == 'from' && moment(this.util.getDateString(this.popup.to), 'D-M-YYYY').isBefore(moment(this.util.getDateString(this.popup.from), 'D-M-YYYY'))) {
      this.popup.to = this.popup.from;
    }
    this.fetchPopupData();
  }

  getMonthYearText(month) {
    return moment(month.month + ' ' + month.year, 'M YYYY').format('MMM YY');
  }

  getClass(date) {
    const dateStr = this.util.getDateString(date);
    if (this.popup.data.availableData[dateStr]) {
      return this.popup.data.availableData[dateStr].avgClass;
    }
  }

  hasData(date) {
    const dateStr = this.util.getDateString(date);
    return this.popup.data.availableData[dateStr];
  }

  getHeader(date) {
    const dateStr = this.util.getDateString(date);
    return this.popup.data.availableData[dateStr].date || '';
  }

  getLogs(date) {
    const dateStr = this.util.getDateString(date);
    return this.popup.data.availableData[dateStr].logs || [];
  }
}
