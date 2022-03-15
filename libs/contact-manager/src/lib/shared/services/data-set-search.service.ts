import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SearchParams } from '../interfaces/search-params.interface';
import { ConfigService } from './config.service';

@Injectable()
export class DataSetSearchService {
  private httpClient: HttpClient;
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  constructor(
    private handler: HttpBackend,
    private config: ConfigService
  ) {
    this.httpClient = new HttpClient(handler);
  }

  public liteSearch<T = unknown>(datasetId: number, params: SearchParams = {}): Observable<T[]> {
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
