import { SafetyForm } from './safety-form';

export interface SafetyMyForm extends SafetyForm {
  answers: object;
  form?: any;
  createdBy?: string;
  createdOn?: number | string;
  modifiedOn?: number | string;
  shortModifiedOn?: string;
}
