import { TestBed } from '@angular/core/testing';

import { TableColumnDialogService } from './table-column-dialog.service';

describe('TableColumnDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TableColumnDialogService = TestBed.get(TableColumnDialogService);
    expect(service).toBeTruthy();
  });
});
