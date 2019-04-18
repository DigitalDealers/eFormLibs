import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'didi-link-confirm',
  templateUrl: './link-confirm.component.html',
  styleUrls: ['./link-confirm.component.scss']
})
export class LinkConfirmComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
