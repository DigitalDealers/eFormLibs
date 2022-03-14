import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataSetMapper } from '../mappers/data-set.mapper';

@Injectable()
export class DataSetService {
  public readonly url = `<dealerApi>/dealers/<dealerId>/dataSets`;
  public readonly hooksUrl = `<dealerApi>/dealers/<dealerId>/hooks`;

  constructor(private _http: HttpClient) {
  }

  public create(body: any): Observable<any> {
    return this._http.post(this.url, body).pipe(map(DataSetMapper.prepareData));
  }

  public deleteItem(id: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}`, {});
  }

  public getOne(id: string, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${id}`, { params }).pipe(map(DataSetMapper.prepareData));
  }

  public update(id: string, body: any): Observable<any> {
    return this._http.put(`${this.url}/${id}`, body).pipe(map(DataSetMapper.prepareData));
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http.get(this.url, { params }).pipe(map(DataSetMapper.prepareListData));
  }

  public getDataSetHistory(id: string, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${id}/history`, { params }).pipe(map(DataSetMapper.prepareData));
  }

  public removeFromRole(roleName: string, id: string): Observable<any> {
    return this._http.delete(`${this.url}/${id}/roles/${roleName}`);
  }

  public assingToRole(id: string, roleName: string): Observable<any> {
    return this._http.put(`${this.url}/${id}/roles/${roleName}`, {});
  }

  public getListByRole(roleName: string, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/roles/${roleName}`, { params }).pipe(map(DataSetMapper.prepareListData));
  }

  public getAlerts(): Observable<any> {
    return this._http.get(`${this.url}/alerts/my`);
  }

  public setAlerts(alertId: string, data: any): Observable<any> {
    return this._http.post(`${this.url}/alerts/${alertId}`, data);
  }

  public getAlert(dataSetId: string, alertId: string): Observable<any> {
    return this._http.get(`${this.url}/${dataSetId}/alerts/${alertId}`);
  }

  public deleteAlert(dataSetId: string, alertId: string): Observable<any> {
    return this._http.delete(`${this.url}/${dataSetId}/alerts/${alertId}`);
  }

  public updateAlert(alertId: string, data: any): Observable<any> {
    return this._http.put(`${this.url}/${data.dataSetId}/alerts/${alertId}`, data);
  }

  public addAlert(_alertId: string, data: any): Observable<any> {
    return this._http.post(`${this.url}/${data.dataSetId}/alerts`, data);
  }

  public trigger(dataSetId: string): Observable<any> {
    return this._http.post(`${this.url}/${dataSetId}/trigger`, {});
  }

  public getCustomerSync(): Observable<any> {
    return this._http.get(`${this.hooksUrl}/customerSync`, {});
  }

  public createCustomerSync(dataSetId: string, body: any): Observable<any> {
    return this._http.post(`${this.url}/${dataSetId}/hooks/customerSync`, body);
  }

  public deleteCustomerSync(): Observable<any> {
    return this._http.delete(`${this.hooksUrl}/customerSync`);
  }

  public getVendorSync(): Observable<any> {
    return this._http.get(`${this.hooksUrl}/vendorSync`, {});
  }

  public createVendorSync(dataSetId: string, body: any): Observable<any> {
    return this._http.post(`${this.url}/${dataSetId}/hooks/vendorSync`, body);
  }

  public deleteVendorSync(): Observable<any> {
    return this._http.delete(`${this.hooksUrl}/vendorSync`);
  }
}
