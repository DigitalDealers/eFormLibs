import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SafetyField } from '@digitaldealers/safety-api';

import { FormObserverService } from '../form-observer.service';
import { TableColumnDialogService } from '../table-column-dialog/table-column-dialog.service';

@Component({
  selector: 'didi-table-control',
  templateUrl: './table-control.component.html',
  styleUrls: ['./table-control.component.scss'],
  providers: [DatePipe]
})
export class TableControlComponent implements OnInit {
  @Input() public form: FormGroup;
  @Input() public field: SafetyField;
  @Input() public value: { [key: string]: any }[];
  @Input() public hidden: boolean;
  @Input() public invalid: boolean;
  @Input() public readonly: boolean;
  @Output() public setFieldValue: EventEmitter<any> = new EventEmitter();
  public table: {
    type: string;
    value: string;
  }[][] = [];

  constructor(
    private _dialog: TableColumnDialogService,
    private _formObserver: FormObserverService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this._prepareColumns();
    this.form.valueChanges.subscribe(() => {
      this._prepareColumns();
    });
  }

  public handleClick() {
    this._dialog.open({
      width: '80vw',
      maxWidth: '860px',
      data: { config: this.field }
    });
  }

  public editItem(e, index) {
    this._dialog.open({
      width: '80vw',
      maxWidth: '860px',
      data: {
        config: this.field,
        value: this.value[index],
        index
      }
    });
  }

  public removeItem(e, index) {
    const { controlName } = this.field;
    this._formObserver.emit({
      controlName,
      index,
      context: 'delete'
    });
    this.table = this.table.filter((el, i) => i !== index);
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
        const value = this.getValue(this.value[i][controls[j]]);
        this.table[i].push({ value, type });
      }
    }
  }

  private getValue(val: string | Date): string {
    if ((val as Date).getDate) {
      return this.datePipe.transform(val, 'dd/MM/yyyy');
    }
    return val as string;
  }
}
