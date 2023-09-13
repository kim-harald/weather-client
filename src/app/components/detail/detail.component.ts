import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import { convertToDataRows, unsubscribeAll } from 'src/app/common/common';
import { kChartOptions } from 'src/app/common/settings';
import { DataRow } from 'src/app/models/datarow';
import { Mode } from 'src/app/models/mode';
import { Reading, ReadingsService } from 'src/app/openapi';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit {

  private _location = 'dalet';
  private _subscriptions: Record<string,Subscription> = {};

  public DetailDataRows: Record<Mode, DataRow[]> = {
    temperature: [],
    pressure: [],
    humidity: []
  }

  private _readings: Reading[] = [];

  @Input()
  public locations$: Subject<string> = new Subject<string>();

  @Input()
  public mode: string = 'temperature';

  @Input()
  public span: number = 120;

  public chartOptions = kChartOptions;

  constructor(private readonly readingService: ReadingsService, private readonly mqttService: MqttService) { }

  ngOnInit(): void {
    //this.init();
  }

  ngAfterViewInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    unsubscribeAll(this._subscriptions);
  }

  private init(): void {
    this._subscriptions['location'] = (this.locations$
      .subscribe(location => this.setup(location))
      );
  }

  private setup(location: string): void {
    this._subscriptions[location] = 
      this.getDetails(location)
        .subscribe(readings => this.DetailDataRows = convertToDataRows(readings, location, '5min'));

    this._subscriptions[`${location}-mqtt`] = this.mqttService.observe(`${this._location}/sensor/all`).pipe(
      concatMap(() => this.getDetails(this._location)))
      .subscribe(readings => this.DetailDataRows = convertToDataRows(readings, location, '5min'));
  }

  private getDetails(location: string): Observable<Reading[]> {
    const now = new Date();
    const end = now.valueOf();
    now.setMinutes(now.getMinutes() - this.span);
    const start = now.valueOf();
    return this.readingService.getReadings(location, start, end);
  }
}

