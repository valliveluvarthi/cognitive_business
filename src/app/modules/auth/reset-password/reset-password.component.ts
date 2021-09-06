import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PATHS } from 'src/app/enums';
import { UserService } from 'src/app/services/user.service';

import { CommonUtilService } from 'src/app/services/common-util.service';

@Component({
  selector: 'cb-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public Paths = PATHS;
  form: FormGroup;
  formSubmitted: boolean = false;
  title: string;
  description: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private util: CommonUtilService
  ) {
    this.form = this.fb.group({
      'newPassword': ['', Validators.compose([Validators.required])],
      'confirmPassword': ['', Validators.compose([Validators.required])],
    });
  }
  
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.title = data.title;
      this.description = data.description;
    })
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.form.valid) {
      let map: ParamMap = this.route.snapshot.queryParamMap;
      let code = map.get('code');

      let newPassword = this.form.controls['newPassword'].value;
      let confirmPassword = this.form.controls['confirmPassword'].value;

      if (newPassword === confirmPassword) {
        this.userService.resetPassword(code, { password: newPassword }).subscribe((data) => {
          this.formSubmitted = false;
          this.goToRoute();
        },
        (err) => {
          this.util.notification.error({
            title: 'Error',
            msg: err
          });
        });
      }
    } else {
      console.log("The form is NOT valid");
    }
  }

  private goToRoute() {
    let returnUrl = `/${this.Paths.AUTH}/${this.Paths.LOGIN}`;

    this.router.navigate([returnUrl]);
  }

}
