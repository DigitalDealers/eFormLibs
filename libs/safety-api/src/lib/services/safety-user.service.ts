import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { prepareList } from '../helpers/prepare-list';
import { SafetyUser } from '../interfaces/safety-user';

@Injectable()
export class SafetyUserService {
  private get _path() {
    return `<baseUrl>/users`;
  }

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public getOne(id) {
    const doc = this._db.collection<SafetyUser>(this._path).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyUser>(item)));
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
      .pipe(map(list => prepareList<SafetyUser>(list)));
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
