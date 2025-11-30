import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMqttMessage, MqttConnectionState, MqttService } from 'ngx-mqtt';
import { Subject, takeUntil } from 'rxjs';
import { ISmartUPSStatus } from 'src/app/models/ISmartUPSStatus';

const BATTERY_TOPIC = 'battery';

@Component({
  selector: 'app-battery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battery.component.html',
  styleUrls: ['./battery.component.scss']
})
export class BatteryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private _status: Record<string, ISmartUPSStatus> = {};
  private _device: string = '';
  private _isOnline = true;
  private _watchdog = 3;
  private _mqttStatus?: MqttConnectionState;
  private _watchdogInterval?: ReturnType<typeof setInterval>;

  public get status(): ISmartUPSStatus {
    const topic = `${this.device}/${BATTERY_TOPIC}`;
      
    return this._status[getTopic(this.device)] ?? { percentage:0,status:[false,false,false],ts:0,voltage:0};
  }

  public get isOnline(): boolean {
    return this._isOnline;
  }

  @Input()
  public set device(v: string) {
    this._device = v;
    this.destroy$.next();
    this.subscribe();
  }

  public get device(): string {
    return this._device;
  }

  constructor(private readonly mqttService: MqttService) {
    this._status[getTopic(this.device)] = {
      percentage: 0,
      status: [],
      ts: new Date().valueOf(),
      voltage: 0
    };
  }

  public subscribe(): void {
    const topic = getTopic(this.device);
    this.subscribeToTopic(topic);
    this.status.ts = new Date().valueOf();
    this.setWatchdog();
    
    this.mqttService.state
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this._mqttStatus = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this._watchdogInterval) {
      clearInterval(this._watchdogInterval);
    }
  }

  public get BatteryPercentage(): number {
    return this.status.percentage
  }

  public get Voltage():number {
    return this.status.voltage;
  }

  ngOnInit(): void {
    this.subscribe();
  }

  private subscribeToTopic(topic: string) {
    this.mqttService
      .observe(topic)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IMqttMessage) => {
          this._status[data.topic] = JSON.parse(data.payload.toString());
        },
        error: err => {
          console.error('MQTT subscription error:', err);
        }
      });
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

  private setWatchdog(): void {
    if (this._watchdogInterval) {
      clearInterval(this._watchdogInterval);
    }

    this._watchdogInterval = setInterval(() => {
      const t = this.status.ts - new Date().valueOf() + 10000;
      if (t < 0) {
        this._watchdog -= 1;
      } else {
        this._watchdog = 3;
      }

      this._isOnline = this._watchdog > 0;
    }, 10000);
  }

}

const getTopic = (device: string) => {
  return `${device}/${BATTERY_TOPIC}`;
};
