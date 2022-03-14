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

  constructor(private _http: HttpClient) {
  }

  public getList(params = new HttpParams()): Observable<RoleRespone> {
    return this._http
      .get<RoleRespone>(this.url, { params })
      .pipe(map(res => RoleMapper.prepareDataList(res)));
  }

  public create(body: any): Observable<any> {
    return this._http.post(this.url, body);
  }

  public deleteItem(id: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getOne(id: string, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}`, { params })
      .pipe(map(res => RoleMapper.prepareData(res)));
  }

  public getPermissions(id: string, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}/permissions`, { params })
      .pipe(map(res => res));
  }

  public createPermissions(
    id: string,
    body: any,
    params = new HttpParams()
  ): Observable<any> {
    return this._http.post(`${this.url}/${id}/permissions`, body, { params });
  }

  public getApps(roleId: string, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${roleId}/apps`, { params });
  }

  public addApp(roleId: string, appId: string, body = {}): Observable<any> {
    return this._http.put(`${this.url}/${roleId}/apps/${appId}`, body);
  }

  public deleteApp(roleId: string, appId: string): Observable<any> {
    return this._http.delete(`${this.url}/${roleId}/apps/${appId}`);
  }

  public getBots(roleId: string, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${roleId}/bots`, { params });
  }

  public addBot(roleId: string, botId: string, body = {}): Observable<any> {
    return this._http.put(`${this.url}/${roleId}/bots/${botId}`, body);
  }

  public deleteBot(roleId: string, botId: string): Observable<any> {
    return this._http.delete(`${this.url}/${roleId}/bots/${botId}`);
  }

  public getListByUserId(userId: string, params: any): Observable<any> {
    return this._http
      .get(`${this.url}/users/${userId}`, params)
      .pipe(map(res => RoleMapper.prepareDataList(res)));
  }

  public deleteUser(id: string, userId: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}/users/${userId}`);
  }

  public deletePermission(roleId: string, permission: string): Observable<any> {
    return this._http.delete(
      `${this.url}/${roleId}/permissions/${permission}`
    );
  }

  public addUser(id: string, userId: string): Observable<any> {
    return this._http.put(`${this.url}/${id}/users/${userId}`, {});
  }

  public addDashboard(roleId: string, dashboardId: string): Observable<any> {
    return this._http.put(
      `${this.url}/${roleId}/dashboards/${dashboardId}`,
      {}
    );
  }

  public deleteDashboard(roleId: string, dashboardId: string): Observable<any> {
    return this._http.delete(
      `${this.url}/${roleId}/dashboards/${dashboardId}`
    );
  }
}
