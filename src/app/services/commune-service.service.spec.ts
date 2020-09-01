import { TestBed } from '@angular/core/testing';

import { CommuneServiceService } from './commune-service.service';

describe('CommuneServiceService', () => {
  let service: CommuneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommuneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
