import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { TableColumnDialogComponent } from './table-column-dialog.component';

@Injectable()
export class TableColumnDialogService {
  constructor(private _dialog: MatDialog) {}

  public open(config: MatDialogConfig) {
    return this._dialog.open(TableColumnDialogComponent, config);
  }
}
