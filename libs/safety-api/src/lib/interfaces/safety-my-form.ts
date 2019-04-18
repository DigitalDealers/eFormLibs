import { SafetyForm } from './safety-form';

export interface MyFormAnswers {
  [controlName: string]: any;
}

export interface SafetyMyForm extends SafetyForm {
  answers: MyFormAnswers;
  assignedOn: number | null;
  assignedTo: string | null;
  createdBy?: string;
  createdOn?: number;
  formId: string;
  modifiedBy?: string;
  modifiedOn?: number;
  shortModifiedOn?: string;
}
