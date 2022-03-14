import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UpdatePhoneInterface } from '../interfaces/update-phone.interface';
import { UserProfile } from '../interfaces/user-profile.interface';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  private readonly usersUrl = '<authApi>/dealers/<dealerId>/users';
  private readonly customersUrl = '<authApi>/dealers/<dealerId>/customers';
  private readonly vendorsUrl = '<authApi>/dealers/<dealerId>/vendors';
  private readonly updatePhoneUrl = '<authApi>/dealers/users/updatephone';

  constructor(private _http: HttpClient) {
  }

  public create(body: any): Observable<any> {
    const { entityId } = body;
    let query = '';
    if (entityId) {
      query = `?entityId=${entityId}`;
    }
    return this._http.post(`${this.usersUrl}${query}`, body);
  }

  public inviteCustomerUser(userId: string, body: any): Observable<any> {
    return this._http.post(`${this.usersUrl}/${userId}/invite`, body);
  }

  public deleteItem(id: string): Observable<any> {
    return this._http.delete(`${this.usersUrl}/${id}`);
  }

  public getOne(id: string): Observable<any> {
    return this._http.get(`<authApi>/dealers/<dealerId>/userById/${id}`);
  }

  public getByToken(params: { [param: string]: string | string[]; } = {}): Observable<UserProfile> {
    return this._http
      .get<UserProfile>('<authApi>/users/getByToken', { params })
      .pipe(map(res => {
        res.user = UserMapper.prepareData(res.user);
        return res;
      }));
  }

  public getCustomerUsers(customerId: string, params: HttpParams) {
    return this._http.get(`${this.customersUrl}/${customerId}/users`, { params });
  }

  public getCustomersByUser(userId: string, params: HttpParams) {
    return this._http.get(`${this.usersUrl}/${userId}/customers`, { params });
  }

  public getVendorsByUser(userId: string, params: HttpParams) {
    return this._http.get(`${this.usersUrl}/${userId}/vendors`, { params });
  }

  public getRoleUsers(roleId: string, params: { [param: string]: string | string[]; }) {
    return this._http.get(`${this.usersUrl}/roles/${roleId}`, { params });
  }

  public getDealerUsers(params: HttpParams) {
    return this._http
      .get(`${this.usersUrl}`, { params })
      .pipe(map(res => UserMapper.prepareDataList(res)));
  }

  public update(id: string, body: any) {
    return this._http.put(`${this.usersUrl}/${id}`, body);
  }

  public updatePhone(phone: string, firstName?: string, lastName?: string) {
    const update: UpdatePhoneInterface = {
      phone
    };
    if (firstName) {
      update.given_name = firstName;
    }
    if (lastName) {
      update.family_name = lastName;
    }
    return this._http.put(this.updatePhoneUrl, update);
  }

  public deleteUserFromCustomer(customerId: string, userId: string) {
    return this._http.delete(`${this.customersUrl}/${customerId}/users/${userId}`);
  }

  public inviteVendorUser(userId: string, body: any) {
    return this._http.post(`${this.usersUrl}/${userId}/invite`, body);
  }

  public getVendorUsers(vendorId: string, params: { [param: string]: string | string[]; }) {
    return this._http.get(`${this.vendorsUrl}/${vendorId}/users`, { params });
  }

  public deleteUserFromVendor(vendorId: string, userId: string) {
    return this._http.delete(`${this.vendorsUrl}/${vendorId}/users/${userId}`);
  }
}
