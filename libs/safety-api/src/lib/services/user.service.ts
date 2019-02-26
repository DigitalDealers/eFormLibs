import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SafetyUser } from './safety-user';

// @dynamic
@Injectable()
export class UserService {
  private get _path() {
    return `users`;
  }

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public static prepareList(list): SafetyUser[] {
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyUser;
      element.id = el.payload.doc.id;
      return element;
    });
  }

  public static prepareItem(data): SafetyUser {
    const doc = data.data() as SafetyUser;
    doc.id = data.id;
    return doc;
  }

  public getOne(id) {
    const doc = this._db.collection<SafetyUser>(this._path).doc(id);
    return doc.get().pipe(map(UserService.prepareItem));
  }

  public getRef(id): DocumentReference {
    return this._db.doc(`${this._path}/${id}`).ref;
  }

  public getList(options = { limit: 10, offset: 0 }): Observable<SafetyUser[]> {
    return this._db
      .collection<SafetyUser>(this._path, ref => {
        return ref
          .where('dealerId', '==', this._storage.get('dealerId'))
          .orderBy('displayName');
      })
      .snapshotChanges()
      .pipe(map(UserService.prepareList));
  }

  public save(data) {
    const collection = this._db.collection<SafetyUser>(this._path);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const document = this._db.collection<SafetyUser>(this._path).doc(id);
    return document.update(data);
  }

  public delete(id) {
    const document = this._db.collection<SafetyUser>(this._path).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyUser>(this._path, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
