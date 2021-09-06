import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PATHS } from 'src/app/enums';

@Component({
  selector: 'cb-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  Paths = PATHS;

  @Input() isOpen = false;
  @Input() navItems:any[] = [];
  @Input() selectedNavIndex:number;
  @Output() toggleNavBar = new EventEmitter();
  @Output() closeSideNav = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  navigate(path, index) {
    this.toggleNavBar.emit({path, index});
  }

  overlayOnClick() {
    this.closeSideNav.emit();
  }
}
