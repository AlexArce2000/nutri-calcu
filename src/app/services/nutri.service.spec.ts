import { TestBed } from '@angular/core/testing';

import { NutriService } from './nutri.service';

describe('NutriService', () => {
  let service: NutriService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutriService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
