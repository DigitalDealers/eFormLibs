import { NgModule } from '@angular/core';

import { DealerApiService } from './dealer-api.service';
import { DataSetService } from './services/data-set.service';
import { FormService } from './services/form.service';
import { InteractionService } from './services/interaction.service';
import { ReportsService } from './services/reports.service';
import { RoleService } from './services/role.service';
import { SearchService } from './services/search.service';

@NgModule({
  providers: [
    DataSetService,
    DealerApiService,
    FormService,
    InteractionService,
    ReportsService,
    RoleService,
    SearchService
  ]
})
export class DidiDealerApiModule {}
