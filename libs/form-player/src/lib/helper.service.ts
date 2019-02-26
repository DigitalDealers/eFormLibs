import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class HelperService {
  constructor(private _afs: AngularFirestore) {}

  public get generateUID(): string {
    return this._afs.createId();
  }
}
