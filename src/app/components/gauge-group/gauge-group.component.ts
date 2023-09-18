import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { convertValue, rotate, trendline, unsubscribeAll } from '@common';
import { Mode } from '@models';
import { LocationsService } from '@openapi';
import { ListenersService } from '@services';
import { Subscription, concatMap, tap } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';

const kSamples = 6*10;

@Component({
  selector: 'app-gauge-group',
  templateUrl: './gauge-group.component.html',
  styleUrls: ['./gauge-group.component.scss'],
})
export class GaugeGroupComponent implements OnInit, OnDestroy {
  public MODE = Mode;

  public sample: Record<Mode, number> = {
    temperature: 0,
    humidity: 0,
    pressure: 0,
  };

  public trend: Record<Mode, number> = {
    temperature: 0,
    humidity: 0,
    pressure: 0,
  };

  private _subscriptions: Record<string, Subscription> = {};

  private samples:Record<Mode, {value:number,ts:number}[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  }

  private now = new Date().valueOf();

  @Output()
  public modeChanged: EventEmitter<Mode> = new EventEmitter<Mode>();

  constructor(
    public readonly globalService: GlobalService,
    private readonly listenService: ListenersService,
  ) {}

  ngOnInit(): void {
    this.globalService.location$.subscribe({
      next: location =>this.setup(location),
      error: err => console.error(err)
    })
  }

  private setup(location:string):void {
    Object.keys(Mode).forEach(item => {
      const mode = item as Mode;
      this._subscriptions[mode as Mode] = this.listenService.sample(location, mode)
        .subscribe((value) => {
          this.sample[mode as Mode] = convertValue(mode,value);
          const sample = {value,ts: new Date().valueOf()};
          rotate(this.samples[mode],sample,kSamples);
          const points = this.samples[mode].map(s => {
            const ts = (s.ts - this.now)/ 1000;
            return {x:s.value, y:ts};
          })
          this.trend[mode] = trendline(points).a;
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
