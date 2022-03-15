import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit, Self } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { AssociatedContactsComponent } from '../associated-contacts/associated-contacts.component';
import { ContactManagerDetailsComponent } from '../contact-manager-details/contact-manager-details.component';
import { ManageMode } from '../contact-manager-details/manage-mode.enum';
import { ContactManagerDialogService } from '../contact-manager-dialog/contact-manager-dialog.service';
import { ContactManagerService } from '../contact-manager.service';
import { InviteContactManagerComponent } from '../invite-contact-manager/invite-contact-manager.component';
import { contactManagerDefaultSettings } from '../shared/contact-manager-default-settings.constant';
import { animations } from '../shared/fade.animation';
import { CommCentreUser } from '../shared/interfaces/comm-centre-user.interface';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManagerSettings } from '../shared/interfaces/contact-manager-settings.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
import { WidgetEmitData } from '../shared/interfaces/widget-emit-data.interface';
import { DidiRole } from '../shared/roles.enum';
import { AuthApiService } from '../shared/services/auth-api.service';
import { ContactManagerUtilsService } from '../shared/services/contact-manager.utils.service';
import { SecurityService } from '../shared/services/security.service';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';
import { WidgetObserverService } from '../shared/services/widget-observer.service';

interface CdkCol {
  columnDef: string;
  header: string;
  cell: Function;
}

@Component({
  selector: 'didi-contact-manager-list',
  templateUrl: './contact-manager-list.component.html',
  styleUrls: ['./contact-manager-list.component.scss'],
  animations: [...animations],
  providers: [UnsubscribeService]
})
export class ContactManagerListComponent implements OnInit {
  @Input() searchResult: ContactManagerSearchResult[] = [];
  @Input() contactManager: ContactManager;
  @Input() readOnly: boolean;
  @Input() responsiveHeight: boolean;
  tokenLoadingSub: Subscription;
  displayedColumns: string[] = ['UserAvatar', 'Contact Name', 'Email', 'Phone', 'SelectUser'];
  columns: CdkCol[] = [];
  customerLoading: boolean;
  isContactAdmin: boolean;
  isCompanyAdmin: boolean;
  activeContact: ContactManagerSearchResult;
  settings: ContactManagerSettings = {
    ...contactManagerDefaultSettings
  };

  constructor(
    @Self() private unsub: UnsubscribeService,
    private dialog: MatDialog,
    private auth: AuthApiService,
    private contactManagerService: ContactManagerService,
    private widgetObserverService: WidgetObserverService,
    private contactManagerDialog: ContactManagerDialogService,
    private security: SecurityService,
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<void>
  ) {
  }

  ngOnInit() {
    this.columns = [
      {
        columnDef: this.contactManager.contactName,
        header: '',
        cell: (element: Element) => `${element[this.contactManager.contactName]}`
      },
      {
        columnDef: this.contactManager.email,
        header: '',
        cell: (element: Element) => `${element[this.contactManager.email]}`
      },
      {
        columnDef: this.contactManager.phone,
        header: '',
        cell: (element: Element) => `${element[this.contactManager.phone]}`
      }
    ];
    this.unsub.subs = this.security.getUserRoles().subscribe((roles: string[]) => {
      this.isContactAdmin = roles.indexOf(DidiRole.CONTACT_ADMIN) >= 0;
      this.isCompanyAdmin = roles.indexOf(DidiRole.COMPANY_ADMINISTRATOR) >= 0;
    });

    this.unsub.subs = this.widgetObserverService.widget$
      .subscribe((data: WidgetEmitData) => {
        switch (data.context) {
          case WidgetObserverService.contexts.CONTACT_MANAGER_UPDATED:
          case WidgetObserverService.contexts.CONTACT_MANAGER_ADDED:
            this.updateUserData(data.value);
            break;
          default:
            break;
        }
      });

    this.unsub.subs = this.widgetObserverService.widget$
      .pipe(
        filter((data: WidgetEmitData) => {
          return data.context === WidgetObserverService.contexts.CONTACT_MANAGER_NEW_SEARCH;
        })
      ).subscribe(() => {
        if (this.activeContact) {
          this.activeContact = null;
        }
      });

    this.unsub.subs = this.widgetObserverService.widgetBehaviour$
      .pipe(
        filter((data: WidgetEmitData) => data
          && data.value
          && data.context === WidgetObserverService.contexts.SET_CONTACT_MANAGER_SETTINGS)
      )
      .subscribe((data: WidgetEmitData) => {
        this.settings = { ...this.settings, ...data.value };
      });

    this.displayedColumns = this.columns.map(column => column.columnDef);
    this.displayedColumns.push('SelectUser');
    this.displayedColumns.unshift('UserAvatar');
  }

  editContactManager(searchItem: ContactManagerSearchResult) {
    this.contactManagerDialog.openDialog({
      componentRef: ContactManagerDetailsComponent,
      data: {
        contactManager: searchItem,
        contactManagerValue: this.contactManager,
        initialMode: ManageMode.edit
      },
      prevDialogRef: this.readOnly ? this.dialogRef : null,
      disableAnimation: this.readOnly
    });
  }

