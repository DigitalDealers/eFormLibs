import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LinkConfirmComponent } from './link-confirm.component';

@Injectable({
  providedIn: 'root'
})
export class LinkConfirmService {
  constructor(private _dialog: MatDialog) {}

  public open(config: MatDialogConfig = {}) {
    return this._dialog.open(LinkConfirmComponent, config);
  }
}
