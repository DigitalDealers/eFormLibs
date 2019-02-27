import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatNativeDateModule, MatOptionModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SignaturePadModule } from 'angular2-signaturepad';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { DidiSafetyApiModule } from 'eformlibs/safety-api';
import { AmountControlComponent } from './amount-control/amount-control.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DidiElectronicSignatureComponent } from './electronic-signature/electronic-signature.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { FormObserverService } from './form-observer.service';
import { FormPlayerComponent } from './form/form-player.component';
import { InputControlComponent } from './input-control/input-control.component';
import { TableColumnDialogComponent } from './table-column-dialog/table-column-dialog.component';
import { TableColumnDialogService } from './table-column-dialog/table-column-dialog.service';
import { TableControlComponent } from './table-control/table-control.component';
import { UploadButtonComponent } from './upload-button/upload-button.component';

@NgModule({
  imports: [
    CommonModule,
    DidiSafetyApiModule,
    MatAutocompleteModule,
    MatButtonModule,
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
    TableColumnDialogComponent,
    TableControlComponent,
    UploadButtonComponent
  ],
  providers: [
    FormObserverService,
    TableColumnDialogService
  ],
  entryComponents: [
    TableColumnDialogComponent
  ],
  exports: [
    FormPlayerComponent
  ]
})
export class DidiFormPlayerModule {}
