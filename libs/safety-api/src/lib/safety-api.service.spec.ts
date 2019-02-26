import { TestBed } from '@angular/core/testing';

import { SafetyApiService } from './safety-api.service';

describe('SafetyApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SafetyApiService = TestBed.get(SafetyApiService);
    expect(service).toBeTruthy();
  });
});
