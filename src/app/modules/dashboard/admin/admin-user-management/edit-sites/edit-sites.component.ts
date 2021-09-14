import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface UserElement {
  site: string;
  name: string;
  siteRole: string;
}

@Component({
  selector: 'cb-edit-sites',
  templateUrl: './edit-sites.component.html',
  styleUrls: ['./edit-sites.component.scss']
})



export class EditSitesComponent implements OnInit {
  form: FormGroup;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  ELEMENT_DATA: UserElement[] = [];
  selectedUserRole: string = "";
  selectedUserSite: string = "";

  @Input() headerTitle: number;
  @Input() dialogType: string;
  @Input() item;
  @Input() userRoles;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private adminService: AdminService,
    private util: CommonUtilService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      'site': [""],
      'role': [this.item.role, Validators.compose([Validators.required])],
    });
    this.getUserSites();
    this.getUserRoles();
  }
  getUserSites() {
    let userId = this.item.id;
    this.adminService.getUserSitesList(userId).subscribe((data: Array<Object>) => {
      this.ELEMENT_DATA = [];
      data.forEach((element, index) => {
        let user: UserElement = {
          site: element['key'],
          name: element['name'],
          siteRole: element['siteRole']
        }
        this.ELEMENT_DATA.push(user);
        this.form.addControl(user.site, this.fb.control(this.item.role));
      });
      if(this.ELEMENT_DATA.length > 0){
        this.selectedUserSite = this.ELEMENT_DATA[0].site;
        this.form.controls['site'].setValue(this.selectedUserSite);
      }
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
  getUserRoles() {
    this.adminService.getSiteRoles().subscribe((data) => {
      console.log(data)
      this.userRoles = data;
      if(this.userRoles.length > 0){
        this.selectedUserRole = this.userRoles[0];
      }
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
  selectUserRole(selectedRole, i,row) {
    this.selectedUserRole = selectedRole;
    if (i === '') {
      this.form.controls['role'].setValue(selectedRole);
      this.form.controls['role'].setErrors(null);
    } else {
      this.form.controls[row.site].setValue(selectedRole);
      this.form.controls[row.site].setErrors(null);
    }
  }
  selectUserSite(selectedSite) {
    this.selectedUserSite = selectedSite.site;
    this.form.controls['site'].setValue(selectedSite.site);
    this.form.controls['site'].setErrors(null);
  }
  onDelete(i, row) {
    let userId = this.item.id;
    let siteKey = row.site;
    this.ELEMENT_DATA.splice(i, 1);
    this.adminService.deleteSiteFromUser(userId, siteKey).subscribe((data: Array<Object>) => {
      this.util.notification.success({
        title: 'Success',
        msg: "Site deleted successfully."
      });
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
  addSiteToUser() {
    let userId = this.item.id;
    let data = {
      role : this.form.controls['role'].value,
    }
    this.adminService.addSiteToUser(userId,this.form.controls['site'].value,data).subscribe((data: Array<Object>) => {
      this.util.notification.success({
        title: 'Success',
        msg: "User add to site successfully."
      });
      this.activeModal.dismiss();
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
}
