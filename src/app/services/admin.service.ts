import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConstant } from '../enums';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  public isAdmin: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private http: HttpClient
  ) { }

  getAdminUsers() {
    return this.http.get(ApiConstant.GET_ADMIN_USERS);
  }

  resendInvitations(data) {
    return this.http.post(ApiConstant.SEND_WELCOME_EMAILS, data);
  }

  deactivateAccounts(data) {
    return this.http.post(ApiConstant.DEACTIVATE_ACCOUNTS, data);
  }

  updateUsersRole(data) {
    return this.http.put(ApiConstant.UPDATE_USERS_ROLE, data);
  }

  getUserRoles() {
    return this.http.get(ApiConstant.USER_ROLES);
  }

  updateUserInfo(userId, data) {
    return this.http.put(ApiConstant.UPDATE_USER_INFO.replace("{{userId}}", userId), data);
  }

  createUsers(data) {
    return this.http.post(ApiConstant.CREATE_USERS, data);
  }

  isAdminLoggedIn() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      loggedInUser = JSON.parse(loggedInUser);
      if (loggedInUser['role'].toLowerCase() === "admin") {
        return true;
      }
    }
    return false;
  }

  getUserSitesList(userId){
    return this.http.get(ApiConstant.USER_SITES.replace("{{userId}}", userId));
  }
  getSiteRoles(){
    return this.http.get(ApiConstant.SITE_ROLES);
  }
  deleteSiteFromUser(userId,siteKey){
    return this.http.delete(ApiConstant.DELETE_SITE_FROM_USER.replace("{{userId}}", userId).replace('{{siteKey}}', siteKey));
  }
  addSiteToUser(userId,siteKey,data){
    return this.http.post(ApiConstant.ADD_SITE_TO_USER.replace("{{userId}}", userId).replace('{{siteKey}}', siteKey),data);
  }
}