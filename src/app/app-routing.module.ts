import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATHS } from './enums';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './modules/home/home/home.component';
import { PageNotFoundComponent } from './modules/shared/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: PATHS.HOME,
    component: HomeComponent,
    loadChildren: () =>
      import('./modules/home/home.module').then(
        mod => mod.HomeModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: PATHS.AUTH,
    loadChildren: () =>
      import('./modules/auth/auth.module').then(
        mod => mod.AuthModule
      )
  },
  {
    path: '',
    redirectTo: PATHS.AUTH,
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
