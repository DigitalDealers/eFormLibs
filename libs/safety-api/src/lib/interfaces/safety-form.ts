import { SafetyControl } from './safety-control';

export type ControlState = 'hidden' |
  'notApplicable' |
  'readonly' |
  'required';

export type TextSectionFileType = 'image' | 'video';

export interface SafetyFieldResponse extends SafetyControl {
  showTimePicker?: boolean;
  title?: string;
}

export interface LogicSection {
  condition: string;
  items: SafetyField[];
  value: string;
}

export interface RelatedForm {
  formId: string;
  title: string;
}

export interface SafetyField<T = SafetyFieldResponse> {
  children?: SafetyField[];
  controlName: string;
  dataSetId?: number;
  dropdownLabel?: string;
  dropdownValue?: string;
  /**
   * @deprecated image property use file instead
   */
  image?: {
    name: string;
    url: string;
  };
  file?: {
    name: string;
    url: string;
    type: TextSectionFileType;
  };
  locale?: string;
  manual?: boolean;
  mappingName?: string;
  multi?: boolean;
  order: number;
  qrScanner?: boolean;
  question: string;
  relatedForms?: RelatedForm[];
  response: T;
  sections?: LogicSection[];
  showTimePicker?: boolean;
  speechToText?: boolean;
  state?: ControlState;
}

export interface SafetyForm {
  canBeDeleted?: boolean;
  canBeSubmitted?: boolean;
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
