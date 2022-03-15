import { ChangeDetectorRef, Component, Inject, OnInit, Self } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { filter, finalize, mergeMap, tap } from 'rxjs/operators';

import { ContactManagerDetailsComponent } from '../contact-manager-details/contact-manager-details.component';
import { ManageMode } from '../contact-manager-details/manage-mode.enum';
import { ContactManagerDialogService } from '../contact-manager-dialog/contact-manager-dialog.service';
import { ContactManagerService } from '../contact-manager.service';
import { contactManagerDefaultSettings } from '../shared/contact-manager-default-settings.constant';
import { animations } from '../shared/fade.animation';
import { ContactGaEvent } from '../shared/interfaces/contact-ga-event.interface';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManagerSettings } from '../shared/interfaces/contact-manager-settings.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
import { WidgetEmitData } from '../shared/interfaces/widget-emit-data.interface';
import { ConfigService } from '../shared/services/config.service';
import { GoogleAnalyticsEventsService } from '../shared/services/google-analytics.service';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';
import { WidgetObserverService } from '../shared/services/widget-observer.service';

interface InviteUserData {
  contactManager: ContactManagerSearchResult;
  contactManagerValue: ContactManager;
  customer: PortalUser;
}

@Component({
  selector: 'didi-invite-contact-manager',
  templateUrl: './invite-contact-manager.component.html',
  styleUrls: ['./invite-contact-manager.component.scss'],
  animations: [...animations],
  providers: [UnsubscribeService]
})
export class InviteContactManagerComponent implements OnInit {
  fullName: string;
  email: string;
  inviting: boolean;
  invited: boolean;
  noCustomer: boolean;
  confirmInvite = true;
  moduleTitle: string;

  constructor(
    @Self() private unsub: UnsubscribeService,
    private contactManager: ContactManagerService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<void>,
    private cd: ChangeDetectorRef,
    private contactManagerDialog: ContactManagerDialogService,
    private widgetObserverService: WidgetObserverService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService,
    private config: ConfigService,
    private widgetObserver: WidgetObserverService,
    @Inject(MAT_DIALOG_DATA) public data: InviteUserData
  ) {
    this.fullName = this.data.contactManager[this.data.contactManagerValue.contactName];
    this.email = this.data.contactManager[this.data.contactManagerValue.email];
    if (!this.data.customer) {
      this.noCustomer = true;
      this.confirmInvite = false;
    }
  }

  ngOnInit() {
    this.cd.reattach();
    this.unsub.subs = this.widgetObserverService.widgetBehaviour$
      .pipe(
        filter((data: WidgetEmitData) => data
          && data.value
          && data.context === WidgetObserverService.contexts.SET_CONTACT_MANAGER_SETTINGS)
      )
      .subscribe((data: WidgetEmitData) => {
        const settings: ContactManagerSettings = data.value;
        this.moduleTitle = settings.moduleTitle;
      });
  }

  viewProfile() {
    this.contactManagerDialog.openDialog({
      componentRef: ContactManagerDetailsComponent,
      data: {
        contactManager: this.data.contactManager,
        contactManagerValue: this.data.contactManagerValue,
        initialMode: ManageMode.edit
      },
      prevDialogRef: this.dialogRef,
      disableAnimation: true
    });
  }

  send() {
    this.confirmInvite = false;
    this.inviting = true;
    this.unsub.subs = this.contactManager
      .inviteUser(this.data.contactManager, this.data.contactManagerValue, this.data.customer)
      .pipe(
        mergeMap(() => this.contactManager
          .sendDataToNotificationHub(this.data.contactManager, this.data.contactManagerValue, this.data.customer)),
        tap(() => {
          const fullNameKey = Object.keys(this.config.tokenData || {}).find((key: string) => key.includes('fullName'));
          const dealerIdKey = Object.keys(this.config.tokenData || {}).find((key: string) => !!key.match(/dealerId/i));
          let userName = fullNameKey && this.config.tokenData[fullNameKey] || null;
          let dealerId = dealerIdKey && this.config.tokenData[dealerIdKey] || null;
          this.googleAnalyticsEventsService.emitGtagEvent$.next({
            ...GoogleAnalyticsEventsService.getInviteEvent(),
            dealerId,
            eventCategory: this.moduleTitle || contactManagerDefaultSettings.moduleTitle,
            userName,
            invitedUser: this.data.contactManager[this.data.contactManagerValue.contactName]
          } as ContactGaEvent);
        }),
        finalize(() => this.inviting = false)
      )
      .subscribe(() => {
        this.invited = true;
        this.widgetObserver.emit({
          context: WidgetObserverService.contexts.CONTACT_MANAGER_INVITED,
          value: this.data.contactManager.PortalUserId
        });
      });
  }
}
