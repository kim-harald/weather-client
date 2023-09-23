import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  concatMap,
  forkJoin,
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
      .pipe(takeUntil(this._destroy))
      .subscribe((locations) => {
        if (locations && locations.length > 0) {
          this.location = locations[0].name;
          this.locations = locations;
          this.locations$.next(locations.filter(o => o.name !== 'gimel'));
        }
      });

    this.locations$
      .pipe(
        takeUntil(this._destroy),
        concatMap((locations) => {
          const readings$: Record<string, Observable<Reading[]>> = {};
          locations.forEach((location) => {
            const start = new Date();
            const end = new Date();
            start.setMinutes(start.getMinutes() - 120);
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
          console.info(data);
          this.readings$.next(data);
        },
      });
  }

  public destroy(): void {
    this._destroy.next();
  }
}
