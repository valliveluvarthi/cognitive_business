import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { EditUserInfoComponent } from '../edit-user-info/edit-user-info.component';

export interface UserElement {
  key: string;
  name: string;
}

@Component({
  selector: 'cb-admin-sites',
  templateUrl: './admin-sites.component.html',
  styleUrls: ['./admin-sites.component.scss']
})
export class AdminSitesComponent implements OnInit {

  displayedColumns: string[] = ['key', 'name', 'updateinfo'];
  ELEMENT_DATA: UserElement[] = [];
  dataSource = new MatTableDataSource<UserElement>(this.ELEMENT_DATA);
  userRoles: string[];

  constructor(
    private modalService: NgbModal,
    private adminService: AdminService,
    private util: CommonUtilService
  ) { }

  ngOnInit(): void {
    this.getSitesList();
    this.getUserRoles();
  }
  getSitesList() {
    this.adminService.getSitesList().subscribe((data: Array<Object>) => {
      console.log(data);
      this.ELEMENT_DATA = [];
      data.forEach(element => {
        let user: UserElement = {
          key: element['key'],
          name: element['name']
        }
        this.ELEMENT_DATA.push(user);
      });

      this.dataSource = new MatTableDataSource<UserElement>(this.ELEMENT_DATA);
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

  openUpdateInfoModal(item) {
    const modalRef = this.modalService.open(EditUserInfoComponent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true, windowClass: "modal-wrapper" });
    modalRef.componentInstance.userRoles = this.userRoles;
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.onSuccess.subscribe(() => {
      this.reloadUserData();
    });
  }
  reloadUserData() {
    this.getSitesList();
  }
}
