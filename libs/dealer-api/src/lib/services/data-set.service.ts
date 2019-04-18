import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataSetMapper } from '../mappers/data-set.mapper';

@Injectable()
export class DataSetService {
  public get _url() {
    return `<dealerApi>/dealers/<dealerId>/dataSets`;
  }

  constructor(private _http: HttpClient) {}

  public create(body): Observable<any> {
    return this._http.post(this._url, body).pipe(map(DataSetMapper.prepareData));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/${id}`, {});
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${id}`, { params }).pipe(map(DataSetMapper.prepareData));
  }

  public update(id, body): Observable<any> {
    return this._http.put(`${this._url}/${id}`, body).pipe(map(DataSetMapper.prepareData));
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http.get(this._url, { params }).pipe(map(DataSetMapper.prepareListData));
  }

  public getDataSetHistory(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${id}/history`, { params }).pipe(map(DataSetMapper.prepareData));
  }

  public removeFromRole(roleName, id): Observable<any> {
    return this._http.delete(`${this._url}/${id}/roles/${roleName}`);
  }

  public assingToRole(id, roleName): Observable<any> {
    return this._http.put(`${this._url}/${id}/roles/${roleName}`, {});
  }

  public getListByRole(roleName, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/roles/${roleName}`, { params }).pipe(map(DataSetMapper.prepareListData));
  }

  public getAlerts(): Observable<any> {
    return this._http.get(`${this._url}/alerts/my`);
  }

  public setAlerts(alertId, data): Observable<any> {
    return this._http.post(`${this._url}/alerts/${alertId}`, data);
  }

  public getAlert(dataSetId, alertId): Observable<any> {
    return this._http.get(`${this._url}/${dataSetId}/alerts/${alertId}`);
  }

  public deleteAlert(dataSetId, alertId): Observable<any> {
    return this._http.delete(`${this._url}/${dataSetId}/alerts/${alertId}`);
  }

  public updateAlert(alertId, data): Observable<any> {
    return this._http.put(`${this._url}/${data.dataSetId}/alerts/${alertId}`, data);
  }

  public addAlert(_alertId, data): Observable<any> {
    return this._http.post(`${this._url}/${data.dataSetId}/alerts`, data);
  }

  public trigger(dataSetId): Observable<any> {
    return this._http.post(`${this._url}/${dataSetId}/trigger`, {});
  }

  public getCustomerSync(): Observable<any> {
    return this._http.get(`/dealers/<dealerId>/hooks/customerSync`, {});
  }

  public createCustomerSync(dataSetId, body): Observable<any> {
    return this._http.post(`${this._url}/${dataSetId}/hooks/customerSync`, body);
  }

  public deleteCustomerSync(): Observable<any> {
    return this._http.delete(`/dealers/<dealerId>/hooks/customerSync`);
  }

  public getVendorSync(): Observable<any> {
    return this._http.get(`/dealers/<dealerId>/hooks/vendorSync`, {});
  }

  public createVendorSync(dataSetId, body): Observable<any> {
    return this._http.post(`${this._url}/${dataSetId}/hooks/vendorSync`, body);
  }

  public deleteVendorSync(): Observable<any> {
    return this._http.delete(`/dealers/<dealerId>/hooks/vendorSync`);
  }
}
