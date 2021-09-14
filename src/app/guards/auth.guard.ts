import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PATHS } from '../enums';
import { CommonUtilService } from '../services/common-util.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  selectedSite = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private utility: CommonUtilService
  ) {
    this.utility.selectedSiteSub.subscribe((site) => {
      this.selectedSite = site ? site : null;
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkLogin(state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkUserAccessibility(route, state);
  }

  checkUserAccessibility(route, state) {
    let userInfo = this.userService.getLoggedInUserInfo();
    if (route.data.allowedRoles && userInfo && userInfo.role) {
      if (route.data.allowedRoles.includes(userInfo.role)) {
        return this.checkLogin(state.url);
      } else {
        const urlTree: UrlTree = this.router.parseUrl(
          `/${PATHS.SITES.replace(":site",this.selectedSite.key)}/${PATHS.DAILY_DASHBOARD}`
        );
        return urlTree;
      }
    } else {
      return this.checkLogin(state.url);
    }
  }

  checkLogin(
    url: string
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.userService.isLoggedIn()) {
      return (
        this.fetchUrl(url, `/${PATHS.SITES}`.split(':')[0], true) ||
        this.fetchUrl(url, `/${PATHS.ADMIN}`, false)
      );
    }
    return this.fetchUrl(url, `/${PATHS.AUTH}`, false);
  }

  fetchUrl(url: string, redirectUrl: string, isMoreTest: boolean) {
    if (url.startsWith(redirectUrl)) {
      return true;
    }
    if (!isMoreTest) {
      const urlTree: UrlTree = this.router.parseUrl(redirectUrl);
      if (!url.startsWith(`/${PATHS.AUTH}`)) {
        urlTree.queryParams = { returnUrl: url };
      }
      return urlTree;
    }
  }
}
