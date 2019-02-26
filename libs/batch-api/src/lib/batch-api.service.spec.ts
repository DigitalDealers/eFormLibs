import { TestBed, inject } from '@angular/core/testing';

import { BatchApiService } from './batch-api.service';

describe('BatchApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BatchApiService]
    });
  });

  it('should be created', inject([BatchApiService], (service: BatchApiService) => {
    expect(service).toBeTruthy();
  }));
});
