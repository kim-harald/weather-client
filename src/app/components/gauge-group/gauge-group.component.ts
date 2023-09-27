import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { convertValue, rotate, rounded, trendline, unsubscribeAll } from '@common';
import { Mode } from '@models';
import { Reading } from '@openapi';
import { ListenersService } from '@services';
import { Subject, Subscription, concatMap, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';

const k_Samples = 6 * 10;

@Component({
  selector: 'app-gauge-group',
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

  public trend: Record<Mode, Record<string, number>> = {
    temperature: {},
    humidity: {},
    pressure: {},
  };

  private _subscriptions: Record<string, Subscription> = {};
  private destroy: Subject<void> = new Subject<void>();

  private samples: Record<Mode, Record<string, { value: number, ts: number }[]>> = {
    temperature: {},
    humidity: {},
    pressure: {},
  }

  private now = new Date().valueOf();

  @Output()
  public modeChanged: EventEmitter<Mode> = new EventEmitter<Mode>();

  constructor(
    public readonly globalService: GlobalService,
    private readonly listenService: ListenersService,
  ) { }

  ngOnInit(): void {
    this.globalService.location$.subscribe({
      next: location => this.setup(location),
      error: err => console.error(err)
    })
  }

  private setup(location: string): void {
    Object.keys(Mode).forEach(item => {
      const mode = item as Mode;
      this.globalService.readings$.pipe(
        takeUntil(this.destroy),
        concatMap((readings => {
          Object.keys(readings).forEach(location => {
            const samples = buildSamples(readings[location],120);
            this.samples[mode][location] = samples[mode]
          });
          return this.listenService.sample(location, mode);
        })
        )
      )
        .subscribe((value) => {
          this.sample[mode as Mode][location] = convertValue(mode, value);
          const sample = { value, ts: new Date().valueOf() };
          rotate(this.samples[mode][location], sample, k_Samples);
          const points = this.samples[mode][location].map(s => {
            const ts = (s.ts - this.now) / 1000;
            return { x: s.value, y: ts };
          })
          this.trend[mode][location] = trendline(points).a;
        });
    });
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  public handleClick(mode: Mode): void {
    this.globalService.mode = mode;
  }

}

/**
 * Computes seed samples from reading array
 * @param readings Readings array
 * @param n Number of total samples (120)
 * @returns Array of samples
 */
const buildSamples = (
  readings: Reading[],
  n: number
): Record<Mode, { value: number, ts: number }[]> => {
  const result: Record<Mode, { value: number, ts: number }[]> = {
    [Mode.temperature]: [],
    [Mode.pressure]: [],
    [Mode.humidity]: [],

  };

  const startTs = rounded(readings[0].ts / 1000,0);
  const samples = rounded(n / readings.length, 0);

  readings.forEach((reading) => {
    for (let i = 0; i < samples; i++) {
      result['temperature'] = rotate(
        result['temperature'],
        {ts: (reading.ts/1000 - startTs), value:reading.temperature},
        k_Samples
      );
      result['pressure'] = rotate(
        result['pressure'],
        {ts: (reading.ts/1000 - startTs), value:reading.pressure},
        k_Samples
      );
      result['humidity'] = rotate(
        result['humidity'],
        {ts: (reading.ts/1000 - startTs), value:reading.humidity},
        k_Samples
      );
    }
  });

  return result;
};

