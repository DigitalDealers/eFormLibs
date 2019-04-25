import { NgModule } from '@angular/core';

import { AuthApiService } from './auth-api.service';
import { AppService } from './services/app.service';
import { BotService } from './services/bot.service';
import { DashboardService } from './services/dashboard.service';
import { DealerService } from './services/dealer.service';
import { PaymentService } from './services/payment.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';

@NgModule({
  providers: [
    AppService,
    BotService,
    DashboardService,
    DealerService,
    PaymentService,
    RoleService,
    UserService,
    AuthApiService
  ]
})
export class DidiAuthApiModule {
}
