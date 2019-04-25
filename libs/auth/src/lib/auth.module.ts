import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { FirebaseApiModule } from '@digitaldealers/firebase-api';

import { Config } from './interfaces/config';
import { CONFIG } from './module.config';
import { AclService } from './services/acl.service';
import { AuthService } from './services/auth.service';
import { Guard } from './services/guard.service';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFirestoreModule,
    FirebaseApiModule
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
        { provide: CONFIG, useValue: host }
      ]
    };
  }
}
