import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GlobalService, ListenersService } from '@services';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import {
  kChartOptions,
  convertToDataRows,
  rotate,
  unsubscribeAll,
} from '@common';
import { DataRow } from 'src/app/models/datarow';
import { Mode } from '@models';
import { Reading, ReadingsService, Location } from '@openapi';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private _subscriptions: Record<string, Subscription> = {};

  public DetailDataRows: Record<Mode, DataRow[]> = {
    temperature: [],
    pressure: [],
    humidity: [],
  };

  @Input()
  public span: number = 120;

  public chartOptions = kChartOptions;

  constructor(
    private readonly readingService: ReadingsService,
    private readonly listenerService: ListenersService,
    public readonly globalService: GlobalService
  ) {}

  ngOnInit(): void {
    //this.init();
  }

  ngAfterViewInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private init(): void {
    this._subscriptions['location'] = this.globalService.location$.subscribe(
      (item) => this.setup(item)
    );
  }

  private setup(location: string): void {
    this._subscriptions[location] = this.getDetails(location).subscribe(
      (readings) => {
        this.globalService.nextReading(readings);
        this.DetailDataRows = convertToDataRows(readings, location, '5min');
      }
    );

    this._subscriptions[`${location}-mqtt`] = this.listenerService
      .reading(location)
      .subscribe({
        next: (reading) => {
          const readings = [reading];
          const dataRow = convertToDataRows(readings, location, '5min');
          this.DetailDataRows.temperature = rotate(
            this.DetailDataRows.temperature,
            dataRow.temperature[0]
          );
          this.DetailDataRows.pressure = rotate(
            this.DetailDataRows.pressure,
            dataRow.pressure[0]
          );
          this.DetailDataRows.humidity = rotate(
            this.DetailDataRows.humidity,
            dataRow.humidity[0]
          );
          this.globalService.nextReading(reading);
        },
        error: console.error,
      });
  }

  private getDetails(location: string): Observable<Reading[]> {
    const now = new Date();
    const end = now.valueOf();
    now.setMinutes(now.getMinutes() - this.span);
    const start = now.valueOf();
    return this.readingService.getReadings(location, start, end);
  }
}
