import { TestBed } from '@angular/core/testing';

import { FormObserverService } from './form-observer.service';

describe('FormObserverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormObserverService = TestBed.get(FormObserverService);
    expect(service).toBeTruthy();
  });
});
