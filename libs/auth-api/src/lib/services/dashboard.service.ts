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
    roleId: string,
    params = new HttpParams()
  ): Observable<any> {
    return this._http
      .get(`<authApi>/dealers/<dealerId>/roles/${roleId}/dashboards`, {
        params
      })
      .pipe(map(res => res));
  }

  public getOne(id: string, params = new HttpParams()): Observable<any> {
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
    userType: string,
    params = new HttpParams()
  ): Observable<any> {
    return this._http
      .get(`${this.url}/${userType}`, { params })
      .pipe(map(res => res));
  }

  public create(body: any): Observable<any> {
    return this._http.post(this.url, body).pipe(map(res => res));
  }

  public update(body: any): Observable<any> {
    return this._http
      .put(`${this.url}/${body.id}`, body)
      .pipe(map(res => res));
  }

  public deleteItem(id: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getTiles(id: string, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}/tiles`, { params })
      .pipe(map(res => res));
  }

  public addTile(id: string, body: any): Observable<any> {
    return this._http
      .post(`${this.url}/${id}/tiles`, body)
      .pipe(map(res => res));
  }

  public updateTile(id: string, tileId: string, body: any): Observable<any> {
    return this._http
      .put(`${this.url}/${id}/tiles/${tileId}`, body)
      .pipe(map(res => res));
  }

  public deleteTile(id: string, tileId: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}/tiles/${tileId}`);
  }
}
