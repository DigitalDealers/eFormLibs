import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DataSetService {
  private readonly url = '<batchApi>/dealers/<dealerId>';

  constructor(private _http: HttpClient) {
  }

  public getColumns(body): Observable<any> {
    return this._http
      .post(`${this.url}/dataSets/columns`, body)
      .pipe(map((res: any) => res.map(name => ({ name }))));
  }

  public generateReport(id, params = new HttpParams()): Observable<any> {
    return this._http.get(
      `${this.url}/DataSet/${id}/report`,
      { responseType: 'blob', params }
    );
  }
}
