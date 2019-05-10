export interface CatPart {
  availabilityArray: CatAvailability[] | null;
  cartonQuantity: string;
  crossReferencePartNumber: string;
  crossReferenceType: string;
  dealerShareIndicator: string;
  demandIndicator: string;
  engineCode: string;
  errorCode: string;
  errorReasonCode: string;
  fluidCarrierMessageCode: string;
  hazardousMaterialIndicator: string;
  importRestrictionIndicator: string;
  inEffectiveDate: string;
  longPartDescription: string;
  madeAsOrderedIndicator: string;
  majorMinorClass: string;
  minimumOrderQuantity: string;
  newReleaseIndicator: string;
  nonReturnableIndicator: string;
  outEffectiveDate: string;
  packageQuantity: string;
  partDIMHeight: number;
  partDIMHeightSpecified: boolean;
  partDIMLength: number;
  partDIMLengthSpecified: boolean;
  partDIMUnitMeasure: string;
  partDIMWeight: number;
  partDIMWeightSpecified: boolean;
  partDIMWidth: number;
  partDIMWidthSpecified: boolean;
  partGrossWeight: number;
  partGrossWeightSpecified: boolean;
  partNumber: string;
  partType: string;
  productCode: string;
  quantityEntered: string;
  sellingUnitMeasure: string;
  serviceChargePercent: number;
  serviceChargePercentSpecified: boolean;
  shortPartDescription: string;
  transportQuantity: string;
  typeDescription: string;
  weightUnitOfMeasure: string;
}

export interface CatAvailability {
  sourceFacilityCode: string;
  availableQuantity: string;
  displaySourceFacilityCode: string;
}
