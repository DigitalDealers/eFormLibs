import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { BaseUrlInterceptor } from './base-url.interceptor';
import { DeleteResponseInterceptor } from './delete-response.interceptor';
import { ModuleOptions } from './module-options.interface';
import { OPTIONS } from './options';
import { PaginationInterceptor } from './pagination.interceptor';
import { TokenInterceptor } from './token.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor, multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DeleteResponseInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BaseUrlInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PaginationInterceptor,
      multi: true
    }
  ]
})
export class DidiInterceptorsModule {
  static forRoot(host: ModuleOptions) {
    return {
      ngModule: DidiInterceptorsModule,
      providers: [
        { provide: OPTIONS, useValue: host }
      ]
    };
  }
}
