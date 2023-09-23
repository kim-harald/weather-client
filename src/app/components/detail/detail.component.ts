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
  merge,
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

    this.globalService.location$
    .subscribe({
      next: () => {
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
    let counter = locations.length;
    locations
      .map((location) => location.name)
      .forEach((name) => {
        this._subscriptions[`mqtt:${name}`] = this.listenersService
          .reading(name)
          .subscribe({
            next: (reading) => {
              rotate(this._readings[name], reading, this.span);
              console.log(name);
              counter--;
              if (counter === 0) {
                this.DetailDataRows = convertToDataRows(
                  this._readings[this.globalService.location],
                  this.globalService.location,
                  '5min'
                );
                counter = locations.length;
              }
            },
            error: (err) => console.error(err),
          });
      });
  }
}
