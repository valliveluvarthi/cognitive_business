import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackLogComponent } from './feedback-log.component';

describe('FeedbackLogComponent', () => {
  let component: FeedbackLogComponent;
  let fixture: ComponentFixture<FeedbackLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
