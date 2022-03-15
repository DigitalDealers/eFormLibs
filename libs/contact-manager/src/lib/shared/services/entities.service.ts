import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';
import { HttpBackendClientService } from './http-backend-client.service';

@Injectable()
export class EntitiesService {
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  private static prepareKeys(key: string): string[] {
    const keysToUpdate: string[] = [];
    keysToUpdate.push(key);
    if (keysToUpdate.length === 1) {
      keysToUpdate.push('');
    }
    return keysToUpdate;
  }

  constructor(
    private httpClient: HttpBackendClientService,
    private config: ConfigService
  ) {
  }

  public getAssociatedContacts<T = unknown>(code: string, dataSetId: number, params: HttpParams): Observable<T> {
    const keysToUpdate = EntitiesService.prepareKeys(code);
    return this.httpClient.post<T>(`${this.config.batchApiUrl}/dealers/search/${dataSetId}`, keysToUpdate, {
      headers: this.headers,
      params
    });
  }
}
