import { Injectable } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { concatMap, map, Observable } from 'rxjs';
import { SummaryReading, SummaryService } from '../openapi';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private readonly summaryService:SummaryService, private readonly mqttService:MqttService) { }

  public getHourlySummary(location:string):Observable<SummaryReading[]> {
    const path = `${location}/summary`;
    return this.mqttService.observe(path).pipe(
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
