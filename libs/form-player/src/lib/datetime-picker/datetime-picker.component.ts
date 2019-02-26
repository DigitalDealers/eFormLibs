import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material';

@Component({
  selector: 'didi-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss']
})
export class DatetimePickerComponent {
  @ViewChild('picker') picker: MatDatepicker<Date>;

  @Input() public form: FormGroup;
  @Input() public field;
  @Input() public readonly: boolean;

  public showPicker(): void {
    if (!this.readonly) {
      this.picker.open();
    }
  }
}
