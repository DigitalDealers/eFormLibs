export class ContactManagerUtilsService {
  static closestByClassName(element: HTMLElement, className: string): HTMLElement {
    if (!element) {
      return null;
    }
    while ((element.className || '').indexOf(className) === -1) {
      element = (element as any).parentNode;
      if (!element) {
        return null;
      }
    }
    return element;
  }
}
