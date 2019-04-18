import { MouseEvent } from '@agm/core';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SafetyField } from '@digitaldealers/safety-api';

import { googleMapStyle } from './google-map-style';

interface MapInit {
  lat: number;
  lng: number;
  zoom?: number;
}

@Component({
  selector: 'didi-location-control',
  templateUrl: './location-control.component.html',
  styleUrls: ['./location-control.component.scss']
})
export class LocationControlComponent implements OnInit {
  @Input() public field: SafetyField;
  @Input() public value;
  @Input() public hidden;
  @Input() public invalid;
  @Input() public readonly;
  @Output() public setFieldValue: EventEmitter<any> = new EventEmitter();

  public addressCtrl = new FormControl();

  public styles = googleMapStyle;
  private _centerMap: MapInit = {
    lat: -23.4344651,
    lng: 144.2616852,
    zoom: 6
  };

  public form: FormGroup;

  public iconUrl = {
    url: './assets/img/marker.png',
    scaledSize: {
      width: 40,
      height: 60
    }
  };

  public _marker: MapMarker;

  get centerMap() {
    return this._centerMap;
  }
  set centerMap(value) {
    this._centerMap = { ...this._centerMap, ...value };
  }
  get marker() {
    return this._marker;
  }
  set marker(value) {
    this._marker = { ...this._marker, ...value };
  }

  ngOnInit() {
    if (this.value) {
      const { address, ...data } = this.value;
      this.marker = data;
      this.centerMap = {
        ...data
      };
      this.addressCtrl.patchValue(address, { emitEvent: false });
    }

    if (this.field.manual) {
      this.centerMap.zoom = 14;
    }
  }

  @HostListener('mousewheel', ['$event']) onScroll(event: Event): void {
    event.stopPropagation();
  }

  public mapClicked($event: MouseEvent) {
    if (this.field.manual || this.readonly) {
      return false;
    }
    const { lat, lng } = $event.coords;
    this.setData({ lat, lng, address: '' });
  }

  public onAutocompleteSelected(event) {
    const address = event.formatted_address;
    const { lat, lng } = event.geometry.location;
    const latitude = lat();
    const longitude = lng();

    this.centerMap = {
      lat: latitude,
      lng: longitude
    };
    this.setData({ lat: latitude, lng: longitude, address });
  }

  private setData({ lat, lng, address }) {
    this.marker = { lat, lng };

    this.setFieldValue.emit({ lat, lng, address });
  }
}

// just an interface for type safety.
interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  draggable?: boolean;
}
