import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConstant } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  getReportTypes(siteKey: string) {
    return this.http.get(ApiConstant.REPORT_TYPES.replace('{{siteKey}}', siteKey));
  }

  addRole(siteKey, reportTypeId, reportRole) {
    return this.http.post(ApiConstant.ADD_ROLE.replace('{{siteKey}}', siteKey).replace('{{reportTypeId}}', reportTypeId).replace('{{reportRole}}', reportRole), null);
  }

  removeRole(siteKey, reportTypeId, reportRole) {
    return this.http.delete(ApiConstant.ADD_ROLE.replace('{{siteKey}}', siteKey).replace('{{reportTypeId}}', reportTypeId).replace('{{reportRole}}', reportRole));
  }

  subscribeToReport(siteKey, reportTypeId) {
    return this.http.post(ApiConstant.SUBSCRIBE_TO_REPORT.replace('{{siteKey}}', siteKey).replace('{{reportTypeId}}', reportTypeId), null);
  }

  unsubscribeFromReport(siteKey, reportTypeId) {
    return this.http.post(ApiConstant.UNSUBSCRIBE_FROM_REPORT.replace('{{siteKey}}', siteKey).replace('{{reportTypeId}}', reportTypeId), null);
  }

  getReportSubscriptions(siteKey) {
    return this.http.get(ApiConstant.REPORT_SUBSCRIPTIONS.replace('{{siteKey}}', siteKey));
  }
}
