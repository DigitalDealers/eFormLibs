import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from '@digitaldealers/base-component';
import { SafetyField } from '@digitaldealers/safety-api';
import * as firebase from 'firebase/app';
import * as  moment_ from 'moment';

import { FormObserverService } from '../form-observer.service';
import { TableColumnDialogService } from '../table-column-dialog/table-column-dialog.service';

const moment = moment_;

@Component({
  selector: 'didi-table-control',
  templateUrl: './table-control.component.html',
  styleUrls: ['./table-control.component.scss']
})
export class TableControlComponent extends BaseComponent implements OnInit {
  @Input() public form: FormGroup;
  @Input() public field: SafetyField;
  @Input() public value: { [key: string]: any }[];
  @Input() public hidden: boolean;
  @Input() public invalid: boolean;
  @Input() public readonly: boolean;
  @Input() public assetKey: string;

  @Output() public setFieldValue: EventEmitter<any> = new EventEmitter();

  public table: {
    type: string;
    value: string;
    locale?: any;
  }[][] = [];

  constructor(private _dialog: TableColumnDialogService, private _formObserver: FormObserverService) {
    super();
  }

  ngOnInit() {
    this._prepareColumns();

    this.subs = this.form.valueChanges.subscribe(() => this._prepareColumns());
  }

  public getDateTime(val: any, index: number): string {
    let date: Date;

    if ((val as firebase.firestore.Timestamp).toDate) {
      date = (val as firebase.firestore.Timestamp).toDate();
    }

    if ((val as Date).getTime) {
      date = val;
    }

    if (date) {
      const { showTimePicker, locale } = this.field.children[index];
      return this.getFormattedDate(date, locale, showTimePicker);
    }

    return val;
  }

  public handleClick() {
    this._dialog.open({
      width: '80vw',
      maxWidth: '860px',
      data: {
        config: this.field,
        assetKey: this.assetKey
      }
    });
  }

  public editItem(_e, index) {
    this._dialog.open({
      width: '80vw',
      maxWidth: '860px',
      data: {
        config: this.field,
        value: this.value[index],
        assetKey: this.assetKey,
        index
      }
    });
  }

  public removeItem(_e, index) {
    const { controlName } = this.field;
    this._formObserver.emit({
      controlName,
      index,
      context: 'delete'
    });
    this.table = this.table.filter((_el, i) => i !== index);
  }

  private _prepareColumns() {
    this.table = [];
    if (!this.value) {
      return;
    }

    const controls = this.field.children.map(child => child.controlName);
    const types = this.field.children.map(child => child.response.type);

    for (let i = 0; i < this.value.length; i++) {
      this.table[i] = [];
      for (let j = 0; j < controls.length; j++) {
        const type = types[j];
        const value = this.value[i][controls[j]] || null;
        this.table[i].push({ value, type });
      }
    }
  }

  private getFormattedDate(date: Date, locale: string, showTime: boolean): string {
    const timeString = showTime ? ` ${moment(date).format('HH:mm')}` : '';
    return (
      moment(date)
        .locale(locale)
        .format('L') + timeString
    );
  }
}
