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
  unsubscribeAll,
} from '@common';
import { Mode } from '@models';
import { Reading } from '@openapi';
import { ListenersService } from '@services';
import { Subject, Subscription, concatMap, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';

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

  public trend: Record<Mode, Record<string, number | undefined | null>> = {
    temperature: {},
    humidity: {},
    pressure: {},
  };

  private _subscriptions: Record<string, Subscription> = {};
  private destroy: Subject<void> = new Subject<void>();

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
      this._subscriptions[mode as Mode] = this.listenService
        .sample(location, mode)
        .subscribe((value) => {
          this.sample[mode as Mode][location] = convertValue(mode, value);
        });
      this.listenService.trend(location).subscribe(data => {
        this.trend[mode][location] = data[mode];
      })
    });
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  public handleClick(mode: Mode): void {
    this.globalService.mode = mode;
  }
}


