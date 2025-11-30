import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subject, concatMap, map, of, takeUntil } from 'rxjs';
import { SummaryReading, SummaryReadings, SummaryService } from '@openapi';
import { DataRow, Mode, SummaryType } from '@models';
import { convertToDataRows, kChartOptions } from '@common';
import { GlobalService, ListenersService } from '@services';
import { WeatherChartComponent } from '../weather-chart/weather-chart.component';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, WeatherChartComponent],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @Input()
  public span: number = 48;

  @Input()
  public summaryType: SummaryType = 'hour';

  public chartOptions = kChartOptions;

  public DataRows: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  constructor(
    private readonly summaryService: SummaryService,
    private readonly listenersService: ListenersService,
    public readonly globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.globalService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (location) => this.setup(location),
        error: (err) => console.error(err),
      });
  }

  private setup(location: string): void {
    this.getSummary(location, this.summaryType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summaryData) => {
          this.DataRows = convertToDataRows(
            summaryData,
            location,
            this.summaryType
          );
        },
        error: console.error,
      });

    this.listenersService
      .summary()
      .pipe(
        takeUntil(this.destroy$),
        concatMap((summaryLocation) =>
          this.getSummary(summaryLocation, this.summaryType)
        )
      )
      .subscribe({
        next: (summaryData) => {
          this.DataRows = convertToDataRows(
            summaryData,
            location,
            this.summaryType
          );
        },
        error: console.error,
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getSummary(
    location: string,
    summaryType: SummaryType
  ): Observable<SummaryReading[]> {
    const summary$ = (location: string): Observable<SummaryReadings> => {
      switch (summaryType) {
        case 'day': {
          const now = new Date();
          const end = now.valueOf();
          now.setDate(now.getDate() - this.span);
          const start = now.valueOf();
          return this.summaryService.getDailySummary(location, start, end);
        }
        case 'hour': {
          const now = new Date();
          const end = now.valueOf();
          now.setHours(now.getHours() - this.span);
          const start = now.valueOf();
          return this.summaryService.getHourlySummary(location, start, end);
        }
        default:
          throw new Error("this shouldn't happen");
      }
    };

    return summary$(location).pipe(
      map((summaryReading) => summaryReading.data)
    );
  }
}
