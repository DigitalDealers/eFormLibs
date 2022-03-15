import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Self,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import uniqBy from 'lodash-es/uniqBy';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { combineLatest, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, mapTo, mergeMap, startWith } from 'rxjs/operators';

import { ManageMode } from '../contact-manager-details/manage-mode.enum';
import { ContactManagerService } from '../contact-manager.service';
import { animations } from '../shared/fade.animation';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
import { Role } from '../shared/interfaces/role.interface';
import { DidiRole } from '../shared/roles.enum';
import { AuthApiService } from '../shared/services/auth-api.service';
import { ConfigService } from '../shared/services/config.service';
import { SecurityService } from '../shared/services/security.service';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';
import { UserAvatarService } from '../shared/services/user-avatar.service';
import { WidgetObserverService } from '../shared/services/widget-observer.service';
import { ManageDetailsMapService } from './map.service';
import { emailDuplicateAsyncValidator, emailValidator } from './validators.service';

const inputDebounce = 150;

@Component({
  selector: 'didi-manage-details',
  templateUrl: './manage-details.component.html',
  styleUrls: ['./manage-details.component.scss'],
  animations: [...animations],
  providers: [UnsubscribeService]
})
export class ManageDetailsComponent implements OnChanges, OnInit {
  @ViewChild('customersPs', { static: true }) customersPs: PerfectScrollbarDirective;
  @ViewChild('rolesInput', { static: false }) rolesInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoRoles', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('legalEntityInput', { static: false }) legalEntityInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger, { static: false }) matAutocompleteTrigger: MatAutocompleteTrigger;
  @Input() mode: ManageMode;
  @Input() user: PortalUser;
  @Input() customer: PortalUser;
  @Input() contactManager: ContactManagerSearchResult;
  @Input() addNew: boolean;
  @Input() contactManagerValue: ContactManager;
  blurSubject: Subject<void> = new Subject<void>();
  editMode: ManageMode = ManageMode.edit;
  addMode: ManageMode = ManageMode.addToPortal;
  isCustomer: boolean;
  loading: boolean;
  viewProfileLoading: boolean;
  savingChanges: boolean;
  deletingUser: boolean;
  creatingUser: boolean;
  confirmDelete: boolean;
  detailsUpdated: boolean;
  userCreated: boolean;
  userDeleted: boolean;
  dataLoading: boolean;
  rolesOpened: boolean;
  customersOpened: boolean;
  customersLoading: boolean;
  hasNextCustomersData: boolean;
  userDetailsForm: FormGroup;
  roleForm: FormGroup;
  customerForms: FormArray;
  linkedCustomers: PortalUser[] = [];
  availableCustomers: PortalUser[] = [];
  allAvailableCustomers: PortalUser[] = [];
  selectedCustomers: string[] = [];
  legalEntities: string[] = [];
  roles: Role[] = [];
  linkedRoles: Role[] = [];
  filteredLegalEntities$: Observable<string[]>;
  legalEntityPushSubject: Subject<string> = new Subject<string>();
  filteredRoles$: Observable<Role[]> = of([]);
  customerNumberChangesSub: Subscription;
  customerFormChangesSub: Subscription;
  roleFormChangeSub: Subscription;
  addingCustomerToThePortal: number;
  selectedLe: string;
  readonly userType = 'Customer';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private params = ManageDetailsComponent.getCustomerSearchParams();

  private static getCustomerSearchParams() {
    return new HttpParams().set('limit', '25').set('offset', '0');
  }

  // Fix change detection, when open nested modal with perfect scroll bar
  @HostListener('click') globalClick() {
    setTimeout(() => {
      this.zone.run(() => {
      });
    });
  }

  @HostBinding('class.processing-manage')
  public get processing() {
    const saveProcess = this.savingChanges || this.detailsUpdated;
    const createProcess = this.creatingUser || this.userCreated;
    const deleteProcess = this.confirmDelete || this.deletingUser || this.userDeleted;
    return saveProcess || createProcess || deleteProcess;
  }

