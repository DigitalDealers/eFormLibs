import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { LocalStorageModule } from 'angular-2-local-storage';

import { SafetyApiService } from './safety-api.service';
import { CategoryService } from './services/category.service';
import { ControlService } from './services/control.service';
import { FormService } from './services/form.service';
import { MyFormService } from './services/my-form.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
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
    FormService,
    MyFormService,
    PermissionService,
    RoleService,
    SafetyApiService,
    UserRoleService,
    UserService
  ]
})
export class DidiSafetyApiModule {}
