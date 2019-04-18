import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { SafetyField } from '@digitaldealers/safety-api';

import { TableColumnDialogComponent } from './table-column-dialog.component';

export interface TableColumnDialogData {
  config: SafetyField;
  value?: any;
  index?: number;
  assetKey: string;
}

@Injectable()
export class TableColumnDialogService {
  constructor(private _dialog: MatDialog) {
  }

  public open(config: MatDialogConfig<TableColumnDialogData>): MatDialogRef<TableColumnDialogComponent> {
    return this._dialog.open<TableColumnDialogComponent, TableColumnDialogData>(TableColumnDialogComponent, config);
  }
}
