import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';
import { HttpBackendClientService } from './http-backend-client.service';
import { ConfigService } from './config.service';

@Injectable()
export class SecurityService {
  roles: string[] = JSON.parse(localStorage.getItem(`${this.config.localStoragePrefix}.roles`)) || [];
  rolesLoading$: Observable<any>;
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };
  constructor(private httpClient: HttpBackendClientService,
              private config: ConfigService) {
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
        tap((user: { roles: string[] }) => {
          const roles = (user.roles || []).map(role => role.trim());
          localStorage.setItem(`${this.config.localStoragePrefix}.roles`, JSON.stringify(roles));
        }),
        map((user: { roles: string[] }) => (user.roles || []).map(role => role.trim())),
        finalize(() => this.rolesLoading$ = null),
        share(),
        catchError(err => {
          console.error(err);
          return throwError('Error occurred while getting user data');
        })
      );
    return this.rolesLoading$;
  }

  public getUserFullProfile() {
    const params = new HttpParams().set('fullProfile', 'true');
    return this.httpClient.get(`${this.config.authApiUrl}/users/getByToken`, {
      params,
      headers: this.headers
    });
  }
}
