import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DealerService {
  private get _dealerId() {
    return '<dealerId>';
  }

  private get _url() {
    return `<authApi>/dealers`;
  }

  constructor(private _http: HttpClient) {}

  public update(body): Observable<any> {
    return this._http.put(`${this._url}/${this._dealerId}`, body);
  }

  public provision(body): Observable<any> {
    return this._http.post(`${this._url}/provision`, body);
  }

  public getOne(id = null, options = {}): Observable<any> {
    return this._http.get(`${this._url}/${id || this._dealerId}`, options);
  }

  public getConnection(): Observable<any> {
    return this._http.get(`${this._url}/${this._dealerId}/connection`);
  }

  public getSiteConfig(options = {}): Observable<any> {
    return this._http.get(`${this._url}/website`, options);
  }

  public getPaymentGetwaySecret(options = {}): Observable<any> {
    return this._http.get(`${this._url}/${this._dealerId}/paymentgw`);
  }

  public getApiDetails(options = {}): Observable<any> {
    return this._http.get(`${this._url}/${this._dealerId}/api`);
  }

  public getHomePage(): Observable<any> {
    return this._http.get(`${this._url}/${this._dealerId}/home`);
  }

  public getHomePageByRole(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/${this._dealerId}/homePage`, {
      params
    });
  }

  public updateHomePageByRole(roleId, body): Observable<any> {
    return this._http.put(
      `${this._url}/${this._dealerId}/homePage/${roleId}`,
      body
    );
  }
}
