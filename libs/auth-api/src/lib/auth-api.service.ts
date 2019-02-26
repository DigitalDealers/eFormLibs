import { Injectable } from '@angular/core';

import { AppService } from './services/app.service';
import { BotService } from './services/bot.service';
import { DashboardService } from './services/dashboard.service';
import { DealerService } from './services/dealer.service';
import { PaymentService } from './services/payment.service';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';

@Injectable()
export class AuthApiService {
  constructor(
    public apps: AppService,
    public bot: BotService,
    public dashboard: DashboardService,
    public dealer: DealerService,
    public payment: PaymentService,
    public role: RoleService,
    public user: UserService
  ) {}
}
