import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReportMapper } from '../mappers/report.mapper';

@Injectable()
export class ReportsService {
  public readonly url = '<dealerApi>/dealers/<dealerId>/reports';

  constructor(private _http: HttpClient) {
  }

  public getList(params = new HttpParams()): Observable<any> {
    if (params instanceof HttpParams && params.has('dealerId')) {
      params = params.delete('dealerId');
    }

    return this._http
      .get(this.url, { params })
      .pipe(map(res => ReportMapper.prepareDataList(res)));
  }

  public create(data): Observable<any> {
    return this._http
      .post(this.url, data)
      .pipe(map(res => ReportMapper.prepareData(res)));
  }

  public getOne(id, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/${id}`, { params })
      .pipe(map(res => ReportMapper.prepareData(res)));
  }

  public upload(body): Observable<any> {
    return this._http.post(`${this.url}/upload`, body);
  }

  public update(id, body): Observable<any> {
    return this._http
      .put(`${this.url}/${id}`, body)
      .pipe(map(res => ReportMapper.prepareData(res)));
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  public getByTile(body): Observable<any> {
    return this._http.post(`${this.url}/getByTile`, body);
  }

  public getEmbedded(id): Observable<any> {
    return this._http.get(`${this.url}/${id}/getembedded`);
  }

  public getEmbeddedDashboards(): Observable<any> {
    return this._http.get(`${this.url}/pbdashboards`);
  }

  public getEmbeddedDashboardById(
    id,
    params = new HttpParams()
  ): Observable<any> {
    return this._http.get(`${this.url}/dashboards/${id}`, { params });
  }

  public assingReportToRole(id, reportId, body): Observable<any> {
    return this._http.put(`${this.url}/${reportId}/roles/${id}`, body);
  }

  public removeReportFromRole(roleName, reportId): Observable<any> {
    return this._http.delete(`${this.url}/${reportId}/roles/${roleName}`);
  }

  public getListByRole(roleName, params = new HttpParams()): Observable<any> {
    return this._http
      .get(`${this.url}/roles/${roleName}`, { params })
      .pipe(map(res => ReportMapper.prepareDataList(res)));
  }

  public getDashboard(): Observable<any> {
    return this._http.get('<dealerApi>/dealers/<dealerId>/getdashboard');
  }
}
