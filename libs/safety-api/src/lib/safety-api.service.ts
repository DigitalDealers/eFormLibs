import { Injectable } from '@angular/core';

import { CategoryService } from './services/category.service';
import { ControlService } from './services/control.service';
import { FormService } from './services/form.service';
import { MyFormService } from './services/my-form.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { UserRoleService } from './services/user-role.service';
import { UserService } from './services/user.service';

@Injectable()
export class SafetyApiService {
  constructor(
    public category: CategoryService,
    public control: ControlService,
    public form: FormService,
    public myForm: MyFormService,
    public permission: PermissionService,
    public role: RoleService,
    public user: UserService,
    public userRole: UserRoleService
  ) {
  }
}
