import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TideComponent } from './tide.component';

describe('TideComponent', () => {
  let component: TideComponent;
  let fixture: ComponentFixture<TideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
