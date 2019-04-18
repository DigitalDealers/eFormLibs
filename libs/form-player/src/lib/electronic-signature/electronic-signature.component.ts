import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { BaseComponent } from '@digitaldealers/base-component';
import { BatchApiService } from '@digitaldealers/batch-api';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';

import { FileUploadedItem } from '../interfaces/upload-file-item';

@Component({
  selector: 'didi-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class DidiElectronicSignatureComponent extends BaseComponent implements AfterViewInit, OnInit {
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('container') container: ElementRef;

  @Input() public field: FileUploadedItem;
  @Input() public invalid: boolean;
  @Input() public readonly: boolean;
  @Input() public assetKey: string;

  @Output() public filePath = new EventEmitter<FileUploadedItem>();

  public signaturePadOptions: Object = {
    dotSize: 1,
    minWidth: 0.8,
    penColor: '#59607c',
    canvasWidth: 500,
    canvasHeight: 150
  };
  public loading = false;

  public get fileUrl(): string {
    return this.field && (this.field.url + this.assetKey) || '';
  }

  private windowResize$ = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private batchApi: BatchApiService
  ) {
    super();
  }

  @HostListener('window:resize') onResizeWindow() {
    this.windowResize$.next();
  }

  public ngOnInit(): void {
    this.subs = this.windowResize$.asObservable()
      .pipe(debounceTime(500))
      .subscribe(() => this.beResponsive());
  }

  public ngAfterViewInit() {
    // this.signaturePad is now available
    if (this.signaturePad) {
      this.signaturePad.set('minWidth', 0.8); // set szimek/signature_pad options at runtime
      this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
      this.beResponsive();
    }
  }

  public clear() {
    this.signaturePad.clear();
  }

  public remove() {
    this.signaturePad.clear();
    this.filePath.emit(null);
    // Set correct canvas width after removing image
    setTimeout(() => this.beResponsive());
  }

  public save(): void {
    this.loading = true;
    const file = this.dataURItoBlob(this.signaturePad.toDataURL());

    this.subs = this.batchApi.upload.uploadFiles([file], 'signature.png')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => this.filePath.emit(res[0]),
        error: err => {
          console.error(err);
          this.snackBar.open('File upload error. Please try again.', null, { duration: 3000 });
        }
      });
  }

  private beResponsive(): void {
    if (this.container) {
      const { clientWidth } = this.container.nativeElement;
      this.signaturePad.set('canvasWidth', clientWidth);
    }
  }

  private dataURItoBlob(dataURI): Blob {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    const mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const dw = new DataView(ab);
    for (let i = 0; i < byteString.length; i++) {
      dw.setUint8(i, byteString.charCodeAt(i));
    }
    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], { type: mimeString });
  }
}
