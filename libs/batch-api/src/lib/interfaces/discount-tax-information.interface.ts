export interface DiscountTaxInformation {
  currInd: string;
  dlrCreditFlag: string;
  docDiscTotal: number;
  docDiscTotalSpecified: boolean;
  errorCode: string;
  errorMessage: string;
  itemDiscTotal: number;
  itemDiscTotalSpecified: boolean;
  netTotal: number;
  netTotalSpecified: boolean;
  orderBeforeTaxes: number;
  orderBeforeTaxesSpecified: boolean;
  orderTotal: number;
  orderTotalSpecified: boolean;
  shipMiscCharge: number;
  shipMiscChargeSpecified: boolean;
  shipToAddrLn1: string;
  shipToAddrLn2: string;
  shipToAddrLn3: string;
  shipToAddrLn4: string;
  shipToAddrLn5: string;
  taxArray: TaxArray[];
  taxTotal: number;
  taxTotalSpecified: boolean;
  arraY_LEN_TAXSpecified: boolean;
}

export interface TaxArray {
  taxAmount: number;
  taxAmountSpecified: boolean;
  taxDesc: string;
}
