import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DateRange, Mode } from '@models';
import { LocationsService, Reading, ReadingsService } from '@openapi';
import { rotate, unsubscribeAll } from '@common';
import { ListenersService } from './listeners.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private _mode: Mode = Mode.temperature;
  private _location: string = '';
  private _readings: Record<string, Reading[]> = {};
  private _subscriptions: Record<string, Subscription> = {};

  public mode$: Subject<Mode> = new Subject<Mode>();
  public location$: Subject<string> = new Subject<string>();
  public readings$: Record<string, Subject<Reading[]>> = {};
  public ready$: Subject<boolean> = new Subject<boolean>();

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

  public get readings(): Record<string, Reading[]> {
    return this._readings;
  }

  private nextReading(location: string, readings: Reading | Reading[]): void {
    readings = Array.isArray(readings) ? readings : [readings];
    readings.forEach((reading) => {
      rotate(this._readings[location], reading, 48);
    });

    this.readings$[location].next(this._readings[location]);
  }

  private init(locations: string[]): void {
    this.setSubjects(locations);
    const start = new Date();
    const end = new Date();
    start.setMinutes(start.getMinutes() - 4 * 60);
    locations.forEach((location) => {
      this._subscriptions[`init:${location}`] = this.readingService
        .getReadings(location, start.valueOf(), end.valueOf())
        .subscribe((readings) => {
          this.nextReading(location, readings);
          this.setReady(locations) // flag we are ready
        });

      this._subscriptions[`mqtt:${location}`] = this.listenersService
        .reading(location)
        .subscribe((reading) => {
          this.nextReading(location, reading);
        });
    });
  }

  private _counter = 0;
  private setReady(locations:string[]):void {
    this._counter++;
    if (this._counter === locations.length) {
      this.ready$.next(true);
    }
  }

  private setSubjects(locations: string[]): void {
    locations.forEach((location) => {
      this.readings$[location] = new Subject<Reading[]>();
    });
  }

  constructor(
    locationService: LocationsService,
    private readonly readingService: ReadingsService,
    private readonly listenersService: ListenersService
  ) {
    locationService.getLocations().subscribe((locations) => {
      if (locations && locations.length > 0) {
        this.location = locations[0].name;
        this.init(locations.map((l) => l.name));
      }
    });
  }

  public destroy(): void {
    unsubscribeAll(this._subscriptions);
  }
}
