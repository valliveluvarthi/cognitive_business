import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserNotificationsComponent } from './user-notifications/user-notifications.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbTooltipModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { UserNotificationsRoutingModule } from './user-notification-routing.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';



@NgModule({
  declarations: [
    UserNotificationsComponent
  ],
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgbModalModule,
    FontAwesomeModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    UserNotificationsRoutingModule
  ]
})
export class UserNotificationsModule { }
