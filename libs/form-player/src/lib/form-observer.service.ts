import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class FormObserverService {
  private formSource = new Subject<any>();
  public form$ = this.formSource.asObservable();

  constructor() {}

  public emit(data) {
    this.formSource.next(data);
  }
}
