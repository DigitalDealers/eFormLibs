import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SafetyControl } from '../interfaces/safety-control';

@Injectable()
export class ControlService {
  private readonly collectionName = 'controls';

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {}

  static prepareList(data) {
    const res = {
      singleChoice: [],
      multipleChoice: [],
      other: []
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
        default:
          res.other.push(doc);
          break;
      }
    }
    return res;
  }

  public static prepareDictionary(data) {
    const res = {};
    for (let i = 0; i < data.length; i += 1) {
      const doc = data[i].payload.doc.data() as SafetyControl;
      doc.id = data[i].payload.doc.id;
      res[doc.id] = doc;
    }

    return res;
  }

  public getList(type = 'default'): Observable<any> {
    const mapper =
      type === 'dictionary'
        ? ControlService.prepareDictionary
        : ControlService.prepareList;

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

    return combineLatest(ref1, ref2).pipe(
      map(res => [...res[0], ...res[1]]),
      map(mapper)
    );
  }

  public save(data) {
    const collection = this._db.collection<SafetyControl>(this.collectionName);
    collection.add(data);
  }

  public update(id, data) {
    delete data.id;
    const itemsRef = this._db.collection(this.collectionName).doc(id);
    return itemsRef.update(data);
  }

  public delete(id) {
    const itemsRef = this._db.collection(this.collectionName).doc(id);
    itemsRef.delete();
  }

  private _createDefaultControls() {
    const batch = this._db.firestore.batch();
    const dealerId = this._storage.get('dealerId');
    const defaultControls = [
      {
        dealerId,
        icon: 'title',
        title: 'Text',
        type: 'input-text'
      },
      {
        dealerId,
        icon: 'photo_library',
        title: 'Photo',
        type: 'photo'
      },
      {
        dealerId,
        icon: 'view_list',
        title: 'Dropdown',
        type: 'dropdown'
      },
      {
        dealerId,
        icon: 'format_list_numbered',
        title: 'Number',
        type: 'input-number'
      },
      {
        dealerId,
        icon: 'wrap_text',
        title: 'Text Section',
        type: 'text-section'
      },
      {
        dealerId,
        icon: 'dialpad',
        title: 'Section',
        type: 'section'
      }
    ];
    for (let i = 0; i < defaultControls.length; i += 1) {
      const doc = this._db.collection(this.collectionName).doc(this._db.createId()).ref;
      batch.set(doc, defaultControls[i]);
    }
    batch.commit();
  }
}
