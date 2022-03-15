import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ContactManagerService } from '../contact-manager.service';

export function emailValidator(control: FormControl) {
  const emailRe = /[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  const isValidEmail = (control.value || '').match(emailRe);
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
