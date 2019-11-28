export interface UserProfile {
  companyName: string;
  companyUsers: UserProfileUser[];
  customers: UserProfileCustomer[];
  homeSite: string;
  permissions: any;
  roles: string[];
  startPage: string;
  user: UserProfileUser;
  vendors: any[];
}

export interface UserProfileUser {
  dealerId: number;
  email: string;
  emailAlerts: boolean;
  emailVerifyed: boolean;
  extraName?: string;
  fName: string;
  fullName: string;
  id: number;
  identityUserId: string;
  legalEntity: string;
  lName: string;
  originalEmail: string;
  phone: string;
  picture: string;
  sMSAlerts: boolean;
  state: string;
  status: string;
  type: string;
  userFName?: string;
}

export interface UserProfileCustomer {
  address: string;
  city: string;
  companyName: string;
  country: string;
  customerNumber: string;
  dealerId: number;
  id: number;
  legalEntity: string;
}
