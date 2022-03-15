import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export interface ContactManagerDialogSettings {
  data: unknown;
  componentRef: ComponentType<unknown> | TemplateRef<unknown>;
  disableAnimation?: boolean;
  prevDialogRef?: MatDialogRef<unknown>;
}
