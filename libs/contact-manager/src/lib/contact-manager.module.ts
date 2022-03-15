import { PortalModule } from '@angular/cdk/portal';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CookieService } from 'ngx-cookie-service';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { AssociatedContactsComponent } from './associated-contacts/associated-contacts.component';
import { ContactManagerAvatarComponent } from './contact-manager-avatar/contact-manager-avatar.component';
import { contactManagerConfigToken } from './contact-manager-config.token';
import { ContactManagerDetailsComponent } from './contact-manager-details/contact-manager-details.component';
import { ContactManagerDialogComponent } from './contact-manager-dialog/contact-manager-dialog.component';
import { ContactManagerDialogService } from './contact-manager-dialog/contact-manager-dialog.service';
import { ContactManagerListComponent } from './contact-manager-list/contact-manager-list.component';
import { ContactManagerSearchComponent } from './contact-manager-search/contact-manager-search.component';
import { ContactManagerComponent } from './contact-manager.component';
import { ContactManagerService } from './contact-manager.service';
import { InviteContactManagerComponent } from './invite-contact-manager/invite-contact-manager.component';
import { ManageDetailsComponent } from './manage-details/manage-details.component';
import { ContactManagerConfig } from './shared/interfaces/contact-manager-config.interface';
import { AuthApiService } from './shared/services/auth-api.service';
import { ConfigService } from './shared/services/config.service';
import { DataSetSearchService } from './shared/services/data-set-search.service';
import { EntitiesService } from './shared/services/entities.service';
import { GoogleAnalyticsEventsService } from './shared/services/google-analytics.service';
import { HttpBackendClientService } from './shared/services/http-backend-client.service';
import { SecurityService } from './shared/services/security.service';
import { WidgetObserverService } from './shared/services/widget-observer.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const matModules = [
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule,
  MatChipsModule,
  PortalModule,
  CdkTableModule
];

const dialogs = [
  InviteContactManagerComponent,
  AssociatedContactsComponent,
  ContactManagerDetailsComponent,
  ContactManagerDialogComponent
];

const components = [
  ContactManagerAvatarComponent,
  ContactManagerComponent,
  ContactManagerListComponent,
  ContactManagerSearchComponent,
  ManageDetailsComponent
];

const publicComponents = [
  ContactManagerComponent,
  ContactManagerDialogComponent
];

@NgModule({
  declarations: [
    ...dialogs,
    ...components,
    ...publicComponents
  ],
  imports: [
    ...matModules,
    CommonModule,
    FormsModule,
    PerfectScrollbarModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000 }
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    WidgetObserverService,
    ContactManagerService,
    ContactManagerDialogService,
    AuthApiService,
    ConfigService,
    HttpBackendClientService,
    DataSetSearchService,
    EntitiesService,
    CookieService,
    SecurityService,
    GoogleAnalyticsEventsService
  ],
  exports: [
    ...publicComponents
  ]
})
export class ContactManagerModule {
  static forRoot(config: ContactManagerConfig): ModuleWithProviders<ContactManagerModule> {
    return {
      ngModule: ContactManagerModule,
      providers: [
        {
          provide: contactManagerConfigToken,
          useValue: config
        }
      ]
    };
  }
}
