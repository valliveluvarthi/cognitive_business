import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PATHS } from '../enums';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkLogin(state.url); 
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkUserAccessibility(route, state);
  }

  checkUserAccessibility(route, state) {
    let userInfo = this.userService.getLoggedInUserInfo();
    if(route.data.allowedRoles && userInfo && userInfo.role) {
      if(route.data.allowedRoles.includes(userInfo.role)){
        return this.checkLogin(state.url);
      }else{
        const urlTree: UrlTree = this.router.parseUrl(`/${PATHS.HOME}/${PATHS.DAILY_DASHBOARD}`);
        return urlTree;
      }
    }else{
      return this.checkLogin(state.url);
    }
  }

  checkLogin(url: string): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.userService.isLoggedIn()) {
      return this.fetchUrl(url, `/${PATHS.HOME}`);
    }
    return this.fetchUrl(url, `/${PATHS.AUTH}`);
  }

  fetchUrl(url: string, redirectUrl: string) {
    if (url.startsWith(redirectUrl)) {
      return true;
    }
    const urlTree: UrlTree = this.router.parseUrl(redirectUrl);
    if (!url.startsWith(`/${PATHS.AUTH}`)) {
      urlTree.queryParams = { returnUrl: url };
    }
    return urlTree;
  }

}
