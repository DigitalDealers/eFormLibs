import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'didi-amount-control',
  templateUrl: './amount-control.component.html',
  styleUrls: ['./amount-control.component.scss']
})
export class AmountControlComponent implements OnInit {
  @Input() public form;
  @Input() public field;
  @Input() public value;
  @Input() public readonly;
  @Input() public invalid;
  @Input() public hidden;
  @Output() public setFieldValue: EventEmitter<any> = new EventEmitter();

  public multiForm: FormGroup;
  public items: FormArray;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.multiForm = this._fb.group({
      items: this._fb.array([])
    });
    this.multiForm
      .get('items')
      .valueChanges.pipe(
        debounceTime(600),
        distinctUntilChanged()
      )
      .subscribe(res => {
        this.setFieldValue.emit(res);
      });
    if (this.value) {
      this.fillArray(this.value);
    }
  }

  get formData() {
    return <FormArray>this.multiForm.get('items');
  }

  public createControl(item = { title: '', value: '' }): FormGroup {
    return this._fb.group(item);
  }

  public handleClick() {
    this.items = this.multiForm.get('items') as FormArray;
    this.items.push(this.createControl());
  }

  public fillArray(data) {
    this.items = this.multiForm.get('items') as FormArray;
    for (let i = 0; i < data.length; i += 1) {
      this.items.push(this.createControl(data[i]));
    }
  }

  public removeControl(i) {
    this.items = this.multiForm.get('items') as FormArray;
    this.items.removeAt(i);
  }
}
