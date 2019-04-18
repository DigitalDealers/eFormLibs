import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataSet } from '../interfaces/data-set.interface';

@Injectable()
export class SearchService {
  private get _url() {
    return `<dealerApi>/dealers/<dealerId>`;
  }

  constructor(private _http: HttpClient) {}

  public getSearchDataSets(params = new HttpParams()): Observable<DataSet[]> {
    return this._http.get<DataSet[]>(`${this._url}/searchDataSets`, { params });
  }
}
