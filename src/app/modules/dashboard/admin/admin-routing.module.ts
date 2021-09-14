import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATHS, ROLES } from 'src/app/enums';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
