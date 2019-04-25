import { NgModule } from '@angular/core';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';

import { FireStoreService } from './firestore.service';

@NgModule({
  imports: [
    AngularFirestoreModule
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} },
    FireStoreService
  ]
})
export class FirebaseApiModule {
}
