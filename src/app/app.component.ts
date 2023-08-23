import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MqttService } from 'ngx-mqtt';
import { map } from 'rxjs';
import {
  cKelvinOffset,
  convertDate,
  convertTime,
  normaliseWeatherStats,
  rounded,
  trendline,
} from './common/common';
import { kChartOptions } from './common/settings';
import { DataRow } from './models/datarow';
import { LocationReading } from './models/locationreading';
import { Mode, Modes } from './models/mode';
import { Reading } from './models/reading';
import { ReadingDisplay } from './models/readingdisplay';
import { ReadingType } from './models/readingtype';
import { SummaryReading } from './models/stats/SummaryReading';
import { WeatherStats } from './models/stats/weatherstats';
import { ApiService } from './services/api.service';
import { Location } from './models/location';

const k_Hours = 4;
const k_Samples = 360;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public readings: ReadingDisplay[] = [];
  public allSummary: SummaryReading = {} as SummaryReading;
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

  public locations: Location[] = [];
  public location: string = 'gimel';

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

  private _hourlyDatarows: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  public get HourlyDataRows(): Record<Mode, DataRow[]> {
    return this._hourlyDatarows;
  }

  private _dailyDatarows: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  public get DailyDataRows(): Record<Mode, DataRow[]> {
    return this._dailyDatarows;
  }

  private _stats24Hr: WeatherStats = {} as WeatherStats;
  public get Stats24Hr(): WeatherStats {
    return this._stats24Hr;
  }

  private _stats3Month: WeatherStats = {} as WeatherStats;
  public get Stats3Month(): WeatherStats {
    return this._stats3Month;
  }

  private _statsAll: WeatherStats = {} as WeatherStats;
  public get StatsAll(): WeatherStats {
    return this._statsAll;
  }

  public isReady: boolean = false;

  public value = 0;
  constructor(
    private readonly apiService: ApiService,
    private readonly mqttService: MqttService,
    private readonly deviceService: DeviceDetectorService
  ) {

  }

  // init
  public ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.init();
  }


  public init(location: string | undefined = undefined) {
    if (location) {
      this.location = location;
    }
    this.setupReadings();
    this.setupReadingListener();
    this.setHourlySummaries();
    this.setDailySummaries();
    this.set24hrStats(this.mode);
    this.set3MonthStats(this.mode);
    this.setAllStats(this.mode);
    this.setLocations();
  }

  public handleClick(mode: Mode): void {
    this.mode = mode;
  }

  private setupReadings(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - k_Hours);
    this.apiService
      .getReadings(this.location, startDate, new Date())
      .pipe(
        map((data) => data.sort((a, b) => a.ts - b.ts)),
        map((data) =>
          data.map((item) => {
            return {
              ...item,
              ts: Number(item.ts),
              when: new Date(Number(item.ts)),
            } as ReadingDisplay;
          })
        )
      )
      .subscribe((data) => {
        this._datarows = convertToDataRows(data,this.location, '5min');
        const lastReading = data[data.length - 1];
        if (lastReading) {
          this.temperature = rounded(lastReading.temperature - cKelvinOffset, 1);
          this.pressure = rounded(lastReading.pressure / 100, 0);
          this.humidity = lastReading.humidity;
          this._sensorReadings = buildSamples(data, k_Samples);
          this.setRange();
          this.readings = data;
        }
        
        this.isReady = true;
      });

    this.setAllSummary();

    this.mqttService
      .observe(`+/sensor/all`)
      .pipe(
        map((iqttMessage) => {
          const location = iqttMessage.topic.split('/')[0];
          const reading = JSON.parse(iqttMessage.payload.toString()) as LocationReading;
          reading.location = location;
          return reading;
        })
      )
      .subscribe((reading) => {
        if (!this.readings.find((f) => f.id === reading.id)) {
          const when = new Date(reading.ts);
          this.readings.push({
            ...reading,
            when: when
          });

          this.readings.sort((a, b) => a.ts - b.ts);
          const start = new Date();
          start.setHours(start.getHours() - k_Hours);
          this.readings = this.readings.filter((o) => o.ts >= start.valueOf());
          this._datarows = convertToDataRows(this.readings, this.location, '5min');
          this.setRange();
        }

        this.setAllSummary();
        this.setHourlySummaries();
        this.setDailySummaries();

        this.set24hrStats(this.mode);
        this.set3MonthStats(this.mode);
        this.setAllStats(this.mode);
        this.setLocations();
      });
  }

  private setupReadings_old(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - k_Hours);
    this.apiService
      .getReadings(this.location, startDate, new Date())
      .pipe(
        map((data) => data.sort((a, b) => a.ts - b.ts)),
        map((data) =>
          data.map((item) => {
            return {
              ...item,
              ts: Number(item.ts),
              when: new Date(Number(item.ts)),
            } as ReadingDisplay;
          })
        )
      )
      .subscribe((data) => {
        this._datarows = convertToDataRows(data,this.location, '5min');
        const lastReading = data[data.length - 1];
        this.temperature = rounded(lastReading.temperature - cKelvinOffset, 1);
        this.pressure = rounded(lastReading.pressure / 100, 0);
        this.humidity = rounded(lastReading.humidity, 0);
        this._sensorReadings = buildSamples(data, k_Samples);
        this.setRange();
        this.readings = data;
        this.isReady = true;
      });

    this.setAllSummary();

    this.mqttService
      .observe(`${this.location}/sensor/all`)
      .pipe(
        map((iqttMessage) => {
          return JSON.parse(iqttMessage.payload.toString()) as LocationReading;
        })
      )
      .subscribe((reading) => {
        if (!this.readings.find((f) => f.id === reading.id)) {
          const when = new Date(reading.ts);
          this.readings.push({
            ...reading,
            when: when,
            location: this.location,
          });

          this.readings.sort((a, b) => a.ts - b.ts);
          const start = new Date();
          start.setHours(start.getHours() - k_Hours);
          this.readings = this.readings.filter((o) => o.ts >= start.valueOf());
          this._datarows = convertToDataRows(this.readings, this.location, '5min');
          this.setRange();
        }

        this.setAllSummary();
        this.setHourlySummaries();
        this.setDailySummaries();

        this.set24hrStats(this.mode);
        this.set3MonthStats(this.mode);
        this.setAllStats(this.mode);
        this.setLocations();
      });
  }

  private setAllSummary(): void {
    this.apiService.getSummary(this.location).subscribe((data) => {
      data.temperature.max = rounded(data.temperature.max - cKelvinOffset, 1);
      data.temperature.min = rounded(data.temperature.min - cKelvinOffset, 1);
      data.temperature.mean = rounded(data.temperature.mean - cKelvinOffset, 1);

      data.pressure.max = rounded(data.pressure.max / 100, 0);
      data.pressure.min = rounded(data.pressure.min / 100, 0);
      data.pressure.mean = rounded(data.pressure.mean / 100, 0);

      data.humidity.max = rounded(data.humidity.max, 0);
      data.humidity.min = rounded(data.humidity.min, 0);
      data.humidity.mean = rounded(data.humidity.mean, 0);
      this.allSummary = data;
    });
  }

  private setRange(): void {
    const range: Record<Mode, { min: number; max: number }> = {
      temperature: getRange(
        this._datarows['temperature'].map((x) => x.value),
        5
      ),
      pressure: getRange(
        this._datarows['pressure'].map((x) => x.value),
        50
      ),
      humidity: { min: 0, max: 100 },
    };
    this.chartOptions['temperature'].min = range['temperature'].min;
    this.chartOptions['temperature'].max = range['temperature'].max;
    this.chartOptions['pressure'].min = range['pressure'].min;
    this.chartOptions['pressure'].max = range['pressure'].max;
    this.chartOptions['humidity'].min = range['humidity'].min;
    this.chartOptions['humidity'].max = range['humidity'].max;
  }

  private setupReadingListener() {
    this.mqttService
      .observe(`${this.location}/sensor/#`)
      .subscribe((mqttMessage) => {
        const readingType = mqttMessage.topic.replace(
          `${this.location}/sensor/`,
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
            this.pressure = rounded(value / 100, 0);
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
              0
            );
            this.humidity = rounded(value, 0);
            return;
        }
      });
  }

  private setHourlySummaries(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 48);

    this.apiService
      .getHourly(this.location, startDate, new Date())
      .subscribe((summaryReadings) => {
        this._hourlyDatarows = convertToDataRows(summaryReadings,this.location, 'hour');
      });
  }

  private setDailySummaries(): void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);

    this.apiService
      .getDaily(this.location, startDate, new Date())
      .subscribe((summaryReadings) => {
        this._dailyDatarows = convertToDataRows(summaryReadings, this.location, 'day');
      });
  }

  private set24hrStats(type: string): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    this.apiService.getStats(this.location, startDate, new Date()).subscribe(data => {
      this._stats24Hr = normaliseWeatherStats(data);
    });
  }

  private set3MonthStats(type: string): void {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    this.apiService.getStats(this.location, startDate, new Date()).subscribe(data => {
      this._stats3Month = normaliseWeatherStats(data);
    });
  }

  private setAllStats(type: string): void {
    this.apiService.getAllStats(this.location).subscribe(data => {
      this._statsAll = normaliseWeatherStats(data);
    });
  }

  private setLocations(): void {
    this.apiService.getLocations().subscribe(locations => {
      this.locations = locations;
    });
  }
}

