import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { BaseComponent } from '@digitaldealers/base-component';
import { BatchApiService } from '@digitaldealers/batch-api';
import { finalize } from 'rxjs/operators';

import { FileUploadedItem } from '../interfaces/upload-file-item';

@Component({
  selector: 'didi-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent extends BaseComponent {
  @ViewChild('inputUpload') private inputUpload: ElementRef;

  @Input() public field: FileUploadedItem[];
  @Input() public readonly: boolean;
  @Input() public form: FormGroup;
  @Input() public assetKey: string;

  @Output() public filePath = new EventEmitter<FileUploadedItem[]>();

  public loading: boolean;

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
        next: res => this.filePath.emit([...(this.field || []), ...res]),
        error: err => {
          console.error(err);
          this.snackBar.open('File upload error. Please try again.', null, { duration: 3000 });
        }
      });
  }

  public remove(url: string): void {
    this.inputUpload.nativeElement.value = '';
    const images = this.field.filter(el => el.url !== url);
    this.filePath.emit(images);
  }

  public getFullUrl(url: string): string {
    return url + this.assetKey;
  }
}
