import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PATHS } from 'src/app/enums';
import { UrlService } from 'src/app/services/url.service';
import { UserService } from 'src/app/services/user.service';
import { AdminService } from 'src/app/services/admin.service';

import { CommonUtilService } from 'src/app/services/common-util.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'cb-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public Paths = PATHS;
  form: FormGroup;
  formSubmitted: boolean = false;
  title: string = "User Login";
  selectedSite = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private urlService: UrlService,
    private userService: UserService,
    private adminService: AdminService,
    private util: CommonUtilService
  ) {
    this.form = this.fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.email])],
      'password': ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit(): void {
  }

  retrieveAndSetSites() {
    this.util.retrieveSitesList().subscribe( (response:any) => {
      if(response.length > 0){
        this.util.setSites(response);
        this.selectedSite = response[0];
        this.util.setSelectedSite(response[0]);
      }
    });
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.form.valid) {
      let username = this.form.controls['username'].value;
      let password = this.form.controls['password'].value;

      this.userService.login({ email: username, password }).subscribe((data) => {
        this.formSubmitted = false;
        this.retrieveAndSetSites();
        this.getAdminUsers(username);
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

  private goToRoute() {
    let map: ParamMap = this.route.snapshot.queryParamMap;
    let returnUrl = map.get('returnUrl');
    let queryParams: any = {};

    if (returnUrl) {
      queryParams = this.urlService.getQueryParams(returnUrl);
      returnUrl = this.urlService.shortenUrlIfNecessary(returnUrl);
    } else {       
      returnUrl = this.selectedSite.key ? `/${PATHS.SITES}`.replace(':site', this.selectedSite.key) : "";
    }
    
    this.router.navigate([returnUrl], queryParams);
  }

  private getAdminUsers(email) {
    this.adminService.getAdminUsers().pipe(
      finalize(() => {this.goToRoute();}),
    ).subscribe((data: Array<Object>) => {
      let loggedInUser = data.filter(obj => {
        return obj['email'] === email
      })
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser[0]));
      let isAdminUser = this.adminService.isAdminLoggedIn();
      if(isAdminUser) {
        this.adminService.isAdmin.next(true);
      }
    })
  }
}
