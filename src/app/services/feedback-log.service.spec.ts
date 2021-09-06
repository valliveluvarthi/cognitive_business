import { TestBed } from '@angular/core/testing';

import { FeedbackLogService } from './feedback-log.service';

describe('FeedbackLogService', () => {
  let service: FeedbackLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedbackLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
