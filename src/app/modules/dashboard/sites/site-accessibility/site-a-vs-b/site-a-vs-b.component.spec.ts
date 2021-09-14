import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAVsBComponent } from './site-a-vs-b.component';

describe('SiteAVsBComponent', () => {
  let component: SiteAVsBComponent;
  let fixture: ComponentFixture<SiteAVsBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAVsBComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAVsBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
