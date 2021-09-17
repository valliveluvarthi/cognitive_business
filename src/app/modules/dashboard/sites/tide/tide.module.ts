import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDatepickerModule, NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';

import { TideRoutingModule } from './tide-routing.module';
import { TideComponent } from './tide/tide.component';

@NgModule({
  declarations: [
    TideComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    NgbDropdownModule,
    NgbModalModule,
    ChartsModule,
    FontAwesomeModule,
    TideRoutingModule
  ]
})
export class TideModule { }
