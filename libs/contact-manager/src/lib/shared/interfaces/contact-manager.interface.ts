import { NotificationHubEvent } from './notification-hub-event.interface';
import { Role } from './role.interface';

export interface ContactManager {
  dataSetId: number;
  accountNumber: string;
  legalEntity: string;
  contactName: string;
  phone: string;
  email: string;
  isPortalUser: string;
  notifications: NotificationHubEvent;
  roles: Role[];
  legalEntities?: string[];
  customerLegalEntity: string;
  customerName: string;
  customerNumber: string;
  customersDataSetId: number;
  isPortalCustomer: string;
}
