import { NgModule } from '@angular/core';

import { JwtModule } from '@auth0/angular-jwt';

import { LocalStorageModule } from 'angular-2-local-storage';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FirebaseApiModule } from '@didi/firebase-api';

import { AuthService } from './auth.service';
import { Guard } from './guard.service';
import { AclService } from './acl.service';
import { CONFIG } from './module.config';
import { Config } from './config';

@NgModule({
  imports: [
    JwtModule,
    LocalStorageModule,
    FirebaseApiModule,
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    AuthService,
    Guard,
    AclService
  ]
})
export class DidiAuthModule {
  static forRoot(host: Config) {
    return {
      ngModule: DidiAuthModule,
      providers: [
        {
          provide: CONFIG,
          useValue: host
        }
      ]
    };
  }
}
