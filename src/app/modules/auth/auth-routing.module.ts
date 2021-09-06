import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PATHS } from 'src/app/enums';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: PATHS.LOGIN,
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: PATHS.UNAUTHORIZED,
    component: UnauthorizedComponent
  },
  {
    path: PATHS.FORGOT_PASSWORD,
    component: ForgotPasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: PATHS.RECOVER_PASSWORD,
    component: RecoverPasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: PATHS.RESET_PASSWORD,
    component: ResetPasswordComponent,
    data: {title: 'Reset Password', description: null},
    canActivate: [AuthGuard]
  },
  {
    path: PATHS.WELCOME_RESET_PASSWORD,
    component: ResetPasswordComponent,
    data: {title: 'Welcome to WAVES', description: 'Please set your password to continue'},
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: PATHS.LOGIN,
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
