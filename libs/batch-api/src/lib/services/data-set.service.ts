import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DataSetService {
  private readonly url = '<batchApi>/dealers/<dealerId>';

  constructor(private _http: HttpClient) {
  }

  public getColumns(body: any): Observable<any> {
    return this._http
      .post<{ name: string }[]>(`${this.url}/dataSets/columns`, body)
      .pipe(map(res => res.map(name => ({ name }))));
  }

  public generateReport(id: string, params = new HttpParams()): Observable<any> {
    return this._http.get(
      `${this.url}/DataSet/${id}/report`,
      { responseType: 'blob', params }
    );
  }
}
