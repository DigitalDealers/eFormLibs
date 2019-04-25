import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataSet } from '../interfaces/data-set.interface';

@Injectable()
export class SearchService {
  private readonly url = '<dealerApi>/dealers/<dealerId>';

  constructor(private _http: HttpClient) {
  }

  public getSearchDataSets(params = new HttpParams()): Observable<DataSet[]> {
    return this._http.get<DataSet[]>(`${this.url}/searchDataSets`, { params });
  }
}
