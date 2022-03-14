import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DeleteResponseInterceptor implements HttpInterceptor {
  constructor() {
  }

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.method === 'DELETE') {
      request = request.clone({
        responseType: 'text'
      });
    }
    return next.handle(request);
  }
}
