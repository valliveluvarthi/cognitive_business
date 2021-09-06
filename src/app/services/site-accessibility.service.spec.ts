import { TestBed } from '@angular/core/testing';

import { SiteAccessibilityService } from './site-accessibility.service';

describe('SiteAccessibilityService', () => {
  let service: SiteAccessibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteAccessibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
