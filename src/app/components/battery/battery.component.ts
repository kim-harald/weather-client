import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMqttMessage, MqttConnectionState, MqttService } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { ISmartUPSStatus } from 'src/app/models/ISmartUPSStatus';
import { StorageService } from 'src/app/services/storage.service';

const BATTERY_TOPIC = 'battery';

@Component({
  selector: 'app-battery',
  templateUrl: './battery.component.html',
  styleUrls: ['./battery.component.scss']
})
export class BatteryComponent implements OnInit, OnDestroy {

  private _status: ISmartUPSStatus;
  private _isOnline = false;
  private _watchdog = 3;
  private _mqttStatus?:MqttConnectionState
  private _subscription?: Subscription;

  public get status(): ISmartUPSStatus {
    return this._status;
  }

  public get isOnline(): boolean {
    return this._isOnline;
  }

  @Input()
  public device: string = '';

  constructor(private readonly mqttService: MqttService, private readonly storageService:StorageService) {
    this._status = {
      percentage:0,
      status:[],
      ts: new Date().valueOf(),
      voltage:0
    };
  }
  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  public get BatteryPercentage(): number {
    return this._status.percentage
  }

  ngOnInit(): void {
    const topic = `${this.device}/${BATTERY_TOPIC}`;
    this.subscribeToTopic(topic);
    this._status = this.storageService.get(topic);
    this.setWatchdog();
    this.mqttService.state.subscribe(state => {
      this._mqttStatus = state;
    });
  }

  private subscribeToTopic(topic:string) {
    this._subscription = this.mqttService.observe(topic).subscribe({
      next: (data: IMqttMessage) => {
        this._status = JSON.parse(data.payload.toString());
        this.storageService.set(topic,this._status);
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public getColor(batteryLevel: number): string {
    switch (true) {
      case (batteryLevel >= 75):
        return 'green';
      case (batteryLevel >= 50):
        return 'orange';
      case (batteryLevel >= 25):
        return 'yellow';
      case (batteryLevel >= 0):
        return 'red';
      default: return '';
    }
  }
  
  public charging() {
    return (this._status?.status[2]) ? 'charging' : '';
  }

  private setWatchdog():void {
    setInterval(()=> {
      const t = this._status.ts - new Date().valueOf() + 20000;
      // console.info(`ts:${this._status.ts},t:${t}`);
      // console.info(`x:${this._mqttStatus}`);
      if (t < 0) {
        this._watchdog -= 1;
      } else {
        this._watchdog = 3;
      }
      
    this._isOnline = this._watchdog > 0;
    },10000);
  }

}
