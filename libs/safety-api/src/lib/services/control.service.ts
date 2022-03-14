import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentReference } from '@angular/fire/firestore';
import { ControlListType, DictionarySafetyControls, MappedSafetyControls, SafetyControl } from '@digitaldealers/typings';
import { LocalStorageService } from 'angular-2-local-storage';
import { combineLatest, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map } from 'rxjs/operators';

type DataMapper = (data: DocumentChangeAction<SafetyControl>[]) => DictionarySafetyControls | MappedSafetyControls;

// deprecated in forms v2
@Injectable()
export class ControlService {
  private readonly collectionName = 'controls';

  constructor(private _db: AngularFirestore, private _storage: LocalStorageService) {
  }

  static prepareList(data: DocumentChangeAction<SafetyControl>[]): MappedSafetyControls {
    const res: MappedSafetyControls = {
      singleChoice: [],
      multipleChoice: [],
      other: [],
      select: []
    };

    for (let i = 0; i < data.length; i += 1) {
      const doc = data[i].payload.doc.data() as SafetyControl;
      doc.id = data[i].payload.doc.id;
      switch (doc.type) {
        case 'single-choice':
          res.singleChoice.push(doc);
          break;
        case 'multiple-choice':
          res.multipleChoice.push(doc);
          break;
        case 'select':
          if (doc.dealerId) {
            res.select.push(doc);
          } else {
            res.other.push(doc);
          }
          break;
        default:
          res.other.push(doc);
          break;
      }
    }
    return res;
  }

  public static prepareDictionary(data: DocumentChangeAction<SafetyControl>[]): DictionarySafetyControls {
    const res: DictionarySafetyControls = {};
    for (let i = 0; i < data.length; i += 1) {
      const doc = data[i].payload.doc.data() as SafetyControl;
      doc.id = data[i].payload.doc.id;
      res[doc.id] = doc;
    }

    return res;
  }

  public getList(type: ControlListType = 'default'): Observable<MappedSafetyControls | DictionarySafetyControls> {
    const mapper: DataMapper = type === 'dictionary' ? ControlService.prepareDictionary : ControlService.prepareList;

    const ref1 = this._db
      .collection<SafetyControl>(this.collectionName, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges();
    const ref2 = this._db
      .collection<SafetyControl>(this.collectionName, ref => {
        return ref.where('dealerId', '==', null);
      })
      .snapshotChanges();

    return combineLatest([ref1, ref2]).pipe(
      map(res => [...res[0], ...res[1]]),
      map(mapper)
    );
  }

  public save(data: SafetyControl): Observable<DocumentReference> {
    return fromPromise<DocumentReference>(this._db.collection<SafetyControl>(this.collectionName).add(data));
  }

  public update(id: string, data: SafetyControl): Observable<void> {
    delete data.id;
    return fromPromise(
      this._db
        .collection(this.collectionName)
        .doc(id)
        .update(data)
    );
  }

  public delete(id: string): Observable<void> {
    return fromPromise(
      this._db
        .collection(this.collectionName)
        .doc(id)
        .delete()
    );
  }
}
