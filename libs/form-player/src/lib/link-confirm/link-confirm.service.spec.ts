import { TestBed } from '@angular/core/testing';

import { LinkConfirmService } from './link-confirm.service';

describe('LinkConfirmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LinkConfirmService = TestBed.get(LinkConfirmService);
    expect(service).toBeTruthy();
  });
});
