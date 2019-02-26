import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { SafetyForm } from './safety-form';

export interface FormListOptions {
  role?: string;
  limit?: number;
  offset?: number;
  where?: any;
}

// @dynamic
@Injectable()
export class FormService {
  private get _path() {
    return `forms`;
  }

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  public static prepareList(list): SafetyForm[] {
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyForm;
      element.id = el.payload.doc.id;
      return element;
    });
  }

  public static prepareItem(data): SafetyForm {
    const doc = data.data() as SafetyForm;
    doc.id = data.id;
    return doc;
  }

  public getOne(id) {
    const doc = this._db.collection<SafetyForm>(this._path).doc(id);
    return doc.get().pipe(map(FormService.prepareItem));
  }

  public getRef(id): DocumentReference {
    return this._db.doc(`${this._path}/${id}`).ref;
  }

  public getListBulk(options?: FormListOptions): Observable<SafetyForm[]> {
    const { where = [] } = options;
    const roles: [string] = this._storage.get('roles');
    const reqs = [];
    for (let i = 0; i < roles.length; i += 1) {
      reqs.push(
        this.getList({
          // limit: limit || 100,
          // offset: offset || 0,
          role: roles[i],
          where
        })
      );
    }
    return combineLatest(...reqs).pipe(
      map((res: any) => {
        const list = {};
        for (let i = 0; i < res.length; i += 1) {
          for (let y = 0; y < res[i].length; y += 1) {
            const key = res[i][y].id;
            list[key] = res[i][y];
          }
        }
        return Object.values(list);
      })
    );
  }

  public getList(options: FormListOptions): Observable<SafetyForm[]> {
    const { role = '', where = [] } = options;
    return this._db
      .collection<SafetyForm>(this._path, ref => {
        let filteredRef = ref.where(
          'dealerId',
          '==',
          this._storage.get('dealerId')
        );
        filteredRef = filteredRef.where('roles', 'array-contains', role);
        if (where && where.length) {
          for (let i = 0; i < where.length; i += 1) {
            filteredRef = filteredRef.where(
              where[i][0],
              where[i][1],
              where[i][2]
            );
          }
        }

        return filteredRef.orderBy('title');
      })
      .snapshotChanges()
      .pipe(map(FormService.prepareList));
  }

  public save(data) {
    const collection = this._db.collection<SafetyForm>(this._path);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const document = this._db.collection<SafetyForm>(this._path).doc(id);
    return document.update(data);
  }

  public delete(id) {
    const document = this._db.collection<SafetyForm>(this._path).doc(id);
    return document.delete();
  }

  public getCount() {
    return this._db
      .collection<SafetyForm>(this._path, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }
}
