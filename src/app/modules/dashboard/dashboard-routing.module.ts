import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/guards/auth.guard';
import { PATHS } from '../../enums';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
