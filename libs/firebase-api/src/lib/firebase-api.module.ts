import { NgModule } from '@angular/core';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { LocalStorageModule } from 'angular-2-local-storage';

import { FireStoreService } from './firestore.service';

@NgModule({
  imports: [
    AngularFirestoreModule,
    LocalStorageModule,
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    FireStoreService
  ]
})
export class FirebaseApiModule {}
