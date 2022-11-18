import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MqttService } from 'ngx-mqtt';
import { map } from 'rxjs';
import { cKelvinOffset, rounded, trendline } from './common/common';
import { kChartOptions } from './common/settings';
import { DataRow } from './models/datarow';
import { LocationReading } from './models/locationreading';
import { Mode, Modes } from './models/mode';
import { Reading } from './models/reading';
import { ReadingDisplay } from './models/readingdisplay';
import { ReadingType } from './models/readingtype';
import { SummaryReading } from './models/SummaryReading';
import { WeatherStats } from './models/WeatherStats.1';
import { ApiService } from './services/api.service';

const k_LOCATION = 'gimel';
const k_Samples = 720;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public readings: ReadingDisplay[] = [];
  public hourlySummaries: SummaryReading[] = [];
  public dailySummaries: SummaryReading[] = [];
  public stats: WeatherStats = {} as WeatherStats;
  public mode: Mode = 'temperature';

  public rounded = rounded;

  public temperature: number = 0;
  public pressure: number = 0;
  public humidity: number = 0;

  public trendTemperature: number = 0;
  public trendPressure: number = 0;
  public trendHumidity: number = 0;

  public isMobile: boolean = false;
  public chartOptions = kChartOptions;

  public colors: string[] = ['red'];
  public columns: string[] = ['Time', 'Temperature'];

  private _sensorReadings: Record<string, number[]> = {};
  public get sensorReadings(): Record<string, number[]> {
    return this._sensorReadings;
  }

  public range: { min: number; max: number } = { min: -40, max: 40 };
  
  private _datarows: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };
  public get DataRows(): Record<Mode, DataRow[]> {
    return this._datarows;
  }

  public isReady:boolean = false;

  public value = 0;
  constructor(
    private readonly apiService: ApiService,
    private readonly mqttService: MqttService,
    private readonly deviceService: DeviceDetectorService
  ) {
    this.setupReadings();
    
  }

  public ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.setupReadingListener();
    
  }

  public convertToDataRows(readings: Reading[]): Record<Mode, DataRow[]> {
    const result: Record<Mode, DataRow[]> = {
      temperature: [],
      humidity: [],
      pressure: [],
    };
    Modes.forEach((s) => {
      const mode = s as Mode;
      const values = readings.map((reading) => {
        return {
          ts: reading.ts,
          value: convertValue(mode, (reading as any)[mode]),
        };
      });
      result[mode] = values;
    });

    return result;
  }

  public handleClick(mode: Mode): void {
    this.mode = mode;
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
        
        this._datarows = this.convertToDataRows(data);
        const lastReading = data[data.length - 1];
        this.temperature = rounded(lastReading.temperature - cKelvinOffset, 1);
        this.pressure = rounded(lastReading.pressure / 100, 0);
        this.humidity = lastReading.humidity;
        this._sensorReadings = buildSamples(data, k_Samples);
        this.setRange();
        this.readings = data;
        this.isReady = true;
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
          this._datarows = this.convertToDataRows(this.readings);
          this.setRange();
        }
      });
  }

  private setRange():void {
    const range:Record<Mode,{min:number,max:number}> = {
      'temperature':getRange(this._datarows['temperature'].map(x =>x.value)),
      'pressure':getRange(this._datarows['pressure'].map(x =>x.value)),
      'humidity':getRange(this._datarows['humidity'].map(x =>x.value))
    }
    this.chartOptions['temperature'].min = range['temperature'].min;
    this.chartOptions['temperature'].max = range['temperature'].max;
    this.chartOptions['pressure'].min = range['pressure'].min;
    this.chartOptions['pressure'].max = range['pressure'].max;
    this.chartOptions['humidity'].min = range['humidity'].min;
    this.chartOptions['humidity'].max = range['humidity'].max;
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
            this._sensorReadings['temperature'] = rotate(
              this._sensorReadings['temperature'],
              value,
              k_Samples
            );
            this.trendTemperature = 0;
            this.trendTemperature = rounded(
              trendline(
                this._sensorReadings['temperature'].map((o, index) => {
                  return { x: index, y: o };
                })
              ).b,
              3
            );
            this.temperature = rounded(value - cKelvinOffset, 1);
            return;
          case 'pressure':
            this._sensorReadings['pressure'] = rotate(
              this._sensorReadings['pressure'],
              value,
              k_Samples
            );
            this.trendPressure = 0;
            this.trendPressure = rounded(
              trendline(
                this._sensorReadings['pressure'].map((o, index) => {
                  return { x: index, y: o };
                })
              ).b,
              3
            );
            return;
          case 'humidity':
            this._sensorReadings['humidity'] = rotate(
              this._sensorReadings['humidity'],
              value,
              k_Samples
            );
            this.trendHumidity = 0;
            this.trendHumidity = rounded(
              trendline(
                this._sensorReadings['humidity'].map((o, index) => {
                  return { x: index, y: o };
                })
              ).b,
              3
            );
            this.humidity = value;
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

  private getStats(type: string): void {
    // this.apiService.getStats(k_LOCATION);
  }
}

const rotate = (
  values: number[],
  value: number,
  limit: number = 30
): number[] => {
  values.push(value);
  if (values.length > limit) {
    values.splice(0, 1);
  }

  return values;
};

const buildSamples = (
  readings: Reading[],
  n: number
): Record<string, number[]> => {
  const result: Record<string, number[]> = {};
  result['temperature'] = [];
  result['pressure'] = [];
  result['humidity'] = [];
  const samples = rounded(n / readings.length, 0);

  readings.forEach((reading) => {
    for (let i = 0; i < samples; i++) {
      result['temperature'] = rotate(
        result['temperature'],
        reading.temperature,
        k_Samples
      );
      result['pressure'] = rotate(
        result['pressure'],
        reading.pressure,
        k_Samples
      );
      result['humidity'] = rotate(
        result['humidity'],
        reading.humidity,
        k_Samples
      );
    }
  });

  return result;
};

const convertValue = (mode: Mode, value: number) => {
  switch (mode) {
    case 'humidity':
      return value;
    case 'pressure':
      return rounded(value / 100, 0);
    case 'temperature':
      return rounded(value - cKelvinOffset, 1);
  }
};

const getRange = (values: number[]): { min: number; max: number } => {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(
    values.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n
  );

  return { min: rounded(mean - 5 * sd,1), max: rounded(mean + 5 * sd,1) };
};
