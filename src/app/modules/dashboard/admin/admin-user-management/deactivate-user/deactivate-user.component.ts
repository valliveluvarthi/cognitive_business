import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';

@Component({
  selector: 'cb-deactivate-user',
  templateUrl: './deactivate-user.component.html',
  styleUrls: ['./deactivate-user.component.scss']
})
export class DeactivateUserComponent implements OnInit {
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  @Input() headerTitle: number;
  @Input() dialogType: string;
  @Input() selection;
  @Input() userRoles;
  userRole: string[] = [];
  selectedUserRole: string;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    private adminService: AdminService,
    private util: CommonUtilService
  ) { }

  ngOnInit(): void {
  }

  selectUserRole(item) {
    this.selectedUserRole = item;
  }

  getSelectedUserIds() {
    let selected = this.selection.selected;
    let userIds = []
    if(selected.length > 0) {
      selected.forEach(element => {
        userIds.push(element['id'])
      });
    }
    return userIds;
  }

  deactivateAccounts() {
    let userIds = this.getSelectedUserIds();
    
    if(userIds) {  
      this.adminService.deactivateAccounts(userIds).subscribe((data) => {
        this.onSuccess.emit();
        this.activeModal.close();
        this.util.notification.success({
          title: "Success",
          msg: "Deactivated Successfully." 
        });
      },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      });
      this.selection.clear();
    }
  }

  updateUsersRole() {
    let userIds = this.getSelectedUserIds();
    
    if(userIds && this.selectedUserRole) {  
      let payload = {
        "userIds": userIds,
        "role": this.selectedUserRole
      }
      this.adminService.updateUsersRole(payload).subscribe((data) => {
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
      this.selection.clear();
    }
  }

}
