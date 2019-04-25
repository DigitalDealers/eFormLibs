import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DealerService {
  private readonly dealerId = '<dealerId>';
  private readonly url = '<authApi>/dealers';

  constructor(private _http: HttpClient) {
  }

  public update(body): Observable<any> {
    return this._http.put(`${this.url}/${this.dealerId}`, body);
  }

  public provision(body): Observable<any> {
    return this._http.post(`${this.url}/provision`, body);
  }

  public getOne(id = null, options = {}): Observable<any> {
    return this._http.get(`${this.url}/${id || this.dealerId}`, options);
  }

  public getConnection(): Observable<any> {
    return this._http.get(`${this.url}/${this.dealerId}/connection`);
  }

  public getSiteConfig(options = {}): Observable<any> {
    return this._http.get(`${this.url}/website`, options);
  }

  public getPaymentGetwaySecret(): Observable<any> {
    return this._http.get(`${this.url}/${this.dealerId}/paymentgw`);
  }

  public getApiDetails(): Observable<any> {
    return this._http.get(`${this.url}/${this.dealerId}/api`);
  }

  public getHomePage(): Observable<any> {
    return this._http.get(`${this.url}/${this.dealerId}/home`);
  }

  public getHomePageByRole(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this.url}/${this.dealerId}/homePage`, { params });
  }

  public updateHomePageByRole(roleId, body): Observable<any> {
    return this._http.put(`${this.url}/${this.dealerId}/homePage/${roleId}`, body);
  }
}
