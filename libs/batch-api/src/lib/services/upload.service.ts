import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import uuidv4 from 'uuid/v4';

import { UploadResponse } from '../interfaces/upload-response.interface';

interface UploadAPIResponse {
  url: string;
  urlKey: string;
}

@Injectable()
export class UploadService {
  private readonly baseUrl = '<batchApi>/dealers';

  constructor(private http: HttpClient) {
  }

  public getAssetKey(appId: number): Observable<string> {
    return this.http
      .get<{ token: string; }>(
        `${this.baseUrl}/getAppAssetKey`,
        { params: { appType: (appId || '').toString() } }
      )
      .pipe(map(({ token }) => token));
  }

  public uploadFiles(appId: number, files: (File | Blob)[], filename?: string): Observable<UploadResponse[]> {
    return forkJoin(files.map<Observable<UploadResponse>>(file => {
      const fd = new FormData();
      const preparedFilename = this.prepareFilename(filename || (file as File).name || '');
      fd.append('file', file, preparedFilename);
      return this.http
        .post<UploadAPIResponse>(
          `${this.baseUrl}/uploadAppAsset`,
          fd,
          { params: { appType: (appId || '').toString() } }
        )
        .pipe(map(res => ({
          name: preparedFilename,
          url: res.url
        })));
    }));
  }

  private prepareFilename(filename: string): string {
    const fileExt = filename.split('.').pop().toLowerCase();
    return `${uuidv4()}.${fileExt}`;
  }
}
