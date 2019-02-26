import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm.component';
import { DidiConfirmService } from './confirm.service';

@NgModule({
  imports: [MatDialogModule, MatButtonModule],
  declarations: [ConfirmDialogComponent],
  providers: [DidiConfirmService],
  entryComponents: [ConfirmDialogComponent]
})
export class DidiConfirmModule {}
