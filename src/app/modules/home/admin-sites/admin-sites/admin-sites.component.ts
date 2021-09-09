import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';

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


  constructor(
    private modalService: NgbModal,
    private adminService: AdminService,
    private util: CommonUtilService
  ) { }

  ngOnInit(): void {
    this.getSitesList();
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

}
