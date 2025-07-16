import { TestBed } from '@angular/core/testing';

import { AuthSerivce } from './auth.service';

describe('Auth', () => {
  let service: AuthSerivce;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSerivce);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
