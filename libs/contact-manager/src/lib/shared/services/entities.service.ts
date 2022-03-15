import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { HttpBackendClientService } from './http-backend-client.service';
import { ConfigService } from './config.service';

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

  constructor(private httpClient: HttpBackendClientService,
              private config: ConfigService) {
  }

  public getAssociatedContacts(code: string, dataSetId: number, params: HttpParams) {
    const keysToUpdate = EntitiesService.prepareKeys(code);
    return this.httpClient.post(`${this.config.batchApiUrl}/dealers/search/${dataSetId}`, keysToUpdate, {
      headers: this.headers,
      params
    }).pipe(
      map((res) => res)
    );
  }
}
