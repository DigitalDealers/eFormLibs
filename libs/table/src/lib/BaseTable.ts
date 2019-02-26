import { Input, OnInit, EventEmitter, Output } from '@angular/core';

export class BaseTable implements OnInit {
  @Input() public settings;
  @Input() public rows;
  @Input() public source;
  @Input() public colCount;
  @Output() public actionClick: EventEmitter<any> = new EventEmitter();
  @Output() public selectRow: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  public handleActionClick(event, row, action, isDisabled) {
    this.actionClick.emit({ event, row, action, isDisabled });
  }

  public handleSelectRow(row) {
    this.selectRow.emit(row);
  }
}
