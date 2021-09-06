import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as moment from 'moment-timezone';
import { forkJoin } from 'rxjs';

import { ApiConstant } from '../enums';
import { DecisionService } from './decision.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackLogService {

  constructor(
    private http: HttpClient,
    private decitionService: DecisionService
  ) { }

  getHourlyAccess(data) {
    const params: HttpParams = new HttpParams({
      fromObject: {
        from: data.from,
        to: data.to
      }
    });
    return this.http.get(ApiConstant.HOURLY_ACCESS.replace('{{siteKey}}', data.siteKey), { params });
  }

  getFeedbackLogs(data) {
    const params: HttpParams = new HttpParams({
      fromObject: {
        from: data.from,
        to: data.to
      }
    });
    return this.http.get(ApiConstant.FEEDBACK_LOGS.replace('{{siteKey}}', data.siteKey), { params });
  }

  getEditLogData(site) {
    return forkJoin({
      turbines: this.decitionService.getSiteTurbines(site),
      cancellationReasons: this.fetchReasons(site),
      vessels: this.fetchVessels(site)
    });
  }

  fetchVessels(site) {
    return this.http.get(ApiConstant.GET_VESSELS.replace('{{siteKey}}', site));
  }

  fetchReasons(site) {
    return this.http.get(ApiConstant.CANCELLATION_REASONS.replace('{{siteKey}}', site));
  }

  saveLog(site, data) {
    return this.http.post(ApiConstant.CREATE_LOG.replace('{{siteKey}}', site), data);
  }

  editLog(site, transferId, data) {
    return this.http.put(ApiConstant.EDIT_LOG.replace('{{siteKey}}', site).replace('{{transferId}}', transferId), data);
  }

  setHourlyAccess(site, data) {
    return this.http.post(ApiConstant.HOURLY_ACCESS.replace('{{siteKey}}', site), data);
  }

  deleteLog(site, transferId) {
    return this.http.delete(ApiConstant.EDIT_LOG.replace('{{siteKey}}', site).replace('{{transferId}}', transferId));
  }

  clearAccess(site, hour) {
    return this.http.delete(ApiConstant.HOURLY_ACCESS.replace('{{siteKey}}', site) + '/' + hour);
  }

  getFormattedData(data) {
    let columns = [];
    let rows = [];
    const now = moment(data.from).tz(data.selectedSite.timezone);
    const today = moment().tz(data.selectedSite.timezone);
    for (let i = 0; i < 7; i++) {
      columns.push({
        month: now.format('MMM'),
        date: now.format('D'),
        dayOfWeek: now.format('ddd'),
        fullDate: now.format('D-M-YYYY'),
        today: now.isSame(today, 'day')
      });
      now.add(1, 'd');
    }
    const availableData = {};
    if (data.data.length) {
      for (let i = 0; i < data.data.length; i++) {
        const element = data.data[i];
        const date = moment(element.timestamp).tz(data.selectedSite.timezone);
        if (!availableData[date.format('D-M-YYYY h A')]) {
          availableData[date.format('D-M-YYYY h A')] = element;
        }
      }
    }
    for (let i = 0; i < 24; i++) {
      const name = moment(i, 'H').format('h A');
      const items = [];
      for (let i = 0; i < 7; i++) {
        const obj: any = {
          hasValue: false,
          date: columns[i].fullDate,
          time: name,
          today: moment(columns[i].fullDate, 'D-M-YYYY').isSame(today, 'day')
        };
        if (availableData[columns[i].fullDate + ' ' + name]) {
          obj.hasValue = true;
          obj.data = availableData[columns[i].fullDate + ' ' + name];
          obj.success = obj.data.isAccessible;
        }
        items.push(obj);
      }
      rows.push({
        name,
        type: 'icon',
        items
      });
    }
    return {
      columns,
      rows
    }
  }

  getOverviewData(data) {
    const from = moment(data.from).tz(data.selectedSite.timezone);
    const fromFinal = from.clone();
    const to = moment(data.to).tz(data.selectedSite.timezone);
    let monthsToDisplay = 1;
    while (from.get('month') != to.get('month') || from.get('year') != to.get('year')) {
      monthsToDisplay++;
      from.add(1, 'month');
    }
    const availableData = {};
    for (let i = 0; i < data.response.length; i++) {
      const element = data.response[i];
      const date = moment(element.timestamp).tz(data.selectedSite.timezone);
      if (!availableData[date.format('D-M-YYYY')]) {
        availableData[date.format('D-M-YYYY')] = {
          date: date.format('MMM D,YYYY'),
          avgClass: element.isAccessible ? 'all-sucess' : 'all-cancelled',
          logs: [{
            text: date.format('hA') + '-' + date.add(1, 'hour').format('hA'),
            class: element.isAccessible ? 'all-sucess' : 'all-cancelled'
          }]
        }
      } else {
        if (availableData[date.format('D-M-YYYY')].avgClass == 'all-sucess' && !element.isAccessible) {
          availableData[date.format('D-M-YYYY')].avgClass = 'cancelled-success';
        }
        if (availableData[date.format('D-M-YYYY')].avgClass == 'all-cancelled' && element.isAccessible) {
          availableData[date.format('D-M-YYYY')].avgClass = 'cancelled-success';
        }
        availableData[date.format('D-M-YYYY')].logs.push({
          text: date.format('hA') + '-' + date.add(1, 'hour').format('hA'),
          class: element.isAccessible ? 'all-sucess' : 'all-cancelled'
        });
      }
    }
    return {
      availableData,
      monthsToDisplay,
      month: fromFinal.get('month') + 1,
      year: fromFinal.get('year')
    }
  }

  clearLogData(rows, data) {
    for (let i = 0; i < rows.length; i++) {
      const element = rows[i];
      for (let j = 0; j < element.items.length; j++) {
        const cell = element.items[j];
        if (cell.data && cell.data.timestamp == data.timestamp) {
          cell.hasValue = false;
          delete cell.data;
          delete cell.success;
          return;
        }
      }
    }
  }

  getTimeSlots() {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push(moment(i, 'H').format('h A'));
    }
    return slots;
  }

}
