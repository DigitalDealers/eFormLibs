import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DashboardService {
  private readonly url = '<authApi>/dealers/<dealerId>/dashboards';

  constructor(private _http: HttpClient) {
  }

  public getList(options = {}): Observable<any> {
    return this._http.get(this.url, { ...options }).pipe(map(res => res));
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
      .get(`${this.url}/${id}`, { params })
      .pipe(map(res => res));
  }

  public getForCurrentUser(params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/current`, { params })
      .pipe(map(res => res));
  }

  public getListByUserType(
    userType,
    params = new HttpParams()
  ): Observable<any> {
    return this._http
      .get(`${this.url}/${userType}`, { params })
      .pipe(map(res => res));
  }

  public create(body): Observable<any> {
    return this._http.post(this.url, body).pipe(map(res => res));
  }

  public update(body): Observable<any> {
    return this._http
      .put(`${this.url}/${body.id}`, body)
      .pipe(map(res => res));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getTiles(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}/tiles`, { params })
      .pipe(map(res => res));
  }

  public addTile(id, body): Observable<any> {
    return this._http
      .post(`${this.url}/${id}/tiles`, body)
      .pipe(map(res => res));
  }

  public updateTile(id, tileId, body): Observable<any> {
    return this._http
      .put(`${this.url}/${id}/tiles/${tileId}`, body)
      .pipe(map(res => res));
  }

  public deleteTile(id, tileId): Observable<any> {
    return this._http.delete(`${this.url}/${id}/tiles/${tileId}`);
  }
}
