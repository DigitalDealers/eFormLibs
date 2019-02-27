import { Injectable } from '@angular/core';

import { DealerDataSetService } from './services/dealer-data-set.service';
import { DealerFormService } from './services/dealer-form.service';
import { InteractionService } from './services/interaction.service';
import { ReportsService } from './services/reports.service';
import { DealerRoleService } from './services/dealer-role.service';
import { DealerSearchService } from './services/dealer-search.service';

@Injectable()
export class DealerApiService {
  constructor(
    public dataSet: DealerDataSetService,
    public interaction: InteractionService,
    public form: DealerFormService,
    public reports: ReportsService,
    public role: DealerRoleService,
    public search: DealerSearchService
  ) {}
}
