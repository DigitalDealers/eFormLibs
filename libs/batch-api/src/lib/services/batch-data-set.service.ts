import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BatchDataSetService {
  private get _batchurl() {
    return `<batchApi>/dealers/<dealerId>/dataSets`;
  }

  constructor(private _http: HttpClient) {}

  public getColumns(body): Observable<any> {
    return this._http
      .post(`${this._batchurl}/columns`, body)
      .pipe(map((res: any) => res.map(name => ({ name }))));
  }

  public generateReport(id, params = new HttpParams()): Observable<any> {
    return this._http.get(
      `<batchApi>/dealers/<dealerId>/DataSet/${id}/report`,
      { responseType: 'blob', params }
    );
  }
}
