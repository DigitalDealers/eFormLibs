import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ManageDetailsMapService } from './manage-details/map.service';
import {
  ContactManagerSearchResult,
  ContactNameKey,
  isPortalUserKey,
  LegalEntityKey
} from './shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from './shared/interfaces/contact-manager.interface';
import { ModuleWidget } from './shared/interfaces/module-widget.interface';
import { PortalUser } from './shared/interfaces/portal-user.interface';
import { Role } from './shared/interfaces/role.interface';
import { ConfigService } from './shared/services/config.service';
import { DataSetSearchService } from './shared/services/data-set-search.service';

@Injectable()
export class ContactManagerService {
  private httpClient: HttpClient;
  private readonly headers = {
    'Authorization': `Bearer ${this.config.getAccessToken()}`
  };

  static prepareData(data: PortalUser): PortalUser {
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

  private static prepareDataList(res: PortalUser[]): { data: PortalUser[] } {
    const result: PortalUser[] = [];

    for (const item of res) {
      result.push(ContactManagerService.prepareData(item));
    }
    return { data: result };
  }

  constructor(
    private handler: HttpBackend,
    private dataSetSearchService: DataSetSearchService,
    private config: ConfigService
  ) {
    this.httpClient = new HttpClient(handler);
  }

  public getUser(id: string): Observable<PortalUser> {
    return this.httpClient
      .get<PortalUser>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/userById/${id}`, {
        headers: this.headers
      });
  }

  getDealerUsers(params: HttpParams) {
    return this.httpClient
      .get<PortalUser[]>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users`, {
        headers: this.headers,
        params
      })
      .pipe(
        map(res => ContactManagerService.prepareDataList(res))
      );
  }

  public update(id: string, body: Partial<PortalUser>): Observable<PortalUser> {
    return this.httpClient
      .put(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${id}`, body, {
        headers: this.headers
      });
  }

  create(body: PortalUser): Observable<any> {
    const { entityId } = body;
    let query = '';
    if (entityId) {
      query = `?entityId=${entityId}`;
    }
    return this.httpClient
      .post(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users${query}`, body, {
        headers: this.headers
      });
  }

