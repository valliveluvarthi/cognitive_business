import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PATHS } from 'src/app/enums';
import { UserService } from 'src/app/services/user.service';

import { CommonUtilService } from 'src/app/services/common-util.service';

@Component({
  selector: 'cb-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public Paths = PATHS;
  form: FormGroup;
  formSubmitted: boolean = false;
  title: string = "Forgot Password";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private util: CommonUtilService
  ) {
    this.form = this.fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.email])]
    });
  }
  ngOnInit(): void {
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.form.valid) {
      let username = this.form.controls['username'].value;
      this.goToRoute(username);
      this.userService.forgotPassword({ email: username }).subscribe((data) => {
        this.formSubmitted = false;
      },
      (err) => {
        this.util.notification.error({
          title: 'Error',
          msg: err
        });
      });
    } else {
      console.log("The form is NOT valid");
    }
  }

  private goToRoute(username) {
    let returnUrl = `/${PATHS.AUTH}/${PATHS.RECOVER_PASSWORD}`;

    this.router.navigate([returnUrl], {state: {data: username}});
  }

}
