import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AdminSitesComponent } from './admin-sites/admin-sites.component';
import { AdminSitesRoutingModule } from './admin-sites-routing.module';
import { EditUserInfoComponent } from './edit-user-info/edit-user-info.component';


@NgModule({
  declarations: [
    AdminSitesComponent,
    EditUserInfoComponent
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
    AdminSitesRoutingModule,
  ]
})
export class AdminSitesModule { }
