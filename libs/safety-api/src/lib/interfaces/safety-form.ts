export interface SafetyFieldResponse {
  dealerId?: number;
  icon?: string;
  id?: string;
  title?: string;
  type?: string;
  choices?: string[];
}

export interface SafetyField {
  controlName?: string;
  order?: number;
  question: string;
  response: SafetyFieldResponse | string;
  children?: any[];
  sections?: any;
  state?: string;
  multi?: boolean;
  logic?: boolean;
  mappingName?: string;
  speechToText?: boolean;
}

export interface SafetyForm {
  category?: string;
  dealerId: number;
  description: string;
  exportFunction?: string;
  fields: SafetyField[];
  id?: string;
  roles?: string[];
  title: string;
}
