import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faChevronDown, faPlusCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'cb-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss']
})
export class InviteUserComponent implements OnInit {
  faChevronDown = faChevronDown;
  faPlusCircle = faPlusCircle;
  faTimesCircle = faTimesCircle;
  faTimes = faTimes;
  selectedUserRole: string[] = [""];
  createdUsersId: number[] = [];
  
  userForm: FormGroup;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter();
   
  constructor(
      private fb:FormBuilder,
      public activeModal: NgbActiveModal,
      private adminService: AdminService,
      private util: CommonUtilService
    ) {
   
    this.userForm = this.fb.group({
      items: this.fb.array([]) ,
    });
  }

  ngOnInit(): void {}
  
  items() : FormArray {
    return this.userForm.get("items") as FormArray
  }
   
  newItem(): FormGroup {
    return this.fb.group({
      firstname: ['', Validators.compose([Validators.required])],
      lastname: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      role: ['', Validators.compose([Validators.required])],
    })
  }

  selectUserRole(index, item) {
    this.selectedUserRole[index] = item;
    this.userForm.controls['items'].value[index]['role'] = item;
    this.userForm.controls['items']['controls'][index]['controls']['role'].setErrors(false);
  }
   
  addItem() {
    this.items().push(this.newItem());
  }
   
  removeItem(i:number) {
    this.items().removeAt(i);
  }

  getFormValues() {
    let values = this.userForm.controls['items'].value;
    let payload = [];
    values.forEach((element, index) => {
      let firstname = element['firstname'];
      let lastname = element['lastname'];
      payload.push(
        {
          "firstname": firstname,
          "lastname": lastname,
          "email": element['email'],
          "role": this.selectedUserRole[index]
        }
      )
    });
    return payload;
  }

  createUsers(): Observable<Object> {
    if(this.userForm.valid) {
      let payload = this.getFormValues();
      var subject = new Subject<Object>();
      if(payload.length > 0) {
          this.activeModal.close();
          this.onSuccess.emit();
          this.adminService.createUsers(payload).subscribe((data) => {
            let successMessage =  payload.length === 1 ? 'User created successfully' : 'Users created successfully' 
            this.util.notification.success({
              title: "Success",
              msg: successMessage
            });
            subject.next(data);
          },
          (err) => {
            this.util.notification.error({
              title: "Error",
              msg: err
            });
          });
        }
        else {
          this.util.notification.error({
            title: "Error",
            msg: "Please add atleast one user."
          });
        }
      }
    return subject.asObservable();
  }

  createUserAndSendInvite() {
    this.createUsers().subscribe((userId) => {
      this.adminService.resendInvitations(userId).subscribe((data) => {
        this.util.notification.success({
          title: 'Email Sent',
          msg: data['message']
        });
      },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
    });
  }
}
