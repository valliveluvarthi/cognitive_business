import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'cb-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  faBars = faBars;

  @Output() toggleNavBar = new EventEmitter();

  logoCntStyle = {'display': 'inline-block', 'width': '26px', 'height': '26px', 'margin-left': '16px', 'margin-bottom': '0 !important'}
  logoStyle={'width': '100%'};

  constructor() { }

  ngOnInit(): void {
  }

  toggleNav() {
    this.toggleNavBar.emit('');
  }

}
