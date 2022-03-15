import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable()
export class UnsubscribeService implements OnDestroy {
  private subscriptions = new Subscription();

  public set subs(sub: Subscription) {
    this.subscriptions.add(sub);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
