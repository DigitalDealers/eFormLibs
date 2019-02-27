import { NgModule } from '@angular/core';

import { BatchApiService } from './batch-api.service';
import { BatchDataSetService } from './services/batch-data-set.service';
import { BatchSearchService } from './services/batch-search.service';

@NgModule({
  providers: [
    BatchApiService,
    BatchDataSetService,
    BatchSearchService
  ]
})
export class DidiBatchApiModule {}
