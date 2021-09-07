import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeactivateUserComponent } from '../deactivate-user/deactivate-user.component'; 
import { UpdateInfoComponent } from '../update-info/update-info.component';
import { InviteUserComponent } from '../invite-user/invite-user.component';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';

export interface UserElement {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
}


@Component({
  selector: 'cb-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit {

  displayedColumns: string[] = ['select', 'id', 'name', 'role', 'email', 'status', 'updateinfo','editsites', 'resendinvite'];
  ELEMENT_DATA: UserElement[] = [];
  dataSource = new MatTableDataSource<UserElement>(this.ELEMENT_DATA);
  selection = new SelectionModel<UserElement>(true, []);
  totalRow: number;
  userRoles: string[];
  innerWidth: number;

  constructor(
    private modalService: NgbModal,
    private adminService: AdminService,
    private changeDetectorRefs: ChangeDetectorRef,
    private util: CommonUtilService
  ) { }

  ngOnInit(): void {
    this.getAdminUsers();
    this.getUserRoles();
  }

  getAdminUsers() {
    this.adminService.getAdminUsers().subscribe((data: Array<Object>) => {
      this.ELEMENT_DATA = [];
      data.forEach(element => {
        let user: UserElement = {
          id: element['id'],
          name: element['firstname'] + " " + element['lastname'],
          role: element['role'],
          email: element['email'],
          status: element['status']
        } 
        this.ELEMENT_DATA.push(user);
      });
      
      this.dataSource = new MatTableDataSource<UserElement>(this.ELEMENT_DATA);
      this.changeDetectorRefs.detectChanges();
      
      this.totalRow = this.ELEMENT_DATA.length;
  
    },
    (err) => {
      this.util.notification.error({
        title: "Error",
        msg: err
      });
    });
  }

  getUserRoles() {
    this.adminService.getUserRoles().subscribe((data: string[]) => {
      this.userRoles = data;
    },
    (err) => {
      this.util.notification.error({
        title: "Error",
        msg: err
      });
    });
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

  resendInvitation(userId?) {
    let userIds = userId ? [userId] : this.getSelectedUserIds();
    
    if(userIds) {  
      this.adminService.resendInvitations(userIds).subscribe((data) => {
        this.util.notification.success({
          title: 'Success',
          msg: "Welcome Emails Sent."
        });
        this.selection.clear();
      },
      (err) => {
        console.log(err);
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: UserElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  reloadUserData() {
    this.getAdminUsers();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openModal(dialog_type: string) {
    let windowClass: string;
    windowClass = dialog_type === "deactivate" ? "modal-wrapper deactivate-modal" : "modal-wrapper";
    const modalRef = this.modalService.open(DeactivateUserComponent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true, windowClass: windowClass });
    modalRef.componentInstance.headerTitle = this.selection.selected.length;
    modalRef.componentInstance.dialogType = dialog_type;
    modalRef.componentInstance.selection = this.selection;
    modalRef.componentInstance.userRoles = this.userRoles;
    modalRef.componentInstance.onSuccess.subscribe(() => {
      this.reloadUserData();
    });
  }

  openUpdateInfoModal(item) {
    const modalRef = this.modalService.open(UpdateInfoComponent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true, windowClass: "modal-wrapper" });
    modalRef.componentInstance.userRoles = this.userRoles;
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.onSuccess.subscribe(() => {
      this.reloadUserData();
    });
  }

  openInviteUserModal() {
    const modalRef = this.modalService.open(InviteUserComponent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true, windowClass: "modal-wrapper invite-user" });
    modalRef.componentInstance.userRoles = this.userRoles;
    modalRef.componentInstance.onSuccess.subscribe(() => {
      this.reloadUserData();
    });
  }
}
