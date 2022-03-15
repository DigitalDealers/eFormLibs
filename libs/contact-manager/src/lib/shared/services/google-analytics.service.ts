import { Inject, Injectable } from '@angular/core';
import { DOCUMENT, } from '@angular/common';
import { fromEvent, ReplaySubject } from 'rxjs';
import { first, mergeMap } from 'rxjs/operators';

import { ContactGaEvent } from '../interfaces/contact-ga-event.interface';

declare let gtag: Function;

@Injectable()
export class GoogleAnalyticsEventsService {
  emitGtagEvent$: ReplaySubject<ContactGaEvent> = new ReplaySubject<ContactGaEvent>();
  private initialized: boolean;

  static getInviteEvent(): Partial<ContactGaEvent> {
    return {
      eventAction: 'click',
      eventLabel: 'Invite',
      inviteDate: GoogleAnalyticsEventsService.getFormattedDate()
    };
  }

  private static getFormattedDate() {
    function  addZero(value: number) {
      return ('0' + value).slice(-2);
    }
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const currentDate = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const sec = date.getSeconds();
    ('0' + 101).slice(-2);
    return `${year}-${addZero(month)}-${addZero(currentDate)}T${addZero(hours)}-${addZero(minutes)}-${addZero(sec)}`;
  }

  constructor(@Inject(DOCUMENT) private document: any) {
  }

  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    const key = 'UA-122889796-1';
    window['dataLayer'] = window['dataLayer'] || [];
    window['gtag'] = function () {
      window['dataLayer'].push(arguments);
    };
    gtag('js', new Date());
    gtag('config', key, {
      'custom_map': {
        'dimension1': 'user',
        'dimension2': 'invite_date',
        'dimension3': 'user_name',
        'dimension4': 'invited_user',
        'dimension5': 'dealer_id',
      }
    });
    const script = this.document.createElement('script') as HTMLScriptElement;
    const listenGtagEvents$ = fromEvent(script, 'load')
      .pipe(
        first(),
        mergeMap(() => this.emitGtagEvent$)
      );
    script.src = `https://www.googletagmanager.com/gtag/js?id=${key}`;
    document.body.appendChild(script);

    listenGtagEvents$.subscribe((gtagEvent: ContactGaEvent) => {
      gtag('event', gtagEvent.eventAction, {
        event_category: gtagEvent.eventCategory,
        event_label: gtagEvent.eventLabel,
        user: null,
        invite_date: gtagEvent.inviteDate,
        user_name: gtagEvent.userName,
        invited_user: gtagEvent.invitedUser,
        dealer_id: gtagEvent.dealerId,
      });
    });
  }
}

