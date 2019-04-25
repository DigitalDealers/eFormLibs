import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataSetMapper } from '../mappers/data-set.mapper';

@Injectable()
export class DataSetService {
  public readonly url = `<dealerApi>/dealers/<dealerId>/dataSets`;

  constructor(private _http: HttpClient) {
  }

  public create(body): Observable<any> {
    return this._http.post(this.url, body).pipe(map(DataSetMapper.prepareData));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.url}/${id}`, {});
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${id}`, { params }).pipe(map(DataSetMapper.prepareData));
  }

  public update(id, body): Observable<any> {
    return this._http.put(`${this.url}/${id}`, body).pipe(map(DataSetMapper.prepareData));
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http.get(this.url, { params }).pipe(map(DataSetMapper.prepareListData));
  }

  public getDataSetHistory(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${id}/history`, { params }).pipe(map(DataSetMapper.prepareData));
  }

  public removeFromRole(roleName, id): Observable<any> {
    return this._http.delete(`${this.url}/${id}/roles/${roleName}`);
  }

  public assingToRole(id, roleName): Observable<any> {
    return this._http.put(`${this.url}/${id}/roles/${roleName}`, {});
  }

  public getListByRole(roleName, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/roles/${roleName}`, { params }).pipe(map(DataSetMapper.prepareListData));
  }

  public getAlerts(): Observable<any> {
    return this._http.get(`${this.url}/alerts/my`);
  }

  public setAlerts(alertId, data): Observable<any> {
    return this._http.post(`${this.url}/alerts/${alertId}`, data);
  }

  public getAlert(dataSetId, alertId): Observable<any> {
    return this._http.get(`${this.url}/${dataSetId}/alerts/${alertId}`);
  }

  public deleteAlert(dataSetId, alertId): Observable<any> {
    return this._http.delete(`${this.url}/${dataSetId}/alerts/${alertId}`);
  }

  public updateAlert(alertId, data): Observable<any> {
    return this._http.put(`${this.url}/${data.dataSetId}/alerts/${alertId}`, data);
  }

  public addAlert(_alertId, data): Observable<any> {
    return this._http.post(`${this.url}/${data.dataSetId}/alerts`, data);
  }

  public trigger(dataSetId): Observable<any> {
    return this._http.post(`${this.url}/${dataSetId}/trigger`, {});
  }

  public getCustomerSync(): Observable<any> {
    return this._http.get(`/dealers/<dealerId>/hooks/customerSync`, {});
  }

  public createCustomerSync(dataSetId, body): Observable<any> {
    return this._http.post(`${this.url}/${dataSetId}/hooks/customerSync`, body);
  }

  public deleteCustomerSync(): Observable<any> {
    return this._http.delete(`/dealers/<dealerId>/hooks/customerSync`);
  }

  public getVendorSync(): Observable<any> {
    return this._http.get(`/dealers/<dealerId>/hooks/vendorSync`, {});
  }

  public createVendorSync(dataSetId, body): Observable<any> {
    return this._http.post(`${this.url}/${dataSetId}/hooks/vendorSync`, body);
  }

  public deleteVendorSync(): Observable<any> {
    return this._http.delete(`/dealers/<dealerId>/hooks/vendorSync`);
  }
}
