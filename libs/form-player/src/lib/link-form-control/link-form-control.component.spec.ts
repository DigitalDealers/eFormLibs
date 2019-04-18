import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkFormControlComponent } from './link-form-control.component';

describe('LinkFormControlComponent', () => {
  let component: LinkFormControlComponent;
  let fixture: ComponentFixture<LinkFormControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkFormControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
