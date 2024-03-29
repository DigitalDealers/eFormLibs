import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore';
import { SafetyUser } from '@digitaldealers/typings';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { prepareList } from '../helpers/prepare-list';

// @dynamic
@Injectable()
export class UserService {
  private readonly collectionName = 'users';

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {
  }

  public getOne(id: string): Observable<SafetyUser | null> {
    const doc = this._db.collection<SafetyUser>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyUser>(item as DocumentSnapshot<SafetyUser>)));
  }

  public getRef(id: string): DocumentReference<SafetyUser> {
    return this._db.doc<SafetyUser>(`${this.collectionName}/${id}`).ref;
  }

  public getList(): Observable<SafetyUser[]> {
    return this._db
      .collection<SafetyUser>(this.collectionName, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId')).orderBy('displayName');
      })
      .snapshotChanges()
      .pipe(map(list => prepareList<SafetyUser>(list)));
  }

  public save(data: SafetyUser) {
    const collection = this._db.collection<SafetyUser>(this.collectionName);
    collection.add(data);
  }

  public update(id: string, data: Partial<SafetyUser>) {
    delete data.id;
    const document = this._db.collection<SafetyUser>(this.collectionName).doc(id);
    return document.update(data);
  }

  public delete(id: string) {
    const document = this._db.collection<SafetyUser>(this.collectionName).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyUser>(this.collectionName, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
