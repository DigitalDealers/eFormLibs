import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { prepareList } from '../helpers/prepare-list';
import { SafetyPermission } from '../interfaces/safety-permission';

@Injectable()
export class PermissionService {
  private readonly collectionName = 'permissions';

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public getOne(id) {
    const doc = this._db.collection<SafetyPermission>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyPermission>(item)));
  }

  public getRef(id): DocumentReference {
    return this._db.doc(`${this.collectionName}/${id}`).ref;
  }

  public getList(
    options = { limit: 10, offset: 0 }
  ): Observable<SafetyPermission[]> {
    return this._db
      .collection<SafetyPermission>(this.collectionName, ref => {
        return ref
          .where('dealerId', '==', this._storage.get('dealerId'))
          .orderBy('title')
          .startAt(options.offset)
          .limit(options.limit);
      })
      .snapshotChanges()
      .pipe(map(list => prepareList<SafetyPermission>(list)));
  }

  public save(data) {
    data['dealerId'] = this._storage.get('dealerId');
    const collection = this._db.collection<SafetyPermission>(this.collectionName);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const document = this._db.collection<SafetyPermission>(this.collectionName).doc(id);
    return document.update(data);
  }

  public delete(id) {
    const document = this._db.collection<SafetyPermission>(this.collectionName).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyPermission>(this.collectionName, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
