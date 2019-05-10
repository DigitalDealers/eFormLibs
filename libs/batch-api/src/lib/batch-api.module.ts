import { NgModule } from '@angular/core';

import { BatchApiService } from './batch-api.service';
import { ModuleOptions } from './interfaces/module-options.interface';
import { OPTIONS } from './options';
import { DataSetService } from './services/data-set.service';
import { PartStoreService } from './services/part-store.service';
import { SearchService } from './services/search.service';
import { UploadService } from './services/upload.service';

@NgModule({
  providers: [
    BatchApiService,
    DataSetService,
    PartStoreService,
    SearchService,
    UploadService
  ]
})
export class DidiBatchApiModule {
  static forRoot(host: ModuleOptions) {
    return {
      ngModule: DidiBatchApiModule,
      providers: [
        {
          provide: OPTIONS,
          useValue: host
        }
      ]
    };
  }
}
