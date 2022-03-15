import { ContactManagerCustomer } from './contact-manager-search-result.interface';

export interface PortalUser {
  id?: number;
  email?: string;
  fName?: string;
  lName?: string;
  type?: string;
  phone?: string;
  legalEntity?: string;
  entityId?: string;
  locations?: any;
  applications?: any;
  customerNumber?: string;
  companyName?: string;
  picture?: string;
  isInPortal?: boolean;
  items?: ContactManagerCustomer[];
  userFName?: string;
  extraName?: string;
}
