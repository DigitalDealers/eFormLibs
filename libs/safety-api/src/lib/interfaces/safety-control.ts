export type ControlType = 'amount' |
  'attachment' |
  'datetime' |
  'dropdown' |
  'electronic-signature' |
  'input-number' |
  'input-text' |
  'link-form' |
  'location' |
  'multiple-choice' |
  'photo' |
  'section' |
  'single-choice' |
  'table' |
  'text-section';

export interface SafetyControl {
  choices?: string[];
  dealerId?: number | null;
  icon?: string;
  id?: string;
  type: ControlType;
}

export interface MappedSafetyControls {
  singleChoice: SafetyControl[];
  multipleChoice: SafetyControl[];
  other: SafetyControl[];
}

export interface DictionarySafetyControls {
  [key: string]: SafetyControl;
}

export type ControlListType = 'default' | 'dictionary';