  openInviteModal(searchItem: ContactManagerSearchResult) {
    if (this.customerLoading) {
      return;
    }
    this.customerLoading = true;
    this.contactManagerService.getCustomersByUser(searchItem.PortalUserId, new HttpParams().set('limit', '1').set('offset', '0'))
      .pipe(
        tap((customers: PortalUser[]) => {
          this.contactManagerDialog.openDialog({
            componentRef: InviteContactManagerComponent,
            data: {
              contactManager: searchItem,
              contactManagerValue: this.contactManager,
              customer: customers[0]
            },
            prevDialogRef: this.readOnly ? this.dialogRef : null,
            disableAnimation: this.readOnly
          });
          setTimeout(() => this.customerLoading = false);
        })
      ).subscribe();
  }

  openAssociatedContacts(searchItem: ContactManagerSearchResult) {
    this.contactManagerDialog.openDialog({
      componentRef: AssociatedContactsComponent,
      data: {
        accountNumber: searchItem.accountNumber,
        customerName: searchItem[this.contactManager.contactName],
        dataSetId: this.contactManager.dataSetId,
        userId: searchItem.PortalUserId,
        contactManagerValue: this.contactManager
      },
      prevDialogRef: this.readOnly ? this.dialogRef : null,
      disableAnimation: this.readOnly
    });
  }

  addContactManager(searchItem: ContactManagerSearchResult) {
    this.contactManagerDialog.openDialog({
      componentRef: ContactManagerDetailsComponent,
      data: {
        contactManager: searchItem,
        contactManagerValue: this.contactManager,
        initialMode: ManageMode.addToPortal
      },
      prevDialogRef: this.readOnly ? this.dialogRef : null,
      disableAnimation: this.readOnly
    });
  }

  toggleSelectContact(searchItem: ContactManagerSearchResult, event) {
    if (ContactManagerUtilsService.closestByClassName(event.target, 'action-wrapper') || this.settings.disableSelectEvent) {
      return;
    }
    if (!this.contactManager) {
      return;
    }
    if (!this.activeContact || this.activeContact.PortalUserId !== searchItem.PortalUserId) {
      this.activeContact = searchItem;
    } else {
      this.activeContact = null;
    }

    if (this.activeContact) {
      this.widgetObserverService.emit({
        context: WidgetObserverService.contexts.SELECT_CONTACT_MANAGER,
        value: {
          item: { ...searchItem },
          contactManagerSettings: this.contactManager
        }
      });
      if (ContactManagerDialogService.hasTopLevelModal() && this.readOnly) {
        this.dialogRef.close();
      }
      if (this.readOnly) {
        return;
      }
      this.loadUserToken();
      return;
    }
    if (this.tokenLoadingSub) {
      this.tokenLoadingSub.unsubscribe();
    }
    this.widgetObserverService.emit({
      context: WidgetObserverService.contexts.DESELECT_CONTACT_MANAGER,
      value: {
        item: { ...searchItem },
        contactManagerSettings: this.contactManager
      }
    });
  }

  getPortalUserEmail(searchItem: ContactManagerSearchResult) {
    return searchItem && searchItem.Email;
  }

  private loadUserToken() {
    if (this.tokenLoadingSub) {
      this.tokenLoadingSub.unsubscribe();
    }

    const email = this.activeContact[this.contactManager.email];

    this.unsub.subs = this.tokenLoadingSub = this.auth.getCommCentreUser(this.contactManager.dataSetId, email)
      .pipe(
        filter(Boolean)
      )
      .subscribe((res: CommCentreUser) => {
        this.widgetObserverService.emit({
          context: WidgetObserverService.contexts.COMM_USER_DATA_READY,
          value: {
            token: res.token,
            email
          }
        });
      });
  }

  private updateUserData(user: PortalUser) {
    const userToUpdate = this.searchResult.find((result: ContactManagerSearchResult) => {
      return result.PortalUserId === String(user.id) || result[this.contactManager.email] === String(user.email);
    });
    if (userToUpdate) {
      userToUpdate.items = user.items;
      userToUpdate[this.contactManager.isPortalUser] = 'Yes';
      userToUpdate[this.contactManager.contactName] = `${user.fName} ${user.lName}`;
      userToUpdate[this.contactManager.accountNumber] = user.customerNumber || userToUpdate.accountNumber;
      userToUpdate[this.contactManager.legalEntity] = user.legalEntity || userToUpdate[this.contactManager.legalEntity];
      userToUpdate.Phone = user.phone || userToUpdate.Phone;
      userToUpdate.Email = user.email || userToUpdate.Email;
      userToUpdate.PortalUserId = `${user.id}`;
      this.searchResult = this.searchResult.map((result: ContactManagerSearchResult) => {
        if (result.PortalUserId === String(user.id)) {
          return { ...userToUpdate };
        }
        return result;
      });

      if (this.activeContact && userToUpdate) {
        this.widgetObserverService.emit({
          context: WidgetObserverService.contexts.SELECT_CONTACT_MANAGER,
          value: {
            item: { ...userToUpdate },
            contactManagerSettings: this.contactManager
          }
        });
      }

      this.cd.markForCheck();
      this.cd.detectChanges();
    }
  }
}
