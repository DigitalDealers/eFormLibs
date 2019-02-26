import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BotMapper } from '../mappers/bot.mapper';

@Injectable()
export class BotService {
  private get _url() {
    return `<authApi>/dealers/<dealerId>/bots`;
  }

  constructor(private _http: HttpClient) {}

  public create(body): Observable<any> {
    return this._http
      .post(this._url, body)
      .pipe(map(res => BotMapper.prepareData(res)));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/${id}`);
  }

  public getOne(id): Observable<any> {
    return this._http
      .get(`${this._url}/${id}`)
      .pipe(map(res => BotMapper.prepareData(res)));
  }

  public update(id, data): Observable<any> {
    return this._http
      .put(`${this._url}/${id}`, data)
      .pipe(map(res => BotMapper.prepareData(res)));
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this._url, { params })
      .pipe(map(res => BotMapper.prepareDataList(res)));
  }

  public getMyBots(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/my`, { params }).pipe(map(res => res));
  }

  public getListForUser(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/my`, { params });
  }
}
