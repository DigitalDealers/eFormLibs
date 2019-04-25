import { DocumentChangeAction } from '@angular/fire/firestore';

export function prepareList<T = any>(list: DocumentChangeAction<T>[]): T[] {
  return list.map(el => {
    const element = el.payload.doc.data();
    (element as any).id = el.payload.doc.id;
    return element;
  });
}
