import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppMapper } from '../mappers/app.mapper';

@Injectable()
export class AppService {
  private readonly url = `<authApi>/dealers/<dealerId>/apps`;

  constructor(private _http: HttpClient) {
  }

  public create(body: any): Observable<any> {
    return this._http.post(this.url, body).pipe(map(AppMapper.prepareData));
  }

  public deleteItem(id: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getOne(id: string): Observable<any> {
    return this._http
      .get(`${this.url}/${id}`)
      .pipe(map(AppMapper.prepareData));
  }

  public update(id: string, data: any): Observable<any> {
    return this._http
      .put(`${this.url}/${id}`, data)
      .pipe(map(AppMapper.prepareData));
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this.url, { params })
      .pipe(map(AppMapper.prepareDataList));
  }

  public getListForUser(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/my`, { params });
  }
}
