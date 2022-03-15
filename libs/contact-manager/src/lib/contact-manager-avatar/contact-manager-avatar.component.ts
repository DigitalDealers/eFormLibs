import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { UserAvatarService } from '../shared/services/user-avatar.service';

@Component({
  selector: 'didi-contact-manager-avatar',
  templateUrl: './contact-manager-avatar.component.html',
  styleUrls: ['./contact-manager-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactManagerAvatarComponent implements OnChanges {
  @Input() customerName?: string;
  @Input() isActive?: boolean;
  @Input() inactive?: boolean;

  public dataUrl?: string;

  ngOnChanges({ customerName }: SimpleChanges) {
    if (customerName?.currentValue && customerName.currentValue !== customerName?.previousValue) {
      this.dataUrl = UserAvatarService.generateAvatarFromName(customerName.currentValue);
    }
  }
}
