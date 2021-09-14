import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyDashboardComponent } from './daily-dashboard/daily-dashboard.component';

const routes: Routes = [{
  path: '',
  component: DailyDashboardComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyDashboardRoutingModule { }
