export class ManageDetailsMapService {
  static parseNames(contactName: string) {
    const names = (contactName || '').split(' ');
    let lastName = '';
    let firstName = '';
    if (names.length > 1) {
      firstName = names.shift() || '';
      lastName = names.join(' ');
    } else {
      firstName = names[0] || '';
    }
    return { firstName, lastName };
  }
}
