import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'cb-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  faBars = faBars;

  @Input() sites = [];
  @Input() selectedSite = null;

  @Output() toggleNavBar = new EventEmitter();
  @Output() siteOnChange = new EventEmitter();
  @Output() onLogoClicked = new EventEmitter();

  logoCntStyle = {'display': 'inline-block', 'width': '26px', 'height': '26px', 'margin-left': '16px', 'margin-bottom': '0 !important', 'cursor': 'pointer' }
  logoStyle={'width': '100%'};

  faChevronDown = faChevronDown;

  constructor() { }

  ngOnInit(): void {
  }

  toggleNav() {
    this.toggleNavBar.emit('');
  }

  siteOnClickHnd(item) {
    this.siteOnChange.emit(item);
  }

  logoOnClickHnd() {
    this.onLogoClicked.emit();
  }

}
