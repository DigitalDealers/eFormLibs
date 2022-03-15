import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { debounceTime, filter, finalize, map, tap } from 'rxjs/operators';

import { ContactManagerDetailsComponent } from '../contact-manager-details/contact-manager-details.component';
import { ManageMode } from '../contact-manager-details/manage-mode.enum';
import { ContactManagerDialogService } from '../contact-manager-dialog/contact-manager-dialog.service';
import { animationDuration } from '../shared/animation.config';
import { animations } from '../shared/fade.animation';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManagerSettings } from '../shared/interfaces/contact-manager-settings.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { TwilioData } from '../shared/interfaces/twilio-data.interface';
import { WidgetEmitData } from '../shared/interfaces/widget-emit-data.interface';
import { DidiRole } from '../shared/roles.enum';
import { ConfigService } from '../shared/services/config.service';
import { ContactManagerMappersService } from '../shared/services/contact-manager-mappers.service';
import { DataSetSearchService } from '../shared/services/data-set-search.service';
import { SecurityService } from '../shared/services/security.service';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';
import { WidgetObserverService } from '../shared/services/widget-observer.service';

const debounce = 150;

function isWidgetEmitData(data: WidgetEmitData | null): data is WidgetEmitData {
  return !!data;
}

@Component({
  selector: 'didi-contact-manager-search',
  templateUrl: './contact-manager-search.component.html',
  styleUrls: ['./contact-manager-search.component.scss'],
  animations: [
    ...animations
  ],
  providers: [UnsubscribeService]
})
export class ContactManagerSearchComponent implements OnInit, OnDestroy {
  @Input() componentId?: number;
  @Input() contactManager?: ContactManager;
  @Input() twilioData?: TwilioData;
  @Output() selectContactManager: EventEmitter<ContactManagerSearchResult> = new EventEmitter<ContactManagerSearchResult>();

  searchControl: FormControl;
  searchResult: ContactManagerSearchResult[] = [];
  searchSub?: Subscription;
  currentPage = 1;
  paginationVisible = false;
  loading = false;
  noResults = false;
  searchItemsAnimating = false;
  searchPlaceholderImage = `${this.config.cmsThemeUrl}/assets/images/contact-manager-search.png`;
  hiddenSearch = false;
  dialogMode = false;
  isContactAdmin = false;
  searchParams = {
    query: '',
    offset: 0,
    limit: 6
  };

  private static prepareQuery(value: string) {
    const query = (value || '').trim();
    const isPhoneNumber = query.match(/^[0-9+]+[0-9\- ]{3,15}$/);
    if (isPhoneNumber) {
      return query.replace(/[^0-9 ]/g, '');
    }
    return query;
  }

  constructor(
    @Self() private unsub: UnsubscribeService,
    private dataSetSearchService: DataSetSearchService,
    private widgetObserver: WidgetObserverService,
    private contactManagerDialog: ContactManagerDialogService,
    private dialog: MatDialog,
    private security: SecurityService,
    private config: ConfigService
  ) {
    this.searchControl = new FormControl('');
  }

  ngOnInit() {
    this.listenToTwilio();
    this.listenToSearchEvents();
    this.listenUpdateEvents();
    this.unsub.subs = this.searchControl.valueChanges
      .pipe(
        tap(() => {
          this.currentPage = 1;
          this.hiddenSearch = true;
          this.widgetObserver.emit({
            context: WidgetObserverService.contexts.CONTACT_MANAGER_NEW_SEARCH,
            value: {}
          });
        }),
        debounceTime(debounce)
      )
      .subscribe((value: string) => this.loadItems(value));

    this.unsub.subs = this.security.getUserRoles().subscribe((roles: string[]) => {
      this.isContactAdmin = roles.indexOf(DidiRole.CONTACT_ADMIN) >= 0;
    });
  }

  public ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  setPage(currentPage: number) {
    if (this.loading && !(currentPage < this.currentPage)) {
      return;
    }
    this.currentPage = currentPage;
    this.searchParams.offset = (currentPage - 1) * this.searchParams.limit;
    this.loadItems(this.searchParams.query, false);
  }

  loadItems(value: string = '', reset: boolean = true) {
    if (!value) {
      this.resetSearch();
      this.paginationVisible = false;
      this.noResults = false;
      return;
    }

    if (!this.contactManager) {
      throw new Error('No contactManager');
    }

    this.searchParams.query = value;
    if (reset) {
      this.searchParams.offset = 0;
    }
    this.searchSub?.unsubscribe();
    this.loading = true;
    this.searchSub = this.dataSetSearchService.liteSearch<ContactManagerSearchResult>(this.contactManager.dataSetId, {
      query: ContactManagerSearchComponent.prepareQuery(value),
      offset: this.searchParams.offset.toString(),
      limit: this.searchParams.limit.toString()
    }).pipe(
      map(items => ContactManagerMappersService.mapContactManagerSearchResult(items)),
      finalize(() => this.loading = false)
    ).subscribe((res: ContactManagerSearchResult[]) => {
      if (!this.searchControl.value && !this.hiddenSearch) {
        this.resetSearch();
        this.paginationVisible = false;
        this.noResults = false;
        return;
      }
      this.searchResult = res;
      this.setPaginationVisibility(res);
      setTimeout(() => this.noResults = !res.length, animationDuration);
    });
  }

