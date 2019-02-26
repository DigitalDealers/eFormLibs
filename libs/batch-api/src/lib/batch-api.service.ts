import { Injectable } from '@angular/core';

import { DataSetService } from './services/data-set.service';
import { SearchService } from './services/search.service';

@Injectable()
export class BatchApiService {
  constructor(
    public dataSet: DataSetService,
    public search: SearchService
  ) {}
}
