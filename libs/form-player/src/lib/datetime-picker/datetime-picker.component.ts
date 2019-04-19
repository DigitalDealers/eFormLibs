import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { SafetyField } from '@digitaldealers/safety-api';
import * as firebase from 'firebase/app';
import * as moment_ from 'moment';

import { FormObserverService } from '../form-observer.service';

const moment = moment_;

@Component({
  selector: 'didi-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ]
})
export class DatetimePickerComponent implements OnInit {
  @ViewChild('picker') picker: MatDatepicker<Date>;
  @Input() public value: any;
  @Input() public field: SafetyField;
  @Input() public readonly: boolean;
  public form: FormGroup;

  constructor(private fb: FormBuilder, private _formObserver: FormObserverService, private _adapter: DateAdapter<any>) {
    this.form = this.fb.group({
      date: '',
      time: ''
    });
  }

  public ngOnInit() {
    this._adapter.setLocale(this.field.locale || 'en-US');

    if (!this.readonly) {
      this.form
        .get('date')
        .setValidators([Validators.required]);
    }

    if (this.field.showTimePicker && !this.readonly) {
      this.form
        .get('time')
        .setValidators([Validators.required, Validators.pattern('^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]$')]);
    }

    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        const date = this._combineDate();
        this._formObserver.emit({
          context: 'setFieldValue',
          value: date && date.toDate(),
          type: 'datetime',
          controlName: this.field.controlName
        });
      }
    });

    this.form.patchValue(
      {
        date: this.convertToMoment(this.value),
        time: this.getTime(this.value)
      },
      { emitEvent: false }
    );
  }

  public showPicker(): void {
    if (!this.readonly) {
      this.picker.open();
    }
  }

  private getTime(value: any): string | null {
    if (!value || !value.seconds) {
      return null;
    }
    const date = this.convertToMoment(value);
    return date ? date.format('HH:mm') : null;
  }

  private convertToMoment(value: any): moment_.Moment | null {
    if (!value || !value.seconds) {
      return null;
    }

    let date;
    if ((value as firebase.firestore.Timestamp).toDate) {
      date = moment((value as firebase.firestore.Timestamp).toDate());
    } else {
      date = moment(value);
    }

    return date;
  }

  private _combineDate(): moment_.Moment {
    const date = moment(this.form.get('date').value);
    let time = this.form.get('time').value;
    if (time) {
      time = time.split(':');
      date.hours(+time[0]);
      date.minutes(+time[1]);
    }

    return date;
  }
}
