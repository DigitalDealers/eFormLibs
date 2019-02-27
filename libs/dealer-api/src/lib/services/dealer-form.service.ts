import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FormMapper } from '../mappers/form.mapper';

@Injectable()
export class DealerFormService {
  private get _url() {
    return `<dealerApi>/dealers/<dealerId>/formtypes`;
  }

  private get _interUrl() {
    return `<dealerApi>/dealers/<dealerId>/interactions/filter`;
  }

  constructor(private _http: HttpClient) {}

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this._url, { params })
      .pipe(map(FormMapper.prepareDataList));
  }

  public getListForUser(params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/view`, { params })
      .pipe(map(FormMapper.prepareDataList));
  }

  public getListByRole(roleName, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._url}/roles/${roleName}`, { params })
      .pipe(map(FormMapper.prepareDataList));
  }

  public removeFromRole(roleName, id): Observable<any> {
    return this._http.delete(`${this._url}/${id}/roles/${roleName}`);
  }

  public assingToRole(id, roleName): Observable<any> {
    return this._http.put(`${this._url}/${id}/roles/${roleName}`, {});
  }

  public create(body): Observable<any> {
    return this._http.post(this._url, body).pipe(map(FormMapper.prepareData));
  }

  public update(id, body): Observable<any> {
    return this._http
      .put(`${this._url}/${id}`, body)
      .pipe(map(FormMapper.prepareData));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/${id}`);
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${id}`, { params });
  }

  public getListDataSets(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${id}/dataSets`, { params });
  }

  public addToDataSet(id, dataSetId): Observable<any> {
    return this._http.put(`${this._url}/${id}/dataSet/${dataSetId}`, {});
  }

  public removeFromDataSet(id, dataSetId): Observable<any> {
    return this._http.delete(`${this._url}/${id}/dataSet/${dataSetId}`, {});
  }

  public getOneByName(name, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/byName/${name}`, { params });
  }

  public getUserFilters(): Observable<any> {
    return this._http.get(`${this._interUrl}`);
  }

  public addUserFilter(data): Observable<any> {
    return this._http
      .post(this._interUrl, data)
      .pipe(map(FormMapper.prepareData));
  }

  public updateUserFilter(id, body): Observable<any> {
    return this._http
      .put(`${this._interUrl}/${id}`, body)
      .pipe(map(FormMapper.prepareData));
  }

  public deleteFilter(id): Observable<any> {
    return this._http.delete(`${this._interUrl}/${id}`, {});
  }
}
