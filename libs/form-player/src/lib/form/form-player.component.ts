import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@digitaldealers/base-component';
import { SafetyApiService, SafetyMyForm } from '@digitaldealers/safety-api';

import { FormObserverService } from '../form-observer.service';

// const SAVE_INTERVAL = 15000;

@Component({
  selector: 'didi-form-player',
  templateUrl: './form-player.component.html',
  styleUrls: ['./form-player.component.scss']
})
export class FormPlayerComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() public isPreview: boolean;
  @Input() public config: SafetyMyForm;
  @Input() public assetKey: string;

  @Output() public saved = new EventEmitter<boolean>();

  public sections = {};
  public form: FormGroup;
  public controls = {};
  public prevFormId: string;

  constructor(
    private _fb: FormBuilder,
    private safetyApi: SafetyApiService,
    private _formObserver: FormObserverService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    this.form = this._fb.group({});
  }

  ngOnInit(): void {
    this.prevFormId = this.route.snapshot.queryParamMap.get('prevFormId') || '';
    this._prepareConfig(this.config);
    this.subs = this.form.valueChanges.subscribe(el => {
      this._calculate(el);
    });
    // const sourceTimer = timer(SAVE_INTERVAL, SAVE_INTERVAL);

    if (!this.isPreview) {
      // autosave form each 15 seconds
      // this.subs = sourceTimer.subscribe(() => {
      //   this._saveForm(true);
      //   this._snackBar.open('Form was saved!', null, { duration: 3000, horizontalPosition: 'end' });
      // });
    }

    this.subs = this._formObserver.form$.subscribe(el => {
      const { index, controlName, value, context } = el;

      // TODO: need to avoid the problem with table nested control
      if (!this.form.contains(controlName)) {
        return;
      }
      let data = this.form.get(controlName).value || [];
      switch (context) {
        case 'delete':
          data = data.filter((_el, i) => i !== index);
          break;
        case 'setFieldValue':
          data = value;
          break;
        case 'updateRelatedForms':
          const config = this.config;
          config.fields = config.fields.map(el => {
            if (el.controlName === controlName) {
              el.relatedForms = value;
            }
            return el;
          });
          this._saveForm(false, config);
          break;
        default: {
          if (index || index === 0) {
            data[index] = value;
          } else {
            data.push(value);
          }
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
    const { fields, answers, id } = config;
    this.form.addControl('id', new FormControl(id || ''));
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
    this._saveForm();
    this.saved.emit(true);
  }

  public backToMainForm(id) {
    const queryParams = { ...this.route.snapshot.queryParams };
    delete queryParams.prevFormId;
    this._saveForm();
    this.router.navigate(['..', id], { relativeTo: this.route, queryParams });
  }

  public upload({ value, controlName }) {
    this.form.get(controlName).setValue(value);
  }

  public toggleLogicSection(field) {
    const { children, logicOptions, controlName } = field;

    if (logicOptions && children && children.length) {
      const value = this.form.get(controlName).value;
      return logicOptions.condition === 'is' ? value === logicOptions.value : value !== logicOptions.value;
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
      for (const [k] of Object.entries(value)) {
        this.sections[key][k] = !!data[k];
      }
    }
  }

  private _saveForm(isAutosave = false, extraConfig = {}) {
    const { id, ...answers } = this.form.getRawValue();
    const { status, ...config } = this.config;
    let newStatus = '';
    if (isAutosave) {
      newStatus = status || 'draft';
    } else {
      newStatus = status || 'submitted';
    }
    const data: SafetyMyForm = {
      ...config,
      ...extraConfig,
      id,
      status: newStatus,
      answers
    };

    this.safetyApi.myForm.save(data).subscribe((res: string) => {
      this.form.get('id').setValue(res);
    });
  }
}
