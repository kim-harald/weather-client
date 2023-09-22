import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { DetectorService } from './services/detector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  public readings: Reading[] = [];
  public allSummary: SummaryReading = {} as SummaryReading;
  public mode: Mode = Mode.temperature;

  public isMobile: boolean = false;

  public locations: Location[] = [];
  public location: string = 'dalet';

  public STATSPAN = StatSpan;

  public range: { min: number; max: number } = { min: -40, max: 40 };

  public isReady: boolean = false;

  public value = 0;
  constructor(
    // private readonly deviceService: DeviceDetectorService,
    private readonly locationService: LocationsService,
    private readonly globalService: GlobalService,
    detectorService: DetectorService
  ) {
    this.isMobile = detectorService.isMobile;
  }

  // init
  public ngOnInit(): void {
    
  }

  public ngAfterViewInit(): void {
    this.init();
  }

  public init() {
    this.globalService.locations$.subscribe((locations) => {
      this.locations = locations;
      if (locations && locations.length > 0) {
        this.globalService.location = locations[1].name;
      }
    });
  }
}
