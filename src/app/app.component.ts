import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { rotate, rounded } from '@common';
import { DataRow } from './models/datarow';
import { Mode } from './models/mode';
import {
  LocationsService,
  Reading,
  SummaryReading,
  WeatherStats,
  Location,
  StatSpan,
} from '@openapi';
import { GlobalService } from './services/global.service';

const k_Samples = 360;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  public readings: Reading[] = [];
  public allSummary: SummaryReading = {} as SummaryReading;
  public mode: Mode = Mode.temperature;

  public rounded = rounded;

  public temperature: number = 0;
  public pressure: number = 0;
  public humidity: number = 0;

  public trendTemperature: number = 0;
  public trendPressure: number = 0;
  public trendHumidity: number = 0;

  public isMobile: boolean = false;
  // public chartOptions = kChartOptions;

  // public colors: string[] = ['red'];
  // public columns: string[] = ['Time', 'Temperature'];

  public locations: Location[] = [];
  public location: string = 'dalet';

  public STATSPAN = StatSpan;

  // private _sensorReadings: Record<string, number[]> = {};
  // public get sensorReadings(): Record<string, number[]> {
  //   return this._sensorReadings;
  // }

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
    private readonly deviceService: DeviceDetectorService,
    private readonly locationService: LocationsService,
    private readonly globalService: GlobalService
  ) {}

  // init
  public ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
  }

  public ngAfterViewInit(): void {
    
    this.init();
  }

  public init(location: string | undefined = undefined) {
    this.locationService.getLocations().subscribe((locations) => {
      this.locations = locations;
      if (locations && locations.length > 0) {
        this.globalService.location = locations[0].name;
      }
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
