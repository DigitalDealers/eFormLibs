import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchMapper } from '../mappers/search.mapper';

@Injectable()
export class SearchService {
  private get _batchUrl() {
    return `<batchApi>/dealers/<dealerId>`;
  }

  constructor(private _http: HttpClient) {}

  public getSearchEntities(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this._batchUrl}/dataSet/${id}/search`, { params })
      .pipe(map(res => SearchMapper.prepareDataList(res)));
  }
}
