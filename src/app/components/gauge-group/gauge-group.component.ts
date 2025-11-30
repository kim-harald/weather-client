import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  convertValue,
  rotate,
  rounded,
} from '@common';
import { Mode } from '@models';
import { Reading } from '@openapi';
import { ListenersService } from '@services';
import { Subject, Subscription, concatMap, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { WeatherGaugeComponent } from '../weather-gauge/weather-gauge.component';

@Component({
  selector: 'app-gauge-group',
  standalone: true,
  imports: [CommonModule, WeatherGaugeComponent],
  templateUrl: './gauge-group.component.html',
  styleUrls: ['./gauge-group.component.scss'],
})
export class GaugeGroupComponent implements OnInit, OnDestroy {
  public MODE = Mode;

  public sample: Record<Mode, Record<string, number>> = {
    temperature: {},
    humidity: {},
    pressure: {},
  };

  public trend: Record<Mode, Record<string, number | undefined | null>> = {
    temperature: {},
    humidity: {},
    pressure: {},
  };

  private readonly destroy$ = new Subject<void>();

  private samples: Record<
    Mode,
    Record<string, { value: number; ts: number }[]>
  > = {
      temperature: {},
      humidity: {},
      pressure: {},
    };

  private now = new Date().valueOf();

  @Output()
  public modeChanged: EventEmitter<Mode> = new EventEmitter<Mode>();

  constructor(
    public readonly globalService: GlobalService,
    private readonly listenService: ListenersService
  ) { }

  ngOnInit(): void {
    this.globalService.location$.subscribe({
      next: (location) => this.setup(location),
      error: (err) => console.error(err),
    });
  }

  private setup(location: string): void {
    Object.keys(Mode).forEach((item) => {
      const mode = item as Mode;
      this.samples[mode][location] = [];
      
      this.listenService
        .sample(location, mode)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.sample[mode as Mode][location] = convertValue(mode, value);
        });
    });

    this.listenService
      .trend(location)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        Object.keys(Mode).forEach((item) => {
          const mode = item as Mode;
          this.trend[mode][location] = data[mode];
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public handleClick(mode: Mode): void {
    this.globalService.mode = mode;
  }
}


