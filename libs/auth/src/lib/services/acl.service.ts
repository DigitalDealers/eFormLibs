import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

import { Config } from '../interfaces/config';
import { CONFIG } from '../module.config';
import { AuthService } from './auth.service';

@Injectable()
export class AclService {
  _aclConfig: any;

  private get _permissions() {
    const jwtHelper = new JwtHelperService();
    let claims;
    try {
      const decodedToken = jwtHelper.decodeToken(this._auth.getToken());
      claims = decodedToken[this._config.permissionClaims];
    } catch (e) {
      claims = [];
    }
    return claims || [];
  }

  constructor(
    private _router: Router,
    private _auth: AuthService,
    @Inject(CONFIG) private _config: Config
  ) {
    this._aclConfig = this._config.aclConfig;
  }

  getCustomerNumber(key: any) {
    if (this.isAllow(key)) {
      return this._auth.getCustomerNumber();
    }
  }

  isAllow(key: any) {
    if (!this._auth.isAuthenticated()) {
      this._router.navigate(['/']);
      return false;
    }

    return this._permissions.includes(key);
  }

  isCustomerUser() {
    if (
      this._permissions.includes('AdminServiceTracker') ||
      this._permissions.includes('UserServiceTracker')
    ) {
      return false;
    } else {
      return this._permissions.includes('CustomerServiceTracker');
    }
  }

  getKeyByUrl(url: string) {
    for (const route in this._aclConfig.routes) {
      if (this._aclConfig.routes.hasOwnProperty(route) && url.includes(route)) {
        return this._aclConfig.routes[route];
      }
    }
    return '';
  }
}
