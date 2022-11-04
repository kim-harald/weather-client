import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MqttService } from 'ngx-mqtt';
import { map } from 'rxjs';
import { cKelvinOffset, rounded } from 'src/app/common/common';

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

  public value: number = 0;

  @Input()
  public units: string = 'C';

  @Input()
  public color: string = '#FF0000';

  private ctx: CanvasRenderingContext2D | undefined | null;

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d');

    this.mqttService
      .observe('gimel/sensor/temperature')
      .pipe(
        map((mqtMessage) => {
          return Number(mqtMessage.payload.toString());
        })
      )
      .subscribe((kelvin) => {
        const celcius = rounded(kelvin - cKelvinOffset, 1);
        if (this.ctx && celcius !== this.value) {
          this.ctx.clearRect(0, 0, 250, 100);
          this.ctx.beginPath();

          const endAngle =
            180 + ((celcius - this.min) / (this.max - this.min)) * 180;

          annulus(this.ctx, 125, 100, 100, 180, endAngle, false);
          this.ctx.strokeStyle = this.color;
          this.ctx.stroke();

          this.value = celcius;
        }
      });
  }
}

const annulus = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  startAngle: number,
  endAngle: number,
  anticlockwise: boolean
) => {
  ctx.lineWidth = width * 0.2;
  let r = width * 0.65;

  var th1 = (startAngle * Math.PI) / 180;
  var th2 = (endAngle * Math.PI) / 180;

  ctx.arc(centerX, centerY, r, th1, th2, anticlockwise);
};
