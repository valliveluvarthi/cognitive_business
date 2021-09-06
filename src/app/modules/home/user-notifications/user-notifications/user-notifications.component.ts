import { Component, OnInit } from '@angular/core';
import { faChevronDown, faPlusCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { DecisionService } from 'src/app/services/decision.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ReportTypes {
  id: number;
  name: string;
  description: string;
  isOnSchedule: string;
  scheduledTime: string;
  roles: string[];
}

export interface ReportSubscriptions {
  reportId: number,
  name: string,
  isSubscribed: boolean
}

@Component({
  selector: 'cb-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss']
})
export class UserNotificationsComponent implements OnInit {

  faChevronDown = faChevronDown;
  faPlusCircle = faPlusCircle;
  faTimesCircle = faTimesCircle;
  faTimes = faTimes;
  loading: boolean = true;

  timeRange: string[] = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  modalHeaderTitle: string;
  selectedTime: string[] = [];
  previousSelectedTime: string;
  newSelectedTime: string;
  selectedUserRole: string[] = [];
  userRoles: string[];
  siteKey: string;
  reportTypes: ReportTypes[];
  currentIndex: number = 0;
  reportUserRoles: string[][] = [[]];
  reportSubscriptions: ReportSubscriptions[];
  
  constructor(
    private modalService: NgbModal,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private decisionService: DecisionService,
    private notificationService: NotificationService,
    private util: CommonUtilService
  ) { }

  ngOnInit(): void {
    this.getUserRoles();
    this.getSites();
  }

  getSites() {
    this.decisionService.getSites().subscribe((response: any) => {
      this.siteKey = response[0]['key'];
      this.getReportTypes();
      this.getReportSubscriptions();
    },
    (err) => {
      this.util.notification.error({
        title: "Error",
        msg: err
      });
      this.loading = false;
    })
  }

  getReportTypes() {
    this.notificationService.getReportTypes(this.siteKey).subscribe((response: any) => {
      this.reportTypes = response;
      response.forEach((element, index) => {
        this.selectedTime[index] = element.scheduledTime;
        this.reportUserRoles[index] = this.userRoles.filter((e) => !element.roles.includes(e))
      });
    })
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

  updateTime(time, content, index) {
    this.openUpdateTimeModal(time, content, index);
  }

  openModal(content, index, modalType?) {
    this.currentIndex = index;
    let dialogTitle = modalType === "UPDATE_TIME" ? "Update Time for " : "Add User Role to "; 
    this.modalHeaderTitle = dialogTitle + this.reportTypes[index].name;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true, windowClass: 'modal-wrapper' });
  }

  openUpdateTimeModal(time, content, index) {
    this.previousSelectedTime = this.selectedTime[index];
    this.newSelectedTime = time;
    this.openModal(content, index, "UPDATE_TIME");
  }

  selectUserRole(role) {
    this.selectedUserRole[this.currentIndex] = role;
  }

  closeAddUserRoleModal() {
    let role = this.selectedUserRole[this.currentIndex];
    if(role) {
      this.addRole(role);
      this.reportTypes[this.currentIndex].roles.push(role);
      this.reportUserRoles[this.currentIndex] = this.reportUserRoles[this.currentIndex].filter(e => e !== role);
      this.selectedUserRole[this.currentIndex] = null;
    }
    this.modalService.dismissAll();
  }

  addRole(role: string) {
    if(role) {
      let reportTypeId = this.reportTypes[this.currentIndex].id;
      let reportRole = role;  
      this.notificationService.addRole(this.siteKey, reportTypeId, reportRole).subscribe((response: any) => {
        this.util.notification.success({
          title: "Success",
          msg: "Role Added Successfully"
        });
      },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      })
    }
  }

  removeReportRole(role, index) {
    let undoAction = false;
    let previousReportTypeRoles = this.reportTypes[index].roles;  
    this.reportTypes[index].roles = this.reportTypes[index].roles.filter(e => e !== role);

    let snackBarRef = this.openSnackbar();
    snackBarRef.onAction().subscribe(() => {
      this.reportTypes[index].roles = previousReportTypeRoles;
      undoAction = true;
    });
    snackBarRef.afterDismissed().subscribe(() => {
      if (!undoAction) {
        this.reportUserRoles[index].push(role);
        this.removeRole(role, index);
      }
    })
  }

  openSnackbar() {
    return this.snackBar.open('User role removed from receiving notifications', 'Undo', {
      horizontalPosition: 'left',
      duration: 3000
    });
  }

  removeRole(role, index) {
    if(role) {
      let reportTypeId = this.reportTypes[index].id;
      let reportRole = role;  
      this.notificationService.removeRole(this.siteKey, reportTypeId, reportRole).subscribe((response: any) => {
        // this.util.notification.success({
        //   title: "Success",
        //   msg: "Role removed Successfully"
        // });
      },
      (err) => {
        this.util.notification.error({
          title: "Error",
          msg: err
        });
      })
    }
  }

  subscribeToReport(reportTypeId: number) {
    this.notificationService.subscribeToReport(this.siteKey, reportTypeId).subscribe((response: any) => {
      this.util.notification.success({
        title: "Success",
        msg: "Subscribe to Report Successfully"
      });
    },
    (err) => {
      this.util.notification.error({
        title: "Error",
        msg: err
      });
    })
  }

  unsubscribeFromReport(reportTypeId: number) {
    this.notificationService.unsubscribeFromReport(this.siteKey, reportTypeId).subscribe((response: any) => {
      this.util.notification.success({
        title: "Success",
        msg: "Unsubscribe from Report Successfully"
      });
    },
    (err) => {
      this.util.notification.error({
        title: "Error",
        msg: err
      });
    })
  }

  getReportSubscriptions() {
    this.notificationService.getReportSubscriptions(this.siteKey).subscribe((response: ReportSubscriptions[]) => {
      this.reportSubscriptions = response;
      this.loading = false;
    },
    (err) => {
      this.loading = false;
      this.util.notification.error({
        title: "Error",
        msg: err
      });
    })
  }

  public toggle(event: MatSlideToggleChange, reportTypeId: number) {
    if (event.checked) {
      this.subscribeToReport(reportTypeId);
    }
    else {
      this.unsubscribeFromReport(reportTypeId);
    }
  }
}
