import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class AuthUserService {
  private _baseUrl = '<authApi>';

  private get _dealerId() {
    return '<dealerId>';
  }

  constructor(private _http: HttpClient) {}

  public create(body): Observable<any> {
    const { entityId } = body;
    let query = '';
    if (entityId) {
      query = `?entityId=${entityId}`;
    }
    return this._http.post(
      `${this._baseUrl}/dealers/${this._dealerId}/users${query}`,
      body
    );
  }

  public inviteCustomerUser(userId, body): Observable<any> {
    return this._http.post(
      `${this._baseUrl}/dealers/${this._dealerId}/users/${userId}/invite`,
      body
    );
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(
      `${this._baseUrl}/dealers/${this._dealerId}/users/${id}`
    );
  }

  public getOne(id): Observable<any> {
    return this._http.get(
      `${this._baseUrl}/dealers/${this._dealerId}/userById/${id}`
    );
  }

  public getByToken(params: HttpParams = new HttpParams()): Observable<any> {
    return this._http.get(`${this._baseUrl}/users/getByToken`, { params }).pipe(
      map((res: any) => {
        res.user = UserMapper.prepareData(res.user);
        return res;
      })
    );
  }

  public getCustomerUsers(customerId, params: HttpParams) {
    return this._http.get(
      `${this._baseUrl}/dealers/${
        this._dealerId
      }/customers/${customerId}/users`,
      { params }
    );
  }

  public getCustomersByUser(userId, params: HttpParams) {
    return this._http.get(
      `${this._baseUrl}/dealers/${this._dealerId}/users/${userId}/customers`,
      { params }
    );
  }

  public getVendorsByUser(userId, params: HttpParams) {
    return this._http.get(
      `${this._baseUrl}/dealers/${this._dealerId}/users/${userId}/vendors`,
      { params }
    );
  }

  public getRoleUsers(roleId, params) {
    return this._http.get(
      `${this._baseUrl}/dealers/${this._dealerId}/users/roles/${roleId}`,
      { params }
    );
  }

  public getDealerUsers(params: HttpParams) {
    return this._http
      .get(`${this._baseUrl}/dealers/${this._dealerId}/users`, { params })
      .pipe(map(res => UserMapper.prepareDataList(res)));
  }

  public update(id, body) {
    return this._http.put(
      `${this._baseUrl}/dealers/${this._dealerId}/users/${id}`,
      body
    );
  }

  public deleteUserFromCustomer(customerId, userId) {
    return this._http.delete(
      `${this._baseUrl}/dealers/${
        this._dealerId
      }/customers/${customerId}/users/${userId}`
    );
  }

  public inviteVendorUser(userId, body) {
    return this._http.post(
      `${this._baseUrl}/dealers/${this._dealerId}/users/${userId}/invite`,
      body
    );
  }

  public getVendorUsers(vendorId, params) {
    return this._http.get(
      `${this._baseUrl}/dealers/${this._dealerId}/vendors/${vendorId}/users`,
      { params }
    );
  }

  public deleteUserFromVendor(vendorId, userId) {
    return this._http.delete(
      `${this._baseUrl}/dealers/${
        this._dealerId
      }/vendors/${vendorId}/users/${userId}`
    );
  }
}
