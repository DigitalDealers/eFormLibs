import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';

import { map, startWith, debounceTime, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { BatchApiService } from '@didi/batch-api';

interface DropdownOption {
  key: string;
  value: string;
}

@Component({
  selector: 'didi-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() public field;
  @Input() public value;

  @Output() public handleSelect = new EventEmitter();

  public items;
  public filteredOptions: Observable<DropdownOption[]>;
  public dropdownControl = new FormControl();

  constructor(private _batchApi: BatchApiService) {
  }

  ngOnInit() {
    this.dropdownControl.setValue(this.value);
    const params = new HttpParams().set('limit', '10').set('offset', '0');
    this._getItems(params).subscribe(res => {
      this.items = res;
      this.filteredOptions = this.dropdownControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        switchMap(item => {
          if (item && typeof item !== 'string') {
            this.handleSelect.emit({
              controlName: this.field.controlName,
              value: item
            });
            return of(this.items);
          }
          return this._filter(item);
        })
      );
    });
  }

  public trackByFn(index, item) {
    return item.key;
  }

  public displayFn(option?: DropdownOption): string | undefined {
    return option ? option.value : undefined;
  }

  private _filter(item) {
    const filterValue = item.toLowerCase();
    const params = new HttpParams()
      .set('limit', filterValue ? '1000' : '10')
      .set('offset', '0')
      .set('query', filterValue);
    return this._getItems(params);
  }

  private _getItems(params) {
    return this._batchApi.search
      .getSearchEntities(this.field.dataSetId, params)
      .pipe(
        map(res => {
          const { headerRows } = res;
          return headerRows.map(el => ({
            key: el.values[this.field.dropdownValue],
            value: el.values[this.field.dropdownLabel]
          }));
        })
      );
  }
}
