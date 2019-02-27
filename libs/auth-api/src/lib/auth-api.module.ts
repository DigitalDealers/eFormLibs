import { NgModule } from '@angular/core';

import { AuthApiService } from './auth-api.service';
import { AppService } from './services/app.service';
import { BotService } from './services/bot.service';
import { DashboardService } from './services/dashboard.service';
import { DealerService } from './services/dealer.service';
import { PaymentService } from './services/payment.service';
import { AuthUserService } from './services/auth-user.service';
import { AuthRoleService } from './services/auth-role.service';

@NgModule({
  providers: [
    AppService,
    BotService,
    DashboardService,
    DealerService,
    PaymentService,
    AuthRoleService,
    AuthUserService,
    AuthApiService
  ]
})
export class DidiAuthApiModule {}
