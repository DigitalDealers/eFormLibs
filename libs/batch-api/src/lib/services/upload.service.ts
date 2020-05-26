import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { UploadResponse } from '@digitaldealers/typings';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { ModuleOptions } from '../interfaces/module-options.interface';
import { OPTIONS } from '../options';

interface UploadAPIResponse {
  url: string;
  urlKey: string;
}

@Injectable()
export class UploadService {
  private readonly baseUrl = '<batchApi>/dealers';
  private appType: string;

  constructor(
    private http: HttpClient,
    @Inject(OPTIONS) private options: ModuleOptions
  ) {
    this.appType = (this.options.appType || '').toString();
  }

  private static prepareFilename(filename: string): string {
    const fileExt = filename.split('.').pop().toLowerCase();
    return `${uuidv4()}.${fileExt}`;
  }

  public getAssetKey(): Observable<string> {
    return this.http
      .get<{ token: string; }>(
        `${this.baseUrl}/getAppAssetKey`,
        { params: { appType: this.appType } }
      )
      .pipe(map(({ token }) => token));
  }

  public uploadFiles(files: (File | Blob)[], filename?: string): Observable<UploadResponse[]> {
    return forkJoin(files.map(file => {
      const fd = new FormData();
      const filenameOriginal = filename || (file as File).name || '';
      const fileSize = (file as File).size || null;
      const fileType = (file as File).type || '';
      const preparedFilename = UploadService.prepareFilename(filenameOriginal);
      fd.append('file', file, preparedFilename);

      return this.http
        .post<UploadAPIResponse>(
          `${this.baseUrl}/uploadAppAsset`,
          fd,
          { params: { appType: this.appType } }
        )
        .pipe(map(res => ({
          filename: filenameOriginal,
          name: preparedFilename,
          size: fileSize,
          type: fileType,
          url: res.url
        })));
    }));
  }
}
