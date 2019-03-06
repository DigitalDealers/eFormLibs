import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MouseEvent } from '@agm/core';

import { googleMapStyle } from './google-map-style';
import { FormGroup } from '@angular/forms';

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
  @Input() public field;
  @Input() public value;
  @Input() public hidden;
  @Input() public invalid;
  @Input() public readonly;
  @Output() public setFieldValue: EventEmitter<any> = new EventEmitter();

  public styles = googleMapStyle;
  private _centerMap: MapInit = {
    lat: -23.47769229354325,
    lng: 144.2656763331221,
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

  constructor() {}

  ngOnInit() {
    if (this.value) {
      this.marker = this.value;
      this.centerMap = {
        ...this.value
      };
    }
  }

  public mapClicked($event: MouseEvent) {
    if (this.field.manual) {
      return false;
    }
    const { lat, lng } = $event.coords;
    this.setData({ lat, lng });
  }

  public onAutocompleteSelected(event) {
    const { lat, lng } = event.geometry.location;
    const latitude = lat();
    const longitude = lng();

    this.centerMap = {
      lat: latitude,
      lng: longitude
    };
    this.setData({ lat: latitude, lng: longitude });
  }

  private setData({ lat, lng }) {
    this.marker = { lat, lng };

    this.setFieldValue.emit({ lat, lng });
  }
}

// just an interface for type safety.
interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  draggable?: boolean;
}
