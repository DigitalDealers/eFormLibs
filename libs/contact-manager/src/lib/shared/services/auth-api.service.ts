import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Role } from '../interfaces/role.interface';
import { HttpBackendClientService } from './http-backend-client.service';
import { ConfigService } from './config.service';
import { CommCentreUser } from '../interfaces/comm-centre-user.interface';

@Injectable()
export class AuthApiService {

  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  constructor(private httpClient: HttpBackendClientService,
              private config: ConfigService) {
  }

  getCommCentreUser(userEmail: string): Observable<{ token: string }> {
    return this.httpClient.get<CommCentreUser>(`${this.config.authApiUrl}/users/getCommCentreUser/${userEmail}`, {
      headers: this.headers,
    }).pipe(
      map(({ id_token }) => ({
        token: id_token || ''
      }))
    );
  }

  getRolesList(params = new HttpParams()): Observable<Role[]> {
    return this.httpClient
      .get<Role[]>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles`, { params, headers: this.headers });
  }
}
