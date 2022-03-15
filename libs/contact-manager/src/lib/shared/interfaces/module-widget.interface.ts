import { ModuleType } from './module-type.interface';

export interface ModuleWidget {
  communicationCentre?: boolean;
  contactManager?: string;
  dealerId: number;
  id?: string;
  partsTracker?: string;
  previewImage?: string;
  profile?: string;
  promoCodes?: string;
  salesKit?: boolean;
  sharePoint?: string;
  title: string;
  twilioUrl?: string;
  type?: ModuleType;
  zendesk?: string;
}
