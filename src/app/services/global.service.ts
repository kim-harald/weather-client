import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  concatMap,
  forkJoin,
  of,
  takeUntil,
} from 'rxjs';
import { Mode } from '@models';
import { Location, LocationsService, Reading, ReadingsService } from '@openapi';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private _mode: Mode = Mode.temperature;
  private _location: string = '';
  private _destroy: Subject<void> = new Subject<void>();

  public mode$: Subject<Mode> = new Subject<Mode>(); 
  public location$: Subject<string> = new Subject<string>();
  public locations$: Subject<Location[]> = new Subject<Location[]>();

  public locations: Location[] = [];

  public readings$: Subject<Record<string, Reading[]>> = new Subject<
    Record<string, Reading[]>
  >();

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
    readingService: ReadingsService
  ) {
    locationService
      .getLocations()
      .pipe(
        takeUntil(this._destroy),
        concatMap((locations) => {
          if (!locations || locations.length === 0) {
            return of(null);
          }

          this.location = locations[0].name;
          this.locations = locations;
          this.locations$.next(locations);

          // Fetch readings for all locations
          const end = new Date();
          const start = new Date();
          start.setMinutes(start.getMinutes() - 120);

          const readings$: Record<string, Observable<Reading[]>> = {};
          locations.forEach((location) => {
            readings$[location.name] = readingService.getReadings(
              location.name,
              start.valueOf(),
              end.valueOf()
            );
          });

          return forkJoin(readings$);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.readings$.next(data);
          }
        },
        error: (err) => console.error('Error initializing global service:', err),
      });
  }

  public destroy(): void {
    this._destroy.next();
  }
}
