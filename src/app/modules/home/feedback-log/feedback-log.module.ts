import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { FeedbackLogRoutingModule } from './feedback-log-routing.module';
import { FeedbackLogComponent } from './feedback-log/feedback-log.component';
import { AddEditLogsComponent } from './add-edit-logs/add-edit-logs.component';

@NgModule({
  declarations: [
    FeedbackLogComponent,
    AddEditLogsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbPopoverModule,
    NgbDatepickerModule,
    FontAwesomeModule,
    FeedbackLogRoutingModule
  ]
})
export class FeedbackLogModule { }
