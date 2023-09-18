import { Injectable } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Reading } from '@openapi';
import { Observable, map } from 'rxjs';
import { Mode } from '@models';

@Injectable({
  providedIn: 'root',
})
export class ListenersService {
  constructor(private readonly mqttService: MqttService) {}

  public reading(location: string): Observable<Reading> {
    return this.mqttService.observe(`${location}/sensor/all`).pipe(
      map((iqttMessage) => {
        const reading = JSON.parse(iqttMessage.payload.toString()) as Reading;
        reading.location = location;
        return reading;
      })
    );
  }

  public sample(location: string, mode: Mode): Observable<number> {
    return this.mqttService.observe(`${location}/sensor/${mode}`).pipe(
      map((iqttMessage) => {
        const value = JSON.parse(iqttMessage.payload.toString()) as number;
        return value;
      })
    );
  }

  public stats(): Observable<number> {
    return this.mqttService.observe('stats').pipe(
      map((iqttMessage) => {
        return JSON.parse(iqttMessage.payload.toString()) as number;
      })
    );
  }

  public summary(): Observable<number> {
    return this.mqttService.observe('summary').pipe(
      map((iqttMessage) => {
        return JSON.parse(iqttMessage.payload.toString()) as number;
      })
    );
  }
}
