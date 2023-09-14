import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import { SummaryReading, SummaryReadings, SummaryService } from '@openapi';
import { DataRow, Mode, SummaryType } from '@models';
import { convertToDataRows, kChartOptions, unsubscribeAll } from '@common';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private _location = 'dalet';
  private _subscriptions: Record<string, Subscription> = {};

  @Input()
  public location$: Subject<string> = new Subject<string>();

  @Input()
  public mode: Mode = 'temperature';

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
    private readonly mqttService: MqttService
  ) { }

  ngOnInit(): void {
    this._subscriptions['location'] =
      this.location$
        .subscribe({
          next: location => this.setup(location),
          error: (err) => console.error(err)
        });
  }

  private setup(location: string): void {
    this._subscriptions[location] =
      this.getSummary(this._location, this.summaryType).subscribe({
        next: summaryData => this.DataRows = convertToDataRows(summaryData, location, this.summaryType),
        error: err => console.error
      });

    this._subscriptions[`${location}-mqtt`] = this.mqttService.observe('summary').pipe(
      concatMap(() => this.getSummary(location, this.summaryType))
    ).subscribe({
      next: summaryData => this.DataRows = convertToDataRows(summaryData, location, this.summaryType),
      error: err => console.error
    });
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private getSummary(
    location: string,
    summaryType: SummaryType
  ): Observable<SummaryReading[]> {

    const summary$ = (location: string, start: number, end: number): Observable<SummaryReadings> => {
      switch (summaryType) {
        case 'day': return this.summaryService.getDailySummary(location, start, end);
        case 'hour': return this.summaryService.getHourlySummary(location, start, end);
        default: return this.summaryService.getHourlySummary(location, start, end);
      }
    };

    const now = new Date();
    const end = now.valueOf();
    now.setHours(now.getHours() - 48);
    const start = now.valueOf();
    return summary$(location, start, end).pipe(
      map((summaryReading) => summaryReading.data)
    );
  }
}
