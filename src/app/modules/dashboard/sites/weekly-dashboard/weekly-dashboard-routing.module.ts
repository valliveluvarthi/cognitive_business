import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeeklyDashboardComponent } from './weekly-dashboard/weekly-dashboard.component';

const routes: Routes = [{
  path: '',
  component: WeeklyDashboardComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeeklyDashboardRoutingModule { }
