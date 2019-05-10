export interface CustomerParams {
  custNo: string;
  custType?: string;
}

export interface PartsParams {
  storeCode: string;
  requestedBy?: string;
  customerNumber: string;
  parts: PartParam[];
  orderType: string;
}

export interface PartParam {
  partNumber: string;
  qty: number;
  sos: string;
}

export interface DiscountTaxParams {
  storeCode: string;
  customerNumber: string;
  custType: string;
  orderType: string;
  requestedBy?: string;
  shipViaCode?: string;
  taxPartArray: TaxPart[];
}

export interface TaxPart {
  coreUnitSell: number;
  coreUnitSellSpecified?: boolean;
  ordQty: number;
  ordQtySpecified?: boolean;
  partErrorCode?: string;
  partErrorDesc?: string;
  partNo: string;
  sos: string;
  unitDisc: number;
  unitDiscSpecified?: boolean;
  unitSell: number;
  unitSellSpecified?: boolean;
  unitWeight: number;
  unitWeightSpecified?: boolean;
}

export interface CatPartParams {
  partNumber: string;
  partType: string;
  inquiryQuantity: number;
  orderClass: string;
}

export interface CommonResponse<T> {
  return: T;
}
