import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { faCalendarWeek, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { SiteAccessibilityService } from 'src/app/services/site-accessibility.service';

@Component({
  selector: 'cb-site-a-vs-b',
  templateUrl: './site-a-vs-b.component.html',
  styleUrls: ['./site-a-vs-b.component.scss']
})
export class SiteAVsBComponent implements OnInit {

  faChevronDown = faChevronDown;
  faCalender = faCalendarWeek;

  filters = [{
    key: 'yearly',
    name: 'Yearly'
  }, {
    key: 'range',
    name: 'Range'
  }];
  selectedFilter: any = {
    key: 'yearly',
    name: 'Yearly'
  };
  selectedYear;
  to;
  from;

  @Input() yearlyData: any;
  @Input() siteData: any;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  loading = false;

  data = [
    { data: [], label: 'Accessed', borderColor: '#3d8ed9', backgroundColor: '#3d8ed9', borderWidth: 2 },
    { data: [], label: 'Accessible', borderColor: '#7dc1ff', backgroundColor: '#7dc1ff', borderWidth: 2 }
  ];
  options: any = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' h';
            }
            return label;
          }
        }
      }
    },
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
          },
          callback: (val) => {
            return val + ' h'
          }
        }
      }
    }
  };
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  initialized = false;

  constructor(
    private calendar: NgbCalendar,
    private util: CommonUtilService,
    private siteService: SiteAccessibilityService
  ) {
  }

  ngOnInit(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.selectedYear = this.yearlyData.years[0];
    this.setDatesByYear(this.selectedYear.year);
    this.setGraphDataByYear();
  }

  setGraphDataByYear() {
    setTimeout(() => {
      const yearData = this.yearlyData[this.selectedYear.year];
      this.chart.chart.data.datasets[0].data = yearData['accessedHoursCount'];
      this.chart.chart.data.datasets[1].data = yearData['accessibleHourCount'];
      this.chart.chart.update();
    }, 100);
  }

  setDatesByYear(year) {
    const from = moment(year, 'YYYY').startOf('year');
    const to = moment(year, 'YYYY').endOf('year');
    this.from = {
      day: from.get('date'),
      month: from.get('month') + 1,
      year: from.get('year')
    }
    this.to = {
      day: to.get('date'),
      month: to.get('month') + 1,
      year: to.get('year')
    }
  }

  onFilterChanged() {
    switch (this.selectedFilter.key) {
      case 'yearly':
        this.setGraphDataByYear();
        break;
      case 'range':
        this.setDatesByYear(this.selectedYear.year);
        break;
    }
  }

  dateChanged(selectedDate, type) {
    if (type == 'from' && moment(this.util.getDateString(this.to), 'D-M-YYYY').isBefore(moment(this.util.getDateString(this.from), 'D-M-YYYY'))) {
      this.to = this.from;
    }
    this.fetchDataByDate();
  }

  fetchDataByDate() {
    if (!this.from || !this.to) {
      return;
    }
    this.loading = true;
    this.siteService.fetchGraphDataByDate({
      from: this.from,
      to: this.to
    }, this.siteData).subscribe((response: any) => {
      if (response) {
      } else {
        this.loading = false;
        this.util.notification.error({
          title: 'ERROR',
          msg: 'Error while fetching graph data.'
        });
      }
    }, () => {
      this.loading = false;
      this.util.notification.error({
        title: 'ERROR',
        msg: 'Error while fetching graph data.'
      });
    });
  }

}
