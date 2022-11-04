import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-weather-gauge',
  templateUrl: './weather-gauge.component.html',
  styleUrls: ['./weather-gauge.component.scss'],
})
export class WeatherGaugeComponent implements OnInit {
  constructor(private readonly mqttService: MqttService) {}

  @ViewChild('gauge', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;

  @Input()
  public min: number = 0;

  @Input()
  public max: number = 100;

  @Input()
  public units: string = 'C';

  @Input()
  public color: string = '#FF0000';

  @Input()
  public get value(): number {
    return this._value;
  }

  public set value(v: number) {
    this.update(v);
  }

  private ctx: CanvasRenderingContext2D | undefined | null;
  private _value: number = 0;

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d');
  }

  private update(v: number): void {
    if (this.ctx && v !== this._value) {
      this.ctx.clearRect(1, 1, 230, 120);
      this.ctx.beginPath();

      const endAngle = 180 + ((v - this.min) / (this.max - this.min)) * 180;

      annulus(this.ctx, 115, 120, 20, 100, 180, endAngle, false);
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.stroke();
      this._value = v;
    }
  }
}

const annulus = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  anticlockwise: boolean
) => {
  ctx.lineWidth = width ; //width;
  let r = width * 0.65;

  var th1 = (startAngle * Math.PI) / 180;
  var th2 = (endAngle * Math.PI) / 180;
  
 ctx.arc(centerX, centerY, radius, th1, th2, anticlockwise);
};
