import { Component, OnDestroy, OnInit } from '@angular/core';

import { faCalendarWeek, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { CommonUtilService } from 'src/app/services/common-util.service';
import { DecisionService } from 'src/app/services/decision.service';
import { SiteAccessibilityService } from 'src/app/services/site-accessibility.service';

@Component({
  selector: 'cb-site-accessibility',
  templateUrl: './site-accessibility.component.html',
  styleUrls: ['./site-accessibility.component.scss']
})
export class SiteAccessibilityComponent implements OnInit, OnDestroy {

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faCalender = faCalendarWeek;

  loading = false;
  loadingReports = false;
  loadingGraphs = false;

  graphData = {};

  // sites = [];
  selectedSite;

  columns = [];

  hoveredDate: NgbDate | null = null;

  accessible = {
    title: 'Site Accessible',
    desc: 'Yearly Accessible',
    key: 'accessiblePersentage'
  };
  accessed = {
    title: 'Site Accessed',
    desc: 'Yearly Accessed',
    key: 'accessedPersentage'
  };
  opportunity = {
    title: 'Opportunity',
    desc: 'Yearly Opportunity',
    key: 'opportunityPersentage'
  };

  selectedSiteSubscription = null;

  constructor(
    private decisionService: DecisionService,
    private util: CommonUtilService,
    private siteService: SiteAccessibilityService,
    private calendar: NgbCalendar
  ) { }

  ngOnInit(): void {
    // this.fetchSitesData();
    this.selectedSiteSubscription = this.util.selectedSiteSub.subscribe( site => {
      this.selectedSite = site ? site : null;
      if(this.selectedSite){
        this.loadingReports = true;
        this.loadingGraphs = true;
        this.fetchReportingData();
        this.fetchGraphData();
      } 
    });
  }

  ngOnDestroy() {
    this.selectedSiteSubscription && this.selectedSiteSubscription.unsubscribe && this.selectedSiteSubscription.unsubscribe()
  }

  // fetchSitesData() {
  //   this.loading = true;
  //   this.loadingReports = true;
  //   this.loadingGraphs = true;
  //   this.decisionService.getSites().subscribe((response: any) => {
  //     if (response && response.length) {
  //       this.sites = response;
  //       this.selectedSite = response[0];
  //       this.fetchReportingData();
  //       this.fetchGraphData();
  //       this.loading = false;
  //     } else {
  //       this.loading = false;
  //       this.loadingReports = false;
  //       this.loadingGraphs = true;
  //       this.util.notification.error({
  //         title: 'ERROR',
  //         msg: 'Error while fetching sites list.'
  //       });
  //     }
  //   }, () => {
  //     this.loading = false;
  //     this.loadingReports = false;
  //     this.loadingGraphs = true;
  //     this.util.notification.error({
  //       title: 'ERROR',
  //       msg: 'Error while fetching sites list.'
  //     });
  //   });
  // }

  fetchReportingData() {
    this.siteService.fetchReportingData(this.selectedSite.key).subscribe((response: any) => {
      if (response) {
        response.selectedSite = this.selectedSite;
        this.setData(response);
        this.loadingReports = false;
      } else {
        this.loadingReports = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching reporting data.'
        });
      }
    }, () => {
      this.loadingReports = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching reporting data.'
      });
    });
  }

  fetchGraphData() {
    this.siteService.fetchGraphData(this.selectedSite).subscribe((response: any) => {
      if (response) {
        this.graphData = response;
        this.loadingGraphs = false;
      } else {
        this.loadingGraphs = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching graph data.'
        });
      }
    }, () => {
      this.loadingGraphs = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching graph data.'
      });
    });
  }

  setData(response) {
    const data = this.siteService.getData(response);
    this.columns.length = 0;
    this.columns = this.columns.concat(data);
  }

  isHovered(date: NgbDate, data) {
    return data.from && !data.to && this.hoveredDate && date.after(data.from) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate, data) {
    return data.to && date.after(data.from) && date.before(data.to);
  }

  isRange(date: NgbDate, data) {
    return date.equals(data.from) || (data.to && date.equals(data.to)) || this.isInside(date, data) || this.isHovered(date, data);
  }

  onDateSelection(date: NgbDate, data) {
    if (!data.from && !data.to) {
      data.from = date;
    } else if (data.from && !data.to && date && date.after(data.from)) {
      data.to = date;
    } else {
      data.to = null;
      data.from = date;
    }
  }

  applyDateSelection(data) {
    if (!data.datePicker.from || !data.datePicker.to) {
      return;
    }
    data.loading = true;
    this.siteService.fetchReportingDataByDate(data.datePicker, this.selectedSite).subscribe((response: any) => {
      if (response) {
        response.datePicker = data.datePicker;
        response.loading = false;
        Object.assign(data, response);
      } else {
        data.loading = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching reporting data.'
        });
      }
    }, () => {
      data.loading = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching reporting data.'
      });
    });
  }

}
