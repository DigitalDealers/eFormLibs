import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserProfile } from '../interfaces/user-profile.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UpdatePhoneInterface } from '../interfaces/update-phone.interface';

@Injectable()
export class UserService {
  private readonly usersUrl = '<authApi>/dealers/<dealerId>/users';
  private readonly customersUrl = '<authApi>/dealers/<dealerId>/customers';
  private readonly vendorsUrl = '<authApi>/dealers/<dealerId>/vendors';
  private readonly updatePhoneUrl = '<authApi>/dealers/users/updatephone';

  constructor(private _http: HttpClient) {
  }

  public create(body): Observable<any> {
    const { entityId } = body;
    let query = '';
    if (entityId) {
      query = `?entityId=${entityId}`;
    }
    return this._http.post(`${this.usersUrl}${query}`, body);
  }

  public inviteCustomerUser(userId, body): Observable<any> {
    return this._http.post(`${this.usersUrl}/${userId}/invite`, body);
  }

  public deleteItem(id): Observable<any> {
    return this._http.delete(`${this.usersUrl}/${id}`);
  }

  public getOne(id): Observable<any> {
    return this._http.get(`<authApi>/dealers/<dealerId>/userById/${id}`);
  }

  public getByToken(params: { [param: string]: string | string[]; } = null): Observable<UserProfile> {
    return this._http
      .get<UserProfile>('<authApi>/users/getByToken', { params })
      .pipe(map(res => {
        res.user = UserMapper.prepareData(res.user);
        return res;
      }));
  }

  public getCustomerUsers(customerId, params: HttpParams) {
    return this._http.get(`${this.customersUrl}/${customerId}/users`, { params });
  }

  public getCustomersByUser(userId, params: HttpParams) {
    return this._http.get(`${this.usersUrl}/${userId}/customers`, { params });
  }

  public getVendorsByUser(userId, params: HttpParams) {
    return this._http.get(`${this.usersUrl}/${userId}/vendors`, { params });
  }

  public getRoleUsers(roleId, params) {
    return this._http.get(`${this.usersUrl}/roles/${roleId}`, { params });
  }

  public getDealerUsers(params: HttpParams) {
    return this._http
      .get(`${this.usersUrl}`, { params })
      .pipe(map(res => UserMapper.prepareDataList(res)));
  }

  public update(id, body) {
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

  public deleteUserFromCustomer(customerId, userId) {
    return this._http.delete(`${this.customersUrl}/${customerId}/users/${userId}`);
  }

  public inviteVendorUser(userId, body) {
    return this._http.post(`${this.usersUrl}/${userId}/invite`, body);
  }

  public getVendorUsers(vendorId, params) {
    return this._http.get(`${this.vendorsUrl}/${vendorId}/users`, { params });
  }

  public deleteUserFromVendor(vendorId, userId) {
    return this._http.delete(`${this.vendorsUrl}/${vendorId}/users/${userId}`);
  }
}
