import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';
import { SearchParams } from '../interfaces/search-params.interface';

@Injectable()
export class DataSetSearchService {

  private httpClient: HttpClient;
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  constructor(private handler: HttpBackend,
              private config: ConfigService) {
    this.httpClient = new HttpClient(handler);
  }

  public liteSearch<T = any>(datasetId: number, params: SearchParams = {}): Observable<T[]> {
    return this.httpClient
      .get<T[]>(`${this.config.batchApiUrl}/dealers/search/${datasetId}`, {
        headers: this.headers,
        params: {
          ...params,
          lite: 'true'
        }
      });
  }
}
