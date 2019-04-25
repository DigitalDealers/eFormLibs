import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Role } from '../interfaces/role.interface';
import { RoleMapper } from '../mappers/role.mapper';

interface RoleRespone {
  data: Role[];
  total: number;
}

@Injectable()
export class RoleService {
  private readonly url = `<authApi>/dealers/<dealerId>/roles`;

  constructor(private _http: HttpClient) {}

  public getList(params = new HttpParams()): Observable<RoleRespone> {
    return this._http
      .get<RoleRespone>(this.url, { params })
      .pipe(map(res => RoleMapper.prepareDataList(res)));
  }

  public create(body): Observable<any> {
    return this._http.post(this.url, body);
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}`, { params })
      .pipe(map(res => RoleMapper.prepareData(res)));
  }

  public getPermissions(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}/permissions`, { params })
      .pipe(map(res => res));
  }

  public createPermissions(
    id,
    body,
    params = new HttpParams()
  ): Observable<any> {
    return this._http.post(`${this.url}/${id}/permissions`, body, { params });
  }

  public getApps(roleId, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${roleId}/apps`, { params });
  }

  public addApp(roleId, appId, body = {}): Observable<any> {
    return this._http.put(`${this.url}/${roleId}/apps/${appId}`, body);
  }

  public deleteApp(roleId, appId): Observable<any> {
    return this._http.delete(`${this.url}/${roleId}/apps/${appId}`);
  }

  public getBots(roleId, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${roleId}/bots`, { params });
  }

  public addBot(roleId, botId, body = {}): Observable<any> {
    return this._http.put(`${this.url}/${roleId}/bots/${botId}`, body);
  }

  public deleteBot(roleId, botId): Observable<any> {
    return this._http.delete(`${this.url}/${roleId}/bots/${botId}`);
  }

  public getListByUserId(userId, params): Observable<any> {
    return this._http
      .get(`${this.url}/users/${userId}`, params)
      .pipe(map(res => RoleMapper.prepareDataList(res)));
  }

  public deleteUser(id, userId): Observable<any> {
    return this._http.delete(`${this.url}/${id}/users/${userId}`);
  }

  public deletePermission(roleId, permission): Observable<any> {
    return this._http.delete(
      `${this.url}/${roleId}/permissions/${permission}`
    );
  }

  public addUser(id, userId): Observable<any> {
    return this._http.put(`${this.url}/${id}/users/${userId}`, {});
  }

  public addDashboard(roleId, dashboardId): Observable<any> {
    return this._http.put(
      `${this.url}/${roleId}/dashboards/${dashboardId}`,
      {}
    );
  }

  public deleteDashboard(roleId, dashboardId): Observable<any> {
    return this._http.delete(
      `${this.url}/${roleId}/dashboards/${dashboardId}`
    );
  }
}
