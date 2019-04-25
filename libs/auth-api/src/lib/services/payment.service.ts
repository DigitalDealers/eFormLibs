import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class PaymentService {
  private readonly url = '<authApi>/dealers/<dealerId>';

  constructor(private _http: HttpClient) {
  }

  public getList(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/pgateway`, { params });
  }

  public create(body): Observable<any> {
    return this._http.post(`${this.url}/pgateway`, body);
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.url}/pgateway/${id}`);
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/pgateway/${id}`, { params });
  }

  public update(id, body): Observable<any> {
    return this._http.put(`${this.url}/pgateway/${id}`, body);
  }

  public getSecret(id): Observable<any> {
    return this._http.get(`${this.url}/pgateway/${id}/creds`, {});
  }

  public getFingerPrint(body): Observable<any> {
    return this._http.post(`${this.url}/securePay/fingerPrint`, body);
  }
}