  public getCustomersByUser(userId: string, params: HttpParams): Observable<PortalUser[]> {
    return this.httpClient
      .get<PortalUser[]>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${userId}/customers`, {
        headers: this.headers,
        params
      });
  }

  public deleteItem(id: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${id}`, {
        headers: this.headers
      });
  }

  public getCustomersList(params = new HttpParams(), contactManagerValue: ContactManager): Observable<{ data: PortalUser[] }> {
    return this.dataSetSearchService.liteSearch<ContactManagerSearchResult>(contactManagerValue.customersDataSetId, {
      query: (params.get('text') || '').trim(),
      offset: params.get('offset') || '',
      limit: params.get('limit') || ''
    }).pipe(
      map(res => {
        return res.map(customer => {
          return {
            id: Number(customer.CustomerPortalId),
            email: customer[contactManagerValue.email as keyof ContactManagerSearchResult],
            fName: ManageDetailsMapService.parseNames(customer[contactManagerValue.contactName as ContactNameKey]).firstName,
            lName: ManageDetailsMapService.parseNames(customer[contactManagerValue.contactName as ContactNameKey]).lastName,
            type: 'Customer',
            phone: customer[contactManagerValue.phone as keyof ContactManagerSearchResult],
            legalEntity: customer[contactManagerValue.customerLegalEntity as LegalEntityKey],
            entityId: '',
            customerNumber: customer[contactManagerValue.customerNumber as keyof ContactManagerSearchResult],
            companyName: customer[contactManagerValue.customerName as keyof ContactManagerSearchResult],
            isInPortal: customer[contactManagerValue.isPortalCustomer as isPortalUserKey] === 'Yes',
            picture: ''
          } as PortalUser;
        });
      }),
      map((res: PortalUser[]) => ContactManagerService.prepareDataList(res))
    );
  }

  getPortalCustomersList(query: string): Observable<{ data: PortalUser[] }> {
    return this.httpClient
      .get<PortalUser[]>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers`, {
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

  linkCustomerToUser(body: { id: number, customerId: number }): Observable<PortalUser | null> {
    const { id, customerId } = body;
    return this.httpClient
      .put<PortalUser>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers/${customerId}/users/${id}`, body, {
        headers: this.headers
      })
      .pipe(
        map(res => ContactManagerService.prepareData(res)),
        catchError(() => of(null))
      );
  }

  public getCustomerRoles(userId: string): Observable<Role[]> {
    return this.httpClient
      .get<Role[]>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles/users/${userId}`, {
        headers: this.headers
      });
  }

  linkRoleToUser(roleId: string, userId: string) {
    return this.httpClient.put(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles/${roleId}/users/${userId}`, {}, {
      headers: this.headers
    });
  }

  unlinkRoleFromUser(roleId: string, userId: string) {
    return this.httpClient.delete(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/roles/${roleId}/users/${userId}`, {
      headers: this.headers
    });
  }

  unlinkCustomerFromUser(body: { id: number, customerId: number }): Observable<PortalUser | null> {
    const { id, customerId } = body;
    return this.httpClient
      .delete<PortalUser>(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers/${customerId}/users/${id}`, {
        headers: this.headers
      })
      .pipe(
        catchError(() => of(null))
      );
  }

  inviteUser(
    contactManager: ContactManagerSearchResult,
    contactManagerValue: ContactManager,
    customer: PortalUser
  ) {
    const {
      firstName,
      lastName
    } = ManageDetailsMapService.parseNames(contactManager[contactManagerValue.contactName as keyof ContactManagerSearchResult] as string);

    const data = {
      accountNumber: contactManager.accountNumber,
      dealerId: this.config.getDealerId(),
      email: contactManager[contactManagerValue.email as keyof ContactManagerSearchResult],
      fullName: contactManager[contactManagerValue.contactName as keyof ContactManagerSearchResult],
      userFName: contactManager[contactManagerValue.contactName as keyof ContactManagerSearchResult],
      fName: firstName,
      lName: lastName,
      legalEntity: contactManager[contactManagerValue.legalEntity as keyof ContactManagerSearchResult],
      id: contactManager.PortalUserId,
      originalEmail: contactManager[contactManagerValue.email as keyof ContactManagerSearchResult],
      phone: contactManager[contactManagerValue.phone as keyof ContactManagerSearchResult],
      status: contactManager['Portal User Status'],
      type: 'Customer',
      customerName: customer.companyName,
      customerNumber: customer.customerNumber
    };
    return this.httpClient
      .post(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/users/${contactManager.PortalUserId}/invite`, data, {
        headers: this.headers
      });
  }

  sendDataToNotificationHub(
    contactManager: ContactManagerSearchResult,
    contactManagerValue: ContactManager,
    customer: PortalUser
  ) {
    const data = {
      fullName: contactManager[contactManagerValue.contactName as keyof ContactManagerSearchResult],
      email: contactManager[contactManagerValue.email as keyof ContactManagerSearchResult],
      phone: contactManager[contactManagerValue.phone as keyof ContactManagerSearchResult],
      legalEntity: contactManager[contactManagerValue.legalEntity as keyof ContactManagerSearchResult],
      accountNumber: contactManager.accountNumber,
      customerName: customer.companyName,
      customerNumber: customer.customerNumber
    };
    return this.httpClient.post(`https://us-central1-didicore-nh.cloudfunctions.net/api/notifications/publish`, {
      application: contactManagerValue.notifications.application,
      toEmail: contactManager[contactManagerValue.email as keyof ContactManagerSearchResult],
      subject: 'Invite New User',
      data: Object.keys(data).map(key => {
        return {
          key: `{{${key}}}`,
          value: data[key as keyof typeof data]
        };
      })
    }, {
      headers: this.headers
    });
  }

  createCustomer(body: PortalUser) {
    const toAdd = { ...body };
    delete toAdd.id;

    return this.httpClient
      .post(`${this.config.authApiUrl}/dealers/${this.config.getDealerId()}/customers`, toAdd, {
        headers: this.headers
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

  public imgUpload(base64: string): Observable<{ uploadResult: string }> {
    return this.httpClient.post<{ uploadResult: string }>(`${this.config.cloudFunctionUrl}/cmsDataBase/upload`, { base64 }, {
      headers: this.headers
    });
  }
}