  resetSearchManual() {
    this.widgetObserver.emit({
      context: WidgetObserverService.contexts.CONTACT_MANAGER_NEW_SEARCH,
      value: {}
    });
    this.resetSearch();
  }

  resetSearch() {
    this.searchParams = {
      ...this.searchParams,
      query: '',
      offset: 0
    };
    this.searchResult = [];
    this.paginationVisible = false;
    this.noResults = false;
    this.hiddenSearch = false;
    this.searchControl.setValue('', { emitEvent: false });
  }

  addUser() {
    if (!this.contactManager) {
      throw new Error('No contactManager');
    }

    const twilioData: Partial<TwilioData> = { ...this.twilioData };
    if (twilioData?.name?.match(/\+\d{4,}/)) {
      twilioData.phone = twilioData.name;
      delete twilioData.name;
    }
    this.contactManagerDialog.openDialog({
      componentRef: ContactManagerDetailsComponent,
      data: {
        contactManager: twilioData
          ? {
            [this.contactManager.email]: twilioData.email,
            [this.contactManager.contactName]: twilioData.name,
            [this.contactManager.phone]: twilioData.phone
          }
          : {},
        contactManagerValue: this.contactManager,
        initialMode: ManageMode.addToPortal,
        addNew: true
      }
    });
  }

  private setPaginationVisibility(items: ContactManagerSearchResult[]) {
    this.paginationVisible = this.searchParams.offset > 0 || items?.length === this.searchParams.limit;
  }

  private listenUpdateEvents() {
    this.unsub.subs = this.widgetObserver.widget$
      .subscribe((data: WidgetEmitData) => {
        switch (data.context) {
          case WidgetObserverService.contexts.CONTACT_MANAGER_DELETED:
          case WidgetObserverService.contexts.CONTACT_MANAGER_ADDED_NEW:
            this.loadItems(this.searchParams.query, false);
            break;
          case WidgetObserverService.contexts.CONTACT_MANAGER_INVITED:
            this.searchResult = this.searchResult.map((item: ContactManagerSearchResult) => {
              if (item.PortalUserId === data.value) {
                return { ...item, ['Portal User Status']: 'Invited' };
              }
              return item;
            });
            break;
          default:
            break;
        }
      });
  }

  private listenToTwilio(): void {
    this.unsub.subs = this.widgetObserver.widget$
      .pipe(
        filter(message => message.context === WidgetObserverService.contexts.TWILIO_MESSAGE),
        filter(message => message.componentId === this.componentId || !this.componentId)
      )
      .subscribe(message => {
        switch (message.value.actionType) {
          case 'afterSelectTask':
          case 'beforeAcceptTask':
          case 'afterAcceptTask':
            break;
          case 'beforeSelectTask':
            const searchQuery = message.value.email || message.value.phone || message.value.name;
            this.resetSearch();
            this.searchParams.query = searchQuery;
            this.currentPage = 1;
            this.hiddenSearch = true;
            this.loadItems(searchQuery);
            break;
          case 'voiceCallHangup':
            const currentPhone = this.twilioData?.phone || this.twilioData?.name || '';
            const eventPhone = message.value.phone || message.value.name;
            if (this.twilioData && currentPhone === eventPhone) {
              this.resetSearch();
            }
            break;
          case 'beforeCompleteTask':
          case 'beforeRejectTask':
          case 'afterRejectTask':
          case 'beforeSetActivity':
            this.resetSearch();
            break;
          default:
            this.resetSearch();
        }
      });
  }

  private listenToSearchEvents() {
    this.unsub.subs = this.widgetObserver.widgetBehaviour$
      .pipe(
        filter(isWidgetEmitData),
        filter(data => data.value
          && this.componentId === data.componentId
          && data.context === WidgetObserverService.contexts.SET_CONTACT_MANAGER_SETTINGS)
      )
      .subscribe(data => {
        const settings: ContactManagerSettings = data.value;
        if (settings.initialSearch) {
          this.resetSearch();
          const initialSearchQuery = ' ';
          this.searchParams.query = initialSearchQuery;
          this.currentPage = 1;
          this.hiddenSearch = true;
          this.searchControl.setValue(initialSearchQuery, { emitEvent: false });
          this.loadItems(initialSearchQuery);
        }
        this.dialogMode = settings.dialogMode;
      });
    this.unsub.subs = this.widgetObserver.widgetBehaviour$
      .pipe(
        filter(isWidgetEmitData),
        filter(message =>
          this.componentId === message.componentId && message.context === WidgetObserverService.contexts.SEARCH_CONTACT_MANAGER
        )
      )
      .subscribe(message => {
        const searchQuery = message.value || '';
        this.resetSearch();
        this.searchParams.query = searchQuery;
        this.currentPage = 1;
        this.searchControl.setValue(searchQuery, { emitEvent: false });
        this.loadItems(searchQuery);
      });
  }
}
