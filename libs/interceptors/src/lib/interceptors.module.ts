import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ToastrModule } from 'ngx-toastr';

import { TokenInterceptor } from './token.interceptor';
import { DeleteResponseInterceptor } from './delete-response.interceptor';
import { BaseUrlInterceptor } from './base-url.interceptor';
import { PaginationIntercepter } from './pagination.intercepter';
import { ServerErrorsIntercepter } from './server-errors.intercepter';
import { OPTIONS } from './options';
import { ModuleOptions } from './module-options';

@NgModule({
  imports: [CommonModule, ToastrModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
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
      useClass: PaginationIntercepter,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorsIntercepter,
      multi: true
    }
  ]
})
export class DidiInterceptorsModule {
  static forRoot(host: ModuleOptions) {
    return {
      ngModule: DidiInterceptorsModule,
      providers: [
        {
          provide: OPTIONS,
          useValue: host
        }
      ]
    };
  }
}
