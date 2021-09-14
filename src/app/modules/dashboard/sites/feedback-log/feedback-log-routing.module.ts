import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedbackLogComponent } from './feedback-log/feedback-log.component';

const routes: Routes = [{
  path: '',
  component: FeedbackLogComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackLogRoutingModule { }
