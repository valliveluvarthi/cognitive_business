import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATHS, ROLES } from 'src/app/enums';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: PATHS.DAILY_DASHBOARD,
    loadChildren: () =>
      import('./daily-dashboard/daily-dashboard.module').then(
        (mod) => mod.DailyDashboardModule
      ),
    canActivateChild: [AuthGuard],
  },
  {
    path: PATHS.WEEKLY_DASHBOARD,
    loadChildren: () =>
      import('./weekly-dashboard/weekly-dashboard.module').then(
        (mod) => mod.WeeklyDashboardModule
      ),
    canActivateChild: [AuthGuard],
    data: {
      allowedRoles: [ROLES.ADMIN, ROLES.MEMBER],
    },
  },
  {
    path: PATHS.FEEDBACK_LOG,
    loadChildren: () =>
      import('./feedback-log/feedback-log.module').then(
        (mod) => mod.FeedbackLogModule
      ),
    canActivateChild: [AuthGuard],
    data: {
      allowedRoles: [ROLES.ADMIN, ROLES.MEMBER],
    },
  },
  {
    path: PATHS.TIDE,
    loadChildren: () =>
      import('./tide/tide.module').then(
        (mod) => mod.TideModule
      ),
    canActivateChild: [AuthGuard],
    data: {
      allowedRoles: [ROLES.ADMIN, ROLES.MEMBER],
    },
  },
  {
    path: PATHS.SITE_ACCESSIBILITY,
    loadChildren: () =>
      import('./site-accessibility/site-accessibility.module').then(
        (mod) => mod.SiteAccessibilityModule
      ),
    canActivateChild: [AuthGuard],
    data: {
      allowedRoles: [ROLES.ADMIN, ROLES.MEMBER],
    },
  },
  {
    path: '',
    redirectTo: PATHS.DAILY_DASHBOARD,
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SitesRoutingModule { }
