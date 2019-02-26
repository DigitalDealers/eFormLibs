import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SearchService {
  private get _url() {
    return `<dealerApi>/dealers/<dealerId>`;
  }

  constructor(private _http: HttpClient) {}

  public getSearchDataSets(params = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}/searchDataSets`, { params });
  }
}
