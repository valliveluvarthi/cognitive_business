import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminUserManagementComponent } from './admin-user-management/admin-user-management.component';

const routes: Routes = [{
  path: '',
  component: AdminUserManagementComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminUserManagementRoutingModule { }
