import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DealerRoleService {
  private get _reportsUrl() {
    return `<dealerApi>/dealers/<dealerId>/reports`;
  }

  constructor(private _http: HttpClient) {}

  public getListByReportId(reportId, params): Observable<any> {
    return this._http.get(`${this._reportsUrl}/${reportId}/roles`, { params });
  }

  public deleteReport(roleId, reportId): Observable<any> {
    return this._http.delete(`${this._reportsUrl}/${reportId}/roles/${roleId}`);
  }

  public addReport(roleId, reportId): Observable<any> {
    return this._http.put(
      `${this._reportsUrl}/${reportId}/roles/${roleId}`,
      {}
    );
  }
}
