import { Component, EventEmitter, Input, OnInit, Output, Self } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { animations } from './shared/fade.animation';
import { ContactManager } from './shared/interfaces/contact-manager.interface';
import { TwilioData } from './shared/interfaces/twilio-data.interface';
import { WidgetEmitData } from './shared/interfaces/widget-emit-data.interface';
import { GoogleAnalyticsEventsService } from './shared/services/google-analytics.service';
import { UnsubscribeService } from './shared/services/unsubscribe.service';
import { WidgetObserverService } from './shared/services/widget-observer.service';

@Component({
  selector: 'didi-contact-manager',
  templateUrl: './contact-manager.component.html',
  styleUrls: ['./contact-manager.component.scss'],
  animations: [...animations],
  providers: [UnsubscribeService]
})
export class ContactManagerComponent implements OnInit {
  @Input() componentId?: number;
  @Input() contactManager?: ContactManager;
  @Input() twilioData?: TwilioData;
  @Input() inputEvents$?: Observable<WidgetEmitData>;
  @Output() outputEvents = new EventEmitter<WidgetEmitData>();

  constructor(
    @Self() private unsub: UnsubscribeService,
    private widgetObserver: WidgetObserverService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
  }

  ngOnInit() {
    this.googleAnalyticsEventsService.init();
    this.connectEventsToWidgetObserverService();
    this.unsub.subs = this.widgetObserver.widget$
      .pipe(
        filter(message => !message.inputEvent)
      )
      .subscribe(message => {
        this.outputEvents.emit(message);
      });
  }

  private connectEventsToWidgetObserverService(): void {
    if (this.inputEvents$) {
      this.unsub.subs = this.inputEvents$
        .subscribe(message => {
          this.widgetObserver.emit({
            ...message,
            componentId: this.componentId,
            inputEvent: true
          } as WidgetEmitData);
        });
    }
  }
}
