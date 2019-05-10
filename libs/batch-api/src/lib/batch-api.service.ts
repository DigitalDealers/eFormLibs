import { Injectable } from '@angular/core';

import { DataSetService } from './services/data-set.service';
import { PartStoreService } from './services/part-store.service';
import { SearchService } from './services/search.service';
import { UploadService } from './services/upload.service';

@Injectable()
export class BatchApiService {
  constructor(
    public dataSet: DataSetService,
    public partStore: PartStoreService,
    public search: SearchService,
    public upload: UploadService
  ) {
  }
}
