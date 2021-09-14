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
  selector: 'cb-edit-user-info',
  templateUrl: './edit-user-info.component.html',
  styleUrls: ['./edit-user-info.component.scss']
})

export class EditUserInfoComponent implements OnInit {
  form: FormGroup;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  ELEMENT_DATA: UserElement[] = [];
  selectedUserRole: string = "";
  selectedUser: string = "";

  @Input() headerTitle: number;
  @Input() dialogType: string;
  @Input() item;
  userRoles;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter();
  siteKey: any;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private adminService: AdminService,
    private util: CommonUtilService,
  ) { }

  ngOnInit(): void {
    this.siteKey = this.item.key;
    this.form = this.fb.group({
      'user': [""],
      'role': ["", Validators.compose([Validators.required])],
    });
    this.getSiteUsers();
    this.getUserRoles();
  }

  getSiteUsers() {
    this.adminService.getSiteUsers(this.siteKey).subscribe((data: Array<Object>) => {
      console.log(data);
      // this.ELEMENT_DATA = [];
      // data.forEach((element, index) => {
      //   let user: UserElement = {
      //     site: element['key'],
      //     name: element['name'],
      //     siteRole: element['siteRole']
      //   }
      //   this.ELEMENT_DATA.push(user);
      //   this.form.addControl(user.site, this.fb.control(this.item.role));
      // });
      // if(this.ELEMENT_DATA.length > 0){
      //   this.selectedUser = this.ELEMENT_DATA[0].site;
      //   this.form.controls['site'].setValue(this.selectedUser);
      // }
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
  getUserRoles() {
    this.adminService.getSiteRoles(this.siteKey).subscribe((data) => {
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
    this.selectedUser = selectedSite.site;
    this.form.controls['site'].setValue(selectedSite.site);
    this.form.controls['site'].setErrors(null);
  }
  onDelete(i, row) {
    let userId = this.item.id;
    let siteKey = row.site;
    this.ELEMENT_DATA.splice(i, 1);
    this.adminService.deleteUserFromSite(userId, siteKey).subscribe((data: Array<Object>) => {
      this.util.notification.success({
        title: 'Success',
        msg: "User deleted successfully."
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
    let userId = 3;
    let sitekey = this.item.key;
    let data = {
      role : "Admin",
    }

    // this.adminService.addUserToSite(userId,this.form.controls['site'].value,data).subscribe((data: Array<Object>) => {
    this.adminService.deleteUserFromSite(userId,sitekey).subscribe((data: Array<Object>) => {
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

