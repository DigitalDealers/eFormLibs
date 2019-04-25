import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FormMapper } from '../mappers/form.mapper';

@Injectable()
export class FormService {
  private readonly url = '<dealerApi>/dealers/<dealerId>/formtypes';
  private readonly interUrl = `<dealerApi>/dealers/<dealerId>/interactions/filter`;

  constructor(private _http: HttpClient) {
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http
      .get(this.url, { params })
      .pipe(map(FormMapper.prepareDataList));
  }

  public getListForUser(params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/view`, { params })
      .pipe(map(FormMapper.prepareDataList));
  }

  public getListByRole(roleName, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/roles/${roleName}`, { params })
      .pipe(map(FormMapper.prepareDataList));
  }

  public removeFromRole(roleName, id): Observable<any> {
    return this._http.delete(`${this.url}/${id}/roles/${roleName}`);
  }

  public assingToRole(id, roleName): Observable<any> {
    return this._http.put(`${this.url}/${id}/roles/${roleName}`, {});
  }

  public create(body): Observable<any> {
    return this._http.post(this.url, body).pipe(map(FormMapper.prepareData));
  }

  public update(id, body): Observable<any> {
    return this._http
      .put(`${this.url}/${id}`, body)
      .pipe(map(FormMapper.prepareData));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${id}`, { params });
  }

  public getListDataSets(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${id}/dataSets`, { params });
  }

  public addToDataSet(id, dataSetId): Observable<any> {
    return this._http.put(`${this.url}/${id}/dataSet/${dataSetId}`, {});
  }

  public removeFromDataSet(id, dataSetId): Observable<any> {
    return this._http.delete(`${this.url}/${id}/dataSet/${dataSetId}`, {});
  }

  public getOneByName(name, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/byName/${name}`, { params });
  }

  public getUserFilters(): Observable<any> {
    return this._http.get(`${this.interUrl}`);
  }

  public addUserFilter(data): Observable<any> {
    return this._http
      .post(this.interUrl, data)
      .pipe(map(FormMapper.prepareData));
  }

  public updateUserFilter(id, body): Observable<any> {
    return this._http
      .put(`${this.interUrl}/${id}`, body)
      .pipe(map(FormMapper.prepareData));
  }

  public deleteFilter(id): Observable<any> {
    return this._http.delete(`${this.interUrl}/${id}`, {});
  }
}
