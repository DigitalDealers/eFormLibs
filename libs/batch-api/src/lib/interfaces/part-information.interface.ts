interface PartInfoCommon {
  bo: PartInfoBo[];
  boInd: string;
  coreDesc: string;
  coreUnitSell: number;
  coreUnitSellSpecified: boolean;
  desc: string;
  extdCoreSell: number;
  extdCoreSellSpecified: boolean;
  extdDisc: number;
  extdDiscSpecified: boolean;
  extdSell: number;
  extdSellSpecified: boolean;
  hoseAsmInd: string;
  nonRtnInd: string;
  partNoteArray: any;
  sosName: string;
  unitDisc: number;
  unitDiscSpecified: boolean;
  unitSell: number;
  unitSellSpecified: boolean;
  unitWeight: number;
  unitWeightSpecified: boolean;
}

export interface PartInformation extends PartInfoCommon {
  altPart: AltPart[];
  currInd: string;
  custPresCurrCd: string;
  errorCode: string;
  errorMessage: string;
  extdNet: number;
  extdNetSpecified: boolean;
  outputSOS: string;
  qtyOnHand: number;
  qtyOnHandSpecified: boolean;
  repl: any;
  xref: any;
  xmlsn: {
    count: number;
  };
}

export interface PartInfoBo {
  boFac: string;
  boQty: number;
  boQtySpecified: boolean;
}

export interface AltPart extends PartInfoCommon {
  netPrice: number;
  netPriceSpecified: boolean;
  onHand: number;
  onHandSpecified: boolean;
  partNo: string;
  sos: string;
}
