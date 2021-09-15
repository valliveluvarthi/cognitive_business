import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface UserElement {
  email: string;
  id: string;
  siteRole: string;
}

export interface UserData {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
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
  USER_DATA: UserData[] = [];
  selectedUserRole: string = "";
  selectedUser: string = "";
  dupllicateEntry: boolean = false;

  @Input() headerTitle: number;
  @Input() dialogType: string;
  @Input() item;
  userRoles;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter();
  siteKey: any;
  userId: any;

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
    this.getAdminUsers();
  }
  getAdminUsers() {
    this.adminService.getAdminUsers().subscribe((data: Array<Object>) => {
      this.USER_DATA = [];
      data.forEach(element => {
        let user: UserData = {
          id: element['id'],
          name: element['firstname'] + " " + element['lastname'],
          role: element['role'],
          email: element['email'],
          status: element['status']
        }
        this.USER_DATA.push(user);
      });
      if (this.USER_DATA.length > 0) {
        this.userId = this.USER_DATA[0].id;
        this.selectedUser = this.USER_DATA[0].email;
        this.form.controls['user'].setValue(this.selectedUser);
      }
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
  getSiteUsers() {
    this.adminService.getSiteUsers(this.siteKey).subscribe((data: Array<Object>) => {
      console.log(data);
      this.ELEMENT_DATA = [];
      data.forEach((element, index) => {
        let user: UserElement = {
          email: element['email'],
          id: element['id'],
          siteRole: element['siteRole']
        }
        this.ELEMENT_DATA.push(user);
        this.form.addControl(user.email, this.fb.control(user.siteRole));
      });
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
      this.userRoles = data;
      if (this.userRoles.length > 0) {
        this.selectedUserRole = this.userRoles[0];
        this.form.controls['role'].setValue(this.selectedUserRole);
      }
    },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
  }
  selectUserRole(selectedRole, i, row) {
    this.selectedUserRole = selectedRole;
    if (i === '') {
      this.form.controls['role'].setValue(selectedRole);
      this.form.controls['role'].setErrors(null);
    } else {
      this.form.controls[row.email].setValue(selectedRole);
      this.form.controls[row.email].setErrors(null);
      // to update the role info 
      let sitekey = this.item.key;
      let data = {
        role: this.form.controls[row.email].value,
      }
      this.adminService.addUserToSite(row.id, sitekey, data).subscribe((data: Array<Object>) => {
        this.util.notification.success({
          title: 'Success',
          msg: "User role updated successfully."
        });
      },
        (err) => {
          this.util.notification.error({
            title: "Error",
            msg: err
          });
        });
    }
  }
  selectSiteUser(selectedUser) {
    this.userId = selectedUser.id;
    this.selectedUser = selectedUser.email;
    this.form.controls['user'].setValue(selectedUser.email);
    this.form.controls['user'].setErrors(null);

    this.ELEMENT_DATA.forEach(element => {
      if (element.email === selectedUser.email) {
        this.dupllicateEntry = true;
      } else {
        this.dupllicateEntry = false;
      }
    })
  }
  onDelete(i, row) {
    let userId = row.id;
    let siteKey = this.item.key;
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
  addUserToSite() {
    let sitekey = this.item.key;
    let data = {
      role: this.form.controls['role'].value,
    }
    if (this.dupllicateEntry === true) {
      this.util.notification.warn({
        title: 'Warning',
        msg: "This user already exists."
      });
    }
    else {
      this.adminService.addUserToSite(this.userId, sitekey, data).subscribe((data: Array<Object>) => {
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
}

