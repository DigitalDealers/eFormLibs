import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultTableComponent } from './default-table.component';

describe('DefaultTableComponent', () => {
  let component: DefaultTableComponent;
  let fixture: ComponentFixture<DefaultTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
