import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FormObserverService } from '../form-observer.service';

@Component({
  selector: 'didi-input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.scss']
})
export class InputControlComponent implements OnInit {
  @Input() public field;
  @Input() public value;
  @Input() public readonly;
  @Input() public invalid;
  @Input() public hidden;
  @Input() public type;

  public form: FormGroup;
  public items: FormArray;

  constructor(private _fb: FormBuilder, private _formObserver: FormObserverService) {}

  ngOnInit() {
    if (this.field.multi) {
      this.form = this._fb.group({
        items: this._fb.array([])
      });
      this.form
        .get('items')
        .valueChanges.pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe(res => {
          this._setValue(res);
        });
      if (this.value) {
        this.fillArray(this.value);
      }
    } else {
      this.form = this._fb.group({
        [this.field.controlName]: this.value || ''
      });
      this.form
        .get(this.field.controlName)
        .valueChanges.pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe(res => {
          this._setValue(res);
        });
    }
  }

  get formData() {
    return <FormArray>this.form.get('items');
  }

  public createControl(value = ''): FormGroup {
    return this._fb.group({
      value: value || ''
    });
  }

  public handleClick() {
    this.items = this.form.get('items') as FormArray;
    this.items.push(this.createControl());
  }

  public fillArray(data) {
    this.items = this.form.get('items') as FormArray;
    for (let i = 0; i < data.length; i += 1) {
      this.items.push(this.createControl(data[i].value));
    }
  }

  public removeControl(i) {
    this.items = this.form.get('items') as FormArray;
    this.items.removeAt(i);
  }

  private _setValue(value) {
    this._formObserver.emit({
      context: 'setFieldValue',
      controlName: this.field.controlName,
      type: `input-${this.type}`,
      value
    });
  }
}
