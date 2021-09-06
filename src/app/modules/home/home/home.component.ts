import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RoutingUtilityService } from 'src/app/services/routing-utility.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'cb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public showNav = false;
  public navItems = [];
  public selectedNavIndex = 0;

  constructor(
    private router: Router,
    private routingUtilityService: RoutingUtilityService,
    private userService: UserService,
  ) {
    let currentPageUrl = null;
    currentPageUrl = this.router.url;
    this.navItems = this.routingUtilityService.getCurrentLoggedInUserNavItems();
    this.selectedNavIndex = this.navItems.length > 0 ? 1 : 0;
    this.computeSelectedNavIndex(currentPageUrl);
  }

  ngOnInit(): void { }

  computeSelectedNavIndex(path: string) {
    let currentItem = this.navItems.find((item) => item.path[0] && item.path[0].startsWith(path));
    this.selectedNavIndex = (currentItem && currentItem.index) ? currentItem.index : null;
  }

  toggleNavBar(event) {
    this.showNav = !this.showNav;
    this.selectedNavIndex = (event.index != undefined) ? event.index : this.selectedNavIndex;
    let action = event.path;
    switch (action) {
      case "logout":
        this.userService.logout();
        break;
      default:
        event && event.path && event.path.length && this.router.navigate(event.path);
        break;
    }
  }

  closeSideNav() {
    this.showNav = false;
  }

}