import { Component, EventEmitter, Inject, OnInit, Output, Self, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ContactManagerService } from '../contact-manager.service';
import { ManageDetailsComponent } from '../manage-details/manage-details.component';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';
import { ManageMode } from './manage-mode.enum';

interface ContactManagerDetailsData {
  contactManager: ContactManagerSearchResult;
  contactManagerValue: ContactManager;
  customer: PortalUser;
  initialMode?: ManageMode;
  addNew?: boolean;
}

@Component({
  selector: 'didi-contact-manager-details',
  templateUrl: './contact-manager-details.component.html',
  styleUrls: ['./contact-manager-details.component.scss'],
  providers: [UnsubscribeService]
})
export class ContactManagerDetailsComponent implements OnInit {
  @ViewChild('details', { static: false }) manageDetails: ManageDetailsComponent;
  @Output() back: EventEmitter<void> = new EventEmitter();
  user: PortalUser;
  addNew: boolean;
  manageMode: ManageMode = ManageMode.addToPortal;
  loadUserSub: Subscription;
  contactManagerValue: ContactManager;
  customer: PortalUser;
  contactManager: ContactManagerSearchResult;
  readonly addToPortalMode = ManageMode.addToPortal;
  readonly editMode = ManageMode.edit;

  constructor(
    @Self() private unsub: UnsubscribeService,
    private contactManagerService: ContactManagerService,
    @Inject(MAT_DIALOG_DATA) public data: ContactManagerDetailsData
  ) {
    this.contactManagerValue = data.contactManagerValue;
    this.contactManager = data.contactManager;
    if (this.data.initialMode || this.data.initialMode === ManageMode.addToPortal) {
      this.manageMode = this.data.initialMode;
    }
    if (this.data.initialMode === ManageMode.addToPortal) {
      this.customer = data.customer;
    }
    this.addNew = this.data.addNew;
  }

  ngOnInit() {
    this.loadPortalUser();
  }

  editContactManager() {
    this.loadPortalUser();
    this.manageMode = ManageMode.edit;
  }

  private loadPortalUser() {
    if (this.loadUserSub) {
      this.loadUserSub.unsubscribe();
    }

    if (this.data.contactManager.PortalUserId) {
      this.unsub.subs = this.loadUserSub = this.contactManagerService.getUser(this.data.contactManager.PortalUserId.split('|')[0])
        .pipe(
          catchError(() => {
            return of({ companyName: '', customerNumber: '', phone: '', email: '', fName: '', lName: '', type: '' });
          })
        )
        .subscribe((user: PortalUser) => {
          this.user = user;
        });
    }
  }
}
