import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminSitesComponent } from './admin-sites/admin-sites.component';

const routes: Routes = [{
  path: '',
  component: AdminSitesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSitesRoutingModule { }
