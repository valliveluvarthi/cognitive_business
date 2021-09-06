import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as moment from 'moment-timezone';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiConstant } from '../enums';
import { CommonUtilService } from './common-util.service';
import { FeedbackLogService } from './feedback-log.service';

@Injectable({
  providedIn: 'root'
})
export class SiteAccessibilityService {

  constructor(
    private http: HttpClient,
    private feedbackService: FeedbackLogService,
    private util: CommonUtilService
  ) { }

  fetchRequests(siteKey) {
    const requests = {};
    const days = [7, 30, 90, 180, 365];
    for (let i = 0; i < days.length; i++) {
      const element = days[i];
      const today = moment();
      const params: HttpParams = new HttpParams({
        fromObject: {
          to: today.startOf('day').toISOString(),
          from: today.subtract(element, 'd').endOf('day').toISOString()
        }
      });
      requests[element] = this.http.get(ApiConstant.ACCESSIBILITY_REPORT.replace('{{siteKey}}', siteKey), { params });
      const paramsLastYear: HttpParams = new HttpParams({
        fromObject: {
          to: moment().startOf('day').subtract(1, 'year').toISOString(),
          from: moment().subtract(element, 'd').endOf('day').subtract(1, 'year').toISOString()
        }
      });
      requests[element + '_lastyear'] = this.http.get(ApiConstant.ACCESSIBILITY_REPORT.replace('{{siteKey}}', siteKey), { params: paramsLastYear });
    }
    return requests;
  }

  fetchReportingData(siteKey) {
    return forkJoin(this.fetchRequests(siteKey));
  }

  fetchReportingDataByDate(data, selectedSite) {
    const from = moment(this.util.getDateString(data.from), 'D-M-YYYY');
    const to = moment(this.util.getDateString(data.to), 'D-M-YYYY');
    const params: HttpParams = new HttpParams({
      fromObject: {
        to: to.toISOString(),
        from: from.toISOString()
      }
    });
    const paramsLastYear: HttpParams = new HttpParams({
      fromObject: {
        to: to.subtract(1, 'year').toISOString(),
        from: from.subtract(1, 'year').toISOString()
      }
    });
    return forkJoin({
      current: this.http.get(ApiConstant.ACCESSIBILITY_REPORT.replace('{{siteKey}}', selectedSite.key), { params: params }),
      current_lastyear: this.http.get(ApiConstant.ACCESSIBILITY_REPORT.replace('{{siteKey}}', selectedSite.key), { params: paramsLastYear }),
    }).pipe(
      map((response: any) => {
        response.selectedSite = selectedSite;
        return this.getDataByKey(response, 'current')
      })
    );
  }

  getGraphRequests(selectedSite, years) {
    const requests = {};
    for (let i = 0; i < years.length; i++) {
      const element = years[i];
      const params: HttpParams = new HttpParams({
        fromObject: {
          to: moment(element.year, 'YYYY').endOf('year').toISOString(),
          from: moment(element.year, 'YYYY').startOf('year').toISOString(),
          group_by: 'month'
        }
      });
      requests[element.year] = this.http.get(ApiConstant.ACCESSIBILITY_REPORT.replace('{{siteKey}}', selectedSite.key), { params });
    }
    return requests;
  }

  getYearsFromCommissioningDate(selectedSite) {
    const years = [];
    const commissioningDate = moment(selectedSite.commissioningDate, 'YYYY-MM-DD');
    const fromYear = commissioningDate.get('year');
    let toYear = moment().get('year');
    const colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"];
    let i = 0;
    while (fromYear <= toYear) {
      years.push({
        year: toYear,
        color: colors[i]
      });
      i++;
      toYear--;
    }
    return years;
  }

  fetchGraphData(selectedSite) {
    const years = this.getYearsFromCommissioningDate(selectedSite);
    return forkJoin(this.getGraphRequests(selectedSite, years)).pipe(
      map((response) => this.formatGraphData(response, years, selectedSite))
    );
  }

  fetchGraphDataByDate(data, selectedSite) {
    const from = moment(this.util.getDateString(data.from), 'D-M-YYYY');
    const to = moment(this.util.getDateString(data.to), 'D-M-YYYY');
    const params: HttpParams = new HttpParams({
      fromObject: {
        to: to.toISOString(),
        from: from.toISOString(),
        group_by: 'month'
      }
    });
    return this.http.get(ApiConstant.ACCESSIBILITY_REPORT.replace('{{siteKey}}', selectedSite.key), { params }).pipe(
      map((response) => this.calculateData(response, selectedSite))
    );
  }

