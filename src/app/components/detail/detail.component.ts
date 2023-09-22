import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GlobalService, ListenersService } from '@services';
import {
  Observable,
  Subject,
  Subscription,
  concatMap,
  forkJoin,
  map,
  of,
} from 'rxjs';
import {
  kChartOptions,
  convertToDataRows,
  rotate,
  unsubscribeAll,
} from '@common';
import { DataRow } from 'src/app/models/datarow';
import { DateRange, Mode } from '@models';
import { Reading, ReadingsService, Location, LocationsService } from '@openapi';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private _subscriptions: Record<string, Subscription> = {};
  private _readings: Record<string, Reading[]> = {};

  private _isReady$: Subject<void> = new Subject<void>();

  public DetailDataRows: Record<Mode, DataRow[]> = {
    temperature: [],
    pressure: [],
    humidity: [],
  };

  @Input()
  public span: number = 120;

  public chartOptions = kChartOptions;

  constructor(
    public readonly globalService: GlobalService,
    private readonly readingService: ReadingsService,
    private readonly locationService: LocationsService,
    private readonly listenersService: ListenersService
  ) {}

  ngOnInit(): void {
    // this.init();
  }

  ngAfterViewInit(): void {
    this.setInitialData();
    this.globalService.locations$.subscribe(locations => {
      this.setMqttListen(locations)
    })
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private setInitialData_old(): void {
    const start = new Date();
    const end = new Date();
    start.setMinutes(start.getMinutes() - 120);
    this._subscriptions['readings'] = this.locationService
      .getLocations()
      .pipe(
        concatMap((locations) => {
          const readings$: Record<string, Observable<Reading[]>> = {};
          locations.forEach((location) => {
            readings$[location.name] = this.readingService.getReadings(
              location.name,
              start.valueOf(),
              end.valueOf()
            );
          });

          this.setMqttListen(locations);
          return forkJoin(readings$);
        })
      )
      .subscribe({
        next: (readingsArr) => {
          Object.keys(readingsArr).forEach((key) => {
            this._readings[key] = readingsArr[key];
          });
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          this._isReady$.next();
        },
      });

    this._subscriptions['ready'] = this._isReady$.subscribe({
      next: () => {
        const l = this.globalService.location;
        this.DetailDataRows = convertToDataRows(this._readings[l], l, '5min');
      },
      error: (err) => console.error(err),
    });

    this._subscriptions['location'] = this.globalService.location$.subscribe(
      (l) => {
        this.DetailDataRows = convertToDataRows(this._readings[l], l, '5min');
      }
    );
  }

  private setInitialData(): void {
    this.globalService.readings$.subscribe({
      next: (data) => {
        this._readings = data;
        this.DetailDataRows = convertToDataRows(
          this._readings[this.globalService.location],
          this.globalService.location,
          '5min'
        );
      },
      error: (err) => console.error(err),
      complete: () => {
        console.info('Complete init');
      },
    });

    this.globalService.location$.subscribe({
      next: (location) => {
        this.DetailDataRows = convertToDataRows(
          this._readings[this.globalService.location],
          this.globalService.location,
          '5min'
        );
      },
      error: (err) => console.error(err),
      complete: () => {},
    });
  }

  private setMqttListen(locations: Location[]): void {
    locations
      .map((location) => location.name)
      .forEach((name) => {
        this._subscriptions[`mqtt:${name}`] = this.listenersService
          .reading(name)
          .subscribe({
            next: (reading) => {
              rotate(this._readings[name], reading, this.span);
              console.log(name);
            },
            error: (err) => console.error(err),
          });
      });
  }
}
