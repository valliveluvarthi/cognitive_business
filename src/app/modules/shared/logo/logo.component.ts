import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cb-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
  @Input() headerTitle: string;
  @Input() headerDescription: string;
  @Input() logoCntStyle: any = {};
  @Input() logoStyle: any = {};


  constructor() { }

  ngOnInit(): void {
  }

}
