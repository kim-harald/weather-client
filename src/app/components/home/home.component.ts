import { Component, OnInit } from '@angular/core';
import { Mode } from '@models';
import { Location } from '@openapi';
import { GlobalService } from '../../services/global.service';
import { DetectorService } from '../../services/detector.service';
import { BatteryComponent } from '../battery/battery.component';
import { GaugeGroupComponent } from '../gauge-group/gauge-group.component';
import { StatsComponent } from '../stats/stats.component';
import { SelectLocationComponent } from '../select-location/select-location.component';
import { DetailComponent } from '../detail/detail.component';
import { SummaryComponent } from '../summary/summary.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BatteryComponent,
    GaugeGroupComponent,
    StatsComponent,
    SelectLocationComponent,
    DetailComponent,
    SummaryComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public mode: Mode = Mode.temperature;
  public isMobile: boolean = false;
  public locations: Location[] = [];
  public location: string = 'dalet';

  constructor(
    private readonly globalService: GlobalService,
    detectorService: DetectorService
  ) {
    this.isMobile = detectorService.isMobile;
  }

  public ngOnInit(): void {
    this.globalService.locations$.subscribe((locations) => {
      this.locations = locations;
      if (locations && locations.length > 0) {
        this.globalService.location = locations[1].name;
      }
    });
  }
}
