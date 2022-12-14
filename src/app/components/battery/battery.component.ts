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

  private _status: Record<string,ISmartUPSStatus> = {};
  private _device:string = '';
  private _isOnline = true;
  private _watchdog = 3;
  private _mqttStatus?:MqttConnectionState
  private _subscription?: Subscription;

  public get status(): ISmartUPSStatus {
    const topic = `${this.device}/${BATTERY_TOPIC}`;
      
    return this._status[getTopic(this.device)] ?? { percentage:0,status:[false,false,false],ts:0,voltage:0};
  }

  public get isOnline(): boolean {
    return this._isOnline;
  }

  @Input()
  public set device(v:string) {
    this._device = v;
    this.unsubscribe();
    this.subscribe();
  }

  public get device(): string {
    return this._device;
  }

  constructor(private readonly mqttService: MqttService) {
    this._status[getTopic(this.device)] = {
      percentage:0,
      status:[],
      ts: new Date().valueOf(),
      voltage:0
    };
  }

  private unsubscribe():void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  public subscribe():void {
    const topic = getTopic(this.device);
    this.subscribeToTopic(topic);
    this.status.ts = new Date().valueOf();
    this.setWatchdog();
    this.mqttService.state.subscribe(state => {
      this._mqttStatus = state;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public get BatteryPercentage(): number {
    return this.status.percentage
  }

  ngOnInit(): void {
    this.subscribe();
  }

  private subscribeToTopic(topic:string) {
    this._subscription = this.mqttService.observe(topic).subscribe({
      next: (data: IMqttMessage) => {
        this._status[data.topic] = JSON.parse(data.payload.toString());
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
    return (this.status.status[2]) ? 'charging' : '';
  }

  private setWatchdog():void {
    setInterval(()=> {
      const t = this._status[getTopic(this.device)].ts - new Date().valueOf() + 10000;
      if (t < 0) {
        this._watchdog -= 1;
      } else {
        this._watchdog = 3;
      }
      
    this._isOnline = this._watchdog > 0;
    },10000);
  }

}

const getTopic = (device:string) => {
  return `${device}/${BATTERY_TOPIC}`; 
}
