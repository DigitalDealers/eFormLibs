import { SafetyRole } from './safety-role';
import { SafetyForm } from './safety-form';

export interface SafetyPermission {
  id?: string;
  roleId: string;
  formTypeId: string;
  role: SafetyRole;
  formType: SafetyForm;
}
