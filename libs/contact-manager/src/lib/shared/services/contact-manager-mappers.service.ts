import { ContactManagerSearchResult } from '../interfaces/contact-manager-search-result.interface';

// @dynamic
export class ContactManagerMappersService {
  static mapContactManagerSearchResult(items: ContactManagerSearchResult[]) {
    return items.map((item: ContactManagerSearchResult) => {
      if (item.items && item.items.length) {
        return {
          ...item,
          PortalUserId: ContactManagerMappersService.getPortalUserIdFromObject(item),
          accountNumber: ContactManagerMappersService.getAccountNumberFromObject(item.items[0])
        };
      }
      return {
        ...item,
        PortalUserId: ContactManagerMappersService.getPortalUserIdFromObject(item),
        accountNumber: ContactManagerMappersService.getAccountNumberFromObject(item)
      };
    });
  }

  private static getAccountNumberFromObject(obj: Object) {
    const key = Object.keys(obj).find((currentKey: string) => !!currentKey.match(/^account\s?number$/i));
    return obj[key || 'Account Number'];
  }

  private static getPortalUserIdFromObject(obj: Object) {
    const key = Object.keys(obj).find((currentKey: string) => !!currentKey.match(/^portaluserid$/i));
    return obj[key || 'PortalUserId'];
  }
}
