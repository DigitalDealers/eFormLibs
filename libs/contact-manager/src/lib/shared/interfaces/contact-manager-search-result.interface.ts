export interface ContactManagerSearchResult {
  ['Account Number']: string;
  ['Legal Entity']: string;
  ['Contact Name']: string;
  ['Is Portal User']: 'Yes' | 'No';
  ['Portal User Status']: string;
  Phone: string;
  Email: string;
  accountNumber: string;
  PortalUserId?: string;
  CustomerPortalId?: string;
  items?: ContactManagerCustomer[];
}

export type isPortalUserKey = Extract<keyof ContactManagerSearchResult, 'Is Portal User'>;
export type ContactNameKey = Extract<keyof ContactManagerSearchResult, 'Contact Name'>;
export type AccountNumberKey = Extract<keyof ContactManagerSearchResult, 'Account Number'>;
export type LegalEntityKey = Extract<keyof ContactManagerSearchResult, 'Legal Entity'>;

export interface ContactManagerCustomer {
  ['ACCOUNT NUMBER']: string;
  ['CUSTOMER NAME']: string;
  ['LEGAL ENTITY']: string;
}
