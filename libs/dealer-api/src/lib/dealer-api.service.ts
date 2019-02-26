import { Injectable } from '@angular/core';

import { InteractionService } from './services/interaction.service';
import { FormService } from './services/form.service';
import { ReportsService } from './services/reports.service';
import { SearchService } from './services/search.service';
import { RoleService } from './services/role.service';
import { DataSetService } from './services/data-set.service';

@Injectable()
export class DealerApiService {
  constructor(
    public dataSet: DataSetService,
    public interaction: InteractionService,
    public form: FormService,
    public reports: ReportsService,
    public role: RoleService,
    public search: SearchService
  ) {}
}
