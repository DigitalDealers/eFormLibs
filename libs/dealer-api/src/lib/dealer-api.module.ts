import { NgModule } from '@angular/core';

import { DealerApiService } from './dealer-api.service';
import { DealerDataSetService } from './services/dealer-data-set.service';
import { DealerFormService } from './services/dealer-form.service';
import { InteractionService } from './services/interaction.service';
import { ReportsService } from './services/reports.service';
import { DealerRoleService } from './services/dealer-role.service';
import { DealerSearchService } from './services/dealer-search.service';

@NgModule({
  providers: [
    DealerDataSetService,
    DealerApiService,
    DealerFormService,
    InteractionService,
    ReportsService,
    DealerRoleService,
    DealerSearchService
  ]
})
export class DidiDealerApiModule {}
