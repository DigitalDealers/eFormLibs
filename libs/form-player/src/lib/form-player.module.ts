import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatOptionModule,
  MatNativeDateModule,
  MatDialogModule
} from '@angular/material';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SignaturePadModule } from 'angular2-signaturepad';
import { DidiSafetyApiModule } from '@didi/safety-api';

import { FormPlayerComponent } from './form/form-player.component';
import { UploadButtonComponent } from './upload-button/upload-button.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DidiElectronicSignatureComponent } from './electronic-signature/electronic-signature.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { InputControlComponent } from './input-control/input-control.component';
import { AmountControlComponent } from './amount-control/amount-control.component';
import { TableControlComponent } from './table-control/table-control.component';
import { TableColumnDialogComponent } from './table-column-dialog/table-column-dialog.component';
import { TableColumnDialogService } from './table-column-dialog/table-column-dialog.service';
import { FormObserverService } from './form-observer.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatListModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatNativeDateModule,
    SignaturePadModule,
    PerfectScrollbarModule,
    DidiSafetyApiModule
  ],
  declarations: [
    FormPlayerComponent,
    UploadButtonComponent,
    DropdownComponent,
    DidiElectronicSignatureComponent,
    FormFieldComponent,
    DatetimePickerComponent,
    AttachmentComponent,
    InputControlComponent,
    AmountControlComponent,
    TableControlComponent,
    TableColumnDialogComponent
  ],
  providers: [TableColumnDialogService, FormObserverService],
  entryComponents: [TableColumnDialogComponent],
  exports: [FormPlayerComponent]
})
export class DidiFormPlayerModule {}
