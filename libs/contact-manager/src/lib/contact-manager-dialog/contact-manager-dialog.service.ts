import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogConfig } from '@angular/material/dialog';

import { contactManagerDefaultSettings } from '../shared/contact-manager-default-settings.constant';
import { ContactManagerSettings } from '../shared/interfaces/contact-manager-settings.interface';
import { ContactManagerDialogSettings } from './contact-manager-dialog-settings.interface';
import { ContactManagerDialogComponent } from './contact-manager-dialog.component';
import { topLevelDialogClassName } from './top-level-dialog-class.contant';

@Injectable()
export class ContactManagerDialogService {
  private renderer: Renderer2;
  private openedDialogs: MatDialogRef<unknown>[] = [];
  readonly contactManagerDefaultSettings: ContactManagerSettings = {
    ...contactManagerDefaultSettings,
    dialogMode: true
  };

  private static getTopLevelModalElement(): HTMLElement {
    return document.getElementsByClassName(topLevelDialogClassName)[0] as HTMLElement;
  }

  private static showTopLevelModal(): void {
    const communicationCenterElement = ContactManagerDialogService.getTopLevelModalElement();
    if (communicationCenterElement) {
      const communicationCenterWrapperElement = communicationCenterElement && communicationCenterElement.parentElement as HTMLElement;
      communicationCenterElement.style.display = 'flex';
      if (communicationCenterWrapperElement) {
        communicationCenterWrapperElement.style.display = 'flex';
      }
    }
  }

  private static hideTopLevelModal(): void {
    const communicationCenterElement = ContactManagerDialogService.getTopLevelModalElement();
    if (communicationCenterElement) {
      const communicationCenterWrapperElement = communicationCenterElement && communicationCenterElement.parentElement as HTMLElement;
      (communicationCenterElement as HTMLElement).style.display = 'none';
      if (communicationCenterWrapperElement) {
        communicationCenterWrapperElement.style.display = 'none';
      }
    }
  }

  static hasTopLevelModal(): boolean {
    return !!ContactManagerDialogService.getTopLevelModalElement();
  }

  constructor(
    private dialog: MatDialog,
    private rendererFactory: RendererFactory2,
    private overlayContainer: OverlayContainer
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  openDialog({ data, componentRef, disableAnimation, prevDialogRef }: ContactManagerDialogSettings) {
    if (disableAnimation || ContactManagerDialogService.hasTopLevelModal()) {
      this.toggleModalAnimation(false);
    }
    const dialogRef = this.dialog.open(componentRef, {
      panelClass: ['didi-contact-manager-details', 'didi-communication-centre'],
      data
    });
    this.openedDialogs.push(dialogRef);
    this.handleDialogRefEvents(dialogRef);
    if (prevDialogRef) {
      setTimeout(() => prevDialogRef.close());
    }
    ContactManagerDialogService.hideTopLevelModal();
    return dialogRef;
  }

  public openContactManagerDialog(
    contactManagerSettings: Partial<ContactManagerSettings> = this.contactManagerDefaultSettings,
    dialogSettings?: MatDialogConfig
  ) {
    const panelClass = dialogSettings && dialogSettings.panelClass;
    const panelClasses = Array.isArray(panelClass)
      ? panelClass
      : [panelClass || ''];
    return this.dialog.open(ContactManagerDialogComponent, {
      ...dialogSettings,
      data: contactManagerSettings,
      panelClass: [
        'didi-parts-contact-manager-dialog',
        'didi-contact-manager-details',
        topLevelDialogClassName,
        ...panelClasses
      ]
    });
  }

  private handleDialogRefEvents(dialogRef: MatDialogRef<unknown>) {
    dialogRef.afterOpened()
      .subscribe(() => this.toggleModalAnimation(true));
    dialogRef.beforeClosed()
      .subscribe(() => {
        if (ContactManagerDialogService.hasTopLevelModal()) {
          this.toggleModalAnimation(false);
        }
        this.openedDialogs = this.openedDialogs.filter((openedDialog: MatDialogRef<unknown>) => {
          return openedDialog.id !== dialogRef.id;
        });
        if (this.openedDialogs.length === 0) {
          ContactManagerDialogService.showTopLevelModal();
        }
      });
    dialogRef.afterClosed()
      .subscribe(() => {
        if (ContactManagerDialogService.hasTopLevelModal()) {
          this.toggleModalAnimation(true);
        }
      });
  }

  private toggleModalAnimation(toggle: boolean): void {
    const overlayContainerElement: HTMLElement = this.overlayContainer.getContainerElement();
    this.renderer.setProperty(overlayContainerElement, '@.disabled', !toggle);
  }
}
