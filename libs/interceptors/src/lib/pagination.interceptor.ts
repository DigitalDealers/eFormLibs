import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginationInterceptor implements HttpInterceptor {
  private static mapHandler(event: HttpEvent<unknown>) {
    if (event instanceof HttpResponse && event.headers.has('X-Total-Count')) {
      const total = +(event.headers.get('X-Total-Count') || '0');
      event = event.clone({ body: { total, data: event.body } });
    }
    return event;
  }

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(map(PaginationInterceptor.mapHandler));
  }
}
