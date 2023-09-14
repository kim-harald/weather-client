import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateRange } from '@models';
import { StatSpan } from '@models/stats';
import { StatsService, WeatherStats } from '@openapi';
import { ListenersService } from '@services';
import { Subject, Subscription, concatMap } from 'rxjs';
import { getDateRange, normaliseWeatherStats, unsubscribeAll } from 'src/app/common/common';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit, OnDestroy {
  private _subscriptions: Record<string, Subscription> = {};

  public weatherStats: WeatherStats = {} as WeatherStats;

  @Input()
  public mode: string = 'temperature';

  @Input()
  public title: string = '';

  @Input()
  public location$: Subject<string> = new Subject<string>();

  @Input()
  public statSpan: StatSpan = 'All';

  public maxTemperatureDate: string = '';
  public minTemperatureDate: string = '';

  public maxPressureDate: string = '';
  public minPressureDate: string = '';

  public maxHumidityDate: string = '';
  public minHumidityDate: string = '';

  constructor(
    private readonly statsService: StatsService,
    private readonly listenersService: ListenersService
  ) {}

  ngOnInit(): void {
    this.location$.subscribe(location => 
      this.setup(location, this.statSpan));
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private setup(location: string, statsSpan: StatSpan) {
    let dr = getDateRange(statsSpan);
    this._subscriptions['location'] = this.statsService
      .getAllStatsDateRange(location, dr.start.valueOf(), dr.end.valueOf())
      .subscribe({
        next: (data) => {
          this.weatherStats = normaliseWeatherStats(data);
          this.setDates(data);
        },
        error: console.error,
      });
    this._subscriptions['listener'] = this.listenersService
      .stats()
      .pipe(concatMap(() => {
        dr = getDateRange(statsSpan);
        return this.statsService.getAllStatsDateRange(location,dr.start.valueOf(),dr.end.valueOf());
      })).subscribe({
        next: (data) => {
          this.weatherStats = normaliseWeatherStats(data);
          this.setDates(data);
        },
        error: console.error,
      })
  }

  private setDates(weatherstats: WeatherStats): void {
    if (
      weatherstats.temperature &&
      weatherstats.pressure &&
      weatherstats.humidity
    ) {
      this.maxTemperatureDate = new Date(
        weatherstats.temperature.max.ts
      ).toStandard();
      this.minTemperatureDate = new Date(
        weatherstats.temperature.min.ts
      ).toStandard();
      this.maxPressureDate = new Date(
        weatherstats.pressure.max.ts
      ).toStandard();
      this.minPressureDate = new Date(
        weatherstats.pressure.min.ts
      ).toStandard();
      this.maxHumidityDate = new Date(
        weatherstats.humidity.max.ts
      ).toStandard();
      this.minHumidityDate = new Date(
        weatherstats.humidity.min.ts
      ).toStandard();
    }
  }
}
