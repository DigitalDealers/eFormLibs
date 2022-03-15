import { Inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';

import { contactManagerConfigToken } from '../../contact-manager-config.token';
import { ContactManagerConfig } from '../interfaces/contact-manager-config.interface';

@Injectable()
export class ConfigService {
  public readonly cmsThemeUrl = 'https://unpkg.com/@digitaldealers/cms-theme';
  private readonly jwtHelper = new JwtHelperService();

  get batchApiUrl() {
    return this.config.batchApiUrl;
  }

  get authApiUrl() {
    return this.config.authApiUrl;
  }

  get cloudFunctionUrl() {
    return this.config.cloudFunctionUrl;
  }

  get localStoragePrefix() {
    return this.config.localStoragePrefix;
  }

  get applicationId() {
    return this.config.applicationId;
  }

  get tokenData() {
    return this.jwtHelper.decodeToken(this.getAccessToken());
  }

  constructor(private cookie: CookieService,
              @Inject(contactManagerConfigToken) private config: ContactManagerConfig) {
  }

  getAccessToken(): string {
    const token = this.cookie.get('accessToken') || localStorage.getItem(`${this.config.localStoragePrefix}.token`);
    return (token || '').replace(/"/g, '');
  }

  getDealerId(): number {
    const dealerId = this.cookie.get('dealerId') || localStorage.getItem(`${this.config.localStoragePrefix}.dealerId`);
    return Number(dealerId);
  }
}
