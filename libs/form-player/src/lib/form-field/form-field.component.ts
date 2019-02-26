import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'didi-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() public form: FormGroup;
  @Input() public field;
  @Input() public skipStyle = false;

  @Output() public setFieldValue: EventEmitter<any> = new EventEmitter();

  get invalid(): boolean {
    const field = this.form.get(this.field.controlName);
    return field.invalid && field.dirty;
  }

  get value() {
    return this.form.get(this.field.controlName).value;
  }

  get hidden(): boolean {
    return this.field.state === 'hidden';
  }

  get readonly(): boolean {
    return this.field.state === 'readonly';
  }

  get required(): boolean {
    return this.field.state === 'required';
  }

  public trackByFn(index, item) {
    return item;
  }

  public trackByIdFn(index, item) {
    return item.id;
  }

  public handleSetFieldValue($event) {
    this.setFieldValue.emit($event);
  }

  public handleUpload(value, controlName) {
    this.setFieldValue.emit({ value, controlName });
  }
}
