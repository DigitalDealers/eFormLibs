import { DocumentSnapshot } from '@angular/fire/firestore';

export function prepareItem<T = unknown>(data: DocumentSnapshot<T>): (T & { id: string }) | null {
  if (!data.exists) {
    return null;
  }

  return {
    ...data.data(),
    id: data.id
  };
}
