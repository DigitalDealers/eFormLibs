import { firestore } from 'firebase/app';

export function prepareItem<T = any>(data: firestore.DocumentSnapshot): T {
  const doc = data.data();
  doc.id = data.id;
  return doc as T;
}
