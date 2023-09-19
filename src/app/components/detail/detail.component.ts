import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GlobalService, ListenersService } from '@services';
import { Observable, Subject, Subscription, concatMap, forkJoin, map, of } from 'rxjs';
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
    private readonly listenersService: ListenersService) { }

  ngOnInit(): void {
    // this.init();
  }

  ngAfterViewInit(): void {
    this.setInitialData();
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private setInitialData(): void {
    const start = new Date();
    const end = new Date();
    start.setMinutes(start.getMinutes() - 120);
    this._subscriptions['readings'] = this.locationService.getLocations().pipe(
      concatMap(locations => {
        const x: Record<string, Observable<Reading[]>> = {};
        const readings$ =
          locations.forEach(l =>
            x[l.name] = this.readingService.getReadings(l.name, start.valueOf(), end.valueOf()));
        return forkJoin(x);
      })
    )
      .subscribe({
        next: (readingsArr) => {
          Object.keys(readingsArr).forEach(key => {
            this._readings[key] = readingsArr[key];
          });
        },
        error: err => {
          console.error(err);
        },
        complete: () => {
          this._isReady$.next();
        }
      });

    this._subscriptions['ready'] = this._isReady$.subscribe({
      next: () => {
        const l = this.globalService.location;
        this.DetailDataRows = convertToDataRows(this._readings[l], l, '5min');
      },
      error: err => console.error(err)
    });

    this._subscriptions['location'] = this.globalService.location$.subscribe(l => {
      this.DetailDataRows = convertToDataRows(this._readings[l], l, '5min');
    });
  }

  private setMqttListen():void {
    this.locationService.getLocations().pipe(
      concatMap(locations => {
        const listen$:Record<string, Observable<Reading>> = {};
        locations.forEach(l => {
          listen$[l.name] = this.listenersService.reading(l.name);
        });
        return forkJoin(listen$);
      })
    ).subscribe({
      next: data => {
        Object.keys(data).forEach(key => {
          rotate(this._readings[key],data[key],this.span);
          const reading = data[key];
          this.DetailDataRows = convertToDataRows(this._readings[key], key, '5min');
        });
      }
    })
  }
}
