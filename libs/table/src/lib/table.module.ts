import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { CustomTableComponent } from './custom-table/custom-table.component';
import { DefaultTableComponent } from './default-table/default-table.component';
import { DidiTableComponent } from './table.component';
import { TimelineComponent } from './timeline/timeline.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgbPaginationModule,
    NgbTooltipModule
  ],
  declarations: [
    CustomTableComponent,
    DefaultTableComponent,
    DidiTableComponent,
    TimelineComponent
  ],
  exports: [
    DidiTableComponent
  ]
})
export class DidiTableModule {
}
