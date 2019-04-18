import { Injectable } from '@angular/core';

import { DataSetService } from './services/data-set.service';
import { FormService } from './services/form.service';
import { InteractionService } from './services/interaction.service';
import { ReportsService } from './services/reports.service';
import { RoleService } from './services/role.service';
import { SearchService } from './services/search.service';

@Injectable()
export class DealerApiService {
  constructor(
    public dataSet: DataSetService,
    public form: FormService,
    public interaction: InteractionService,
    public reports: ReportsService,
    public role: RoleService,
    public search: SearchService
  ) {
  }
}
