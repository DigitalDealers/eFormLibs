import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ManageDetailsMapService } from './manage-details/map.service';
import { PortalUser } from './shared/interfaces/portal-user.interface';
import { ConfigService } from './shared/services/config.service';
import { ContactManagerSearchResult } from './shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from './shared/interfaces/contact-manager.interface';
import { ModuleWidget } from './shared/interfaces/module-widget.interface';
import { DataSetSearchService } from './shared/services/data-set-search.service';

@Injectable()
export class ContactManagerService {
  private httpClient: HttpClient;
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  static prepareData(data) {
    let name = '';
    const { fName, lName, email } = data;

    if (fName) {
      name = `${fName} `;
    }

    if (lName) {
      name += `${lName}`;
    }

    data['userFName'] = name;
    name += ` (${email})`;
    data['extraName'] = name;

    return data;
  }

  private static prepareDataList<T = any>(res): { data: T[] } {
    const result: T[] = [];

    for (const item of res) {
      result.push(ContactManagerService.prepareData(item));
    }
    return { data: result };
  }

  constructor(private handler: HttpBackend,
              private dataSetSearchService: DataSetSearchService,
              private config: ConfigService) {
    this.httpClient = new HttpClient(handler);
  }

  getUser(id: string) {
    return this.httpClient
      .get(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/userById/${id}`, {
        headers: this.headers
      });
  }

  getDealerUsers(params: HttpParams) {
    return this.httpClient
      .get(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users`, {
        headers: this.headers,
        params
      })
      .pipe(
        map(res => ContactManagerService.prepareDataList(res))
      );
  }

  update(id, body) {
    return this.httpClient
      .put(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${id}`, body, {
        headers: this.headers,
      });
  }

  create(body): Observable<any> {
    const { entityId } = body;
    let query = '';
    if (entityId) {
      query = `?entityId=${entityId}`;
    }
    return this.httpClient
      .post(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users${query}`, body, {
        headers: this.headers,
      });
  }

  getCustomersByUser(userId, params: HttpParams) {
    return this.httpClient
      .get(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${userId}/customers`, {
        headers: this.headers,
        params
      });
  }

  deleteItem(id): Observable<any> {
    return this.httpClient
      .delete(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${id}`, {
        headers: this.headers
      });
  }

  getCustomersList(params = new HttpParams(),
                   contactManagerValue: ContactManager): Observable<{ data: PortalUser[] }> {
    return this.dataSetSearchService.liteSearch(contactManagerValue.customersDataSetId, {
      query: (params.get('text') || '').trim(),
      offset: params.get('offset'),
      limit: params.get('limit')
    }).pipe(
      map((res: ContactManagerSearchResult[]) => {
        return res.map((customer: ContactManagerSearchResult) => {
          return {
            id: Number(customer.CustomerPortalId),
            email: customer[contactManagerValue.email],
            fName: ManageDetailsMapService.parseNames(customer[contactManagerValue.contactName]).firstName,
            lName: ManageDetailsMapService.parseNames(customer[contactManagerValue.contactName]).lastName,
            type: 'Customer',
            phone: customer[contactManagerValue.phone],
            legalEntity: customer[contactManagerValue.customerLegalEntity],
            entityId: null,
            customerNumber: customer[contactManagerValue.customerNumber],
            companyName: customer[contactManagerValue.customerName],
            isInPortal: customer[contactManagerValue.isPortalCustomer] === 'Yes',
            picture: '',
          } as PortalUser;
        });
      }),
      map((res: PortalUser[]) => ContactManagerService.prepareDataList<PortalUser>(res))
    );
  }

