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
        { path: [`/${PATHS.SITES}/${PATHS.DAILY_DASHBOARD}`], label: "Daily Dashboard", accessibility: [ROLES.ADMIN, ROLES.MEMBER] },
        { path: [`/${PATHS.SITES}/${PATHS.WEEKLY_DASHBOARD}`], label: "Weekly Dashboard", accessibility: [ROLES.ADMIN, ROLES.MEMBER] },
        { path: [`/${PATHS.SITES}/${PATHS.FEEDBACK_LOG}`], label: "Accessibility Log", accessibility: [ROLES.ADMIN, ROLES.MEMBER] },
        { path: [`/${PATHS.SITES}/${PATHS.SITE_ACCESSIBILITY}`], label: "Accessibility Reporting", accessibility: [ROLES.ADMIN, ROLES.MEMBER] },
        { path: [`/${PATHS.SITES}/${PATHS.TIDE}`], label: "Tide", accessibility: [ROLES.ADMIN, ROLES.MEMBER] }
      ]
    },
    {
      sectionLabel: "Admin",
      items: [
        { path: [`/${PATHS.ADMIN}/${PATHS.USER_NOTIFICATIONS}`], label: "User Notifications", accessibility: [ROLES.ADMIN] },
        { path: [`/${PATHS.ADMIN}/${PATHS.USER_MANAGEMENT}`], label: "User Management", accessibility: [ROLES.ADMIN] },
        { path: [`/${PATHS.ADMIN}/${PATHS.SITES_ADMIN}`], label: "Sites", accessibility: [ROLES.ADMIN] }
      ]
    },
    {
      sectionLabel: "",
      items: [
        { path: "logout", label: "Logout", accessibility: [ROLES.ADMIN, ROLES.MEMBER] }
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