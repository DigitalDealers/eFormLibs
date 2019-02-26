import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginationIntercepter implements HttpInterceptor {
  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(map(this._mapHandler));
  }

  private _mapHandler = (event: any) => {
    const { headers, body } = event;
    if (event instanceof HttpResponse && headers.has('X-Total-Count')) {
      const total = +headers.get('X-Total-Count');
      event = event.clone({ body: { total, data: body } });
    }
    return event;
  }
}
