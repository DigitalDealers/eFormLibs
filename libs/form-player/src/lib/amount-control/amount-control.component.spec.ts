import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountControlComponent } from './amount-control.component';

describe('AmountControlComponent', () => {
  let component: AmountControlComponent;
  let fixture: ComponentFixture<AmountControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmountControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
