import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DateRange, Mode } from '@models';
import { Location, LocationsService, Reading, ReadingsService } from '@openapi';
import { rotate, unsubscribeAll } from '@common';
import { ListenersService } from './listeners.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private _mode: Mode = Mode.temperature;
  private _location: string = '';
  private _subscriptions: Record<string, Subscription> = {};

  public mode$: Subject<Mode> = new Subject<Mode>();
  public location$: Subject<string> = new Subject<string>();
  public locations:Location[] = [];

  public get mode(): Mode {
    return this._mode;
  }

  public set mode(value: Mode) {
    this._mode = value;
    this.mode$.next(value);
  }

  public get location(): string {
    return this._location;
  }

  public set location(value: string) {
    this._location = value;
    this.location$.next(value);
  }


  constructor(
    locationService: LocationsService,
  ) {
    locationService.getLocations().subscribe((locations) => {
      if (locations && locations.length > 0) {
        this.location = locations[0].name;
        this.locations = locations;
      }
    });
  }

  public destroy(): void {
    unsubscribeAll(this._subscriptions);
  }
}
