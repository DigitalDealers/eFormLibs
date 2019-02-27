import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { LocalStorageModule } from 'angular-2-local-storage';

import { SafetyApiService } from './safety-api.service';
import { CategoryService } from './services/category.service';
import { ControlService } from './services/control.service';
import { SafetyFormService } from './services/safety-form.service';
import { MyFormService } from './services/my-form.service';
import { PermissionService } from './services/permission.service';
import { SafetyRoleService } from './services/safety-role.service';
import { UserRoleService } from './services/user-role.service';
import { SafetyUserService } from './services/safety-user.service';

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
    SafetyFormService,
    MyFormService,
    PermissionService,
    SafetyRoleService,
    SafetyApiService,
    UserRoleService,
    SafetyUserService
  ]
})
export class DidiSafetyApiModule {}
