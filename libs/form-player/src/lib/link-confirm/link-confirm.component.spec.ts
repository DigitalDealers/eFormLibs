import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkConfirmComponent } from './link-confirm.component';

describe('LinkConfirmComponent', () => {
  let component: LinkConfirmComponent;
  let fixture: ComponentFixture<LinkConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
