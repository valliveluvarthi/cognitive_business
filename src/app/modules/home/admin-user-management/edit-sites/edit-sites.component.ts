import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'cb-edit-sites',
  templateUrl: './edit-sites.component.html',
  styleUrls: ['./edit-sites.component.scss']
})

export class EditSitesComponent implements OnInit {
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
   
  }

}
