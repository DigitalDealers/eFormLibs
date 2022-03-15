import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { HttpBackendClientService } from './http-backend-client.service';

@Injectable()
export class SecurityService {
  roles: string[];
  rolesLoading$?: Observable<string[]> | null;
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  constructor(
    private httpClient: HttpBackendClientService,
    private config: ConfigService
  ) {
    const rolesString = localStorage.getItem(`${this.config.localStoragePrefix}.roles`) || '';
    try {
      this.roles = JSON.parse(rolesString);
    } catch (e) {
      this.roles = [];
    }
  }

  getUserRoles(): Observable<string[]> {
    if (this.rolesLoading$) {
      return this.rolesLoading$;
    }
    if (this.roles.length) {
      this.rolesLoading$ = null;
      return of(this.roles);
    }
    this.rolesLoading$ = this.getUserFullProfile()
      .pipe(
        map(user => (user.roles || []).map(role => role.trim())),
        tap(roles => localStorage.setItem(`${this.config.localStoragePrefix}.roles`, JSON.stringify(roles))),
        finalize(() => this.rolesLoading$ = null),
        share(),
        catchError(err => {
          console.error(err);
          return throwError('Error occurred while getting user data');
        })
      );
    return this.rolesLoading$;
  }

  public getUserFullProfile(): Observable<{ roles?: string[] }> {
    const params = new HttpParams().set('fullProfile', 'true');
    return this.httpClient.get<{ roles?: string[] }>(`${this.config.authApiUrl}/users/getByToken`, {
      params,
      headers: this.headers
    });
  }
}
