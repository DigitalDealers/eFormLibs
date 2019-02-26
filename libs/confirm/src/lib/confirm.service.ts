import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm.component';

@Injectable()
export class DidiConfirmService {
  constructor(private _dialog: MatDialog) {}

  public open(config: MatDialogConfig = {}) {
    return this._dialog.open(ConfirmDialogComponent, config);
  }
}
