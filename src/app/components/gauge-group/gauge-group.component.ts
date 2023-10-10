import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  convertValue,
  rotate,
  rounded,
  trendline,
  unsubscribeAll,
} from '@common';
import { Mode } from '@models';
import { LocationsService, Reading } from '@openapi';
import { ListenersService } from '@services';
import { Subscription, concatMap, tap } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';

const k_Samples = 6 * 5;

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
  ) {}

  ngOnInit(): void {
    this.globalService.readings$.subscribe((readings) => {
        Object.keys(readings).forEach((location) => {
          const samples = buildSamples(location,readings,k_Samples);
          Object.keys(Mode).forEach(key => {
            const mode = key as Mode;
            this.samples[mode][location] = samples[mode];

            const points = this.samples[mode][location].map((s) => {
              const ts = (s.ts - this.now) / 1000;
              return { x: s.value, y: ts };
            });
            this.trend[mode][location] = trendline(points).a;
          })
        });
    });

    this.globalService.location$.subscribe({
      next: (location) => this.setup(location),
      error: (err) => console.error(err),
    });
  }

  private setup(location: string): void {
    Object.keys(Mode).forEach((item) => {
      const mode = item as Mode;
      this.samples[mode][location] = [];
      this._subscriptions[mode as Mode] = this.listenService
        .sample(location, mode)
        .subscribe((value) => {
          this.sample[mode as Mode][location] = convertValue(mode, value);
          const sample = { value, ts: new Date().valueOf() };
          rotate(this.samples[mode][location], sample, k_Samples);
          const points = this.samples[mode][location].map((s) => {
            const ts = (s.ts - this.now) / 1000;
            return { x: s.value, y: ts };
          });
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

const buildSamples = (
  location:string,
  readings: Record<string,Reading[]>,
  n: number
): Record<Mode, { value: number; ts: number }[]> => {
  const result: Record<Mode, { value: number; ts: number }[]> = {
    [Mode.temperature]: [],
    [Mode.pressure]: [],
    [Mode.humidity]: [],
  };

  if (readings[location].length === 0) {
    return result;
  }
  const locationReadings = readings[location];
  
  const incr = rounded((locationReadings[locationReadings.length-1].ts - locationReadings[0].ts) / n,0);
  let ts =locationReadings[0].ts;
    
  locationReadings.forEach((reading) => {
    for (let i = 0; i < n; i++) {
      result['temperature'] = rotate(
        result['temperature'],
        {value: reading.temperature, ts},
        k_Samples
      );
      result['pressure'] = rotate(
        result['pressure'],
        {value: reading.pressure, ts},
        k_Samples
      );
      result['humidity'] = rotate(
        result['humidity'],
        {value: reading.humidity, ts},
        k_Samples
      );

      ts += incr;
    }
  });

  return result;
};
