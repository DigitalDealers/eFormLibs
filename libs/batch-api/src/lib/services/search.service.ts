import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataSetSearchResponse } from '../interfaces/data-set-search-response.interface';
import { SearchMapper } from '../mappers/search.mapper';

@Injectable()
export class SearchService {
  private readonly batchUrl = '<batchApi>/dealers/<dealerId>';

  constructor(private http: HttpClient) {}

  public getSearchEntities(id: number, params = new HttpParams()): Observable<DataSetSearchResponse> {
    return this.http
      .get(`${this.batchUrl}/dataSet/${id}/search`, { params })
      .pipe(map(res => SearchMapper.prepareDataList(res)));
  }
}
