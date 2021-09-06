import { TestBed } from '@angular/core/testing';

import { LogoutResolver } from './logout.resolver';

describe('LogoutResolver', () => {
  let resolver: LogoutResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LogoutResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
