import { Component, Input, OnInit } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { Observable, Subject, Subscription, concatMap, map, of } from 'rxjs';
import { kChartOptions } from 'src/app/common/settings';
import { DataRow } from 'src/app/models/datarow';
import { Mode } from 'src/app/models/mode';
import { Reading, ReadingsService } from 'src/app/openapi';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  private _location = '';
  private _mode = '';

  private getDetails$:Subscription | undefined;

  public get mode():string {
    return this._mode;
  }

  public DetailDataRows:Record<string,DataRow[]> = {
    temperature:[],
    pressure:[],
    humidity:[]
  }

  private _readings:Reading[] = [];

  @Input()
  public locations$:Subject<string> = new Subject<string>();

  @Input() 
  mode$:Subject<string> = new Subject<string>();

  public chartOptions = kChartOptions;

  constructor(private readonly readingService:ReadingsService, private readonly mqttService:MqttService) { }

  ngOnInit(): void {
    this.init();
  }

  private init():void {
    this.locations$.pipe(
      concatMap(location => {
        this._location = location;
        return this.getDetails(location, true);
      }))
      .subscribe(this.setDetailDataRows);

    this.getDetails$ = this.getDetails(this._location,false)
      .subscribe(this.setDetailDataRows);
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

  private setDetailDataRows(readings:Reading[]):void {
    this.DetailDataRows['temperature'] = readings.map(reading => <DataRow>{ when : reading.when, value:reading.temperature});
    this.DetailDataRows['pressure'] = readings.map(reading => <DataRow>{ when : reading.when, value:reading.pressure});
    this.DetailDataRows['humidity'] = readings.map(reading => <DataRow>{ when : reading.when, value:reading.humidity});
  }

}
