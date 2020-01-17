import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CatPart,
  CatPartParams,
  CommonResponse,
  CustomerInformation,
  CustomerParams,
  DiscountTaxInformation,
  DiscountTaxParams,
  PartInformation,
  PartsParams
} from '@digitaldealers/typings';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PartStoreService {
  private readonly batchUrl = `<batchApi>/dealers/partstore_ext`;

  constructor(private http: HttpClient) {
  }

  public getCustomerInformation(params: CustomerParams): Observable<CustomerInformation> {
    return this.http.post<CommonResponse<CustomerInformation>>(
      `${this.batchUrl}/getCustomerInformation`,
      params,
      { observe: 'body' }
    ).pipe(map(res => res.return));
  }

  public getPartsInformation(params: PartsParams): Observable<PartInformation[]> {
    return this.http.post<PartInformation[]>(
      `${this.batchUrl}/getPartsAvailInformation`,
      params,
      { observe: 'body' }
    );
  }

  public getDiscountTaxInformation(params: DiscountTaxParams): Observable<DiscountTaxInformation> {
    return this.http.post<CommonResponse<DiscountTaxInformation>>(
      `${this.batchUrl}/getDocDiscTaxInfo`,
      params,
      { observe: 'body' }
    ).pipe(map(res => res.return));
  }

  public getCATonHand(params: CatPartParams[]): Observable<CatPart[]> {
    return this.http.post<CatPart[]>(
      `${this.batchUrl}/getCATonHand`,
      { parts: params },
      { observe: 'body' }
    );
  }
}
