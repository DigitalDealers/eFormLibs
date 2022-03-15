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

export interface ContactManagerCustomer {
  ['ACCOUNT NUMBER']: string;
  ['CUSTOMER NAME']: string;
  ['LEGAL ENTITY']: string;
}
