import { Component, OnInit } from '@angular/core';
import { PATHS } from 'src/app/enums';

@Component({
  selector: 'cb-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {
  public Paths = PATHS;
  emailAddress: string;
  title: string = "Recover Password";

  constructor(
  ) {
    this.emailAddress = history.state.data;
  }
  
  ngOnInit(): void {
  }

}
