import { Component } from '@angular/core';
import { BaseTable } from '../BaseTable';

@Component({
  selector: 'didi-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss']
})
export class CustomTableComponent extends BaseTable {}
