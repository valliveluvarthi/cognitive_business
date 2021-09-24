import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDatepickerModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';

import { WeeklyDashboardRoutingModule } from './weekly-dashboard-routing.module';
import { WeeklyDashboardComponent } from './weekly-dashboard/weekly-dashboard.component';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [WeeklyDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    NgChartsModule,
    MatSliderModule,
    FontAwesomeModule,
    WeeklyDashboardRoutingModule
  ]
})
export class WeeklyDashboardModule { }
