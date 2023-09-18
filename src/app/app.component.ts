import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MqttService } from 'ngx-mqtt';
import { Subject, map } from 'rxjs';
import {
  cKelvinOffset,
  convertToDataRows,
  normaliseWeatherStats,
  rotate,
  rounded,
} from '@common';
import { kChartOptions } from './common/settings';
import { DataRow } from './models/datarow';
import { Mode } from './models/mode';
import {
  LocationsService,
  Reading,
  ReadingsService,
  StatsService,
  SummaryReading,
  SummaryService,
  WeatherStats,
  Location,
  StatSpan,
} from '@openapi';

const k_Hours = 4;
const k_Samples = 360;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  public readings: Reading[] = [];
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
  public location: string = 'dalet';
  public location$: Subject<string> = new Subject<string>();

  public STATSPAN = StatSpan;

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
    private readonly mqttService: MqttService,
    private readonly deviceService: DeviceDetectorService,
    private readonly readingService: ReadingsService,
    private readonly summaryService: SummaryService,
    private readonly statsService: StatsService,
    private readonly locationService: LocationsService
  ) {}

  // init
  public ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    
  }

  public ngAfterViewInit(): void {
    this.location$.next(this.location);
    this.init();  
  }

  public init(location: string | undefined = undefined) {
    this._sensorReadings['temperature'] = [];
    this._sensorReadings['pressure'] = [];
    this._sensorReadings['humidity'] = [];

    if (location) {
      this.location = location;
    } else {
      this.setLocations();
    }

    // this.setupReadings();
    // this.setupReadingListener();
    // this.setHourlySummaries();
    // this.setDailySummaries();
    // this.set24hrStats(this.mode);
    // this.set3MonthStats(this.mode);
    // this.setAllStats(this.mode);
    this.location$.next(this.location);
    
  }

  public handleClick(mode: Mode): void {
    this.mode = mode;
  }

  private setupReadings(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - k_Hours);
    this.readingService
      .getReadings(this.location, startDate.valueOf(), new Date().valueOf())
      .pipe(map((data) => data.sort((a, b) => a.ts - b.ts)))
      .subscribe((data) => {
        this._datarows = convertToDataRows(data, this.location, '5min');
        const lastReading = data[data.length - 1];
        if (lastReading) {
          this.temperature = rounded(
            lastReading.temperature - cKelvinOffset,
            1
          );
          this.pressure = rounded(lastReading.pressure / 100, 0);
          this.humidity = lastReading.humidity;
          this._sensorReadings = buildSamples(data, k_Samples);
          this.setRange();
          this.readings = data;
        }

        this.isReady = true;
      });

    this.setAllSummary();

    
  }

  private setAllSummary(): void {
    const start = 1;
    const end = new Date().valueOf();
    this.summaryService.getTotalSummary(this.location).subscribe((data) => {
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

  

  private setHourlySummaries(): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 48);

    this.summaryService
      .getHourlySummary(
        this.location,
        startDate.valueOf(),
        new Date().valueOf()
      )
      .subscribe((summaryReadings) => {
        this._hourlyDatarows = convertToDataRows(
          summaryReadings.data,
          this.location,
          'hour'
        );
      });
  }

  private setDailySummaries(): void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);

    this.summaryService
      .getDailySummary(this.location, startDate.valueOf(), new Date().valueOf())
      .subscribe((summaryReadings) => {
        this._dailyDatarows = convertToDataRows(
          summaryReadings.data,
          this.location,
          'day'
        );
      });
  }

  private set24hrStats(type: string): void {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    this.statsService
      .getAllStatsDateRange(
        this.location,
        startDate.valueOf(),
        new Date().valueOf()
      )
      .subscribe((data) => {
        this._stats24Hr = normaliseWeatherStats(data);
      });
  }

  private set3MonthStats(type: string): void {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    this.statsService
      .getAllStatsDateRange(
        this.location,
        startDate.valueOf(),
        new Date().valueOf()
      )
      .subscribe((data) => {
        this._stats3Month = normaliseWeatherStats(data);
      });
  }

  private setAllStats(type: string): void {
    const now = new Date().valueOf();
    this.statsService
      .getAllStatsDateRange(this.location, 1, now.valueOf())
      .subscribe((data) => {
        this._statsAll = normaliseWeatherStats(data);
      });
  }

  private setLocations(): void {
    this.locationService.getLocations().subscribe((locations) => {
      this.locations = locations;
    });
  }
}



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
