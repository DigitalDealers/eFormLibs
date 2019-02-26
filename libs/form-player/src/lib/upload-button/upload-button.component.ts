import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { SafetyApiService } from '@didi/safety-api';
import { FileUploadedItem } from '../types';

@Component({
  selector: 'didi-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent {
  public loading = false;
  @Input() public multi = false;
  @Input() public field;
  @Input() public readonly;
  @Output() public filePath = new EventEmitter<FileUploadedItem[]>();
  @ViewChild('inputUpload') public inputUpload: ElementRef;
  @ViewChild('inputUploadMulti') public inputUploadMulti: ElementRef;

  constructor(private _safetyApi: SafetyApiService) {}

  public async upload(event) {
    const oldFiles = this.field || [];
    this.loading = true;
    let urls: FileUploadedItem[] = await this._safetyApi.myForm.uploadFiles(
      event.target.files
    );

    if (this.multi) {
      urls = [...oldFiles, ...urls];
    }
    this.filePath.emit(urls);
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  public remove(url) {
    if (this.multi) {
      this.inputUploadMulti.nativeElement.value = null;
    } else {
      this.inputUpload.nativeElement.value = null;
    }
    const images = this.field.filter(el => el.url !== url);
    this.filePath.emit(images);
  }
}
