import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * @deprecated Use unsubscribe service
 * Overriding ngOnDestroy doesn't work
 */
export class BaseComponent implements OnDestroy {
  private subscriptions = new Subscription();

  constructor() {
    // Prevent memory leak when overriding destroy hook
    const originalOnDestroy = this.ngOnDestroy;
    this.ngOnDestroy = () => {
      this.onDestroy();
      originalOnDestroy.apply(this);
    };
  }

  protected set subs(sub: Subscription) {
    this.subscriptions.add(sub);
  }

  public ngOnDestroy(): void {
  }

  private onDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
