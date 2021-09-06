import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutResolver implements Resolve<void | boolean> {
  constructor(private userService: UserService) { }

  resolve(route: ActivatedRouteSnapshot): void | boolean {
    return this.userService.isLoggedIn() ? this.userService.logout(true) : true;
  }
}
