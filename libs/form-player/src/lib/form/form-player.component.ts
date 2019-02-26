import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { SafetyApiService, SafetyForm } from '@didi/safety-api';
import { FormObserverService } from '../form-observer.service';

@Component({
  selector: 'didi-form-player',
  templateUrl: './form-player.component.html',
  styleUrls: ['./form-player.component.scss']
})
export class FormPlayerComponent implements OnInit, OnChanges {
  public sections = {};
  public form: FormGroup;

  @Input() public isPreview;
  @Input() public config: SafetyForm;
  @Output() public saved: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private _fb: FormBuilder,
    private _safetyApi: SafetyApiService,
    private _formObserver: FormObserverService
  ) {
    this.form = this._fb.group({});
  }

  ngOnInit(): void {
    this._prepareConfig(this.config);
    this.form.valueChanges.subscribe(el => {
      this._calculate(el);
    });
    this._formObserver.form$.subscribe(el => {
      const { index, controlName, value, context } = el;
      let data = this.form.get(controlName).value || [];
      if (context === 'delete') {
        data = data.filter((item, i) => i !== index);
      } else {
        if (index || index === 0) {
          data[index] = value;
        } else {
          data.push(value);
        }
      }
      this.form.get(controlName).setValue(data);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { config } = changes;
    if (config && config.currentValue && this.form) {
      this._prepareConfig(config.currentValue);
    }
  }

  public showSection({ condition, value, fieldValue }) {
    if (condition === 'is') {
      return value === fieldValue;
    }

    return value !== fieldValue;
  }

  private _prepareConfig(config) {
    const { fields, answers } = config;
    if (fields) {
      fields.map(control => {
        this.createFormControl(control);
        if (control.response.type !== 'table' && control.children) {
          control.children.map(child => {
            this.createFormControl(child);
            return child;
          });
        } else if (control.response.type !== 'table' && control.sections) {
          control.sections.map(section => {
            section.items.map(el => {
              this.createFormControl(el);
              return el;
            });
          });
        } else if (control.response.type === 'table') {
          this.form.get(control.controlName).setValue([]);
        }
        return control;
      });
    }
    if (answers) {
      this.form.patchValue(answers);
    }
  }

  public setFieldValue({ controlName, value }) {
    this.form.get(controlName).setValue(value);
  }

  public submit() {
    const data = {
      ...this.config,
      answers: this.form.value
    };
    this._safetyApi.myForm.save(data);
    this.saved.emit(true);
  }

  public upload({ value, controlName }) {
    this.form.get(controlName).setValue(value);
  }

  public toggleLogicSection(field) {
    const { children, logicOptions, controlName } = field;

    if (children && children.length) {
      const value = this.form.get(controlName).value;
      return logicOptions.condition === 'is'
        ? value === logicOptions.value
        : value !== logicOptions.value;
    }
    return false;
  }

  private createFormControl(control) {
    this.form.addControl(control.controlName, new FormControl());
    if (control.state === 'required') {
      this.form.get(control.controlName).setValidators([Validators.required]);
    }
  }

  private _calculate(data) {
    for (const [key, value] of Object.entries(this.sections)) {
      for (const [k, v] of Object.entries(value)) {
        this.sections[key][k] = !!data[k];
      }
    }
  }
}
