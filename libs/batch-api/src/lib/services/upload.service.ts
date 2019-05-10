import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import uuidv4 from 'uuid/v4';

import { ModuleOptions } from '../interfaces/module-options.interface';
import { UploadResponse } from '../interfaces/upload-response.interface';
import { OPTIONS } from '../options';

interface UploadAPIResponse {
  url: string;
  urlKey: string;
}

@Injectable()
export class UploadService {
  private readonly baseUrl = '<batchApi>/dealers';

  constructor(
    private http: HttpClient,
    @Inject(OPTIONS) private options: ModuleOptions
  ) {
  }

  public getAssetKey(): Observable<string> {
    return this.http
      .get<{ token: string; }>(
        `${this.baseUrl}/getAppAssetKey`,
        { params: { appType: (this.options.appType || '').toString() } }
      )
      .pipe(map(({ token }) => token));
  }

  public uploadFiles(files: (File | Blob)[], filename?: string): Observable<UploadResponse[]> {
    return forkJoin(files.map<Observable<UploadResponse>>(file => {
      const fd = new FormData();
      const filenameOrigin = filename || (file as File).name || '';
      const fileSize = (file as File).size;
      const fileType = (file as File).type;
      const preparedFilename = this.prepareFilename(filenameOrigin);
      fd.append('file', file, preparedFilename);
      return this.http
        .post<UploadAPIResponse>(
          `${this.baseUrl}/uploadAppAsset`,
          fd,
          { params: { appType: (this.options.appType || '').toString() } }
        )
        .pipe(map(res => ({
          filename: filenameOrigin,
          name: preparedFilename,
          url: res.url,
          size: fileSize,
          type: fileType
        })));
    }));
  }

  private prepareFilename(filename: string): string {
    const fileExt = filename.split('.').pop().toLowerCase();
    return `${uuidv4()}.${fileExt}`;
  }
}
