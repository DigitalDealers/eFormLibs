import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { WidgetEmitData } from '../interfaces/widget-emit-data.interface';

@Injectable()
export class WidgetObserverService {
  public static contexts = {
    TWILIO_MESSAGE: 'twilioMessage',
    COMM_USER_DATA_READY: 'commUserDataReady',
    SELECT_CONTACT_MANAGER: 'selectContactManager',
    DESELECT_CONTACT_MANAGER: 'deselectContactManager',
    SEARCH_CONTACT_MANAGER: 'searchContactManager',
    SET_CONTACT_MANAGER_SETTINGS: 'setContactManagerSettings',
    COMM_USER_TOKEN_UPDATE: 'commUserTokenUpdate',
    CONTACT_MANAGER_NEW_SEARCH: 'contactManagerNewSearch',
    CONTACT_MANAGER_UPDATED: 'contactManagerUpdated',
    CONTACT_MANAGER_ADDED: 'contactManagerAdded',
    CONTACT_MANAGER_ADDED_NEW: 'contactManagerAddedNew',
    CONTACT_MANAGER_DELETED: 'contactManagerDeleted',
    CONTACT_MANAGER_INVITED: 'contactManagerInvited'
  };
  private widgetSource = new Subject<WidgetEmitData>();
  public widget$ = this.widgetSource.asObservable();
  private widgetBehaviourSource = new BehaviorSubject<WidgetEmitData | null>(null);
  public widgetBehaviour$ = this.widgetBehaviourSource.asObservable();

  public emit(data: WidgetEmitData) {
    this.widgetSource.next(data);
  }

  public emitBehaviourEvent(data: WidgetEmitData) {
    this.widgetBehaviourSource.next(data);
  }
}
