export function prepareItem<T = any>(data): T {
  const doc = data.data();
  doc.id = data.id;
  return doc;
}
