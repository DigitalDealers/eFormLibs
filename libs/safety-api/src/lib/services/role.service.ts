import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SafetyRole } from './safety-role';

// @dynamic
@Injectable()
export class RoleService {
  private get _path() {
    return `roles`;
  }

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public static prepareList(list): SafetyRole[] {
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyRole;
      element.id = el.payload.doc.id;
      return element;
    });
  }

  public static prepareItem(data): SafetyRole {
    const doc = data.data() as SafetyRole;
    doc.id = data.id;
    return doc;
  }

  public getOne(id) {
    const doc = this._db.collection<SafetyRole>(this._path).doc(id);
    return doc.get().pipe(map(RoleService.prepareItem));
  }

  public getRef(id): DocumentReference {
    return this._db.doc(`${this._path}/${id}`).ref;
  }

  public getList(options = { limit: 10, offset: 0 }): Observable<SafetyRole[]> {
    return this._db
      .collection<SafetyRole>(this._path, ref => {
        return ref
          .where('dealerId', '==', this._storage.get('dealerId'))
          .orderBy('name')
          .startAt(options.offset)
          .limit(options.limit);
      })
      .snapshotChanges()
      .pipe(map(RoleService.prepareList));
  }

  public save(data) {
    const collection = this._db.collection<SafetyRole>(this._path);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const document = this._db.collection<SafetyRole>(this._path).doc(id);
    return document.update(data);
  }

  public delete(id) {
    const document = this._db.collection<SafetyRole>(this._path).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyRole>(this._path, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
