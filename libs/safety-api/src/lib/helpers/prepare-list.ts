import { DocumentChangeAction } from '@angular/fire/firestore';

export function prepareList<T = unknown>(list: DocumentChangeAction<T>[]): (T & { id: string })[] {
  return list.map(el => ({
    ...el.payload.doc.data(),
    id: el.payload.doc.id
  }));
}
