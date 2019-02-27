import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class AuthRoleService {
  private get _url() {
    return `<authApi>/dealers/<dealerId>/roles`;
  }

  constructor(private _http: HttpClient) {}

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this._url, { params })
      .pipe(map(res => RoleMapper.prepareDataList(res)));
  }

  public create(body): Observable<any> {
    return this._http.post(this._url, body);
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/${id}`);
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/${id}`, { params })
      .pipe(map(res => RoleMapper.prepareData(res)));
  }

  public getPermissions(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/${id}/permissions`, { params })
      .pipe(map(res => res));
  }

  public createPermissions(
    id,
    body,
    params = new HttpParams()
  ): Observable<any> {
    return this._http.post(`${this._url}/${id}/permissions`, body, { params });
  }

  public getApps(roleId, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${roleId}/apps`, { params });
  }

  public addApp(roleId, appId, body = {}): Observable<any> {
    return this._http.put(`${this._url}/${roleId}/apps/${appId}`, body);
  }

  public deleteApp(roleId, appId): Observable<any> {
    return this._http.delete(`${this._url}/${roleId}/apps/${appId}`);
  }

  public getBots(roleId, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${roleId}/bots`, { params });
  }

  public addBot(roleId, botId, body = {}): Observable<any> {
    return this._http.put(`${this._url}/${roleId}/bots/${botId}`, body);
  }

  public deleteBot(roleId, botId): Observable<any> {
    return this._http.delete(`${this._url}/${roleId}/bots/${botId}`);
  }

  public getListByUserId(userId, params): Observable<any> {
    return this._http
      .get(`${this._url}/users/${userId}`, params)
      .pipe(map(res => RoleMapper.prepareDataList(res)));
  }

  public deleteUser(id, userId): Observable<any> {
    return this._http.delete(`${this._url}/${id}/users/${userId}`);
  }

  public deletePermission(roleId, permission): Observable<any> {
    return this._http.delete(
      `${this._url}/${roleId}/permissions/${permission}`
    );
  }

  public addUser(id, userId): Observable<any> {
    return this._http.put(`${this._url}/${id}/users/${userId}`, {});
  }

  public addDashboard(roleId, dashboardId): Observable<any> {
    return this._http.put(
      `${this._url}/${roleId}/dashboards/${dashboardId}`,
      {}
    );
  }

  public deleteDashboard(roleId, dashboardId): Observable<any> {
    return this._http.delete(
      `${this._url}/${roleId}/dashboards/${dashboardId}`
    );
  }
}
