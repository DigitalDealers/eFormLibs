import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class RoleService {
  private readonly reportsUrl = '<dealerApi>/dealers/<dealerId>/reports';

  constructor(private _http: HttpClient) {
  }

  public getListByReportId(reportId: string, params: HttpParams): Observable<any> {
    return this._http.get(`${this.reportsUrl}/${reportId}/roles`, { params });
  }

  public deleteReport(roleId: string, reportId: string): Observable<any> {
    return this._http.delete(`${this.reportsUrl}/${reportId}/roles/${roleId}`);
  }

  public addReport(roleId: string, reportId: string): Observable<any> {
    return this._http.put(`${this.reportsUrl}/${reportId}/roles/${roleId}`, {});
  }
}
