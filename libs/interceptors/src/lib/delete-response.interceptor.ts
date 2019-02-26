import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class DeleteResponseInterceptor implements HttpInterceptor {
  constructor() {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.method === 'DELETE') {
      request = request.clone({
        responseType: 'text'
      });
    }
    return next.handle(request);
  }
}
