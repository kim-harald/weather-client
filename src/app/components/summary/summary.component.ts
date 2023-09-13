import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import { SummaryReading, SummaryReadings, SummaryService } from '@openapi';
import { DataRow, Mode, SummaryType } from '@models';
import { kChartOptions } from '@common/settings';
import { convertToDataRows, unsubscribeAll } from '@common/common';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private _location = '';
  private _subscriptions: Array<Subscription> = [];

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
  ) {}

  ngOnInit(): void {
    this._subscriptions.push(
      this.location$
        .pipe(
          concatMap((location) => {
            this._location = location;
            return this.getSummary(location, this.summaryType, true);
          })
        )
        .subscribe((result) => {
          this.DataRows = convertToDataRows(
            result,
            this._location,
            this.summaryType
          );
        })
    );

    this._subscriptions.push(
      this.getSummary(this._location, this.summaryType, false).subscribe((result) => {
        this.DataRows = convertToDataRows(result, this._location, this.summaryType);
      })
    );
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private getSummary(
    location: string,
    summaryType:SummaryType,
    isInit = false
  ): Observable<SummaryReading[]> {

    const summary$ = (location:string,start:number,end:number):Observable<SummaryReadings> => {
      switch (summaryType) {
        case 'day' : return this.summaryService.getDailySummary(location,start,end);
        case 'hour' : return this.summaryService.getHourlySummary(location,start, end);
        default: return this.summaryService.getHourlySummary(location,start, end);
      }
    };

    const signal$ = isInit ? of({}) : this.mqttService.observe('summary');
    return signal$.pipe(
      concatMap(() => {
        const now = new Date();
        const end = now.valueOf();
        now.setHours(now.getHours() - 48);
        const start = now.valueOf();
        return summary$(location, start, end);
      }),
      map((summaryReading) => summaryReading.data)
    );
  }
}
