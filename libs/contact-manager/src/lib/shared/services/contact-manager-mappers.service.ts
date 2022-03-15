import { ContactManagerCustomer, ContactManagerSearchResult } from '../interfaces/contact-manager-search-result.interface';

// @dynamic
export class ContactManagerMappersService {
  static mapContactManagerSearchResult(items: ContactManagerSearchResult[]) {
    return items.map(item => {
      if (item.items?.length) {
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

  private static getAccountNumberFromObject(obj: ContactManagerSearchResult | ContactManagerCustomer): string {
    const key = Object.keys(obj).find(currentKey => !!currentKey.match(/^account\s?number$/i));
    return obj[(key || 'Account Number') as keyof (ContactManagerSearchResult | ContactManagerCustomer)] as string;
  }

  private static getPortalUserIdFromObject(obj: ContactManagerSearchResult): string | undefined {
    const key = Object.keys(obj).find(currentKey => !!currentKey.match(/^portaluserid$/i));
    return obj[(key || 'PortalUserId') as keyof ContactManagerSearchResult] as string | undefined;
  }
}
