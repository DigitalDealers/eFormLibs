import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore';
import { SafetyUserRole } from '@digitaldealers/typings';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { prepareList } from '../helpers/prepare-list';

// @dynamic
@Injectable()
export class UserRoleService {
  private readonly collectionName = 'usersRoles';

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {
  }

  public getOne(id: string): Observable<SafetyUserRole | null> {
    const doc = this._db.collection<SafetyUserRole>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyUserRole>(item as DocumentSnapshot<SafetyUserRole>)));
  }

  public getRef(id: string): DocumentReference<SafetyUserRole> {
    return this._db.doc<SafetyUserRole>(`${this.collectionName}/${id}`).ref;
  }

  public getList(
    id: string,
    options = { limit: 10, offset: 0 }
  ): Observable<SafetyUserRole[]> {
    return this._db
      .collection<SafetyUserRole>(this.collectionName, ref => {
        return ref
          .where('roleId', '==', id)
          .orderBy('userId')
          .startAt(options.offset)
          .limit(options.limit);
      })
      .doc(id)
      .collection<SafetyUserRole>('users')
      .snapshotChanges()
      .pipe(map(list => prepareList<SafetyUserRole>(list)));
  }

  public save(data: SafetyUserRole) {
    data['dealerId'] = this._storage.get('dealerId');
    const collection = this._db.collection<SafetyUserRole>(this.collectionName);
    collection.add(data);
  }

  public update(id: string, data: SafetyUserRole) {
    delete data.id;
    const document = this._db.collection<SafetyUserRole>(this.collectionName).doc(id);
    return document.update(data);
  }

  public delete(id: string) {
    const document = this._db.collection<SafetyUserRole>(this.collectionName).doc(id);
    return document.delete();
  }

  public getCount(id: string) {
    return this._db
      .collection<SafetyUserRole>(this.collectionName, ref =>
        ref.where('roleId', '==', id)
      )
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