  calculateData(data, selectedSite) {
    const formattedData = {
      hourCount: [],
      accessedHoursCount: [],
      accessibleHourCount: [],
      workingHourCount: [],
      accessiblePersentage: [],
      accessedPersentage: [],
      opportunityPersentage: []
    };
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const isFutureDate = moment(element.from).isAfter(moment().tz(selectedSite.timezone));
      const isBeforeCommissioningDate = moment(element.to).isBefore(moment(selectedSite.commissioningDate).tz(selectedSite.timezone));
      let accessiblePersentage: any = (element.workingAccessibleHourCount / element.workingHourCount) * 100;
      let accessedPersentage: any = (element.accessedHoursCount / element.workingHourCount) * 100;
      let opportunityPersentage: any = ((element.workingAccessibleHourCount - element.accessedHoursCount) / element.workingAccessibleHourCount) * 100;
      if (isFutureDate || isBeforeCommissioningDate) {
        accessiblePersentage = null;
        accessedPersentage = null;
        opportunityPersentage = null;
      } else {
        accessiblePersentage = isNaN(accessiblePersentage) ? 0 : accessiblePersentage.toFixed(2)
        accessedPersentage = isNaN(accessedPersentage) ? 0 : accessedPersentage.toFixed(2)
        opportunityPersentage = isNaN(opportunityPersentage) ? 0 : opportunityPersentage.toFixed(2)
      }
      formattedData.hourCount.push(element.hourCount);
      formattedData.accessedHoursCount.push(element.accessedHoursCount);
      formattedData.accessibleHourCount.push(element.accessibleHourCount);
      formattedData.workingHourCount.push(element.workingHourCount);
      formattedData.accessiblePersentage.push(accessiblePersentage);
      formattedData.accessedPersentage.push(accessedPersentage);
      formattedData.opportunityPersentage.push(opportunityPersentage);
    }
    return formattedData;
  }

  formatGraphData(data, years, selectedSite) {
    const formattedData = {
      years
    };
    for (const year in data) {
      if (Object.prototype.hasOwnProperty.call(data, year)) {
        const yearlyData = data[year];
        formattedData[year] = this.calculateData(yearlyData, selectedSite);
      }
    }
    return formattedData;
  }

  getDataByKey(response, key) {
    const data = response[key][0];
    const lastYearData = response[key + '_lastyear'][0];
    return {
      from: moment(data.from).tz(response.selectedSite.timezone).format('DD MMM YY'),
      to: moment(data.to).tz(response.selectedSite.timezone).format('DD MMM YY'),
      accessed: {
        hours: data.accessedHoursCount,
        isLess: Math.sign(data.accessedHoursCount - lastYearData.accessedHoursCount) == -1,
        diffHours: Math.abs(data.accessedHoursCount - lastYearData.accessedHoursCount)
      },
      accessible: {
        hours: data.workingAccessibleHourCount,
        isLess: Math.sign(data.workingAccessibleHourCount - lastYearData.workingAccessibleHourCount) == -1,
        diffHours: Math.abs(data.workingAccessibleHourCount - lastYearData.workingAccessibleHourCount)
      },
      opportunity: {
        hours: data.workingAccessibleHourCount - data.accessedHoursCount,
        isLess: Math.sign((data.workingAccessibleHourCount - data.accessedHoursCount) - (lastYearData.workingAccessibleHourCount - lastYearData.accessedHoursCount)) == -1,
        diffHours: Math.abs((data.workingAccessibleHourCount - data.accessedHoursCount) - (lastYearData.workingAccessibleHourCount - lastYearData.accessedHoursCount))
      }
    }
  }

  getData(response) {
    let columns = [
      {
        name: '7 Days',
        ...this.getDataByKey(response, 7)
      },
      {
        name: '30 Days',
        ...this.getDataByKey(response, 30)
      },
      {
        name: '90 Days',
        ...this.getDataByKey(response, 90)
      },
      {
        name: '180 Days',
        ...this.getDataByKey(response, 180)
      },
      {
        name: '365 Days',
        ...this.getDataByKey(response, 365)
      },
      {
        name: 'Date Range',
        ...this.getDataByKey(response, 365)
      }
    ];
    const dateRange: any = columns[columns.length - 1];
    const from = moment(dateRange.from, 'D MMM YY');
    const to = moment(dateRange.to, 'D MMM YY');
    dateRange.datePicker = {
      from: {
        day: from.get('date'),
        month: from.get('month') + 1,
        year: from.get('year')
      },
      to: {
        day: to.get('date'),
        month: to.get('month') + 1,
        year: to.get('year')
      }
    }
    return columns;
  }
}
