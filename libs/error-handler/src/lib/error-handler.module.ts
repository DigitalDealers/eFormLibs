import { NgModule, ErrorHandler } from '@angular/core';

import { ErrorsHandler } from './errors-handler';

@NgModule({
  providers: [{ provide: ErrorHandler, useClass: ErrorsHandler }]
})
export class DidiErrorHandlerModule {}
