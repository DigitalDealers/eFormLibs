import { NgModule } from '@angular/core';

import { DealerApiService } from './dealer-api.service';

import { DataSetService } from './services/data-set.service';
import { FormService } from './services/form.service';
import { InteractionService } from './services/interaction.service';
import { ReportsService } from './services/reports.service';
import { SearchService } from './services/search.service';
import { RoleService } from './services/role.service';

@NgModule({
  providers: [
    DataSetService,
    DealerApiService,
    InteractionService,
    FormService,
    ReportsService,
    RoleService,
    SearchService
  ]
})
export class DidiDealerApiModule {}
