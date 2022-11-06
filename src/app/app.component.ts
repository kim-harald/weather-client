import { Component, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { map, Subject } from 'rxjs';
import { cKelvinOffset, rounded } from './common/common';
import { LocationReading } from './models/locationreading';
import { ReadingType } from './models/readingtype';
import { ApiService } from './services/api.service';
import { GlobalService } from './services/global.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public device = 'gimel';
  public data: ReadingDisplay[] = [];
  public rounded = rounded;

  public temperature: number = 0;
  public pressure: number = 0;
  public humidity: number = 0;

  public deltaTemperature:number = 0;
  public deltaPressure: number = 0;
  public deltaHumidity: number = 0;

  public value = 0;
  constructor(
    private readonly apiService: ApiService,
    private readonly mqttService: MqttService,
    private readonly storageService: StorageService
  ) { }

  public ngOnInit(): void {
    const t = this.storageService.get('temperature');

    this.temperature = this.storageService.get('temperature');
    this.pressure = this.storageService.get('pressure');
    this.humidity = this.storageService.get('humidity');

    this.setupReadings();
    this.setupReadingListener();
  }

  private setupReadings(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 2);
    this.apiService
      .get('Deck-1', startDate, new Date())
      .pipe(
        map((data) => data.sort((a, b) => a.ts - b.ts)),
        map((data) =>
          data.map((item) => {
            return {
              ...item,
              when: new Date(item.ts),
            } as ReadingDisplay;
          })
        )
      )
      .subscribe((data) => {
        this.data = data; //.filter(o => !this.data.map(m => m.ts).includes(o.ts));
      });

    this.mqttService
      .observe('gimel/sensor/all')
      .pipe(
        map((iqttMessage) => {
          return JSON.parse(iqttMessage.payload.toString()) as LocationReading;
        })
      )
      .subscribe((reading) => {
        if (
          !this.data.find((f) => rounded(f.ts, -2) === rounded(reading.ts, -2))
        ) {
          this.data.push({
            ...reading,
            when: new Date(reading.ts),
            location: 'Deck-1',
          });

          this.data.sort((a, b) => a.ts - b.ts);
          const start = new Date();
          start.setHours(start.getHours() - 2);
          this.data = this.data.filter((o) => o.ts >= start.valueOf());
        }
      });
  }

  private setupReadingListener() {

    this.mqttService.observe('gimel/sensor/#').subscribe((mqttMessage) => {
      const readingType = mqttMessage.topic.replace(
        'gimel/sensor/',
        ''
      ) as ReadingType;
      const value = Number(mqttMessage.payload.toString());
      switch (readingType) {
        case 'temperature':
          this.deltaTemperature = rounded(value - cKelvinOffset, 1) - this.temperature;
          this.temperature = rounded(value - cKelvinOffset, 1);
          this.storageService.set('temperature', this.temperature);
          return;
        case 'pressure':
          this.deltaPressure = rounded(value / 100, 0) - this.pressure;
          this.pressure = rounded(value / 100, 0);
          this.storageService.set('pressure', this.pressure);
          return;
        case 'humidity':
          this.deltaHumidity = value - this.humidity;
          this.humidity = value;
          this.storageService.set('humidity', this.humidity);
          return;
      }
    });
  }
}

type ReadingDisplay = LocationReading & {
  when: Date;
};