  constructor(
    @Self() private unsub: UnsubscribeService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private dialog: MatDialog,
    private authApi: AuthApiService,
    private dialogRef: MatDialogRef<void>,
    private widgetObserver: WidgetObserverService,
    private snackBar: MatSnackBar,
    private security: SecurityService,
    private config: ConfigService,
    private contactManagerService: ContactManagerService
  ) {
  }

  ngOnInit() {
    this.loadLinkedCustomers();
    this.loadCustomers({ firstLoad: true, reset: true });
    this.unsub.subs = this.blurSubject
      .pipe(
        debounceTime(inputDebounce)
      ).subscribe(() => {
        this.availableCustomers = [];
        this.params = this.params.set('offset', '0').set('text', '');
        this.loadCustomers({ firstLoad: false, reset: true });
      });
    this.legalEntities = this.contactManagerValue.legalEntities || [];

    this.roles = (this.contactManagerValue.roles || [])
      .filter((role: Role) => role.role.toLowerCase() !== this.userType.toLowerCase());
  }

  ngOnChanges(changes: SimpleChanges) {
    const modeChanged = changes.mode && changes.mode.currentValue !== changes.mode.previousValue;
    const userChanged = changes.user && changes.user.currentValue !== changes.user.previousValue;
    if (modeChanged || userChanged) {
      switch (this.mode) {
        case ManageMode.addToPortal:
          this.createForm(this.getUserDataForAdd());
          break;
        case ManageMode.edit:
          if (this.user) {
            this.createForm(this.getUserDataForEdit());
            this.loadContactManagerRoles(this.user.id);
            this.toggleDataLoading(false);
          } else {
            this.createForm(this.getUserDataForAdd());
            this.toggleDataLoading(true);
          }
          break;
        default:
          this.createForm(this.getEmptyFormData());
      }
      this.subscribeOnCustomerValueChange();
    }
  }

  onFocus(index: number) {
    this.unsub.subs = this.customerNumberChangesSub = this.customerForms.at(index).get('customerInfo')
      .valueChanges
      .pipe(
        filter(Boolean),
        debounceTime(inputDebounce),
        distinctUntilChanged()
      ).subscribe((query: string) => {
        this.params = this.params.set('offset', '0').set('text', query);
        this.loadCustomers({ firstLoad: false, reset: true });
      });
  }

  onBlur() {
    this.customersOpened = false;
    if (this.customerNumberChangesSub) {
      this.customerNumberChangesSub.unsubscribe();
    }
    this.blurSubject.next();
  }

  createForm(userData: PortalUser) {
    this.customerForms = new FormArray([]);
    this.userDetailsForm = this.fb.group({
      fName: [userData.fName, [Validators.required]],
      lName: [userData.lName, [Validators.required]],
      type: [userData.type],
      email: [
        {
          value: userData.email,
          disabled: this.mode === ManageMode.edit
        },
        [
          Validators.required,
          emailValidator
        ],
        this.mode === ManageMode.addToPortal
          ? [emailDuplicateAsyncValidator(this.contactManagerService)]
          : []
      ],
      phone: [userData.phone],
      legalEntity: [userData.legalEntity, [Validators.required]],
      entityId: [userData.entityId || null],
      locations: null,
      applications: null,
      picture: [userData.picture || null]
    });
    this.roleForm = this.fb.group({
      role: [''],
      roles: [[]]
    });
    if (this.roleFormChangeSub) {
      this.roleFormChangeSub.unsubscribe();
    }

    this.filteredRoles$ = this.roleForm.get('role').valueChanges
      .pipe(
        startWith(''),
        filter((value: string) => typeof value === 'string'),
        map((value: string) => {
          return this.roles.filter((role: Role) => role.role.toLowerCase().includes(value.toLowerCase()));
        })
      );

    this.addCustomerForm();
    this.addLinkedCustomersToForm();
    const emailControl = this.userDetailsForm.get('email');
    if (emailControl && emailControl.value) {
      emailControl.markAsTouched();
    }

    this.filteredLegalEntities$ = merge(
      this.userDetailsForm.get('legalEntity').valueChanges,
      this.legalEntityPushSubject
    ).pipe(
      startWith(''),
      map((value: string) => {
        const filterValue = (value || '').toLowerCase();
        return this.legalEntities.filter((le: string) => le.toLowerCase().includes(filterValue));
      })
    );

    this.unsub.subs = this.security.getUserRoles().subscribe((roles: string[]) => {
      this.isCustomer = roles.indexOf(DidiRole.CUSTOMER) >= 0;
      const tokenData = this.config.tokenData;
      const leKey = Object.keys(tokenData).find((key: string) => !!key.match(/\/le$/));
      if (leKey && this.isCustomer) {
        this.userDetailsForm.get('legalEntity').setValue(tokenData[leKey]);
      }
    });
  }

