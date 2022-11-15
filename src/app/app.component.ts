import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MqttService } from 'ngx-mqtt';
import { map } from 'rxjs';
import { cKelvinOffset, rounded, trendline } from './common/common';
import { LocationReading } from './models/locationreading';
import { ReadingDisplay } from './models/readingdisplay';
import { ReadingType } from './models/readingtype';
import { SummaryReading } from './models/SummaryReading';
import { WeatherStats } from './models/WeatherStats.1';
import { ApiService } from './services/api.service';
import { StorageService } from './services/storage.service';

const k_LOCATION = 'gimel';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public readings: ReadingDisplay[] = [];
  public hourlySummaries: SummaryReading[] = [];
  public dailySummaries: SummaryReading[] = [];
  public stats:WeatherStats = {} as WeatherStats;

  public rounded = rounded;

  public temperature: number = 0;
  public pressure: number = 0;
  public humidity: number = 0;

  public trendTemperature: number = 0;
  public trendPressure: number = 0;
  public trendHumidity: number = 0;

  public isMobile: boolean = false;

  private _sensorReadings: Record<string, number[]> = {};
  private ts: number = 0;

  public value = 0;
  constructor(
    private readonly apiService: ApiService,
    private readonly mqttService: MqttService,
    private readonly storageService: StorageService,
    private readonly deviceService: DeviceDetectorService
  ) {}

  public ngOnInit(): void {
    const t = this.storageService.get('temperature');

    this.temperature = this.storageService.get('temperature');
    this.pressure = this.storageService.get('pressure');
    this.humidity = this.storageService.get('humidity');

    this.isMobile = this.deviceService.isMobile();

    if (!this.isMobile) {
      this.setupReadings();
    }

    this.setupReadingListener();
  }

  private setupReadings(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 2);
    this.apiService
      .getReadings(k_LOCATION, startDate, new Date())
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
        this.readings = data;
        const lastReading = data[data.length - 1];
        this.temperature = rounded(lastReading.temperature - cKelvinOffset, 1);
        this.pressure = rounded(lastReading.pressure / 100, 0);
        this.humidity = lastReading.humidity;
        this.rotate('temperature',this.temperature);
        this.rotate('pressure', this.pressure);
        this.rotate('humidity', this.humidity);
      });

    this.mqttService
      .observe(`${k_LOCATION}/sensor/all`)
      .pipe(
        map((iqttMessage) => {
          return JSON.parse(iqttMessage.payload.toString()) as LocationReading;
        })
      )
      .subscribe((reading) => {
        if (
          !this.readings.find(
            (f) => rounded(f.ts, -2) === rounded(reading.ts, -2)
          )
        ) {
          this.readings.push({
            ...reading,
            when: new Date(reading.ts),
            location: k_LOCATION,
          });

          this.readings.sort((a, b) => a.ts - b.ts);
          const start = new Date();
          start.setHours(start.getHours() - 2);
          this.readings = this.readings.filter((o) => o.ts >= start.valueOf());
        }
      });
  }

  private setupReadingListener() {
    this.mqttService
      .observe(`${k_LOCATION}/sensor/#`)
      .subscribe((mqttMessage) => {
        const readingType = mqttMessage.topic.replace(
          `${k_LOCATION}/sensor/`,
          ''
        ) as ReadingType;
        const value = Number(mqttMessage.payload.toString());

        switch (readingType) {
          case 'temperature':
            this.rotate('temperature', rounded(value - cKelvinOffset, 1));
            this.trendTemperature = rounded(
              trendline(
                this._sensorReadings['temperature'].map((o,index) => {
                  return { x: index, y: o };
                })
              ).b,
              3
            );
            this.temperature = rounded(value - cKelvinOffset, 1);
            this.storageService.set('temperature', this.temperature);
            return;
          case 'pressure':
            this.rotate('pressure', rounded(value / 100, 0));
            this.trendPressure = rounded(
              trendline(
                this._sensorReadings['pressure'].map((o,index) => {
                  return { x: index, y: o };
                })
              ).b,
              3            );
            this.storageService.set('pressure', this.pressure);
            return;
          case 'humidity':
            this.rotate('humidity', value);
            this.trendHumidity = rounded(
              trendline(
                this._sensorReadings['humidity'].map((o,index) => {
                  return { x: index, y: o };
                })
              ).b,
              3
            );
            this.humidity = value;
            this.storageService.set('humidity', this.humidity);
            return;
        }
      });
  }

  private getHourlySummaries(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);

    this.apiService
      .getHourly(k_LOCATION, startDate, new Date())
      .subscribe((summaryReadings) => {
        this.hourlySummaries = summaryReadings;
      });
  }

  private getDailySummaries(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);

    this.apiService
      .getDaily(k_LOCATION, startDate, new Date())
      .subscribe((summaryReadings) => {
        this.dailySummaries = summaryReadings;
      });
  }

  private getStats(type:string):void {
    this.apiService.getStats(k_LOCATION,)
  }

  private rotate(type: string, value: number, limit: number = 30): void {
    if (!this._sensorReadings[type]) {
      this._sensorReadings[type] = [];
    }

    this._sensorReadings[type].push(value);
    if (this._sensorReadings[type].length > limit) {
      this._sensorReadings[type].splice(0, 1);
    }
  }
}
