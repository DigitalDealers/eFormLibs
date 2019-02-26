import { TestBed } from '@angular/core/testing';

import { DidiConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DidiConfirmService = TestBed.get(DidiConfirmService);
    expect(service).toBeTruthy();
  });
});
