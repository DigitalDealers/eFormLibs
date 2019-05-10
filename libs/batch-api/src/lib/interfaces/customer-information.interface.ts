export interface CustomerInformation {
  accStkOrders: string;
  countryCode: string;
  currInd: string;
  custAddr1: string;
  custAddr2: string;
  custAddr3: string;
  custCityState: string;
  custName: string;
  custName2: string;
  custPresCurrCd: string;
  dfltTermsCode: string;
  dftStnoEndUse: string;
  errorCode: string;
  errorMessage: string;
  exemptLicNo: string;
  jobSite: string;
  langCode: string;
  nameAddrLen: string;
  phoneNo: string;
  poNoReqdInd: string;
  reqByDateRequired: string;
  shipInst: ShipInst[];
  shipToAddrln1: string;
  shipToAddrln2: string;
  shipToAddrln3: string;
  shipToAddrln4: string;
  shipToAddrln5: string;
  shipToCustAddr1: string;
  shipToCustAddr2: string;
  shipToCustCity: string;
  shipToCustCountry: string;
  shipToCustName: string;
  shipToCustState: string;
  shipToCustZipCode: string;
  shipVia: ShipVia[];
  state: string;
  storeNo: string;
  validPayment: ValidPayment[];
  validStore: ValidStore[];
  zipCode: string;
}

export interface ShipInst {
  shippingCode: string;
  shippingDesc: string;
}

export interface ShipVia {
  shipViaCode: string;
  shipViaDesc: string;
}

export interface ValidPayment {
  dbsPaymentTermsCode: string;
  paymentTermsCode: string;
}

export interface ValidStore {
  endUseCode: string;
  storeNo: string;
}
