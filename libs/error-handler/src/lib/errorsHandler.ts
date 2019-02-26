import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ErrorsHandler implements ErrorHandler {
  handleError(error: Error) {
    if (error instanceof HttpErrorResponse) {
      // Server or connection error happened
      if (!navigator.onLine) {
        // Handle offline error
      } else {
        switch (error.status) {
          case 404:
            console.error('URL_NOT_FOUND: ', error.url);
            break;
          case 500:
            console.error('INTERNAL_SERVER_ERROR: ', error.url);
            break;
        }
        // Handle Http Error (error.status === 403, 404...)
      }
    } else {
      // Handle Client Error (Angular Error, ReferenceError...)
    }
    console.error('It happens: ', error);
  }
}
