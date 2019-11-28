import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataSetSearchResponse } from '../interfaces/data-set-search-response.interface';
import { SearchParams } from '../interfaces/search-params.interface';
import { SearchMapper } from '../mappers/search.mapper';

@Injectable()
export class SearchService {
  private readonly baseUrl = '<batchApi>/dealers/search';

  constructor(private http: HttpClient) {
  }

  public getSearchEntities<T = any>(id: number, params = new HttpParams()): Observable<DataSetSearchResponse<T>> {
    return this.http
      .get(`<batchApi>/dealers/<dealerId>/dataSet/${id}/search`, { params })
      .pipe(map(res => SearchMapper.prepareDataList<T>(res)));
  }

  public liteSearch<T = any>(datasetId: number, params: SearchParams = {}): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.baseUrl}/${datasetId}`, {
        params: {
          ...params,
          lite: 'true'
        }
      });
  }

  public searchByKey<T = any>(datasetId: number, key: string, params: SearchParams = {}): Observable<T[]> {
    return this.http
      .post<T[]>(`${this.baseUrl}/${datasetId}`, [key, ''], {
        params: {
          ...params,
          lite: 'true'
        }
      });
  }

  public getSearchToken(params: { [param: string]: string | string[]; } = null): Observable<string> {
    return this.http.get<{ key: string }>(`${this.baseUrl}/apikey`, { params })
      .pipe(map(res => res.key));
  }
}
