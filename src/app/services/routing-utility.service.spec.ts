import { TestBed } from '@angular/core/testing';

import { RoutingUtilityService } from './routing-utility.service';

describe('RoutingUtilityService', () => {
  let service: RoutingUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutingUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
