import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbDatepickerModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChartsModule } from 'ng2-charts';
import { MatSliderModule } from '@angular/material/slider';

import { DailyDashboardRoutingModule } from './daily-dashboard-routing.module';
import { DailyDashboardComponent } from './daily-dashboard/daily-dashboard.component';

@NgModule({
  declarations: [DailyDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    ChartsModule,
    MatSliderModule,
    FontAwesomeModule,
    DailyDashboardRoutingModule
  ]
})
export class DailyDashboardModule { }
