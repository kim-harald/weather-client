import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subscription, concatMap, map, of } from 'rxjs';
import { convertToDataRows, unsubscribeAll } from 'src/app/common/common';
import { kChartOptions } from 'src/app/common/settings';
import { DataRow } from 'src/app/models/datarow';
import { Mode } from 'src/app/models/mode';
import { SummaryReading, SummaryReadings, SummaryService } from 'src/app/openapi';

@Component({
  selector: 'hourly-summary',
  templateUrl: './hourly-summary.component.html',
  styleUrls: ['./hourly-summary.component.scss']
})
export class HourlySummaryComponent implements OnInit, OnDestroy {
  private hourSummaries: SummaryReading[] = [];
  
  @Input()
  public location:string = '';

  @Input()
  public mode:Mode = 'temperature';

  public chartOptions = kChartOptions;

  private getHourlySummary$:Subscription | undefined;
  
  private _hourlyDatarows: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  public get HourlyDataRows(): Record<Mode, DataRow[]> {
    return this._hourlyDatarows;
  }

  constructor(private readonly summaryService:SummaryService, private readonly mqttService:MqttService) { }

  
  ngOnInit(): void {
    this.getHourlySummary$ = this.getHourlySummary(this.location, true).subscribe(result => {
      this.hourSummaries = result;
      this._hourlyDatarows = convertToDataRows(result,this.location, 'hour');
    });

    this.getHourlySummary$ = this.getHourlySummary(this.location,false).subscribe(result => {
      this.hourSummaries = result;
      this._hourlyDatarows = convertToDataRows(result,this.location, 'hour');
    });
  }
  
  ngOnDestroy(): void {
      unsubscribeAll([this.getHourlySummary$]);
  }

  public getHourlySummary(location:string, isInit = false):Observable<SummaryReading[]> {
    const signal$ = isInit ? of({}) : this.mqttService.observe('summary');
    return signal$.pipe(
      concatMap(()=> {
        const now = new Date();
        const end = now.valueOf();
        now.setHours(now.getHours()-48);
        const start= now.valueOf();
        return this.summaryService.getHourlySummary(location, start,end);
      }),
      map(summaryReading => summaryReading.data)
    );
  }
}
