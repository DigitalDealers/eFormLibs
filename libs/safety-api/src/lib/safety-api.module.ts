import { NgModule } from '@angular/core';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { LocalStorageModule } from 'angular-2-local-storage';

import { CategoryService } from './services/category.service';
import { ControlService } from './services/control.service';
import { SafetyApiService } from './safety-api.service';
import { FormService } from './services/form.service';
import { MyFormService } from './services/my-form.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { UserRoleService } from './services/user-role.service';
import { UserService } from './services/user.service';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    LocalStorageModule
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    CategoryService,
    ControlService,
    SafetyApiService,
    FormService,
    MyFormService,
    RoleService,
    PermissionService,
    UserRoleService,
    UserService
  ]
})
export class DidiSafetyApiModule {}
