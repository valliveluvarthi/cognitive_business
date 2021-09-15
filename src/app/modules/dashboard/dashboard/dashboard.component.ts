import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, PRIMARY_OUTLET, Router } from '@angular/router';
import { PATHS } from 'src/app/enums';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { RoutingUtilityService } from 'src/app/services/routing-utility.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'cb-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public showNav = false;
  public navItems = [];
  public selectedNavIndex = 0;

  public sites = [];
  public selectedSite = null;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private routingUtilityService: RoutingUtilityService,
    private userService: UserService,
    private utility: CommonUtilService
  ) {
    let currentPageUrl = null;
    currentPageUrl = this.router.url;
    this.navItems = this.routingUtilityService.getCurrentLoggedInUserNavItems();
    this.selectedNavIndex = this.navItems.length > 0 ? 1 : 0;
    this.selectedSite = this.utility.getSelectedSite();
    if (this.selectedSite) {
      this.sites = this.utility.getSites();
      if (this.sites.length === 0) {
        this.router.navigateByUrl(PATHS.CONTACT_ADMIN);
      } else {
        this.redirectToPath(currentPageUrl);
      }
    } else {
      this.utility.retrieveSitesList().subscribe((response: any) => {
        if (response.length > 0) {
          this.sites = response;
          if (this.sites.length === 0) {
            this.router.navigateByUrl(PATHS.CONTACT_ADMIN);
          } else {
            this.selectedSite = response[0];
            this.utility.setSites(response);
            this.utility.setSelectedSite(response[0]);
            let path = `/${PATHS.SITES}/${PATHS.DAILY_DASHBOARD}`.replace(':site', this.selectedSite.key);
            this.redirectToPath((currentPageUrl && currentPageUrl === "/" ? path : currentPageUrl));
          }
        }
      });
    }
  }

  ngOnInit(): void { }

  computeSelectedNavIndex(path: string) {
    const tree = this.router.parseUrl(path);
    const children = tree.root.children[PRIMARY_OUTLET];
    const segments = children.segments;
    let currentItem = null;

    if (segments.length && segments.length > 0) {
      currentItem = this.navItems.find((item) => item.path[0] && segments[segments.length - 1].path && item.path[0].includes(segments[segments.length - 1].path));
    }
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
        if (event && event.path && event.path.length) {
          event.path[0] = event.path[0].startsWith(`/${PATHS.SITES}`) ?
            event.path[0].replace(':site', this.selectedSite.key) :
            event.path[0];

          this.router.navigate(event.path);
        }
        break;
    }
  }

  closeSideNav() {
    this.showNav = false;
  }

  redirectToPath(path) {
    if (path && path.length > 0) {
      this.router.navigate([path]);
    } else {
      this.router.navigate([path.replace(':site', this.selectedSite.key)]);
    }
    this.computeSelectedNavIndex(path);
  }

  siteOnChange(site) {
    this.selectedSite = site;
    this.utility.setSelectedSite(site);
    if (this.router.url.startsWith("/sites")) {
      const urlTree = this.router.parseUrl(this.router.url);
      urlTree.root.children['primary'].segments[1].path = this.selectedSite.key;
      this.router.navigateByUrl(urlTree);
    }
  }

  navigateToHome() {
    let path = `/${PATHS.SITES.replace(":site", this.selectedSite.key)}/${PATHS.DAILY_DASHBOARD}`;
    // this.router.navigate([path]);
    window.location.replace(path);
  }
}
