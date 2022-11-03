import { Component } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { map } from 'rxjs';
import { rounded } from './common/common';
import { LocationReading } from './models/locationreading';
import { ApiService } from './services/api.service';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public device = 'gimel';
  public data: ReadingDisplay[] = [];
  public rounded = rounded;

  constructor(private readonly apiService: ApiService, private readonly mqttService: MqttService) {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 2);
    this.apiService.get('Deck-1', startDate, new Date()).pipe(
      map(data => data.sort((a, b) => a.ts - b.ts)),
      map(data => data.map(item => {
        return {
          ...item,
          when: new Date(item.ts)
        } as ReadingDisplay
      }))
    ).subscribe(data => {
      this.data = data; //.filter(o => !this.data.map(m => m.ts).includes(o.ts));
    });

    this.mqttService.observe('gimel/sensor/all').pipe(
      map(iqttMessage => {
        return JSON.parse(iqttMessage.payload.toString()) as LocationReading
      })
    ).subscribe(reading => {
      if (!this.data.find(f => rounded(f.ts,-2) === rounded(reading.ts,-2))) {
        this.data.push({
          ...reading,
          when: new Date(reading.ts),
          location: 'Deck-1'
        });

        this.data.sort((a, b) => a.ts - b.ts);
        const start = new Date();
        start.setHours(start.getHours() - 2);
        this.data = this.data.filter(o => o.ts >= start.valueOf())
      }
    })
  }
}

type ReadingDisplay = LocationReading & {
  when: Date
}