import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatOptionModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSelectModule,
  MatSnackBarModule
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { SignaturePadModule } from 'angular2-signaturepad';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { AmountControlComponent } from './amount-control/amount-control.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DidiElectronicSignatureComponent } from './electronic-signature/electronic-signature.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { FormObserverService } from './form-observer.service';
import { FormPlayerComponent } from './form/form-player.component';
import { InputControlComponent } from './input-control/input-control.component';
import { LinkConfirmComponent } from './link-confirm/link-confirm.component';
import { LinkConfirmService } from './link-confirm/link-confirm.service';
import { LinkFormControlComponent } from './link-form-control/link-form-control.component';
import { LocationControlComponent } from './location-control/location-control.component';
import { TableColumnDialogComponent } from './table-column-dialog/table-column-dialog.component';
import { TableColumnDialogService } from './table-column-dialog/table-column-dialog.service';
import { TableControlComponent } from './table-control/table-control.component';
import { UploadButtonComponent } from './upload-button/upload-button.component';

@NgModule({
  imports: [
    AgmCoreModule,
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGoogleMapsAutocompleteModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMomentDateModule,
    MatNativeDateModule,
    MatOptionModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    PerfectScrollbarModule,
    ReactiveFormsModule,
    SignaturePadModule
  ],
  declarations: [
    AmountControlComponent,
    AttachmentComponent,
    DatetimePickerComponent,
    DidiElectronicSignatureComponent,
    DropdownComponent,
    FormFieldComponent,
    FormPlayerComponent,
    InputControlComponent,
    LinkConfirmComponent,
    LinkFormControlComponent,
    LocationControlComponent,
    TableColumnDialogComponent,
    TableControlComponent,
    UploadButtonComponent
  ],
  providers: [
    FormObserverService,
    LinkConfirmService,
    TableColumnDialogService
  ],
  entryComponents: [
    LinkConfirmComponent,
    TableColumnDialogComponent
  ],
  exports: [
    FormPlayerComponent
  ]
})
export class DidiFormPlayerModule {}
