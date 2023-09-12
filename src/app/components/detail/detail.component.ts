import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
export class DetailComponent implements OnInit ,OnDestroy {

  private _location = '';
  private _subscriptions:Array<Subscription> = [];

  public DetailDataRows:Record<Mode,DataRow[]> = {
    temperature:[],
    pressure:[],
    humidity:[]
  }

  private _readings:Reading[] = [];

  @Input()
  public locations$:Subject<string> = new Subject<string>();

  @Input() 
  public mode:string = 'temperature';

  public chartOptions = kChartOptions;

  constructor(private readonly readingService:ReadingsService, private readonly mqttService:MqttService) { }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
      unsubscribeAll(this._subscriptions);
  }

  private init():void {
    this._subscriptions.push(this.locations$.pipe(
      concatMap(location => {
        this._location = location;
        return this.getDetails(location, true);
      }))
      .subscribe(readings => this.DetailDataRows = convertToDataRows(readings,this._location,'5min')));

      this._subscriptions.push(this.getDetails(this._location,false)
      .subscribe(readings => this.DetailDataRows = convertToDataRows(readings,this._location,'5min')));
  }

  private getDetails(location:string, isInit = false):Observable<Reading[]> {
    const signal$ = isInit ? of({}) : this.mqttService.observe(`${this._location}/sensor/all`);
    return signal$.pipe(
      concatMap(()=> {
        const now = new Date();
        const end = now.valueOf();
        now.setMinutes(now.getMinutes()-120);
        const start= now.valueOf();
        return this.readingService.getReadings(location, start,end);
      })
    );
  }
}

const getDetailDataRows = (readings:Reading[]):Record<Mode, DataRow[]> => {
  return {
    temperature : readings.map(reading => <DataRow>{ when : reading.when, value:reading.temperature}),
    pressure : readings.map(reading => <DataRow>{ when : reading.when, value:reading.pressure}),
    humidity : readings.map(reading => <DataRow>{ when : reading.when, value:reading.humidity})
  };
}
