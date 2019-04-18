import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SafetyField } from '@digitaldealers/safety-api';

@Component({
  selector: 'didi-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements OnInit {
  @Input() public form: FormGroup;
  @Input() public field: SafetyField;
  @Input() public skipStyle = false;
  @Input() public assetKey: string;

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

  get imageUrl() {
    return (this.field.image && this.field.image.url + this.assetKey) || '';
  }

  public ngOnInit(): void {
    const selectedType = this.field.response.type === 'single-choice' || this.field.response.type === 'multiple-choice';
    if (selectedType && this.readonly) {
      const fieldCtrl = this.form.get(this.field.controlName);
      fieldCtrl.disable({ emitEvent: false });
    }
  }

  public trackByFn(_index, item) {
    return item;
  }

  public trackByIdFn(_index, item) {
    return item.id;
  }

  public handleSetFieldValue($event) {
    this.setFieldValue.emit($event);
  }

  public handleUpload(value, controlName) {
    this.setFieldValue.emit({ value, controlName });
  }
}
