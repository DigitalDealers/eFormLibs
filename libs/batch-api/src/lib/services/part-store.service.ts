import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CatPart } from '../interfaces/cat-part.interface';
import { CustomerInformation } from '../interfaces/customer-information.interface';
import { DiscountTaxInformation } from '../interfaces/discount-tax-information.interface';
import { PartInformation } from '../interfaces/part-information.interface';
import {
  CatPartParams,
  CommonResponse,
  CustomerParams,
  DiscountTaxParams,
  PartsParams
} from '../interfaces/part-store.interface';

@Injectable()
export class PartStoreService {
  private readonly batchUrl = `<batchApi>/dealers/partstore_ext`;

  constructor(private http: HttpClient) {
  }

  public getCustomerInformation(params: CustomerParams): Observable<CustomerInformation> {
    return this.http.post<CommonResponse<CustomerInformation>>(
      `${ this.batchUrl }/getCustomerInformation`,
      params,
      { observe: 'body' }
    ).pipe(map(res => res.return));
  }

  public getPartsInformation(params: PartsParams): Observable<PartInformation[]> {
    return this.http.post<PartInformation[]>(
      `${ this.batchUrl }/getPartsAvailInformation`,
      params,
      { observe: 'body' }
    );
  }

  public getDiscountTaxInformation(params: DiscountTaxParams): Observable<DiscountTaxInformation> {
    return this.http.post<CommonResponse<DiscountTaxInformation>>(
      `${ this.batchUrl }/getDocDiscTaxInfo`,
      params,
      { observe: 'body' }
    ).pipe(map(res => res.return));
  }

  public getCATonHand(params: CatPartParams[]): Observable<CatPart[]> {
    return this.http.post<CatPart[]>(
      `${ this.batchUrl }/getCATonHand`,
      { parts: params },
      { observe: 'body' }
    );
  }
}
