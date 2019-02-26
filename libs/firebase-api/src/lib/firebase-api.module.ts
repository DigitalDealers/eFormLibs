import { NgModule } from '@angular/core';

import { LocalStorageModule } from 'angular-2-local-storage';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';

import { FireStoreService } from './firestore.service';

@NgModule({
  imports: [LocalStorageModule, AngularFirestoreModule],
  declarations: [],
  exports: [],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    FireStoreService
  ]
})
export class FirebaseApiModule {}
