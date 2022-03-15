import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { UserAvatarService } from '../shared/services/user-avatar.service';

@Component({
  selector: 'didi-contact-manager-avatar',
  templateUrl: './contact-manager-avatar.component.html',
  styleUrls: ['./contact-manager-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactManagerAvatarComponent implements OnChanges {
  @Input() customerName: string;
  @Input() isActive: boolean;
  @Input() inactive: boolean;
  @Output() picture: EventEmitter<string> = new EventEmitter<string>();
  dataUrl: string;

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.customerName && changes.customerName.currentValue
      && changes.customerName.currentValue !== changes.customerName.previousValue) {
      this.dataUrl = UserAvatarService.generateAvatarFromName(changes.customerName.currentValue);
    }
  }
}
