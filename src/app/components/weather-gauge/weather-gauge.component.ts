import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-weather-gauge',
  templateUrl: './weather-gauge.component.html',
  styleUrls: ['./weather-gauge.component.scss'],
})
export class WeatherGaugeComponent implements OnInit {
  constructor() { }

  @ViewChild('gauge', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;

  @Input()
  public min: number = 0;

  @Input()
  public max: number = 100;

  @Input()
  public value: number = 0;

  @Input()
  public units: string = 'C';

  private ctx: CanvasRenderingContext2D | undefined | null;

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d');
    // annulus(this.ctx!, 0, 0, 100, 200, 0, 180, false);
    annulus(this.ctx!, 100, 100, 100, 180, 0, false);
    this.ctx!.strokeStyle = "#FF0000"
    this.ctx?.stroke();
  }
}


const annulus = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number,
  width: number,
  startAngle: number, endAngle: number,
  anticlockwise: boolean) => {

  ctx.lineWidth = width * 0.2;
  let r = width * 0.65;

  var th1 = startAngle * Math.PI / 180;
  var th2 = endAngle * Math.PI / 180;


  ctx.arc(centerX, centerY, r, th1, th2, false);

};
