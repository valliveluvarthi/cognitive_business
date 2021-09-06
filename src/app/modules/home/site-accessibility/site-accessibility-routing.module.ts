import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SiteAccessibilityComponent } from './site-accessibility/site-accessibility.component';

const routes: Routes = [{
  path: '',
  component: SiteAccessibilityComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteAccessibilityRoutingModule { }
