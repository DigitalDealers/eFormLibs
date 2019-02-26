import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableColumnDialogComponent } from './table-column-dialog.component';

describe('TableColumnDialogComponent', () => {
  let component: TableColumnDialogComponent;
  let fixture: ComponentFixture<TableColumnDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableColumnDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableColumnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
