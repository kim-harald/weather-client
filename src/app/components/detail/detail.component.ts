import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GlobalService, ListenersService } from '@services';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import {
  kChartOptions,
  convertToDataRows,
  rotate,
  unsubscribeAll,
} from '@common';
import { DataRow } from 'src/app/models/datarow';
import { DateRange, Mode } from '@models';
import { Reading, ReadingsService, Location } from '@openapi';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private _subscriptions: Record<string, Subscription> = {};

  public DetailDataRows: Record<Mode, DataRow[]> = {
    temperature: [],
    pressure: [],
    humidity: [],
  };

  @Input()
  public span: number = 120;

  public chartOptions = kChartOptions;

  constructor(public readonly globalService: GlobalService) {}

  ngOnInit(): void {
    //this.init();
  }

  ngAfterViewInit(): void {
    this.globalService.ready$.subscribe({
      next: () => {
        this.init()
      },
      error: err => {
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private init(): void {
    this._subscriptions['location'] = this.globalService.location$.subscribe(
      (item) => this.setup(item)
    );
  }

  private setup(location: string): void {
    this._subscriptions[location] = this.globalService.readings$[
      location
    ].subscribe((readings) => {
      this.DetailDataRows = convertToDataRows(readings, location, '5min');
    });
  }
}
