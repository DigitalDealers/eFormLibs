export interface Role {
  dealerId: number;
  id: number;
  isDefault: boolean;
  role: string;
  startPage?: any;
  type?: 'Default Role' | 'Custom Role';
}
