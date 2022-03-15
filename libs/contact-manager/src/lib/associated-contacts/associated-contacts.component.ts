import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit, Self, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { of, Subscription } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { ContactManagerDetailsComponent } from '../contact-manager-details/contact-manager-details.component';
import { ManageMode } from '../contact-manager-details/manage-mode.enum';
import { ContactManagerDialogService } from '../contact-manager-dialog/contact-manager-dialog.service';
import { ContactManagerService } from '../contact-manager.service';
import { animations } from '../shared/fade.animation';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
import { EntitiesService } from '../shared/services/entities.service';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';

interface AssociatedContactsData {
  accountNumber: string;
  dataSetId: number;
  contactManagerValue: ContactManager;
  userId: string;
  customerName: string;
}

@Component({
  selector: 'didi-associated-contacts',
  templateUrl: './associated-contacts.component.html',
  styleUrls: ['./associated-contacts.component.scss'],
  animations: [...animations],
  providers: [UnsubscribeService]
})
export class AssociatedContactsComponent implements OnInit {
  @ViewChild('ps', { static: true }) ps: PerfectScrollbarDirective;
  associatedContactsLoading: boolean;
  associatedContacts: ContactManagerSearchResult[] = [];
  contactManagerValue: ContactManager;
  customerName: string;
  hasNextData: boolean;
  loadingSub: Subscription;
  currentCustomer: PortalUser;
  customerLoading: boolean;
  params = new HttpParams()
    .set('limit', '20')
    .set('offset', '0')
    .set('lite', 'true');

  constructor(
    @Self() private unsub: UnsubscribeService,
    private entitiesService: EntitiesService,
    private cd: ChangeDetectorRef,
    private contactManagerDialog: ContactManagerDialogService,
    private contactManagerService: ContactManagerService,
    private dialogRef: MatDialogRef<void>,
    @Inject(MAT_DIALOG_DATA) public data: AssociatedContactsData
  ) {
    this.contactManagerValue = data.contactManagerValue;
    this.customerName = data.customerName;
  }

  ngOnInit() {
    this.loadAssociatedContacts();
    this.unsub.subs = this.loadCustomer().subscribe();
  }

  loadNext() {
    if (this.associatedContactsLoading || !this.hasNextData) {
      return;
    }
    this.loadAssociatedContacts(false);
  }

  loadAssociatedContacts(reset: boolean = true) {
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
    this.associatedContactsLoading = true;
    if (reset) {
      this.setParams({ offset: 0 });
      this.hasNextData = true;
      this.ps.scrollToTop();
    } else {
      const currentOffset = Number(this.params.get('offset'));
      this.setParams({
        offset: currentOffset + Number(this.params.get('limit'))
      });
    }
    this.detectScrollChanges();
    this.unsub.subs = this.entitiesService.getAssociatedContacts(this.data.accountNumber, this.data.dataSetId, this.params)
      .pipe(
        map((res: ContactManagerSearchResult[]) => res
          .filter((contact: ContactManagerSearchResult) => contact.PortalUserId !== this.data.userId)),
        finalize(() => {
          this.associatedContactsLoading = false;
        })
      )
      .subscribe((res: ContactManagerSearchResult[]) => {
        if (!res.length) {
          this.hasNextData = false;
        }
        if (reset) {
          this.associatedContacts = res || [];
        } else {
          this.associatedContacts = [...this.associatedContacts, ...res];
        }
        setTimeout(() => this.detectScrollChanges());
      });
  }

  addUser() {
    if (this.customerLoading) {
      return;
    }
    this.customerLoading = true;
    this.loadCustomer()
      .pipe(
        tap((customers: PortalUser[]) => {
          this.contactManagerDialog.openDialog({
            componentRef: ContactManagerDetailsComponent,
            data: {
              contactManager: {
                [this.contactManagerValue.legalEntity]: customers[0] ? customers[0].legalEntity : null
              },
              customer: customers[0],
              contactManagerValue: this.contactManagerValue,
              initialMode: ManageMode.addToPortal,
              addNew: true
            },
            prevDialogRef: this.dialogRef,
            disableAnimation: true
          });
          setTimeout(() => this.customerLoading = false);
        })
      ).subscribe();
  }

  private setParams(params: { [key: string]: string | number }) {
    const newParams = {};
    this.params.keys().forEach((key: string) => {
      if (params[key] !== null && params[key] !== undefined) {
        newParams[key] = params[key].toString();
      } else {
        newParams[key] = this.params.get(key);
      }
    });
    this.params = new HttpParams({ fromObject: newParams });
  }

  private detectScrollChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
    this.ps.update();
  }

  private loadCustomer() {
    if (this.currentCustomer || this.currentCustomer === null) {
      return of([this.currentCustomer]);
    }
    return this.contactManagerService
      .getCustomersByUser(this.data.userId, new HttpParams().set('limit', '1').set('offset', '0'))
      .pipe(
        tap((customers: PortalUser[]) => {
          this.currentCustomer = customers[0] || null;
        })
      );
  }
}
