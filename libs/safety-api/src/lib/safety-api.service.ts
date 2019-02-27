import { Injectable } from '@angular/core';

import { CategoryService } from './services/category.service';
import { ControlService } from './services/control.service';
import { SafetyFormService } from './services/safety-form.service';
import { MyFormService } from './services/my-form.service';
import { PermissionService } from './services/permission.service';
import { SafetyRoleService } from './services/safety-role.service';
import { UserRoleService } from './services/user-role.service';
import { SafetyUserService } from './services/safety-user.service';

@Injectable()
export class SafetyApiService {
  constructor(
    public category: CategoryService,
    public control: ControlService,
    public form: SafetyFormService,
    public myForm: MyFormService,
    public role: SafetyRoleService,
    public permission: PermissionService,
    public userRole: UserRoleService,
    public user: SafetyUserService
  ) {}
}
