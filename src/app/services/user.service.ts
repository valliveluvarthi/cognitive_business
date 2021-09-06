import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiConstant, PATHS } from '../enums';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userSubject: BehaviorSubject<any>;
  public user: Observable<User>;

  constructor(private router: Router, private http: HttpClient) {
    let user: string | null | User = localStorage.getItem('user');
    
    if (user) {
      user = JSON.parse(user);
    }
    this.userSubject = new BehaviorSubject<any>(user || '');
    this.user = this.userSubject.asObservable();
  }

  setLoggedInUser() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      loggedInUser = JSON.parse(loggedInUser);
      this.userSubject.next(loggedInUser);
    }else {
      this.userSubject.next(null);
    }
    return false;
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  getLoggedInUserInfo() {
    let loggedInUserInfo: any = localStorage.getItem('loggedInUser');
    return  loggedInUserInfo ? JSON.parse(loggedInUserInfo) : null;
  }

  isLoggedIn() {
    return !!this.userSubject.value
  }

  login(data: any) {
    return this.http.post(ApiConstant.LOGIN, data).pipe(
      tap((resp: any) => {
        localStorage.setItem('user', JSON.stringify(resp));
        this.userSubject.next(resp);
      })
    );
  }

  logout(doNotNavigate = false) {
    localStorage.clear();
    this.userSubject.next(null);
    if (!doNotNavigate) {
      this.router.navigate([`/${PATHS.AUTH}`]);
    }
  }

  forgotPassword(data: any) {
    return this.http.post(ApiConstant.FORGOT_PASSWORD, data);
  }

  resetPassword(code: string, data: any) {
    return this.http.put(ApiConstant.RESET_PASSWORD.replace('{{resetCode}}', code), data);
  }

}
