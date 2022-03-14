import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentChangeAction, DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { SafetyMyForm } from '@digitaldealers/typings';
import { format } from 'date-fns';
import { Observable, of, Subject } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map, switchMap } from 'rxjs/operators';

import { prepareItem } from '../helpers/prepare-item';

export interface MyFormListOptions {
  limit?: number;
  offset?: number;
  where?: [];
}

export interface MyFormExportParams {
  assetKey?: string;
  timezoneOffset?: number;
}

export interface ExportPdfResponse {
  file?: Blob;
  filename: string;
  link?: string;
}

// @dynamic
@Injectable()
export class MyFormService {
  private readonly collectionName = 'my-forms';
  private uid = '';

  constructor(
    private _db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private _afStorage: AngularFireStorage,
    private http: HttpClient
  ) {
    this.afAuth.user.subscribe(currentUser => this.uid = currentUser?.uid || '');
  }

  private static getFileName(header: string): string {
    const parts = (header || '').split('filename=');
    return parts[1] ? parts[1].replace(/"/g, '') : '';
  }

  public save(data: SafetyMyForm): Observable<string> {
    const collection = this._db.collection<SafetyMyForm>(this.collectionName);
    const myFormId = data.id;
    delete data.id;

    data.status = data.status || 'submitted';
    data.modifiedOn = Date.now();
    data.modifiedBy = this.uid;

    if (myFormId) {
      return fromPromise(collection.doc(myFormId).update(data)).pipe(map(() => myFormId));
    } else {
      data.createdBy = this.uid;
      data.createdOn = Date.now();
      data.assignedTo = null;
      data.assignedOn = null;
      return fromPromise(collection.add(data)).pipe(map(res => res.id));
    }
  }

  public getList(options: MyFormListOptions): Observable<SafetyMyForm[]> {
    return this._getList('createdBy', options);
  }

  public assignedToMeList(options: MyFormListOptions): Observable<SafetyMyForm[]> {
    return this._getList('assignedTo', options);
  }

  private _getList(key: string, options: MyFormListOptions) {
    const { where = [] } = options || {};
    return this._db
      .collection<SafetyMyForm>(this.collectionName, ref => {
        let filteredRef = ref.where(key, '==', this.uid);
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

  private prepareList(list: DocumentChangeAction<SafetyMyForm>[]): SafetyMyForm[] {
    return list.map(el => {
      const element = el.payload.doc.data() as SafetyMyForm;
      element.id = el.payload.doc.id;

      // todo deprecated, remove when prod migrated on algolia
      if (element.modifiedOn) {
        (element as any).shortModifiedOn = format(new Date(element.modifiedOn), 'DD MMM');
      }
      return element;
    });
  }

  public assignedToMeCount(): Observable<any> {
    return this._db
      .collection<SafetyMyForm>(this.collectionName, ref => {
        return ref.where('assignedTo', '==', this.uid);
      })
      .snapshotChanges()
      .pipe(map(res => res.length));
  }

  public getOne(id: string): Observable<SafetyMyForm | null> {
    const doc = this._db.collection<SafetyMyForm>(this.collectionName).doc(id);
    return doc.get().pipe(map(item => prepareItem<SafetyMyForm>(item as DocumentSnapshot<SafetyMyForm>)));
  }

  public async uploadFiles(files: (File | string)[]) {
    const tasks = [];
    const response: { [key: string]: { name: string; url: string; } } = {};
    for (let i = 0; i < files.length; i += 1) {
      const randomId = Math.random()
        .toString(36)
        .substring(2);
      response[randomId] = {
        name: (files[i] as File).name || randomId,
        url: ''
      };
      const ref = this._afStorage.ref(randomId);
      if (typeof files[i] === 'string') {
        tasks.push(ref.putString(files[i] as string));
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
    return this._db
      .collection<SafetyMyForm>(this.collectionName, ref =>
        ref.where('createdBy', '==', this.uid)
      )
      .snapshotChanges()
      .pipe(map(res => res.length));
  }

  public delete(id: string): Observable<void> {
    const document = this._db.collection<SafetyMyForm>(this.collectionName).doc(id);
    return fromPromise(document.delete());
  }

  public export(
    url: string,
    formId: string,
    params: MyFormExportParams = {}
  ): Observable<ExportPdfResponse | null> {
    return this.http
      .get(`${url}/${formId}`, {
        responseType: 'blob',
        observe: 'response',
        params: {
          ...params,
          timezoneOffset: params.timezoneOffset ? params.timezoneOffset.toString() : ''
        }
      })
      .pipe(
        switchMap(res => {
          const contentDisposition = res.headers.get('content-disposition');

          if (contentDisposition) {
            return of({
              filename: MyFormService.getFileName(contentDisposition),
              file: res.body as Blob
            });
          }

          return this.blobToJson<ExportPdfResponse>(res.body);
        })
      );
  }

  private blobToJson<T = unknown>(blob: Blob | null): Observable<T | null> {
    if (!blob) {
      return of(null);
    }

    const subject = new Subject<T | null>();
    const fr = new FileReader();
    fr.addEventListener('load', () => {
      try {
        subject.next(JSON.parse(fr.result as string));
      } catch (e) {
        console.error(`Can't parse response`, e);
        subject.next(null);
      }
      subject.complete();
    });
    fr.readAsText(blob);
    return subject.asObservable();
  }
}
