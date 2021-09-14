import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLogsComponent } from './add-edit-logs.component';

describe('AddEditLogsComponent', () => {
  let component: AddEditLogsComponent;
  let fixture: ComponentFixture<AddEditLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
