import { firestore } from 'firebase/app';

export function prepareItem<T = any>(data: firestore.DocumentSnapshot): T | null {
  if (!data.exists) {
    return null;
  }

  const doc = data.data();
  doc.id = data.id;
  return doc as T;
}
