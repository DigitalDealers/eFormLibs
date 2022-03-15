import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Self } from '@angular/core';
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
import {
  AccountNumberKey,
  ContactManagerSearchResult,
  ContactNameKey,
  isPortalUserKey,
  LegalEntityKey
} from '../shared/interfaces/contact-manager-search-result.interface';
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
export class ContactManagerListComponent implements OnInit, OnDestroy {
  @Input() searchResult: ContactManagerSearchResult[] = [];
  @Input() contactManager?: ContactManager;
  @Input() readOnly?: boolean;
  @Input() responsiveHeight?: boolean;

  public displayedColumns = ['UserAvatar', 'Contact Name', 'Email', 'Phone', 'SelectUser'];
  public columns: CdkCol[] = [];
  public isContactAdmin = false;
  public isCompanyAdmin = false;
  public activeContact?: ContactManagerSearchResult | null;
  public settings: ContactManagerSettings = { ...contactManagerDefaultSettings };

  private tokenLoadingSub?: Subscription;
  private customerLoading = false;

  constructor(
    @Self() private unsub: UnsubscribeService,
    private dialog: MatDialog,
    private auth: AuthApiService,
    private contactManagerService: ContactManagerService,
    private widgetObserverService: WidgetObserverService,
    private contactManagerDialog: ContactManagerDialogService,
    private security: SecurityService,
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<unknown>
  ) {
  }

  ngOnInit() {
    this.columns = [
      {
        columnDef: this.contactManager?.contactName || '',
        header: '',
        cell: (element: Element) => `${element[(this.contactManager?.contactName || '') as keyof Element]}`
      },
      {
        columnDef: this.contactManager?.email || '',
        header: '',
        cell: (element: Element) => `${element[(this.contactManager?.email || '') as keyof Element]}`
      },
      {
        columnDef: this.contactManager?.phone || '',
        header: '',
        cell: (element: Element) => `${element[(this.contactManager?.phone || '') as keyof Element]}`
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
        filter(data => data
          && data.value
          && data.context === WidgetObserverService.contexts.SET_CONTACT_MANAGER_SETTINGS)
      )
      .subscribe(data => {
        this.settings = { ...this.settings, ...(data as WidgetEmitData).value };
      });

    this.displayedColumns = this.columns.map(column => column.columnDef);
    this.displayedColumns.push('SelectUser');
    this.displayedColumns.unshift('UserAvatar');
  }

  public ngOnDestroy(): void {
    this.tokenLoadingSub?.unsubscribe();
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
    this.contactManagerService.getCustomersByUser(searchItem.PortalUserId || '', new HttpParams().set('limit', '1').set('offset', '0'))
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
        customerName: searchItem[(this.contactManager?.contactName || '') as keyof ContactManagerSearchResult],
        dataSetId: this.contactManager?.dataSetId,
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

  toggleSelectContact(searchItem: ContactManagerSearchResult, event: Event) {
    if (ContactManagerUtilsService.closestByClassName(event.target as HTMLElement, 'action-wrapper') || this.settings.disableSelectEvent) {
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
    this.tokenLoadingSub?.unsubscribe();
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
    this.tokenLoadingSub?.unsubscribe();
    const email = this.activeContact?.[(this.contactManager?.email || '') as keyof ContactManagerSearchResult] as string || '';
    this.tokenLoadingSub = this.auth.getCommCentreUser(email)
      .subscribe(res => {
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
    const userToUpdate = this.searchResult.find(result =>
      result.PortalUserId === (user.id as number).toString() ||
      result[(this.contactManager?.email || '') as keyof ContactManagerSearchResult] === user.email
    );

    if (userToUpdate && this.contactManager) {
      userToUpdate.items = user.items;
      userToUpdate[this.contactManager.isPortalUser as isPortalUserKey] = 'Yes';
      userToUpdate[this.contactManager.contactName as ContactNameKey] = `${user.fName} ${user.lName}`;
      userToUpdate[this.contactManager.accountNumber as AccountNumberKey] = user.customerNumber || userToUpdate.accountNumber;
      userToUpdate[this.contactManager.legalEntity as LegalEntityKey] =
        user.legalEntity || userToUpdate[this.contactManager.legalEntity as LegalEntityKey];
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