  addCustomerForm() {
    const newForm = this.getNewForm();
    this.customerForms.push(newForm);
    this.subscribeOnCustomerValueChange();
  }

  removeForm(index: number) {
    this.customerForms.removeAt(index);
    this.subscribeOnCustomerValueChange();
  }

  getNewForm() {
    return this.fb.group({
      customerNumber: ['', Validators.required],
      companyName: ['', Validators.required],
      customerInfo: '',
      id: ['']
    });
  }

  loadCustomers({ reset, firstLoad }: { reset: boolean; firstLoad: boolean; }) {
    if (reset) {
      this.params = this.params.set('offset', '0');
      this.hasNextCustomersData = true;
      if (this.customersPs) {
        this.customersPs.scrollToTop();
      }
    } else {
      const currentOffset = Number(this.params.get('offset'));
      this.params = this.params.set('offset', String(currentOffset + Number(this.params.get('limit'))));
    }
    this.customersLoading = true;
    this.detectScrollChanges();
    this.unsub.subs = this.contactManagerService.getCustomersList(this.params, this.contactManagerValue)
      .pipe(
        finalize(() => this.customersLoading = false)
      )
      .subscribe((res: { data: PortalUser[] }) => {
        if (!res.data.length) {
          this.hasNextCustomersData = false;
        }
        if (reset) {
          this.availableCustomers = res.data;
        } else {
          this.availableCustomers = [...this.availableCustomers, ...res.data];
        }
        this.detectScrollChanges();
        this.allAvailableCustomers = uniqBy([...this.allAvailableCustomers, ...res.data], 'id');
        if (firstLoad) {
          this.fillCustomerForNewUser();
        }
      });
  }

  selectCustomer(customer: PortalUser, index: number) {
    if (!customer.isInPortal) {
      this.addCustomerToPortal(null, customer, index);
      return;
    }

    this.customerForms.at(index).setValue({
      customerNumber: customer.customerNumber,
      customerInfo: `${customer.customerNumber} - ${customer.companyName}`,
      companyName: customer.companyName,
      id: customer.id
    });
  }

