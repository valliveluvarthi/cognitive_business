import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATHS } from './enums';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';
// import { HomeComponent } from './modules/home/home/home.component';
import { PageNotFoundComponent } from './modules/shared/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: PATHS.AUTH,
    loadChildren: () =>
      import('./modules/auth/auth.module').then(
        mod => mod.AuthModule
      )
  },
  {
    path: '',
    component: DashboardComponent,
    loadChildren: () =>
    import('./modules/dashboard/dashboard.module').then(
      mod => mod.DashboardModule
    )
  },
  {
    path: '**',
    redirectTo: '/', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
