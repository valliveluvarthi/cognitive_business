import { Injectable } from '@angular/core';

import { UserService } from './user.service';

import { PATHS, ROLES } from 'src/app/enums';

@Injectable({
  providedIn: 'root'
})
export class RoutingUtilityService {

  private sideBarSections = [
    {
      sectionLabel: "Dashboards",
      items: [
        { path: [`/${PATHS.HOME}/${PATHS.DAILY_DASHBOARD}`], label: "Daily Decision", accessibility: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT] },
        { path: [`/${PATHS.HOME}/${PATHS.WEEKLY_DASHBOARD}`], label: "Weekly Decision", accessibility: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT] },
        { path: [`/${PATHS.HOME}/${PATHS.FEEDBACK_LOG}`], label: "Accessibility Log", accessibility: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT] },
        { path: [`/${PATHS.HOME}/${PATHS.SITE_ACCESSIBILITY}`], label: "Accessibility Reporting", accessibility: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT] },
        { path: [`/${PATHS.HOME}/${PATHS.TIDE}`], label: "Tide", accessibility: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT] }
      ]
    },
    {
      sectionLabel: "Admin",
      items: [
        { path: [`/${PATHS.HOME}/${PATHS.USER_NOTIFICATIONS}`], label: "User Notifications", accessibility: [ROLES.ADMIN] },
        { path: [`/${PATHS.HOME}/${PATHS.USER_MANAGEMENT}`], label: "User Management", accessibility: [ROLES.ADMIN] },
        { path: [`/${PATHS.HOME}/${PATHS.SITES}`], label: "Sites", accessibility: [ROLES.ADMIN] }
      ]
    },
    {
      sectionLabel: "",
      items: [
        { path: "logout", label: "Logout", accessibility: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT] }
      ]
    },
  ]

  constructor(private userService: UserService) { }

  getCurrentLoggedInUserNavItems(): any[] {
    let navItems = [];

    let userInfo = this.userService.getLoggedInUserInfo();
    this.sideBarSections.forEach(section => {
      let items = [];
      section.items.forEach(links => {
        if (userInfo && userInfo.role && links.accessibility.includes(userInfo.role)) {
          items.push({ type: 'link', ...links });
        }
      });
      if (items.length && items.length > 0) {
        if (section.sectionLabel && section.sectionLabel.length > 0) {
          items = [{ path: [], label: section.sectionLabel, type: 'title' }, ...items];
        }
        navItems = navItems.concat(items);
      }
    });

    return navItems.map((item, index) => ({ index: index, ...item }));
  }
}