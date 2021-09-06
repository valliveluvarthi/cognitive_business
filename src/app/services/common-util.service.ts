import { Injectable } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { NotificationsService } from 'angular2-notifications';
import { __assign } from 'tslib';

@Injectable({
  providedIn: 'root'
})
export class CommonUtilService {

  private notificationOptions = {
    timeOut: 3000,
    maxStack: 2,
    showProgressBar: false,
    pposition: ["top", "right"]
  }

  constructor(private notificationService: NotificationsService) { }

  notification = {
    success: (options) => {
      this.notificationService.success(options.title || '', options.msg || '', Object.assign({}, this.notificationOptions, options));
    },
    error: (options) => {
      this.notificationService.error(options.title || '', options.msg || '', Object.assign({}, this.notificationOptions, options));
    },
    warn: (options) => {
      this.notificationService.warn(options.title || '', options.msg || '', Object.assign({}, this.notificationOptions, options));
    },
    info: (options) => {
      this.notificationService.info(options.title || '', options.msg || '', Object.assign({}, this.notificationOptions, options));
    }
  }

  getDateString(date: NgbDate): string {
    return `${date.day}-${date.month}-${date.year}`;
  }

}
