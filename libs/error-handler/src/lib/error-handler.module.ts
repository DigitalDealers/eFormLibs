import { NgModule, ErrorHandler } from '@angular/core';

import { ErrorsHandler } from './errorsHandler';

@NgModule({
  providers: [{ provide: ErrorHandler, useClass: ErrorsHandler }]
})
export class DidiErrorHandlerModule {}
