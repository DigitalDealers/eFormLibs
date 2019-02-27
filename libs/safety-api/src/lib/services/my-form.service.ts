import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { format } from 'date-fns';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SafetyMyForm } from '../interfaces/safety-my-form';

export interface MyFormListOptions {
  limit?: number;
  offset?: number;
  where?: [];
}

@Injectable()
export class MyFormService {
  private readonly collectionName = 'my-forms';

  constructor(
    private _db: AngularFirestore,
    private _afAuth: AngularFireAuth,
    private _afStorage: AngularFireStorage,
    private http: HttpClient
  ) {}

  public static prepareList(list) {
    if (!list) {
      return list;
    }
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyMyForm;
      element.id = el.payload.doc.id;
      if (element.modifiedOn) {
        element.shortModifiedOn = format(
          new Date(element.modifiedOn),
          'DD MMM'
        );
      }
      return element;
    });
  }

  public static prepareItem(el) {
    const element = el.data() as SafetyMyForm;
    element.id = el.id;
    return element;
  }

  private static getFileName(header: string): string {
    const parts = (header || '').split('filename=');
    return parts[1] ? parts[1].replace(/"/g, '') : '';
  }

  public save(data) {
    const collection = this._db.collection<SafetyMyForm>(this.collectionName);

    data.status = 'submitted';
    const currentTime = Date.now();
    data.modifiedOn = currentTime;
    data.modifiedBy = this._afAuth.auth.currentUser.uid;

    if (data.id) {
      collection.doc(data.id).update(data);
    } else {
      data.createdBy = this._afAuth.auth.currentUser.uid;
      data.assignedTo = null;
      data.assignedOn = null;
      collection.add(data);
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
                  filteredRef = filteredRef.where(
                    where[i][0],
                    where[i][1],
                    where[i][2]
                  );
                }
              }
              return filteredRef.orderBy('modifiedOn', 'desc');
            })
            .snapshotChanges()
            .pipe(map(MyFormService.prepareList));
        }
        return of(null);
      })
    );
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
    return doc.get().pipe(map(MyFormService.prepareItem));
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

  public delete(id): Observable<void> {
    const document = this._db.collection<SafetyMyForm>(this.collectionName).doc(id);
    return from(document.delete());
  }

  public export(url: string, formId: string): Observable<{ filename: string, file: Blob }> {
    return this.http.get(`${url}/${formId}`, {
      responseType: 'blob',
      observe: 'response'
    })
  .pipe(map(res => ({
      filename: MyFormService.getFileName(res.headers.get('content-disposition')),
      file: res.body
    })));
  }
}
