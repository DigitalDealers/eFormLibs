import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

@Injectable()
export class ServerErrorsIntercepter implements HttpInterceptor {
  constructor() {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    return next.handle(request).pipe(retry(5));
  }
}
