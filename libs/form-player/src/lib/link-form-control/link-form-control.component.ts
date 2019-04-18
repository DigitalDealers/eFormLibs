import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@digitaldealers/base-component';
import { DictionarySafetyControls, SafetyApiService, SafetyField, SafetyMyForm } from '@digitaldealers/safety-api';
import { combineLatest, Observable, timer } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { FormObserverService } from '../form-observer.service';
import { LinkConfirmService } from '../link-confirm/link-confirm.service';

@Component({
  selector: 'didi-link-form-control',
  templateUrl: './link-form-control.component.html',
  styleUrls: ['./link-form-control.component.scss']
})
export class LinkFormControlComponent extends BaseComponent {
  @Input() public form: FormControl;
  @Input() public field: SafetyField;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private safetyApi: SafetyApiService,
    private _formObserver: FormObserverService,
    private _confirm: LinkConfirmService
  ) {
    super();
  }

  public handleFormClick(form, index) {
    if (form.id) {
      this._navegateToRelatedForm(form.id);
    } else {
      this.subs = this._getFormWithResponse(form.formId)
        .pipe(
          flatMap(res => this.safetyApi.myForm.save(res)),
          map((id: string) => {
            const { relatedForms } = this.field;
            relatedForms[index].id = id;

            this._formObserver.emit({
              context: 'updateRelatedForms',
              controlName: this.field.controlName,
              value: relatedForms
            });
            return id;
          })
        )
        .subscribe(id => this._navegateToRelatedForm(id));
    }
  }

  public handleAddOneMoreLink() {
    const { relatedForms } = this.field;
    const form = { ...relatedForms[0], id: null };
    relatedForms.push(form);
    this._formObserver.emit({
      context: 'updateRelatedForms',
      controlName: this.field.controlName,
      value: relatedForms
    });
  }

  public handleDeleteItem(index) {
    const { relatedForms } = this.field;
    const { id } = relatedForms[index];
    const dialogRef = this._confirm.open({ data: { withLink: !!id } });
    this.subs = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._deleteLink(index);
        if (result === 'removeLinkForm') {
          this._deleteForm(id);
        }
      }
    });
  }

  private _deleteLink(index) {
    const { relatedForms } = this.field;
    const forms = relatedForms.filter((_el, indx) => index !== indx);

    this._formObserver.emit({
      context: 'updateRelatedForms',
      controlName: this.field.controlName,
      value: forms
    });
  }

  private _deleteForm(id) {
    this.subs = this.safetyApi.myForm.delete(id).subscribe();
  }

  private _getFormWithResponse(formId: string): Observable<SafetyMyForm> {
    return combineLatest(this.safetyApi.form.getOne(formId), this.safetyApi.control.getList('dictionary'))
      .pipe(map(([form, controls]: [SafetyMyForm, DictionarySafetyControls]) => {
        const { fields, id } = form;
        form.formId = id;
        delete form.id;
        for (let i = 0; i < fields.length; i += 1) {
          const key: string = fields[i].response as any;
          const { children } = fields[i];
          if (controls[key]) {
            form.fields[i].response = controls[key];
          }
          if (children) {
            for (let y = 0; y < children.length; y += 1) {
              const childKey: string = children[y].response as any;
              if (controls[childKey]) {
                form.fields[i].children[y].response = controls[childKey];
              }
            }
          }
        }
        return form;
      }));
  }

  private _navegateToRelatedForm(id) {
    this.subs = timer(600).subscribe(() => {
      this.router.navigate(['..', id], {
        relativeTo: this.route,
        queryParams: { prevFormId: this.form.get('id').value },
        queryParamsHandling: 'merge'
      });
    });
  }
}
