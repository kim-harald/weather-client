import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange, StatSpan } from '@models';
import { StatsService, WeatherStats } from '@openapi';
import { GlobalService, ListenersService } from '@services';
import { Subject, concatMap, takeUntil } from 'rxjs';
import { getDateRange, normaliseWeatherStats } from 'src/app/common/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  public weatherStats: WeatherStats = {} as WeatherStats;

  @Input()
  public mode: string = 'temperature';

  @Input()
  public title: string = '';

  @Input()
  public location$: Subject<string> = new Subject<string>();

  @Input()
  public statSpan:StatSpan = 'All';
  public maxTemperatureDate: string = '';
  public minTemperatureDate: string = '';

  public maxPressureDate: string = '';
  public minPressureDate: string = '';

  public maxHumidityDate: string = '';
  public minHumidityDate: string = '';

  constructor(
    private readonly statsService: StatsService,
    private readonly listenersService: ListenersService,
    public readonly globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.location$.pipe(takeUntil(this.destroy$)).subscribe(location => 
      this.setup(location, this.statSpan)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setup(location: string, statsSpan: StatSpan) {
    const dateRange = getDateRange(statsSpan);
    
    this.statsService
      .getAllStatsDateRange(
        location,
        dateRange.start.valueOf(),
        dateRange.end.valueOf()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.weatherStats = normaliseWeatherStats(data);
          this.setDates(data);
        },
        error: console.error,
      });

    this.listenersService
      .stats()
      .pipe(
        takeUntil(this.destroy$),
        concatMap(() => {
          return this.statsService.getAllStatsDateRange(
            location,
            dateRange.start.valueOf(),
            dateRange.end.valueOf()
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.weatherStats = normaliseWeatherStats(data);
          this.setDates(data);
        },
        error: console.error,
      });
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

