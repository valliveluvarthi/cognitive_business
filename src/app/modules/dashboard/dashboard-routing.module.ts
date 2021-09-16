import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/guards/auth.guard';
import { PATHS } from '../../enums';
import { ContactAdminComponent } from './dashboard/contact-admin/contact-admin.component';

const routes: Routes = [
  {
    path: PATHS.SITES,
    loadChildren: () =>
      import('./sites/sites.module').then(
        mod => mod.SitesModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: PATHS.ADMIN,
    loadChildren: () =>
      import('./admin/admin.module').then(
        mod => mod.AdminModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path : PATHS.ACCESS_DENIED,
    component : ContactAdminComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
