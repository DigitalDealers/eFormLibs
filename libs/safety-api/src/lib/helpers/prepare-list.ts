export function prepareList<T = any>(list): T[] {
  return list.map(el => {
    const element = el.payload.doc.data();
    element.id = el.payload.doc.id;
    return element;
  });
}
