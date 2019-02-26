import { SafetyRole } from './safety-role';
import { SafetyUser } from './safety-user';

export interface SafetyUserRole {
  id?: string;
  dealerId: string;
  userId: string;
  roleId: string;
  user?: SafetyUser;
  role?: SafetyRole;
}
