import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { SiteAccessibilityRoutingModule } from './site-accessibility-routing.module';
import { SiteAccessibilityComponent } from './site-accessibility/site-accessibility.component';
import { SiteAVsBComponent } from './site-a-vs-b/site-a-vs-b.component';
import { SiteAccessibleComponent } from './site-accessible/site-accessible.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    SiteAccessibilityComponent,
    SiteAVsBComponent,
    SiteAccessibleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    ChartsModule,
    FontAwesomeModule,
    SiteAccessibilityRoutingModule
  ]
})
export class SiteAccessibilityModule { }
