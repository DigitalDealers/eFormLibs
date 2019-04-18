import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { BaseComponent } from '@digitaldealers/base-component';
import { BatchApiService } from '@digitaldealers/batch-api';
import { finalize } from 'rxjs/operators';

import { FileUploadedItem } from '../interfaces/upload-file-item';

@Component({
  selector: 'didi-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent extends BaseComponent {
  @ViewChild('inputUpload') public inputUpload: ElementRef;
  @ViewChild('inputUploadMulti') public inputUploadMulti: ElementRef;

  @Input() public multi = false;
  @Input() public field: FileUploadedItem[];
  @Input() public readonly: boolean;
  @Input() public assetKey: string;

  @Output() public filePath = new EventEmitter<FileUploadedItem[]>();

  public loading = false;

  constructor(
    private snackBar: MatSnackBar,
    private batchApi: BatchApiService
    ) {
    super();
  }

  public upload({ target }: Event): void {
    this.loading = true;
    const files: File[] = Array.from((target as HTMLInputElement).files);

    this.subs = this.batchApi.upload.uploadFiles(files)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => {
          const urls = this.multi ? [...(this.field || []), ...res] : res;
          this.filePath.emit(urls);
        },
        error: err => {
          console.error(err);
          this.snackBar.open('File upload error. Please try again.', null, { duration: 3000 });
        }
      });
  }

  public remove(url: string): void {
    if (this.multi) {
      this.inputUploadMulti.nativeElement.value = null;
    } else {
      this.inputUpload.nativeElement.value = null;
    }
    const images = this.field.filter(el => el.url !== url);
    this.filePath.emit(images);
  }

  public getFullUrl(url: string): string {
    return url + this.assetKey;
  }
}
