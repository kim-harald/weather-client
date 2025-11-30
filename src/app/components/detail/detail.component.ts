import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService, ListenersService } from '@services';
import {
  Observable,
  Subject,
  concatMap,
  forkJoin,
  map,
  merge,
  of,
  takeUntil,
} from 'rxjs';
import {
  kChartOptions,
  convertToDataRows,
  rotate,
} from '@common';
import { DataRow } from 'src/app/models/datarow';
import { DateRange, Mode } from '@models';
import { Reading, ReadingsService, Location, LocationsService } from '@openapi';
import { WeatherChartComponent } from '../weather-chart/weather-chart.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, WeatherChartComponent],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>();
  private _readings: Record<string, Reading[]> = {};

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
    this.globalService.locations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(locations => {
        this.setMqttListen(locations);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setInitialData(): void {
    this.globalService.readings$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this._readings = data;
          this.updateDataRows();
        },
        error: (err) => console.error(err),
      });

    this.globalService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.updateDataRows(),
        error: (err) => console.error(err),
      });
  }

  private updateDataRows(): void {
    if (this._readings[this.globalService.location]) {
      this.DetailDataRows = convertToDataRows(
        this._readings[this.globalService.location],
        this.globalService.location,
        '5min'
      );
    }
  }

  private setMqttListen(locations: Location[]): void {
    let counter = locations.length;
    locations
      .map((location) => location.name)
      .forEach((name) => {
        this.listenersService
          .reading(name)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (reading) => {
              rotate(this._readings[name], reading, this.span);
              counter--;
              if (counter === 0) {
                this.updateDataRows();
                counter = locations.length;
              }
            },
            error: (err) => console.error(err),
          });
      });
  }
}
