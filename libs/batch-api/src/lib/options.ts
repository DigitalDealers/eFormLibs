import { InjectionToken } from '@angular/core';

import { ModuleOptions } from './interfaces/module-options.interface';

export const OPTIONS = new InjectionToken<ModuleOptions>('OPTIONS');
