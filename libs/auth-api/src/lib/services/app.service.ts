import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppMapper } from '../mappers/app.mapper';

@Injectable()
export class AppService {
  private get _url() {
    return `<authApi>/dealers/<dealerId>/apps`;
  }

  constructor(private _http: HttpClient) {}

  public create(body): Observable<any> {
    return this._http.post(this._url, body).pipe(map(AppMapper.prepareData));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/${id}`);
  }

  public getOne(id): Observable<any> {
    return this._http
      .get(`${this._url}/${id}`)
      .pipe(map(AppMapper.prepareData));
  }

  public update(id, data): Observable<any> {
    return this._http
      .put(`${this._url}/${id}`, data)
      .pipe(map(AppMapper.prepareData));
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this._url, { params })
      .pipe(map(AppMapper.prepareDataList));
  }

  public getListForUser(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/my`, { params });
  }
}
