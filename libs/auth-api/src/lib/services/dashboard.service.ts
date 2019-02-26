import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DashboardService {
  private get _url() {
    return `<authApi>/dealers/<dealerId>/dashboards`;
  }

  constructor(private _http: HttpClient) {}

  public getList(options = {}): Observable<any> {
    return this._http.get(this._url, { ...options }).pipe(map(res => res));
  }

  public getDashboardsByRoleId(
    roleId,
    params = new HttpParams()
  ): Observable<any> {
    return this._http
      .get(`<authApi>/dealers/<dealerId>/roles/${roleId}/dashboards`, {
        params
      })
      .pipe(map(res => res));
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/${id}`, { params })
      .pipe(map(res => res));
  }

  public getForCurrentUser(params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/current`, { params })
      .pipe(map(res => res));
  }

  public getListByUserType(
    userType,
    params = new HttpParams()
  ): Observable<any> {
    return this._http
      .get(`${this._url}/${userType}`, { params })
      .pipe(map(res => res));
  }

  public create(body): Observable<any> {
    return this._http.post(this._url, body).pipe(map(res => res));
  }

  public update(body): Observable<any> {
    return this._http
      .put(`${this._url}/${body.id}`, body)
      .pipe(map(res => res));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/${id}`);
  }

  public getTiles(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/${id}/tiles`, { params })
      .pipe(map(res => res));
  }

  public addTile(id, body): Observable<any> {
    return this._http
      .post(`${this._url}/${id}/tiles`, body)
      .pipe(map(res => res));
  }

  public updateTile(id, tileId, body): Observable<any> {
    return this._http
      .put(`${this._url}/${id}/tiles/${tileId}`, body)
      .pipe(map(res => res));
  }

  public deleteTile(id, tileId): Observable<any> {
    return this._http.delete(`${this._url}/${id}/tiles/${tileId}`);
  }
}
