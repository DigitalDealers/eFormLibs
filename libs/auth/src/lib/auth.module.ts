import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { JwtModule } from '@auth0/angular-jwt';
import { LocalStorageModule } from 'angular-2-local-storage';
import { FirebaseApiModule } from '@didi/firebase-api';

import { AclService } from './acl.service';
import { AuthService } from './auth.service';
import { Config } from './interfaces/config';
import { Guard } from './guard.service';
import { CONFIG } from './module.config';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFirestoreModule,
    FirebaseApiModule,
    JwtModule,
    LocalStorageModule
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    AclService,
    AuthService,
    Guard
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
