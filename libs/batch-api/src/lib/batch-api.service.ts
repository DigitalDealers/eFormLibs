import { Injectable } from '@angular/core';

import { BatchDataSetService } from './services/batch-data-set.service';
import { BatchSearchService } from './services/batch-search.service';

@Injectable()
export class BatchApiService {
  constructor(
    public dataSet: BatchDataSetService,
    public search: BatchSearchService
  ) {}
}
