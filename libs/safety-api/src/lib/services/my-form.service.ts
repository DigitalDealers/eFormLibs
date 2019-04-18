import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { format } from 'date-fns';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map, switchMap } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';
import { SafetyMyForm } from '../interfaces/safety-my-form';

export interface MyFormListOptions {
  limit?: number;
  offset?: number;
  where?: [];
}

// @dynamic
@Injectable()
export class MyFormService {
  private readonly collectionName = 'my-forms';

  constructor(
    private _db: AngularFirestore,
    private _afAuth: AngularFireAuth,
    private _afStorage: AngularFireStorage,
    private http: HttpClient
  ) {}

  public save(data: SafetyMyForm): Observable<string> {
    const collection = this._db.collection<SafetyMyForm>(this.collectionName);
    const myFormId = data.id;
    delete data.id;

    data.status = data.status || 'submitted';
    data.modifiedOn = Date.now();
    data.modifiedBy = this._afAuth.auth.currentUser.uid;

    if (myFormId) {
      return fromPromise(collection.doc(myFormId).update(data)).pipe(map(() => myFormId));
    } else {
      data.createdBy = this._afAuth.auth.currentUser.uid;
      data.assignedTo = null;
      data.assignedOn = null;
      return fromPromise(collection.add(data)).pipe(map(res => res.id));
    }
  }

  public getList(options: MyFormListOptions): Observable<SafetyMyForm[]> {
    return this._getList('createdBy', options);
  }

  public assignedToMeList(options): Observable<SafetyMyForm[]> {
    return this._getList('assignedTo', options);
  }

  private _getList(key, options) {
    const { where = [] } = options || {};
    return this._afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this._db
            .collection<SafetyMyForm>(this.collectionName, ref => {
              let filteredRef = ref.where(key, '==', user.uid);
              if (where && where.length) {
                for (let i = 0; i < where.length; i += 1) {
                  filteredRef = filteredRef.where(where[i][0], where[i][1], where[i][2]);
                }
              }
              return filteredRef.orderBy('modifiedOn', 'desc');
            })
            .snapshotChanges()
            .pipe(map(list => this.prepareList(list)));
        }
        return of(null);
      })
    );
  }

  private prepareList(list) {
    if (!list) {
      return list;
    }
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyMyForm;
      element.id = el.payload.doc.id;
      if (element.modifiedOn) {
        element.shortModifiedOn = format(new Date(element.modifiedOn), 'DD MMM');
      }
      return element;
    });
  }

  public assignedToMeCount(): Observable<any> {
    return this._afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this._db
            .collection<SafetyMyForm>(this.collectionName, ref => {
              return ref.where('assignedTo', '==', user.uid);
            })
            .snapshotChanges()
            .pipe(map(res => res.length));
        }
        return of(null);
      })
    );
  }

  public getOne(id): Observable<SafetyMyForm> {
    const doc = this._db.collection<SafetyMyForm>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyMyForm>(item)));
  }

  public async uploadFiles(files) {
    const tasks = [];
    const response = {};
    for (let i = 0; i < files.length; i += 1) {
      const randomId = Math.random()
        .toString(36)
        .substring(2);
      response[randomId] = {
        name: files[i].name || randomId,
        url: ''
      };
      const ref = this._afStorage.ref(randomId);
      if (typeof files[i] === 'string') {
        tasks.push(ref.putString(files[i]));
      } else {
        tasks.push(ref.put(files[i]));
      }
    }
    const res = await Promise.all(tasks);
    const promises = [];
    for (let i = 0; i < res.length; i += 1) {
      const url = res[i].ref.getDownloadURL();
      promises.push(url);
    }
    const urls: string[] = await Promise.all(promises);
    const keys = Object.keys(response);
    for (let i = 0; i < urls.length; i += 1) {
      const url = urls[i];
      for (let j = 0; j < keys.length; j += 1) {
        const key = keys[j];
        if (url.includes(key)) {
          response[key].url = url;
        }
      }
    }

    return Object.values(response);
  }

  public getCount(): Observable<number> {
    return this._afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this._db
            .collection<SafetyMyForm>(this.collectionName, ref =>
              ref.where('createdBy', '==', user.uid)
            )
            .snapshotChanges()
            .pipe(map(res => res.length));
        }
        return of(0);
      })
    );
  }

  public delete(id: string): Observable<void> {
    const document = this._db.collection<SafetyMyForm>(this.collectionName).doc(id);
    return fromPromise(document.delete());
  }

  public export(url: string, formId: string, assetKey: string): Observable<{ filename: string; file: Blob; }> {
    return this.http
      .get(`${url}/${formId}`, {
        responseType: 'blob',
        observe: 'response',
        params: {
          assetKey
        }
      })
      .pipe(
        map(res => ({
          filename: this.getFileName(res.headers.get('content-disposition')),
          file: res.body
        }))
      );
  }

  private getFileName(header: string): string {
    const parts = (header || '').split('filename=');
    return parts[1] ? parts[1].replace(/"/g, '') : '';
  }
}
