import { SafetyForm } from './safety-form';
import { SafetyRole } from './safety-role';

export interface SafetyFormRole {
  id?: string;
  dealerId: string;
  formId: string;
  roleId: string;
  form?: SafetyForm;
  role?: SafetyRole;
}
