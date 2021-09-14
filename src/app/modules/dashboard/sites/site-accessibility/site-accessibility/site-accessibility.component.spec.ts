import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAccessibilityComponent } from './site-accessibility.component';

describe('SiteAccessibilityComponent', () => {
  let component: SiteAccessibilityComponent;
  let fixture: ComponentFixture<SiteAccessibilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAccessibilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAccessibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
