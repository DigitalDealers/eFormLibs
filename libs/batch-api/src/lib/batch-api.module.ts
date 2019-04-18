import { NgModule } from '@angular/core';

import { BatchApiService } from './batch-api.service';
import { DataSetService } from './services/data-set.service';
import { SearchService } from './services/search.service';
import { UploadService } from './services/upload.service';

@NgModule({
  providers: [
    BatchApiService,
    DataSetService,
    SearchService,
    UploadService
  ]
})
export class DidiBatchApiModule {
}
