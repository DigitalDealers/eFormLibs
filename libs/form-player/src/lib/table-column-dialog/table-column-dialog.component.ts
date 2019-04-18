import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BaseComponent } from '@digitaldealers/base-component';
import { timer } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FormObserverService } from '../form-observer.service';
import { TableColumnDialogData } from './table-column-dialog.service';

@Component({
  selector: 'didi-table-column-dialog',
  templateUrl: './table-column-dialog.component.html',
  styleUrls: ['./table-column-dialog.component.scss']
})
export class TableColumnDialogComponent extends BaseComponent implements OnInit {
  public form: FormGroup;
  public config;
  public assetKey: string;

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<TableColumnDialogComponent>,
    private _formObserver: FormObserverService,
    @Inject(MAT_DIALOG_DATA) private data: TableColumnDialogData
  ) {
    super();
    this.form = this._fb.group({});
    this.config = this.data.config;
    this.assetKey = this.data.assetKey;
  }

  ngOnInit() {
    this._prepareConfig(this.config);

    // listener form nested controls
    this.subs = this._formObserver.form$
      .pipe(filter(res => res.context === 'setFieldValue' && res.controlName !== this.config.controlName))
      .subscribe(res => {
        let { value } = res;
        if (res.type === 'datetime') {
          value = new Date(value);
        }
        if (this.form.contains(res.controlName)) {
          this.form.get(res.controlName).setValue(value);
        }
      });
  }

  public handleCancel() {
    this._dialogRef.close(false);
  }

  public handleSubmit() {
    if (this.form.valid) {
      const source = timer(800);
      source.subscribe(() => {
        const {
          data: { index },
          config: { controlName }
        } = this;
        this._formObserver.emit({
          index,
          controlName,
          value: this.form.value
        });

        this._dialogRef.close(true);
      });
    }
  }

  public setFieldValue(e) {
    const { controlName, value } = e;
    this.form.get(controlName).setValue(value);
  }

  private _prepareConfig(config) {
    const { children } = config;
    if (children) {
      children.map(control => {
        this.createFormControl(control);
        return control;
      });
    }
    if (this.data.value) {
      this.form.patchValue(this.data.value);
    }
  }

  private createFormControl(control) {
    this.form.addControl(control.controlName, new FormControl());
    if (control.state === 'required') {
      this.form.get(control.controlName).setValidators([Validators.required]);
    }
  }
}
