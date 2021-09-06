import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATHS, ROLES } from 'src/app/enums';
import { AdminGuard } from 'src/app/guards/admin.guard';
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
      allowedRoles: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT],
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
      allowedRoles: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT],
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
      allowedRoles: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT],
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
      allowedRoles: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.MANAGEMENT],
    },
  },
  {
    path: PATHS.USER_NOTIFICATIONS,
    loadChildren: () =>
      import('./user-notifications/user-notifications.module').then(
        (mod) => mod.UserNotificationsModule
      ),
    canActivateChild: [AuthGuard],
    data: {
      allowedRoles: [ROLES.ADMIN],
    },
  },
  {
    path: PATHS.USER_MANAGEMENT,
    loadChildren: () =>
      import('./admin-user-management/admin-user-management.module').then(
        (mod) => mod.AdminUserManagementModule
      ),
    canActivateChild: [AuthGuard],
    data: {
      allowedRoles: [ROLES.ADMIN],
    },
  },
  {
    path: '',
    redirectTo: PATHS.DAILY_DASHBOARD,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
