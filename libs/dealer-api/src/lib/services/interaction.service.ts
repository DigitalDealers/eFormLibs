import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InteractionMapper } from '../mappers/interaction.mapper';

@Injectable()
export class InteractionService {
  private readonly url = '<dealerApi>/dealers/<dealerId>/interactions';

  constructor(private _http: HttpClient) {
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this.url, { params })
      .pipe(map(InteractionMapper.prepareDataList));
  }

  public getListByFormType(
    formTypeId: string,
    params = new HttpParams()
  ): Observable<any> {
    params = params.set('formTypeId', formTypeId);
    return this._http
      .get(`${this.url}/byformtype`, { params })
      .pipe(map(InteractionMapper.prepareDataList));
  }

  public create(body: any): Observable<any> {
    return this._http
      .post(this.url, body)
      .pipe(map(InteractionMapper.formatDate));
  }

  public update(id: string, body: any): Observable<any> {
    return this._http
      .put(`${this.url}/${id}`, body)
      .pipe(map(InteractionMapper.formatDate));
  }

  public deleteItem(id: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getOne(id: string, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}`, { params })
      .pipe(map(InteractionMapper.formatDate));
  }

  public getListOfHistory(id: string): Observable<any> {
    return this._http.get(`${this.url}/${id}/history/all`);
  }

  public createHistory(id: string, body: any): Observable<any> {
    return this._http.post(`${this.url}/${id}/history`, body);
  }

  public getHistoryById(id: string, historyId: string): Observable<any> {
    return this._http.get(`${this.url}/${id}/history/${historyId}`);
  }

  public deleteHistory(id: string, historyId: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}/history/${historyId}`);
  }

  public getTotal(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/total`, { params });
  }

  public getAssetsSAS(id: string): Observable<any> {
    return this._http.get(`${this.url}/${id}/sas`);
  }
}
