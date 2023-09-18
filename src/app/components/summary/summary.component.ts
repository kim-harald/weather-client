import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import { SummaryReading, SummaryReadings, SummaryService } from '@openapi';
import { DataRow, Mode, SummaryType } from '@models';
import { convertToDataRows, kChartOptions, unsubscribeAll } from '@common';
import { GlobalService } from '@services';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private _location = 'dalet';
  private _subscriptions: Record<string, Subscription> = {};

  @Input()
  public span: number = 48;

  @Input()
  public summaryType: SummaryType = 'hour';

  public chartOptions = kChartOptions;

  public DataRows: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  constructor(
    private readonly summaryService: SummaryService,
    private readonly mqttService: MqttService,
    public readonly globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this._subscriptions['location'] = this.globalService.location$.subscribe({
      next: (location) => this.setup(location),
      error: (err) => console.error(err),
    });
  }

  private setup(location: string): void {
    this._subscriptions[location] = this.getSummary(
      location,
      this.summaryType
    ).subscribe({
      next: (summaryData) => {
        this.DataRows = convertToDataRows(
          summaryData,
          location,
          this.summaryType
        );
      },
      error: console.error,
    });

    this._subscriptions[`${location}-mqtt`] = this.mqttService
      .observe('summary')
      .pipe(concatMap(() => this.getSummary(location, this.summaryType)))
      .subscribe({
        next: (summaryData) => {
          this.DataRows = convertToDataRows(
            summaryData,
            location,
            this.summaryType
          );
        },
        error: console.error,
      });
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private getSummary(
    location: string,
    summaryType: SummaryType
  ): Observable<SummaryReading[]> {
    const summary$ = (location: string): Observable<SummaryReadings> => {
      switch (summaryType) {
        case 'day': {
          const now = new Date();
          const end = now.valueOf();
          now.setDate(now.getDate() - this.span);
          const start = now.valueOf();
          return this.summaryService.getDailySummary(location, start, end);
        }
        case 'hour': {
          const now = new Date();
          const end = now.valueOf();
          now.setHours(now.getHours() - this.span);
          const start = now.valueOf();
          return this.summaryService.getHourlySummary(location, start, end);
        }
        default:
          throw new Error("this shouldn't happen");
      }
    };

    return summary$(location).pipe(
      map((summaryReading) => summaryReading.data)
    );
  }
}
