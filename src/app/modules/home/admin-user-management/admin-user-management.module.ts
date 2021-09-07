import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserManagementComponent } from './admin-user-management/admin-user-management.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { AdminUserManagementRoutingModule } from './admin-user-management-routing.module';
import { DeactivateUserComponent } from './deactivate-user/deactivate-user.component';
import { UpdateInfoComponent } from './update-info/update-info.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { EditSitesComponent } from './edit-sites/edit-sites.component';



@NgModule({
  declarations: [
    AdminUserManagementComponent,
    DeactivateUserComponent,
    UpdateInfoComponent,
    InviteUserComponent,
    EditSitesComponent
  ],
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbModalModule,
    FontAwesomeModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    AdminUserManagementRoutingModule
  ]
})
export class AdminUserManagementModule { }
