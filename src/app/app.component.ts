import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
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

  public locations: Location[] = [];
  public location: string = 'dalet';

  public STATSPAN = StatSpan;

  public range: { min: number; max: number } = { min: -40, max: 40 };



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

  public init() {
    this.locationService.getLocations().subscribe((locations) => {
      this.locations = locations;
      if (locations && locations.length > 0) {
        this.globalService.location = locations[1].name;
      }
    });
  }
}



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
