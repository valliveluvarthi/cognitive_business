import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NavComponent } from './nav/nav.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LogoComponent } from './logo/logo.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [PageNotFoundComponent, NavComponent, HeaderComponent, FooterComponent, LogoComponent],
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    NgbDropdownModule
  ],
  exports: [
    PageNotFoundComponent,
    NavComponent,
    HeaderComponent,
    FooterComponent,
    LogoComponent
  ]
})
export class SharedModule { }
