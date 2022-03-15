import { FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ContactManagerService } from '../contact-manager.service';

export function emailValidator(control: FormControl) {
  const isValidEmail = (control.value || '')
    .match(/[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
  return isValidEmail ? null : { email: true };
}

export function emailDuplicateAsyncValidator(api: ContactManagerService): Function {
  return (control: FormControl): Observable<any> => {
    return api.getDealerUsers(new HttpParams({
      fromObject: {
        text: control.value,
        offset: '0',
        top: '10'
      }
    })).pipe(
      map((res) => {
        if (res.data.length) {
          return res.data.some((user) => {
            return String(user.email || '').toLowerCase() === String(control.value || '').toLowerCase();
          }) ? { duplicate: true } : null;
        }
        return null;
      }),
      catchError(() => {
        return of(null);
      })
    );
  };
}
