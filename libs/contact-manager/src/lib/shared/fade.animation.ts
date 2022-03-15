import { animate, state, style, transition, trigger } from '@angular/animations';
import { animationDuration } from './animation.config';

export const animations = [
  trigger('fadeBoth', [
    state('in', style({ opacity: 1 })),
    transition(':enter', [
      style({ opacity: 0 }),
      animate(`${animationDuration}ms ease-in`)
    ]),
    transition(':leave',
      animate(`${animationDuration}ms ease-out`, style({ opacity: 0 })))
  ]),
  trigger('fadeIn', [
    state('in', style({ opacity: 1 })),
    transition(':enter', [
      style({ opacity: 0 }),
      animate(`${animationDuration}ms ease-in`)
    ]),
    transition(':leave',
      animate(0, style({ opacity: 0 })))
  ])
];
