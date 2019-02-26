import { Component, OnInit, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormObserverService } from '../form-observer.service';

@Component({
  selector: 'didi-table-column-dialog',
  templateUrl: './table-column-dialog.component.html',
  styleUrls: ['./table-column-dialog.component.scss']
})
export class TableColumnDialogComponent implements OnInit {
  public form: FormGroup;
  public config;
  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<TableColumnDialogComponent>,
    private _formObserver: FormObserverService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this._fb.group({});
    this.config = this.data.config;
  }

  ngOnInit() {
    this._prepareConfig(this.config);
  }

  public handleCancel() {
    this._dialogRef.close(false);
  }

  public handleSubmit() {
    if (this.form.valid) {
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
