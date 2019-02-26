import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SafetyPermission } from './safety-permission';

// @dynamic
@Injectable()
export class PermissionService {
  private get _path() {
    return `permissions`;
  }

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public static prepareList(list): SafetyPermission[] {
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyPermission;
      element.id = el.payload.doc.id;
      return element;
    });
  }

  public static prepareItem(data): SafetyPermission {
    const doc = data.data() as SafetyPermission;
    doc.id = data.id;
    return doc;
  }

  public getOne(id) {
    const doc = this._db.collection<SafetyPermission>(this._path).doc(id);
    return doc.get().pipe(map(PermissionService.prepareItem));
  }

  public getRef(id): DocumentReference {
    return this._db.doc(`${this._path}/${id}`).ref;
  }

  public getList(
    options = { limit: 10, offset: 0 }
  ): Observable<SafetyPermission[]> {
    return this._db
      .collection<SafetyPermission>(this._path, ref => {
        return ref
          .where('dealerId', '==', this._storage.get('dealerId'))
          .orderBy('title')
          .startAt(options.offset)
          .limit(options.limit);
      })
      .snapshotChanges()
      .pipe(map(PermissionService.prepareList));
  }

  public save(data) {
    data['dealerId'] = this._storage.get('dealerId');
    const collection = this._db.collection<SafetyPermission>(this._path);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const document = this._db.collection<SafetyPermission>(this._path).doc(id);
    return document.update(data);
  }

  public delete(id) {
    const document = this._db.collection<SafetyPermission>(this._path).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyPermission>(this._path, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
