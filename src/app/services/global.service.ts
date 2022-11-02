import { Injectable } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { concatMap, map, Observable, of } from 'rxjs';
import { LocationReading } from '../models/locationreading';
import { Reading } from '../models/reading';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private readonly apiService:ApiService, private readonly mqttService:MqttService) { }

  public getCurrent(location: string,startDate:Date): Observable<LocationReading[]> {
    const mqtt$ = this.mqttService.observe('gimel/sensor/all').pipe(
      map(mqttMessage => {
        const data = JSON.parse(mqttMessage.payload.toString()) as Reading;
        const locationReading = {
          ...data,
          location:location
        } as LocationReading;
        return [locationReading]
      })
    );

    const result$ = of([]).pipe(
      concatMap(data => this.apiService.get(location, startDate, new Date())),
      concatMap(data => mqtt$)
    );

    return result$;
  }
}
