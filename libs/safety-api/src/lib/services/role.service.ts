import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentSnapshot } from '@angular/fire/firestore';
import { SafetyRole } from '@digitaldealers/typings';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { prepareList } from '../helpers/prepare-list';

// @dynamic
@Injectable()
export class RoleService {
  private readonly collectionName = 'roles';

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {
  }

  public getOne(id: string): Observable<SafetyRole | null> {
    const doc = this._db.collection<SafetyRole>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyRole>(item as DocumentSnapshot<SafetyRole>)));
  }

  public getRef(id: string): DocumentReference<SafetyRole> {
    return this._db.doc<SafetyRole>(`${this.collectionName}/${id}`).ref;
  }

  public getList(options = { limit: 10, offset: 0 }): Observable<SafetyRole[]> {
    return this._db
      .collection<SafetyRole>(this.collectionName, ref => {
        return ref
          .where('dealerId', '==', this._storage.get('dealerId'))
          .orderBy('name')
          .startAt(options.offset)
          .limit(options.limit);
      })
      .snapshotChanges()
      .pipe(map(list => prepareList<SafetyRole>(list)));
  }

  public save(data: SafetyRole) {
    const collection = this._db.collection<SafetyRole>(this.collectionName);
    collection.add(data);
  }

  public update(id: string, data: SafetyRole) {
    delete data.id;
    const document = this._db.collection<SafetyRole>(this.collectionName).doc(id);
    return document.update(data);
  }

  public delete(id: string) {
    const document = this._db.collection<SafetyRole>(this.collectionName).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyRole>(this.collectionName, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
