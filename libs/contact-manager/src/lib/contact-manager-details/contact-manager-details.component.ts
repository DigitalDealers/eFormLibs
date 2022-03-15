import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ContactManagerService } from '../contact-manager.service';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
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
  styleUrls: ['./contact-manager-details.component.scss']
})
export class ContactManagerDetailsComponent implements OnInit, OnDestroy {
  public readonly addToPortalMode = ManageMode.addToPortal;
  public readonly editMode = ManageMode.edit;
  public user?: PortalUser;
  public addNew: boolean;
  public manageMode = ManageMode.addToPortal;
  public contactManagerValue: ContactManager;
  public customer?: PortalUser;
  public contactManager: ContactManagerSearchResult;

  private loadUserSub?: Subscription;

  constructor(
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
    this.addNew = !!this.data.addNew;
  }

  public ngOnInit(): void {
    this.loadPortalUser();
  }

  public ngOnDestroy(): void {
    this.loadUserSub?.unsubscribe();
  }

  private loadPortalUser() {
    if (this.data.contactManager.PortalUserId) {
      this.loadUserSub?.unsubscribe();
      this.loadUserSub = this.contactManagerService.getUser(this.data.contactManager.PortalUserId.split('|')[0])
        .pipe(
          catchError(() => of({ companyName: '', customerNumber: '', phone: '', email: '', fName: '', lName: '', type: '' } as PortalUser))
        )
        .subscribe(user => this.user = user);
    }
  }
}
