import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';
import { SafetyApiService } from '@didi/safety-api';
import { FileUploadedItem } from '../types';

@Component({
  selector: 'didi-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {
  @Input() public field;
  @Input() public readonly;
  @Input() public form;
  @Output() public filePath: EventEmitter<
    FileUploadedItem[]
  > = new EventEmitter();

  @ViewChild('inputUpload')
  public inputUpload: ElementRef;

  public loading = false;

  constructor(private _safetyApi: SafetyApiService) {}

  ngOnInit() {}

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
