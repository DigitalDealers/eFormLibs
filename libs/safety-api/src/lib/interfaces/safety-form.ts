import { SafetyControl } from './safety-control';

export type ControlState = 'hidden' |
  'notApplicable' |
  'readonly' |
  'required';

export interface SafetyFieldResponse extends SafetyControl {
  showTimePicker?: boolean;
  title?: string;
}

export interface LogicSection {
  condition: string;
  items: SafetyField[];
  value: string;
}

export interface SafetyField<T = SafetyFieldResponse> {
  children?: SafetyField[];
  controlName: string;
  dataSetId?: number;
  dropdownLabel?: string;
  dropdownValue?: string;
  image?: {
    name: string;
    url: string;
  };
  locale?: string;
  logic?: boolean;
  manual?: boolean;
  mappingName?: string;
  multi?: boolean;
  order: number;
  question: string;
  relatedForms?: any[];
  response: T;
  sections?: LogicSection[];
  showTimePicker?: boolean;
  speechToText?: boolean;
  state?: ControlState;
}

export interface SafetyForm {
  category?: string;
  dealerId: number;
  description: string;
  exportFunction?: string;
  fields: SafetyField[];
  id?: string;
  isPublic?: boolean;
  roles?: string[];
  status: string;
  title1Field: string;
  title2Field: string;
  title3Field: string;
  title: string;
  workflowFunction?: string;
}
