import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TideComponent } from './tide/tide.component';

const routes: Routes = [{
  path: '',
  component: TideComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TideRoutingModule { }
