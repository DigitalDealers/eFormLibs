import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { LocalStorageService } from 'angular-2-local-storage';
import { combineLatest, from, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map } from 'rxjs/operators';

import { SafetyCategory } from './safety-category';

@Injectable()
export class CategoryService {
  private get _path() {
    return `categories`;
  }

  constructor(
    private _db: AngularFirestore,
    private _storage: LocalStorageService
  ) {
  }

  public static prepareDictionary(data: DocumentChangeAction<SafetyCategory>[]): SafetyCategory[] {
    const res = new Map<string, SafetyCategory>();
    for (let i = 0; i < data.length; i++) {
      const doc = data[i].payload.doc.data();
      doc.id = data[i].payload.doc.id;
      res.set(doc.id, doc);
    }
    return Array.from(res.values());
  }

  public save(data: string[]): Observable<void> {
    const dealerId = this._storage.get<number>('dealerId');
    const categories: SafetyCategory[] = data.map(categoryName => ({
      dealerId,
      title: categoryName
    }));
    const collection = this._db.firestore.collection(this._path);
    const batch = this._db.firestore.batch();
    categories.forEach(category => {
      const docRef = collection.doc();
      batch.set(docRef, category);
    });
    return from(batch.commit());
  }

  public getList(): Observable<SafetyCategory[]> {
    const ref1 = this._db
      .collection<SafetyCategory>(this._path, ref => {
        return ref.where('dealerId', '==', this._storage.get('dealerId'));
      })
      .snapshotChanges();
    const ref2 = this._db
      .collection<SafetyCategory>(this._path, ref => {
        return ref.where('dealerId', '==', null);
      })
      .snapshotChanges();

    return combineLatest(ref1, ref2).pipe(
      map(res => [...res[0], ...res[1]]),
      map(CategoryService.prepareDictionary)
    );
  }

  public remove(categoryId: string): Observable<void> {
    return fromPromise(
      this._db.collection<SafetyCategory>(this._path).doc(categoryId).delete()
    );
  }
}
