import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ContactAdminComponent } from './dashboard/contact-admin/contact-admin.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ContactAdminComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ],
})
export class DashboardModule { 
  constructor(){}
}
