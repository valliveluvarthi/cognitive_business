import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAccessibleComponent } from './site-accessible.component';

describe('SiteAccessibleComponent', () => {
  let component: SiteAccessibleComponent;
  let fixture: ComponentFixture<SiteAccessibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAccessibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAccessibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
