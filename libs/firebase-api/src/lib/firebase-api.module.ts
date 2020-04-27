import { NgModule } from '@angular/core';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { FireStoreService } from './firestore.service';

@NgModule({
  imports: [
    AngularFirestoreModule
  ],
  providers: [
    FireStoreService
  ]
})
export class FirebaseApiModule {
}
