import { Component, Inject, OnInit, Self } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { ContactManagerService } from '../contact-manager.service';
import { ContactManagerSearchResult } from '../shared/interfaces/contact-manager-search-result.interface';
import { ContactManagerSettings } from '../shared/interfaces/contact-manager-settings.interface';
import { ContactManager } from '../shared/interfaces/contact-manager.interface';
import { ModuleWidget } from '../shared/interfaces/module-widget.interface';
import { WidgetEmitData } from '../shared/interfaces/widget-emit-data.interface';
import { DidiRole } from '../shared/roles.enum';
import { SecurityService } from '../shared/services/security.service';
import { UnsubscribeService } from '../shared/services/unsubscribe.service';
import { WidgetObserverService } from '../shared/services/widget-observer.service';

@Component({
  selector: 'didi-contact-manager-dialog',
  templateUrl: './contact-manager-dialog.component.html',
  styleUrls: ['./contact-manager-dialog.component.scss'],
  providers: [UnsubscribeService]
})
export class ContactManagerDialogComponent implements OnInit {
  public contactManager?: ContactManager | null;
  public widgetsLoading = false;
  public isContactAdmin = false;
  public contactManagerId = Date.now();

  private readonly contactManagerSettings: Partial<ContactManagerSettings>;

  private static getWidgetConfig<T = unknown>(modules: ModuleWidget[], widgetType: string, field: string): T | null {
    const module = modules.find(widget => widget.type?.type === widgetType);
    if (!module?.[field as keyof ModuleWidget]) {
      return null;
    }
    const value = module[field as keyof ModuleWidget];
    return (typeof value === 'string') ? (JSON.parse(value) as T) : (value as unknown as T);
  }

  constructor(
    @Self() private unsub: UnsubscribeService,
    private dialogRef: MatDialogRef<ContactManagerSearchResult>,
    private security: SecurityService,
    private contactManagerService: ContactManagerService,
    private widgetObserver: WidgetObserverService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.contactManagerSettings = data;
  }

  ngOnInit() {
    const widgetType = 'contactManager';
    this.widgetsLoading = true;
    this.unsub.subs = this.contactManagerService.getCommunicationCentreModules()
      .pipe(finalize(() => this.widgetsLoading = false))
      .subscribe({
        next: res => {
          this.contactManager = ContactManagerDialogComponent.getWidgetConfig<ContactManager>(
            res,
            widgetType,
            widgetType
          );

          // Wait contact manager initialization
          setTimeout(() => {
            if (this.contactManagerSettings.search) {
              this.widgetObserver.emitBehaviourEvent({
                componentId: this.contactManagerId,
                context: WidgetObserverService.contexts.SEARCH_CONTACT_MANAGER,
                value: this.contactManagerSettings.search
              });
            }
            this.widgetObserver.emitBehaviourEvent({
              componentId: this.contactManagerId,
              context: WidgetObserverService.contexts.SET_CONTACT_MANAGER_SETTINGS,
              value: {
                ...this.contactManagerSettings,
                dialogMode: true
              }
            });
          });
        },
        error: err => console.error(err)
      });
    this.unsub.subs = this.security.getUserRoles().subscribe((roles: string[]) => {
      this.isContactAdmin = roles.indexOf(DidiRole.CONTACT_ADMIN) >= 0;
    });
  }

  onContactManagerEvent(message: WidgetEmitData) {
    if (message.context === WidgetObserverService.contexts.SELECT_CONTACT_MANAGER) {
      this.dialogRef.close(message.value);
    }
  }
}
