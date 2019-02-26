import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { AclService } from './acl.service';
import { AuthService } from './auth.service';

@Injectable()
export class Guard implements CanActivate {
  constructor(private _acl: AclService, private _auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const url: string = state.url;
    const key = this._acl.getKeyByUrl(url);
    return this.checkLogin(url) && this._checkAccess(key);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const url: string = state.url;
    const key = this._acl.getKeyByUrl(url);
    return this.canActivate(route, state) && this._checkAccess(key);
  }

  checkLogin(url: string): boolean {
    return this._auth.isAuthenticated();
  }

  private _checkAccess(key) {
    return this._acl.isAllow(key) || false;
  }
}
