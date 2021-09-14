import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'cb-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.scss']
})
export class UpdateInfoComponent implements OnInit {
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  status: string;
  form: FormGroup;
  
  @Input() headerTitle: number;
  @Input() dialogType: string;
  @Input() item;
  @Input() userRoles;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter();

  userRole: string[] = [];
  selectedUserRole: string = "";

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private adminService: AdminService,
    private util: CommonUtilService
  ) { }

  ngOnInit(): void {
    this.status = this.item['status'].toLowerCase();
    this.selectedUserRole = this.item.role; 
    this.form = this.fb.group({
      'name': [this.item.name, Validators.compose([Validators.required])],
      'email': [this.item.email, Validators.compose([Validators.required, Validators.email])],
      'role': [this.item.role, Validators.compose([Validators.required])],
    });
  }

  selectUserRole(selectedRole) {
    this.selectedUserRole = selectedRole;
    this.form.controls['role'].setErrors(null);
  }

  updateUserInfo() {
    if(this.form.valid) {
      let userId = this.item.id;
      let payload = {
        "firstname": this.form.controls['name'].value.split(" ")[0],
        "lastname": this.form.controls['name'].value.split(" ")[1],
        "email": this.form.controls['email'].value,
        "role": this.selectedUserRole
      }
      this.adminService.updateUserInfo(userId, payload).subscribe((data) => {
        this.onSuccess.emit();
        this.activeModal.close();
        this.util.notification.success({
          title: "Success",
          msg: "Updated Successfully."
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

  deactivateAccount() {
    let userId = this.item.id;
    this.adminService.deactivateAccounts([userId]).subscribe((data) => {
      this.onSuccess.emit();
      this.activeModal.close();
      this.util.notification.success({
        title: "Success",
        msg: "Deactivate Successfully."
      });
    },
    (err) => {
      this.util.notification.error({
        title: "Error",
        msg: err
      });
    });
  }

  resendInvitation() {
    this.activeModal.close();
    let userId = this.item.id;
    this.adminService.resendInvitations([userId]).subscribe((data) => {
      this.util.notification.success({
        title: 'Success',
        msg: "Welcome Emails Sent."
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