  rolesDisplayWithFn(value) {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return (value as any).role;
    }
    return '';
  }

  showAllLe() {
    this.legalEntityPushSubject.next('');
  }

  selectLe(event: MatAutocompleteSelectedEvent) {
    this.selectedLe = event.option.value;
    this.legalEntityInput.nativeElement.blur();
  }

  checkLe() {
    if (!this.selectedLe || this.selectedLe !== this.userDetailsForm.get('legalEntity').value) {
      this.userDetailsForm.get('legalEntity').setValue(null);
      this.selectedLe = '';
    }
  }

  openRoles() {
    this.rolesOpened = true;
  }

  closeRoles() {
    this.rolesOpened = false;
  }

  openCustomers() {
    this.customersOpened = true;
    this.detectScrollChanges();
  }

  closeCustomers() {
    this.customersOpened = false;
  }

  showAllRoles() {
    this.roleForm.get('role').setValue('');
  }

  addRole(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    const existingRole = this.roles.find((role: Role) => (role.role || '').toLowerCase() === value);

    if ((value || '').trim() && existingRole) {
      const currentRoles = this.roleForm.get('roles').value;
      this.roleForm.get('roles').setValue(uniqBy([...currentRoles, existingRole], 'id'));
    }

    if (input) {
      input.value = '';
    }

    this.roleForm.get('role').setValue(null);
  }

  selectRole(value: Role) {
    const currentRoles = this.roleForm.get('roles').value;
    this.roleForm.get('roles').setValue(uniqBy([...currentRoles, value], 'id'));
    if (this.rolesInput && this.rolesInput.nativeElement) {
      this.rolesInput.nativeElement.value = '';
    }
    this.roleForm.get('role').setValue(null);
  }

  removeRole(value: Role): void {
    const roles = this.roleForm.get('roles').value.filter((role: Role) => {
      return role.id !== value.id;
    });
    this.roleForm.get('roles').setValue(roles);
  }

  save() {
    switch (this.mode) {
      case ManageMode.addToPortal:
        this.addToPortal();
        return;
      case ManageMode.edit:
        this.updateUser();
        return;
    }
  }

  updateUser() {
    this.savingChanges = true;
    const firstName = (this.userDetailsForm.get('fName').value as string).trim();
    const lastName = (this.userDetailsForm.get('lName').value as string).trim();
    const userData = { ...this.userDetailsForm.getRawValue(), fName: firstName, lName: lastName };
    const toUnlink = this.linkedCustomers.filter((customer: PortalUser) => {
      return !this.customerForms.value.some((customerInForm: PortalUser) => customerInForm.id === customer.id);
    });
    const toLink = this.customerForms.value
      .filter((customerInForm: PortalUser) => {
        return !this.linkedCustomers.some((customer: PortalUser) => customerInForm.id === customer.id);
      });
    const rolesToUnlink = this.linkedRoles.filter((role: Role) => {
      return !this.roleForm.get('roles').value.some((roleInForm: Role) => roleInForm.id === role.id);
    });
    const rolesToLink = this.roleForm.get('roles').value
      .filter((roleInForm: Role) => {
        return !this.linkedRoles.some((role: Role) => roleInForm.id === role.id);
      });

    let model$;
    if (this.userDetailsForm.get('picture').value) {
      model$ = this.contactManagerService.update(this.user.id, userData);
    } else {
      const avatarImage = UserAvatarService
        .generateAvatarFromName(`${firstName} ${lastName}`);
      model$ = this.contactManagerService.imgUpload(avatarImage)
        .pipe(
          map((res: { uploadResult: string }) => res.uploadResult),
          mergeMap((picture: string) => this.contactManagerService.update(this.user.id, {
            ...userData,
            picture
          }))
        );
    }

    this.unsub.subs = model$
      .pipe(
        mergeMap((user: PortalUser) => this.linkCustomersToUser(user, toLink)
          .pipe(mapTo(user))
        ),
        mergeMap((user: PortalUser) => this.unlinkCustomerFromUser(user, toUnlink)
          .pipe(mapTo(user))
        ),
        mergeMap((user: PortalUser) => this.linkRolesToUser(user, rolesToLink)
          .pipe(mapTo(user))
        ),
        mergeMap((user: PortalUser) => this.unlinkRolesFromUser(user, rolesToUnlink)
          .pipe(mapTo(user))
        ),
        finalize(() => this.savingChanges = false)
      )
      .subscribe((updatedUser: PortalUser) => {
        this.detailsUpdated = true;
        this.widgetObserver.emit({
          context: WidgetObserverService.contexts.CONTACT_MANAGER_UPDATED,
          value: {
            ...updatedUser,
            items: (this.customerForms.value || []).map((customer) => ({
              [this.contactManagerValue.accountNumber]: customer.customerNumber,
              [this.contactManagerValue.customerName]: customer.companyName
            }))
          }
        });
      });
  }

  addToPortal() {
    this.creatingUser = true;
    const firstName = (this.userDetailsForm.get('fName').value as string).trim();
    const lastName = (this.userDetailsForm.get('lName').value as string).trim();
    const userData = { ...this.userDetailsForm.value, fName: firstName, lName: lastName };
    const avatarImage = UserAvatarService.generateAvatarFromName(`${firstName} ${lastName}`);
    let toLink = [...this.customerForms.value] as PortalUser[];
    this.unsub.subs = this.contactManagerService.imgUpload(avatarImage)
      .pipe(
        map((res: { uploadResult: string }) => res.uploadResult),
        mergeMap((picture: string) => this.contactManagerService.create({ ...userData, picture })),
        mergeMap((user: PortalUser) => this.linkCustomersToUser(user, toLink.map((customer: PortalUser) => ({
            ...customer,
            legalEntity: this.userDetailsForm.get('legalEntity').value
          })))
            .pipe(
              mapTo(user)
            )
        ),
        mergeMap((user: PortalUser) => this.linkRolesToUser(user, this.roleForm.get('roles').value)
          .pipe(
            mapTo(user)
          )
        ),
        finalize(() => this.creatingUser = false)
      )
      .subscribe((addedUser: PortalUser) => {
        this.userCreated = true;
        this.user = addedUser;
        this.linkedCustomers = this.customerForms.value;
        this.widgetObserver.emit({
          context: this.addNew
            ? WidgetObserverService.contexts.CONTACT_MANAGER_ADDED_NEW
            : WidgetObserverService.contexts.CONTACT_MANAGER_ADDED,
          value: addedUser
        });
      });
  }

  openConfirmDelete() {
    this.confirmDelete = true;
  }

  cancelDeleteConfirm() {
    this.confirmDelete = false;
  }

  deleteUser() {
    this.confirmDelete = false;
    this.deletingUser = true;
    this.unsub.subs = this.contactManagerService.deleteItem(this.user.id)
      .pipe(
        finalize(() => this.deletingUser = false)
      )
      .subscribe(() => {
        this.userDeleted = true;
        this.widgetObserver.emit({
          context: WidgetObserverService.contexts.CONTACT_MANAGER_DELETED,
          value: this.user.id
        });
      });
  }

  viewProfile() {
    this.detailsUpdated = false;
    this.userCreated = false;
    this.userDeleted = false;
    this.params = ManageDetailsComponent.getCustomerSearchParams();

    this.viewProfileLoading = true;
    this.unsub.subs = combineLatest<any, any>([
      this.contactManagerService.getCustomersList(this.params, this.contactManagerValue),
      this.getLinkedCustomers()
    ]).pipe(
      finalize(() => this.viewProfileLoading = false)
    ).subscribe((res: [{ data: PortalUser[] }, PortalUser[]]) => {
      this.availableCustomers = res[0].data;
      if (res[1]) {
        this.customerForms = new FormArray([]);
        this.addCustomerForm();
        this.linkedCustomers = res[1];
        this.addLinkedCustomersToForm();
      }
    });

    if (this.mode !== this.editMode) {
      this.mode = this.editMode;
      this.createForm(this.getUserDataForEdit());
      this.loadContactManagerRoles(this.user.id);
    }
  }

  addCustomerToPortal(event: MouseEvent, customer: PortalUser, index: number) {
    if (event) {
      event.preventDefault();
    }
    this.addingCustomerToThePortal = index;
    this.matAutocompleteTrigger.closePanel();

    this.contactManagerService.createCustomer({
      customerNumber: customer.customerNumber,
      companyName: customer.companyName,
      legalEntity: customer.legalEntity
    }).pipe(
      finalize(() => this.addingCustomerToThePortal = null)
    ).subscribe((response: PortalUser) => {
      this.customerForms.at(index).setValue({
        customerNumber: response.customerNumber,
        customerInfo: `${response.customerNumber} - ${response.companyName}`,
        companyName: response.companyName,
        id: response.id
      });
      this.snackBar.open('Customer has been added to the portal', null, {
        duration: 2000
      });
      this.availableCustomers = this.availableCustomers.map((availableCustomer: PortalUser) => {
        if (availableCustomer.companyName === response.companyName && availableCustomer.customerNumber === response.customerNumber) {
          return {
            ...availableCustomer,
            id: response.id,
            isInPortal: true
          };
        }
        return availableCustomer;
      });
      this.allAvailableCustomers = this.allAvailableCustomers.map((availableCustomer: PortalUser) => {
        if (availableCustomer.companyName === response.companyName && availableCustomer.customerNumber === response.customerNumber) {
          return {
            ...availableCustomer,
            id: response.id,
            isInPortal: true
          };
        }
        return availableCustomer;
      });
    });
  }

  loadNextCustomers() {
    if (this.customersLoading || !this.customersOpened || !this.hasNextCustomersData) {
      return;
    }
    this.loadCustomers({ firstLoad: false, reset: false });
  }

  private linkCustomersToUser(user: PortalUser, customers: PortalUser[] = []): Observable<PortalUser[]> {
    const customersToLink = (customers || [])
      .filter((customer: PortalUser) => !!customer.customerNumber);
    if (!customersToLink.length) {
      return of([]);
    }
    return combineLatest(customersToLink.map((customer: PortalUser) => {
      return this.contactManagerService.linkCustomerToUser({ id: user.id, customerId: customer.id });
    }));
  }

  private unlinkCustomerFromUser(user: PortalUser, customers: PortalUser[] = []) {
    const customersToUnlink = customers
      .filter((customer: PortalUser) => !!customer.customerNumber);
    if (!customersToUnlink.length) {
      return of([]);
    }
    return combineLatest(customersToUnlink.map((customer: PortalUser) => {
      return this.contactManagerService.unlinkCustomerFromUser({ id: user.id, customerId: customer.id });
    }) as Observable<PortalUser>[]);
  }

  private linkRolesToUser(user: PortalUser, rolesToLink: Role[] = []) {
    if (!rolesToLink.length) {
      return of([]);
    }

    return combineLatest(rolesToLink.map((role: Role) => {
      return this.contactManagerService.linkRoleToUser(String(role.id), String(user.id));
    }));
  }

  private unlinkRolesFromUser(user: PortalUser, rolesToUnlink: Role[] = []) {
    if (!rolesToUnlink.length) {
      return of([]);
    }
    return combineLatest(rolesToUnlink.map((role: Role) => {
      return this.contactManagerService.unlinkRoleFromUser(String(role.id), String(user.id));
    }));
  }

  private getUserDataForEdit(): PortalUser {
    return {
      fName: this.user && this.user.fName || '',
      lName: this.user && this.user.lName || '',
      type: this.user && this.user.type || '',
      email: this.user && this.user.email || '',
      phone: this.user && this.user.phone || '',
      legalEntity: this.user && this.user.legalEntity || '',
      entityId: this.user && this.user.entityId || null,
      picture: this.user && this.user.picture || null,
      locations: null,
      applications: null
    } as PortalUser;
  }

  private getUserDataForAdd(): PortalUser {
    return {
      fName: ManageDetailsMapService.parseNames(this.contactManager[this.contactManagerValue.contactName]).firstName,
      lName: ManageDetailsMapService.parseNames(this.contactManager[this.contactManagerValue.contactName]).lastName,
      type: this.userType,
      email: this.contactManager[this.contactManagerValue.email] || '',
      phone: this.contactManager[this.contactManagerValue.phone] || '',
      legalEntity: this.contactManager[this.contactManagerValue.legalEntity] || '',
      entityId: null,
      locations: null,
      applications: null
    } as PortalUser;
  }

  private getEmptyFormData(): PortalUser {
    return {
      fName: '',
      lName: '',
      type: this.userType,
      email: '',
      phone: '',
      legalEntity: '',
      entityId: null,
      locations: null,
      applications: null
    } as PortalUser;
  }

  private toggleDataLoading(toggle: boolean) {
    this.dataLoading = toggle;
    if (toggle) {
      this.userDetailsForm.disable({ emitEvent: false });
      this.customerForms.disable({ emitEvent: false });
      return;
    }
    this.userDetailsForm.enable({ emitEvent: false });
    this.customerForms.enable({ emitEvent: false });
    if (this.mode === ManageMode.edit) {
      this.userDetailsForm.get('email').disable({ emitEvent: false });
    }
  }

  private loadLinkedCustomers() {
    this.unsub.subs = this.getLinkedCustomers()
      .pipe(
        filter(Boolean)
      ).subscribe((res: PortalUser[]) => {
        this.linkedCustomers = res || [];
        this.loadDataForLinkedCustomers();
        this.addLinkedCustomersToForm();
      });
  }

  private getLinkedCustomers() {
    const userId = this.contactManager.PortalUserId && this.contactManager.PortalUserId.split('|')[0];
    if (userId && this.contactManager[this.contactManagerValue.isPortalUser] === 'Yes') {
      return this.contactManagerService.getCustomersByUser(userId, ManageDetailsComponent.getCustomerSearchParams());
    }
    return of(null);
  }

  private loadDataForLinkedCustomers() {
    const customersWithoutData = this.linkedCustomers.filter((linkedCustomer: PortalUser) => {
      return !this.allAvailableCustomers
        .some((availableCustomer: PortalUser) => availableCustomer.customerNumber === linkedCustomer.customerNumber);
    });
    this.unsub.subs = combineLatest(
      customersWithoutData.map((linkedCustomer: PortalUser) => {
        const customerSearchParams = new HttpParams()
          .set('limit', '1')
          .set('offset', '0')
          .set('text', linkedCustomer.customerNumber);
        return this.contactManagerService.getCustomersList(customerSearchParams, this.contactManagerValue)
          .pipe(
            map(((res: { data: PortalUser[] }) => res.data[0] || null))
          );
      })
    ).subscribe((customers: PortalUser[]) => {
      this.allAvailableCustomers = uniqBy([...this.allAvailableCustomers, ...customers.filter(Boolean)], 'id');
    });
  }

  private fillCustomerForNewUser() {
    if (this.addNew && this.customer) {
      this.allAvailableCustomers = uniqBy([...this.allAvailableCustomers, this.customer], 'id');
      this.linkedCustomers = [this.customer];
      this.addLinkedCustomersToForm();
    }
    if (this.contactManager[this.contactManagerValue.isPortalUser] !== 'Yes' && !this.addNew) {
      const customerSearchParams = new HttpParams()
        .set('limit', '1')
        .set('offset', '0')
        .set('text', this.contactManager.accountNumber);
      this.unsub.subs = this.contactManagerService.getCustomersList(customerSearchParams, this.contactManagerValue)
        .pipe(
          filter((res: { data: PortalUser[] }) => Boolean(res.data[0])),
          map((res: { data: PortalUser[] }) => res.data[0])
        )
        .subscribe((customerForFill: PortalUser) => {
          this.allAvailableCustomers = uniqBy([...this.allAvailableCustomers, customerForFill], 'id');
          this.linkedCustomers = [customerForFill];
          this.addLinkedCustomersToForm();
          if (!customerForFill.isInPortal) {
            this.addCustomerToPortal(null, customerForFill, 0);
          }
        });
    }
  }

  private addLinkedCustomersToForm() {
    this.linkedCustomers.forEach((customer: PortalUser, index) => {
      const control = this.customerForms.at(index);
      if (!control) {
        this.customerForms.setControl(index, this.getNewForm());
      }
      this.customerForms.at(index).setValue({
        customerNumber: customer.customerNumber,
        companyName: customer.companyName,
        customerInfo: `${customer.customerNumber} - ${customer.companyName}`,
        id: customer.id
      });
    });
    this.subscribeOnCustomerValueChange();

  }

  private subscribeOnCustomerValueChange() {
    if (this.customerFormChangesSub) {
      this.customerFormChangesSub.unsubscribe();
    }
    this.customerFormChangesSub = this.customerForms.valueChanges
      .pipe(
        startWith(this.customerForms.value as PortalUser),
        map((value: PortalUser[]) => value.map((customer: PortalUser) => customer.customerNumber))
      )
      .subscribe((ids: string[]) => this.selectedCustomers = ids);
  }

  private loadContactManagerRoles(userId) {
    this.unsub.subs = this.contactManagerService.getCustomerRoles(userId)
      .subscribe((res: Role[]) => {
        const customRoles = res.filter((role: Role) => role.role.toLowerCase() !== this.userType.toLowerCase());
        this.linkedRoles = [...customRoles];
        this.roleForm.get('roles').setValue(customRoles);
      });
  }

  private detectScrollChanges() {
    this.detectChanges();
    setTimeout(() => {
      if (this.customersPs) {
        this.customersPs.update();
        this.detectChanges();
      }
    });
  }

  private detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}
