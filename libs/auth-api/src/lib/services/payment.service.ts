import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class PaymentService {
  private get _url() {
    return `<authApi>/dealers/<dealerId>`;
  }

  constructor(private _http: HttpClient) {}

  public getList(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/pgateway`, { params });
  }

  public create(body): Observable<any> {
    return this._http.post(`${this._url}/pgateway`, body);
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this._url}/pgateway/${id}`);
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/pgateway/${id}`, { params });
  }

  public update(id, body): Observable<any> {
    return this._http.put(`${this._url}/pgateway/${id}`, body);
  }

  public getSecret(id): Observable<any> {
    return this._http.get(`${this._url}/pgateway/${id}/creds`, {});
  }

  public getFingerPrint(body): Observable<any> {
    return this._http.post(`${this._url}/securePay/fingerPrint`, body);
  }
}