  getPortalCustomersList(query: string): Observable<{ data: PortalUser[] }> {
    return this.httpClient
      .get<{ data: PortalUser[] }>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers`, {
        headers: this.headers,
        params: new HttpParams({
          fromObject: {
            text: query.trim(),
            offset: '0',
            limit: '1'
          }
        })
      })
      .pipe(
        map((res) => ContactManagerService.prepareDataList(res))
      );
  }

  linkCustomerToUser(body): Observable<PortalUser> {
    let { id, customerId } = body;
    return this.httpClient
      .put(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers/${customerId}/users/${id}`, body, {
        headers: this.headers,
      })
      .pipe(
        map((res) => ContactManagerService.prepareData(res)),
        catchError(() => of(null))
      );
  }

  getCustomerRoles(userId: string) {
    return this.httpClient
      .get(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles/users/${userId}`, {
        headers: this.headers,
      });
  }

  linkRoleToUser(roleId: string, userId: string) {
    return this.httpClient.put(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles/${roleId}/users/${userId}`, {}, {
      headers: this.headers,
    });
  }

  unlinkRoleFromUser(roleId: string, userId: string) {
    return this.httpClient.delete(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles/${roleId}/users/${userId}`, {
      headers: this.headers,
    });
  }

  unlinkCustomerFromUser(body): Observable<any> {
    let { id, customerId } = body;
    return this.httpClient
      .delete(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers/${customerId}/users/${id}`, {
        headers: this.headers,
      })
      .pipe(
        catchError(() => of(null))
      );
  }

  inviteUser(contactManager: ContactManagerSearchResult,
             contactManagerValue: ContactManager,
             customer: PortalUser) {
    const data = {
      accountNumber: contactManager.accountNumber,
      dealerId: this.config.getDealerId(),
      email: contactManager[contactManagerValue.email],
      fullName: contactManager[contactManagerValue.contactName],
      userFName: contactManager[contactManagerValue.contactName],
      fName: ManageDetailsMapService.parseNames(contactManager[contactManagerValue.contactName]).firstName,
      lName: ManageDetailsMapService.parseNames(contactManager[contactManagerValue.contactName]).lastName,
      legalEntity: contactManager[contactManagerValue.legalEntity],
      id: contactManager.PortalUserId,
      originalEmail:  contactManager[contactManagerValue.email],
      phone: contactManager[contactManagerValue.phone],
      status: contactManager['Portal User Status'],
      type: 'Customer',
      customerName: customer.companyName,
      customerNumber: customer.customerNumber
    };
    return this.httpClient
      .post(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${contactManager.PortalUserId}/invite`, data, {
        headers: this.headers,
      });
  }

  sendDataToNotificationHub(contactManager: ContactManagerSearchResult,
                            contactManagerValue: ContactManager,
                            customer: PortalUser) {
    const data = {
      fullName: contactManager[contactManagerValue.contactName],
      email: contactManager[contactManagerValue.email],
      phone: contactManager[contactManagerValue.phone],
      legalEntity: contactManager[contactManagerValue.legalEntity],
      accountNumber: contactManager.accountNumber,
      customerName: customer.companyName,
      customerNumber: customer.customerNumber
    };
    return this.httpClient.post(`https://us-central1-didicore-nh.cloudfunctions.net/api/notifications/publish`, {
      application: contactManagerValue.notifications.application,
      toEmail: contactManager[contactManagerValue.email],
      subject: 'Invite New User',
      data: Object.keys(data).map((key: string) => {
        return {
          key: `{{${key}}}`,
          value: data[key]
        };
      }),
    }, {
      headers: this.headers,
    });
  }

  createCustomer(body: PortalUser) {
    const toAdd = { };
    Object.keys(body).forEach((key: string) => {
      if (key !== 'id') {
        toAdd[key] = body[key];
      }
    });
    return this.httpClient
      .post(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers`, toAdd, {
        headers: this.headers,
      });
  }

  getCommunicationCentreModules(): Observable<ModuleWidget[]> {
    const params: { orderBy: string, where?: string } = {
      orderBy: JSON.stringify({ key: 'createdAt', direction: 'asc' }),
      where: JSON.stringify({ key: 'communicationCentre', value: true })
    };
    return this.httpClient.get<ModuleWidget[]>(`${this.config.cloudFunctionUrl}/cmsDataBase/collection/widgetModules`, {
      headers: this.headers,
      params
    });
  }

  imgUpload(base64: string) {
    return this.httpClient.post(`${this.config.cloudFunctionUrl}/cmsDataBase/upload`, { base64 }, {
      headers: this.headers
    });
  }
}
