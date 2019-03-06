import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SafetyApiService } from '@digitaldealers/safety-api';

import { FileUploadedItem } from '../types/upload-file-item';

@Component({
  selector: 'didi-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent {
  @Input() public field;
  @Input() public readonly;
  @Input() public form;
  @Output() public filePath = new EventEmitter<FileUploadedItem[]>();

  @ViewChild('inputUpload')
  public inputUpload: ElementRef;

  public loading = false;

  constructor(private _safetyApi: SafetyApiService) {}

  public async upload(event) {
    this.loading = true;
    let urls: FileUploadedItem[] = await this._safetyApi.myForm.uploadFiles(
      event.target.files
    );
    if (this.field && this.field.length) {
      urls = [...this.field, ...urls];
    }
    this.filePath.emit(urls);
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  public remove(url) {
    this.inputUpload.nativeElement.value = '';

    const images = this.field.filter(el => el.url !== url);
    this.filePath.emit(images);
  }
}