const rotate = (
  values: number[],
  value: number,
  limit: number = 30
): number[] => {
  values ??= [];
  values.push(value);
  if (values.length > limit) {
    values.splice(0, 1);
  }
  //console.info(values);
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

const convertValue = (mode: Mode, value: number): number => {
  switch (mode) {
    case 'humidity':
      return value;
    case 'pressure':
      return rounded(value / 100, 0);
    case 'temperature':
      return value !== 0 ? rounded(value - cKelvinOffset, 1) : 0;
  }
};

const getRange = (
  values: number[],
  multiplier: number = 5
): { min: number; max: number } => {
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    min: Math.floor(min / multiplier) * multiplier,
    max: Math.ceil(max / multiplier) * multiplier,
  };
};

const convertToDataRows = (
  data: ReadingDisplay[] | SummaryReading[],
  location:string,
  summaryType: SummaryType
): Record<Mode, DataRow[]> => {
  const result: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  const items = summaryType === '5min' ? (data as ReadingDisplay[]).filter(item => item.location === location) : data;

  Modes.forEach((s) => {
    const mode = s as Mode;
    const values = items
      .map((item:any) => {
      switch (summaryType) {
        case '5min':
          return {
            when: convertTime((item as Reading).ts),
            value: convertValue(mode, (item as any)[mode]),
          };
        case 'hour':
          return {
            when: convertTime((item as any).ts),
            value: [
              convertValue(mode, (item as any)[mode].max),
              convertValue(mode, (item as any)[mode].mean),
              convertValue(mode, (item as any)[mode].min),
            ],
          };
        case 'day':
          return {
            when: convertDate((item as any).ts),
            value: [
              convertValue(mode, (item as any)[mode].max),
              convertValue(mode, (item as any)[mode].mean),
              convertValue(mode, (item as any)[mode].min),
            ],
          };
      }
    });
    result[mode] = values;
  });

  return result;
};

type SummaryType = '5min' | 'hour' | 'day';
