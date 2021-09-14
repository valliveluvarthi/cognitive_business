import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSitesComponent } from './edit-sites.component';

describe('EditSitesComponent', () => {
  let component: EditSitesComponent;
  let fixture: ComponentFixture<EditSitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSitesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
