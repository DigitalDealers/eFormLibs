import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  ElementRef
} from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { SafetyApiService } from '@didi/safety-api';
import { FileUploadedItem } from '../types';

@Component({
  selector: 'didi-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class DidiElectronicSignatureComponent implements OnInit, AfterViewInit {
  @Input() public field;
  @Input() public invalid;
  @Input() public readonly;

  @Output()
  public filePath: EventEmitter<FileUploadedItem> = new EventEmitter();

  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('container') container: ElementRef;

  public signaturePadOptions: Object = {
    dotSize: 1,
    minWidth: 0.8,
    penColor: '#59607c',
    canvasWidth: 500,
    canvasHeight: 150
  };

  public imageUrl = '';

  public loading = false;

  constructor(private _safetyApi: SafetyApiService) {}

  ngOnInit() {}

  public ngAfterViewInit() {
    // this.signaturePad is now available
    if (this.signaturePad) {
      this.signaturePad.set('minWidth', 0.8); // set szimek/signature_pad options at runtime
      this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
      this.beResponsive();
    }
  }

  public beResponsive() {
    const { clientWidth } = this.container.nativeElement;
    this.signaturePad.set('canvasWidth', clientWidth);
  }

  public clear() {
    this.signaturePad.clear();
  }

  public remove() {
    this.signaturePad.clear();
    this.filePath.emit(null);
  }

  public drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
  }

  public drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
  }

  public async save() {
    this.loading = true;
    const urls: FileUploadedItem[] = await this._safetyApi.myForm.uploadFiles([
      this._dataURItoBlob(this.signaturePad.toDataURL())
    ]);

    this.filePath.emit(urls[0]);
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  private _dataURItoBlob(dataURI) {
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
