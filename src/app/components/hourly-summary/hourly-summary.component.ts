import { Component, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subscription, concatMap, map } from 'rxjs';
import { unsubscribeAll } from 'src/app/common/common';
import { SummaryReading, SummaryReadings, SummaryService } from 'src/app/openapi';

@Component({
  selector: 'app-hourly-summary',
  templateUrl: './hourly-summary.component.html',
  styleUrls: ['./hourly-summary.component.scss']
})
export class HourlySummaryComponent implements OnInit, OnDestroy {
  private hourSummaries: SummaryReading[] = [];
  public location:string = '';
  private getHourlySummary$:Subscription | undefined;
  
  constructor(private readonly summaryService:SummaryService, private readonly mqttService:MqttService) { }

  
  ngOnInit(): void {
    const end = new Date();
    const start = new Date();
    start.setHours(start.getHours()-48);
    this.getHourlySummary$ = this.getHourlySummary(this.location).subscribe(result => {
      this.hourSummaries = result;
    });
  }
  
  ngOnDestroy(): void {
      unsubscribeAll([this.getHourlySummary$]);
  }

  public getHourlySummary(location:string):Observable<SummaryReading[]> {
    return this.mqttService.observe('summary').pipe(
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
