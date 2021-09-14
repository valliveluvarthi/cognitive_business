import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { NotificationsService } from 'angular2-notifications';
import { BehaviorSubject } from 'rxjs';
import { __assign } from 'tslib';
import { ApiConstant } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class CommonUtilService {

  private sites = [];
  private selectedSite = null;

  selectedSiteSub = new BehaviorSubject(null); 
  private notificationOptions = {
    timeOut: 3000,
    maxStack: 2,
    showProgressBar: false,
    pposition: ["top", "right"]
  }

  constructor(private notificationService: NotificationsService, private http: HttpClient) { }

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

  /* STEP: fun => setSites 
     definition => set sites list
     param {0} : sites => sites list
  */
  setSites(sites) {
    this.sites = sites;
  }
  
  /* STEP: fun => setSites 
     definition => return sites list
  */
  getSites() {
    return this.sites.length > 0 ? [...this.sites] : [];
  }
  
  /* STEP: fun => setSelectedSite 
     definition => set selected site
     param {0} : sites => sites 
  */
  setSelectedSite(site) {
    this.selectedSite = site;
    this.selectedSiteSub.next(this.selectedSite);
  }
  
  /* STEP: fun => getSelectedSite 
     definition => return return selected site
  */
  getSelectedSite() {
    return this.selectedSite && this.selectedSite.key ? {...this.selectedSite} : null;
  }

  /* STEP: fun => retrieveSitesList
     definition => retrieve sites from backend 
  */
  retrieveSitesList() {
    return this.http.get(ApiConstant.SITES);
  }
  
}
