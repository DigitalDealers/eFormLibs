import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { prepareList } from '../helpers/prepare-list';
import { SafetyUserRole } from '../interfaces/safety-user-role';

// @dynamic
@Injectable()
export class UserRoleService {
  private readonly collectionName = 'usersRoles';

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public getOne(id) {
    const doc = this._db.collection<SafetyUserRole>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyUserRole>(item)));
  }

  public getRef(id): DocumentReference {
    return this._db.doc(`${this.collectionName}/${id}`).ref;
  }

  public getList(
    id,
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
      .collection('users')
      .snapshotChanges()
      .pipe(map(list => prepareList<SafetyUserRole>(list)));
  }

  public save(data) {
    data['dealerId'] = this._storage.get('dealerId');
    const collection = this._db.collection<SafetyUserRole>(this.collectionName);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const document = this._db.collection<SafetyUserRole>(this.collectionName).doc(id);
    return document.update(data);
  }

  public delete(id) {
    const document = this._db.collection<SafetyUserRole>(this.collectionName).doc(id);
    return document.delete();
  }

  public getCount(id) {
    return this._db
      .collection<SafetyUserRole>(this.collectionName, ref =>
        ref.where('roleId', '==', id)
      )
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
