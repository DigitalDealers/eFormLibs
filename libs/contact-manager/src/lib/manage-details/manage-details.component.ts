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
  OnDestroy,
  OnInit,
  Self,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import uniqBy from 'lodash-es/uniqBy';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { combineLatest, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, mapTo, mergeMap, startWith } from 'rxjs/operators';

import { ManageMode } from '../contact-manager-details/manage-mode.enum';
import { ContactManagerService } from '../contact-manager.service';
import { animations } from '../shared/fade.animation';
import {
  ContactManagerSearchResult,
  ContactNameKey,
  isPortalUserKey,
  LegalEntityKey
} from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { PortalUser } from '../shared/interfaces/portal-user.interface';
import { Role } from '../shared/interfaces/role.interface';
import { DidiRole } from '../shared/roles.enum';
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
export class ManageDetailsComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild('customersPs', { static: true }) private readonly customersPs?: PerfectScrollbarDirective;
  @ViewChild('rolesInput') public readonly rolesInput?: ElementRef<HTMLInputElement>;
  @ViewChild('legalEntityInput') legalEntityInput?: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) matAutocompleteTrigger?: MatAutocompleteTrigger;

  @Input() mode?: ManageMode;
  @Input() user?: PortalUser;
  @Input() customer?: PortalUser;
  @Input() contactManager?: ContactManagerSearchResult;
  @Input() addNew?: boolean;
  @Input() contactManagerValue?: ContactManager;

  public readonly editMode = ManageMode.edit;
  public readonly addMode = ManageMode.addToPortal;
  public readonly separatorKeysCodes = [ENTER, COMMA];
  public isCustomer = false;
  public viewProfileLoading = false;
  public savingChanges = false;
  public deletingUser = false;
  public creatingUser = false;
  public confirmDelete = false;
  public detailsUpdated = false;
  public userCreated = false;
  public userDeleted = false;
  public dataLoading = false;
  public userDetailsForm?: FormGroup;
  public roleForm?: FormGroup;
  public customerForms?: FormArray;
  public availableCustomers: PortalUser[] = [];
  public selectedCustomers: string[] = [];
  public filteredLegalEntities$?: Observable<string[]>;
  public filteredRoles$?: Observable<Role[]>;
  public addingCustomerToThePortal: number | null = null;

  private readonly userType = 'Customer';
  private blurSubject = new Subject<void>();
  private customersOpened = false;
  private customersLoading = false;
  private hasNextCustomersData = false;
  private linkedCustomers: PortalUser[] = [];
  private allAvailableCustomers: PortalUser[] = [];
  private legalEntities: string[] = [];
  private roles: Role[] = [];
  private linkedRoles: Role[] = [];
  private legalEntityPushSubject = new Subject<string>();
  private customerNumberChangesSub?: Subscription;
  private customerFormChangesSub?: Subscription;
  private selectedLe = '';
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
    this.legalEntities = this.contactManagerValue?.legalEntities || [];

    this.roles = (this.contactManagerValue?.roles || [])
      .filter(role => role.role.toLowerCase() !== this.userType.toLowerCase());
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
            this.loadContactManagerRoles(this.user.id?.toString() || '');
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

  public ngOnDestroy(): void {
    this.customerNumberChangesSub?.unsubscribe();
    this.customerFormChangesSub?.unsubscribe();
  }

  onFocus(index: number) {
    this.customerNumberChangesSub = this.getControl(this.getCustomerForm(index), 'customerInfo')
      .valueChanges
      .pipe(
        filter(Boolean),
        debounceTime(inputDebounce),
        distinctUntilChanged()
      ).subscribe(query => {
        this.params = this.params.set('offset', '0').set('text', query as string);
        this.loadCustomers({ firstLoad: false, reset: true });
      });
  }

  onBlur() {
    this.customersOpened = false;
    this.customerNumberChangesSub?.unsubscribe();
    this.blurSubject.next();
  }

  public getControl(form: FormGroup | undefined, controlName: string): FormControl {
    if (!form) {
      throw new Error('Form is not initialized');
    }
    const control = form.get(controlName);
    if (!control) {
      throw new Error(`Control ${controlName} not found`);
    }
    return control as FormControl;
  }

  public getCustomerForms(): FormGroup[] {
    if (!this.customerForms) {
      throw new Error('customerForms is not defined');
    }
    return this.customerForms.controls as FormGroup[];
  }

  public getCustomerFormsValue(): PortalUser[] {
    if (!this.customerForms) {
      throw new Error('customerForms is not defined');
    }
    return this.customerForms.value as PortalUser[];
  }

  private getCustomerForm(index: number): FormGroup {
    const form = this.customerForms?.at(index);
    if (!form) {
      throw new Error(`customerForm at index ${index} is not defined`);
    }
    return form as FormGroup;
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

    this.filteredRoles$ = this.getControl(this.roleForm, 'role').valueChanges
      .pipe(
        startWith(''),
        filter(value => typeof value === 'string'),
        map(value => {
          return this.roles.filter(role => role.role.toLowerCase().includes(value.toLowerCase()));
        })
      );

    this.addCustomerForm();
    this.addLinkedCustomersToForm();
    const emailControl = this.userDetailsForm.get('email');
    if (emailControl?.value) {
      emailControl.markAsTouched();
    }

    this.filteredLegalEntities$ = merge(
      this.getControl(this.userDetailsForm, 'legalEntity').valueChanges,
      this.legalEntityPushSubject
    ).pipe(
      startWith(''),
      map((value: string) => {
        const filterValue = (value || '').toLowerCase();
        return this.legalEntities.filter(le => le.toLowerCase().includes(filterValue));
      })
    );

    this.unsub.subs = this.security.getUserRoles().subscribe(roles => {
      this.isCustomer = roles.indexOf(DidiRole.CUSTOMER) >= 0;
      const tokenData = this.config.tokenData;
      const leKey = Object.keys(tokenData).find((key: string) => !!key.match(/\/le$/));
      if (leKey && this.isCustomer) {
        this.getControl(this.userDetailsForm, 'legalEntity').setValue(tokenData[leKey]);
      }
    });
  }

  addCustomerForm() {
    if (!this.customerForms) {
      return;
    }
    const newForm = this.getNewForm();
    this.customerForms.push(newForm);
    this.subscribeOnCustomerValueChange();
  }

  removeForm(index: number) {
    if (!this.customerForms) {
      return;
    }
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
    if (!this.contactManagerValue) {
      throw new Error('contactManagerValue is not defined');
    }
    if (reset) {
      this.params = this.params.set('offset', '0');
      this.hasNextCustomersData = true;
      this.customersPs?.scrollToTop();
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

    this.getCustomerForm(index).setValue({
      customerNumber: customer.customerNumber,
      customerInfo: `${customer.customerNumber} - ${customer.companyName}`,
      companyName: customer.companyName,
      id: customer.id
    });
  }

  public rolesDisplayWithFn(value: unknown) {
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
    this.legalEntityInput?.nativeElement.blur();
  }

  checkLe() {
    if (!this.selectedLe || this.selectedLe !== this.getControl(this.userDetailsForm, 'legalEntity').value) {
      this.getControl(this.userDetailsForm, 'legalEntity').setValue(null);
      this.selectedLe = '';
    }
  }

  openCustomers() {
    this.customersOpened = true;
    this.detectScrollChanges();
  }

  closeCustomers() {
    this.customersOpened = false;
  }

  showAllRoles() {
    this.getControl(this.roleForm, 'role').setValue('');
  }

  addRole(event: MatChipInputEvent): void {
    const input = event.chipInput?.inputElement;
    const value = event.value;

    const existingRole = this.roles.find(role => (role.role || '').toLowerCase() === value);

    if ((value || '').trim() && existingRole) {
      const currentRoles = this.getControl(this.roleForm, 'roles').value;
      this.getControl(this.roleForm, 'roles').setValue(uniqBy([...currentRoles, existingRole], 'id'));
    }

    if (input) {
      input.value = '';
    }

    this.getControl(this.roleForm, 'role').setValue(null);
  }

  selectRole(value: Role) {
    const currentRoles = this.getControl(this.roleForm, 'roles').value;
    this.getControl(this.roleForm, 'roles').setValue(uniqBy([...currentRoles, value], 'id'));
    if (this.rolesInput?.nativeElement) {
      this.rolesInput.nativeElement.value = '';
    }
    this.getControl(this.roleForm, 'role').setValue(null);
  }

  removeRole(value: Role): void {
    const roles = this.getControl(this.roleForm, 'roles').value.filter((role: Role) => {
      return role.id !== value.id;
    });
    this.getControl(this.roleForm, 'roles').setValue(roles);
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
    if (!this.user?.id) {
      return;
    }
    this.savingChanges = true;
    const firstName = (this.getControl(this.userDetailsForm, 'fName').value as string).trim();
    const lastName = (this.getControl(this.userDetailsForm, 'lName').value as string).trim();
    const userData = { ...(this.userDetailsForm as FormGroup).getRawValue(), fName: firstName, lName: lastName };
    const toUnlink = this.linkedCustomers.filter(customer => {
      return !this.getCustomerFormsValue().some(customerInForm => customerInForm.id === customer.id);
    });
    const toLink = this.getCustomerFormsValue()
      .filter(customerInForm => {
        return !this.linkedCustomers.some(customer => customerInForm.id === customer.id);
      });
    const rolesToUnlink = this.linkedRoles.filter(role => {
      return !this.getControl(this.roleForm, 'roles').value.some((roleInForm: Role) => roleInForm.id === role.id);
    });
    const rolesToLink = this.getControl(this.roleForm, 'roles').value
      .filter((roleInForm: Role) => {
        return !this.linkedRoles.some(role => roleInForm.id === role.id);
      });

    let model$: Observable<PortalUser>;
    if (this.getControl(this.userDetailsForm, 'picture').value) {
      model$ = this.contactManagerService.update(this.user.id.toString(), userData);
    } else {
      const avatarImage = UserAvatarService.generateAvatarFromName(`${firstName} ${lastName}`);
      model$ = this.contactManagerService.imgUpload(avatarImage)
        .pipe(
          map(res => res.uploadResult),
          mergeMap(picture => this.contactManagerService.update(((this.user as PortalUser).id as number).toString(), {
            ...userData,
            picture
          }))
        );
    }

    this.unsub.subs = model$
      .pipe(
        mergeMap(user => this.linkCustomersToUser(user, toLink).pipe(mapTo(user))),
        mergeMap(user => this.unlinkCustomerFromUser(user, toUnlink).pipe(mapTo(user))),
        mergeMap(user => this.linkRolesToUser(user, rolesToLink).pipe(mapTo(user))),
        mergeMap(user => this.unlinkRolesFromUser(user, rolesToUnlink).pipe(mapTo(user))),
        finalize(() => this.savingChanges = false)
      )
      .subscribe(updatedUser => {
        this.detailsUpdated = true;
        this.widgetObserver.emit({
          context: WidgetObserverService.contexts.CONTACT_MANAGER_UPDATED,
          value: {
            ...updatedUser,
            items: this.getCustomerFormsValue().map(customer => ({
              [this.contactManagerValue?.accountNumber || '']: customer.customerNumber,
              [this.contactManagerValue?.customerName || '']: customer.companyName
            }))
          }
        });
      });
  }

  addToPortal() {
    this.creatingUser = true;
    const firstName = (this.getControl(this.userDetailsForm, 'fName').value as string).trim();
    const lastName = (this.getControl(this.userDetailsForm, 'lName').value as string).trim();
    const userData = { ...(this.userDetailsForm as FormGroup).value, fName: firstName, lName: lastName };
    const avatarImage = UserAvatarService.generateAvatarFromName(`${firstName} ${lastName}`);
    const toLink = [...this.getCustomerFormsValue()] as PortalUser[];
    this.unsub.subs = this.contactManagerService.imgUpload(avatarImage)
      .pipe(
        map((res: { uploadResult: string }) => res.uploadResult),
        mergeMap((picture: string) => this.contactManagerService.create({ ...userData, picture })),
        mergeMap((user: PortalUser) => this.linkCustomersToUser(user, toLink.map((customer: PortalUser) => ({
            ...customer,
            legalEntity: this.getControl(this.userDetailsForm, 'legalEntity').value
          })))
            .pipe(
              mapTo(user)
            )
        ),
        mergeMap((user: PortalUser) => this.linkRolesToUser(user, this.getControl(this.roleForm, 'roles').value)
          .pipe(
            mapTo(user)
          )
        ),
        finalize(() => this.creatingUser = false)
      )
      .subscribe((addedUser: PortalUser) => {
        this.userCreated = true;
        this.user = addedUser;
        this.linkedCustomers = this.getCustomerFormsValue();
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
    if (!this.user?.id) {
      return;
    }
    this.confirmDelete = false;
    this.deletingUser = true;
    this.unsub.subs = this.contactManagerService.deleteItem(this.user.id.toString())
      .pipe(
        finalize(() => this.deletingUser = false)
      )
      .subscribe(() => {
        this.userDeleted = true;
        this.widgetObserver.emit({
          context: WidgetObserverService.contexts.CONTACT_MANAGER_DELETED,
          value: (this.user as PortalUser).id
        });
      });
  }

  viewProfile() {
    if (!this.contactManagerValue) {
      throw new Error('contactManagerValue is not defined');
    }
    this.detailsUpdated = false;
    this.userCreated = false;
    this.userDeleted = false;
    this.params = ManageDetailsComponent.getCustomerSearchParams();

    this.viewProfileLoading = true;
    this.unsub.subs = combineLatest([
      this.contactManagerService.getCustomersList(this.params, this.contactManagerValue),
      this.getLinkedCustomers()
    ]).pipe(
      finalize(() => this.viewProfileLoading = false)
    ).subscribe((res) => {
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
      this.loadContactManagerRoles((this.user as PortalUser).id?.toString() || '');
    }
  }

  addCustomerToPortal(event: MouseEvent | null, customer: PortalUser, index: number) {
    if (event) {
      event.preventDefault();
    }
    this.addingCustomerToThePortal = index;
    this.matAutocompleteTrigger?.closePanel();

    this.contactManagerService.createCustomer({
      customerNumber: customer.customerNumber,
      companyName: customer.companyName,
      legalEntity: customer.legalEntity
    }).pipe(
      finalize(() => this.addingCustomerToThePortal = null)
    ).subscribe((response: PortalUser) => {
      this.getCustomerForm(index).setValue({
        customerNumber: response.customerNumber,
        customerInfo: `${response.customerNumber} - ${response.companyName}`,
        companyName: response.companyName,
        id: response.id
      });
      this.snackBar.open('Customer has been added to the portal', undefined, {
        duration: 2000
      });
      this.availableCustomers = this.availableCustomers.map(availableCustomer => {
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

  private linkCustomersToUser(user: PortalUser, customers: PortalUser[] = []): Observable<(PortalUser | null)[]> {
    const customersToLink = (customers || [])
      .filter((customer: PortalUser) => !!customer.customerNumber);
    if (!customersToLink.length) {
      return of([]);
    }
    return combineLatest(customersToLink.map(customer => {
      return this.contactManagerService.linkCustomerToUser({ id: user.id as number, customerId: customer.id as number });
    }));
  }

  private unlinkCustomerFromUser(user: PortalUser, customers: PortalUser[] = []) {
    const customersToUnlink = customers
      .filter((customer: PortalUser) => !!customer.customerNumber);
    if (!customersToUnlink.length) {
      return of([]);
    }
    return combineLatest(customersToUnlink.map((customer: PortalUser) => {
      return this.contactManagerService.unlinkCustomerFromUser({ id: user.id as number, customerId: customer.id as number });
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
    const {
      firstName,
      lastName
    } = ManageDetailsMapService.parseNames(this.contactManager?.[(this.contactManagerValue?.contactName || '') as ContactNameKey] || '');
    return {
      fName: firstName,
      lName: lastName,
      type: this.userType,
      email: this.contactManager?.[this.contactManagerValue?.email as keyof ContactManagerSearchResult] || '',
      phone: this.contactManager?.[this.contactManagerValue?.phone as keyof ContactManagerSearchResult] || '',
      legalEntity: this.contactManager?.[this.contactManagerValue?.legalEntity as LegalEntityKey] || '',
      entityId: '',
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
      entityId: '',
      locations: null,
      applications: null
    } as PortalUser;
  }

  private toggleDataLoading(toggle: boolean) {
    if (!this.userDetailsForm || !this.customerForms) {
      return;
    }

    this.dataLoading = toggle;
    if (toggle) {
      this.userDetailsForm.disable({ emitEvent: false });
      this.customerForms.disable({ emitEvent: false });
      return;
    }

    this.userDetailsForm.enable({ emitEvent: false });
    this.customerForms.enable({ emitEvent: false });
    if (this.mode === ManageMode.edit) {
      this.getControl(this.userDetailsForm, 'email').disable({ emitEvent: false });
    }
  }

  private loadLinkedCustomers() {
    this.unsub.subs = this.getLinkedCustomers()
      .pipe(
        filter(Boolean)
      ).subscribe(res => {
        this.linkedCustomers = res as PortalUser[];
        this.loadDataForLinkedCustomers();
        this.addLinkedCustomersToForm();
      });
  }

  private getLinkedCustomers(): Observable<PortalUser[] | null> {
    const userId = this.contactManager?.PortalUserId?.split('|')[0];
    if (userId && this.contactManager?.[this.contactManagerValue?.isPortalUser as isPortalUserKey] === 'Yes') {
      return this.contactManagerService.getCustomersByUser(userId, ManageDetailsComponent.getCustomerSearchParams());
    }
    return of(null);
  }

  private loadDataForLinkedCustomers() {
    if (!this.contactManagerValue) {
      throw new Error('contactManagerValue is not defined');
    }

    const customersWithoutData = this.linkedCustomers.filter(linkedCustomer => {
      return !this.allAvailableCustomers
        .some(availableCustomer => availableCustomer.customerNumber === linkedCustomer.customerNumber);
    });
    this.unsub.subs = combineLatest(
      customersWithoutData.map(linkedCustomer => {
        const customerSearchParams = new HttpParams()
          .set('limit', '1')
          .set('offset', '0')
          .set('text', linkedCustomer.customerNumber || '');
        return this.contactManagerService.getCustomersList(customerSearchParams, this.contactManagerValue as ContactManager)
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
    if (
      this.contactManagerValue &&
      this.contactManager?.[this.contactManagerValue.isPortalUser as isPortalUserKey] !== 'Yes' &&
      !this.addNew
    ) {
      const customerSearchParams = new HttpParams()
        .set('limit', '1')
        .set('offset', '0')
        .set('text', this.contactManager?.accountNumber || '');
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
    this.linkedCustomers.forEach((customer, index) => {
      const control = this.getCustomerForm(index);
      if (!control) {
        (this.customerForms as FormArray).setControl(index, this.getNewForm());
      }
      this.getCustomerForm(index).setValue({
        customerNumber: customer.customerNumber,
        companyName: customer.companyName,
        customerInfo: `${customer.customerNumber} - ${customer.companyName}`,
        id: customer.id
      });
    });
    this.subscribeOnCustomerValueChange();

  }

  private subscribeOnCustomerValueChange() {
    this.customerFormChangesSub?.unsubscribe();
    this.customerFormChangesSub = (this.customerForms as FormArray).valueChanges
      .pipe(
        startWith(this.getCustomerFormsValue()),
        map((value: PortalUser[]) => value.map(customer => customer.customerNumber || ''))
      )
      .subscribe((ids: string[]) => this.selectedCustomers = ids);
  }

  private loadContactManagerRoles(userId: string) {
    this.unsub.subs = this.contactManagerService.getCustomerRoles(userId)
      .subscribe(res => {
        const customRoles = res.filter(role => role.role.toLowerCase() !== this.userType.toLowerCase());
        this.linkedRoles = [...customRoles];
        this.getControl(this.roleForm, 'roles').setValue(customRoles);
      });
  }

  private detectScrollChanges() {
    this.detectChanges();
    setTimeout(() => {
      this.customersPs?.update();
      this.detectChanges();
    });
  }

  private detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }
}
